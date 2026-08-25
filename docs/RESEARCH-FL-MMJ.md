# Florida Medical Marijuana — Regulatory & Market Research Brief
**Prepared for:** X420 (evidence-linked patient information app)
**Research date:** August 25, 2026
**Primary legal sources:** Florida Statutes (2025 compilation), Florida Administrative Code ch. 64-4, Laws of Florida 2025, FL DOH Office of Medical Marijuana Use (OMMU)

> **Legend used throughout:** **[STATUTE]** = law passed by the Legislature · **[RULE]** = DOH agency regulation in the Florida Administrative Code · **[PRACTICE]** = how OMMU actually operates it (agency guidance/website, not binding law) · **⚠️ FLAG** = recently changed, in flux, or internally inconsistent.

---

## 0. Executive summary — the seven things that matter most for the app

1. **There is no statutory list of "50+ qualifying conditions."** The statute names **10 diseases plus 3 categories** (13 paragraphs total). Every "50+ conditions" list online is a *physician marketing interpretation* of the catch-all. Repeating those lists as law would be a factual error. See §1.
2. **Initial certification cannot be done by telehealth. Full stop.** This is a hard statutory bar. Only *renewals* may be telehealth. See §4.
3. **Florida honors no out-of-state medical cards — but the "seasonal resident" pathway is real and is the answer for snowbirds.** See §6.
4. **The dosing/supply rule was replaced by a brand-new permanent rule 64-4.224 effective 8/24/2026 — one day before this brief.** The numbers carried over unchanged, but the rule *added* new provisions. Any cached citation to emergency rule 64ER22-8 is now stale. See §3 and §5.
5. **2026 is a structural rulemaking year.** The Legislature killed DOH's open-ended emergency rulemaking power effective 12/31/2025, forcing ~14 emergency rules through normal APA rulemaking. Roughly half the chapter changed effective date in 2026, and several rules are *still* in flight. Citations need version-pinning. See §5.
6. **Vertical integration means brand == license.** There is no third-party brand market; each MMTC is a closed supply chain. This has direct data-model consequences. See §7.
7. **Adult-use is not coming in 2026.** The successor to Amendment 3 failed to qualify and is now aimed at **2028**. Do not ship "recreational coming soon" messaging. See §5.4.

---

## 1. Qualifying conditions — s. 381.986(2), Fla. Stat.

**[STATUTE]** Source: https://www.flsenate.gov/Laws/Statutes/2025/381.986

A patient must be diagnosed with **at least one** of the following. This is the complete, verbatim statutory list:

| ¶ | Condition |
|---|---|
| (a) | Cancer |
| (b) | Epilepsy |
| (c) | Glaucoma |
| (d) | Positive status for human immunodeficiency virus (HIV) |
| (e) | Acquired immune deficiency syndrome (AIDS) |
| (f) | Posttraumatic stress disorder (PTSD) |
| (g) | Amyotrophic lateral sclerosis (ALS) |
| (h) | Crohn's disease |
| (i) | Parkinson's disease |
| (j) | Multiple sclerosis |
| **(k)** | **"Medical conditions of the same kind or class as or comparable to those enumerated in paragraphs (a)-(j)"** — the catch-all |
| (l) | A terminal condition **diagnosed by a physician other than the qualified physician issuing the physician certification** |
| (m) | Chronic nonmalignant pain |

OMMU restates this same list for patients: https://knowthefactsmmj.com/patients/

### 1.1 ⚠️ FLAG — "50+ conditions" is marketing, not law
Certification-clinic sites publish lists of 50–100 conditions (anxiety, insomnia, ADHD, fibromyalgia, migraines, IBS…). **None of those appear in the statute.** They are physician-side *predictions* about what a doctor might certify under (2)(k). For a patient-facing app, presenting them as "Florida qualifying conditions" is legally wrong and sets false expectations. Recommended framing: *"Florida law names 10 conditions plus three categories. Other conditions may qualify only if a qualified physician documents that they are of the same kind or class — that determination is the physician's, is reviewed by a medical board, and is not guaranteed."*

### 1.2 The "same kind or class" catch-all carries a real documentation burden
**[STATUTE]** s. 381.986(4)(b): if a physician certifies under (2)(k), the physician **must submit to the applicable board within 14 days**:
1. Documentation supporting the opinion that the condition is of the same kind or class as (2)(a)-(j);
2. Documentation that **establishes the efficacy of marijuana as treatment for that condition**;
3. Documentation supporting the opinion that benefits would likely outweigh health risks;
4. Any other documentation required by board rule.

DOH must then forward that documentation to the **Consortium for Medical Marijuana Clinical Outcomes Research** (s. 1004.4351).
Source: https://www.flsenate.gov/Laws/Statutes/2025/381.986

**Product note for X420:** this is a genuine evidence hook. The statute itself conditions catch-all certification on documented efficacy — an evidence-linked app is aligned with the statutory posture, not working around it.

### 1.3 "Chronic nonmalignant pain" is narrower than it sounds
**[STATUTE]** s. 381.986(1)(c) defines it as *"pain that is caused by a qualifying medical condition or that originates from a qualifying medical condition and persists beyond the usual course of that qualifying medical condition."*

**This is not free-standing chronic pain.** It must trace back to a qualifying condition. Apps and clinics that present "chronic pain" as an independent gateway condition are eliding the statutory definition.

### 1.4 Minors
**[STATUTE]** s. 381.986(4)(a)3.: for patients under 18, a **second physician must concur** that benefits outweigh risks.
Smoking for under-18s requires: a terminal diagnosis, physician determination that smoking is the most effective route, **and** concurrence from a **board-certified pediatrician** — s. 381.986(4)(d).
Minors may not purchase; **only a caregiver may purchase** — s. 381.986(6)(f).
**[STATUTE]** s. 381.986(4)(a)4.: a physician **may not** issue a certification (except low-THC cannabis) **to a patient who is pregnant**.

---

## 2. The Medical Marijuana Use Registry (MMUR), ID cards & residency

