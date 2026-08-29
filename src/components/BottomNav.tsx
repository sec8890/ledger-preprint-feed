import type { Screen } from '../state/useLedger';
import './BottomNav.css';

const ITEMS: { screen: Screen; label: string }[] = [
  { screen: 'feed', label: 'Feed' },
  { screen: 'topics', label: 'Browse' },
  { screen: 'saved', label: 'Library' },
  { screen: 'settings', label: 'Settings' },
];

export function BottomNav({
  current,
  dark,
  onNavigate,
}: {
  current: Screen;
  dark: boolean;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <nav className="bottom-nav" data-dark={dark} aria-label="Primary">
      {ITEMS.map((it) => (
        <button
          key={it.screen}
          className="bottom-nav-item"
          data-active={current === it.screen}
          onClick={() => onNavigate(it.screen)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
