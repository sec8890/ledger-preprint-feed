import { hueFor, type LedgerRecord } from '../data/records';
import '../styles/screens.css';
import './BrowseScreen.css';

export function BrowseScreen({
  query,
  setQuery,
  results,
  topicsView,
  toggleTopic,
  sources,
  onOpen,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: LedgerRecord[];
  topicsView: { name: string; on: boolean; count: number }[];
  toggleTopic: (name: string) => void;
  sources: { name: string; available: boolean }[];
  onOpen: (rec: LedgerRecord) => void;
}) {
  const hasQuery = query.trim().length > 0;

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title" style={{ paddingBottom: 14 }}>
          Browse
        </div>
        <div className="browse-search">
          <div className="browse-search-icon" />
          <input
            className="browse-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titles or authors"
          />
          {hasQuery && (
            <div className="browse-clear" onClick={() => setQuery('')}>
              Clear
            </div>
          )}
        </div>
      </div>

      <div className="screen-scroll scr">
        {hasQuery ? (
          <>
            <div className="section-label">
              {results.length} {results.length === 1 ? 'record' : 'records'}
            </div>
            {results.map((it) => (
              <div
                key={it.ref}
                className="browse-result list-row"
                onClick={() => onOpen(it)}
              >
                <div className="browse-result-source" style={{ color: hueFor(it.s) }}>
                  {it.s}
                </div>
                <div className="browse-result-title pretty">{it.title}</div>
                <div className="browse-result-authors">{it.a}</div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">
                  Nothing indexed for that yet. Try a broader term, or an author's name.
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="section-label">Topics</div>
            {topicsView.map((t) => (
              <div
                key={t.name}
                className="browse-topic-row list-row"
                onClick={() => toggleTopic(t.name)}
              >
                <div className="browse-check" data-on={t.on}>
                  {t.on ? '✓' : ''}
                </div>
                <div className="browse-topic-text">
                  <div className="browse-topic-name">{t.name}</div>
                  <div className="browse-topic-count">{t.count} in the feed</div>
                </div>
              </div>
            ))}
            <div className="section-label" style={{ paddingTop: 26 }}>
              Repositories
            </div>
            {sources.map((s) => (
              <div key={s.name} className="browse-source-row list-row">
                <div className="browse-source-name">{s.name}</div>
                {!s.available && <div className="browse-source-kind">No public API</div>}
              </div>
            ))}
            <div style={{ height: 40 }} />
          </>
        )}
      </div>
    </div>
  );
}