### 2.1 Who can register
**[STATUTE]** s. 381.986(1)(m): a "qualified patient" is **"a resident of this state"** added to the registry by a qualified physician *and* holding a qualified patient ID card. Residency is structural, not incidental.

**Proof of residency — s. 381.986(5)(b) [STATUTE]:**
- **Adult resident:** valid Florida driver license (s. 322.18) or Florida ID card (s. 322.051).
- **Adult seasonal resident** (who cannot meet the above): **two** documents from a statutory list — deed/mortgage/lease; proof of address from the person they reside with plus that person's statement; utility hookup/work order dated within 60 days; utility bill ≤2 months old; financial-institution mail ≤2 months old; government-agency mail ≤2 months old; or other documentation set by rule.
- **Minor:** certified birth certificate or current Florida K-12 registration record, **and** a parent/legal guardian who meets the adult-resident test.

Names and addresses on documents must match the application. **[PRACTICE]** https://knowthefactsmmj.com/patients/cards/

### 2.2 Card cost, cadence and mechanics
| Item | Value | Authority |
|---|---|---|
| Application fee | **$75** | **[RULE]** 64-4.011(5); **[PRACTICE]** OMMU |
| Card validity | **Expires 1 year after the date of the physician's initial order** | **[RULE]** 64-4.011(5) |
| Renewal cadence | **Annual** | **[RULE]** 64-4.011(8) |
| Renewal timing | 45 days relative to expiration (see ⚠️ below) | **[RULE]** 64-4.011(8) / **[PRACTICE]** OMMU |
| Change/replacement fee | **$15** | **[RULE]** 64-4.011(9); **[PRACTICE]** OMMU |
| Online payment convenience fee | **$2.75** | **[PRACTICE]** OMMU |
| Returned/declined payment fee | **$15** | **[PRACTICE]** OMMU |
| Incomplete-application cure window | **60 days** from DOH notice | **[RULE]** 64-4.011(6) |
| Change of name/address/caregiver | Notify DOH **within 10 days** | **[RULE]** 64-4.011(9) |
| $10 of each fee | Allocated to FAMU Division of Research for minority education re: marijuana | **[STATUTE]** s. 381.986(7)(d) |

Rule text: https://www.flrules.org/gateway/ruleNo.asp?id=64-4.011 · OMMU: https://knowthefactsmmj.com/patients/cards/

**⚠️ FLAG — renewal-window wording conflict.** The **rule** says a patient must submit the renewal "**forty-five (45) days prior to** the card expiration date" (reads as a *deadline*). The **OMMU website** says "Renewal applications **may only be submitted beginning** 45 days prior to your card expiring" (reads as a *window opening*). These are materially different instructions to a patient. **Recommendation:** in-app, surface the OMMU operational phrasing (that is what the Registry actually enforces) but do not state a hard deadline; prompt at ~45 days and again before expiry.

**⚠️ FLAG — processing-time conflict.** OMMU's ID-card page and General FAQ both say online applications average **10 business days**. The OMMU Weekly Update of **August 21, 2026** states **5 business days** for a complete application plus **5 business days** for card printing. The weekly update is the more current figure and is republished weekly. **Recommendation:** do not hardcode; ingest from the weekly update PDF.
Source: https://knowthefactsmmj.com/wp-content/uploads/ommu_updates/2026/082126-OMMU-Update.pdf

**Temporary purchasing authority — [RULE] 64-4.011(7):** if there is no initial physician order at the time of card approval, DOH provides a **temporary verification email** which, printed and shown with a photo ID, can be used to obtain marijuana until the physical card arrives. **[PRACTICE]** OMMU's weekly update confirms approved patients "instantly receive an approval email which can be used to fill an order at an approved MMTC while the physical card is printed and mailed." *This is a good in-app moment — patients frequently believe they must wait for plastic.*

### 2.3 ⚠️ MAJOR CHANGE — new registry gate effective July 27, 2026
**[PRACTICE]** Per OMMU's General FAQ:

> "Beginning **July 27, 2026**, patients will be unable to complete an application (initial or renewal) for their Medical Marijuana Use Registry identification card **if they do not have current or scheduled certifications with open orders** in the Medical Marijuana Use Registry, and **caregivers will be unable to complete an application (initial or renewal) if they are not connected to a valid and active patient**."

Source: https://knowthefactsmmj.com/about/faq/

**Product impact — this is significant and under-reported.** The card application is now *sequenced behind* an active physician certification. A patient who lets their certification lapse cannot renew their card until they see a physician again. Any app onboarding flow that treats "get card" and "see doctor" as parallel tracks is now wrong. Order is: **physician certification with open orders → card application**.

⚠️ Note this appears to be an operational/Registry change announced via OMMU guidance; the corresponding amendment to **Rule 64-4.011 is still pending** (see §5.3). Cite it as OMMU practice, not as codified rule.

---

## 3. THC caps, dose limits and purchase/possession limits

This is the area where wrong numbers do the most patient harm, so each line is separated by instrument.

### 3.1 [STATUTE] — the caps set by the Legislature
Source: https://www.flsenate.gov/Laws/Statutes/2025/381.986

| Limit | Value | Cite |
|---|---|---|
| Max supply per certification | **Three** 70-day supply limits (=210 days) | s. 381.986(4)(f) |
| Max smokable per certification | **Six** 35-day supply limits (=210 days) | s. 381.986(4)(f) |
| Dispensing cap — all forms | No more than a **70-day supply within any 70-day period** | s. 381.986(8)(e)16.b. |
| Dispensing cap — smokable | No more than **one 35-day supply within any 35-day period** | s. 381.986(8)(e)16.b. |
| 35-day smokable ceiling | **2.5 ounces**, unless DOH-approved exception | s. 381.986(8)(e)16.b. |
| **Possession** limit | Not more than a **70-day supply**, or the greater of **4 ounces** of smokable marijuana or a DOH-approved amount, **at any given time** | s. 381.986(14)(a) |
| Original packaging | **All marijuana purchased must remain in its original packaging** | s. 381.986(14)(a) |
| **Edible — total per product** | May not contain **more than 200 mg THC** | s. 381.986(8)(e)8. |
| **Edible — per serving** | A single serving portion may not exceed **10 mg THC** | s. 381.986(8)(e)8. |
| Edible potency variance | May not exceed **15 percent** | s. 381.986(8)(e)8. |

