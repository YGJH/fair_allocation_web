'use client';
import type { RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import type { CampaignAllocation, CampaignChallenge } from '../../narrative/types';
import { getAdventureCopy } from '../../i18n/adventure';
import { AllocationWorkbench } from './AllocationWorkbench';
import { ActTwoEnvyGraph } from './ActTwoVerdict';
import { analyzeActTwoAllocation } from '../../narrative/campaign-rules';
import styles from './MasterChallenge.module.css';

export function ActTwoChallenge({ locale, challenge, onChange, onSubmit, onSkip, onLeave, headingRef }: { locale: Locale; challenge: CampaignChallenge; onChange: (a: CampaignAllocation) => void; onSubmit: () => void; onSkip: () => void; onLeave: () => void; headingRef?: RefObject<HTMLHeadingElement | null> }) {
  const copy = getAdventureCopy(locale).actTwo;
  const verdict = challenge.allocation ? (() => { try { const analysis = analyzeActTwoAllocation(challenge.allocation); return { allocation: challenge.allocation, metrics: { utilities: analysis.utilities.map(Number), nsw: analysis.nsw.toString(), proportionality: analysis.proportionality, ef: analysis.ef, ef1: analysis.ef1, efx: analysis.efx, envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })) } }; } catch { return null; } })() : null;
  return <section className={styles.panel} aria-labelledby="act-two-challenge-title"><p className={styles.eyebrow}>{copy.challengeEyebrow}</p><h2 ref={headingRef} tabIndex={-1} id="act-two-challenge-title">{copy.challengeHeading}</h2><p>{copy.challengeBody}</p>{verdict ? <>{ActTwoEnvyGraph(locale, verdict)}<p>{copy.harmony(verdict.metrics.nsw)}</p></> : null}{challenge.allocation ? <AllocationWorkbench locale={locale} act={2} allocation={challenge.allocation} canLock onChange={onChange} onLock={onSubmit} onReturn={onLeave} revisionMode /> : null}<div className={styles.completion} aria-live="polite"><p>{challenge.status === 'completed' ? copy.challengeComplete : ''}</p><p>{challenge.masterSeal ? copy.challengeSeal : ''}</p></div><div className={styles.actions}><button type="button" className={styles.primary} onClick={onSubmit}>{copy.challengeSubmit}</button><button type="button" className={styles.secondary} onClick={onLeave}>{copy.returnToLedger}</button><button type="button" className={styles.text} onClick={onSkip}>{copy.challengeSkip}</button></div></section>;
}
