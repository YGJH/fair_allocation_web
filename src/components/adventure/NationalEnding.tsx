'use client';

import type { RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import type { CampaignEndingState, CampaignRecord } from '../../narrative/types';
import flowStyles from './VerdictFlow.module.css';

type NationalEndingProps = {
  readonly locale: Locale;
  readonly ending: CampaignEndingState;
  readonly records: readonly CampaignRecord[];
  readonly onContinue: () => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
  readonly completed?: boolean;
};

export function NationalEnding({ locale, ending, onContinue, headingRef, completed = false }: NationalEndingProps) {
  const copy = getAdventureCopy(locale).ending;
  const historyEntry = copy.history[ending.resolution.ending];
  const history = 'formal' in historyEntry
    ? historyEntry
    : historyEntry[ending.resolution.severity === 'severe' ? 'severe' : 'mild'];
  const grades = ending.summary.grades.map((grade) => copy.gradeNames[grade]);
  const ratings = ending.summary.initialRatings;
  const seals = ending.summary.masterSeals;
  const party = ending.resolution.mostAggrievedParty
    ? copy.mostAggrievedPartyNames[ending.resolution.mostAggrievedParty]
    : null;
  const yiwuVignette = copy.vignettes.yiwu[ending.summary.yiwuVignette];
  const hangzhouVignette = copy.vignettes.hangzhou[ending.summary.hangzhouVignette];
  return (
    <section className={flowStyles.finalPanel} aria-labelledby="national-ending-title" data-national-ending>
      <p className={flowStyles.eyebrow}>{copy.heading}</p>
      <h1 ref={headingRef} id="national-ending-title" tabIndex={-1}>{copy.outcomeNames[ending.resolution.ending]}</h1>
      {party || ending.resolution.severity !== 'none' ? <div className={flowStyles.endingMeta}>
        {party ? <p>{copy.mostAggrievedLabel}: {party}</p> : null}
        {ending.resolution.severity !== 'none' ? <p>{copy.severityLabel}: {copy.severityNames[ending.resolution.severity]}</p> : null}
      </div> : null}
      <section aria-labelledby="history-book-text">
        <h2 id="history-book-text">{copy.formalLabel}</h2>
        <blockquote>{history.formal}</blockquote>
      </section>
      <section aria-labelledby="plain-language-account">
        <h2 id="plain-language-account">{copy.companionLabel}</h2>
        <p>{history.plain}</p>
      </section>
      <section aria-labelledby="epilogue-summary">
        <h2 id="epilogue-summary">{copy.summaryHeading}</h2>
        <p><strong>{copy.gradesLabel}:</strong> {grades.join(' · ')}</p>
        <p><strong>{copy.initialRatingsLabel}:</strong> {ratings.map((rating, index) => `${rating === null ? '—' : `${rating}/5`} → ${grades[index]}`).join(' · ')}</p>
        <p><strong>{copy.sealsLabel}:</strong> {seals.map((earned, index) => `${index + 1}: ${earned ? copy.earnedMark : copy.notEarnedMark}`).join(' · ')}</p>
        <p><strong>{copy.overallSealLabel}:</strong> {copy.overallSealNames[ending.summary.overallSeal]}</p>
        <p><strong>{copy.yiwuVignetteLabel}:</strong> {yiwuVignette}</p>
        <p><strong>{copy.hangzhouVignetteLabel}:</strong> {hangzhouVignette}</p>
      </section>
      <p role="status">{ending.hiddenEnding ? copy.hiddenUnlocked : copy.hiddenLocked}</p>
      {ending.hiddenCutsceneWatched ? <p>{copy.hiddenHistory}</p> : null}
      {completed ? <><p role="status">{copy.completedHeading}</p><p>{copy.completedBody}</p><span>{copy.completedLabel}</span></> : <button type="button" className={flowStyles.primary} onClick={onContinue}>{copy.continueLabel}</button>}
    </section>
  );
}
