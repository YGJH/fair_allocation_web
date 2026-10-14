'use client';

import { useState } from 'react';
import type { Locale } from '../../i18n/copy';
import type { ActOneClueId } from '../../narrative/campaign-definition';
import { getAdventureCopy } from '../../i18n/adventure';
import { PortraitCard } from './PortraitCard';
import styles from './Investigation.module.css';

export const ACT_ONE_CLUE_IDS: readonly ActOneClueId[] = [
  'clue-chen-shouye-valuations',
  'clue-chen-congzheng-valuations',
  'clue-chen-elder-equal-split',
  'clue-yiwu-original-ruling',
];

type InvestigationDossierProps = {
  locale: Locale;
  discoveredClueIds: readonly string[];
  onDiscoverClue: (clueId: ActOneClueId) => void;
  onStartAllocation: () => void;
};

export function InvestigationDossier({
  locale,
  discoveredClueIds,
  onDiscoverClue,
  onStartAllocation,
}: InvestigationDossierProps) {
  const copy = getAdventureCopy(locale).investigation;
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const discovered = new Set(discoveredClueIds);
  const complete = ACT_ONE_CLUE_IDS.every((id) => discovered.has(id));
  return (
    <section className={styles.dossier} aria-labelledby="investigation-dossier-title" data-investigation-dossier>
      <div className={styles.task}>
        <div>
          <strong>{copy.taskLabel}</strong>
          <h2 id="investigation-dossier-title">{copy.taskProgress(ACT_ONE_CLUE_IDS.filter((id) => discovered.has(id)).length, ACT_ONE_CLUE_IDS.length)}</h2>
        </div>
        <span aria-label={copy.taskProgress(ACT_ONE_CLUE_IDS.filter((id) => discovered.has(id)).length, ACT_ONE_CLUE_IDS.length)}>
          {complete ? '✓' : '…'}
        </span>
      </div>
      <div className={styles.portraitGrid} aria-label={copy.peopleLabel}>
        <PortraitCard
          locale={locale}
          name={copy.parties.chenShouye.name}
          role={copy.parties.chenShouye.role}
          reaction={copy.portraitReaction}
          selected={selectedSpeaker === 'chen-shouye'}
          onActivate={() => { setSelectedSpeaker('chen-shouye'); onDiscoverClue('clue-chen-shouye-valuations'); }}
        />
        <PortraitCard
          locale={locale}
          name={copy.parties.chenCongzheng.name}
          role={copy.parties.chenCongzheng.role}
          reaction={copy.portraitReaction}
          selected={selectedSpeaker === 'chen-congzheng'}
          onActivate={() => { setSelectedSpeaker('chen-congzheng'); onDiscoverClue('clue-chen-congzheng-valuations'); }}
        />
        <PortraitCard
          locale={locale}
          name={copy.parties.chenElder.name}
          role={copy.parties.chenElder.role}
          reaction={copy.portraitReaction}
          selected={selectedSpeaker === 'chen-elder'}
          onActivate={() => { setSelectedSpeaker('chen-elder'); onDiscoverClue('clue-chen-elder-equal-split'); }}
        />
      </div>
      <ol className={styles.clueList} aria-label={copy.taskLabel}>
        {ACT_ONE_CLUE_IDS.map((clueId) => {
          const clue = copy.clues[clueId];
          const isDiscovered = discovered.has(clueId);
          return (
            <li className={styles.clue} key={clueId}>
              <button
                type="button"
                className={styles.clueButton}
                aria-pressed={isDiscovered}
                aria-expanded={isDiscovered}
                onClick={() => onDiscoverClue(clueId)}
              >
                <span>{clue.title}</span>
                <small>{isDiscovered ? copy.discoveredLabel : copy.undiscoveredLabel}</small>
              </button>
              {isDiscovered ? (
                <div className={styles.clueBody}>
                  <p><strong>{clue.speaker}</strong></p>
                  <p><q>{clue.text}</q></p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {!complete ? <p className={styles.explanation}>{copy.taskIncomplete}</p> : null}
      <div className={styles.actions}>
        <button type="button" className={styles.primary} disabled={!complete} onClick={onStartAllocation}>
          {copy.enterAllocation}
        </button>
      </div>
    </section>
  );
}
