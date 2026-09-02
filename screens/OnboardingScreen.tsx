import { useState } from 'react';
import { hueFor } from '../data/records';
import './OnboardingScreen.css';

interface TopicView {
  name: string;
  on: boolean;
}
interface SourceView {
  name: string;
  shortName?: string;
  blurb?: string;
  on: boolean;
}

const STEP_COUNT = 4;

export function OnboardingScreen({
  topicsView,
  toggleTopic,
  sourcesView,
  toggleSourceGroup,
  followedCount,
  onComplete,
}: {
  topicsView: TopicView[];
  toggleTopic: (name: string) => void;
  sourcesView: SourceView[];
  toggleSourceGroup: (name: string) => void;
  followedCount: number;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const availableSources = sourcesView; // already filtered to available-only by the caller

  const onCount = availableSources.filter((s) => s.on).length;

  return (
    <div className="ob-root">
      <div className="ob-top">
        <div className="ob-dots">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <div key={i} className="ob-dot" data-active={i === step} />
          ))}
        </div>
        <button className="ob-skip" onClick={onComplete}>
          Skip
        </button>
      </div>

      <div className="ob-card">
        {step === 0 && <StepIntro />}
        {step === 1 && <StepTopics topicsView={topicsView} toggleTopic={toggleTopic} />}
        {step === 2 && (
          <StepRepos sourcesView={availableSources} toggleSourceGroup={toggleSourceGroup} />
        )}
        {step === 3 && <StepSummary followedCount={followedCount} onCount={onCount} totalCount={availableSources.length} />}
      </div>

      <div className="ob-footer">
        {step > 0 && (
          <button className="ob-btn ob-btn-ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        {step < STEP_COUNT - 1 ? (
          <button
            className="ob-btn ob-btn-primary"
            onClick={() => setStep((s) => s + 1)}
          >
            {step === 0 ? 'Get started' : 'Continue'}
          </button>
        ) : (
          <button className="ob-btn ob-btn-primary" onClick={onComplete}>
            Open the feed
          </button>
        )}
      </div>
    </div>
  );
}

function StepIntro() {
  return (
    <>
      <div className="ob-eyebrow">Ledger</div>
      <div className="ob-headline">The day&apos;s open research, before it reaches a journal.</div>
      <div className="ob-body">
        Ledger reads arXiv and bioRxiv every morning and gives you one column to scan.
      </div>
      <ul className="ob-bullets">
        <li>
          <span className="ob-bullet-dot" style={{ background: hueFor('arXiv') }} />
          <span>
            <strong>arXiv</strong> — physics, mathematics, computer science
          </span>
        </li>
        <li>
          <span className="ob-bullet-dot" style={{ background: hueFor('bioRxiv') }} />
          <span>
            <strong>bioRxiv</strong> — biology, genomics, neuroscience
          </span>
        </li>
      </ul>
    </>
  );
}

function StepTopics({
  topicsView,
  toggleTopic,
}: {
  topicsView: TopicView[];
  toggleTopic: (name: string) => void;
}) {
  const anySelected = topicsView.some((t) => t.on);
  return (
    <>
      <div className="ob-headline ob-headline-sm">What should we watch?</div>
      <div className="ob-body">Pick as many as you like. Leave it empty and you&apos;ll see everything.</div>
      <div className="ob-pills">
        {topicsView.map((t) => (
          <button
            key={t.name}
            className="ob-pill"
            data-on={t.on}
            onClick={() => toggleTopic(t.name)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="ob-hint">{anySelected ? `${topicsView.filter((t) => t.on).length} selected` : 'Nothing selected — everything shows'}</div>
    </>
  );
}

function StepRepos({
  sourcesView,
  toggleSourceGroup,
}: {
  sourcesView: SourceView[];
  toggleSourceGroup: (name: string) => void;
}) {
  return (
    <>
      <div className="ob-headline ob-headline-sm">Which repositories?</div>
      <div className="ob-body">Both are on. Turn one off and it leaves the column.</div>
      <div className="ob-repos">
        {sourcesView.map((s) => (
          <div key={s.name} className="ob-repo-row">
            <div className="ob-repo-text">
              <div className="ob-repo-name">{s.shortName ?? s.name}</div>
              {s.blurb && <div className="ob-repo-blurb">{s.blurb}</div>}
            </div>
            <button
              className="ob-switch"
              data-on={s.on}
              onClick={() => toggleSourceGroup(s.name)}
              aria-label={`Toggle ${s.shortName ?? s.name}`}
            >
              <span className="ob-switch-knob" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function StepSummary({
  followedCount,
  onCount,
  totalCount,
}: {
  followedCount: number;
  onCount: number;
  totalCount: number;
}) {
  const topicsPhrase =
    followedCount === 0
      ? 'Every topic followed'
      : `${followedCount} ${followedCount === 1 ? 'topic' : 'topics'} followed`;
  return (
    <>
      <div className="ob-headline ob-headline-sm">Your column is ready.</div>
      <div className="ob-body">
        {topicsPhrase}, {onCount} of {totalCount} repositories on. Both are changeable any time
        under Settings.
      </div>
      <div className="ob-tips">
        <div className="ob-tip">
          <div className="ob-tip-title">Tap a title to read it</div>
          <div className="ob-tip-body">Abstracts expand in place; the original PDF is one tap further.</div>
        </div>
        <div className="ob-tip">
          <div className="ob-tip-title">Save to your Library</div>
          <div className="ob-tip-body">Anything you save stays available offline under Library.</div>
        </div>
        <div className="ob-tip">
          <div className="ob-tip-title">Search authors and titles</div>
          <div className="ob-tip-body">Browse searches every indexed deposit as you type.</div>
        </div>
      </div>
    </>
  );
}