> **⚠️ Do not conflate the two edible numbers.** The **statute** caps the *product* (200 mg total / 10 mg per serving). The **rule** separately caps *daily consumption* at 60 mg/day and 4,200 mg/70 days. They are different instruments regulating different things. Most consumer sites blur them.

### 3.2 [RULE] — Rule 64-4.224, "Dosing and Supply Limits for Medical Marijuana"
**⚠️ EFFECTIVE 8/24/2026 — brand new permanent rule; History–New 8-24-26.**
Rule page: https://www.flrules.org/gateway/ruleNo.asp?id=64-4.224
Certified text: https://www.flrules.org/gateway/readFile.asp?sid=0&tid=31211610&type=1&file=64-4.224.doc
Adoption notice: https://www.flrules.org/Gateway/View_notice.asp?id=31211610

This rule **replaces emergency rule 64ER22-8** (in force 8/29/2022 – 2026). **The dose numbers did not change.** Verbatim from 64-4.224(3):

| Route of Administration | Daily Dose Amount | 70-Day Supply Limit |
|---|---|---|
| Edibles | 60 mg THC | 4,200 mg THC |
| Inhalation (e.g., vaporization) | 350 mg THC | 24,500 mg THC |
| Oral (e.g., capsules, tinctures) | 200 mg THC | 14,000 mg THC |
| Sublingual (e.g., sublingual tinctures) | 190 mg THC | 13,300 mg THC |
| Suppository | 195 mg THC | 13,650 mg THC |
| Topical (e.g., creams) | 150 mg THC | 10,500 mg THC |
| Marijuana in a form for smoking | 2.025 grams | N/A |

- **64-4.224(4):** aggregate 70-day limit for **all non-smokable** forms combined **may not exceed 24,500 mg THC**. (Note the per-route maxima sum to more than this — the aggregate cap binds. The physician allocates across routes.)
- **64-4.224(2):** the 35-day smokable limit **may not exceed 2.5 ounces**.

### 3.3 ⚠️ NEW in the 2026 rule — flower may no longer be classified as vaporization
Verbatim, 64-4.224(2):

> "Marijuana in a form for smoking shall only be dispensed by an MMTC as **usable whole flower, ground usable whole flower, or prerolled marijuana cigarettes**. An MMTC **may not dispense** usable whole flower, ground usable whole flower, or prerolled marijuana cigarettes **under any other route of administration (e.g., vaporization)**."

**This provision did not exist in the 2022 emergency rule.** It closes the practice of billing flower against the (much larger) inhalation mg-THC allowance instead of the 2.5 oz / 35-day smokable allowance. **Direct patient impact:** patients who were stretching flower purchases through a vaporization order will find that path closed. This is the single most consequential 2026 change for day-to-day purchasing and is worth a dedicated in-app explainer.

### 3.4 ⚠️ NEW in the 2026 rule — codified rolling-window math
64-4.224(8) now codifies the calculation the Registry performs (previously only explained in OMMU guidance):
- 70-day period is measured by **looking back 70 days from the date of each dispensation** — 64-4.224(8)(a)
- 35-day period is measured by **looking back 35 days from the date of each dispensation** — 64-4.224(8)(b)
- Amount dispensable today = smokable 35-day limit **minus** 35-day dispensation history; and non-smokable 70-day limit **minus** 70-day dispensation history — 64-4.224(8)(c)1.–2.
- **Notwithstanding both**, an MMTC may not dispense more than the amount remaining on the patient's **current order** — 64-4.224(8)(c)3.

**This is effectively a published spec for an "amount available" calculator.** If X420 builds one, it should implement exactly these three constraints, with the order-remaining constraint as a hard ceiling over the rolling windows. Rolling windows are **per-dispensation lookbacks, not fixed calendar periods** — the most common patient misunderstanding.

### 3.5 The exception ("RFE") process
- **[STATUTE]** s. 381.986(4)(f)1.: a physician may request an exception to the daily dose limit, the 35-day smokable limit, and the 4-ounce possession limit. DOH must approve/disapprove **within 14 days**; **deemed approved if DOH fails to act**.
- **[RULE]** 64-4.224(5): submitted on **Form DH8031-OMMU-05/2026** via the MMUR; DOH acts within **14 calendar days**.
- **[RULE]** 64-4.224(5)(a): an exception to the **4-ounce possession limit** will **only** be approved **in conjunction with** an approved exception to the 35-day smokable supply limit.
- **[RULE]** 64-4.224(6): each approved exception is valid up to the duration of the certification, **not to exceed 210 days**.
- **[RULE]** 64-4.224(6)(b): when a new physician accepts a patient who has a certification with an approved exception, the new physician has **7 calendar days** to close the existing certification; otherwise the Registry **closes it automatically**. *(New patient-visible failure mode when switching doctors — worth an in-app warning.)*

### 3.6 ⚠️ GAP — low-THC cannabis and the dosing rule
The 2022 emergency rule was announced by DOH as applying to routes of administration of marijuana **"(excluding low-THC cannabis)"**. The certified text of the new permanent rule 64-4.224 that I retrieved contains **zero occurrences of "low-THC"** and speaks throughout only of "marijuana." I could **not** confirm from the rule text alone whether low-THC cannabis remains outside these caps. Statutorily, "marijuana" is defined to *include* low-THC cannabis — s. 381.986(1)(g) — which cuts against a silent exclusion. **Treat low-THC dosing as unresolved; do not state a low-THC daily cap in-app.**

---

## 4. Telehealth and certification / recertification cycle

### 4.1 ⚠️ Initial certification REQUIRES an in-person exam — [STATUTE]
s. 381.986(4)(a)1., verbatim:

> "**Before issuing an initial certification to a patient, the qualified physician must conduct an in-person physical examination of the patient.** For certification renewals, a qualified physician who has issued a certification to a patient after conducting an in-person physical examination **may conduct subsequent examinations of that patient through telehealth** as defined in s. 456.47. For the purposes of this subparagraph, the term '**in-person physical examination**' means an examination conducted by a qualified physician **while the physician is physically present in the same room as the patient**."

