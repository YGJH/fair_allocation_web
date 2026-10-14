import type { AdventureMessages } from '../i18n/adventure';
import type { CampaignPhase } from './types';

export const CUTSCENE_SLOTS = [
  'cs-00', 'cs-01', 'cs-02', 'cs-03', 'cs-04', 'cs-05', 'cs-06', 'cs-07', 'cs-08', 'cs-09',
  'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14',
] as const;

export type CutsceneSlot = (typeof CUTSCENE_SLOTS)[number];

export const AVAILABLE_CUTSCENE_SLOTS = ['cs-00', 'cs-01', 'cs-02', 'cs-03'] as const satisfies readonly CutsceneSlot[];
export type AvailableCutsceneSlot = (typeof AVAILABLE_CUTSCENE_SLOTS)[number];
export type AuthoredCutsceneSlot = AvailableCutsceneSlot | 'cs-04' | 'cs-05' | 'cs-06' | 'cs-07' | 'cs-08' | 'cs-09' | 'cs-10' | 'cs-11' | 'cs-12' | 'cs-13' | 'cs-14';
export const AUTHORED_CUTSCENE_SLOTS = ['cs-00', 'cs-01', 'cs-02', 'cs-03', 'cs-04', 'cs-05', 'cs-06', 'cs-07', 'cs-08', 'cs-09', 'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14'] as const satisfies readonly AuthoredCutsceneSlot[];

export type CutsceneCueKey = keyof AdventureMessages['cues'];
export type CutsceneTranscriptKey = keyof AdventureMessages['transcript'];

export type CutsceneCue = {
  readonly startSeconds: number;
  readonly endSeconds: number;
  readonly textKey: CutsceneCueKey;
};

export type StaticCutsceneFallback = {
  readonly imageSrc: string;
  readonly transcriptKeys: readonly CutsceneTranscriptKey[];
};

export type VideoCutsceneMedia = {
  readonly kind: 'video';
  readonly src: string;
  readonly mimeType: 'video/mp4' | 'video/webm';
  readonly posterSrc: string;
  readonly durationSeconds: number;
  readonly fallback: StaticCutsceneFallback;
};

export type AnimaticCutsceneMedia = {
  readonly kind: 'animatic';
  readonly frames: readonly {
    readonly imageSrc: string;
    readonly durationSeconds: number;
  }[];
  readonly durationSeconds: number;
  readonly fallback: StaticCutsceneFallback;
};

export type StaticCutsceneMedia = {
  readonly kind: 'static';
  readonly durationSeconds: 0;
  readonly fallback: StaticCutsceneFallback;
};

export type CutsceneMedia =
  | VideoCutsceneMedia
  | AnimaticCutsceneMedia
  | StaticCutsceneMedia;

export interface CutsceneManifestEntry {
  readonly slot: AuthoredCutsceneSlot;
  readonly media: CutsceneMedia;
  readonly cues: readonly CutsceneCue[];
  readonly nextPhase: Exclude<CampaignPhase, 'cutscene'>;
}

const cs01TranscriptKeys = ['cs01Scene', 'cs01Zhou', 'cs01Closing'] as const satisfies readonly CutsceneTranscriptKey[];
const cs02TranscriptKeys = ['cs02Scene', 'cs02Reaction'] as const satisfies readonly CutsceneTranscriptKey[];
const cs03TranscriptKeys = ['cs03Scene', 'cs03Letter', 'cs03Future'] as const satisfies readonly CutsceneTranscriptKey[];
const cs04TranscriptKeys = ['cs04Scene', 'cs04Zhou', 'cs04Closing'] as const satisfies readonly CutsceneTranscriptKey[];
const cs05TranscriptKeys = ['cs05Scene', 'cs05Reaction'] as const satisfies readonly CutsceneTranscriptKey[];
const cs06TranscriptKeys = ['cs06Recommendation', 'cs06Zhang', 'cs06Feng', 'cs06Qi'] as const satisfies readonly CutsceneTranscriptKey[];
const cs07TranscriptKeys = ['cs07Rules', 'cs07FourDays'] as const satisfies readonly CutsceneTranscriptKey[];
const cs08TranscriptKeys = ['cs08Zhang', 'cs08Cheng'] as const satisfies readonly CutsceneTranscriptKey[];
const cs09TranscriptKeys = ['cs09History'] as const satisfies readonly CutsceneTranscriptKey[];
const cs10TranscriptKeys = ['cs10History'] as const satisfies readonly CutsceneTranscriptKey[];
const cs11TranscriptKeys = ['cs11History'] as const satisfies readonly CutsceneTranscriptKey[];
const cs12TranscriptKeys = ['cs12History'] as const satisfies readonly CutsceneTranscriptKey[];
const cs13TranscriptKeys = ['cs13Dialogue', 'cs13History'] as const satisfies readonly CutsceneTranscriptKey[];
const cs14TranscriptKeys = ['cs14Narration'] as const satisfies readonly CutsceneTranscriptKey[];

