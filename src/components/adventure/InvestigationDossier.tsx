'use client';

import { useState } from 'react';
import type { Locale } from '../../i18n/copy';
import type { ActOneClueId } from '../../narrative/campaign-definition';
import { getScenePlateAsset, type CharacterId } from '../../narrative/media-manifest';
import { getAdventureCopy } from '../../i18n/adventure';
import { NarrativeDialogue, type NarrativeDialogueLine } from './NarrativeDialogue';
import { PortraitCard } from './PortraitCard';
import { ScenePlate } from './ScenePlate';
import styles from './Investigation.module.css';

export const ACT_ONE_CLUE_IDS: readonly ActOneClueId[] = [
  'clue-chen-shouye-valuations',
  'clue-chen-congzheng-valuations',
  'clue-chen-elder-equal-split',
  'clue-yiwu-original-ruling',
];

const PERSON_CLUES = [
  ['clue-chen-shouye-valuations', 'chen-shouye', 'chenShouye'],
  ['clue-chen-congzheng-valuations', 'chen-congzheng', 'chenCongzheng'],
  ['clue-chen-elder-equal-split', 'chen-elder', 'chenElder'],
] as const satisfies readonly [ActOneClueId, CharacterId, 'chenShouye' | 'chenCongzheng' | 'chenElder'][];

type InvestigationDossierProps = {
  locale: Locale;
  discoveredClueIds: readonly string[];
  onDiscoverClue: (clueId: ActOneClueId) => void;
  onStartAllocation: () => void;
  hideStartAction?: boolean;
};

export function InvestigationDossier({ locale, discoveredClueIds, onDiscoverClue, onStartAllocation, hideStartAction = false }: InvestigationDossierProps) {
  const copy = getAdventureCopy(locale).investigation;
  const [activeClueId, setActiveClueId] = useState<ActOneClueId | null>(null);
  const discovered = new Set(discoveredClueIds);
  const complete = ACT_ONE_CLUE_IDS.every((id) => discovered.has(id));
  const scenePlate = getScenePlateAsset(1);

  const activeDialogue: NarrativeDialogueLine[] | null = activeClueId ? [(() => {
    const person = PERSON_CLUES.find(([clueId]) => clueId === activeClueId);
    if (person) {
      const [, speakerId, copyKey] = person;
      return {
        speakerId,
        speakerName: copy.parties[copyKey].name,
        speakerRole: copy.parties[copyKey].role,
        expression: 'calm',
        text: copy.clues[activeClueId].text,
        layout: 'solo',
      } satisfies NarrativeDialogueLine;
    }
    return {
      speakerId: 'cheng-heng',
      speakerName: copy.parties.chengHeng.name,
      speakerRole: copy.parties.chengHeng.role,
      expression: 'calm',
      text: copy.clues['clue-yiwu-original-ruling'].text,
      layout: 'solo',
      side: 'right',
    } satisfies NarrativeDialogueLine;
  })()] : null;

  function activateClue(clueId: ActOneClueId) {
    onDiscoverClue(clueId);
    setActiveClueId(clueId);
  }

  return (
    <section className={styles.dossier} aria-labelledby="investigation-dossier-title" data-investigation-dossier data-paper-desk>
      <ScenePlate
        locale={locale}
        name={copy.scene.name}
        description={copy.scene.description}
        fallbackLabel={copy.scene.fallback}
        imageSrc={scenePlate.src}
        hotspotsLabel={copy.sceneCluesLabel}
        hotspots={[{
          id: 'clue-yiwu-original-ruling',
          label: copy.sceneClueHotspot,
          onActivate: () => activateClue('clue-yiwu-original-ruling'),
        }]}
      >
        {activeDialogue ? (
          <div className={styles.sceneDialogue}>
            <NarrativeDialogue
              locale={locale}
              lines={activeDialogue}
              autoPlay={false}
              speed="standard"
              continueLabel={copy.discoveredLabel}
              hideContinueAction
              onComplete={() => {}}
            />
          </div>
        ) : null}
      </ScenePlate>

      <div className={styles.task}>
        <div>
          <strong>{copy.taskLabel}</strong>
          <h2 id="investigation-dossier-title">{copy.taskProgress(ACT_ONE_CLUE_IDS.filter((id) => discovered.has(id)).length, ACT_ONE_CLUE_IDS.length)}</h2>
        </div>
        <span aria-label={copy.taskProgress(ACT_ONE_CLUE_IDS.filter((id) => discovered.has(id)).length, ACT_ONE_CLUE_IDS.length)}>{complete ? '✓' : '…'}</span>
      </div>
      <div className={styles.portraitGrid} aria-label={copy.peopleLabel}>
        {PERSON_CLUES.map(([clueId, characterId, copyKey]) => (
          <PortraitCard
            key={clueId}
            locale={locale}
            name={copy.parties[copyKey].name}
            role={copy.parties[copyKey].role}
            reaction={discovered.has(clueId) ? copy.discoveredLabel : copy.portraitReaction}
            characterId={characterId}
            expression="calm"
            presentation="thumbnail"
            selected={activeClueId === clueId}
            onActivate={() => activateClue(clueId)}
          />
        ))}
      </div>
      <ol className={styles.clueList} aria-label={copy.taskLabel}>
        {ACT_ONE_CLUE_IDS.map((clueId) => {
          const clue = copy.clues[clueId];
          const isDiscovered = discovered.has(clueId);
          return (
            <li className={styles.clue} key={clueId} data-recorded={isDiscovered ? 'true' : 'false'}>
              <button
                type="button"
                className={styles.clueButton}
                aria-label={clue.title}
                aria-describedby={`clue-state-${clueId}`}
                aria-pressed={activeClueId === clueId}
                onClick={() => activateClue(clueId)}
              >
                <span>{clue.title}</span>
                <small id={`clue-state-${clueId}`}>{isDiscovered ? copy.discoveredLabel : copy.undiscoveredLabel}</small>
              </button>
            </li>
          );
        })}
      </ol>
      {!complete ? <p className={styles.explanation}>{copy.taskIncomplete}</p> : null}
      {!hideStartAction ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} disabled={!complete} onClick={onStartAllocation}>{copy.enterAllocation}</button>
        </div>
      ) : null}
    </section>
  );
}
