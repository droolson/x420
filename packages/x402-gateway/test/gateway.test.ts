import { describe, it, expect } from 'vitest';
import {
  buildPaymentRequired,
  centsToUsdcAtomic,
  findResource,
  verifyPayment,
  CATALOGUE,
  NETWORKS,
  USDC_SOLANA_MAINNET,
  type GatewayConfig,
  type PaymentOption,
} from '../src/index.js';

const config: GatewayConfig = {
  solanaPayTo: 'AQqn8vFJmMBpFN8p5cvcCC2GjJvXKmWJKJ6hkxpXHkQ1',
  facilitatorUrl: 'https://facilitator.example/verify',
  baseUrl: 'https://x420.org',
};

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64');

describe('pricing arithmetic', () => {
  it('converts cents to USDC atomic units', () => {
    expect(centsToUsdcAtomic(1)).toBe('10000');
    expect(centsToUsdcAtomic(50)).toBe('500000');
    expect(centsToUsdcAtomic(100)).toBe('1000000');
    expect(centsToUsdcAtomic(0)).toBe('0');
  });

  it('rejects fractional or negative cents', () => {
    expect(() => centsToUsdcAtomic(1.5)).toThrow(RangeError);
    expect(() => centsToUsdcAtomic(-1)).toThrow(RangeError);
  });
});

describe('402 construction', () => {
  it('advertises Solana by default', () => {
    const r = findResource('/v1/agent/match')!;
    const body = buildPaymentRequired(r, config);
    expect(body.x402Version).toBe(2);
    expect(body.accepts).toHaveLength(1);
    expect(body.accepts[0]!.network).toBe(NETWORKS.solanaMainnet);
    expect(body.accepts[0]!.asset).toBe(USDC_SOLANA_MAINNET);
    expect(body.accepts[0]!.amount).toBe('10000');
    expect(body.accepts[0]!.resource).toBe('https://x420.org/v1/agent/match');
  });

  it('advertises Base as a second option when configured', () => {
    const r = findResource('/v1/dataset/ommu-snapshot')!;
    const body = buildPaymentRequired(r, { ...config, basePayTo: '0xabc' });
    expect(body.accepts).toHaveLength(2);
    expect(body.accepts.map((a) => a.network)).toContain(NETWORKS.base);
    expect(body.accepts.every((a) => a.amount === '500000')).toBe(true);
  });

  it('has a resource entry for every catalogue path', () => {
    for (const r of CATALOGUE) {
      expect(findResource(r.path)).toBeDefined();
      expect(r.priceCents).toBeGreaterThan(0);
      expect(Number.isInteger(r.priceCents)).toBe(true);
    }
  });
});

describe('payment verification fails closed', () => {
  const option: PaymentOption = buildPaymentRequired(
    findResource('/v1/agent/match')!,
    config,
  ).accepts[0]!;

  it('rejects a missing header', async () => {
    const r = await verifyPayment('', option, config);
    expect(r.valid).toBe(false);
    expect(r.reason).toContain('missing');
  });

  it('rejects a malformed header', async () => {
    const r = await verifyPayment('!!!not-base64!!!', option, config);
    expect(r.valid).toBe(false);
  });

  it('rejects when the facilitator is unreachable', async () => {
    const boom = (async () => {
      throw new Error('ECONNREFUSED');
    }) as unknown as typeof fetch;
    const r = await verifyPayment(b64({ sig: 'x' }), option, config, boom);
    expect(r.valid).toBe(false);
    expect(r.reason).toContain('unreachable');
  });

  it('rejects on facilitator HTTP error', async () => {
    const f = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
    const r = await verifyPayment(b64({ sig: 'x' }), option, config, f);
    expect(r.valid).toBe(false);
    expect(r.reason).toContain('500');
  });

  it('rejects on non-JSON facilitator response', async () => {
    const f = (async () => new Response('<html>', { status: 200 })) as unknown as typeof fetch;
    const r = await verifyPayment(b64({ sig: 'x' }), option, config, f);
    expect(r.valid).toBe(false);
    expect(r.reason).toContain('non-JSON');
  });

  it('rejects when the facilitator says invalid', async () => {
    const f = (async () =>
      Response.json({ isValid: false, invalidReason: 'insufficient_funds' })) as unknown as typeof fetch;
    const r = await verifyPayment(b64({ sig: 'x' }), option, config, f);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('insufficient_funds');
  });

  it('accepts a valid settlement and surfaces the receipt', async () => {
    const f = (async () =>
      Response.json({
        isValid: true,
        payer: 'PayerAddr111',
        transaction: 'sigABC',
      })) as unknown as typeof fetch;
    const r = await verifyPayment(b64({ sig: 'x' }), option, config, f);
    expect(r.valid).toBe(true);
    expect(r.payer).toBe('PayerAddr111');
    expect(r.txHash).toBe('sigABC');
  });
});
