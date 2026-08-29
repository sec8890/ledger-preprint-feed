import { hueFor, type LedgerRecord } from '../data/records';
import '../styles/screens.css';
import './DetailScreen.css';

export function DetailScreen({
  record,
  isSaved,
  onClose,
  onToggleSave,
}: {
  record: LedgerRecord;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
}) {
  const hue = hueFor(record.s);
  const fullDate = record.dateISO
    ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(record.dateISO),
      )
    : record.d;

  return (
    <div className="screen">
      <div className="detail-header">
        <div className="detail-back" onClick={onClose}>
          ← Back
        </div>
        <div className="detail-spacer" />
        <div className="detail-save" onClick={onToggleSave}>
          {isSaved ? 'Saved' : 'Save'}
        </div>
      </div>
      <div className="screen-scroll scr">
        <div className="detail-top">
          <div className="detail-source-row">
            <div className="detail-dot" style={{ background: hue }} />
            <div className="detail-source" style={{ color: hue }}>
              {record.s}
            </div>
          </div>
          <div className="detail-title pretty">{record.title}</div>
          <div className="detail-authors">{record.a}</div>
        </div>

        <div className="detail-meta-grid">
          <div className="detail-meta-label">Ref</div>
          <div className="detail-meta-value">{record.ref}</div>
          <div className="detail-meta-label">Deposited</div>
          <div className="detail-meta-value">{fullDate}</div>
          <div className="detail-meta-label">Topic</div>
          <div className="detail-meta-value">{record.t}</div>
        </div>

        <div className="detail-body-label">Abstract</div>
        <div className="detail-body pretty">{record.ab}</div>

        <div className="detail-cta-wrap">
          {record.url ? (
            <a className="detail-cta" href={record.url} target="_blank" rel="noreferrer">
              Open original
            </a>
          ) : (
            <button className="detail-cta" disabled>
              Original not linked
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
