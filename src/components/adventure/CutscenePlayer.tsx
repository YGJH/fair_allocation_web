'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy, type AdventureMessages } from '../../i18n/adventure';
import {
  cutsceneManifest,
  getPortraitAsset,
  type AvailableCutsceneSlot,
  type CutsceneManifestEntry,
  type DialogueLineDefinition,
  type SequenceCutsceneMedia,
  type StillSegment,
  type StillMotion,
} from '../../narrative/media-manifest';
import type { CampaignSettings } from '../../narrative/persistence';
import { NarrativeDialogue, type NarrativeDialogueLine } from './NarrativeDialogue';
import styles from './CutscenePlayer.module.css';

type PlaybackSettings = Pick<CampaignSettings, 'subtitles' | 'volume' | 'dialogueAutoPlay' | 'dialogueSpeed'>;

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

function motionStyle(motion: StillMotion, durationSeconds: number): CSSProperties & Record<string, string | number> {
  const base = { '--sequence-duration': `${durationSeconds}s` } as CSSProperties & Record<string, string | number>;
  if (motion.kind === 'push-in' || motion.kind === 'pull-out') {
    return { ...base, '--focus-x': `${motion.focus.x * 100}%`, '--focus-y': `${motion.focus.y * 100}%` };
  }
  return base;
}

export function AnimaticStill({
  segment,
  alt,
  layout = 'frame',
  reducedMotion = false,
  onError,
}: {
  readonly segment: StillSegment;
  readonly alt: string;
  readonly layout?: 'frame' | 'standalone';
  readonly reducedMotion?: boolean;
  readonly onError?: () => void;
}) {
  const motionClass = reducedMotion || segment.motion.kind === 'hold'
    ? ''
    : styles[`motion_${segment.motion.kind.replace('-', '_')}`];
  const imageClass = layout === 'frame' ? styles.sequenceImage : styles.standaloneImage;

  return (
    <img
      className={`${imageClass} ${motionClass}`.trim()}
      data-motion={segment.motion.kind}
      style={motionStyle(segment.motion, segment.durationSeconds)}
      src={segment.imageSrc}
      width={2752}
      height={1536}
      alt={alt}
      onError={onError}
    />
  );
}

function localizeDialogueLine(line: DialogueLineDefinition, messages: AdventureMessages): NarrativeDialogueLine {
  if (line.speakerId === 'master-zhou') {
    return {
      ...line,
      speakerName: messages.investigation.parties.masterZhou.name,
      speakerRole: messages.investigation.parties.masterZhou.role,
      text: messages.transcript[line.textKey],
    };
  }
  if (line.speakerId === 'cheng-heng' || line.speakerId === 'cheng-heng-act3') {
    return {
      ...line,
      speakerName: messages.investigation.parties.chengHeng.name,
      speakerRole: messages.investigation.parties.chengHeng.role,
      text: messages.transcript[line.textKey],
    };
  }
  const party = line.speakerId === 'chen-shouye'
    ? messages.investigation.parties.chenShouye
    : line.speakerId === 'chen-congzheng'
      ? messages.investigation.parties.chenCongzheng
      : messages.investigation.parties.chenElder;
  return { ...line, speakerName: party.name, speakerRole: party.role, text: messages.transcript[line.textKey] };
}

function SequenceVideoBeat({ segment, volume, suspended, onComplete, onFallback }: {
  readonly segment: Extract<SequenceCutsceneMedia['segments'][number], { kind: 'video' }>;
  readonly volume: number;
  readonly suspended: boolean;
  readonly onComplete: () => void;
  readonly onFallback: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = clampVolume(volume);
    if (suspended) video.pause();
    else void video.play().catch(() => {});
  }, [suspended, volume]);
  return (
    <video
      ref={videoRef}
      className={styles.sequenceImage}
      src={segment.src}
      poster={segment.posterSrc}
      playsInline
      controls
      autoPlay={!suspended}
      onEnded={onComplete}
      onError={onFallback}
    >
      <source src={segment.src} type={segment.mimeType} />
    </video>
  );
}

