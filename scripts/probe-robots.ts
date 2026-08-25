/**
 * Probe the real robots.txt of every queued research target and record the
 * verdict in Postgres.
 *
 * This runs BEFORE any crawling, ever. Sites that disallow are marked 'blocked'
 * and are never retried. That is the point: the block list is durable state,
 * not a runtime decision we might quietly forget next iteration.
 *
 * Usage: pnpm dlx tsx scripts/probe-robots.ts
 */
import { Client } from 'pg';
import { checkRobots, RateLimiter } from '../packages/research/src/index.js';

const DSN =
  process.env.X420_DATABASE_URL ??
  'postgresql://x420:x420_local_dev_only@127.0.0.1:5433/x420';

async function main() {
  const db = new Client({ connectionString: DSN });
  await db.connect();
  const rl = new RateLimiter(1500);

  const { rows } = await db.query<{ id: string; url: string; dispensary_id: string }>(
    `SELECT id, url, dispensary_id FROM research_targets
     WHERE robots_allowed IS NULL ORDER BY url`,
  );

  console.log(`Probing robots.txt for ${rows.length} targets...\n`);

  let allowed = 0;
  let blocked = 0;

  for (const t of rows) {
    let host = 'unknown';
    try { host = new URL(t.url).host; } catch { /* handled below */ }
    await rl.take(host);

    const v = await checkRobots(t.url);
    const status = v.allowed ? 'pending' : 'blocked';
    if (v.allowed) allowed++; else blocked++;

    await db.query(
      `UPDATE research_targets
       SET robots_allowed = $1, status = $2::crawl_status,
           notes = $3, last_attempt_at = now()
       WHERE id = $4`,
      [v.allowed, status, v.reason, t.id],
    );

    const mark = v.allowed ? 'ALLOW ' : 'BLOCK ';
    console.log(`  ${mark} ${host.padEnd(34)} ${v.reason}`);
  }

  console.log(`\nAllowed: ${allowed}   Blocked: ${blocked}`);
  console.log('Blocked targets will never be crawled. That is intentional.');

  await db.end();
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
