import { collapseWhitespace, initialLast, shortDate } from './format';
import type { ApiRecord, SourceResult } from './types';

type Server = 'biorxiv' | 'medrxiv';

// bioRxiv/medRxiv only cover life-sciences subjects, so only two of our six
// topics can honestly be populated from this source — the rest are skipped
// rather than mislabeled.
const BIOTECH_CATEGORIES = new Set([
  'genomics',
  'genetics',
  'molecular biology',
  'synthetic biology',
  'microbiology',
  'biochemistry',
  'bioinformatics',
  'systems biology',
  'cell biology',
  'developmental biology',
  'immunology',
]);
const NEURO_CATEGORIES = new Set(['neuroscience']);

function mapCategory(cat: string): 'Biotech & genomics' | 'Neuroscience' | null {
  const c = cat.trim().toLowerCase();
  if (NEURO_CATEGORIES.has(c)) return 'Neuroscience';
  if (BIOTECH_CATEGORIES.has(c)) return 'Biotech & genomics';
  return null;
}

interface RawItem {
  doi: string;
  title: string;
  authors: string;
  date: string;
  category: string;
  abstract: string;
}

async function fetchServer(server: Server, signal: AbortSignal): Promise<RawItem[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 10 * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const interval = `${iso(start)}/${iso(end)}`;
  const out: RawItem[] = [];
  for (const cursor of [0, 100]) {
    const url = `https://api.biorxiv.org/details/${server}/${interval}/${cursor}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${server} responded ${res.status}`);
    const json = (await res.json()) as { collection?: RawItem[] };
    const collection = Array.isArray(json.collection) ? json.collection : [];
    out.push(...collection);
    if (collection.length < 100) break;
  }
  return out;
}

function toRecord(item: RawItem, server: Server): ApiRecord | null {
  const topic = mapCategory(item.category ?? '');
  if (!topic) return null;
  try {
    const label = server === 'biorxiv' ? 'bioRxiv' : 'medRxiv';
    const authors = (item.authors ?? '')
      .split(';')
      .map((a) => a.trim())
      .filter(Boolean)
      .map(initialLast)
      .join(', ');
    return {
      s: label,
      t: topic,
      ref: `${label} ${item.doi.split('/').pop()}`,
      d: shortDate(item.date),
      dateISO: item.date,
      title: collapseWhitespace(item.title ?? ''),
      a: authors || 'Unknown authors',
      ab: collapseWhitespace(item.abstract ?? ''),
      url: `https://doi.org/${item.doi}`,
    };
  } catch {
    return null;
  }
}

export async function fetchBiorxiv(signal: AbortSignal): Promise<SourceResult> {
  const settled = await Promise.allSettled([
    fetchServer('biorxiv', signal),
    fetchServer('medrxiv', signal),
  ]);
  const records: ApiRecord[] = [];
  const errors: string[] = [];
  (['biorxiv', 'medrxiv'] as Server[]).forEach((server, i) => {
    const outcome = settled[i];
    if (outcome.status === 'fulfilled') {
      for (const item of outcome.value) {
        const rec = toRecord(item, server);
        if (rec) records.push(rec);
      }
    } else {
      errors.push(`${server}: ${outcome.reason}`);
    }
  });
  return {
    source: 'bioRxiv / medRxiv',
    records,
    error: records.length === 0 && errors.length ? errors.join('; ') : undefined,
  };
}
