/**
 * Evidence tiers, transcribed from the National Academies of Sciences, Engineering,
 * and Medicine (2017) consensus report "The Health Effects of Cannabis and
 * Cannabinoids: The Current State of Evidence and Recommendations for Research".
 *
 * We use NASEM's own vocabulary deliberately. X420 does not invent its own
 * confidence scale, and it never upgrades a claim beyond what the source supports.
 */
export type EvidenceTier =
  | 'conclusive'
  | 'substantial'
  | 'moderate'
  | 'limited'
  | 'insufficient';

export const EVIDENCE_TIER_RANK: Record<EvidenceTier, number> = {
  conclusive: 5,
  substantial: 4,
  moderate: 3,
  limited: 2,
  insufficient: 1,
};

export const EVIDENCE_TIER_LABEL: Record<EvidenceTier, string> = {
  conclusive: 'Conclusive evidence',
  substantial: 'Substantial evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
  insufficient: 'Insufficient evidence',
};

/** A citation must be checkable by a human. No bare claims, ever. */
export interface Citation {
  /** Human-readable source name. */
  readonly source: string;
  /** Resolvable URL. Verified in CI by scripts/check-citations.ts. */
  readonly url: string;
  /** Publication or approval year. */
  readonly year: number;
  /** What kind of authority this is. */
  readonly kind: 'consensus-review' | 'regulatory-approval' | 'systematic-review';
}

export type Cannabinoid = 'THC' | 'CBD' | 'CBN' | 'CBG' | 'THCV' | 'CBC';

export type Terpene =
  | 'myrcene'
  | 'limonene'
  | 'linalool'
  | 'caryophyllene'
  | 'pinene'
  | 'terpinolene'
  | 'humulene'
  | 'ocimene';

export type RouteOfAdministration =
  | 'inhalation'
  | 'oral'
  | 'sublingual'
  | 'topical'
  | 'transdermal';

/**
 * A condition entry. Every field is sourced; `tier` is the ceiling on how
 * strongly the UI is permitted to phrase anything derived from this entry.
 */
export interface ConditionEvidence {
  readonly id: string;
  readonly label: string;
  /** Florida-qualifying condition under s.381.986(2), F.S. */
  readonly floridaQualifying: boolean;
  /**
   * Which statutory paragraph of s.381.986(2), F.S. qualifies this condition,
   * e.g. '(m)'. Null when the condition is not named in the statute and would
   * only qualify, if at all, via the (2)(k) "same kind or class" catch-all.
   *
   * This exists because "qualifies in Florida" is not one thing. A condition
   * named in the statute is settled; a condition reachable only through (2)(k)
   * requires the physician to file efficacy documentation with their board
   * within 14 days. Patients deserve to know which situation they are in.
   */
  readonly statutoryParagraph?: string | null;
  /**
   * Extra statutory conditions a patient must satisfy beyond simply having the
   * diagnosis. Rendered verbatim in the UI; never summarised away.
   */
  readonly statutoryNote?: string;
  readonly tier: EvidenceTier;
  /** What the evidence actually supports — phrased as an outcome, not a promise. */
  readonly supportedOutcome: string;
  readonly cannabinoids: readonly Cannabinoid[];
  /**
   * Terpenes commonly co-occurring in products studied or marketed for this use.
   * NOTE: terpene-specific clinical evidence in humans is weak; this is a
   * discovery filter, never a claim. Always surfaced as "commonly co-occurring".
   */
  readonly terpenes: readonly Terpene[];
  readonly routes: readonly RouteOfAdministration[];
  readonly citations: readonly Citation[];
  /** Safety notes that MUST render alongside any recommendation. */
  readonly cautions: readonly string[];
}

export const NASEM_2017: Citation = {
  source:
    'National Academies of Sciences, Engineering, and Medicine — The Health Effects of Cannabis and Cannabinoids',
  url: 'https://nap.nationalacademies.org/catalog/24625/the-health-effects-of-cannabis-and-cannabinoids',
  year: 2017,
  kind: 'consensus-review',
};

export const FDA_EPIDIOLEX: Citation = {
  source: 'U.S. FDA — Epidiolex (cannabidiol) oral solution, approval',
  url: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=210365',
  year: 2018,
  kind: 'regulatory-approval',
};

export const FDA_DRONABINOL: Citation = {
  source: 'U.S. FDA — Marinol (dronabinol) capsules, approval',
  url: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018651',
  year: 1985,
  kind: 'regulatory-approval',
};

export const FDA_NABILONE: Citation = {
  source: 'U.S. FDA — Cesamet (nabilone) capsules, approval',
  url: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018677',
  year: 1985,
  kind: 'regulatory-approval',
};

export const FL_STATUTE_381_986: Citation = {
  source: 'Florida Statutes s.381.986 — Medical use of marijuana',
  url: 'https://www.flsenate.gov/Laws/Statutes/2025/381.986',
  year: 2025,
  kind: 'regulatory-approval',
};

/**
 * Florida Administrative Code 64-4.224 — Dosing and Supply Limits.
 *
 * Permanent rule effective 2026-08-24, replacing emergency rule 64ER22-8.
 * Any cached citation to the emergency rule is stale.
 */
export const FL_RULE_64_4_224: Citation = {
  source: 'Florida Administrative Code 64-4.224 — Dosing and supply limits',
  url: 'https://flrules.org/gateway/ruleNo.asp?id=64-4.224',
  year: 2026,
  kind: 'regulatory-approval',
};
