import { describe, it, expect } from 'vitest';
import {
  matchProducts,
  getCondition,
  rankConditionsByEvidence,
  InsufficientEvidenceError,
  cbdThcRatio,
  floridaQualifyingConditions,
  CONDITIONS,
  assertDisclosed,
  DisclosureError,
  DISCLOSURE_VERSION,
  type Product,
} from '../src/index.js';

const products: Product[] = [
  {
    id: 'p-balanced',
    name: '1:1 RSO Tincture',
    dispensaryId: 'd1',
    category: 'tincture',
    thcMg: 100,
    cbdMg: 100,
    terpenes: ['myrcene', 'linalool'],
    priceUsd: 60,
    coaUrl: 'https://example.org/coa/p-balanced.pdf',
  },
  {
    id: 'p-thc-heavy',
    name: 'High THC Flower',
    dispensaryId: 'd1',
    category: 'flower',
    thcPercent: 28,
    cbdPercent: 0.1,
    terpenes: ['limonene'],
    priceUsd: 45,
  },
  {
    id: 'p-cbd-heavy',
    name: 'CBD 20:1 Capsules',
    dispensaryId: 'd2',
    category: 'capsule',
    thcMg: 5,
    cbdMg: 100,
    terpenes: ['linalool'],
    priceUsd: 55,
    coaUrl: 'https://example.org/coa/p-cbd.pdf',
  },
];

describe('evidence integrity', () => {
  it('every condition carries at least one resolvable-looking citation', () => {
    for (const c of CONDITIONS) {
      expect(c.citations.length, `${c.id} has no citations`).toBeGreaterThan(0);
      for (const cite of c.citations) {
        expect(cite.url, `${c.id} citation missing url`).toMatch(/^https:\/\//);
        expect(cite.year).toBeGreaterThan(1900);
      }
    }
  });

  it('every condition carries at least one caution', () => {
    for (const c of CONDITIONS) {
      expect(c.cautions.length, `${c.id} has no cautions`).toBeGreaterThan(0);
    }
  });

  it('ranks conclusive evidence above limited', () => {
    const ranked = rankConditionsByEvidence();
    const first = ranked[0]!;
    const last = ranked[ranked.length - 1]!;
    expect(['conclusive', 'substantial']).toContain(first.tier);
    expect(['limited', 'insufficient']).toContain(last.tier);
  });

  it('exposes Florida-qualifying conditions', () => {
    const fl = floridaQualifyingConditions();
    expect(fl.length).toBeGreaterThan(4);
    expect(fl.every((c) => c.floridaQualifying)).toBe(true);
  });
});

describe('honesty guarantees', () => {
  it('refuses to rank products for glaucoma despite it being FL-qualifying', () => {
    const glaucoma = getCondition('glaucoma')!;
    expect(glaucoma.floridaQualifying).toBe(true);
    expect(glaucoma.tier).toBe('insufficient');
    expect(() =>
      matchProducts(products, { conditionId: 'glaucoma' }),
    ).toThrow(InsufficientEvidenceError);
  });

  it('does not claim cannabis restores motor function in SCI', () => {
    const sci = getCondition('spasticity-sci')!;
    const all = (sci.supportedOutcome + sci.cautions.join(' ')).toLowerCase();
    expect(all).toContain('will not tell you cannabis restores motor function');
    expect(sci.tier).toBe('limited');
  });

  it('uses hedged phrasing for limited-evidence conditions', () => {
    const res = matchProducts(products, { conditionId: 'ptsd' });
    expect(res.headline).toContain('limited evidence');
    expect(res.headline).not.toContain('is effective for');
  });

  it('uses strong phrasing only where evidence is strong', () => {
    const res = matchProducts(products, { conditionId: 'chronic-pain' });
    expect(res.headline).toContain('is effective for');
  });
});

describe('product matching', () => {
  it('prefers balanced ratio products for MS spasticity', () => {
    const res = matchProducts(products, { conditionId: 'spasticity-ms' });
    expect(res.matches[0]!.product.id).toBe('p-balanced');
    const codes = res.matches[0]!.reasons.map((r) => r.code);
    expect(codes).toContain('balanced-ratio');
  });

  it('penalises THC-dominant products when avoiding intoxication', () => {
    const res = matchProducts(products, {
      conditionId: 'chronic-pain',
      avoidIntoxication: true,
    });
    const ids = res.matches.map((m) => m.product.id);
    expect(ids[0]).toBe('p-cbd-heavy');
    expect(ids.indexOf('p-cbd-heavy')).toBeLessThan(
      ids.indexOf('p-thc-heavy') === -1 ? Infinity : ids.indexOf('p-thc-heavy'),
    );
  });

  it('flags missing certificate of analysis', () => {
    const res = matchProducts(products, { conditionId: 'chronic-pain' });
    const thcHeavy = res.matches.find((m) => m.product.id === 'p-thc-heavy');
    expect(thcHeavy?.reasons.map((r) => r.code)).toContain('coa-missing');
  });

  it('every match explains itself', () => {
    const res = matchProducts(products, { conditionId: 'chronic-pain' });
    for (const m of res.matches) {
      expect(m.reasons.length).toBeGreaterThan(0);
      for (const r of m.reasons) expect(r.detail.length).toBeGreaterThan(10);
    }
  });

  it('respects budget', () => {
    const res = matchProducts(products, {
      conditionId: 'chronic-pain',
      maxPriceUsd: 50,
    });
    const over = res.matches.find((m) => m.product.id === 'p-balanced');
    expect(over?.reasons.map((r) => r.code)).toContain('over-budget');
  });

  it('computes cbd:thc ratio correctly', () => {
    expect(cbdThcRatio(products[0]!)).toBe(1);
    expect(cbdThcRatio(products[2]!)).toBe(20);
  });
});

describe('disclosure enforcement', () => {
  it('attaches a current disclosure block to every result', () => {
    const res = matchProducts(products, { conditionId: 'chronic-pain' });
    expect(res.disclosure.version).toBe(DISCLOSURE_VERSION);
    expect(res.disclosure.notMedicalAdvice).toContain('not a medical device');
    expect(res.disclosure.floridaLegal).toContain('Registry Identification Card');
    expect(() => assertDisclosed(res)).not.toThrow();
  });

  it('throws when a payload lacks disclosure', () => {
    expect(() => assertDisclosed({ disclosure: undefined })).toThrow(DisclosureError);
  });

  it('always surfaces cautions alongside matches', () => {
    const res = matchProducts(products, { conditionId: 'spasticity-sci' });
    expect(res.cautions.length).toBeGreaterThan(0);
  });
});
