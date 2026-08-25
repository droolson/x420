# X420: How to Get Cannabis Dispensary Product Menu Data — Legitimately and Durably

**Prepared:** August 2026 · **Scope:** United States · **Status:** Research memo, not legal advice

---

## 0. Executive Summary — The Honest Answer

Your founder wants "an API that aggregates product data from every dispensary website."

**That product cannot be built legitimately and durably as a scraping operation.** Not because scraping is
categorically illegal — it usually isn't, under federal anti-hacking law — but because of a specific
architectural fact I verified empirically during this research:

> **Every major dispensary menu sits behind an age gate that is a clickwrap contract.**

On `dutchie.com/dispensary/<store>/products/flower` the interstitial reads, verbatim (captured live):

> "Are you at least 21 years old or a valid medical patient? By selecting 'Yes', you confirm that you are
> of legal age or a valid medical patient and **agree to our Terms and Privacy Policy**." → [YES] [NO]

This is the difference between the good scraping caselaw and the bad scraping caselaw. The cases that
protect scrapers — *hiQ*, *Meta v. Bright Data* — protect **logged-out, no-assent** access to public pages.
Cannabis is the one vertical where regulation has forced a mandatory affirmative click in front of
essentially all product content. To reach a dispensary menu you must click a button that says you agree
to the terms. That is the exact fact pattern that **lost** for hiQ ($500K judgment + permanent injunction)
and won for Meta against everyone who clicked through.

**This is my inference, not settled law** — I found no cannabis-specific scraping case on point, and it is
a genuinely contestable position (see §4.6 for the counterargument). But it converts scraping cannabis
menus from "probably fine" into "materially riskier than scraping the open web," and it is a bad bet for a
company that intends to be acquired or raise institutional money.

**The good news:** the specific data you actually need — potency, terpene profiles, COAs — is *better*
obtained from government open data than from menus, and it is free, permissively licensed, and legally
unimpeachable. I verified two such sources hands-on during this research (§3). Menu **price and
availability**, which genuinely only exists on menus, should be **licensed** from a vendor with published
pricing (from $500/mo) rather than scraped.

**Recommended path:** Open data for the chemistry (free, defensible, and a genuine moat in Florida) →
licensed vendor API for price/availability → per-retailer partner integrations as you gain leverage.
Budget roughly $500–$2,000/month at seed stage. Do not scrape at scale.

---

## 1. Official Platform APIs

The single most important structural fact: **every cannabis commerce API in the US is retailer-consented,
not developer-open.** There is no Stripe-style self-serve signup anywhere in this category. In every case
the retailer authorizes *you* as their integration partner, and the credential is scoped to that retailer.

This means: **"aggregate every dispensary" is not an API problem, it is a business-development problem.**
You need N signed retailers, not one API key.

| Platform | Public API? | Access requires | Cost | 2026 status |
|---|---|---|---|---|
| **Dutchie Plus** | GraphQL, partner-gated | Per-retailer Bearer key via Dutchie ecommerce agreement | Quote-based enterprise | ⚠️ **Sunsetting.** Support through end of 2026 |
| **Dutchie E-Commerce Pro** | No raw data API | Certified-partner agency status; React/TS Extensions SDK only | Platform subscription | Successor to Plus; presentation-layer only |
| **Jane (I Heart Jane) Roots** | REST + Algolia, partner-gated | Must already be a Jane partner; creds via partner success rep | Bundled in Ecommerce Headless tier | Active. Best-documented in category |
| **Weedmaps Menu API** | Yes, documented, partner-gated | Application → approval → beta; **listing owner must select you as POS provider** | Not published | Active; v2025-07+ uses Menu IDs |
| **Leafly Menu Integration** | Yes, V2, partner-gated | Paid Leafly for Retailers sub; POS providers integrate free via Partner Ops | ~hundreds–thousands/mo (retailer side); no per-call fee | Active |
| **Treez** | Yes, well-documented | Partner application + certification; self-signed JWT | Not published | Active. Cleanest auth model |
| **Flowhub** | Yes (Stoplight portal) | Flowhub support issues key + Client ID + **Location ID per dispensary** | Not published | Active |
| **BLAZE Partner API** | Yes | Partner Key + Developer Key; retailer generates dev key per shop | Not published | Active |
| **Meadow** | Yes, OpenAPI + sandbox | Org-issued client API keys w/ scoped permissions | Not published | Active |
| **Alpine IQ / springbig** | Loyalty/CRM, not menu | Tenant-scoped credentials | N/A | ❌ **Wrong tool** — customer data, not product catalog |

