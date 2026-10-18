'use client';

import type { RefObject } from 'react';
import type { Locale } from '../../i18n/copy';
import { ACT_TWO_DEFINITION, type ActTwoClueId } from '../../narrative/campaign-definition';
import { getAdventureCopy } from '../../i18n/adventure';
import { ScenePlate } from './ScenePlate';
import { PortraitCard } from './PortraitCard';
import styles from './Investigation.module.css';

export function ActTwoInvestigation({ locale, discoveredClueIds, onDiscoverClue, onStartAllocation, headingRef, hideStartAction = false }: {
  locale: Locale; discoveredClueIds: readonly string[]; onDiscoverClue: (id: ActTwoClueId) => void; onStartAllocation: () => void; headingRef?: RefObject<HTMLHeadingElement | null>; hideStartAction?: boolean;
}) {
  const copy = getAdventureCopy(locale).actTwo;
  const discovered = new Set(discoveredClueIds);
  const clueIds = ACT_TWO_DEFINITION.clues.map(({ id }) => id);
  const requiredComplete = ACT_TWO_DEFINITION.clues.filter(({ required }) => required).every(({ id }) => discovered.has(id));
  return <section className={styles.dossier} aria-labelledby="act-two-investigation-title" data-act-two-investigation>
    <ScenePlate locale={locale} name={copy.sceneName} description={copy.sceneDescription} fallbackLabel={copy.sceneFallback} hotspotsLabel={copy.peopleLabel} />
    <div className={styles.task}><div><strong>{copy.taskLabel}</strong><h2 ref={headingRef} tabIndex={-1} id="act-two-investigation-title">{copy.taskProgress(clueIds.filter((id) => discovered.has(id)).length, clueIds.length)}</h2></div><span>{requiredComplete ? copy.completeMark : copy.pendingMark}</span></div>
    <div className={styles.portraitGrid} aria-label={copy.peopleLabel}>{ACT_TWO_DEFINITION.parties.map((party, index) => { const clueId = clueIds[index] as ActTwoClueId; const person = copy.partyNames[party]; return <PortraitCard key={party} locale={locale} name={person.name} role={person.role} reaction={discovered.has(clueId) ? copy.clues[clueId].text : copy.pendingMark} selected={discovered.has(clueId)} onActivate={() => onDiscoverClue(clueId)} />; })}</div>
    <ol className={styles.clueList} aria-label={copy.taskLabel}>{clueIds.map((clueId) => { const clue = copy.clues[clueId]; const recorded = discovered.has(clueId); return <li className={styles.clue} key={clueId}><button type="button" className={styles.clueButton} aria-label={clue.title} aria-pressed={recorded} aria-expanded={recorded} onClick={() => onDiscoverClue(clueId)}><span>{clue.title}</span><small>{recorded ? copy.completeMark + ' ' + copy.clueRecorded : copy.clueRead}</small></button>{recorded ? <div className={styles.clueBody}><p><strong>{clue.speaker}</strong></p><p><q>{clue.text}</q></p></div> : null}</li>; })}</ol>
    {!requiredComplete ? <p className={styles.explanation}>{copy.requiredCluesExplanation}</p> : null}{!hideStartAction ? <div className={styles.actions}><button type="button" className={styles.primary} disabled={!requiredComplete} onClick={onStartAllocation}>{getAdventureCopy(locale).investigation.enterAllocation}</button></div> : null}
  </section>;
}
