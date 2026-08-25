/**
 * X420 products API — Node/Hono service backed by Postgres.
 *
 * Separate from the Cloudflare Worker on purpose: the Worker serves the
 * evidence KB and the OMMU snapshot from KV (edge-cached, no database), while
 * this service owns the product-intelligence data that needs real SQL.
 *
 * Every product response carries its provenance. A patient (or an agent) can
 * always see whether a potency figure came from a lab COA or from a model
 * reading a web page — and the API will not let those look the same.
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Client, Pool } from 'pg';
import { requireDisclosure } from '@x420/core';

const DSN =
  process.env.X420_DATABASE_URL ??
  'postgresql://x420:x420_local_dev_only@127.0.0.1:5433/x420';

const pool = new Pool({ connectionString: DSN, max: 10 });
const app = new Hono();

app.use('*', cors());

/**
 * Confidence is surfaced, never hidden. This mapping is what the UI renders as
 * a badge; it exists so no consumer can accidentally treat an agent extraction
 * as a verified lab figure.
 */
const PROVENANCE_LABEL: Record<string, string> = {
  official_api: 'Licensed dispensary API',
  licensed_feed: 'Licensed data feed',
  public_record: 'Government public record',
  coa_document: 'Certificate of analysis',
  agent_extraction: 'Automated extraction from a public web page — unverified',
  manual_entry: 'Manually entered',
};

app.get('/health', async (c) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         (SELECT count(*) FROM dispensaries WHERE active)::int AS dispensaries,
         (SELECT count(DISTINCT county) FROM dispensaries WHERE active)::int AS counties,
         (SELECT count(*) FROM products)::int AS products,
         (SELECT count(*) FROM product_observations)::int AS observations,
         (SELECT count(*) FROM research_targets WHERE status = 'blocked')::int AS blocked_targets`,
    );
    return c.json({ ok: true, ...rows[0] });
  } catch (err) {
    return c.json({ ok: false, error: (err as Error).message }, 503);
  }
});

app.get('/v1/dispensaries', async (c) => {
  const county = c.req.query('county');
  const zip = c.req.query('zip');
  const q = c.req.query('q');
  const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 500);

  const where: string[] = ['active = true'];
  const params: unknown[] = [];

  if (county) { params.push(county); where.push(`county ILIKE $${params.length}`); }
  if (zip)    { params.push(`${zip}%`); where.push(`zip LIKE $${params.length}`); }
  if (q)      { params.push(`%${q}%`); where.push(`company ILIKE $${params.length}`); }

  params.push(limit);

  const { rows } = await pool.query(
    `SELECT id, company, address, city, state, zip, county, phone, website,
            license_number, last_seen_at
     FROM dispensaries
     WHERE ${where.join(' AND ')}
     ORDER BY county, city, company
     LIMIT $${params.length}`,
    params,
  );

  return c.json({
    total: rows.length,
    source: {
      kind: 'public_record',
      name: 'Florida OMMU MMTC registry',
      url: 'https://knowthefactsmmj.com/mmtc/',
    },
    results: rows,
    disclosure: requireDisclosure(),
  });
});

app.get('/v1/counties', async (c) => {
  const { rows } = await pool.query(
    `SELECT county, count(*)::int AS locations
     FROM dispensaries WHERE active
     GROUP BY county ORDER BY locations DESC`,
  );
  return c.json({ counties: rows });
});

app.get('/v1/products', async (c) => {
  const county = c.req.query('county');
  const category = c.req.query('category');
  const q = c.req.query('q');
  const minConfidence = c.req.query('min_confidence');
  const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 200);

  const where: string[] = [];
  const params: unknown[] = [];

  if (county)   { params.push(county); where.push(`d.county ILIKE $${params.length}`); }
  if (category) { params.push(category); where.push(`cp.category::text = $${params.length}`); }
  if (q)        { params.push(`%${q}%`); where.push(`cp.product_name ILIKE $${params.length}`); }
  if (minConfidence === 'verified') {
    where.push(`cp.confidence = 'verified'`);
  }

  params.push(limit);

  const { rows } = await pool.query(
    `SELECT cp.*, d.company AS dispensary_company, d.city, d.county
     FROM current_products cp
     LEFT JOIN dispensaries d ON d.id = cp.dispensary_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY cp.observed_at DESC
     LIMIT $${params.length}`,
    params,
  );

  const results = rows.map((r) => ({
    ...r,
    provenance: {
      kind: r.source_kind,
      label: PROVENANCE_LABEL[r.source_kind] ?? r.source_kind,
      source: r.source_name,
      url: r.source_url,
      observed_at: r.observed_at,
      confidence: r.confidence,
    },
  }));

  return c.json({
    total: results.length,
    results,
    // Honest empty-state: an empty list means we have no verified data, not
    // that no products exist. Never let a consumer read silence as absence.
    note:
      results.length === 0
        ? 'No product data available for this query. X420 only serves product data it can attribute to a source; it does not synthesise inventory.'
        : undefined,
    disclosure: requireDisclosure(),
  });
});

app.get('/v1/research/status', async (c) => {
  const { rows } = await pool.query(
    `SELECT status::text, count(*)::int AS n,
            count(*) FILTER (WHERE robots_allowed = false)::int AS robots_blocked
     FROM research_targets GROUP BY status ORDER BY n DESC`,
  );
  const { rows: recent } = await pool.query(
    `SELECT r.url, r.status::text, r.notes, r.last_attempt_at
     FROM research_targets r ORDER BY r.last_attempt_at DESC NULLS LAST LIMIT 20`,
  );
  return c.json({ by_status: rows, recent });
});

app.notFound((c) => c.json({ error: `No route for ${c.req.path}` }, 404));

const port = Number(process.env.PORT ?? 8420);

if (process.env.NODE_ENV !== 'test') {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`X420 products API listening on http://localhost:${info.port}`);
  });
}

export { app, pool };
