'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import type { Locale } from '../../i18n/copy';
import type { CampaignCutsceneSlot } from '../../narrative/types';
import type { AuthoredCutsceneSlot } from '../../narrative/media-manifest';
import { RecallArchive } from './RecallArchive';
import { AdventureDialog } from './AdventureDialog';
import styles from './AdventureStage.module.css';

type PauseMenuLabels = {
  readonly title: string;
  readonly continue: string;
  readonly currentTask: string;
  readonly controls: string;
  readonly subtitles: string;
  readonly volume: string;
  readonly replayCurrentCutscene: string;
  readonly recallArchive: string;
  readonly restart: string;
  readonly returnToMenu: string;
  readonly restartConfirmationTitle: string;
  readonly restartConfirmationBody: string;
  readonly cancelRestart: string;
  readonly confirmRestart: string;
};

type PauseMenuProps = {
  readonly open: boolean;
  readonly labels: PauseMenuLabels;
  readonly currentTask: ReactNode;
  readonly controlsHelp: ReactNode;
  readonly subtitles: boolean;
  readonly volume: number;
  readonly onContinue: () => void;
  readonly onSubtitlesChange: (enabled: boolean) => void;
  readonly onVolumeChange: (volume: number) => void;
  readonly onReplayCurrentCutscene?: () => void;
  readonly onRestart: () => void;
  readonly onReturnToMenu: () => void;
  readonly locale: Locale;
  readonly watchedCutsceneSlots?: readonly CampaignCutsceneSlot[];
  readonly onReplayArchive?: (slot: AuthoredCutsceneSlot) => void;
};

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function PauseMenu({
  open,
  labels,
  currentTask,
  controlsHelp,
  subtitles,
  volume,
  onContinue,
  onSubtitlesChange,
  onVolumeChange,
  onReplayCurrentCutscene,
  onRestart,
  onReturnToMenu,
  locale,
  watchedCutsceneSlots = [],
  onReplayArchive = () => {},
}: PauseMenuProps) {
  const titleId = useId();
  const descriptionId = useId();
  const continueRef = useRef<HTMLButtonElement>(null);
  const cancelRestartRef = useRef<HTMLButtonElement>(null);
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmingRestart(false);
      setArchiveOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (confirmingRestart) cancelRestartRef.current?.focus();
  }, [confirmingRestart]);

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    onVolumeChange(clampVolume(Number(event.target.value)));
  }

  return (
    <AdventureDialog
      open={open}
      labelledBy={titleId}
      describedBy={descriptionId}
      initialFocusRef={confirmingRestart ? cancelRestartRef : continueRef}
      onEscape={() => confirmingRestart ? setConfirmingRestart(false) : onContinue()}
      backdropClassName={styles.pauseBackdrop}
      dialogClassName={styles.pauseSheet}
    >
        {confirmingRestart ? (
          <div className={styles.restartConfirmation}>
            <h2 id={titleId}>{labels.restartConfirmationTitle}</h2>
            <p id={descriptionId}>{labels.restartConfirmationBody}</p>
            <div className={styles.confirmationActions}>
              <button
                ref={cancelRestartRef}
                type="button"
                className={styles.secondaryButton}
                onClick={() => setConfirmingRestart(false)}
              >
                {labels.cancelRestart}
              </button>
              <button type="button" className={styles.dangerButton} onClick={onRestart}>
                {labels.confirmRestart}
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className={styles.pauseHeader}>
              <h2 id={titleId}>{labels.title}</h2>
              <button
                ref={continueRef}
                type="button"
                className={styles.primaryButton}
                onClick={onContinue}
              >
                {labels.continue}
              </button>
            </header>

            <div id={descriptionId} className={styles.pauseBody}>
              {archiveOpen ? (
                <RecallArchive
                  locale={locale}
                  watchedSlots={watchedCutsceneSlots}
                  onReplay={onReplayArchive}
                />
              ) : null}
              <section className={styles.taskSection}>
                <h3>{labels.currentTask}</h3>
                <div>{currentTask}</div>
              </section>

              <section className={styles.controlsSection}>
                <h3>{labels.controls}</h3>
                <div className={styles.controlsHelp}>{controlsHelp}</div>
                <div className={styles.settings}>
                  <label className={styles.toggleSetting}>
                    <input
                      type="checkbox"
                      checked={subtitles}
                      onChange={(event) => onSubtitlesChange(event.currentTarget.checked)}
                    />
                    <span>{labels.subtitles}</span>
                  </label>
                  <label className={styles.volumeSetting}>
                    <span>{labels.volume}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={clampVolume(volume)}
                      onChange={handleVolumeChange}
                    />
                  </label>
                </div>
              </section>
            </div>

            <footer className={styles.pauseActions}>
              {onReplayCurrentCutscene ? (
                <button type="button" className={styles.secondaryButton} onClick={onReplayCurrentCutscene}>
                  {labels.replayCurrentCutscene}
                </button>
              ) : null}
              <button type="button" className={styles.secondaryButton} onClick={() => setArchiveOpen((value) => !value)}>
                {labels.recallArchive}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setConfirmingRestart(true)}
              >
                {labels.restart}
              </button>
              <button type="button" className={styles.textButton} onClick={onReturnToMenu}>
                {labels.returnToMenu}
              </button>
            </footer>
          </>
        )}
    </AdventureDialog>
  );
}

export type { PauseMenuLabels, PauseMenuProps };
