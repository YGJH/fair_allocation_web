'use client';

import type { RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import type { ActOneRecord } from '../../narrative/types';
import { getAdventureCopy } from '../../i18n/adventure';
import styles from './PerformanceLedger.module.css';

type PerformanceLedgerProps = {
  readonly locale: Locale;
  readonly record: ActOneRecord;
  readonly onChallenge: () => void;
  readonly onContinue: () => void;
  readonly onRecall: () => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
};

export function PerformanceLedger({ locale, record, onChallenge, onContinue, onRecall, headingRef }: PerformanceLedgerProps) {
  const copy = getAdventureCopy(locale).ledger;
  const goodNames = getAdventureCopy(locale).investigation.allocation.goodNames;
  const verdict = (allocation: ActOneRecord['finalVerdict']['allocation']) => allocation
    .map(({ goodId, shares }) => `${goodNames[goodId as keyof typeof goodNames]} ${shares[0]}/${shares[1]}`)
    .join(' · ');
  const challengeStatus = record.challenge.status === 'completed'
    ? copy.challengeCompleted
    : record.challenge.status === 'skipped'
      ? copy.challengeSkipped
      : copy.challengePending;

  return (
    <section className={styles.panel} aria-labelledby="performance-ledger-title">
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h2 ref={headingRef} tabIndex={-1} id="performance-ledger-title">{copy.heading}</h2>
      <dl className={styles.records}>
        <div><dt>{copy.initialVerdict}</dt><dd>{verdict(record.initialVerdict.allocation)}</dd></div>
        <div><dt>{copy.finalVerdict}</dt><dd>{verdict(record.finalVerdict.allocation)}</dd></div>
        <div><dt>{copy.grade}</dt><dd>{record.grade}</dd></div>
        <div><dt>{copy.revision}</dt><dd>{record.revisionUsed ? copy.revisionUsed : copy.revisionNotUsed}</dd></div>
        <div><dt>{copy.challengeStatus}</dt><dd>{challengeStatus}</dd></div>
        <div><dt>{copy.sealStatus}</dt><dd>{record.challenge.masterSeal ? copy.sealEarned : copy.sealNotEarned}</dd></div>
      </dl>
      <p>{copy.progress(record.challenge.masterSeal ? 1 : 0)}</p>
      <p className={styles.future}>{copy.futureLocked}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onChallenge}>{copy.returnToChallenge}</button>
        <button type="button" className={styles.secondary} onClick={onRecall}>{copy.openRecall}</button>
        <button type="button" className={styles.primary} onClick={onContinue}>{copy.continue}</button>
      </div>
    </section>
  );
}

export type { PerformanceLedgerProps };
