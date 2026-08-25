/**
 * OMMU ingest — Florida Office of Medical Marijuana Use, public records.
 *
 * Source: https://knowthefactsmmj.com/mmtc/
 *
 * This is public-record data published by the Florida Department of Health.
 * We parse it, we normalise it, we cite it, and we never claim it is anything
 * other than a snapshot. The agency is authoritative; we are a mirror with a
 * timestamp. Every record carries `retrievedAt` and `sourceUrl` so a patient
 * can always go check the original.
 *
 * DOM shape verified 2026-08-25 against the live page:
 *   - table#approveddispensing441 -> licensed MMTCs (Name, Phone, Email, Auth Status, License #)
 *   - table.table                 -> dispensing locations (COMPANY, ADDRESS, EMAIL, PHONE, CITY, ZIP, COUNTY)
 */
import { parse, type HTMLElement } from 'node-html-parser';

export const OMMU_MMTC_URL = 'https://knowthefactsmmj.com/mmtc/';
export const OMMU_WEEKLY_UPDATES_URL =
  'https://knowthefactsmmj.com/about/weekly-updates/';

/** A licensed Medical Marijuana Treatment Center (the license holder). */
export interface Mmtc {
  readonly name: string;
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
  readonly authorizationStatus?: string;
  readonly licenseNumber?: string;
}

/** A physical dispensing location operated by an MMTC. */
export interface DispensaryLocation {
  /** Stable synthetic id: slug(company)-zip-slug(address). */
  readonly id: string;
  readonly company: string;
  readonly address: string;
  readonly city: string;
  readonly zip: string;
  readonly county: string;
  readonly email?: string;
  readonly phone?: string;
}

export interface OmmuSnapshot {
  readonly sourceUrl: string;
  readonly retrievedAt: string;
  readonly mmtcs: readonly Mmtc[];
  readonly locations: readonly DispensaryLocation[];
}

function clean(s: string | undefined | null): string {
  return (s ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/** OMMU uses "-" as its null. Treat it as null, not as a phone number. */
function nullable(s: string): string | undefined {
  const c = clean(s);
  return c === '' || c === '-' || c === '—' ? undefined : c;
}

function slug(s: string): string {
  return clean(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Normalise county spelling; OMMU mixes "Miami Dade" and "Miami-Dade". */
export function normaliseCounty(raw: string): string {
  const c = clean(raw);
  if (/^miami[\s-]?dade$/i.test(c)) return 'Miami-Dade';
  if (/^st\.?\s*(lucie|johns)$/i.test(c)) {
    return c.replace(/^st\.?\s*/i, 'St. ');
  }
  if (/^palm\s*beach$/i.test(c)) return 'Palm Beach';
  return c;
}

function cellsOf(row: HTMLElement): string[] {
  return row.querySelectorAll('td').map((td) => clean(td.textContent));
}

export function parseMmtcs(html: string): Mmtc[] {
  const root = parse(html);
  const table = root.querySelector('#approveddispensing441');
  if (!table) return [];

  const out: Mmtc[] = [];
  for (const row of table.querySelectorAll('tr')) {
    const tds = row.querySelectorAll('td');
    if (tds.length < 5) continue;
    const cells = cellsOf(row);
    const name = cells[0] ?? '';
    // Skip the header row, which OMMU implements as <td><strong>Name</strong>.
    if (!name || /^name$/i.test(name)) continue;

    const link = tds[0]?.querySelector('a');
    const href = link?.getAttribute('href');

    out.push({
      name,
      phone: nullable(cells[1] ?? ''),
      email: nullable(cells[2] ?? ''),
      website: href && /^https?:/i.test(href) ? href : undefined,
      authorizationStatus: nullable(cells[3] ?? ''),
      licenseNumber: nullable(cells[4] ?? ''),
    });
  }
  return out;
}

export function parseLocations(html: string): DispensaryLocation[] {
  const root = parse(html);
  const out: DispensaryLocation[] = [];
  const seen = new Set<string>();

  for (const table of root.querySelectorAll('table.table')) {
    const headers = table
      .querySelectorAll('thead th')
      .map((th) => clean(th.textContent).toUpperCase());
    if (!headers.includes('COMPANY') || !headers.includes('ADDRESS')) continue;

    const idx = (name: string) => headers.indexOf(name);
    const iCompany = idx('COMPANY');
    const iAddress = idx('ADDRESS');
    const iEmail = idx('EMAIL ADDRESS');
    const iPhone = idx('PHONE');
    const iCity = idx('CITY');
    const iZip = idx('ZIP CODE');
    const iCounty = idx('COUNTY');

    for (const row of table.querySelectorAll('tbody tr')) {
      const cells = cellsOf(row);
      if (cells.length < 4) continue;

      const company = clean(cells[iCompany] ?? '');
      const address = clean(cells[iAddress] ?? '');
      if (!company || !address) continue;

      const zip = clean(cells[iZip] ?? '');
      const id = `${slug(company)}-${zip}-${slug(address)}`;
      if (seen.has(id)) continue;
      seen.add(id);

      out.push({
        id,
        company,
        address,
        city: clean(cells[iCity] ?? ''),
        zip,
        county: normaliseCounty(cells[iCounty] ?? ''),
        email: iEmail >= 0 ? nullable(cells[iEmail] ?? '') : undefined,
        phone: iPhone >= 0 ? nullable(cells[iPhone] ?? '') : undefined,
      });
    }
  }
  return out;
}

export function parseSnapshot(html: string, retrievedAt = new Date()): OmmuSnapshot {
  return {
    sourceUrl: OMMU_MMTC_URL,
    retrievedAt: retrievedAt.toISOString(),
    mmtcs: parseMmtcs(html),
    locations: parseLocations(html),
  };
}

export async function fetchSnapshot(
  fetchImpl: typeof fetch = fetch,
): Promise<OmmuSnapshot> {
  const res = await fetchImpl(OMMU_MMTC_URL, {
    headers: {
      'user-agent': 'x420-ommu-ingest/0.1 (+https://x420.org; public-records mirror)',
      accept: 'text/html',
    },
  });
  if (!res.ok) {
    throw new Error(`OMMU fetch failed: HTTP ${res.status}`);
  }
  return parseSnapshot(await res.text());
}

/** Group locations by county — the primary "near me" filter without geocoding. */
export function byCounty(
  locations: readonly DispensaryLocation[],
): Map<string, DispensaryLocation[]> {
  const m = new Map<string, DispensaryLocation[]>();
  for (const l of locations) {
    const arr = m.get(l.county) ?? [];
    arr.push(l);
    m.set(l.county, arr);
  }
  return m;
}

/** Zip-prefix search. Crude but honest: no geocoding means no fake distances. */
export function searchByZip(
  locations: readonly DispensaryLocation[],
  zip: string,
  { prefixLength = 3 }: { prefixLength?: number } = {},
): DispensaryLocation[] {
  const p = clean(zip).slice(0, prefixLength);
  if (!p) return [];
  const exact = locations.filter((l) => l.zip === clean(zip));
  const near = locations.filter((l) => l.zip.startsWith(p) && l.zip !== clean(zip));
  return [...exact, ...near];
}
