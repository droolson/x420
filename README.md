# X420

**Evidence-linked medical cannabis companion for Solana Seeker — and an x402 payment gateway at x420.org.**

Built by a founder with a spinal cord injury who uses medical cannabis. That
history is why this project exists, and it's also why X420 refuses to overstate
what cannabis can do. You deserve the truth more than you deserve a good story.

---

## What makes this different

Most cannabis apps rank products by marketing copy and vibes. X420 ranks them by
**published clinical evidence, with the citation attached and the strength labelled.**

Every therapeutic statement is bound to the **NASEM 2017 consensus review** or an
**FDA approval**, and carries an evidence tier that sets a hard ceiling on how
strongly the UI is allowed to phrase it:

| Tier | X420 is allowed to say |
|---|---|
| conclusive / substantial | "is effective for" |
| moderate | "may improve" |
| limited | "has been studied for, with limited evidence for" |
| insufficient | *refuses to rank products at all* |

**Glaucoma is Florida-qualifying and X420 still refuses to rank products for it**,
because the evidence doesn't support it. Legal ≠ supported, and X420 always shows
you that gap.

**Spinal cord injury — the founder's own condition — is tiered `limited`, not
higher.** There's no good evidence that cannabis restores motor function, and
there's a unit test that fails if anyone ever softens that.

## Architecture

```
packages/core           evidence KB, product matching, legal guardrails
packages/ommu           Florida OMMU public-records ingest (777 locations)
packages/x402-gateway   x402 publisher-side payment gateway (Solana + Base USDC)
workers/api             Cloudflare Worker API — free tier + metered tier
dapp-store/             Solana dApp Store publishing config
scripts/                publishing pipeline, citation verification
docs/COMPLIANCE.md      read this before adding a feature
```

## Data: real, public, timestamped

Source: **Florida Office of Medical Marijuana Use** public records
(<https://knowthefactsmmj.com/mmtc/>).

Verified live on 2026-08-25:

```
MMTC licensees : 28
Locations      : 777
Counties       : 47
Orange County  : 51   (Orlando)
```

Every API response carries `source.url` and `source.retrievedAt`. The ingest
**refuses to overwrite a good snapshot with a suspiciously small parse**, so an
upstream redesign degrades to "stale but honest", never "confidently empty".

## Payments: x402, and what it does *not* pay for

X420 implements the **x402 protocol** (open spec, Linux Foundation x402 Foundation,
Solana settlement in v2) to meter **data and software access**.

X420 does **not** and will not process payment for cannabis product. Cannabis is
federally Schedule I; Florida requires in-person dispensing at a licensed MMTC.
There is no compliant "buy weed with crypto" path today, and shipping one would end
the company. Full reasoning in [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md).

**The patient-facing app is free.** Revenue comes from machines — agents,
integrators, researchers — not from patients.

| Resource | Price |
|---|---|
| `/v1/agent/match` | $0.01 |
| `/v1/agent/dispensaries` | $0.01 |
| `/v1/dataset/evidence` | $0.25 |
| `/v1/dataset/ommu-snapshot` | $0.50 |

Verification **fails closed**: an unreachable, slow, or malformed facilitator
response yields `valid: false`, never a free resource and never a fabricated success.

## Privacy

- Condition selection stays **on-device**. `/v1/match` is stateless and retains nothing.
- **No PHI on any server.** X420 is not a HIPAA covered entity and intends to stay that way.
- No wallet address is ever stored linked to a medical condition.

## Develop

```bash
pnpm install
pnpm test          # 41 tests
pnpm --filter @x420/api dev
```

## Status — honest

| Piece | State |
|---|---|
| Evidence KB + matching + guardrails | ✅ built, 41 tests green |
| OMMU ingest | ✅ verified against live data |
| x402 gateway logic | ✅ built and tested (mocked facilitator) |
| Worker API | ✅ written, needs KV id + treasury address to deploy |
| dApp Store config | ✅ written, needs APK + funded keypair |
| Android/Seeker app | ⬜ not built |
| Live dispensary menus | ⬜ blocked — no public API, needs partner agreements |
| x402 mainnet settlement | ⬜ untested against a real facilitator |

## Licence

AGPL-3.0-or-later. Health tooling that people rely on should be inspectable by the
people relying on it.
