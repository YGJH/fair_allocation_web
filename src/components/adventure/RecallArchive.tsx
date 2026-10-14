'use client';

import type { Locale } from '../../i18n/copy';
import { AUTHORED_CUTSCENE_SLOTS, cutsceneManifest, type AuthoredCutsceneSlot } from '../../narrative/media-manifest';
import type { CampaignCutsceneSlot } from '../../narrative/types';
import { getAdventureCopy } from '../../i18n/adventure';
import styles from './RecallArchive.module.css';

type RecallArchiveProps = {
  readonly locale: Locale;
  readonly watchedSlots: readonly CampaignCutsceneSlot[];
  readonly currentSlots?: readonly CampaignCutsceneSlot[];
  readonly onReplay: (slot: AuthoredCutsceneSlot) => void;
};

export function RecallArchive({ locale, watchedSlots, currentSlots = [], onReplay }: RecallArchiveProps) {
  const copy = getAdventureCopy(locale).recall;
  const unlocked = new Set([...watchedSlots, ...currentSlots]);
  const visibleSlots = AUTHORED_CUTSCENE_SLOTS.filter((slot) => !(['cs-13', 'cs-14'] as const).includes(slot as 'cs-13' | 'cs-14') || unlocked.has(slot as CampaignCutsceneSlot));
  return (
    <section className={styles.archive} aria-labelledby="recall-archive-title">
      <h2 id="recall-archive-title">{copy.heading}</h2>
      <p>{copy.body}</p>
      <ul className={styles.slots}>
        {visibleSlots.map((slot) => {
          const isUnlocked = unlocked.has(slot as CampaignCutsceneSlot);
          const entry = cutsceneManifest[slot];
          return (
            <li key={slot} className={styles.slot}>
              <span className={styles.slotName}>{isUnlocked && entry ? copy.slotName(slot) : copy.locked}</span>
              {isUnlocked && entry ? (
                <button type="button" onClick={() => onReplay(slot as AuthoredCutsceneSlot)}>{copy.replay}</button>
              ) : (
                <span aria-label={`${slot} ${copy.locked}`}>???</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export type { RecallArchiveProps };
