'use client';

import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import type { CampaignVerdict } from '../../narrative/types';
import styles from './VerdictFlow.module.css';

export function ShareGauge({ locale, verdict }: { locale: Locale; verdict: CampaignVerdict }) {
  const copy = getAdventureCopy(locale).investigation;
  const parties = [copy.allocation.partyNames['chen-shouye'].name, copy.allocation.partyNames['chen-congzheng'].name];
  return (
    <section className={styles.shareGauge} aria-labelledby="share-gauge-title" data-share-gauge>
      <h3 id="share-gauge-title">{getAdventureCopy(locale).investigation.debrief.shareTitle}</h3>
      <div className={styles.gaugeList}>
        {verdict.metrics.utilities.map((utility, index) => {
          const party = parties[index] ?? `Party ${index + 1}`;
          const label = getAdventureCopy(locale).investigation.debrief.shareBar(party, utility);
          return (
            <div className={styles.gaugeRow} key={party}>
              <p>{getAdventureCopy(locale).investigation.debrief.partyUtility(party, utility)}</p>
              <div className={styles.gaugeTrack} role="img" aria-label={label}>
                <span style={{ width: `${Math.min(100, Math.max(0, utility))}%` }} />
              </div>
              <p className={styles.gaugeEquivalent}>{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
