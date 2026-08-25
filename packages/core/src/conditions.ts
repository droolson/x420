import {
  type ConditionEvidence,
  NASEM_2017,
  FDA_EPIDIOLEX,
  FDA_DRONABINOL,
  FDA_NABILONE,
  FL_STATUTE_381_986,
} from './evidence.js';

/**
 * X420 condition knowledge base.
 *
 * Design rule, non-negotiable: an entry may only claim what its citations
 * support, at the tier its citations support. Where the strongest honest answer
 * is "the evidence is limited", the entry says exactly that — because a patient
 * making a real decision is better served by a small true statement than a large
 * false one.
 *
 * Spasticity and neuropathic pain lead this list because they are both the
 * best-evidenced indications in the NASEM review and the reason X420 exists.
 */
export const CONDITIONS: readonly ConditionEvidence[] = [
  {
    id: 'chronic-pain',
    label: 'Chronic pain',
    floridaQualifying: true,
    tier: 'substantial',
    supportedOutcome:
      'In adults with chronic pain, patients treated with cannabis or cannabinoids are more likely to experience a clinically significant reduction in pain symptoms.',
    cannabinoids: ['THC', 'CBD'],
    terpenes: ['myrcene', 'caryophyllene', 'linalool'],
    routes: ['inhalation', 'oral', 'sublingual', 'topical'],
    citations: [NASEM_2017, FL_STATUTE_381_986],
    cautions: [
      'Inhalation acts within minutes; oral onset can take up to 2 hours. Do not re-dose oral products early — delayed onset is the most common cause of accidental overconsumption.',
      'THC can cause hypotension and dizziness, which raises fall risk. This matters more if you have impaired mobility or transfer independently.',
    ],
  },
  {
    id: 'spasticity-ms',
    label: 'Multiple sclerosis spasticity',
    floridaQualifying: true,
    tier: 'substantial',
    supportedOutcome:
      'In adults with multiple sclerosis, short-term use of oral cannabinoids improves patient-reported spasticity symptoms.',
    cannabinoids: ['THC', 'CBD'],
    terpenes: ['myrcene', 'linalool', 'caryophyllene'],
    routes: ['oral', 'sublingual'],
    citations: [NASEM_2017, FL_STATUTE_381_986],
    cautions: [
      'NASEM notes the improvement is in PATIENT-REPORTED spasticity; clinician-measured spasticity showed smaller effects. Both facts are true and you deserve both.',
      'Balanced THC:CBD oromucosal formulations carry the bulk of this evidence, not high-THC inhaled flower.',
    ],
  },
  {
    id: 'spasticity-sci',
    label: 'Spinal cord injury — spasticity and neuropathic pain',
    floridaQualifying: true,
    tier: 'limited',
    supportedOutcome:
      'Evidence in spinal cord injury specifically is limited. The strongest adjacent evidence is for chronic and neuropathic pain broadly (substantial) and for MS spasticity (substantial); SCI-specific trials are small and fewer.',
    cannabinoids: ['THC', 'CBD'],
    terpenes: ['myrcene', 'linalool', 'caryophyllene', 'pinene'],
    routes: ['oral', 'sublingual', 'inhalation', 'topical'],
    citations: [NASEM_2017, FL_STATUTE_381_986],
    cautions: [
      'X420 will not tell you cannabis restores motor function. There is no good evidence for that claim, and we will not make it — not even here, not even for our own founder.',
      'Autonomic dysreflexia, orthostatic hypotension, and impaired thermoregulation are common after SCI, and THC can compound all three. Start very low, seated or secured.',
      'If you self-catheterize or transfer independently, plan dosing around those tasks, not the other way around.',
    ],
  },
  {
    id: 'chemo-nausea',
    label: 'Chemotherapy-induced nausea and vomiting',
    floridaQualifying: true,
    tier: 'conclusive',
    supportedOutcome:
      'Oral cannabinoids are effective antiemetics in the treatment of chemotherapy-induced nausea and vomiting.',
    cannabinoids: ['THC'],
    terpenes: ['limonene', 'myrcene'],
    routes: ['oral'],
    citations: [NASEM_2017, FDA_DRONABINOL, FDA_NABILONE],
    cautions: [
      'This is the single strongest indication in the evidence base, and it rests on FDA-approved isolated cannabinoids (dronabinol, nabilone) — not on dispensary flower.',
    ],
  },
  {
    id: 'epilepsy-refractory',
    label: 'Treatment-resistant epilepsy (Dravet, Lennox-Gastaut, TSC)',
    floridaQualifying: true,
    tier: 'conclusive',
    supportedOutcome:
      'Purified cannabidiol (Epidiolex) is FDA-approved to reduce seizure frequency in Dravet syndrome, Lennox-Gastaut syndrome, and tuberous sclerosis complex.',
    cannabinoids: ['CBD'],
    terpenes: [],
    routes: ['oral'],
    citations: [FDA_EPIDIOLEX, FL_STATUTE_381_986],
    cautions: [
      'This approval is for a specific pharmaceutical-grade CBD product at prescribed doses, and does NOT transfer to dispensary CBD products.',
      'CBD interacts with clobazam and valproate and can elevate liver enzymes. This one genuinely requires your neurologist.',
    ],
  },
  {
    id: 'ptsd',
    label: 'Post-traumatic stress disorder',
    floridaQualifying: true,
    tier: 'limited',
    supportedOutcome:
      'Evidence for cannabis in PTSD is limited, and study quality is low. Some patients report symptom relief; controlled evidence has not established efficacy.',
    cannabinoids: ['THC', 'CBD'],
    terpenes: ['linalool', 'limonene', 'caryophyllene'],
    routes: ['inhalation', 'oral', 'sublingual'],
    citations: [NASEM_2017, FL_STATUTE_381_986],
    cautions: [
      'High-THC products can worsen anxiety and, in susceptible individuals, precipitate panic or paranoia. Higher CBD:THC ratios are generally better tolerated.',
      'NASEM found evidence associating cannabis use with increased risk of developing psychotic disorders. Personal or family history of psychosis is a real contraindication.',
    ],
  },
  {
    id: 'appetite-wasting',
    label: 'Appetite loss and wasting (HIV/AIDS)',
    floridaQualifying: true,
    tier: 'limited',
    supportedOutcome:
      'Limited evidence that cannabis and oral cannabinoids increase appetite and reduce weight loss associated with HIV/AIDS.',
    cannabinoids: ['THC', 'THCV'],
    terpenes: ['myrcene', 'humulene'],
    routes: ['oral', 'inhalation'],
    citations: [NASEM_2017, FDA_DRONABINOL],
    cautions: [
      'THCV is often marketed as appetite-suppressing at low doses — the opposite of the goal here. Read the COA, not the marketing.',
    ],
  },
  {
    id: 'glaucoma',
    label: 'Glaucoma',
    floridaQualifying: true,
    tier: 'insufficient',
    supportedOutcome:
      'There is insufficient evidence that cannabinoids are an effective treatment for glaucoma. Any reduction in intraocular pressure is short-lived, requiring impractical dosing frequency.',
    cannabinoids: [],
    terpenes: [],
    routes: [],
    citations: [NASEM_2017, FL_STATUTE_381_986],
    cautions: [
      'Glaucoma is a Florida-qualifying condition, but qualifying legally is not the same as being supported by evidence. X420 will always tell you when those two things diverge.',
      'Do not substitute cannabis for prescribed IOP-lowering therapy. Vision loss from untreated glaucoma is permanent.',
    ],
  },
  {
    id: 'sleep-disturbance',
    label: 'Sleep disturbance (secondary to chronic conditions)',
    floridaQualifying: false,
    tier: 'moderate',
    supportedOutcome:
      'Moderate evidence that cannabinoids improve short-term sleep outcomes in individuals with sleep disturbance associated with OSA, fibromyalgia, chronic pain, and MS.',
    cannabinoids: ['THC', 'CBN'],
    terpenes: ['myrcene', 'linalool'],
    routes: ['oral', 'inhalation'],
    citations: [NASEM_2017],
    cautions: [
      'The evidence is for sleep disturbance SECONDARY to another condition, not for primary insomnia.',
      'CBN is widely marketed as sedating. Human evidence for that specific claim is weak — treat "CBN = sleep" as marketing until better trials exist.',
      'Chronic nightly THC suppresses REM sleep; discontinuation commonly causes rebound insomnia and vivid dreams.',
    ],
  },
] as const;

const BY_ID = new Map(CONDITIONS.map((c) => [c.id, c]));

export function getCondition(id: string): ConditionEvidence | undefined {
  return BY_ID.get(id);
}

export function floridaQualifyingConditions(): readonly ConditionEvidence[] {
  return CONDITIONS.filter((c) => c.floridaQualifying);
}
