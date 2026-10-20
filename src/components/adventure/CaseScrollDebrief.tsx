'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import { getCutsceneStill } from '../../narrative/media-manifest';
import type { CampaignVerdict } from '../../narrative/types';
import { AnimaticStill } from './CutscenePlayer';
import { PortraitCard } from './PortraitCard';
import { ShareGauge } from './ShareGauge';
import styles from './VerdictFlow.module.css';

const LAST_STEP = 3;

export function CaseScrollDebrief({
  locale,
  verdict,
  watched,
  onWatched,
  onAccept,
  onRevise,
  initiallyOpen = false,
  headingRef,
}: {
  locale: Locale;
  verdict: CampaignVerdict;
  watched: boolean;
  onWatched: () => void;
  onAccept: () => void;
  onRevise: () => void;
  initiallyOpen?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const adventureCopy = getAdventureCopy(locale);
  const cs02Still = getCutsceneStill('cs-02', 0);
  const copy = adventureCopy.investigation.debrief;
  const zhou = adventureCopy.investigation.parties.masterZhou;
  const parties = [
    getAdventureCopy(locale).investigation.allocation.partyNames['chen-shouye'].name,
    getAdventureCopy(locale).investigation.allocation.partyNames['chen-congzheng'].name,
  ];
  const [step, setStep] = useState(initiallyOpen ? LAST_STEP : 0);
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
    if (step < LAST_STEP) setStep((current) => Math.min(LAST_STEP, current + 1));
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
            <PortraitCard locale={locale} characterId="master-zhou" expression="hint1" presentation="workbench" name={zhou.name} role={zhou.role} />
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
            <PortraitCard locale={locale} characterId="master-zhou" expression="hint2" presentation="workbench" name={zhou.name} role={zhou.role} />
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
            <PortraitCard locale={locale} characterId="master-zhou" expression="hint1" presentation="workbench" name={zhou.name} role={zhou.role} />
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
            <PortraitCard locale={locale} characterId="master-zhou" expression={verdict.metrics.proportionality && verdict.metrics.ef ? 'calm' : 'worried'} presentation="workbench" name={zhou.name} role={zhou.role} />
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
      {complete ? (
        <section className={styles.inlineVerdict} aria-labelledby="inline-verdict-title">
          <figure className={styles.judgmentImage}>
            {cs02Still ? <AnimaticStill segment={cs02Still} layout="standalone" alt={adventureCopy.transcript.cs02Scene} /> : null}
            <figcaption>{adventureCopy.transcript.cs02Scene}</figcaption>
          </figure>
          <div>
            <h3 id="inline-verdict-title">{copy.revisionHeading}</h3>
            <p>{copy.revisionBody}</p>
            <div className={styles.revisionActions}>
              <button type="button" className={styles.secondary} onClick={onAccept}>{copy.acceptInitial}</button>
              <button type="button" className={styles.primary} onClick={onRevise}>{copy.reviseOnce}</button>
            </div>
          </div>
        </section>
      ) : null}
      <div className={styles.scrollFooter}>
        <p role="status" aria-live="polite">{complete ? copy.completeAnnouncement : `${step + 1}/4`}</p>
        {!complete ? <button type="button" className={styles.primary} onClick={next}>{copy.next}</button> : null}
      </div>
    </section>
  );
}