### 1.1 The Dutchie Plus sunset

Dutchie has communicated that **legacy Dutchie Plus support runs through the end of 2026**, with
E-Commerce Pro as the migration path. Multiple independent sources corroborate this (Meadow, Heady,
Bud Authority, Tarasovs, APIs.io).

**Two caveats on the evidence.** First, most of these sources are agencies selling migration services —
they have a commercial interest in urgency. Bud Authority explicitly disclaims: *"does not represent Dutchie
and cannot warrant any specific sunset date."* Second, sources disagree on specifics (early-2025 deprecation
notice vs. end-of-2026 support end).

**What is well-corroborated:** Plus is being wound down, end-of-2026 is the operative public date, and
Pro is *not* a headless replacement — it is a managed platform with a presentation-layer extension SDK.

**Strategic read:** Dutchie is closing its headless surface, not opening it. Betting X420's data layer on
Dutchie Plus would be building on a platform with a published end date. **Do not build on Dutchie Plus.**

### 1.2 What this means for you

Weedmaps' flow is the clearest illustration and it generalizes: *"To access a Listing's Menu via the API,
the **Listing Owner must grant your integration access**. They can do this by logging into their Weedmaps
account and selecting your platform as their POS provider."*

You cannot unilaterally obtain menu data through any official channel. **N retailers = N consent events.**
That is the durable path, and it is slow. It is also the only path that survives diligence.

---

## 2. Data Vendors — Buy the Menu Layer

This is the mature, boring, correct answer for price and availability. These companies have already done
the aggregation, carry the legal risk, and sell you a clean feed.

| Vendor | What they sell | Data foundation | Price (published where available) | API? |
|---|---|---|---|---|
| **CannMenus** | Menu/product/pricing across US+CA | Aggregates Weedmaps, Leafly, Dutchie, Jane menus | **$500/mo** API (3 states); **$2,000/mo** nationwide flat, 250K req/mo, 60 rpm; Pro $800/state/mo | ✅ REST, documented, self-serve |
| **Headset** | POS-verified transactions + menu layer | ~3,500–4,000 direct POS integrations + ~7,000 e-comm endpoints | Retailer free–$250/mo; Bridge from $25/mo; Insights custom | ✅ Vault via Snowflake |
| **Hoodie Analytics** | Store-level distribution/velocity | ~10,000 retailers, ~9M SKUs, menu mining + POS/ERP | Demo-required, per-module | Not clearly published |
| **BDSA** | Market sizing, forecasts, consumer | POS panel + surveys + menu layer | Custom; ~$3,500 one-time reports | Via GreenEdge |
| **Pistil Data** | Menu analytics, store-level | Menu mining | No published pricing (3P est. $1,200–3,500/state/mo — treat as unverified) | ✅ Pistil Cloud |
| **Cannabis Benchmarks** | **Wholesale** price benchmarks | Price reporting agency | **$80/mo** CORE; **$150/mo** Premium; ~$1,500/yr | Enterprise data feeds |
| **Brightfield Group** | Consumer insights | Surveys | Not verified | Unverified |

**CannMenus is the standout for X420.** Published pricing, self-serve signup, documented REST API,
explicitly multi-platform, and their own marketing pitch is literally *"Skip the scraping. Build with real
data."* At $500/mo for 3 states or $2,000/mo nationwide, it is cheaper than one engineer-week per month
of maintaining scrapers that break constantly.

**Caveat worth naming:** CannMenus aggregates from Weedmaps/Leafly/Dutchie/Jane menus. I could not verify
whether that upstream collection is licensed or scraped. If scraped, you are buying laundered risk — you
gain a contractual indemnity counterparty and remove your own direct exposure, but the supply could be
disrupted if an upstream platform enforces. **Ask for their data provenance and an indemnity clause in
writing before signing.** This is a due-diligence question, not a dealbreaker.

