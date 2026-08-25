import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_X420_PRODUCTS_API ?? 'http://localhost:8420';

interface ProductRow {
  product_name: string;
  brand_name: string | null;
  category: string;
  thc_percent: number | null;
  cbd_percent: number | null;
  thc_mg: number | null;
  cbd_mg: number | null;
  price_usd: number | null;
  dispensary_company: string | null;
  city: string | null;
  provenance: {
    kind: string;
    label: string;
    url: string | null;
    confidence: string;
    observed_at: string;
  };
}

/**
 * Provenance badge. This component is the reason the products view exists at
 * all: a potency number with no visible origin is worse than no number, so the
 * badge is not optional styling — it renders on every single row.
 */
function Provenance({ p }: { p: ProductRow['provenance'] }) {
  const unverified = p.kind === 'agent_extraction' || p.confidence === 'unverified';
  return (
    <span className={unverified ? 'prov prov-weak' : 'prov prov-ok'} title={p.label}>
      {p.label}
    </span>
  );
}

function potency(r: ProductRow): string {
  const parts: string[] = [];
  if (r.thc_percent != null) parts.push(`THC ${r.thc_percent}%`);
  if (r.cbd_percent != null) parts.push(`CBD ${r.cbd_percent}%`);
  if (r.thc_mg != null) parts.push(`THC ${r.thc_mg}mg`);
  if (r.cbd_mg != null) parts.push(`CBD ${r.cbd_mg}mg`);
  // Explicit, not blank. A missing figure must look missing.
  return parts.length ? parts.join(' · ') : 'Potency not published';
}

export function Products() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/v1/products?limit=40`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setRows(d.results ?? []);
        setNote(d.note ?? null);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <h2>Products</h2>
      <p className="sub">
        Every product carries a visible source. X420 shows you where a potency
        figure came from, because a number with no origin is not information.
      </p>

      {loading && <p className="muted">Loading…</p>}

      {error && (
        <p className="error">
          Products API unreachable ({error}). Showing nothing rather than
          showing you data we cannot attribute.
        </p>
      )}

      {note && !error && <p className="refusal">{note}</p>}

      {rows && rows.length > 0 && (
        <ul className="locs">
          {rows.map((r, i) => (
            <li key={`${r.product_name}-${i}`}>
              <strong>
                {r.brand_name ? `${r.brand_name} — ` : ''}{r.product_name}
              </strong>
              <span>
                {r.category} · {potency(r)}
                {r.price_usd != null ? ` · $${r.price_usd}` : ''}
                {r.dispensary_company ? ` · ${r.dispensary_company}` : ''}
              </span>
              <Provenance p={r.provenance} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