// The fallback scene description is visual-only; every other CS-00 transcript
// entry, including the title card, is represented by a normal-play cue.
export const CS00_VISUAL_ONLY_TRANSCRIPT_KEYS = ['scene'] as const satisfies readonly CutsceneTranscriptKey[];

const cs00TranscriptKeys = [
  'scene',
  'emperor',
  'chengUncertain',
  'fengReaction',
  'chengDivide',
  'title',
  'narratorRabbits',
  'narratorLife',
  'narratorFirstCase',
  'sixYearsEarlier',
] as const satisfies readonly CutsceneTranscriptKey[];

export const cutsceneManifest: Readonly<Record<AuthoredCutsceneSlot, CutsceneManifestEntry>> = {
  'cs-00': {
    slot: 'cs-00',
    nextPhase: 'title',
    media: {
      kind: 'video',
      src: '/adventure/cutscenes/cs-00.mp4',
      mimeType: 'video/mp4',
      posterSrc: '/adventure/cutscenes/cs-00-poster.jpg',
      durationSeconds: 64.454,
      fallback: {
        imageSrc: '/adventure/cutscenes/cs-00-fallback.jpg',
        transcriptKeys: cs00TranscriptKeys,
      },
    },
    // These broad cue boundaries follow the delivered 64.454-second mother's
    // observed audio/shot changes; the older 38/66-second edit plans are not used.
    cues: [
      { startSeconds: 0, endSeconds: 10, textKey: 'location' },
      { startSeconds: 10, endSeconds: 30.7, textKey: 'emperor' },
      { startSeconds: 30.7, endSeconds: 44.4, textKey: 'chengUncertain' },
      { startSeconds: 44.4, endSeconds: 46.4, textKey: 'fengReaction' },
      { startSeconds: 46.4, endSeconds: 56.5, textKey: 'chengDivide' },
      // The delivered mother's final 7.954 seconds holds the steelyard and its
      // title transition; these cue boundaries keep every normal-play caption
      // inside the 64.454-second runtime without importing old edit timings.
      { startSeconds: 56.5, endSeconds: 56.9, textKey: 'title' },
      { startSeconds: 56.9, endSeconds: 59.6, textKey: 'narratorRabbits' },
      { startSeconds: 59.6, endSeconds: 61.25, textKey: 'narratorLife' },
      { startSeconds: 61.25, endSeconds: 63.55, textKey: 'narratorFirstCase' },
      { startSeconds: 63.55, endSeconds: 64.454, textKey: 'sixYearsEarlier' },
    ],
  },
  'cs-01': {
    slot: 'cs-01',
    nextPhase: 'intro',
    media: {
      kind: 'static',
      durationSeconds: 0,
      fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs01TranscriptKeys },
    },
    cues: [],
  },
  'cs-02': {
    slot: 'cs-02',
    nextPhase: 'challenge',
    media: {
      kind: 'static',
      durationSeconds: 0,
      fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs02TranscriptKeys },
    },
    cues: [],
  },
  'cs-03': {
    slot: 'cs-03', nextPhase: 'act-two-transition',
    media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs03TranscriptKeys } }, cues: [],
  },
  'cs-04': {
    slot: 'cs-04', nextPhase: 'intro',
    media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs04TranscriptKeys } }, cues: [],
  },
  'cs-05': {
    slot: 'cs-05', nextPhase: 'challenge',
    media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs05TranscriptKeys } }, cues: [],
  },
  'cs-06': {
    slot: 'cs-06', nextPhase: 'act-three-transition',
    media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs06TranscriptKeys } }, cues: [],
  },
  'cs-07': { slot: 'cs-07', nextPhase: 'intro', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs07TranscriptKeys } }, cues: [] },
  'cs-08': { slot: 'cs-08', nextPhase: 'challenge', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs08TranscriptKeys } }, cues: [] },
  'cs-09': { slot: 'cs-09', nextPhase: 'ending', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs09TranscriptKeys } }, cues: [] },
  'cs-10': { slot: 'cs-10', nextPhase: 'ending', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs10TranscriptKeys } }, cues: [] },
  'cs-11': { slot: 'cs-11', nextPhase: 'ending', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs11TranscriptKeys } }, cues: [] },
  'cs-12': { slot: 'cs-12', nextPhase: 'ending', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs12TranscriptKeys } }, cues: [] },
  'cs-13': { slot: 'cs-13', nextPhase: 'ending', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs13TranscriptKeys } }, cues: [] },
  'cs-14': { slot: 'cs-14', nextPhase: 'ending', media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E', transcriptKeys: cs14TranscriptKeys } }, cues: [] },
};

// Keep the first-edition archive enumeration stable while exposing authored Act II slots to the player.
for (const slot of ['cs-04', 'cs-05', 'cs-06', 'cs-07', 'cs-08', 'cs-09', 'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14'] as const) {
  Object.defineProperty(cutsceneManifest, slot, { value: cutsceneManifest[slot], enumerable: false, configurable: false });
}
