import { useEffect, useMemo, useState } from 'react';
import {
  CONDITIONS,
  requireDisclosure,
  EVIDENCE_TIER_LABEL,
  type ConditionEvidence,
  type EvidenceTier,
} from '@x420/core';

const API_BASE = import.meta.env.VITE_X420_API ?? 'https://api.x420.org';

interface Location {
  id: string;
  company: string;
  address: string;
  city: string;
  zip: string;
  county: string;
}

const TIER_CLASS: Record<EvidenceTier, string> = {
  conclusive: 'tier tier-strong',
  substantial: 'tier tier-strong',
  moderate: 'tier tier-mid',
  limited: 'tier tier-weak',
  insufficient: 'tier tier-none',
};

function EvidenceBadge({ tier }: { tier: EvidenceTier }) {
  return <span className={TIER_CLASS[tier]}>{EVIDENCE_TIER_LABEL[tier]}</span>;
}

function ConditionCard({ c }: { c: ConditionEvidence }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="card">
      <header className="card-head" onClick={() => setOpen((o) => !o)}>
        <div>
          <h3>{c.label}</h3>
          <EvidenceBadge tier={c.tier} />
          {c.floridaQualifying && <span className="tag">FL qualifying</span>}
        </div>
        <button aria-expanded={open} className="chev">{open ? '−' : '+'}</button>
      </header>

      <p className="outcome">{c.supportedOutcome}</p>

      {c.tier === 'insufficient' && (
        <p className="refusal">
          X420 will not rank products for this condition. It qualifies legally in
          Florida, but the evidence does not support it — and you deserve to know
          the difference.
        </p>
      )}

      {open && (
        <div className="detail">
          {c.cautions.length > 0 && (
            <>
              <h4>Before you use this</h4>
              <ul className="cautions">
                {c.cautions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
          <h4>Sources</h4>
          <ul className="cites">
            {c.citations.map((cite) => (
              <li key={cite.url}>
                <a href={cite.url} target="_blank" rel="noreferrer noopener">
                  {cite.source} ({cite.year})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function Dispensaries() {
  const [county, setCounty] = useState('Orange');
  const [rows, setRows] = useState<Location[] | null>(null);
  const [meta, setMeta] = useState<{ retrievedAt: string; url: string } | null>(null);
  const [counties, setCounties] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/v1/dispensaries?county=${encodeURIComponent(county)}&limit=100`)
      .then((r) => {
        if (!r.ok) throw new Error(`API returned HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setRows(d.results ?? []);
        setMeta({ retrievedAt: d.source?.retrievedAt, url: d.source?.url });
        if (d.counties) setCounties(d.counties);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setRows(null);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [county]);

  return (
    <section>
      <h2>Licensed dispensing locations</h2>
      <p className="sub">
        Florida Office of Medical Marijuana Use public records. Every record is
        timestamped and links back to the agency.
      </p>

      <label className="field">
        County
        <select value={county} onChange={(e) => setCounty(e.target.value)}>
          {(counties.length ? counties : ['Orange']).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {loading && <p className="muted">Loading…</p>}

      {error && (
        <p className="error">
          Could not reach the X420 API ({error}). Nothing is shown rather than
          showing you data we cannot verify.
        </p>
      )}

      {rows && rows.length > 0 && (
        <>
          <p className="muted">
            {rows.length} location{rows.length === 1 ? '' : 's'} in {county}.
            {meta?.retrievedAt && ` Data retrieved ${new Date(meta.retrievedAt).toLocaleString()}.`}
          </p>
          <ul className="locs">
            {rows.map((l) => (
              <li key={l.id}>
                <strong>{l.company}</strong>
                <span>{l.address}, {l.city} {l.zip}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {rows && rows.length === 0 && !loading && (
        <p className="muted">No locations listed in {county}.</p>
      )}
    </section>
  );
}

export function App() {
  const disclosure = useMemo(() => requireDisclosure(), []);
  const ranked = useMemo(
    () => [...CONDITIONS].sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  return (
    <div className="wrap">
      <header className="hero">
        <h1>X420</h1>
        <p className="tagline">
          Medical cannabis information that tells you how strong the evidence
          actually is — including when it is weak.
        </p>
      </header>

      <section>
        <h2>Conditions</h2>
        <p className="sub">
          Every statement below is bound to a citation from the National Academies
          of Sciences 2017 consensus review or an FDA approval, and labelled with
          the strength of that evidence.
        </p>
        <div className="grid">
          {ranked.map((c) => (
            <ConditionCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      <Dispensaries />

      <footer className="legal">
        <h2>Please read</h2>
        <p>{disclosure.notMedicalAdvice}</p>
        <p>{disclosure.floridaLegal}</p>
        <p>{disclosure.interstate}</p>
        <p>{disclosure.cryptoRisk}</p>
        <p className="ver">Disclosure version {disclosure.version}</p>
      </footer>
    </div>
  );
}