**Note:** Cannabis Benchmarks is *wholesale* pricing — useful for market context, **not** a substitute for
retail menu data. Don't confuse the two.

---

## 3. Public and Open Data — Your Actual Moat ⭐

**This is the most valuable and most under-exploited finding in this report.** I verified both sources
hands-on rather than taking documentation at face value.

### 3.1 Florida COA dataset — VERIFIED, and it is remarkable

**Source:** `cannlytics/cannabis_results` on Hugging Face · **License: CC-BY-4.0** · Updated Feb 2026

I downloaded and parsed the Florida subset directly (`data/fl/fl-results-latest.csv`, 305 MB):

```
ROWS:            16,309 Florida COA records
COLUMNS:         79
DATE RANGE:      2019-06-14 → 2024-10-05
                 (2023: 6,711 · 2024: 7,781 — recent years dominate)
LABS:            Kaycha Labs (12,625), TerpLife Labs (3,683)
PRODUCERS:       38 distinct (Trulieve, MÜV, Curaleaf-linked sites, etc.)
PRODUCT TYPES:   Derivative, Flower, Flower Inhalable, Edible, Derivative Inhalable

FIELD COVERAGE:
  total_thc         15,713 / 16,309  (96.3%)
  results (JSON)    15,772           (96.7%)
  total_cbd         13,786           (84.5%)
  total_terpenes    12,590           (77.2%)
  strain_name       16,304           (99.97%)
  batch_number      16,308           (99.99%)
  coa_pdf           16,309           (100%)
```

A single verified record carries **158 discrete analytes**:

```json
{"product": "MPX RNTZ-GR 1-2 Star Bubble Hash 1.0 g", "strain": "RNTZ",
 "total_thc": 67.378, "total_cbd": 0.174, "total_terpenes": 4.146,
 "lab": "Kaycha Labs", "date_tested": "2023-12-27",
 "results": [
   {"key": "delta_9_thc", "value": 0.996}, {"key": "thca", "value": 75.693},
   {"key": "cbd", "value": "ND"},          {"key": "cbda", "value": 0.199},
   {"key": "delta_8_thc", "value": 0.122}, {"key": "cbg", "value": 0.277},
   {"key": "cbn", "value": 0.032},         {"key": "thcv", "value": "ND"},
   {"key": "beta_caryophyllene", "value": 0.83, "units": "percent"}, ...]}
```

Plus per-sample pass/fail status for pesticides, heavy metals, microbes, mycotoxins, residual solvents,
foreign matter, water activity, and moisture.

**This is exactly the data your task brief asked for — strain names, THC/CBD potency, terpene profiles,
and COAs — for Florida, free, and under a license that explicitly permits commercial use with attribution.**

The upstream is Kaycha's public COA portal (`yourcoa.com`), whose **robots.txt is `Disallow:` (empty —
nothing disallowed)**, verified directly. Labs publish COAs publicly *by design* so patients can verify
products. Refreshing this data is a fundamentally different legal posture from scraping a retail menu:
no age gate, no clickwrap, no contract, and an affirmative regulatory purpose in publication.

**Caveat:** data ends October 2024 (~10 months stale as of this writing). You would need to build your own
refresh pipeline against the lab portals to stay current. That is real engineering work — but it is
*defensible* engineering work, which scraping menus is not.

### 3.2 Connecticut Product Registry — VERIFIED, best-structured in the US

**Source:** `data.ct.gov/resource/egd5-wb6r.json` (Socrata) · **Verified: 35,311 records**, live API, no key
required for reasonable volumes.

Live-fetched sample record:

```json
{"brand_name": "(I-Side) BUDR D Inferno x SBC Dual Chamber Vape 4803",
 "dosage_form": "Vape Cartridge", "producer": "DXR FINANCE 3, LLC",
 "tetrahydrocannabinol_thc": "85.94", "cannabidiols_cbd": "0",
 "cbg": "2.87", "cannbinol_cbn": "1.10", "tetrahydrocannabivarin_thcv": "0.90",
 "a_pinene": "0", "b_myrcene": "0", "b_caryophyllene": "0", "limonene": "0",
 "linalool_lin": "0", "humulene_hum": "0", "ocimene": "0",
 "chemotype": "High THC - Low CBD", "national_drug_code": "C0040000803",
 "lab_analysis": {"url": "https://elicense.ct.gov/.../ViewPublicLookupDocument.aspx?..."},
 "product_image": {...}, "label_image": {...}}
```

