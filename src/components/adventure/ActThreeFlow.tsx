'use client';

import { useState, type RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import { ACT_THREE_DEFINITION, type ActThreeClueId } from '../../narrative/campaign-definition';
import { analyzeActThreeAllocation } from '../../narrative/act-three-facts';
import type { ActOneRecord, ActTwoRecord, ActThreeRecord, CampaignAllocation, CampaignChallenge, CampaignVerdict } from '../../narrative/types';
import { ScenePlate } from './ScenePlate';
import styles from './Investigation.module.css';
import flowStyles from './VerdictFlow.module.css';
import ledgerStyles from './PerformanceLedger.module.css';

type HeadingRef = RefObject<HTMLHeadingElement | null>;
const writIds = ACT_THREE_DEFINITION.writs.map(({ id }) => id);
const partyIds = ACT_THREE_DEFINITION.parties;

export function ActThreeInvestigation({ locale, discoveredClueIds, onDiscoverClue, onStartAllocation, headingRef }: { locale: Locale; discoveredClueIds: readonly string[]; onDiscoverClue: (id: ActThreeClueId) => void; onStartAllocation: () => void; headingRef?: HeadingRef }) {
  const copy = getAdventureCopy(locale).actThree;
  const discovered = new Set(discoveredClueIds);
  const clues = ACT_THREE_DEFINITION.clues;
  const complete = clues.filter(({ required }) => required).every(({ id }) => discovered.has(id));
  return <section className={styles.dossier} aria-labelledby="act-three-investigation-title" data-act-three-investigation>
    <ScenePlate locale={locale} name={copy.sceneName} description={copy.sceneDescription} fallbackLabel={copy.sceneFallback} hotspotsLabel={copy.peopleLabel} />
    <div className={styles.task}><div><strong>{copy.taskLabel}</strong><h2 ref={headingRef} tabIndex={-1} id="act-three-investigation-title">{copy.taskProgress(clues.filter(({ id }) => discovered.has(id)).length, clues.length)}</h2></div><span>{complete ? copy.completeMark : copy.pendingMark}</span></div>
    <div className={styles.portraitGrid} aria-label={copy.peopleLabel}>{partyIds.map((party, index) => { const clue = clues[index]; const person = copy.partyNames[party]; return <button className={styles.clueButton} type="button" key={party} aria-pressed={discovered.has(clue.id)} onClick={() => onDiscoverClue(clue.id)}><strong>{person.name}</strong><small>{person.role}</small><span>{discovered.has(clue.id) ? copy.clueRecorded : copy.clueRead}</span></button>; })}</div>
    <ol className={styles.clueList}>{clues.map(({ id }) => { const clue = copy.clues[id]; const recorded = discovered.has(id); return <li className={styles.clue} key={id}><button type="button" className={styles.clueButton} aria-expanded={recorded} aria-pressed={recorded} onClick={() => onDiscoverClue(id)}><span>{clue.title}</span><small>{recorded ? copy.clueRecorded : copy.clueRead}</small></button>{recorded ? <div className={styles.clueBody}><p><strong>{clue.speaker}</strong></p><p><q>{clue.text}</q></p></div> : null}</li>; })}</ol>
    {!complete ? <p className={styles.explanation}>{copy.requiredCluesExplanation}</p> : null}<div className={styles.actions}><button type="button" className={styles.primary} disabled={!complete} onClick={onStartAllocation}>{copy.enterAllocation}</button></div>
  </section>;
}

function setOwner(allocation: CampaignAllocation, writId: string, owner: number): CampaignAllocation {
  return allocation.map((row) => row.goodId === writId ? { ...row, owner, writId } : row);
}

export function ActThreeWorkbench({ locale, allocation, canLock, onChange, onLock, onReturn, revisionMode = false }: { locale: Locale; allocation: CampaignAllocation; canLock: boolean; onChange: (allocation: CampaignAllocation) => void; onLock: () => void; onReturn: () => void; revisionMode?: boolean }) {
  const copy = getAdventureCopy(locale).actThree;
  return <section className={styles.workbench} aria-labelledby="act-three-workbench-title" data-act-three-workbench>
    <header><p className={styles.task}><strong>{copy.allocationHeading}</strong></p><h2 id="act-three-workbench-title">{copy.allocationHeading}</h2><p className={styles.explanation}>{revisionMode ? copy.revisionInstructions : copy.allocationInstructions}</p></header>
    {writIds.map((writId) => { const row = allocation.find(({ goodId }) => goodId === writId); if (!row) return null; return <fieldset className={styles.goodRow} key={writId}><legend>{copy.writNames[writId]}</legend><div className={styles.adjustments}>{partyIds.map((party, index) => <label key={party}><input type="radio" name={`writ-${writId}`} checked={row.owner === index} onChange={() => onChange(setOwner(allocation, writId, index))} />{copy.partyNames[party].name}</label>)}</div><p className={styles.liveText}>{copy.ownerLabel(copy.partyNames[partyIds[row.owner ?? 0]].name)}</p></fieldset>; })}
    <div className={styles.actions}>{!revisionMode ? <button type="button" className={styles.return} onClick={onReturn}>{copy.returnToInvestigation}</button> : null}<button type="button" className={styles.primary} disabled={!canLock} onClick={onLock}>{revisionMode ? copy.revisionLock : copy.lock}</button></div>
  </section>;
}

export function RemoveOneTest({ locale, allocation }: { locale: Locale; allocation: CampaignAllocation }) {
  const copy = getAdventureCopy(locale).actThree;
  const analysis = analyzeActThreeAllocation(allocation);
  const [pairIndex, setPairIndex] = useState(0);
  const pair = analysis.envyPairs[pairIndex];
  if (!pair) return <p>{copy.removeOneResult(analysis.ef1, analysis.efx)}</p>;
  const targetWrits = allocation.filter(({ owner }) => owner === pair.j).map(({ goodId }) => goodId);
  const ownUtility = Number(analysis.utilities[pair.i]);
  const targetValue = targetWrits.reduce((sum, writId) => sum + (ACT_THREE_DEFINITION.writs.find(({ id }) => id === writId)?.values[pair.i] ?? 0), 0);
  const outcomes = targetWrits.map((writId) => {
    const value = ACT_THREE_DEFINITION.writs.find(({ id }) => id === writId)?.values[pair.i] ?? 0;
    return { writId, positive: value > 0, ends: ownUtility >= targetValue - value };
  });
  const positiveOutcomes = outcomes.filter(({ positive }) => positive);
  return <section className={flowStyles.toolPanel} aria-labelledby="remove-one-title"><h3 id="remove-one-title">{copy.removeOneHeading}</h3><p>{copy.removeOneInstructions}</p><label>{copy.envyHeading}<select value={pairIndex} onChange={(event) => setPairIndex(Number(event.target.value))}>{analysis.envyPairs.map((candidate, index) => <option key={`${candidate.i}-${candidate.j}`} value={index}>{copy.envyLine(copy.partyNames[partyIds[candidate.i]].name, copy.partyNames[partyIds[candidate.j]].name, Number(candidate.gap))}</option>)}</select></label><ul>{outcomes.map(({ writId, ends }) => <li key={writId}>{copy.writNames[writId]}: {ends ? copy.resultEnds : copy.resultRemains}</li>)}</ul><p role="status">{copy.removeOneResult(analysis.ef1, analysis.efx)}</p></section>;
}

export function ActThreeDebrief({ locale, verdict, headingRef, onContinue }: { locale: Locale; verdict: CampaignVerdict; headingRef?: HeadingRef; onContinue: () => void }) {
  const copy = getAdventureCopy(locale).actThree;
  return <section className={flowStyles.scroll} aria-labelledby="act-three-debrief-title"><p className={flowStyles.eyebrow}>{copy.debriefHeading}</p><h2 ref={headingRef} tabIndex={-1} id="act-three-debrief-title">{copy.debriefHeading}</h2><p>{copy.debriefBody}</p><h3>{copy.utilitiesHeading}</h3><ul>{verdict.metrics.utilities.map((value, index) => <li key={partyIds[index]}>{copy.partyNames[partyIds[index]].name}: {value}</li>)}</ul><h3>{copy.envyHeading}</h3><ul>{(verdict.metrics.envyPairs ?? []).map(({ i, j, gap }) => <li key={`${i}-${j}`}>{copy.envyLine(copy.partyNames[partyIds[i]].name, copy.partyNames[partyIds[j]].name, gap)}</li>)}</ul><RemoveOneTest locale={locale} allocation={verdict.allocation} /><button className={flowStyles.primary} type="button" onClick={onContinue}>{copy.returnToLedger}</button></section>;
}

export function ActThreeRevision({ locale, allocation, initialAllocation, headingRef, onChange, onLock }: { locale: Locale; allocation: CampaignAllocation; initialAllocation: CampaignAllocation; headingRef?: HeadingRef; onChange: (allocation: CampaignAllocation) => void; onLock: () => void }) {
  const copy = getAdventureCopy(locale).actThree;
  const analysis = analyzeActThreeAllocation(allocation);
  return <section className={flowStyles.revisionPanel}><p className={flowStyles.eyebrow}>{copy.revisionHeading}</p><h2 ref={headingRef} tabIndex={-1}>{copy.revisionHeading}</h2><p>{copy.revisionInstructions}</p><p>{copy.initialLabel}: {initialAllocation.map(({ goodId }) => copy.writNames[goodId]).join(' · ')}</p><ActThreeWorkbench locale={locale} allocation={allocation} canLock onChange={onChange} onLock={onLock} onReturn={() => {}} revisionMode /><p>{copy.envyHeading}: {analysis.envyPairs.length}</p><RemoveOneTest locale={locale} allocation={allocation} /></section>;
}

export function ActThreeChallenge({ locale, challenge, headingRef, onChange, onSubmit, onSkip, onLeave }: { locale: Locale; challenge: CampaignChallenge; headingRef?: HeadingRef; onChange: (allocation: CampaignAllocation) => void; onSubmit: () => void; onSkip: () => void; onLeave: () => void }) {
  const copy = getAdventureCopy(locale).actThree;
  const checkedAnalysis = challenge.checked && challenge.allocation ? analyzeActThreeAllocation(challenge.allocation) : null;
  const roundRobin = ACT_THREE_DEFINITION.demonstrations.rankOrderRoundRobin.map(({ writId, owner }) => ({ goodId: writId, writId, shares: [] as readonly number[], owner }));
  return <section className={flowStyles.revisionPanel}><p className={flowStyles.eyebrow}>{copy.challengeHeading}</p><h2 ref={headingRef} tabIndex={-1}>{copy.challengeHeading}</h2><p>{copy.challengeBody}</p><button type="button" className={flowStyles.secondary} onClick={() => onChange(roundRobin)}>{copy.roundRobin}</button><ActThreeWorkbench locale={locale} allocation={challenge.allocation ?? roundRobin} canLock onChange={onChange} onLock={onSubmit} onReturn={() => {}} revisionMode /><p role="status">{checkedAnalysis ? copy.challengeResult(checkedAnalysis.nsw.toString()) : ''}</p><p role="status">{challenge.status === 'completed' ? copy.challengeComplete : challenge.masterSeal ? copy.challengeSeal : ''}</p><button type="button" className={flowStyles.secondary} onClick={onSubmit}>{copy.challengeSubmit}</button><button type="button" className={flowStyles.secondary} onClick={onSkip}>{copy.challengeSkip}</button><button type="button" className={flowStyles.secondary} onClick={onLeave}>{copy.returnToLedger}</button></section>;
}

export function ActThreeLedger({ locale, record, history, headingRef, onChallenge, onContinue, onRecall }: { locale: Locale; record: ActThreeRecord; history: readonly (ActOneRecord | ActTwoRecord)[]; headingRef?: HeadingRef; onChallenge: () => void; onContinue: () => void; onRecall: () => void }) {
  const copy = getAdventureCopy(locale).actThree;
  return <section className={ledgerStyles.panel}><p className={ledgerStyles.eyebrow}>{copy.ledgerHeading}</p><h2 ref={headingRef} tabIndex={-1}>{copy.ledgerHeading}</h2><dl className={ledgerStyles.records}><div><dt>{copy.initialLabel}</dt><dd>{record.initialVerdict.metrics.utilities.join(' / ')} · {record.intuitionRating}/5</dd></div><div><dt>{copy.finalHeading}</dt><dd>{record.finalVerdict.metrics.utilities.join(' / ')}</dd></div><div><dt>{copy.gradeLabel}</dt><dd>{copy.gradeNames[record.grade]}</dd></div><div><dt>{copy.sealLabel}</dt><dd>{record.challenge.masterSeal ? copy.sealEarned : copy.sealNotEarned}</dd></div></dl><h3>{copy.priorRecordsHeading}</h3>{history.map((prior) => <p key={prior.act}>{copy.priorActLabel(prior.act)} · {copy.priorGradeLabel}: {copy.gradeNames[prior.grade]}</p>)}<div className={ledgerStyles.actions}><button type="button" onClick={onChallenge}>{copy.challengeHeading}</button><button type="button" onClick={onContinue}>{copy.ledgerContinue}</button><button type="button" onClick={onRecall}>{copy.openRecall}</button></div></section>;
}
