/**
 * X420 legal + safety guardrails.
 *
 * These are not decoration. Every surface that renders a product suggestion
 * MUST call `requireDisclosure()` and render the returned block. The gateway
 * and the API refuse to serve recommendation payloads that do not carry it.
 */

export const NOT_MEDICAL_ADVICE = [
  'X420 is an information and discovery tool. It is not a medical device, it does',
  'not diagnose or treat any condition, and it does not replace your qualified',
  'physician. Cannabis affects people differently. Talk to your ordering physician',
  'before changing anything about how you medicate.',
].join(' ');

export const FLORIDA_LEGAL_NOTICE = [
  'In Florida, medical marijuana may only be dispensed to a qualified patient or',
  'caregiver holding an active Registry Identification Card, and only by a licensed',
  'Medical Marijuana Treatment Center (MMTC). X420 does not sell, ship, deliver, or',
  'broker cannabis, and cannot obtain it for you.',
].join(' ');

export const NO_INTERSTATE = [
  'Cannabis may not be transported across state lines, including by mail. Dispensary',
  'listings outside your jurisdiction are shown for reference only.',
].join(' ');

export const CRYPTO_RISK = [
  'X420 payment features settle in stablecoins on Solana. Digital assets carry risk,',
  'transactions are irreversible, and X420 never takes custody of your funds or keys.',
].join(' ');

export interface DisclosureBlock {
  readonly notMedicalAdvice: string;
  readonly floridaLegal: string;
  readonly interstate: string;
  readonly cryptoRisk: string;
  readonly version: string;
}

export const DISCLOSURE_VERSION = '2026-08-25.1';

export function requireDisclosure(): DisclosureBlock {
  return {
    notMedicalAdvice: NOT_MEDICAL_ADVICE,
    floridaLegal: FLORIDA_LEGAL_NOTICE,
    interstate: NO_INTERSTATE,
    cryptoRisk: CRYPTO_RISK,
    version: DISCLOSURE_VERSION,
  };
}

/**
 * Phrasing ceiling. The UI may never use language stronger than the evidence tier
 * permits. `insufficient` is deliberately unable to produce a recommendation verb.
 */
export const PHRASING_CEILING = {
  conclusive: 'is effective for',
  substantial: 'is effective for',
  moderate: 'may improve',
  limited: 'has been studied for, with limited evidence for',
  insufficient: 'does not have sufficient evidence to support use for',
} as const;

export class DisclosureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DisclosureError';
  }
}

/** Throws if a payload is about to go out without its guardrails attached. */
export function assertDisclosed<T extends { disclosure?: DisclosureBlock }>(
  payload: T,
): asserts payload is T & { disclosure: DisclosureBlock } {
  if (!payload.disclosure || payload.disclosure.version !== DISCLOSURE_VERSION) {
    throw new DisclosureError(
      'Refusing to emit a recommendation payload without a current disclosure block.',
    );
  }
}
