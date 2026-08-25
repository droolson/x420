/**
 * X420 API — Cloudflare Worker.
 *
 * Free tier (human patients, no payment):
 *   GET /v1/conditions              — evidence-linked condition list
 *   GET /v1/conditions/:id          — one condition with citations + cautions
 *   GET /v1/dispensaries?county=|zip= — Florida MMTC dispensing locations
 *   POST /v1/match                  — evidence-ceilinged product match
 *
 * Metered tier (agents/integrators, x402):
 *   /v1/agent/*  and  /v1/dataset/*  — HTTP 402 until paid
 *
 * Data is cached in KV and refreshed by a scheduled cron against the OMMU
 * public-records page. If the upstream is unavailable we serve the last good
 * snapshot WITH its real retrievedAt timestamp — we never pretend it is fresh.
 */
import {
  CONDITIONS,
  getCondition,
  matchProducts,
  requireDisclosure,
  InsufficientEvidenceError,
  type Product,
} from '@x420/core';
import {
  parseSnapshot,
  byCounty,
  searchByZip,
  OMMU_MMTC_URL,
  type OmmuSnapshot,
} from '@x420/ommu';
import {
  buildPaymentRequired,
  findResource,
  verifyPayment,
  type GatewayConfig,
} from '@x420/x402-gateway';

export interface Env {
  X420_KV: KVNamespace;
  SOLANA_PAY_TO: string;
  BASE_PAY_TO?: string;
  FACILITATOR_URL: string;
  FACILITATOR_API_KEY?: string;
  PUBLIC_BASE_URL: string;
}

const SNAPSHOT_KEY = 'ommu:snapshot:v1';
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,x-payment',
  'access-control-expose-headers': 'x-payment-response',
};

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      ...CORS,
      ...(init.headers ?? {}),
    },
  });
}

function fail(status: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, { status });
}

function gatewayConfig(env: Env): GatewayConfig {
  return {
    solanaPayTo: env.SOLANA_PAY_TO,
    basePayTo: env.BASE_PAY_TO,
    facilitatorUrl: env.FACILITATOR_URL,
    facilitatorApiKey: env.FACILITATOR_API_KEY,
    baseUrl: env.PUBLIC_BASE_URL,
  };
}

