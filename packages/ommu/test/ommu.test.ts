import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseMmtcs,
  parseLocations,
  parseSnapshot,
  normaliseCounty,
  byCounty,
  searchByZip,
} from '../src/index.js';

/**
 * Fixture is a real capture of the live OMMU page. If it is missing, these
 * tests SKIP loudly rather than passing vacuously — a green suite that tested
 * nothing would be worse than a red one.
 */
const FIXTURE = join(import.meta.dirname, 'fixtures', 'mmtc.html');
const hasFixture = existsSync(FIXTURE);
const html = hasFixture ? readFileSync(FIXTURE, 'utf8') : '';

describe.skipIf(!hasFixture)('OMMU parser against real captured HTML', () => {
  it('parses licensed MMTCs', () => {
    const mmtcs = parseMmtcs(html);
    expect(mmtcs.length).toBeGreaterThan(15);
    for (const m of mmtcs) {
      expect(m.name.length).toBeGreaterThan(1);
      expect(m.name.toLowerCase()).not.toBe('name');
    }
  });

  it('captures license numbers for most MMTCs', () => {
    const mmtcs = parseMmtcs(html);
    const withLicense = mmtcs.filter((m) => m.licenseNumber);
    expect(withLicense.length).toBeGreaterThan(mmtcs.length / 2);
  });

  it('parses hundreds of dispensing locations', () => {
    const locs = parseLocations(html);
    expect(locs.length).toBeGreaterThan(500);
  });

  it('gives every location a non-empty company, address and id', () => {
    for (const l of parseLocations(html)) {
      expect(l.company.length).toBeGreaterThan(0);
      expect(l.address.length).toBeGreaterThan(0);
      expect(l.id.length).toBeGreaterThan(0);
    }
  });

  it('produces unique ids', () => {
    const locs = parseLocations(html);
    expect(new Set(locs.map((l) => l.id)).size).toBe(locs.length);
  });

  it('never emits OMMU placeholder dashes as real data', () => {
    for (const l of parseLocations(html)) {
      expect(l.phone).not.toBe('-');
      expect(l.email).not.toBe('-');
    }
  });

  it('normalises Miami-Dade spelling variants into one county', () => {
    const counties = new Set(parseLocations(html).map((l) => l.county));
    expect(counties.has('Miami Dade')).toBe(false);
    expect(counties.has('Miami-Dade')).toBe(true);
  });

  it('groups by county and finds Orange County (Orlando)', () => {
    const grouped = byCounty(parseLocations(html));
    expect(grouped.size).toBeGreaterThan(20);
    expect(grouped.get('Orange')?.length).toBeGreaterThan(0);
  });

  it('searches by zip prefix', () => {
    const locs = parseLocations(html);
    const results = searchByZip(locs, '32250');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.zip.startsWith('322')).toBe(true);
  });

  it('stamps snapshots with source and time', () => {
    const snap = parseSnapshot(html);
    expect(snap.sourceUrl).toContain('knowthefactsmmj.com');
    expect(Date.parse(snap.retrievedAt)).not.toBeNaN();
  });
});

describe('county normalisation', () => {
  it('handles spelling variants', () => {
    expect(normaliseCounty('Miami Dade')).toBe('Miami-Dade');
    expect(normaliseCounty('Miami-Dade')).toBe('Miami-Dade');
    expect(normaliseCounty('  Orange ')).toBe('Orange');
    expect(normaliseCounty('St Lucie')).toBe('St. Lucie');
  });
});

describe('parser resilience', () => {
  it('returns empty arrays for junk input instead of throwing', () => {
    expect(parseMmtcs('<html><body>nothing</body></html>')).toEqual([]);
    expect(parseLocations('<html><body>nothing</body></html>')).toEqual([]);
  });
});
