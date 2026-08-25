/**
 * X420 x402 payment gateway.
 *
 * Implements the publisher side of the x402 protocol: quote a price, return
 * HTTP 402 with machine-readable terms, verify the client's signed retry
 * through a facilitator, then serve the resource.
 *
 * x402 is an open spec stewarded by the Linux Foundation x402 Foundation
 * (contributed by Coinbase, April 2026). Solana settlement landed in v2.
 * Spec: https://x402.org
 *
 * DESIGN NOTE — why this file exists rather than just importing x402-hono:
 * we need per-route pricing driven by our own resource catalogue, we need to
 * advertise multiple networks in one 402, and we need every response to carry
 * the X420 compliance envelope. The official SDK is a dependency, not a
 * replacement for the policy layer.
 *
 * COMPLIANCE — read this before wiring cannabis commerce to it:
 * X420 does NOT process payment for cannabis product. Cannabis is federally
 * Schedule I and Florida requires point-of-sale payment at a licensed MMTC.
 * This gateway monetises DATA AND SOFTWARE ACCESS: API calls, agent queries,
 * dataset exports, premium matching. See docs/COMPLIANCE.md.
 */

/** CAIP-2 network identifiers. */
export const NETWORKS = {
  solanaMainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  solanaDevnet: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  base: 'eip155:8453',
} as const;

export type NetworkId = (typeof NETWORKS)[keyof typeof NETWORKS];

/** USDC mint on Solana mainnet. */
export const USDC_SOLANA_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
/** USDC contract on Base. */
export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export interface PaymentOption {
  readonly scheme: 'exact';
  readonly network: NetworkId;
  /** Atomic units as a decimal string (USDC has 6 decimals). */
  readonly amount: string;
  readonly asset: string;
  readonly payTo: string;
  readonly resource: string;
  readonly description: string;
  readonly mimeType: string;
  readonly maxTimeoutSeconds: number;
}

export interface PaymentRequired {
  readonly x402Version: 2;
  readonly error: string;
  readonly accepts: readonly PaymentOption[];
}

/** A priced resource in the X420 catalogue. */
export interface PricedResource {
  readonly path: string;
  /** Price in USD cents. Keep these small — this is agent-scale metering. */
  readonly priceCents: number;
  readonly description: string;
  readonly mimeType: string;
}

/**
 * The X420 resource catalogue.
 *
 * Pricing philosophy: the patient-facing app is free, forever. Dispensary
 * search, condition evidence, and product matching cost nothing to a human
 * with a Registry card. What costs money is PROGRAMMATIC access at scale —
 * agents, integrators, and researchers pulling the normalised dataset.
 */
export const CATALOGUE: readonly PricedResource[] = [
  {
    path: '/v1/agent/match',
    priceCents: 1,
    description: 'Agent-facing evidence-linked product match for one condition',
    mimeType: 'application/json',
  },
  {
    path: '/v1/agent/dispensaries',
    priceCents: 1,
    description: 'Normalised Florida MMTC dispensing-location query',
    mimeType: 'application/json',
  },
  {
    path: '/v1/dataset/ommu-snapshot',
    priceCents: 50,
    description: 'Full normalised OMMU snapshot export (MMTCs + all locations, JSON)',
    mimeType: 'application/json',
  },
  {
    path: '/v1/dataset/evidence',
    priceCents: 25,
    description: 'Full condition evidence knowledge base with citations',
    mimeType: 'application/json',
  },
];

const CATALOGUE_BY_PATH = new Map(CATALOGUE.map((r) => [r.path, r]));

export function findResource(path: string): PricedResource | undefined {
  return CATALOGUE_BY_PATH.get(path);
}

/** USD cents -> USDC atomic units (6 decimals). 1 cent = 10_000 units. */
export function centsToUsdcAtomic(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new RangeError(`priceCents must be a non-negative integer, got ${cents}`);
  }
  return (BigInt(cents) * 10_000n).toString();
}

export interface GatewayConfig {
  /** Solana address that receives settlement. */
  readonly solanaPayTo: string;
  /** Optional Base address, if EVM settlement is also offered. */
  readonly basePayTo?: string;
  readonly facilitatorUrl: string;
  readonly facilitatorApiKey?: string;
  readonly baseUrl: string;
  readonly network?: NetworkId;
  readonly maxTimeoutSeconds?: number;
}

/** Build the 402 body advertising every network we can settle on. */
export function buildPaymentRequired(
  resource: PricedResource,
  config: GatewayConfig,
): PaymentRequired {
  const amount = centsToUsdcAtomic(resource.priceCents);
  const url = new URL(resource.path, config.baseUrl).toString();
  const timeout = config.maxTimeoutSeconds ?? 300;

  const accepts: PaymentOption[] = [
    {
      scheme: 'exact',
      network: config.network ?? NETWORKS.solanaMainnet,
      amount,
      asset: USDC_SOLANA_MAINNET,
      payTo: config.solanaPayTo,
      resource: url,
      description: resource.description,
      mimeType: resource.mimeType,
      maxTimeoutSeconds: timeout,
    },
  ];

  if (config.basePayTo) {
    accepts.push({
      scheme: 'exact',
      network: NETWORKS.base,
      amount,
      asset: USDC_BASE,
      payTo: config.basePayTo,
      resource: url,
      description: resource.description,
      mimeType: resource.mimeType,
      maxTimeoutSeconds: timeout,
    });
  }

  return {
    x402Version: 2,
    error: 'X-PAYMENT header is required to access this resource',
    accepts,
  };
}

export interface VerifyResult {
  readonly valid: boolean;
  readonly reason?: string;
  readonly payer?: string;
  readonly txHash?: string;
}

/**
 * Verify a signed payment payload with the configured facilitator.
 *
 * Fails CLOSED. A facilitator that is unreachable, slow, or returning garbage
 * results in `valid: false` — never in a resource being served for free, and
 * never in a fabricated success.
 */
export async function verifyPayment(
  paymentHeader: string,
  option: PaymentOption,
  config: GatewayConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifyResult> {
  if (!paymentHeader) {
    return { valid: false, reason: 'missing X-PAYMENT header' };
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(
      typeof atob === 'function'
        ? atob(paymentHeader)
        : Buffer.from(paymentHeader, 'base64').toString('utf8'),
    );
  } catch {
    return { valid: false, reason: 'X-PAYMENT header is not valid base64 JSON' };
  }

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (config.facilitatorApiKey) {
    headers.authorization = `Bearer ${config.facilitatorApiKey}`;
  }

  let res: Response;
  try {
    res = await fetchImpl(config.facilitatorUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        x402Version: 2,
        paymentPayload: decoded,
        paymentRequirements: option,
      }),
    });
  } catch (err) {
    return {
      valid: false,
      reason: `facilitator unreachable: ${(err as Error).message}`,
    };
  }

  if (!res.ok) {
    return { valid: false, reason: `facilitator returned HTTP ${res.status}` };
  }

  let body: { isValid?: boolean; valid?: boolean; payer?: string; transaction?: string; invalidReason?: string };
  try {
    body = (await res.json()) as typeof body;
  } catch {
    return { valid: false, reason: 'facilitator returned non-JSON' };
  }

  const ok = body.isValid === true || body.valid === true;
  if (!ok) {
    return { valid: false, reason: body.invalidReason ?? 'facilitator rejected payment' };
  }

  return { valid: true, payer: body.payer, txHash: body.transaction };
}
