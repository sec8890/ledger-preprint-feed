import { hueFor, type LedgerRecord } from '../data/records';
import '../styles/screens.css';
import './LibraryScreen.css';

export function LibraryScreen({
  savedItems,
  toggleSaved,
  onOpen,
}: {
  savedItems: LedgerRecord[];
  toggleSaved: (rec: LedgerRecord) => void;
  onOpen: (rec: LedgerRecord) => void;
}) {
  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">Library</div>
        <div className="lib-subtitle">
          {savedItems.length ? `${savedItems.length} saved` : 'Nothing saved yet'}
        </div>
      </div>
      <div className="screen-scroll scr">
        {savedItems.map((it) => (
          <div key={it.ref} className="lib-row list-row">
            <div className="lib-meta" style={{ color: hueFor(it.s) }}>
              {it.s} · {it.d}
            </div>
            <div className="lib-title pretty" onClick={() => onOpen(it)}>
              {it.title}
            </div>
            <div className="lib-authors">{it.a}</div>
            <div className="lib-remove" onClick={() => toggleSaved(it)}>
              Remove
            </div>
          </div>
        ))}
        {savedItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-mark" />
            <div className="empty-state-text">
              Saved preprints collect here. Tap Save on any item in the feed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
