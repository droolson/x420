import { CONDITIONS, getCondition } from './conditions.js';
import {
  type Cannabinoid,
  type ConditionEvidence,
  type EvidenceTier,
  type Terpene,
  EVIDENCE_TIER_RANK,
} from './evidence.js';
import {
  type DisclosureBlock,
  PHRASING_CEILING,
  requireDisclosure,
} from './guardrails.js';

/** A product as normalised from any dispensary source. */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand?: string;
  readonly dispensaryId: string;
  readonly category: string;
  /** Percent by weight, 0-100, for flower/concentrate. */
  readonly thcPercent?: number;
  readonly cbdPercent?: number;
  /** Milligrams per unit, for edibles/tinctures/capsules. */
  readonly thcMg?: number;
  readonly cbdMg?: number;
  readonly terpenes?: readonly Terpene[];
  readonly priceUsd?: number;
  readonly url?: string;
  /** Certificate of analysis. Products without one are ranked down, hard. */
  readonly coaUrl?: string;
}

export interface MatchInput {
  readonly conditionId: string;
  /** Patient preference, not a medical input. */
  readonly avoidIntoxication?: boolean;
  readonly preferredRoutes?: readonly string[];
  readonly maxPriceUsd?: number;
}

export interface MatchReason {
  readonly code: string;
  readonly detail: string;
  /** Positive raises rank, negative lowers it. */
  readonly weight: number;
}

export interface ProductMatch {
  readonly product: Product;
  readonly score: number;
  readonly reasons: readonly MatchReason[];
}

export interface MatchResult {
  readonly condition: ConditionEvidence;
  /** Evidence-ceilinged sentence the UI is allowed to render verbatim. */
  readonly headline: string;
  readonly tier: EvidenceTier;
  readonly matches: readonly ProductMatch[];
  readonly cautions: readonly string[];
  readonly citations: readonly { source: string; url: string; year: number }[];
  readonly disclosure: DisclosureBlock;
}

export class InsufficientEvidenceError extends Error {
  readonly conditionId: string;
  constructor(conditionId: string, message: string) {
    super(message);
    this.name = 'InsufficientEvidenceError';
    this.conditionId = conditionId;
  }
}

/** Ratio of CBD to THC. Higher = less intoxicating. */
export function cbdThcRatio(p: Product): number | undefined {
  const thc = p.thcMg ?? p.thcPercent;
  const cbd = p.cbdMg ?? p.cbdPercent;
  if (thc === undefined || cbd === undefined) return undefined;
  if (thc <= 0) return cbd > 0 ? Number.POSITIVE_INFINITY : undefined;
  return cbd / thc;
}

