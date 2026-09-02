export interface LedgerRecord {
  s: string;
  t: string;
  ref: string;
  /** Short display date, e.g. "28 Aug" */
  d: string;
  /** Full ISO date (YYYY-MM-DD), used for sorting and full detail-view dates. */
  dateISO?: string;
  title: string;
  a: string;
  ab: string;
  /** Link to the original document, when the source provides one. */
  url?: string;
}

export interface SourceDef {
  name: string;
  /** False for sources with no public API — shown but not toggleable. */
  available: boolean;
  /** Short subject-coverage blurb, shown in onboarding. */
  blurb?: string;
  /** Shortened display name for onboarding (e.g. "bioRxiv" instead of "bioRxiv / medRxiv"). */
  shortName?: string;
}

// Each source gets its own color, since "kind" no longer distinguishes
// records now that the feed is preprints-only.
const DEFAULT_HUE = '#7E8A87';
const DEFAULT_HUE_LIGHT = '#C3CBC9';
const HUE_BY_SOURCE: Record<string, string> = {
  arXiv: '#5E8757',
  bioRxiv: '#3E6B8C',
  medRxiv: '#8A6340',
  SSRN: '#7A5C8A',
};
const HUE_LIGHT_BY_SOURCE: Record<string, string> = {
  arXiv: '#A9C9A0',
  bioRxiv: '#9FC2DE',
  medRxiv: '#D8AF83',
  SSRN: '#C7ADD6',
};