async function refreshSnapshot(env: Env): Promise<OmmuSnapshot> {
  const res = await fetch(OMMU_MMTC_URL, {
    headers: {
      'user-agent': 'x420-ommu-ingest/0.1 (+https://x420.org; public-records mirror)',
      accept: 'text/html',
    },
    cf: { cacheTtl: 900, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`OMMU upstream HTTP ${res.status}`);
  const snap = parseSnapshot(await res.text());
  if (snap.locations.length < 100) {
    // Upstream markup probably changed. Refuse to overwrite good data with junk.
    throw new Error(
      `OMMU parse yielded only ${snap.locations.length} locations; refusing to cache a likely-broken snapshot`,
    );
  }
  await env.X420_KV.put(SNAPSHOT_KEY, JSON.stringify(snap));
  return snap;
}

async function getSnapshot(env: Env): Promise<OmmuSnapshot | null> {
  const cached = await env.X420_KV.get(SNAPSHOT_KEY, 'json');
  if (cached) return cached as OmmuSnapshot;
  try {
    return await refreshSnapshot(env);
  } catch {
    return null;
  }
}

/** x402 gate. Returns a 402 Response when unpaid, or null when the caller may proceed. */
async function gate(request: Request, env: Env, path: string): Promise<Response | null> {
  const resource = findResource(path);
  if (!resource) return null;

  const cfg = gatewayConfig(env);
  const required = buildPaymentRequired(resource, cfg);
  const header = request.headers.get('x-payment');

  if (!header) {
    return json(required, { status: 402, headers: { 'cache-control': 'no-store' } });
  }

  const option = required.accepts[0]!;
  const result = await verifyPayment(header, option, cfg);
  if (!result.valid) {
    return json(
      { ...required, error: `Payment verification failed: ${result.reason}` },
      { status: 402, headers: { 'cache-control': 'no-store' } },
    );
  }
  return null;
}

const routes = {
  async conditions(): Promise<Response> {
    return json({
      conditions: CONDITIONS.map((c) => ({
        id: c.id,
        label: c.label,
        tier: c.tier,
        floridaQualifying: c.floridaQualifying,
        supportedOutcome: c.supportedOutcome,
      })),
      disclosure: requireDisclosure(),
    });
  },

  async condition(id: string): Promise<Response> {
    const c = getCondition(id);
    if (!c) return fail(404, `Unknown condition: ${id}`);
    return json({ condition: c, disclosure: requireDisclosure() });
  },

  async dispensaries(url: URL, env: Env): Promise<Response> {
    const snap = await getSnapshot(env);
    if (!snap) {
      return fail(503, 'OMMU data is temporarily unavailable and no cached snapshot exists.');
    }
    const county = url.searchParams.get('county');
    const zip = url.searchParams.get('zip');
    const company = url.searchParams.get('company');
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50) || 50, 500);

    let results = [...snap.locations];
    if (county) {
      const c = county.toLowerCase();
      results = results.filter((l) => l.county.toLowerCase() === c);
    }
    if (zip) results = searchByZip(results, zip);
    if (company) {
      const q = company.toLowerCase();
      results = results.filter((l) => l.company.toLowerCase().includes(q));
    }

    return json({
      source: { url: snap.sourceUrl, retrievedAt: snap.retrievedAt },
      total: results.length,
      counties: [...byCounty(snap.locations).keys()].sort(),
      results: results.slice(0, limit),
      disclosure: requireDisclosure(),
    });
  },

  async match(request: Request): Promise<Response> {
    let body: { conditionId?: string; products?: Product[]; avoidIntoxication?: boolean; maxPriceUsd?: number };
    try {
      body = await request.json();
    } catch {
      return fail(400, 'Body must be JSON.');
    }
    if (!body.conditionId) return fail(400, 'conditionId is required.');
    if (!Array.isArray(body.products)) {
      return fail(400, 'products[] is required. X420 does not invent inventory.');
    }

    try {
      const result = matchProducts(body.products, {
        conditionId: body.conditionId,
        avoidIntoxication: body.avoidIntoxication,
        maxPriceUsd: body.maxPriceUsd,
      });
      return json(result);
    } catch (err) {
      if (err instanceof InsufficientEvidenceError) {
        return json(
          {
            refused: true,
            conditionId: err.conditionId,
            reason: err.message,
            disclosure: requireDisclosure(),
          },
          { status: 422 },
        );
      }
      return fail(400, (err as Error).message);
    }
  },
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    const paywall = await gate(request, env, path);
    if (paywall) return paywall;

    try {
      if (path === '/' || path === '/v1') {
        return json({
          name: 'X420 API',
          version: '0.1.0',
          docs: 'https://github.com/droolson/x420',
          free: ['/v1/conditions', '/v1/conditions/:id', '/v1/dispensaries', 'POST /v1/match'],
          metered: ['/v1/agent/match', '/v1/agent/dispensaries', '/v1/dataset/ommu-snapshot', '/v1/dataset/evidence'],
          disclosure: requireDisclosure(),
        });
      }
      if (path === '/v1/conditions') return routes.conditions();
      if (path.startsWith('/v1/conditions/')) return routes.condition(path.slice('/v1/conditions/'.length));
      if (path === '/v1/dispensaries' || path === '/v1/agent/dispensaries') return routes.dispensaries(url, env);
      if ((path === '/v1/match' || path === '/v1/agent/match') && request.method === 'POST') {
        return routes.match(request);
      }
      if (path === '/v1/dataset/evidence') {
        return json({ conditions: CONDITIONS, disclosure: requireDisclosure() });
      }
      if (path === '/v1/dataset/ommu-snapshot') {
        const snap = await getSnapshot(env);
        if (!snap) return fail(503, 'No snapshot available.');
        return json(snap);
      }
      if (path === '/health') {
        const snap = await getSnapshot(env);
        return json({
          ok: true,
          snapshot: snap
            ? { retrievedAt: snap.retrievedAt, locations: snap.locations.length, mmtcs: snap.mmtcs.length }
            : null,
        });
      }
      return fail(404, `No route for ${path}`);
    } catch (err) {
      return fail(500, `Unhandled: ${(err as Error).message}`);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      refreshSnapshot(env).catch((err) => {
        console.error('OMMU refresh failed, keeping last good snapshot:', err.message);
      }),
    );
  },
};
