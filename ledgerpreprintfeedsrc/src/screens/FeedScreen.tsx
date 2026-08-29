import { useEffect, useMemo, useRef } from 'react';
import type { LedgerRecord } from '../data/records';
import { FEATURE_LABELS, hexToRgba, hueFor, hueLightFor } from '../data/records';
import type { FeedItem, Mode } from '../state/useLedger';
import './FeedScreen.css';

function isFeature(i: number) {
  return i < 500 && i % 6 === 5;
}

export function FeedScreen({
  feed,
  mode,
  setMode,
  expanded,
  toggleExpanded,
  saved,
  toggleSaved,
  onFeedScroll,
  onOpen,
}: {
  feed: FeedItem[];
  mode: Mode;
  setMode: (m: Mode) => void;
  expanded: Record<string, boolean>;
  saved: Record<string, LedgerRecord>;
  toggleSaved: (rec: LedgerRecord) => void;
  toggleExpanded: (key: string) => void;
  onFeedScroll: (el: HTMLElement) => void;
  onOpen: (rec: LedgerRecord) => void;
}) {
  const washRef = useRef<HTMLDivElement | null>(null);
  const vel = useRef(0);
  const lastTop = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const tick = () => {
      vel.current *= 0.945;
      const el = washRef.current;
      if (el) {
        const boost = Math.min(vel.current / 2400, 1);
        el.style.opacity = (0.46 + boost * 0.46).toFixed(3);
        el.style.filter = `saturate(${(1 + boost * 0.9).toFixed(2)}) brightness(${(1 + boost * 0.22).toFixed(2)})`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const top = el.scrollTop;
    vel.current = Math.min(2600, vel.current + Math.abs(top - lastTop.current) * 4.5);
    lastTop.current = top;
    onFeedScroll(el);
  };

  const dark = mode === 'dark';

  return (
    <div className="lq-root" data-mode={mode}>
      <div className="lq-wash" ref={washRef}>
        <div className="lq-blob lq-blob-a" />
        <div className="lq-blob lq-blob-b" />
        <div className="lq-blob lq-blob-c" />
      </div>

      <div className="lq-header">
        <div className="lq-header-spec" />
        <div className="lq-header-content">
          <div className="lq-header-row">
            <div className="lq-title">Today</div>
            <div className="lq-mode-toggle">
              <button
                className="lq-mode-btn"
                data-on={mode === 'light'}
                onClick={() => setMode('light')}
              >
                Light
              </button>
              <button
                className="lq-mode-btn"
                data-on={mode === 'dark'}
                onClick={() => setMode('dark')}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lq-scroll scr" onScroll={handleScroll}>
        {feed.map((it, i) =>
          isFeature(i) ? (
            <FeatureSlab
              key={it.key}
              item={it}
              index={i}
              dark={dark}
              isSaved={!!saved[it.ref]}
              onToggleSave={() => toggleSaved(it)}
              onOpen={onOpen}
            />
          ) : (
            <PlainCard
              key={it.key}
              item={it}
              dark={dark}
              expanded={!!expanded[it.key]}
              isSaved={!!saved[it.ref]}
              onToggleExpand={() => toggleExpanded(it.key)}
              onToggleSave={() => toggleSaved(it)}
              onOpen={() => onOpen(it)}
            />
          ),
        )}
        <div className="lq-loader">
          <div className="spinner" />
          <div className="lq-loader-text">Fetching newer deposits</div>
        </div>
      </div>
    </div>
  );
}

function PlainCard({
  item,
  dark,
  expanded,
  isSaved,
  onToggleExpand,
  onToggleSave,
  onOpen,
}: {
  item: FeedItem;
  dark: boolean;
  expanded: boolean;
  isSaved: boolean;
  onToggleExpand: () => void;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const softHue = dark ? hueLightFor(item.s) : hueFor(item.s);
  return (
    <div className="lq-card">
      <div className="lq-card-spec" />
      <div className="lq-card-rim" />
      <div className="lq-card-body">
        <div className="lq-card-head">
          <div className="pill" style={{ color: softHue }}>
            {item.s}
          </div>
          <div className="lq-card-meta">
            {item.t} · {item.d}
          </div>
        </div>
        <div className="lq-card-title" onClick={onOpen}>
          {item.title}
        </div>
        <div className="lq-card-authors">{item.a}</div>
        <div
          className={'lq-card-abstract' + (expanded ? '' : ' clamp2')}
          onClick={onToggleExpand}
        >
          {item.ab}
        </div>
        <div className="lq-card-footer">
          <button
            className="glass-btn"
            data-saved={isSaved}
            style={{ color: isSaved ? softHue : undefined }}
            onClick={onToggleSave}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
          {item.url ? (
            <a className="glass-btn" href={item.url} target="_blank" rel="noreferrer">
              PDF
            </a>
          ) : (
            <button className="glass-btn" onClick={onOpen}>
              PDF
            </button>
          )}
          <div className="lq-spacer" />
          <button className="glass-btn" onClick={onToggleExpand}>
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureSlab({
  item,
  index,
  dark,
  isSaved,
  onToggleSave,
  onOpen,
}: {
  item: FeedItem;
  index: number;
  dark: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpen: (rec: LedgerRecord) => void;
}) {
  const featureLabel = useMemo(
    () => FEATURE_LABELS[Math.floor(index / 6) % FEATURE_LABELS.length],
    [index],
  );
  const hueLight = hueLightFor(item.s);
  const glow = hexToRgba(hueFor(item.s), dark ? 0.36 : 0.42);
  return (
    <div className="lq-slab">
      <div className="lq-slab-glow" style={{ background: `radial-gradient(circle at 50% 50%, ${glow} 0%, transparent 70%)` }} />
      <div className="lq-slab-spec" />
      <div className="lq-slab-body">
        <div className="lq-slab-head">
          <div className="lq-slab-dot" style={{ background: hueLight }} />
          <div className="lq-slab-label" style={{ color: hueLight }}>
            {featureLabel}
          </div>
        </div>
        <div className="lq-slab-title" onClick={() => onOpen(item)}>
          {item.title}
        </div>
        <div className="lq-slab-authors">{item.a}</div>
        <div className="lq-slab-footer">
          <button
            className="glass-btn-dark"
            data-saved={isSaved}
            style={{ color: isSaved ? hueLight : undefined }}
            onClick={onToggleSave}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="glass-btn-dark" onClick={() => onOpen(item)}>
            Read
          </button>
          <div className="lq-spacer" />
          <div className="lq-slab-source">{item.s}</div>
        </div>
      </div>
    </div>
  );
}
