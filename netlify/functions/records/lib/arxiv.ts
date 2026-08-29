import { XMLParser } from 'fast-xml-parser';
import { collapseWhitespace, shortDate } from './format';
import type { ApiRecord, SourceResult, Topic } from './types';

// arXiv has no notion of our six buckets, so each is queried as its own
// category search rather than inferred from the response.
const TOPIC_CATEGORY: Record<Topic, string> = {
  'Machine learning': 'cs.LG',
  'Biotech & genomics': 'q-bio.GN',
  'Materials science': 'cond-mat.mtrl-sci',
  Neuroscience: 'q-bio.NC',
  'Climate & environment': 'physics.ao-ph',
  Quantum: 'quant-ph',
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function toRecord(entry: Record<string, unknown>, topic: Topic): ApiRecord | null {
  try {
    const idUrl = String(entry.id);
    const shortId = idUrl.split('/abs/')[1]?.replace(/v\d+$/, '') ?? idUrl;
    const published = String(entry.published ?? entry.updated);

    const authorsRaw = entry.author as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const authorList = Array.isArray(authorsRaw) ? authorsRaw : authorsRaw ? [authorsRaw] : [];
    const authors = authorList
      .map((a) => a?.name)
      .filter(Boolean)
      .join(', ');

    const linksRaw = entry.link as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const links = Array.isArray(linksRaw) ? linksRaw : linksRaw ? [linksRaw] : [];
    const pdfLink = links.find((l) => l?.['@_title'] === 'pdf')?.['@_href'] as string | undefined;

    return {
      s: 'arXiv',
      t: topic,
      ref: `arXiv:${shortId}`,
      d: shortDate(published),
      dateISO: published,
      title: collapseWhitespace(String(entry.title ?? '')),
      a: authors || 'Unknown authors',
      ab: collapseWhitespace(String(entry.summary ?? '')),
      url: pdfLink ?? `https://arxiv.org/abs/${shortId}`,
    };
  } catch {
    return null;
  }
}

async function fetchTopic(
  topic: Topic,
  category: string,
  maxResults: number,
  signal: AbortSignal,
): Promise<ApiRecord[]> {
  const url =
    'https://export.arxiv.org/api/query?search_query=' +
    encodeURIComponent(`cat:${category}`) +
    `&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`arXiv ${category} responded ${res.status}`);
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const entriesRaw = parsed?.feed?.entry;
  const entries: Record<string, unknown>[] = Array.isArray(entriesRaw)
    ? entriesRaw
    : entriesRaw
      ? [entriesRaw]
      : [];
  return entries.map((e) => toRecord(e, topic)).filter((r): r is ApiRecord => r !== null);
}

export async function fetchArxiv(signal: AbortSignal, maxResultsPerTopic = 20): Promise<SourceResult> {
  const topics = Object.keys(TOPIC_CATEGORY) as Topic[];
  const settled = await Promise.allSettled(
    topics.map((t) => fetchTopic(t, TOPIC_CATEGORY[t], maxResultsPerTopic, signal)),
  );
  const records = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const failures = settled.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  return {
    source: 'arXiv',
    records,
    error: records.length === 0 && failures.length ? failures.map((f) => String(f.reason)).join('; ') : undefined,
  };
}
