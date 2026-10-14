'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { LandscapeGate, type LandscapeGateLabels } from './LandscapeGate';
import styles from './AdventureStage.module.css';

type GameStageLabels = {
  readonly stage: string;
  readonly skipToContent: string;
  readonly enterFullscreen: string;
  readonly fullscreenActive: string;
  readonly fullscreenEntered: string;
  readonly fullscreenUnsupported: string;
  readonly fullscreenFailed: string;
  readonly orientationLockUnsupported: string;
  readonly orientationLockFailed: string;
};

type GameStageProps = {
  readonly children: ReactNode;
  readonly labels: GameStageLabels;
  readonly backgroundImageSrc?: string;
  readonly background?: ReactNode;
  readonly lockOrientationOnFullscreen?: boolean;
  readonly landscapeGateLabels?: LandscapeGateLabels;
  readonly onLandscapeBlockedChange?: (blocked: boolean) => void;
  readonly chromeInert?: boolean;
  readonly className?: string;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
};

export function GameStage({
  children,
  labels,
  backgroundImageSrc,
  background,
  lockOrientationOnFullscreen = false,
  landscapeGateLabels,
  onLandscapeBlockedChange,
  chromeInert = false,
  className,
}: GameStageProps) {
  const stageRef = useRef<HTMLElement>(null);
  const contentId = useId();
  const [feedback, setFeedback] = useState('');
  const [requestPending, setRequestPending] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  useEffect(() => {
    function updateFullscreenState() {
      setFullscreenActive(document.fullscreenElement === stageRef.current);
    }

    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  async function requestFullscreen() {
    const stage = stageRef.current;
    if (!stage || requestPending || fullscreenActive) return;

    if (typeof stage.requestFullscreen !== 'function') {
      setFeedback(labels.fullscreenUnsupported);
      return;
    }

    setRequestPending(true);
    try {
      await stage.requestFullscreen();
      setFullscreenActive(true);
      setFeedback(labels.fullscreenEntered);

      if (!lockOrientationOnFullscreen) return;

      const orientation = window.screen.orientation as LockableScreenOrientation | undefined;
      if (typeof orientation?.lock !== 'function') {
        setFeedback(labels.orientationLockUnsupported);
        return;
      }

      try {
        await orientation.lock('landscape');
      } catch {
        setFeedback(labels.orientationLockFailed);
      }
    } catch {
      setFeedback(labels.fullscreenFailed);
    } finally {
      setRequestPending(false);
    }
  }

  const backgroundStyle = backgroundImageSrc
    ? ({ '--game-stage-background': `url("${backgroundImageSrc}")` } as CSSProperties)
    : undefined;
  const stageClassName = className ? `${styles.stage} ${className}` : styles.stage;

  const stageContents = (
    <>
      <div className={styles.background} aria-hidden="true">{background}</div>
      <div className={styles.safeArea}>
        <a
          className={styles.skipLink}
          href={`#${contentId}`}
          inert={chromeInert || undefined}
          aria-hidden={chromeInert || undefined}
        >
          {labels.skipToContent}
        </a>
        <div
          className={styles.stageToolbar}
          inert={chromeInert || undefined}
          aria-hidden={chromeInert || undefined}
        >
          <button
            type="button"
            className={styles.fullscreenButton}
            onClick={() => void requestFullscreen()}
            disabled={requestPending || fullscreenActive}
          >
            {fullscreenActive ? labels.fullscreenActive : labels.enterFullscreen}
          </button>
          <p className={styles.stageFeedback} role="status" aria-live="polite">
            {feedback}
          </p>
        </div>
        <main id={contentId} className={styles.stageContent} tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );

  return (
    <section
      ref={stageRef}
      className={stageClassName}
      style={backgroundStyle}
      aria-label={labels.stage}
    >
      {landscapeGateLabels ? (
        <LandscapeGate labels={landscapeGateLabels} onBlockedChange={onLandscapeBlockedChange}>
          {stageContents}
        </LandscapeGate>
      ) : stageContents}
    </section>
  );
}

export type { GameStageLabels, GameStageProps };
