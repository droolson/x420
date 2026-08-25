#!/usr/bin/env node
/**
 * Verify every citation URL in the evidence base actually resolves.
 *
 * A dead citation is a broken promise. This runs in CI so the knowledge base
 * cannot silently rot into unverifiable claims.
 *
 * IMPORTANT distinction, learned the hard way: government and publisher sites
 * (FDA accessdata, nationalacademies) frequently WAF-block datacenter IPs like
 * GitHub Actions runners. A 403/429 from a bot-blocker is NOT evidence that a
 * citation is dead — treating it as such would make CI cry wolf until everyone
 * ignores it, which is worse than no check at all.
 *
 * So:
 *   404 / 410            -> HARD FAIL. The citation is genuinely gone.
 *   403 / 429 / timeout  -> WARN. Unverifiable from this network, not dead.
 *   2xx / 3xx            -> PASS.
 *
 * Set STRICT_CITATIONS=1 to fail on warnings too (useful when running locally
 * from a residential IP, where a block genuinely is suspicious).
 */
import { readFileSync } from 'node:fs';

const src = readFileSync(
  new URL('../packages/core/src/evidence.ts', import.meta.url),
  'utf8',
);

const urls = [...src.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]);
const unique = [...new Set(urls)];
const STRICT = process.env.STRICT_CITATIONS === '1';

if (unique.length === 0) {
  console.error('FAIL: no citation URLs found — the parser or the file changed shape.');
  process.exit(1);
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function probe(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*' },
      signal: AbortSignal.timeout(30_000),
    });
    return { status: res.status };
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 2000));
      return probe(url, attempt + 1);
    }
    return { status: 0, error: err.message };
  }
}

console.log(`Checking ${unique.length} citation URLs...\n`);

let dead = 0;
let warned = 0;

for (const url of unique) {
  const { status, error } = await probe(url);
  let verdict;

  if (status >= 200 && status < 400) {
    verdict = `OK ${status}`;
  } else if (status === 404 || status === 410) {
    verdict = `DEAD ${status}`;
    dead++;
  } else if (status === 0) {
    verdict = `UNVERIFIABLE (${error})`;
    warned++;
  } else {
    verdict = `UNVERIFIABLE ${status} (likely bot-block)`;
    warned++;
  }

  console.log(`  ${verdict.padEnd(42)} ${url}`);
}

console.log();

if (dead > 0) {
  console.error(
    `FAIL: ${dead}/${unique.length} citation URL(s) returned 404/410 — those citations are genuinely dead and must be fixed.`,
  );
  process.exit(1);
}

if (warned > 0) {
  const msg = `${warned}/${unique.length} citation URL(s) were unverifiable from this network (bot-block or timeout), not dead.`;
  if (STRICT) {
    console.error(`FAIL (STRICT_CITATIONS=1): ${msg}`);
    process.exit(1);
  }
  console.warn(`WARN: ${msg}`);
  console.warn('Run locally with STRICT_CITATIONS=1 to treat these as failures.');
}

console.log(`OK: no dead citations (${unique.length - warned}/${unique.length} positively verified).`);