export function hueFor(source: string): string {
  return HUE_BY_SOURCE[source] ?? DEFAULT_HUE;
}
export function hueLightFor(source: string): string {
  return HUE_LIGHT_BY_SOURCE[source] ?? DEFAULT_HUE_LIGHT;
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const FEATURE_LABELS = [
  'Most cited this week',
  'Discussed in your field',
  'Fastest-rising deposit',
  'Cited by two papers you saved',
];

export const TOPICS = [
  'Machine learning',
  'Biotech & genomics',
  'Materials science',
  'Neuroscience',
  'Climate & environment',
  'Quantum',
];

export const SOURCES: SourceDef[] = [
  { name: 'arXiv', available: true, blurb: 'Physics, mathematics, computer science' },
  {
    name: 'bioRxiv / medRxiv',
    available: true,
    shortName: 'bioRxiv',
    blurb: 'Biology, genomics, neuroscience',
  },
  // SSRN has no public API — kept visible so the source is documented, but
  // it can never contribute records and isn't toggleable.
  { name: 'SSRN', available: false },
];

const RAW_DATA: LedgerRecord[] = [
  { s: 'arXiv', t: 'Machine learning', ref: 'arXiv:2608.14421', d: '28 Aug', title: 'Sparse attention routing survives distribution shift without retraining', a: 'M. Petrov, D. Achebe, Wenjun Li, S. Radich', ab: 'We show that routing decisions in sparse-attention transformers remain calibrated under covariate shift when router logits are decoupled from value projections. Across eleven shifted benchmarks the decoupled router recovers 84% of the in-distribution gap at no additional inference cost, and we characterise the failure mode that appears when expert capacity falls below the shift magnitude.' },
  { s: 'bioRxiv', t: 'Biotech & genomics', ref: 'bioRxiv 2026.08.27.612094', d: '27 Aug', title: 'Chromatin accessibility maps of the regenerating axolotl limb blastema', a: 'H. Lindqvist, A. Moreau, T. Baptiste, K. Ferreira', ab: 'Single-nucleus ATAC-seq across five days of blastema formation identifies a transient enhancer class that opens before any lineage marker is expressed. Deleting two of these elements delays but does not prevent regeneration, suggesting a permissive rather than instructive role for early accessibility changes.' },
  { s: 'arXiv', t: 'Materials science', ref: 'arXiv:2608.13780', d: '27 Aug', title: 'Grain-boundary engineering in additively manufactured nickel superalloys via in-situ laser remelting', a: 'P. Konstantinou, R. Abiodun', ab: 'In-situ remelting of each deposited layer with a defocused secondary pass is shown to reduce columnar grain aspect ratio by 60% in laser powder-bed-fused Inconel 718, closing much of the creep-life gap with wrought material without a post-build heat treatment.' },
  { s: 'arXiv', t: 'Quantum', ref: 'arXiv:2608.13990', d: '27 Aug', title: 'Error-mitigated variational eigensolvers on 127-qubit heavy-hex lattices', a: 'Y. Sasaki, L. Brandão, F. Weiss', ab: 'Combining probabilistic error cancellation with a shallow hardware-native ansatz, we estimate ground-state energies of a 40-site transverse-field Ising chain to within 1.4% of exact diagonalisation. Sampling overhead grows more slowly than predicted, which we attribute to correlated readout noise partially cancelling in the estimator.' },
  { s: 'SSRN', t: 'Climate & environment', ref: 'SSRN 5124883', d: '26 Aug', title: 'Carbon border adjustment and firm-level relocation: evidence from EU manufacturers', a: 'C. Delacroix, N. Ravindran', ab: 'Using customs microdata for 41,000 firms we find no detectable relocation response to the first compliance year of the border adjustment mechanism. Reported effects concentrate instead in supplier substitution within the same jurisdiction, which the paper argues is the margin regulators should be monitoring.' },
  { s: 'bioRxiv', t: 'Neuroscience', ref: 'bioRxiv 2026.08.26.611702', d: '26 Aug', title: 'Sleep-dependent replay in human hippocampal single units during memory consolidation', a: 'S. Oduya, E. Kaltenbrunner, R. Mehra', ab: 'Microelectrode recordings from twelve epilepsy patients reveal compressed sequential reactivation during slow-wave sleep that predicts next-day recall accuracy. Replay strength scales with the number of distinct spatial contexts encoded, not with total encoding time.' },
  { s: 'arXiv', t: 'Materials science', ref: 'arXiv:2608.13544', d: '26 Aug', title: 'Machine-learned interatomic potentials for amorphous silicon nitride at deposition temperatures', a: 'B. Yılmaz, D. Whitcombe, A. Sørensen', ab: 'A committee of equivariant potentials trained on 60,000 DFT configurations reproduces the experimental radial distribution function of amorphous silicon nitride across 300–1100 K. The model predicts a nitrogen coordination defect population that correlates with measured dielectric loss.' },
  { s: 'arXiv', t: 'Machine learning', ref: 'arXiv:2608.13120', d: '25 Aug', title: 'Retrieval-free long-context inference via recurrent state compression', a: 'J. Park, V. Anand, L. Okonkwo, M. Ferrand', ab: 'We replace the key-value cache with a learned recurrent summary updated per block, holding memory constant in sequence length. On 200k-token retrieval tasks the method trails full attention by 3 points while using 6% of the memory, and degrades gracefully rather than catastrophically past its training length.' },
  { s: 'medRxiv', t: 'Neuroscience', ref: 'medRxiv 2026.08.24.25301884', d: '24 Aug', title: 'Retinal layer thinning precedes cognitive decline in a twelve-year population cohort', a: 'F. Adeyemi, L. Strand, P. Kaczmarek', ab: 'Optical coherence tomography in 9,412 adults shows that ganglion cell layer thinning is detectable a median of 5.8 years before incident mild cognitive impairment. Effect sizes are modest and the authors caution against screening use at current measurement precision.' },
  { s: 'SSRN', t: 'Climate & environment', ref: 'SSRN 5121447', d: '24 Aug', title: 'Insurance retreat and housing prices in wildfire-exposed counties', a: 'R. Villanueva, H. Tanaka', ab: 'Non-renewal notices predict a 4.1% decline in transaction prices within two quarters, concentrated in properties without recent mitigation work. The paper separates the insurance channel from direct fire risk using a boundary discontinuity in rating territories.' },
  { s: 'arXiv', t: 'Climate & environment', ref: 'arXiv:2608.12781', d: '23 Aug', title: 'Kilometre-scale emulation of convective cloud fields with conditional diffusion', a: 'M. Sato, A. Bergqvist, D. Oyelowo', ab: 'A diffusion emulator trained on two years of convection-permitting simulation reproduces the diurnal cycle of tropical cloud cover at 1.5 km resolution, running four orders of magnitude faster. Extreme precipitation tails are underdispersed, which we quantify and partially correct with a tail-reweighted loss.' },
  { s: 'bioRxiv', t: 'Biotech & genomics', ref: 'bioRxiv 2026.08.23.610988', d: '23 Aug', title: 'Base editing restores dystrophin expression in porcine cardiomyocytes', a: 'N. Okafor, I. Lindgren, C. Barreto, J. Mesa', ab: 'Adenine base editing of a splice acceptor site recovers 62% of wild-type dystrophin in pig cardiac tissue eight weeks after delivery. Off-target editing remains below detection at 41 predicted sites, and cardiac function improves on echocardiography.' },
  { s: 'arXiv', t: 'Neuroscience', ref: 'arXiv:2608.12233', d: '22 Aug', title: 'Topological signatures of cortical travelling waves in wide-field imaging', a: 'T. Alvarsson, R. Bose, M. Duclos', ab: 'Persistent homology applied to mesoscale calcium imaging distinguishes travelling from standing wave regimes without spatial filtering. The classification tracks behavioural state transitions in mice more reliably than phase-gradient measures.' },
  { s: 'arXiv', t: 'Quantum', ref: 'arXiv:2608.11902', d: '21 Aug', title: 'Photonic graph states from deterministic quantum dot emitters', a: 'L. Chevalier, S. Mbeki, H. Ogawa', ab: 'Time-bin entangled photon strings from a single quantum dot are woven into linear cluster states of up to nine photons with 0.71 fidelity. The dominant error is spin dephasing between emission windows, for which we propose a dynamical decoupling remedy.' },
  { s: 'SSRN', t: 'Machine learning', ref: 'SSRN 5118220', d: '20 Aug', title: 'Labour market exposure to autonomous coding agents: a task-level audit', a: 'D. Rasmussen, A. Qureshi', ab: 'Auditing 3,800 software tasks from job postings, we estimate that 22% are fully automatable with current agent capabilities and a further 31% partially. Exposure is highest at the junior end and in maintenance work rather than greenfield development.' },
  { s: 'bioRxiv', t: 'Neuroscience', ref: 'bioRxiv 2026.08.20.610233', d: '20 Aug', title: 'Astrocytic calcium gates synaptic pruning in developing visual cortex', a: 'K. Nyström, P. Sundaram, A. Reyes', ab: 'Chemogenetic suppression of astrocytic calcium during the critical period leaves 30% more spines intact and blunts ocular dominance plasticity. The effect requires astrocytic release of a complement regulator rather than direct contact.' },
];

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

function toISO(shortDate: string, year = 2026): string {
  const [day, mon] = shortDate.split(' ');
  return `${year}-${MONTHS[mon]}-${day.padStart(2, '0')}`;
}

/**
 * Bundled sample data, used only as an offline/error fallback when the
 * live /api/records fetch fails entirely — see useLedger.ts. Never shown
 * without the "sample data" notice that flags it as non-live.
 */
export const DATA: LedgerRecord[] = RAW_DATA.map((r) => ({ ...r, dateISO: toISO(r.d) }));
