'use client';
import type { RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import type { ActOneRecord, ActTwoRecord } from '../../narrative/types';
import { ACT_TWO_DEFINITION } from '../../narrative/campaign-definition';
import { getAdventureCopy } from '../../i18n/adventure';
import styles from './PerformanceLedger.module.css';

export function ActTwoLedger({ locale, record, history, onChallenge, onContinue, headingRef }: { locale: Locale; record: ActTwoRecord; history: readonly ActOneRecord[]; onChallenge: () => void; onContinue: () => void; headingRef?: RefObject<HTMLHeadingElement | null> }) {
 const copy = getAdventureCopy(locale).actTwo;
 const allocation = record.finalVerdict.allocation.map((row) => row.owner === undefined ? `${copy.goodNames[row.goodId]} ${row.shares.join('/')}` : `${copy.goodNames[row.goodId]} → ${copy.partyNames[ACT_TWO_DEFINITION.parties[row.owner]].name}`).join(' · ');
 return <section className={styles.panel} aria-labelledby="act-two-ledger-title"><p className={styles.eyebrow}>{copy.ledgerEyebrow}</p><h2 ref={headingRef} tabIndex={-1} id="act-two-ledger-title">{copy.ledgerHeading}</h2><dl className={styles.records}><div><dt>{copy.initialLabel}</dt><dd>{record.initialVerdict.metrics.utilities.join(' / ')}</dd></div><div><dt>{copy.finalLabel}</dt><dd>{allocation}</dd></div><div><dt>{copy.gradeLabel}</dt><dd>{copy.gradeNames[record.grade]}</dd></div><div><dt>{copy.harmonyLabel}</dt><dd>{record.finalVerdict.metrics.nsw}</dd></div><div><dt>{copy.masterSealLabel}</dt><dd>{record.challenge.masterSeal ? copy.sealEarned : copy.sealNotEarned}</dd></div></dl><section aria-labelledby="prior-act-records-title"><h3 id="prior-act-records-title">{copy.priorRecordsHeading}</h3>{history.map((prior) => <dl className={styles.records} key={prior.act}><div><dt>{copy.priorActLabel(prior.act)}</dt><dd>{copy.gradeNames[prior.grade]}</dd></div><div><dt>{copy.priorGradeLabel}</dt><dd>{copy.gradeNames[prior.grade]}</dd></div><div><dt>{copy.priorRevisionLabel}</dt><dd>{prior.revisionUsed ? copy.priorRevisionUsed : copy.priorRevisionNotUsed}</dd></div><div><dt>{copy.priorSealLabel}</dt><dd>{prior.challenge.masterSeal ? copy.sealEarned : copy.sealNotEarned}</dd></div></dl>)}</section><div className={styles.actions}><button type="button" className={styles.primary} onClick={onChallenge}>{copy.challengeHeading}</button><button type="button" className={styles.primary} onClick={onContinue}>{copy.ledgerContinue}</button></div></section>;
}
