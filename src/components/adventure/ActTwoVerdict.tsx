'use client';

import type { RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import type { CampaignAllocation, CampaignVerdict } from '../../narrative/types';
import { ACT_TWO_DEFINITION } from '../../narrative/campaign-definition';
import { analyzeActTwoAllocation } from '../../narrative/campaign-rules';
import { getAdventureCopy } from '../../i18n/adventure';
import { AllocationWorkbench } from './AllocationWorkbench';
import styles from './VerdictFlow.module.css';

function names(locale: Locale) { return getAdventureCopy(locale).actTwo.partyNames; }

export function ActTwoEnvyGraph(locale: Locale, verdict: CampaignVerdict) {
  const copy = getAdventureCopy(locale).actTwo;
  const partyNames = names(locale);
  const positions = [[50, 12], [12, 82], [88, 82]] as const;
  return <div aria-label={copy.envyGraph} className={styles.comparisonCard}><h3>{copy.envyGraph}</h3><svg viewBox="0 0 100 100" role="img" aria-label={copy.envyGraph}>{verdict.metrics.envyPairs?.map(({ i, j }) => <line key={`${i}-${j}`} x1={positions[i][0]} y1={positions[i][1]} x2={positions[j][0]} y2={positions[j][1]} stroke="#a54135" strokeWidth="1.5" />)}{ACT_TWO_DEFINITION.parties.map((party, index) => <g key={party}><circle cx={positions[index][0]} cy={positions[index][1]} r="8" fill="#e4d7bf" stroke="#283d4b" /><text x={positions[index][0]} y={positions[index][1] + 1} textAnchor="middle" fontSize="5">{index + 1}</text><title>{partyNames[party].name}</title></g>)}</svg><ul>{verdict.metrics.envyPairs?.length ? verdict.metrics.envyPairs.map(({ i, j, gap }) => <li key={`${i}-${j}`}>{partyNames[ACT_TWO_DEFINITION.parties[i]].name} → {partyNames[ACT_TWO_DEFINITION.parties[j]].name} ({gap})</li>) : <li>{copy.envyAbsent}</li>}</ul></div>;
}

export function ActTwoDebrief({ locale, verdict, onContinue, headingRef }: { locale: Locale; verdict: CampaignVerdict; onContinue: () => void; headingRef?: RefObject<HTMLHeadingElement | null> }) {
  const copy = getAdventureCopy(locale).actTwo;
  const missing = verdict.missingClueIds?.length ?? 0;
  const missingClueIds = new Set(verdict.missingClueIds ?? []);
  const workshopOwner = verdict.allocation.find(({ goodId }) => goodId === 'loom-workshop')?.owner;
  const workshopIsSonOwned = workshopOwner === 0 || workshopOwner === 1;
  const valuationClueIds = ['clue-pei-boqian-valuations', 'clue-pei-zhongwen-valuations', 'clue-xue-shoucheng-valuations'] as const;
  return <section className={styles.scroll} aria-labelledby="act-two-debrief-title"><p className={styles.eyebrow}>{copy.debriefEyebrow}</p><h2 ref={headingRef} tabIndex={-1} id="act-two-debrief-title">{copy.debriefHeading}</h2><p>{copy.debriefBody}</p>{missing ? <p role="status">{copy.missingFacts(missing)}</p> : null}<article className={styles.revealStep}><h3>{copy.matrixHeading}</h3><table className={styles.matrix}><caption>{copy.matrixCaption}</caption><thead><tr><th scope="col">{copy.matrixGoodLabel}</th>{ACT_TWO_DEFINITION.parties.map((party) => <th scope="col" key={party}>{copy.partyNames[party].name}</th>)}</tr></thead><tbody>{ACT_TWO_DEFINITION.goods.map((good) => <tr key={good.id}><th scope="row">{copy.goodNames[good.id]}</th>{good.values.map((value, index) => { const status = missingClueIds.has(valuationClueIds[index]); return <td key={ACT_TWO_DEFINITION.parties[index]}><span>{value}</span> <span>{status ? copy.newlyRevealed : copy.alreadyHeard}</span></td>; })}</tr>)}</tbody></table></article><article className={styles.revealStep}><h3>{copy.utilitiesHeading}</h3><ul>{verdict.metrics.utilities.map((value, index) => <li key={index}>{copy.utility(copy.partyNames[ACT_TWO_DEFINITION.parties[index]].name, value)}</li>)}</ul><p>{verdict.metrics.proportionality ? copy.proportionality : copy.proportionalityUnmet}</p>{workshopIsSonOwned ? <p><strong>{copy.wrongOwnerLabel}:</strong> {copy.wrongOwner}</p> : null}</article><article className={styles.revealStep}><h3>{copy.envyResultHeading}</h3><p>{verdict.metrics.ef ? copy.envyAbsent : copy.envyPresent}</p></article><div className={styles.scrollFooter}><button type="button" className={styles.primary} onClick={onContinue}>{copy.continueVerdict}</button></div></section>;
}

export function ActTwoRevision({ locale, allocation, initialAllocation, onChange, onLock, onReturn, headingRef }: { locale: Locale; allocation: CampaignAllocation; initialAllocation: CampaignAllocation; onChange: (allocation: CampaignAllocation) => void; onLock: () => void; onReturn?: () => void; headingRef?: RefObject<HTMLHeadingElement | null> }) {
  const copy = getAdventureCopy(locale).actTwo;
  const verdict = (() => { try { const analysis = analyzeActTwoAllocation(allocation); return { allocation, metrics: { utilities: analysis.utilities.map(Number), nsw: analysis.nsw.toString(), proportionality: analysis.proportionality, ef: analysis.ef, ef1: analysis.ef1, efx: analysis.efx, envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })) } }; } catch { return null; } })();
  return <section aria-labelledby="act-two-revision-title"><p className={styles.eyebrow}>{copy.revisionEyebrow}</p><h2 ref={headingRef} tabIndex={-1} id="act-two-revision-title">{copy.revisionHeading}</h2><div className={styles.comparisonGrid}><div className={styles.comparisonCard}><h3>{copy.initialVerdictLabel}</h3><ul>{initialAllocation.map((row) => <li key={row.goodId}>{copy.goodNames[row.goodId]} {row.owner === undefined ? row.shares.join('/') : copy.ownerLabel(copy.partyNames[ACT_TWO_DEFINITION.parties[row.owner]].name)}</li>)}</ul></div>{verdict ? <><div className={styles.comparisonCard}><h3>{copy.harmony(verdict.metrics.nsw)}</h3><p>{verdict.metrics.ef ? copy.envyAbsent : copy.envyLines(verdict.metrics.envyPairs?.length ?? 0)}</p><p>{copy.compensation}</p></div>{ActTwoEnvyGraph(locale, verdict)}</> : null}</div><AllocationWorkbench locale={locale} act={2} allocation={allocation} canLock onChange={onChange} onLock={onLock} onReturn={onReturn ?? (() => {})} revisionMode /></section>;
}