function scoreProduct(
  product: Product,
  condition: ConditionEvidence,
  input: MatchInput,
): ProductMatch {
  const reasons: MatchReason[] = [];
  let score = 0;

  // 1. Cannabinoid alignment with what the evidence actually studied.
  const wants = new Set<Cannabinoid>(condition.cannabinoids);
  const hasThc = (product.thcMg ?? product.thcPercent ?? 0) > 0;
  const hasCbd = (product.cbdMg ?? product.cbdPercent ?? 0) > 0;

  if (wants.has('THC') && hasThc) {
    score += 25;
    reasons.push({
      code: 'cannabinoid-thc',
      detail: 'Contains THC, which the cited evidence for this condition studied.',
      weight: 25,
    });
  }
  if (wants.has('CBD') && hasCbd) {
    score += 25;
    reasons.push({
      code: 'cannabinoid-cbd',
      detail: 'Contains CBD, which the cited evidence for this condition studied.',
      weight: 25,
    });
  }

  // 2. Balanced ratio bonus — the MS-spasticity evidence rests on ~1:1 products.
  const ratio = cbdThcRatio(product);
  if ((condition.id === 'spasticity-ms' || condition.id === 'spasticity-sci') && ratio !== undefined) {
    if (ratio >= 0.5 && ratio <= 2) {
      score += 20;
      reasons.push({
        code: 'balanced-ratio',
        detail:
          'Roughly balanced CBD:THC, matching the formulation type used in the spasticity trials.',
        weight: 20,
      });
    }
  }

  // 3. Patient preference: avoid intoxication.
  if (input.avoidIntoxication) {
    if (ratio !== undefined && ratio >= 2) {
      score += 20;
      reasons.push({
        code: 'low-intoxication',
        detail: 'High CBD relative to THC — less intoxicating at equivalent dose.',
        weight: 20,
      });
    } else if (hasThc && (ratio === undefined || ratio < 1)) {
      score -= 25;
      reasons.push({
        code: 'intoxication-risk',
        detail: 'THC-dominant, which conflicts with your preference to avoid intoxication.',
        weight: -25,
      });
    }
  }

  // 4. Terpene co-occurrence — a weak discovery signal, weighted like one.
  const terps = new Set<Terpene>(product.terpenes ?? []);
  const overlap = condition.terpenes.filter((t) => terps.has(t));
  if (overlap.length > 0) {
    const w = Math.min(overlap.length * 3, 9);
    score += w;
    reasons.push({
      code: 'terpene-overlap',
      detail: `Commonly co-occurring terpenes present (${overlap.join(', ')}). Human evidence for terpene-specific effects is weak; this is a discovery signal, not a claim.`,
      weight: w,
    });
  }

  // 5. Lab transparency. A product you cannot verify is a product you cannot trust.
  if (product.coaUrl) {
    score += 15;
    reasons.push({
      code: 'coa-available',
      detail: 'Certificate of analysis published — potency is verifiable.',
      weight: 15,
    });
  } else {
    score -= 10;
    reasons.push({
      code: 'coa-missing',
      detail: 'No certificate of analysis found. Potency claims are unverified.',
      weight: -10,
    });
  }

  // 6. Budget.
  if (input.maxPriceUsd !== undefined && product.priceUsd !== undefined) {
    if (product.priceUsd <= input.maxPriceUsd) {
      score += 10;
      reasons.push({
        code: 'within-budget',
        detail: `Within your $${input.maxPriceUsd} limit.`,
        weight: 10,
      });
    } else {
      score -= 30;
      reasons.push({
        code: 'over-budget',
        detail: `$${product.priceUsd.toFixed(2)} exceeds your $${input.maxPriceUsd} limit.`,
        weight: -30,
      });
    }
  }

  reasons.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  return { product, score, reasons };
}

/**
 * Match products to a condition.
 *
 * Refuses outright when the evidence base does not support a recommendation.
 * That refusal is a feature: it is the difference between a health tool and a
 * vending machine with a stethoscope drawn on it.
 */
export function matchProducts(
  products: readonly Product[],
  input: MatchInput,
): MatchResult {
  const condition = getCondition(input.conditionId);
  if (!condition) {
    throw new Error(`Unknown condition: ${input.conditionId}`);
  }

  if (condition.tier === 'insufficient') {
    throw new InsufficientEvidenceError(
      condition.id,
      `${condition.label}: ${condition.supportedOutcome} X420 will not rank products for an indication the evidence does not support.`,
    );
  }

  const matches = products
    .map((p) => scoreProduct(p, condition, input))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  const verb = PHRASING_CEILING[condition.tier];

  return {
    condition,
    tier: condition.tier,
    headline: `Per the cited evidence, cannabis ${verb} ${condition.label.toLowerCase()}.`,
    matches,
    cautions: condition.cautions,
    citations: condition.citations.map((c) => ({
      source: c.source,
      url: c.url,
      year: c.year,
    })),
    disclosure: requireDisclosure(),
  };
}

export function rankConditionsByEvidence(): readonly ConditionEvidence[] {
  return [...CONDITIONS].sort(
    (a, b) => EVIDENCE_TIER_RANK[b.tier] - EVIDENCE_TIER_RANK[a.tier],
  );
}