Government-published, individually-named terpenes as first-class columns, **direct links to COA PDFs,
product images, and label images**, plus NDC codes for cross-referencing. This is a US-government open
data source with zero legal ambiguity, and it is the single cleanest cannabis product dataset I found.

### 3.3 Other public sources

- **Massachusetts CCC Open Data** — downloadable test-result datasets (THC, THCA, heavy metals, yeast/mold)
  sourced from Metrc, post-April-2021, with a published data dictionary.
- **Washington LCB CCRS** — public-facing production and preproduction reporting environments.
- **Cannlytics other states** — CA (~71K), MD (~105K), MI (~90K), NV (~153K), MA (~75K), CO (~26K),
  CT (~20K), HI (~13K) records. *(Counts from the dataset card; I verified FL directly, not these.)*

### 3.4 Metrc / BioTrack — do not plan on these

Metrc holds everything you want (packages, lab tests/COAs, transfers, retail sales) but is **structurally
closed to you**:

- Two-key HTTP Basic auth: **vendor key + per-licensee user key**. You need each dispensary to hand you
  their key.
- Per-state API instances (`api-ca`, `api-co`, …) — every state is a separate integration.
- Sandbox is paywalled to the Custom tier.
- Independently graded **F** for third-party accessibility.

Metrc is a compliance rail, not a data source. **It is not a route to menu data for X420.** Same for BioTrack.

**Florida specifically:** OMMU publishes licensed MMTC locations and certified lab lists (which you already
have), and weekly aggregate dispensing volumes — but **no product-level menu or potency database**. Florida's
product chemistry reaches the public through **lab COA portals**, not the state. That is precisely why §3.1
matters so much for your Florida-first product.

---

## 4. The Scraping Question — Rigorous and Honest

### 4.1 What is SETTLED

**Violating terms of service is not a federal crime.** *Van Buren v. United States*, 593 U.S. ___ (2021)
adopted a **"gates-up-or-down"** reading of the CFAA: you either can or cannot access a system. Improper
*purpose* for data you're otherwise allowed to see is not a CFAA violation. The Court explicitly worried
that the government's reading would "criminalize everything from embellishing an online-dating profile to
using a pseudonym on Facebook."

**Scraping public web pages is not "unauthorized access" under the CFAA.** *hiQ Labs v. LinkedIn*,
31 F.4th 1180 (9th Cir. 2022): where a site "generally permits public access to its data," automated
collection is not access "without authorization."

**Facts are not copyrightable.** *Feist Publications v. Rural Telephone*, 499 U.S. 340 (1991) killed the
"sweat of the brow" doctrine. THC percentages, prices, and strain names are **facts**. A menu's *selection
and arrangement* may attract "thin" copyright; the underlying numbers do not. Product *descriptions* and
*photographs*, however, are original expression and **are** protected — do not copy them.

### 4.2 What is SETTLED, and cuts AGAINST you

**Terms prohibiting scraping are enforceable as contracts.** This is the half of *hiQ* that gets forgotten.
On remand (N.D. Cal., Nov. 4 2022), Judge Chen granted LinkedIn summary judgment on breach of contract,
holding the User Agreement "unambiguously prohibits hiQ's scraping and unauthorized use of the scraped
data," and rejecting hiQ's unconscionability defense.

**December 2022 consent judgment: $500,000 against hiQ, plus a permanent injunction, plus destruction of
source code, data, and algorithms — and established liability for trespass to chattels and
misappropriation. hiQ, the company that "won" the landmark pro-scraping case, shut down.**

That is the actual precedent your founder needs to understand. Winning on the CFAA and losing the company
on contract is the modal outcome for aggressive scrapers.

### 4.3 What is CONTESTED

