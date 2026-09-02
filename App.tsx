import { BottomNav } from './components/BottomNav';
import { BrowseScreen } from './screens/BrowseScreen';
import { DetailScreen } from './screens/DetailScreen';
import { FeedScreen } from './screens/FeedScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useLedger } from './state/useLedger';

export default function App() {
  const ledger = useLedger();
  const {
    screen,
    setScreen,
    mode,
    setMode,
    expanded,
    toggleExpanded,
    saved,
    toggleSaved,
    savedItems,
    toggleTopic,
    topicsView,
    toggleSourceGroup,
    sourcesView,
    detail,
    setDetail,
    feed,
    onFeedScroll,
    query,
    setQuery,
    results,
    followedCount,
    usingFallback,
    sourceErrors,
    onboarded,
    completeOnboarding,
  } = ledger;

  const navDark = screen === 'feed' && mode === 'dark' && !detail;

  if (!onboarded) {
    return (
      <OnboardingScreen
        topicsView={topicsView}
        toggleTopic={toggleTopic}
        sourcesView={sourcesView.filter((s) => s.available)}
        toggleSourceGroup={toggleSourceGroup}
        followedCount={followedCount}
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <>
      {!detail && usingFallback && (
        <div className="status-banner">Showing sample data — live sources unavailable right now.</div>
      )}
      {!detail && !usingFallback && sourceErrors.length > 0 && (
        <div className="status-banner">
          {sourceErrors.length === 1
            ? `${sourceErrors[0].source} is unavailable right now.`
            : `${sourceErrors.map((e) => e.source).join(', ')} are unavailable right now.`}
        </div>
      )}
      {detail ? (
        <DetailScreen
          record={detail}
          isSaved={!!saved[detail.ref]}
          onClose={() => setDetail(null)}
          onToggleSave={() => toggleSaved(detail)}
        />
      ) : (
        <>
          {screen === 'feed' && (
            <FeedScreen
              feed={feed}
              mode={mode}
              setMode={setMode}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              saved={saved}
              toggleSaved={toggleSaved}
              onFeedScroll={onFeedScroll}
              onOpen={setDetail}
            />
          )}
          {screen === 'topics' && (
            <BrowseScreen
              query={query}
              setQuery={setQuery}
              results={results}
              topicsView={topicsView}
              toggleTopic={toggleTopic}
              sources={sourcesView}
              onOpen={setDetail}
            />
          )}
          {screen === 'saved' && (
            <LibraryScreen
              savedItems={savedItems}
              toggleSaved={toggleSaved}
              onOpen={setDetail}
            />
          )}
          {screen === 'settings' && (
            <SettingsScreen
              sources={sourcesView}
              toggleSourceGroup={toggleSourceGroup}
              followedCount={followedCount}
            />
          )}
        </>
      )}
      <BottomNav current={screen} dark={navDark} onNavigate={setScreen} />
    </>
  );
}