Source: https://www.flsenate.gov/Laws/Statutes/2025/381.986

The statute goes out of its way to define "in-person" as *same room*, foreclosing creative interpretations. **The answer to "can I get certified via telehealth in Florida?" is: no for your first certification; yes for renewals with the same physician who examined you in person.**

**⚠️ Compliance/marketing caution for X420:** many Florida certification clinics advertise "get your medical card online / 100% telehealth." What is legitimately online is (a) the **card application** via the Registry, and (b) **renewal** exams. Advertising or implying telehealth *initial* certification would put the app crosswise with s. 381.986(4)(a)1. Recommend explicit copy on this.

### 4.2 Recertification cadence — [STATUTE]
s. 381.986(4)(g): *"A qualified physician must evaluate an existing qualified patient **at least once every 30 weeks** before issuing a new physician certification. A qualified physician who has issued a certification to the patient after conducting an in-person physical examination as defined in subparagraph (a)1. **may conduct the evaluation through telehealth** as defined in s. 456.47."*

At that evaluation the physician must:
1. Determine the patient still meets certification requirements;
2. **Identify and document** whether the patient experienced **(a)** an adverse drug interaction with any prescription or nonprescription medication, or **(b)** a reduction in use of other medication.

**Cycle math — three numbers that all equal 210 days:**
- 30 weeks between evaluations = **210 days** — s. 381.986(4)(g)
- 3 × 70-day supply limits = **210 days** — s. 381.986(4)(f)
- Exception validity cap = **"shall not exceed 210 days"** — Rule 64-4.224(6)

So: **a certification runs a maximum of 210 days (~7 months), and the patient must be re-evaluated at least every 30 weeks.** ⚠️ Note this is **decoupled from the card cycle**, which is **annual**. Patients therefore have **two independent clocks** — a ~210-day physician clock and a 365-day card clock — that drift against each other. Given the new July 27, 2026 gate (§2.3), letting the physician clock lapse now also blocks card renewal. **A dual-clock reminder system is probably the highest-value patient feature in this brief.**

### 4.3 What "telehealth" means — s. 456.47 [STATUTE]
Source: https://www.flsenate.gov/Laws/Statutes/2025/456.47
- s. 456.47(1)(a): telehealth = "the use of **synchronous or asynchronous** telecommunications technology" for assessment, diagnosis, consultation, treatment, monitoring, etc. **"The term does not include e-mail messages or facsimile transmissions."**
- s. 456.47(2)(d): provider and patient **may be in separate locations**.
- s. 456.47(2)(c) bars telehealth prescribing of **Schedule II** controlled substances except for psychiatric disorders, hospital inpatient treatment, hospice patients, and nursing-home residents. ⚠️ *Caution:* a Florida marijuana authorization is a "**physician certification**," not a prescription, so this paragraph is not the operative restriction — the operative bar is s. 381.986(4)(a)1. Do not cite s. 456.47(2)(c) as the reason initial certification must be in person.

### 4.4 Physician prerequisites — [STATUTE]
- Active, unrestricted license as allopathic (ch. 458) or osteopathic (ch. 459) physician — s. 381.986(1)(n)
- 2-hour course + exam from the Florida Medical Association or Florida Osteopathic Medical Association, before qualifying **and before each license renewal**; course price capped at **$500** — s. 381.986(3)(a)
- **May not be employed by, or have any direct or indirect economic interest in, an MMTC or testing laboratory** — s. 381.986(3)(b)
- Must review the **PDMP** (s. 893.055) database — s. 381.986(4)(a)5.
- Must confirm the patient has **no active certification from another qualified physician** — s. 381.986(4)(a)6. The Registry "must prevent an active registration of a qualified patient by multiple physicians" — s. 381.986(5)(a).

Physician lookup **[PRACTICE]**: https://knowthefactsmmj.com/physicians/list/ · License verification: https://flhealthsource.gov

---

## 5. 2025–2026 regulatory change log

### 5.1 ⚠️ The structural story — end of emergency rulemaking (Ch. 2025-199)
Source (Laws of Florida): https://laws.flrules.org/2025/199

For years Florida's MMJ program ran on **emergency rules** that, by statutory design, "remain in effect until replaced by rules adopted under the nonemergency rulemaking procedures" — i.e., indefinitely, without public comment. **Chapter 2025-199 ended that:**

- **§15** amended ch. 2017-232 §14(1)(c): DOH must **initiate** nonemergency rulemaking by **September 1, 2025** to replace all emergency rules, and **"after December 31, 2025 … may not adopt rules pursuant to the emergency rulemaking procedures."**
- **§14** amended s. 381.986(17): rules adopted before **July 1, 2026** are exempt from ss. 120.54(3)(b) and 120.541 (SERC/legislative-ratification steps); **that subsection expired July 1, 2026.**
- **§16**: the §15 amendments **expire January 1, 2026** and revert.

The DOH rule-development notice of 8/29/2025 (FAR Vol. 51/169) names the emergency rules being replaced: **64ER20-31, 64ER20-32, 64ER20-35, 64ER21-10, 64ER21-13, 64ER22-1, 64ER22-2, 64ER22-7, 64ER22-8, 64ER22-9, 64ER23-2, 64ER24-1, 64ER24-2, 64ER25-1.**

**Consequence:** roughly half of FAC ch. 64-4 has a **2026 effective date**. Any citation the app carries must be version-pinned; pre-2026 rule citations are presumptively stale.

### 5.2 Rules that became effective in 2026
Chapter listing: https://flrules.org/gateway/ChapterHome.asp?Chapter=64-4 · OMMU: https://knowthefactsmmj.com/rules-and-regulations/

