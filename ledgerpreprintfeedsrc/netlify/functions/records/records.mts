import type { Config } from '@netlify/functions';
import { fetchArxiv } from './lib/arxiv';
import { fetchBiorxiv } from './lib/biorxiv';
import type { ApiRecord, SourceResult } from './lib/types';

export default async (_req: Request) => {
  const controller = new AbortController();
  // Netlify Functions have their own execution limit; keep upstream calls
  // well under it so a slow source can't hang the whole response.
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const results: SourceResult[] = await Promise.all([
      fetchArxiv(controller.signal),
      fetchBiorxiv(controller.signal),
      // SSRN has no public API — nothing to fetch. It's surfaced to the
      // client as an explicit "unavailable" source rather than silently
      // producing zero records. Patents are out of scope entirely: Google
      // Patents has no public API, and the real alternative (PatentsView)
      // requires an identity-verified signup the user opted out of.
    ]);

    const seen = new Set<string>();
    const records: ApiRecord[] = [];
    for (const result of results) {
      for (const rec of result.records) {
        if (seen.has(rec.ref)) continue;
        seen.add(rec.ref);
        records.push(rec);
      }
    }
    records.sort((a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0));

    const sourceErrors = results.filter((r) => r.error).map((r) => ({ source: r.source, error: r.error! }));

    return new Response(JSON.stringify({ records, sourceErrors }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        // Short edge cache so the underlying free/rate-limited APIs aren't
        // hit on every single client poll.
        'cache-control': 'public, max-age=120, s-maxage=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ records: [], sourceErrors: [{ source: 'all', error: String(err) }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: '/api/records',
};
