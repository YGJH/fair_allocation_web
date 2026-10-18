'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/copy';
import type { CharacterId, PortraitExpression } from '../../narrative/media-manifest';
import { PortraitCard } from './PortraitCard';
import styles from './NarrativeDialogue.module.css';

export type NarrativeDialogueLine = {
  readonly speakerId: CharacterId;
  readonly speakerName: string;
  readonly speakerRole: string;
  readonly expression: PortraitExpression;
  readonly text: string;
  readonly layout: 'solo' | 'duo';
  readonly side?: 'left' | 'right';
};

const SPEED_MS_PER_CHARACTER = { slow: 95, standard: 70, fast: 48 } as const;

export function NarrativeDialogue({
  locale,
  lines,
  autoPlay,
  speed,
  continueLabel,
  suspended = false,
  hideContinueAction = false,
  onComplete,
}: {
  readonly locale: Locale;
  readonly lines: readonly NarrativeDialogueLine[];
  readonly autoPlay: boolean;
  readonly speed: keyof typeof SPEED_MS_PER_CHARACTER;
  readonly continueLabel: string;
  readonly suspended?: boolean;
  readonly hideContinueAction?: boolean;
  readonly onComplete: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const line = lines[lineIndex];

  useEffect(() => {
    if (!suspended && !autoPlay && !hideContinueAction) buttonRef.current?.focus();
  }, [autoPlay, hideContinueAction, lineIndex, suspended]);

  useEffect(() => {
    if (!autoPlay || suspended || !line) return;
    const delay = Math.max(2_400, Math.min(12_000, line.text.length * SPEED_MS_PER_CHARACTER[speed]));
    const timer = window.setTimeout(() => {
      if (lineIndex === lines.length - 1) onComplete();
      else setLineIndex((current) => current + 1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [autoPlay, line, lineIndex, lines.length, onComplete, speed, suspended]);

  if (!line) return null;
  const advance = () => {
    if (lineIndex === lines.length - 1) onComplete();
    else setLineIndex((current) => current + 1);
  };

  return (
    <section className={styles.dialogue} aria-label={line.speakerName} data-dialogue-layout={line.layout}>
      <div className={styles.portraitStage}>
        <PortraitCard
          locale={locale}
          characterId={line.speakerId}
          expression={line.expression}
          name={line.speakerName}
          role={line.speakerRole}
          presentation={line.layout === 'solo' ? 'dialogue-solo' : 'dialogue-duo'}
          emphasis="speaker"
          side={line.side}
        />
      </div>
      <div className={styles.dialogueBox}>
        <p className={styles.speaker}>{line.speakerName}</p>
        <p className={styles.line}>{line.text}</p>
        {!autoPlay && !hideContinueAction ? (
          <button ref={buttonRef} type="button" onClick={advance}>{continueLabel}</button>
        ) : autoPlay ? (
          <p className={styles.autoStatus} aria-live="polite">{lineIndex + 1} / {lines.length}</p>
        ) : null}
      </div>
    </section>
  );
}
