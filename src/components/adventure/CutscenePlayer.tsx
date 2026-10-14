'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy, type AdventureMessages } from '../../i18n/adventure';
import {
  cutsceneManifest,
  type AvailableCutsceneSlot,
  type CutsceneManifestEntry,
} from '../../narrative/media-manifest';
import type { CampaignSettings } from '../../narrative/persistence';
import styles from './CutscenePlayer.module.css';

type PlaybackSettings = Pick<CampaignSettings, 'subtitles' | 'volume'>;

type CutscenePlayerProps = {
  readonly slot: AvailableCutsceneSlot;
  readonly locale: Locale;
  readonly settings: PlaybackSettings;
  readonly onSubtitlesChange: (enabled: boolean) => void;
  readonly onVolumeChange: (volume: number) => void;
  readonly onComplete: () => void;
  readonly suspended?: boolean;
};

type MotionPreference = 'pending' | 'allow' | 'reduce';
type PlayerStatus = 'gate' | 'playing' | 'paused' | 'error' | 'ended';

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function StaticFallback({
  entry,
  messages,
  reducedMotion,
  onContinue,
  continueRef,
}: {
  readonly entry: CutsceneManifestEntry;
  readonly messages: AdventureMessages;
  readonly reducedMotion: boolean;
  readonly onContinue: () => void;
  readonly continueRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const transcript = entry.media.fallback.transcriptKeys;

  return (
    <section className={styles.staticFallback} aria-labelledby="cutscene-static-title">
      <div className={styles.stillFrame}>
        <img
          src={entry.media.fallback.imageSrc}
          width={1920}
          height={1080}
          alt={messages.fallbackAltBySlot[entry.slot as AvailableCutsceneSlot]}
        />
      </div>
      <div className={styles.transcriptPanel}>
        <p className={styles.eyebrow}>{messages.fallbackTitleBySlot[entry.slot]}</p>
        <h2 id="cutscene-static-title">{messages.fallbackHeadingBySlot[entry.slot]}</h2>
        <p>{reducedMotion ? messages.reducedMotionBody : messages.fallbackBody}</p>
        <h3>{messages.transcriptTitle}</h3>
        <ol className={styles.transcript}>
          {transcript.map((key) => <li key={key}>{messages.transcript[key]}</li>)}
        </ol>
        <button ref={continueRef} type="button" className={styles.primary} onClick={onContinue}>
          {messages.continue}
        </button>
      </div>
    </section>
  );
}

export function CutscenePlayer({
  slot,
  locale,
  settings,
  onSubtitlesChange,
  onVolumeChange,
  onComplete,
  suspended = false,
}: CutscenePlayerProps) {
  const messages = getAdventureCopy(locale);
  const entry = cutsceneManifest[slot];
  const videoRef = useRef<HTMLVideoElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const completedRef = useRef(false);
  const playAttemptRef = useRef(0);
  const lastAudibleVolumeRef = useRef(settings.volume > 0 ? clampVolume(settings.volume) : 1);
  const [motionPreference, setMotionPreference] = useState<MotionPreference>('pending');
  const [status, setStatus] = useState<PlayerStatus>('gate');
  const [showFallback, setShowFallback] = useState(false);
  const [subtitles, setSubtitles] = useState(settings.subtitles);
  const [muted, setMuted] = useState(settings.volume === 0);
  const [currentTime, setCurrentTime] = useState(0);

  const resetVideoToGate = useCallback(() => {
    playAttemptRef.current += 1;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setCurrentTime(0);
    setStatus('gate');
  }, []);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    return () => {
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) {
      setMotionPreference('allow');
      return;
    }

    const updatePreference = () => {
      resetVideoToGate();
      setMotionPreference(mediaQuery.matches ? 'reduce' : 'allow');
    };
    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, [resetVideoToGate]);

  useEffect(() => setSubtitles(settings.subtitles), [settings.subtitles]);

  useEffect(() => {
    const volume = clampVolume(settings.volume);
    if (volume > 0) lastAudibleVolumeRef.current = volume;
    setMuted(volume === 0);
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
    }
  }, [settings.volume, motionPreference]);

  useEffect(() => {
    if (suspended) return;
    if (motionPreference === 'allow' && status === 'gate') enterRef.current?.focus();
    if (status === 'error') retryRef.current?.focus();
    if (motionPreference === 'reduce' || showFallback) continueRef.current?.focus();
  }, [motionPreference, showFallback, status, suspended]);

  useEffect(() => {
    if (!suspended) return;
    playAttemptRef.current += 1;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setStatus((current) => current === 'playing' ? 'paused' : current);
  }, [suspended]);

  const finish = useCallback(() => {
    if (suspended || completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete, suspended]);

  const playVideo = useCallback(async (restart = false) => {
    const video = videoRef.current;
    if (!video || suspended) return;
    const attempt = ++playAttemptRef.current;
    if (restart) {
      video.currentTime = 0;
      setCurrentTime(0);
    }
    video.volume = clampVolume(settings.volume);
    video.muted = muted;
    setStatus('playing');
    try {
      await video.play();
    } catch {
      if (playAttemptRef.current === attempt) setStatus('error');
    }
  }, [muted, settings.volume, suspended]);

  function handlePauseResume() {
    const video = videoRef.current;
    if (!video) return;
    if (status === 'playing') {
      video.pause();
      setStatus('paused');
      return;
    }
    void playVideo();
  }

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    const volume = clampVolume(Number(event.target.value));
    if (volume > 0) lastAudibleVolumeRef.current = volume;
    setMuted(volume === 0);
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
    }
    onVolumeChange(volume);
  }

  function handleSubtitlesChange() {
    const next = !subtitles;
    setSubtitles(next);
    onSubtitlesChange(next);
  }

  function handleMuteChange() {
    const nextMuted = !muted;
    const nextVolume = nextMuted ? 0 : lastAudibleVolumeRef.current;
    setMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = nextVolume;
    }
    onVolumeChange(nextVolume);
  }

  function handleRetry() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    try {
      video.load();
    } catch {
      // Some test and embedded media implementations do not expose load().
    }
    void playVideo(true);
  }

  function handleEnded() {
    if (suspended) {
      setStatus('paused');
      return;
    }
    setStatus('ended');
    finish();
  }

  function handlePlayerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== ' ' || event.target !== event.currentTarget) return;
    event.preventDefault();
    handlePauseResume();
  }

  if (motionPreference === 'reduce' || showFallback || entry.media.kind === 'static') {
    return (
      <StaticFallback
        entry={entry}
        messages={messages}
        reducedMotion={motionPreference === 'reduce'}
        onContinue={finish}
        continueRef={continueRef}
      />
    );
  }

  if (motionPreference === 'pending') {
    return (
      <section className={styles.loading} aria-live="polite">
        <p>{messages.loading}</p>
      </section>
    );
  }

  if (entry.media.kind !== 'video') {
    return (
      <StaticFallback
        entry={entry}
        messages={messages}
        reducedMotion={false}
        onContinue={finish}
        continueRef={continueRef}
      />
    );
  }

  const activeCue = entry.cues.find((cue) => (
    currentTime >= cue.startSeconds && currentTime < cue.endSeconds
  ));

  return (
    <section
      className={styles.player}
      aria-labelledby="cutscene-title"
      onKeyDown={handlePlayerKeyDown}
      tabIndex={-1}
      data-suspended={suspended || undefined}
    >
      <h2 id="cutscene-title" className={styles.visuallyHidden}>{messages.title}</h2>
      <div className={styles.videoFrame}>
        <video
          ref={videoRef}
          className={styles.video}
          width={1920}
          height={1080}
          poster={entry.media.posterSrc}
          preload="metadata"
          playsInline
          aria-label={messages.videoLabel}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onEnded={handleEnded}
          onError={() => setStatus('error')}
          onPause={() => status === 'playing' && setStatus('paused')}
          onPlay={(event) => {
            if (suspended) {
              event.currentTarget.pause();
              setStatus('paused');
              return;
            }
            setStatus('playing');
          }}
        >
          <source src={entry.media.src} type={entry.media.mimeType} />
        </video>

        {status === 'gate' && (
          <div className={styles.gate}>
            <p>{messages.title}</p>
            <button ref={enterRef} type="button" className={styles.enter} onClick={() => void playVideo()}>
              {messages.enter}
            </button>
          </div>
        )}

        {subtitles && activeCue && status !== 'gate' && (
          <p className={styles.captions} aria-live="polite">{messages.cues[activeCue.textKey]}</p>
        )}

        {status === 'error' && (
          <div className={styles.error} role="alert">
            <h3>{messages.errorTitle}</h3>
            <p>{messages.errorBody}</p>
            <div>
              <button ref={retryRef} type="button" onClick={handleRetry}>{messages.retry}</button>
              <button
                type="button"
                onClick={() => {
                  resetVideoToGate();
                  setShowFallback(true);
                }}
              >
                {messages.useFallback}
              </button>
            </div>
          </div>
        )}

        {status === 'ended' && (
          <div className={styles.ended}>
            <button type="button" onClick={() => void playVideo(true)}>{messages.replay}</button>
          </div>
        )}
      </div>

      <div className={styles.controls} role="group" aria-label={messages.videoLabel}>
        <button type="button" onClick={handlePauseResume} disabled={status === 'gate' || status === 'error'}>
          {status === 'playing' ? messages.pause : messages.resume}
        </button>
        <button type="button" onClick={handleMuteChange} aria-pressed={muted}>
          {muted ? messages.unmute : messages.mute}
        </button>
        <label>
          <span>{messages.volume}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={handleVolumeChange}
            aria-label={messages.volume}
          />
        </label>
        <button type="button" onClick={handleSubtitlesChange} aria-pressed={subtitles}>
          {subtitles ? messages.subtitlesOn : messages.subtitlesOff}
        </button>
        <button type="button" onClick={() => void playVideo(true)} disabled={status === 'gate' || status === 'error'}>
          {messages.replay}
        </button>
        <button type="button" className={styles.skip} onClick={finish}>{messages.skip}</button>
      </div>
    </section>
  );
}

export type { CutscenePlayerProps };
