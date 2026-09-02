import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DATA, SOURCES, TOPICS, type LedgerRecord } from '../data/records';

export type Screen = 'feed' | 'topics' | 'saved' | 'settings';
export type Mode = 'light' | 'dark';
export type LoadStatus = 'loading' | 'ready';

export interface SourceError {
  source: string;
  error: string;
}

const RECORDS_URL = '/api/records';

export interface FeedItem extends LedgerRecord {
  id: string;
  key: string;
}

const STORAGE_KEY = 'ledger:v1';

interface PersistedState {
  saved: Record<string, LedgerRecord>;
  topics: Record<string, boolean>;
  off: Record<string, boolean>;
  mode: Mode;
  onboarded: boolean;
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { onboarded: false, ...JSON.parse(raw) };
  } catch {
    // ignore corrupt/inaccessible storage
  }
  return { saved: {}, topics: {}, off: {}, mode: 'light', onboarded: false };
}

export function useLedger() {
  const persisted = useMemo(loadPersisted, []);

  const [screen, setScreen] = useState<Screen>('feed');
  const [mode, setMode] = useState<Mode>(persisted.mode);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, LedgerRecord>>(persisted.saved);
  const [topics, setTopics] = useState<Record<string, boolean>>(persisted.topics);
  const [off, setOff] = useState<Record<string, boolean>>(persisted.off);
  const [count, setCount] = useState(8);
  const [detail, setDetail] = useState<LedgerRecord | null>(null);
  const [onboarded, setOnboarded] = useState(persisted.onboarded);

  const [liveRecords, setLiveRecords] = useState<LedgerRecord[] | null>(null);
  const [sourceErrors, setSourceErrors] = useState<SourceError[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(RECORDS_URL);
        if (!res.ok) throw new Error(`records fetch failed: ${res.status}`);
        const json = (await res.json()) as { records?: LedgerRecord[]; sourceErrors?: SourceError[] };
        if (cancelled) return;
        setLiveRecords(Array.isArray(json.records) ? json.records : []);
        setSourceErrors(Array.isArray(json.sourceErrors) ? json.sourceErrors : []);
      } catch {
        // No backend reachable (e.g. `vite dev` without `netlify dev`, or a
        // network hiccup) — fall through to the bundled sample data below.
        if (!cancelled) setLiveRecords([]);
      } finally {
        if (!cancelled) setLoadStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const usingFallback = loadStatus === 'ready' && (!liveRecords || liveRecords.length === 0);
  const allRecords = useMemo(() => {
    if (liveRecords && liveRecords.length > 0) return liveRecords;
    return loadStatus === 'ready' ? DATA : [];
  }, [liveRecords, loadStatus]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ saved, topics, off, mode, onboarded }));
    } catch {
      // storage may be unavailable (private mode, quota) — persistence is best-effort
    }
  }, [saved, topics, off, mode, onboarded]);

  const completeOnboarding = useCallback(() => setOnboarded(true), []);

  const pool = useMemo(() => {
    const picked = Object.keys(topics).filter((k) => topics[k]);
    return allRecords.filter(
      (d) => !off[d.s] && (picked.length === 0 || picked.includes(d.t)),
    );
  }, [allRecords, topics, off]);

  const feed: FeedItem[] = useMemo(() => {
    const out: FeedItem[] = [];
    if (!pool.length) return out;
    for (let i = 0; i < count; i++) {
      const base = pool[i % pool.length];
      const id = i < pool.length ? base.ref : base.ref + '#' + i;
      out.push({ ...base, id, key: id + ':' + i });
    }
    return out;
  }, [pool, count]);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFeedScroll = useCallback((el: HTMLElement) => {
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 420) {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setCount((c) => c + 6), 380);
    }
  }, []);

  const toggleExpanded = useCallback((key: string) => {
    setExpanded((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const toggleSaved = useCallback((rec: LedgerRecord) => {
    setSaved((s) => {
      const n = { ...s };
      if (n[rec.ref]) delete n[rec.ref];
      else n[rec.ref] = rec;
      return n;
    });
  }, []);

  const toggleTopic = useCallback((name: string) => {
    setTopics((s) => ({ ...s, [name]: !s[name] }));
    setCount(8);
  }, []);

  const toggleSourceGroup = useCallback((sourceName: string) => {
    const names =
      sourceName === 'bioRxiv / medRxiv' ? ['bioRxiv', 'medRxiv'] : [sourceName];
    setOff((s) => {
      const currentlyOn = !names.every((n) => s[n]);
      const n = { ...s };
      names.forEach((nm) => {
        if (currentlyOn) n[nm] = true;
        else delete n[nm];
      });
      return n;
    });
    setCount(8);
  }, []);

  const q = query.trim().toLowerCase();
  const results: LedgerRecord[] = useMemo(() => {
    if (!q) return [];
    return allRecords.filter((x) =>
      (x.title + ' ' + x.a + ' ' + x.ab + ' ' + x.t).toLowerCase().includes(q),
    );
  }, [allRecords, q]);

  const savedItems = useMemo(() => Object.values(saved), [saved]);

  const followedCount = useMemo(
    () => Object.keys(topics).filter((k) => topics[k]).length,
    [topics],
  );

  const sourcesView = useMemo(
    () =>
      SOURCES.map((s) => {
        const names = s.name === 'bioRxiv / medRxiv' ? ['bioRxiv', 'medRxiv'] : [s.name];
        const on = !names.every((n) => off[n]);
        return { ...s, on };
      }),
    [off],
  );

  const topicsView = useMemo(
    () =>
      TOPICS.map((name) => ({
        name,
        on: !!topics[name],
        count: allRecords.filter((r) => r.t === name).length,
      })),
    [topics, allRecords],
  );

  return {
    screen,
    setScreen,
    mode,
    setMode,
    query,
    setQuery,
    expanded,
    toggleExpanded,
    saved,
    toggleSaved,
    savedItems,
    topics,
    toggleTopic,
    topicsView,
    off,
    toggleSourceGroup,
    sourcesView,
    count,
    setCount,
    detail,
    setDetail,
    pool,
    feed,
    onFeedScroll,
    q,
    results,
    followedCount,
    loadStatus,
    usingFallback,
    sourceErrors,
    onboarded,
    completeOnboarding,
  };
}
