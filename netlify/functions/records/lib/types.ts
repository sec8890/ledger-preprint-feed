/** A record as returned by the /records function, ready for the client's LedgerRecord shape. */
export interface ApiRecord {
  s: string;
  t: string;
  ref: string;
  /** Short display date, e.g. "28 Aug" */
  d: string;
  /** Full ISO date (YYYY-MM-DD) for correct sorting and detail-view formatting. */
  dateISO: string;
  title: string;
  a: string;
  ab: string;
  /** Link to the original document, when the source provides one. */
  url?: string;
}

export const TOPICS = [
  'Machine learning',
  'Biotech & genomics',
  'Materials science',
  'Neuroscience',
  'Climate & environment',
  'Quantum',
] as const;

export type Topic = (typeof TOPICS)[number];

export interface SourceResult {
  source: string;
  records: ApiRecord[];
  /** Set when the source produced zero usable records due to an error. */
  error?: string;
}