**Whether terms bind a scraper who never assented.** *Meta Platforms v. Bright Data* (N.D. Cal.,
Jan. 23 2024, Judge Chen — same judge as hiQ): Meta's terms "do not bar logged-off scraping of public data;
perforce it does not prohibit the sale of such public data." Bright Data won even though it *had* accounts,
because its logged-out scraping was "unrelated to the purpose of its accounts." *X Corp. v. Bright Data*
(May 2024) dismissed similar claims.

**Browsewrap vs. clickwrap.** Bare browsewrap (a footer link) is generally unenforceable. Ninth Circuit
rule: absent actual knowledge, enforceable only with (1) reasonably conspicuous notice, **and** (2) an
action unambiguously manifesting assent. **Clickwrap — clicking a button next to "you agree to our
Terms" — is routinely enforced.**

**Whether a cease-and-desist plus IP block re-closes the gate.** *Craigslist v. 3Taps*, 942 F. Supp. 2d 962
(N.D. Cal. 2013) held that C&D + IP block was sufficient notice for CFAA purposes. That reasoning sits in
tension with *hiQ*/*Van Buren* and **has not been cleanly resolved.** Circumventing an IP block after a C&D
is the highest-risk act in scraping.

### 4.4 A correction worth flagging

Commentary frequently cites the July 2024 Delaware jury verdict in *Ryanair v. Booking.com* as proof that
scraping is now a CFAA violation. **That verdict was overturned.** The court granted judgment as a matter
of law: Ryanair could not prove the CFAA's $5,000 loss threshold (provable harm ≈ $2,457). The parties
later settled and ended the appeal.

**Do not let anyone scare you with Ryanair — and do not rely on it either.** It also stands for the
uncomfortable proposition that the CFAA can reach extraterritorially, a controversial holding.

### 4.5 What robots.txt actually buys you

**Legally: almost nothing directly.** robots.txt is not a contract and creates no cause of action. Verified
live during this research:

| Site | robots.txt | Reality |
|---|---|---|
| `dutchie.com` | `User-agent: * / Disallow:` (nothing disallowed) | **`/sitemap.xml` returns HTTP 403 via Cloudflare** |
| `yourcoa.com` | `Disallow:` (nothing disallowed) | Accessible ✅ |
| `leafly.com` | Allows most; blocks `GPTBot` broadly | Accessible |
| `iheartjane.com` | — | **Cloudflare block page for robots.txt itself** |
| `weedmaps.com` | — | **"Client Challenge" JS interstitial** |

Note the contradiction: **Dutchie's robots.txt permits everything while its CDN returns 403.** A permissive
robots.txt is *not* permission when the operator blocks you in practice.

**What compliance does buy you:** evidence of good faith. It undercuts "willful," helps on trespass to
chattels (which requires actual impairment), and matters enormously to acquirers and enterprise customers.
It is reputational and equitable insurance, not a legal shield.

### 4.6 Practical risk for a seed-stage company — and the counterargument

The realistic threat is not prosecution. It is:

1. **Cease-and-desist** (most likely first contact)
2. **Permanent IP/CDN blocking** — your product breaks, and this is the *most probable* outcome
3. **Breach-of-contract suit** — the hiQ vector, plausible if you clicked through an age gate
4. **Trespass to chattels** — needs demonstrated server impairment; aggressive crawling supplies it
5. **Commercial death by diligence** — acquirer/investor counsel finds scraping, deal repriced or dies

**The honest counterargument to my age-gate thesis:** a reasonable lawyer could argue an age gate is a
*regulatory compliance* mechanism, not a negotiated commercial agreement; that clicking "I am 21" doesn't
manifest assent to *data-collection* terms; that the terms are unconscionably overbroad; and that
*Bright Data* protects public factual data regardless. **This is a genuinely arguable position.** But it is
an argument you would be making from the defendant's chair, at a cost of six or seven figures, with your
product enjoined in the meantime. hiQ made analogous arguments and lost.

**Bottom line:** *Can we scrape every dispensary site?* — **Not safely at scale.** Not because of the CFAA,
but because of (a) contract exposure via mandatory age-gate clickwrap, (b) verified CDN-level bot walls on
every major platform, and (c) unacceptable diligence risk for a company that wants to be acquired.

**What is comparatively low-risk and worth doing:** collecting **public COA and lab data** (§3), which has
no age gate, no clickwrap, permissive robots.txt, and an affirmative public-health purpose in publication.

---

## 5. Technical Reality of the Embeds

Verified hands-on with a real browser:

**Dutchie:** menus render at `dutchie.com/dispensary/<slug>/...` or via embed script. On direct navigation
the app serves an **age-gate interstitial before any product data loads**. After clicking YES, the only
network calls captured were **Datadog RUM telemetry and LaunchDarkly feature flags** — the product payload
never arrived and the page stayed blank. That is a bot-detection signature: the automation was fingerprinted
and silently starved. `dutchie.com/sitemap.xml` → **HTTP 403 (Cloudflare)**.

**Jane:** architecture is public (**Algolia + REST**), and Jane's own docs publish *demo-environment*
credentials against four fake stores. Production/staging credentials are provisioned per partner. The docs
host and API sit behind Cloudflare — `api.iheartjane.com/jane-api-docs` returned **403**, and even
`iheartjane.com/robots.txt` returned a **Cloudflare block page**.

**Weedmaps:** serves a **"Client Challenge"** JS interstitial with a strict CSP.

**Do the embeds expose JSON endpoints?** Yes — they must, to render. **Are they authenticated and
rate-limited?** Yes: Bearer tokens (Dutchie Plus), Algolia app-id/api-key pairs (Jane), OAuth (Weedmaps),
all behind enterprise bot management (Cloudflare, and a "Client Challenge" on Weedmaps).

**What breaks, continuously:**
- Age gates and consent walls before any data
- Cloudflare/CDN challenges, fingerprinting, and silent starvation (no error — just empty responses)
- Rotating Algolia keys and short-lived tokens
- GraphQL persisted-query hashes that change on every deploy
- Schema drift across thousands of independently-configured stores
- **Dutchie Plus disappearing at end of 2026**

A scraper here is not a fixed cost — it is a permanent, escalating headcount commitment against
well-funded adversaries whose vendors sell bot-blocking as a feature.

---

## 6. Ranked Routes

Ranked by **legitimacy × durability × cost**.

| # | Route | Legitimacy | Durability | Cost |
|---|---|---|---|---|
| 1 | **State open data** (CT Socrata, MA CCC, WA CCRS) | ★★★★★ Government-published | ★★★★★ Statutory | Free |
| 2 | **Public COA / lab datasets** (Cannlytics CC-BY-4.0; lab portals) | ★★★★★ Permissive license | ★★★★☆ Portals can change | Free + pipeline eng. |
| 3 | **Licensed vendor API** (CannMenus, Headset, Pistil) | ★★★★★ Contractual | ★★★★☆ Vendor risk | $500–$2,000/mo |
| 4 | **Direct retailer partnerships** (Treez/Flowhub/BLAZE/Meadow/Jane keys) | ★★★★★ Consented | ★★★★★ Strongest | Free–low; BD-expensive |
| 5 | **Marketplace partner APIs** (Weedmaps, Leafly) | ★★★★☆ Sanctioned | ★★★☆☆ Retailer must elect you | Retailer-side sub |
| 6 | **Dutchie Plus** | ★★★★☆ Sanctioned | ★☆☆☆☆ **Sunsetting EOY 2026** | Enterprise quote |
| 7 | **Scraping public COA portals** | ★★★☆☆ No gate/clickwrap | ★★★☆☆ | Eng. time |
| 8 | **Scraping dispensary menus at scale** | ★☆☆☆☆ Clickwrap + C&D risk | ★☆☆☆☆ Actively blocked | High + legal tail |

---

## 7. Recommended Path for X420

**Phase 1 (Weeks 1–4) — Build the chemistry layer.** Ingest the Cannlytics **Florida** COA dataset (16,309
records, CC-BY-4.0, 158 analytes/sample) and the **Connecticut** registry (35,311 records, live Socrata).
Honor CC-BY attribution. This gives you strain names, potency, full terpene profiles, and COA links —
legally unimpeachable — and it is a genuine differentiator, because **most consumer cannabis apps show a
single THC number and no terpenes at all.** For a *medical* information app, chemistry is the product.

**Phase 2 (Weeks 2–6) — License price/availability.** Trial **CannMenus** ($500/mo, 3 states; $2,000/mo
nationwide). Before signing, get written answers on **data provenance** and an **indemnity clause**. Then
join **Weedmaps** and **Leafly** partner programs (free to POS/tech partners) so retailers can elect you.

**Phase 3 (Months 2–6) — Earn direct access.** Apply to **Treez**, **Flowhub**, **BLAZE**, **Meadow**, and
**Jane** partner programs. Each retailer that adopts X420 can authorize you directly. This compounds:
**every retailer relationship is an asset a scraper can never own.**

**Phase 4 (Ongoing) — Build the Florida COA refresh pipeline.** This is your moat. Florida publishes no
product-level database, so the lab portals are the only current source of Florida product chemistry.
Crawl them **politely** (rate-limited, identified user-agent, robots.txt honored, cached) — they carry no
age gate and no clickwrap.

**What NOT to do:**
- ❌ Build on Dutchie Plus (dead end-of-2026)
- ❌ Scrape dispensary menus behind age gates at scale
- ❌ Circumvent a CDN block or IP ban, ever — especially after a C&D (*3Taps*)
- ❌ Copy product descriptions or photography (*Feist* protects facts, **not** expression)
- ❌ Create accounts to reach gated data (this is precisely how hiQ lost)

**Reframe for the founder:** "every dispensary website" is the wrong target. The right target is
**every dispensary that has agreed to be in X420** — plus a chemistry layer from open data that competitors
scraping menus literally cannot match, because menus don't publish terpene profiles. That is a defensible
company; a scraping operation is a lawsuit with a runway.

---

## 8. Sources

**Legal**
- *Van Buren v. United States*, 593 U.S. ___ (2021) — Cornell LII; Justia; EFF; Kerr (Volokh); Cooley;
  Clifford Chance; Proskauer
- *hiQ Labs v. LinkedIn*, 31 F.4th 1180 (9th Cir. 2022); N.D. Cal. SJ Nov. 4 2022; consent judgment
  Dec. 6 2022 — Morgan Lewis; JD Supra; Eric Goldman blog; Meitar
- *Feist Publications v. Rural Telephone*, 499 U.S. 340 (1991) — BitLaw; Stanford Fair Use; Oyez
- *Meta Platforms v. Bright Data*, No. 3:23-cv-00077-EMC (N.D. Cal. Jan. 23 2024) — Farella Braun + Martel;
  Lowenstein Sandler; Eric Goldman; Proskauer (*X Corp. v. Bright Data*, May 2024)
- *Craigslist v. 3Taps*, 942 F. Supp. 2d 962 (N.D. Cal. 2013)
- *Ryanair v. Booking.com* — verdict July 18 2024; **JMOL overturning it** (Eric Goldman, Mar. 2025); RCFP
- Browsewrap/clickwrap — Quinn Emanuel, *The Legal Landscape of Web Scraping*; Crowell & Moring

**Platforms** — Dutchie support/APIs.io; Meadow, Heady, Bud Authority, Tarasovs (Plus sunset);
`docs.iheartjane.com`; `developer.weedmaps.com`; `weedmaps.com/legal/developer-terms`; Leafly Help Center;
`code.treez.io`; `flowhub.stoplight.io`; `apidocs.blaze.me`; `api-docs.getmeadow.com`; Metrc Connect

**Vendors** — CannMenus pricing/API docs; Headset; Hoodie; BDSA; Pistil; Cannabis Benchmarks;
Headquarters *Cannabis Market Analytics Platforms (2026)*

**Open data (verified hands-on)** — `cannlytics/cannabis_results` (HF, CC-BY-4.0; FL subset downloaded and
parsed); `data.ct.gov/resource/egd5-wb6r.json` (35,311 records, live); MA CCC Open Data; WA LCB CCRS;
`knowthefactsmmj.com`

---

*Research memo prepared for X420 (github.com/droolson/x420). Not legal advice — retain qualified counsel
before adopting any collection strategy. Legal conclusions are labelled SETTLED / CONTESTED / INFERENCE
throughout §4.*