function SequencePlayer({
  media,
  locale,
  messages,
  settings,
  subtitles,
  reducedMotion,
  suspended,
  onSubtitlesChange,
  onFallback,
  onComplete,
}: {
  readonly media: SequenceCutsceneMedia;
  readonly locale: Locale;
  readonly messages: AdventureMessages;
  readonly settings: PlaybackSettings;
  readonly subtitles: boolean;
  readonly reducedMotion: boolean;
  readonly suspended: boolean;
  readonly onSubtitlesChange: () => void;
  readonly onFallback: () => void;
  readonly onComplete: () => void;
}) {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const segment = media.segments[segmentIndex];
  const completedRef = useRef(false);

  const advance = useCallback(() => {
    setElapsedSeconds(0);
    if (segmentIndex >= media.segments.length - 1) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }
    setSegmentIndex((current) => current + 1);
  }, [media.segments.length, onComplete, segmentIndex]);

  useEffect(() => {
    if (segment?.kind !== 'still' || paused || suspended) return;
    const timer = window.setInterval(() => setElapsedSeconds((current) => current + 0.1), 100);
    return () => window.clearInterval(timer);
  }, [paused, segment, suspended]);

  useEffect(() => {
    if (segment?.kind === 'still' && elapsedSeconds + 0.001 >= segment.durationSeconds) advance();
  }, [advance, elapsedSeconds, segment]);

  if (!segment) return null;
  if (segment.kind === 'dialogue') {
    return (
      <section className={styles.sequenceShell} data-segment="dialogue">
        <NarrativeDialogue
          locale={locale}
          lines={segment.lines.map((line) => localizeDialogueLine(line, messages))}
          autoPlay={settings.dialogueAutoPlay}
          speed={settings.dialogueSpeed}
          continueLabel={messages.continue}
          suspended={suspended}
          onComplete={advance}
        />
        <button type="button" className={styles.sequenceSkip} onClick={onComplete}>{messages.skip}</button>
      </section>
    );
  }
  if (segment.kind === 'document') {
    return (
      <section className={styles.documentBeat} aria-labelledby="cutscene-document-title" data-segment="document">
        <div className={styles.documentPaper}>
          <p className={styles.documentSeal} aria-hidden="true">衡</p>
          <h2 id="cutscene-document-title">{messages.transcript[segment.titleKey]}</h2>
          {segment.bodyKeys.map((key) => <p key={key}>{messages.transcript[key]}</p>)}
          <button type="button" className={styles.primary} onClick={advance}>{messages.continue}</button>
        </div>
      </section>
    );
  }
  if (segment.kind === 'video') {
    return (
      <section className={styles.sequenceShell} data-segment="video">
        <div className={styles.sequenceFrame}>
          <SequenceVideoBeat segment={segment} volume={settings.volume} suspended={suspended || paused} onComplete={advance} onFallback={onFallback} />
        </div>
        <div className={styles.sequenceControls} role="group" aria-label={messages.title}>
          <button type="button" onClick={() => setPaused((current) => !current)} disabled={suspended}>{paused ? messages.resume : messages.pause}</button>
          <button type="button" className={styles.skip} onClick={onComplete}>{messages.skip}</button>
        </div>
      </section>
    );
  }

  const activeOverlays = segment.overlays?.filter(({ startSeconds, endSeconds }) => elapsedSeconds >= startSeconds && elapsedSeconds < endSeconds) ?? [];
  return (
    <section className={styles.sequenceShell} data-segment="still">
      <div className={styles.sequenceFrame} data-reduced-motion={reducedMotion ? 'true' : 'false'}>
        <AnimaticStill
          segment={segment}
          alt={messages.transcript[segment.altKey]}
          reducedMotion={reducedMotion}
          onError={onFallback}
        />
        {subtitles ? activeOverlays.map((overlay) => (
          <p key={`${overlay.textKey}-${overlay.startSeconds}`} className={`${styles.sequenceOverlay} ${styles[`overlay_${overlay.kind}`]}`}>
            {messages.transcript[overlay.textKey]}
          </p>
        )) : null}
      </div>
      <div className={styles.sequenceControls} role="group" aria-label={messages.title}>
        <button type="button" onClick={() => setPaused((current) => !current)} disabled={suspended}>{paused ? messages.resume : messages.pause}</button>
        <button type="button" onClick={onSubtitlesChange} aria-pressed={subtitles}>{subtitles ? messages.subtitlesOn : messages.subtitlesOff}</button>
        <button type="button" className={styles.skip} onClick={onComplete}>{messages.skip}</button>
      </div>
    </section>
  );
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

  if (showFallback || entry.media.kind === 'static' || (motionPreference === 'reduce' && entry.media.kind === 'video')) {
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

  if (entry.media.kind === 'sequence') {
    return (
      <SequencePlayer
        media={entry.media}
        locale={locale}
        messages={messages}
        settings={settings}
        subtitles={subtitles}
        reducedMotion={motionPreference === 'reduce'}
        suspended={suspended}
        onSubtitlesChange={handleSubtitlesChange}
        onFallback={() => setShowFallback(true)}
        onComplete={finish}
      />
    );
  }

  if (entry.media.kind !== 'video') return null;

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
