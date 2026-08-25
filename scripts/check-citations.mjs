#!/usr/bin/env node
/**
 * Verify every citation URL in the evidence base actually resolves.
 *
 * A dead citation is a broken promise. This runs in CI so the knowledge base
 * cannot silently rot into unverifiable claims.
 *
 * Exits non-zero if any citation is unreachable.
 */
import { readFileSync } from 'node:fs';

const src = readFileSync(
  new URL('../packages/core/src/evidence.ts', import.meta.url),
  'utf8',
);

const urls = [...src.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]);
const unique = [...new Set(urls)];

if (unique.length === 0) {
  console.error('FAIL: no citation URLs found — the parser or the file changed shape.');
  process.exit(1);
}

console.log(`Checking ${unique.length} citation URLs...\n`);

let failed = 0;
for (const url of unique) {
  let status = 'ERR';
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': 'x420-citation-check/0.1' },
      signal: AbortSignal.timeout(30_000),
    });
    status = String(res.status);
    if (!res.ok) failed++;
  } catch (err) {
    status = `ERR ${err.message}`;
    failed++;
  }
  console.log(`  ${status.padEnd(24)} ${url}`);
}

console.log();
if (failed > 0) {
  console.error(`FAIL: ${failed}/${unique.length} citation URLs did not resolve.`);
  process.exit(1);
}
console.log(`OK: all ${unique.length} citation URLs resolve.`);
