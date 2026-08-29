import '../styles/screens.css';
import './SettingsScreen.css';

export function SettingsScreen({
  sources,
  toggleSourceGroup,
  followedCount,
}: {
  sources: { name: string; on: boolean; available: boolean }[];
  toggleSourceGroup: (name: string) => void;
  followedCount: number;
}) {
  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">Settings</div>
      </div>
      <div className="screen-scroll scr">
        <div className="section-label" style={{ paddingTop: 22 }}>
          Sources
        </div>
        {sources.map((s) =>
          s.available ? (
            <div
              key={s.name}
              className="settings-row list-row"
              onClick={() => toggleSourceGroup(s.name)}
            >
              <div className="settings-row-label">{s.name}</div>
              <div className="settings-switch" data-on={s.on}>
                <div className="settings-knob" />
              </div>
            </div>
          ) : (
            <div key={s.name} className="settings-row settings-static list-row">
              <div className="settings-row-label settings-row-label-dim">{s.name}</div>
              <div className="settings-row-value">No public API</div>
            </div>
          ),
        )}

        <div className="section-label" style={{ paddingTop: 26 }}>
          Feed
        </div>
        <div className="settings-row settings-static list-row">
          <div className="settings-row-label">Sort</div>
          <div className="settings-row-value">Newest deposit</div>
        </div>
        <div className="settings-row settings-static list-row">
          <div className="settings-row-label">Topics followed</div>
          <div className="settings-row-value">{followedCount || 'All'}</div>
        </div>

        <div className="settings-footnote">
          Ledger indexes open preprint repositories. Records remain the property of their
          authors.
        </div>
      </div>
    </div>
  );
}
