'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import type { CampaignVerdict } from '../../narrative/types';
import { ShareGauge } from './ShareGauge';
import styles from './VerdictFlow.module.css';

const LAST_STEP = 3;

export function CaseScrollDebrief({
  locale,
  verdict,
  watched,
  onWatched,
  onContinue,
  headingRef,
}: {
  locale: Locale;
  verdict: CampaignVerdict;
  watched: boolean;
  onWatched: () => void;
  onContinue: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const copy = getAdventureCopy(locale).investigation.debrief;
  const parties = [
    getAdventureCopy(locale).investigation.allocation.partyNames['chen-shouye'].name,
    getAdventureCopy(locale).investigation.allocation.partyNames['chen-congzheng'].name,
  ];
  const [step, setStep] = useState(0);
  const watchedRef = useRef(false);
  const complete = step === LAST_STEP;

  function recordWatched() {
    if (watchedRef.current) return;
    watchedRef.current = true;
    onWatched();
  }

  useEffect(() => {
    if (complete) recordWatched();
  }, [complete]);

  function showAll() {
    setStep(LAST_STEP);
    recordWatched();
  }

  function next() {
    if (step < LAST_STEP) {
      setStep((current) => Math.min(LAST_STEP, current + 1));
      return;
    }
    onContinue();
  }

  return (
    <section className={styles.scroll} aria-labelledby="case-scroll-title" data-case-scroll>
      <header className={styles.scrollHeader}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 ref={headingRef} tabIndex={-1} id="case-scroll-title">{copy.heading}</h2>
        <p>{copy.intro}</p>
      </header>
      <div className={styles.scrollActions}>
        <button type="button" className={styles.secondary} onClick={showAll}>{copy.showAll}</button>
        {watched && !complete ? <span role="status">{copy.completeAnnouncement}</span> : null}
      </div>
      <div className={styles.revealStack} aria-live="polite">
        {step >= 0 ? (
          <article className={styles.revealStep} aria-labelledby="reveal-utility-title">
            <h3 id="reveal-utility-title">{copy.utilityTitle}</h3>
            <p>{copy.utilityLead}</p>
            <ul>
              {verdict.metrics.utilities.map((utility, index) => (
                <li key={parties[index]}>{copy.partyUtility(parties[index], utility)}</li>
              ))}
            </ul>
            <details>
              <summary>{copy.utilityDetails}</summary>
              <p>{copy.utilityFormula}</p>
            </details>
          </article>
        ) : null}
        {step >= 1 ? (
          <article className={styles.revealStep} aria-labelledby="reveal-share-title">
            <h3 id="reveal-share-title">{copy.shareTitle}</h3>
            <p>{copy.shareLead}</p>
            <ShareGauge locale={locale} verdict={verdict} />
            <p className={styles.result}>{copy.proportionalityResult(verdict.metrics.proportionality)}</p>
            <details>
              <summary>{copy.shareDetails}</summary>
              <p>{copy.shareDetails}</p>
            </details>
          </article>
        ) : null}
        {step >= 2 ? (
          <article className={styles.revealStep} aria-labelledby="reveal-envy-title">
            <h3 id="reveal-envy-title">{copy.envyTitle}</h3>
            <p>{copy.envyLead}</p>
            <p className={styles.result}>{copy.envyResult(verdict.metrics.ef)}</p>
            <details>
              <summary>{copy.envyDetails}</summary>
              <p>{copy.envyDetails}</p>
            </details>
          </article>
        ) : null}
        {step >= LAST_STEP ? (
          <article className={styles.revealStep} aria-labelledby="reveal-conclusion-title">
            <h3 id="reveal-conclusion-title">{copy.conclusionTitle}</h3>
            <p>{verdict.metrics.proportionality
              ? verdict.metrics.ef ? copy.conclusionGood : copy.conclusionNeedsWork
              : copy.conclusionBelowDue}</p>
            <details>
              <summary>{copy.conclusionDetails}</summary>
              <p>{copy.conclusionDetails}</p>
            </details>
          </article>
        ) : null}
      </div>
      <div className={styles.scrollFooter}>
        <p role="status" aria-live="polite">{complete ? copy.completeAnnouncement : `${step + 1}/4`}</p>
        <button type="button" className={styles.primary} onClick={next}>
          {complete ? copy.continue : copy.next}
        </button>
      </div>
    </section>
  );
}
