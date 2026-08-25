/**
 * Load the Florida OMMU public-records snapshot into Postgres.
 *
 * Idempotent: re-running updates last_seen_at and marks vanished locations
 * inactive rather than deleting them. A dispensary that closes is history, not
 * an error — and a patient who bookmarked it deserves to know it closed rather
 * than have it silently disappear.
 *
 * Usage:
 *   node --experimental-strip-types scripts/load-ommu.ts
 *   (or: pnpm dlx tsx scripts/load-ommu.ts)
 */
import { readFileSync, existsSync } from 'node:fs';
import { Client } from 'pg';
import { parseSnapshot, fetchSnapshot, type OmmuSnapshot } from '../packages/ommu/src/index.js';

const DSN =
  process.env.X420_DATABASE_URL ??
  'postgresql://x420:x420_local_dev_only@127.0.0.1:5433/x420';

const FIXTURE = new URL('../packages/ommu/test/fixtures/mmtc.html', import.meta.url);

async function loadSnapshot(): Promise<OmmuSnapshot> {
  if (process.env.X420_USE_FIXTURE === '1' && existsSync(FIXTURE)) {
    console.log('Using local fixture (X420_USE_FIXTURE=1)');
    return parseSnapshot(readFileSync(FIXTURE, 'utf8'));
  }
  console.log('Fetching live OMMU snapshot...');
  try {
    return await fetchSnapshot();
  } catch (err) {
    console.warn(`Live fetch failed (${(err as Error).message}); falling back to fixture.`);
    if (!existsSync(FIXTURE)) throw err;
    return parseSnapshot(readFileSync(FIXTURE, 'utf8'));
  }
}

async function main() {
  const snap = await loadSnapshot();
  console.log(
    `Snapshot: ${snap.mmtcs.length} MMTCs, ${snap.locations.length} locations, retrieved ${snap.retrievedAt}`,
  );

  if (snap.locations.length < 100) {
    throw new Error(
      `Refusing to load only ${snap.locations.length} locations — upstream markup probably changed.`,
    );
  }

  const db = new Client({ connectionString: DSN });
  await db.connect();

  try {
    await db.query('BEGIN');

    const { rows: srcRows } = await db.query<{ id: string }>(
      `INSERT INTO sources (kind, name, base_url, authorization_note, robots_allowed)
       VALUES ('public_record', 'Florida OMMU MMTC registry', $1,
               'Public records published by the Florida Department of Health. No authorization required.',
               true)
       ON CONFLICT (kind, name) DO UPDATE SET base_url = EXCLUDED.base_url
       RETURNING id`,
      [snap.sourceUrl],
    );
    const sourceId = srcRows[0]!.id;

    // Map MMTC licence numbers and websites onto their locations by company name.
    const byName = new Map(snap.mmtcs.map((m) => [m.name.toLowerCase().trim(), m]));

    let inserted = 0;
    const seenIds: string[] = [];

    for (const l of snap.locations) {
      const mmtc = byName.get(l.company.toLowerCase().trim());
      seenIds.push(l.id);
      await db.query(
        `INSERT INTO dispensaries
           (id, company, address, city, state, zip, county, phone, email,
            website, license_number, source_id, last_seen_at, active)
         VALUES ($1,$2,$3,$4,'FL',$5,$6,$7,$8,$9,$10,$11, now(), true)
         ON CONFLICT (id) DO UPDATE SET
           company = EXCLUDED.company,
           address = EXCLUDED.address,
           city    = EXCLUDED.city,
           zip     = EXCLUDED.zip,
           county  = EXCLUDED.county,
           phone   = COALESCE(EXCLUDED.phone, dispensaries.phone),
           email   = COALESCE(EXCLUDED.email, dispensaries.email),
           website = COALESCE(EXCLUDED.website, dispensaries.website),
           license_number = COALESCE(EXCLUDED.license_number, dispensaries.license_number),
           last_seen_at = now(),
           active = true`,
        [
          l.id, l.company, l.address, l.city, l.zip, l.county,
          l.phone ?? null, l.email ?? null,
          mmtc?.website ?? null, mmtc?.licenseNumber ?? null, sourceId,
        ],
      );
      inserted++;
    }

    // Anything not in this snapshot is marked inactive, never deleted.
    const { rowCount: deactivated } = await db.query(
      `UPDATE dispensaries SET active = false
       WHERE active = true AND NOT (id = ANY($1::text[]))`,
      [seenIds],
    );

    // Queue every dispensary that has a website for agent research.
    const { rowCount: queued } = await db.query(
      `INSERT INTO research_targets (dispensary_id, url, status)
       SELECT id, website, 'pending'
       FROM dispensaries
       WHERE website IS NOT NULL AND active = true
       ON CONFLICT (url) DO NOTHING`,
    );

    await db.query('COMMIT');

    console.log(`Upserted    : ${inserted}`);
    console.log(`Deactivated : ${deactivated ?? 0}`);
    console.log(`Queued      : ${queued ?? 0} research targets`);

    const { rows: counts } = await db.query(
      `SELECT county, count(*)::int AS n FROM dispensaries
       WHERE active GROUP BY county ORDER BY n DESC LIMIT 5`,
    );
    console.log('\nTop counties:');
    for (const r of counts) console.log(`  ${String(r.county).padEnd(16)} ${r.n}`);
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error('LOAD FAILED:', err.message);
  process.exit(1);
});