| Effective | Rule | Title |
|---|---|---|
| 5/21/2026 | 64-4.216 | MMTC Authorization Procedures |
| 5/21/2026 | 64-4.223 | Caregiver Background Screening and Request for Close Relative Status |
| 5/28/2026 | 64-4.300–.314 | CMTL (testing lab) rule suite |
| 6/2/2026 | 64-4.315 | CMTL Fines, Suspension, and Revocation |
| **8/24/2026** | **64-4.205** | **Standards for Production of Edibles** |
| **8/24/2026** | **64-4.209** | **MMTC Solvent-Based Extraction** |
| **8/24/2026** | **64-4.217** | **MMTC Financial Assurance** |
| **8/24/2026** | **64-4.219** | **MMTC Packaging and Labeling** |
| **8/24/2026** | **64-4.221 / .222** | **Seed-to-Sale Tracking System integration & procedures** |
| **8/24/2026** | **64-4.224** | **Dosing and Supply Limits for Medical Marijuana** |

**Patient-visible content of the new 8/24/2026 product rules:**

**Edibles — [RULE] 64-4.205** (https://www.flrules.org/gateway/ruleNo.asp?id=64-4.205)
- Permitted **shapes**: square, circle, rectangle, triangle, parallelogram, oval, diamond — 64-4.205(4)
- Permitted **forms**: lozenges, gelatins, baked goods, chocolates, drink powders (drink powders exempt from the shape rule) — 64-4.205(5)
- Chocolates **may not contain** caramel, nougat, nuts, fruit, honey, marshmallows or similar inclusions/toppings/fillings — 64-4.205(5)(d)
- **No color additives** (natural or artificial); no icing/sprinkles/toppings; no primary or bright colors; no markings other than the universal symbol; nothing bearing reasonable resemblance to commercially available candy — 64-4.205(7)
- **Prohibited ingredients** include meat, poultry, or fish (gelatin excepted) — 64-4.205(8)
- Each edible product requires **case-by-case DOH approval** via the variance procedure in Rule 64-4.023 — 64-4.205(3)(a)
- Multi-serving edibles must have each serving physically distinct or clearly delineated and easily separable — 64-4.205(6)

**Packaging/labeling — [RULE] 64-4.219** (https://www.flrules.org/gateway/ruleNo.asp?id=64-4.219)
- Receptacles must be **child resistant**, and resealable-child-resistant for multi-use/multi-serving — 64-4.219(3)(a)
- Edible receptacles and packaging must be **plain, opaque, and white**; each edible individually sealed in plain opaque white wrapping marked only with the universal symbol — 64-4.219(5)
- Smokable-form receptacles: plain opaque white, with a warning to keep away from children **and** a warning that **marijuana smoke contains carcinogens and may negatively affect health** — 64-4.219(6)
- MMTCs **may not** include unsubstantiated claims that a product **cures** any medical condition — 64-4.219(3)(f) *(relevant to how X420 renders MMTC-supplied marketing copy)*
- A physical **patient package insert** is required — 64-4.219(1), (10)

### 5.3 ⚠️ Still in flight as of August 25, 2026
Source: https://knowthefactsmmj.com/notices/

| Status | Rule | Note |
|---|---|---|
| **Proposed 8/24/2026** (FAR 52/164) | **64-4.227 MMTC Advertising and Marketing** | Replaces emergency rule 64ER25-6. Published *yesterday*. Directly relevant to how MMTC marketing may appear in a third-party app. **Watch this one.** |
| Notice of Change 8/11/2026 | 64-4.218 MMTC Trade Name and Logo | Not yet effective |
| Notice of Change 8/6/2026 | 64-4.215 Renewal Application Requirements for MMTCs | Not yet effective |
| Notice of Correction 8/17/2026 | 64-4.303/.306/.307/.309 CMTL rules | Lab testing |
| Rule development | 64-4.225 MMTC Marijuana Delivery Devices; 64-4.226 Harvest Failures and Wholesale Transfers | Replacing 64ER25-5 and 64ER25-4 |
| **Pending** | **64-4.011 MMUR Identification Cards** | Amendments pursuant to Ch. 2025-204; workshops Dec 2025 & May 2026; **FAC still shows the 7/31/2018 version as operative** |
| Withdrawn 7/20/2026 | 64-4.002 / .004 / .005 | Proposed repeal withdrawn |

Emergency rules **still listed as active** by OMMU include 64ER22-7 (MMTC Website and Website Purchasing), 64ER25-1 (MMTC renewals), 64ER25-4, 64ER25-5, and others. ⚠️ Note the tension: DOH may no longer *adopt* new emergency rules after 12/31/2025, but previously adopted ones remain effective until replaced.

### 5.4 Legislation — Chapter 2025-204 (SB 2514), effective July 1, 2025
Source: https://laws.flrules.org/2025/204 · OMMU explainer: https://knowthefactsmmj.com/patients/chapter-2025-204/

Amended s. 381.986(5)(d)–(e). **[STATUTE]**
- DOH **must revoke** the MMUR registration of a patient or caregiver **convicted of, or who pled guilty or nolo contendere to, regardless of adjudication**, a ch. 893 violation **for trafficking in; the sale, manufacture, or delivery of; or possession with intent to sell, manufacture, or deliver** a controlled substance.
- DOH **must immediately suspend** registration of a patient/caregiver **charged** with any ch. 893 violation, until final disposition.
- **Not retroactive** — applies only to dispositions **on or after July 1, 2025**. **[PRACTICE]** OMMU confirms: "only cases disposed of on or after July 1, 2025."
- **Reinstatement:** submit a **notarized attestation** that all terms of incarceration, probation, community control, or supervision are complete, plus supporting documentation. **A knowingly false attestation is a second-degree misdemeanor** (ss. 775.082/775.083).
- **[PRACTICE]** After reinstatement approval the person must be **recertified by a qualified physician** and then submit a **card renewal application**. OMMU: reinstatement review takes **up to 15 business days**. Attestations to MMUR_Applications@FLHealth.gov, fax 850-487-7046, or PO Box 5046, Tallahassee FL 32314.
- Notice is by **certified mail plus Registry email**.

### 5.5 Amendment 3 aftermath — Florida stays medical-only
- **Amendment 3 (Nov 2024)** received **55.9%**, short of Florida's **60%** threshold. *(Secondary sources — Tallahassee Democrat/AP: https://www.tallahassee.com/story/news/politics/elections/2024/11/05/florida-marijuana-amendment-early-election-results-passage-vote/75972689007 ; I did not pull the official Division of Elections canvass.)*
- **Successor initiative:** Smart & Safe Florida's **"Adult Personal Use of Marijuana" (serial 25-01)**, filed 01/14/2025. **[PRIMARY]** The Florida Division of Elections constitutional initiatives database now lists it with a target of **2028 GEN**, status Active — i.e., **it did not make the 2026 ballot**. Source: https://constitutionalinitiatives.dos.fl.gov · Ballotpedia concurs it "is not on the ballot … on November 3, 2026": https://ballotpedia.org/Florida_Marijuana_Legalization_Initiative_(2026)
- Reported cause: ~200,000 petition signatures invalidated; Leon County Circuit Judge John Cooper ruled for the state; Smart & Safe declined to appeal. *(Secondary — Florida Phoenix: https://floridaphoenix.com/2025/11/25/smart-safe-florida-confident-cannabis-amendment-will-make-2026-ballot)*

**Product guidance:** Florida is **medical-only through at least the 2026 election cycle**, with the next realistic adult-use vote in **2028**. Ship no "recreational coming soon" messaging.

---

## 6. Reciprocity — the honest answer

### 6.1 Florida does not recognize out-of-state medical cards
- **[STATUTE]** The words "reciprocity," "out-of-state," "nonresident," and "non-resident" appear **zero times** in s. 381.986. There is no reciprocity provision to interpret. Access is built on "qualified patient" = **"a resident of this state"** with a **Florida** physician certification and a **Florida** MMUR ID card — s. 381.986(1)(m).
- **[PRACTICE]** OMMU General FAQ, verbatim: *"**The state of Florida does not offer reciprocity.** Cannabis remains a Schedule 1 substance under both state and federal law. The 28 currently licensed Medical Marijuana Treatment Centers **only dispense orders to qualified Florida patients, and their caregivers**, who have had an order added to the Medical Marijuana Use Registry by their qualified physician."*
  Source: https://knowthefactsmmj.com/about/faq/
- **[STATUTE]** Reinforced operationally: an MMTC **must verify** that the patient/caregiver has an **active registration in the MMUR and an active, valid MMUR ID card**, and that the amount and type match the certification in the Registry — s. 381.986(8)(e)16.d. A Michigan or Oklahoma card produces no Registry record, so the dispensing transaction cannot legally complete.

### 6.2 …but the seasonal-resident pathway is real (this is the useful answer)
A visiting patient's home-state card is worthless in Florida. **However**, s. 381.986(5)(b) expressly contemplates **seasonal residents**, defined in that paragraph as a person who:
1. **Temporarily resides in Florida for at least 31 consecutive days in each calendar year**;
2. **Maintains a temporary residence** in Florida;
3. **Returns to the state or jurisdiction of his or her residence at least one time during each calendar year**; and
4. **Is registered to vote or pays income tax in another state or jurisdiction.**

A qualifying seasonal resident registers with **two** of the listed proof-of-address documents in lieu of a Florida DL/ID (§2.1), then follows the identical path as any Florida patient: **in-person** certification by a Florida qualified physician (§4.1) → MMUR entry → $75 card application.

**Recommended in-app copy:** *"Florida does not honor out-of-state medical marijuana cards — there is no reciprocity, and dispensaries cannot legally sell to you on another state's card. If you spend at least 31 consecutive days a year in Florida, keep a residence here, return to your home state at least once a year, and vote or pay income tax elsewhere, you may qualify as a **seasonal resident** and can register in Florida's own program. You will still need an **in-person** exam with a Florida-qualified physician and your own Florida MMUR card."*

⚠️ There is **no** short-term visitor or temporary-tourist registration in Florida. Snowbirds must go through full registration.

---

## 7. Vertical integration — and why Florida's product landscape differs

### 7.1 The requirement — [STATUTE] s. 381.986(8)(e)
Verbatim:
> "A licensed medical marijuana treatment center **shall cultivate, process, transport, and dispense** marijuana for medical use. A licensed medical marijuana treatment center **may not contract for services directly related to the cultivation, processing, and dispensing** of marijuana or marijuana delivery devices, except that a medical marijuana treatment center licensed pursuant to subparagraph (a)1. may contract with a **single entity** for the cultivation, processing, transporting, and dispensing of marijuana and marijuana delivery devices."

Supporting provisions:
- **No inter-MMTC wholesale.** s. 381.986(8)(c): an MMTC "may not make a wholesale purchase of marijuana from, or a distribution of marijuana to, another medical marijuana treatment center, **unless** the MMTC seeking the purchase **submits proof of harvest failure** to the department." *(Implemented by emergency rule 64ER25-4, being replaced by proposed rule 64-4.226.)*
- **Seed-to-sale tracking.** s. 381.986(8)(d): DOH maintains a statewide system tracing marijuana from seed to sale with real-time 24-hour DOH access; each MMTC must use it or integrate its own. *(Rules 64-4.221 / .222, eff. 8/24/2026.)*
- **Three-stage authorization. [PRACTICE]** Each MMTC must obtain, in order: **(1) cultivation authorization, (2) processing authorization, (3) dispensing authorization** before dispensing. Sources: https://knowthefactsmmj.com/mmtc/ and the OMMU weekly update.
- **Mandatory low-THC product.** s. 381.986(8)(e)7.: "Each medical marijuana treatment center **must produce and make available for purchase at least one low-THC cannabis product**."
- MMTCs may not dispense **any other type of cannabis, alcohol, or illicit drug-related product**, including pipes or wrapping papers made with tobacco or hemp — s. 381.986(8)(e)16.f. Patients **may** buy smoking delivery devices from non-MMTC vendors — s. 381.986(14)(b).
- MMTCs producing prerolls **may not use wrapping paper made with tobacco or hemp** — s. 381.986(8)(e)10.

### 7.2 What this means for product availability — and for X420's data model
In most mature cannabis markets, licenses are **tiered**: independent cultivators sell to independent processors, whose brands appear across many unaffiliated retailers. A product like "Brand X gummies" can be found at dozens of competing stores, and price comparison across retailers for an identical SKU is meaningful.

**Florida is the opposite.** Because every MMTC must grow, process, transport *and* dispense its own marijuana, and inter-MMTC wholesale is barred except on proof of harvest failure:

1. **Brand ≡ license.** "Trulieve," "MÜV," "Curaleaf" are not brands sold *at* dispensaries — they *are* the licensees, and their stores are the only places their products legally exist. There is no third-party/white-label brand market.
2. **No cross-retailer price comparison for an identical SKU.** A given product exists in exactly one retail network. Comparison shopping is necessarily *across* MMTCs and *between* differing products — not the same SKU at different prices.
3. **Availability is a per-MMTC supply-chain fact.** A stockout reflects that licensee's own harvest/processing pipeline. There is no distributor to route around it — which is precisely why the harvest-failure exception exists at all.
4. **Catalogs are closed and vertically siloed.** Any ingestion design should model **MMTC → dispensing locations → that MMTC's own catalog**, never a shared product table joined to many retailers.
5. **Patient-facing consequence.** Switching product means switching *dispensary chains*. Combined with the 2.5 oz / 70-day rolling caps (§3.4), a patient's practical choice set at any moment is bounded by one licensee's current inventory. Surfacing "which MMTCs near me currently carry a product matching my certified route" is a genuinely useful feature that the vertical structure makes non-trivial.
6. **Every edible SKU is individually DOH-approved** via the Rule 64-4.023 variance process (§5.2) — so catalogs shift slowly and are, in principle, enumerable.

---

## 8. Market snapshot — as of the OMMU Weekly Update, August 21, 2026

**[PRACTICE / official DOH data]** Source PDF: https://knowthefactsmmj.com/wp-content/uploads/ommu_updates/2026/082126-OMMU-Update.pdf

| Metric | Value |
|---|---|
| **Qualified patients with an active ID card** | **939,639** |
| **Total dispensing locations** | **776** |
| **Licensed MMTCs** | **28** (25 with dispensing authorization; 3 at initial licensure only) |
| Application processing (complete application) | 5 business days |
| ID card printing | 5 business days |
| Weekly dispensations (Aug 14–20, 2026) — medical marijuana | **439,096,212 mg THC** |
| Weekly dispensations — low-THC cannabis | **1,049 mg CBD** |
| Weekly dispensations — smokable | **152,157.424 oz** |

**Top licensees by dispensing locations:** Trulieve 170 · MÜV 86 · Curaleaf Florida 75 · Ayr 65 · Surterra Wellness 44 · Green Dragon 41 · Planet 13 Florida 34 · FLUENT 33 · Sunnyside 31 · Sanctuary Cannabis 27.

Trulieve alone accounted for **115.6M of 439.1M mg THC (~26%)** and **52,635 of 152,157 oz (~35%)** of smokable that week — a notably concentrated market.

**Licenses with zero dispensing activity that week:** Bloom Dispensary, Revolution Florida, Wildflower Cannabis (0 locations); Magic Mortgage Corp., Leola Robinson, Moton Hopkins Jr. (n/a — initial licensure, these are the Pigford/Black Farmer licensees). Fino Cannabis had 1 location and smokable-only activity.

**New dispensing locations approved Aug 14–20, 2026:** Goldflower Cannabis – North Miami; Sanctuary Cannabis – Fort Lauderdale.

Licensee roster with license numbers and authorization status: https://knowthefactsmmj.com/mmtc/ — I independently counted **28 unique license numbers** (MMTC-2015-0001 … MMTC-2025-0028), 25 marked "Dispensing Authorization," 3 marked "Initial Licensure." This corroborates both OMMU's 28 figure and the FAQ's "28 currently licensed."

### 8.1 ⚠️ Note on your ingested dataset
Your pipeline records **777 dispensing locations**; OMMU's August 21, 2026 update states **776**. This is almost certainly **live drift, not an error** — OMMU approved **two** new locations in that single week, and the MMTC page updates continuously while the weekly PDF is a Friday snapshot. **Recommendation:** treat location counts as a moving figure, stamp every ingest with the OMMU update date, and never display a bare count without an "as of" date. Do not "fix" a ±1–3 discrepancy.

**The 47-county figure could not be verified.** OMMU's weekly update does not publish a county count, and the MMTC page exposes a location search rather than a published county aggregation. If the app displays "47 counties," derive it from your own geocoding of the MMTC location list and label it as your computation, not an OMMU statistic.

### 8.2 Delivery
**[PRACTICE]** The OMMU weekly update states MMTCs dispense "at approved dispensing locations **and via delivery**." Statewide delivery is therefore an available channel. I did not locate a dedicated delivery rule in ch. 64-4 during this review; s. 381.986(8)(e)16 governs dispensing conduct generally and s. 381.986(8)(g) addresses safe transport.

---

## 9. Recommendations for X420 (product/compliance)

1. **Version-pin every citation.** Store `rule_number`, `effective_date`, `retrieved_at`, and the flrules.org URL. With ~10 rules changing effective date in 2026 and more pending, undated citations will silently rot. Re-scrape https://flrules.org/gateway/ChapterHome.asp?Chapter=64-4 on a schedule and diff effective dates.
2. **Build the dual-clock reminder** (§4.2): ~210-day physician clock and 365-day card clock, plus the new July 27, 2026 dependency that a lapsed certification blocks card renewal (§2.3). This is the highest-value patient feature identified in this research.
3. **Never assert telehealth initial certification** (§4.1). Add explicit "first visit must be in person, same room" copy.
4. **Do not publish a "50+ qualifying conditions" list as law** (§1.1). Present the 13 statutory paragraphs and explain (2)(k) as a physician-judgment pathway with a board-documentation requirement.
5. **Separate the two edible caps** (§3.1): product caps (200 mg/10 mg per serving, statute) vs. daily-consumption caps (60 mg/day, 4,200 mg/70 days, rule).
6. **Implement the rolling-window math exactly as 64-4.224(8) specifies** if you build an "amount available" calculator — per-dispensation lookbacks with the order-remaining hard ceiling (§3.4).
7. **Explain the new flower/vaporization separation** (§3.3) — it is the change most likely to surprise existing patients at the counter.
8. **Model catalogs as MMTC-siloed** (§7.2). Do not build a shared SKU table joined across retailers.
9. **Watch proposed rule 64-4.227 (MMTC Advertising and Marketing)**, proposed 8/24/2026. It will govern how MMTC marketing content may be presented and may bear on a third-party app surfacing that content.
10. **Ingest OMMU weekly-update PDFs** as the canonical source for patient counts, location counts and processing times, rather than hardcoding. URL pattern: `https://knowthefactsmmj.com/wp-content/uploads/ommu_updates/<YYYY>/<MMDDYY>-OMMU-Update.pdf`.
11. **Never render "cures" claims** from MMTC-supplied copy — 64-4.219(3)(f) bars unsubstantiated cure claims on receptacles, and reproducing them is a bad look for an evidence-linked product.
12. **Do not ship adult-use messaging** (§5.5). Next realistic vote is 2028.

---

## 10. Confidence and gaps

### High confidence — verified against primary sources (statute text, certified rule text, or OMMU official pages)
- Full qualifying-conditions list, the (2)(k) catch-all, its 14-day board documentation requirement, and the narrow definition of chronic nonmalignant pain
- In-person requirement for initial certification; telehealth permitted only for renewals; "same room" definition
- 30-week re-evaluation cadence; 210-day maximum certification
- $75 fee, 1-year card validity, annual renewal, $15 change/replacement fee, 60-day cure window, 10-day change notification
- All statutory purchase/possession caps, including the 200 mg/10 mg edible product caps and 4-oz possession limit
- Rule 64-4.224 dose table, aggregate 24,500 mg cap, 2.5 oz smokable cap, the new flower-classification restriction, codified rolling-window math, and the RFE process — read from the **certified rule text**, effective 8/24/2026
- Caregiver requirements (21+, FL resident, one-patient default and its four exceptions, no compensation, level 2 screening unless close relative, biennial course, $100 price cap)
- No reciprocity (statutory silence + explicit OMMU FAQ) and the seasonal-resident definition and document list
- Vertical integration requirement, inter-MMTC wholesale prohibition and harvest-failure exception, seed-to-sale mandate, mandatory low-THC product
- Chapter 2025-204 revocation/reinstatement regime; Chapter 2025-199 emergency-rulemaking sunset
- Program statistics as of the OMMU Weekly Update of August 21, 2026
- 2028 (not 2026) target for the successor adult-use initiative — confirmed on the Florida Division of Elections database

### Could NOT verify — stated plainly
1. **Whether low-THC cannabis is subject to the 64-4.224 dose caps.** DOH's 2022 bulletin for the predecessor emergency rule said the limits applied to marijuana **"(excluding low-THC cannabis)."** The certified text of the new permanent rule contains **no occurrence of "low-THC"** and no explicit exclusion clause. Since s. 381.986(1)(g) defines "marijuana" to *include* low-THC cannabis, a silent exclusion is not safe to assume. **Do not publish a low-THC daily cap.** Resolve with OMMU directly.
2. **The 47-county figure in your dataset.** OMMU does not publish a county count. Not contradicted — simply not verifiable from official sources. Derive and label it as your own computation.
3. **Which processing-time figure is authoritative** — 5 business days (Aug 21, 2026 weekly update) vs. "average of 10 business days" (ID-card page and General FAQ, both currently live). OMMU's own pages disagree. Prefer the weekly update; do not hardcode.
4. **Caregiver certification course cadence — OMMU contradicts itself on a single page.** The requirements bullet says the course must be completed "**every year**"; the Certification Course section on the *same page* says "**every two years**." **[STATUTE]** s. 381.986(6)(b)5. says the course "**must be renewed biennially**," so biennial is legally correct — but a patient reading OMMU's page may be misinformed. Flagged rather than silently resolved. (Also: statute caps the course at $100; OMMU says it is currently **free**.)
5. **Whether the July 27, 2026 registry gate is codified anywhere.** It is announced in OMMU's General FAQ; the corresponding **Rule 64-4.011 amendment is still pending** (workshops Dec 2025 and May 2026; FAC still shows the 7/31/2018 version). Cite as OMMU practice, not codified rule.
6. **Whether any legal challenge to Rule 64-4.224 has been filed.** The rule is one day old as of this brief. Ch. 64-4 rules have drawn challenges before, and adopted rules can be challenged under s. 120.56. Unknown.
7. **Amendment 3's official canvassed vote total.** The 55.9% figure comes from press/AP reporting, not the official Division of Elections canvass, which I did not retrieve. The *material* fact — that it failed the 60% threshold and that the successor is now aimed at 2028 — is confirmed via the Division of Elections database.
8. **HB 1205 (2025) petition-process changes.** Referenced in secondary reporting as a contributing cause of the initiative's failure to qualify; **not independently verified** and therefore not asserted above.
9. **Delivery-specific regulations.** OMMU confirms delivery occurs, but I did not locate a dedicated delivery rule in ch. 64-4 within this review's scope. Statutory transport/dispensing provisions were reviewed; a targeted follow-up is advisable if delivery is a core app feature.
10. **Current status of several still-pending rules** (64-4.227 advertising, 64-4.215, 64-4.218, 64-4.225, 64-4.226). Proposed or in development as of 8/25/2026; effective dates unknown. 64-4.227 in particular may bear on how the app may present MMTC marketing content.
11. **Exact per-MMTC live location counts.** These change weekly (two approved in the sample week alone). Any count is a snapshot.

### Method note
Firecrawl-backed extraction returned HTTP 403 throughout this session, so all primary sources were fetched directly (curl) from flsenate.gov, flrules.org, laws.flrules.org, knowthefactsmmj.com, and constitutionalinitiatives.dos.fl.gov. Rule text for 64-4.224, 64-4.205, 64-4.219 and 64-4.011 was read from the **certified Word documents served by flrules.org**, not from summaries or secondary descriptions. Secondary sources are used only where explicitly labeled (Amendment 3 vote share; petition-signature litigation).
