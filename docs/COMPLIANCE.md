# X420 Compliance Posture

This document exists because the difference between "coolest crypto app ever" and
"federal problem" is a set of decisions made deliberately, in writing, before launch.

Read this before adding a feature. If a proposed feature contradicts this
document, the feature is wrong — not the document.

---

## 1. What X420 is

X420 is an **information and discovery tool** for medical cannabis patients, plus a
**general-purpose x402 payment gateway** for software and data.

## 2. What X420 is not

- **Not a dispensary.** We do not sell, stock, broker, deliver, or take orders for cannabis.
- **Not a medical device.** We do not diagnose, treat, cure, or prevent any disease.
  We do not make product-specific therapeutic claims.
- **Not a payment processor for cannabis product.** See §4 — this is the big one.
- **Not a prescriber.** Only a Florida-qualified physician can enter you in the registry.

---

## 3. Medical claims — the evidence ceiling

Every therapeutic statement in X420 is bound to a citation and an evidence tier
drawn from the **NASEM 2017 consensus review** or an **FDA approval**. The tier
sets a hard ceiling on phrasing (`packages/core/src/guardrails.ts`):

| Tier | Permitted verb |
|---|---|
| conclusive / substantial | "is effective for" |
| moderate | "may improve" |
| limited | "has been studied for, with limited evidence for" |
| insufficient | "does not have sufficient evidence to support use for" |

**The system refuses rather than overstates.** `matchProducts()` throws
`InsufficientEvidenceError` for any condition at the `insufficient` tier — glaucoma
is the live example, and it is *Florida-qualifying*. Legal to treat ≠ supported by
evidence, and X420 always shows the gap.

The founder's own indication — spinal cord injury — is tiered **`limited`**, not
higher. There is no good evidence that cannabis restores motor function, and X420
does not make that claim. This is enforced by a unit test
(`packages/core/test/match.test.ts`), so it cannot be quietly softened later.

## 4. Payments — why we do not touch cannabis money

Cannabis is **Schedule I** under the federal Controlled Substances Act. Processing
payment for a cannabis sale can implicate:

- **21 U.S.C. § 841 / § 843(b)** — facilitating a controlled-substance transaction
- **18 U.S.C. § 1956–1957** — money laundering, where proceeds are traceable to a
  Schedule I sale
- **31 U.S.C. § 5318** — BSA/AML obligations for money services businesses
- **FinCEN BSA Expectations Regarding Marijuana-Related Businesses (FIN-2014-G001)**

Florida additionally requires dispensing to occur **in person at a licensed MMTC**
to a cardholder. There is no compliant "pay for weed with crypto in an app" path
today, and shipping one would be the fastest way to lose the company.

**Therefore: the X420 x402 gateway meters DATA AND SOFTWARE ACCESS ONLY.**

| Priced | Not priced, not ever |
|---|---|
| API calls by agents/integrators | Cannabis product |
| Dataset exports (OMMU snapshot, evidence KB) | Dispensary carts or orders |
| Premium matching for third-party apps | Delivery or reservations |

The patient-facing app is **free**. A person with a Registry card pays nothing to
find a dispensary or read the evidence. Revenue comes from machines, not patients.

If X420 ever wants dispensary-side revenue, the compliant route is a **SaaS
licence billed to the MMTC in fiat** — never per-transaction on product.

## 5. Data provenance

- **Source:** Florida OMMU public records, <https://knowthefactsmmj.com/mmtc/>
- **Nature:** published public records of the Florida Department of Health
- **Handling:** parsed, normalised, timestamped. Every response carries
  `source.url` and `source.retrievedAt`.
- **Guarantee:** we never present stale data as fresh, and the ingest **refuses to
  overwrite a good snapshot with a suspiciously small parse** (see
  `refreshSnapshot()`), so an upstream redesign degrades to "stale but honest"
  rather than "confidently empty".

We use the agency's own dataset rather than scraping dispensary menus, because
menu scraping against Dutchie/Jane/Weedmaps ToS is both legally fragile and
technically brittle. Menu integration, when it comes, comes through **signed
partner agreements** (see §7).

## 6. PHI and privacy

X420 stores **no protected health information on any server**.

- Condition selection stays **on-device**. The `/v1/match` endpoint is stateless:
  the client sends products and a condition id, gets a ranking, and nothing is retained.
- We are **not a HIPAA covered entity** and intend to stay that way. The moment we
  hold patient records we inherit an obligation we are not staffed for.
- No wallet address is ever linked to a medical condition in storage. On Seeker,
  the wallet signs payments for API access, never for a health query.

## 7. Dispensary menu data — the honest status

There is **no free, public, global dispensary menu API**. Verified 2026-08-25:

- **Dutchie Plus** — paid, per-retailer API key, and Dutchie has announced a
  **2026 sunset** of the Plus headless commerce API
- **Jane (I Heart Jane)** — partner/business agreement required
- **Weedmaps** — partner programme, not self-serve
- Third-party scrapers exist on Apify but operate against platform ToS

**X420's position:** ship on the OMMU public dataset (777 locations, 28 licensed
MMTCs, verified) and pursue signed partner access for live menus. Any product data
in X420 is either (a) supplied by the caller, (b) from a licensed partner feed, or
(c) absent. We do not scrape, and we do not fabricate inventory.

## 8. Required disclosures

`requireDisclosure()` returns a versioned block covering: not-medical-advice,
Florida legal status, no-interstate-transport, and crypto risk. `assertDisclosed()`
throws if a recommendation payload would ship without it. Every API response that
carries a recommendation carries the block.

## 9. Age gating

Florida medical cannabis is available to qualified patients including minors via
caregivers. The X420 app gates at **18+** for direct use and directs minors'
caregivers to the caregiver flow. dApp Store metadata declares the app as
**Mature / 17+** and as health-information software, not a cannabis marketplace.

## 10. Open questions for counsel

These are flagged honestly rather than assumed away:

1. Does metering a **cannabis-adjacent information API** in USDC create any
   MSB/BSA exposure, given no cannabis product is ever transacted?
2. Does the AGPL-3.0 licence create obligations for MMTC partners who self-host?
3. Is state-by-state expansion (each with its own registry rules) better as one
   entity or per-state subsidiaries?
4. Does the SKR ecosystem-rewards integration constitute a security offering in any
   jurisdiction where X420 markets?

**Do not launch payments to the public until 1 and 4 have written answers.**
