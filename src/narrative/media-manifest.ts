import type { AdventureMessages } from '../i18n/adventure';

export const CUTSCENE_SLOTS = [
  'cs-00', 'cs-01', 'cs-02', 'cs-03', 'cs-04', 'cs-05', 'cs-06', 'cs-07', 'cs-08', 'cs-09',
  'cs-10', 'cs-11', 'cs-12', 'cs-13', 'cs-14',
] as const;

export type CutsceneSlot = (typeof CUTSCENE_SLOTS)[number];

export const AVAILABLE_CUTSCENE_SLOTS = ['cs-00', 'cs-01', 'cs-02', 'cs-03'] as const satisfies readonly CutsceneSlot[];
export type AvailableCutsceneSlot = (typeof AVAILABLE_CUTSCENE_SLOTS)[number];
export type AuthoredCutsceneSlot = CutsceneSlot;
export const AUTHORED_CUTSCENE_SLOTS = CUTSCENE_SLOTS satisfies readonly AuthoredCutsceneSlot[];

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

export type NormalizedPoint = { readonly x: number; readonly y: number };
export type StillMotion =
  | { readonly kind: 'push-in'; readonly fromScale: 1; readonly toScale: 1.06; readonly focus: NormalizedPoint }
  | { readonly kind: 'pull-out'; readonly fromScale: 1.06; readonly toScale: 1; readonly focus: NormalizedPoint }
  | { readonly kind: 'pan-left' | 'pan-right'; readonly distance: 0.04 }
  | { readonly kind: 'hold' };

export type TimedTextOverlay = {
  readonly kind: 'caption' | 'location' | 'title';
  readonly textKey: CutsceneTranscriptKey;
  readonly startSeconds: number;
  readonly endSeconds: number;
};

export type CharacterId =
  | 'cheng-heng'
  | 'cheng-heng-act3'
  | 'master-zhou'
  | 'chen-shouye'
  | 'chen-congzheng'
  | 'chen-elder';

export type PortraitExpression = 'calm' | 'pleased' | 'aggrieved' | 'hint1' | 'hint2' | 'worried' | 'resolute';

export type StillSegment = {
  readonly kind: 'still';
  readonly imageSrc: string;
  readonly durationSeconds: number;
  readonly motion: StillMotion;
  readonly overlays?: readonly TimedTextOverlay[];
  readonly altKey: CutsceneTranscriptKey;
};

export type VideoSegment = {
  readonly kind: 'video';
  readonly src: string;
  readonly mimeType: 'video/mp4' | 'video/webm';
  readonly posterSrc: string;
  readonly durationSeconds: number;
  readonly overlays?: readonly TimedTextOverlay[];
};

export type DialogueLineDefinition = {
  readonly speakerId: CharacterId;
  readonly expression: PortraitExpression;
  readonly textKey: CutsceneTranscriptKey;
  readonly layout: 'solo' | 'duo';
  readonly side?: 'left' | 'right';
};

export type DialogueSegment = {
  readonly kind: 'dialogue';
  readonly lines: readonly DialogueLineDefinition[];
};

export type DocumentSegment = {
  readonly kind: 'document';
  readonly titleKey: CutsceneTranscriptKey;
  readonly bodyKeys: readonly CutsceneTranscriptKey[];
};

export type CutsceneSegment = StillSegment | VideoSegment | DialogueSegment | DocumentSegment;

export type SequenceCutsceneMedia = {
  readonly kind: 'sequence';
  /** Timed visual duration; manual dialogue/document beats are excluded. */
  readonly durationSeconds: number;
  readonly segments: readonly CutsceneSegment[];
  readonly fallback: StaticCutsceneFallback;
};

export type StaticCutsceneMedia = {
  readonly kind: 'static';
  readonly durationSeconds: 0;
  readonly fallback: StaticCutsceneFallback;
};

export type CutsceneMedia = VideoCutsceneMedia | SequenceCutsceneMedia | StaticCutsceneMedia;

export interface CutsceneManifestEntry {
  readonly slot: AuthoredCutsceneSlot;
  readonly media: CutsceneMedia;
  readonly cues: readonly CutsceneCue[];
}

const PAPER_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221920%22 height=%221080%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e4d7bf%22/%3E%3C/svg%3E';
const cs01TranscriptKeys = ['cs01Scene', 'cs01Location', 'cs01Zhou'] as const satisfies readonly CutsceneTranscriptKey[];
const cs02TranscriptKeys = ['cs02Scene'] as const satisfies readonly CutsceneTranscriptKey[];
const cs03TranscriptKeys = ['cs03Scene', 'cs03Letter', 'cs03TimeJump', 'cs03LedgerEntry', 'cs03LedgerPlain', 'cs03Transfer', 'cs03TransferPlain'] as const satisfies readonly CutsceneTranscriptKey[];
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

export const CS00_VISUAL_ONLY_TRANSCRIPT_KEYS = ['scene'] as const satisfies readonly CutsceneTranscriptKey[];
const cs00TranscriptKeys = ['scene', 'emperor', 'chengUncertain', 'fengReaction', 'chengDivide', 'title', 'narratorRabbits', 'narratorLife', 'narratorFirstCase', 'sixYearsEarlier'] as const satisfies readonly CutsceneTranscriptKey[];

function staticEntry(slot: AuthoredCutsceneSlot, transcriptKeys: readonly CutsceneTranscriptKey[]): CutsceneManifestEntry {
  return { slot, media: { kind: 'static', durationSeconds: 0, fallback: { imageSrc: PAPER_FALLBACK, transcriptKeys } }, cues: [] };
}

export const cutsceneManifest: Readonly<Record<AuthoredCutsceneSlot, CutsceneManifestEntry>> = {
  'cs-00': {
    slot: 'cs-00',
    media: {
      kind: 'video', src: '/adventure/cutscenes/cs-00.mp4', mimeType: 'video/mp4',
      posterSrc: '/adventure/cutscenes/cs-00-poster.jpg', durationSeconds: 64.454,
      fallback: { imageSrc: '/adventure/cutscenes/cs-00-fallback.jpg', transcriptKeys: cs00TranscriptKeys },
    },
    cues: [
      { startSeconds: 0, endSeconds: 10, textKey: 'location' },
      { startSeconds: 10, endSeconds: 30.7, textKey: 'emperor' },
      { startSeconds: 30.7, endSeconds: 44.4, textKey: 'chengUncertain' },
      { startSeconds: 44.4, endSeconds: 46.4, textKey: 'fengReaction' },
      { startSeconds: 46.4, endSeconds: 56.5, textKey: 'chengDivide' },
      { startSeconds: 56.5, endSeconds: 56.9, textKey: 'title' },
      { startSeconds: 56.9, endSeconds: 59.6, textKey: 'narratorRabbits' },
      { startSeconds: 59.6, endSeconds: 61.25, textKey: 'narratorLife' },
      { startSeconds: 61.25, endSeconds: 63.55, textKey: 'narratorFirstCase' },
      { startSeconds: 63.55, endSeconds: 64.454, textKey: 'sixYearsEarlier' },
    ],
  },
  'cs-01': {
    slot: 'cs-01', cues: [],
    media: {
      kind: 'sequence', durationSeconds: 5.5,
      fallback: { imageSrc: '/adventure/animatics/cs-01/cs-01-s1.jpg', transcriptKeys: cs01TranscriptKeys },
      segments: [
        { kind: 'still', imageSrc: '/adventure/animatics/cs-01/cs-01-s1.jpg', durationSeconds: 3, motion: { kind: 'push-in', fromScale: 1, toScale: 1.06, focus: { x: 0.48, y: 0.56 } }, altKey: 'cs01Scene' },
        { kind: 'still', imageSrc: '/adventure/animatics/cs-01/cs-01-s2.jpg', durationSeconds: 2.5, motion: { kind: 'hold' }, altKey: 'cs01Scene', overlays: [{ kind: 'location', textKey: 'cs01Location', startSeconds: 0, endSeconds: 2.5 }] },
        { kind: 'dialogue', lines: [{ speakerId: 'master-zhou', expression: 'calm', textKey: 'cs01Zhou', layout: 'solo' }] },
      ],
    },
  },
  'cs-02': {
    slot: 'cs-02', cues: [],
    media: {
      kind: 'sequence', durationSeconds: 8, fallback: { imageSrc: '/adventure/animatics/cs-02/cs-02-s1.jpg', transcriptKeys: cs02TranscriptKeys },
      segments: [{ kind: 'still', imageSrc: '/adventure/animatics/cs-02/cs-02-s1.jpg', durationSeconds: 8, motion: { kind: 'pan-right', distance: 0.04 }, altKey: 'cs02Scene' }],
    },
  },
  'cs-03': {
    slot: 'cs-03', cues: [],
    media: {
      kind: 'sequence', durationSeconds: 13, fallback: { imageSrc: '/adventure/animatics/cs-03/cs-03-s1.jpg', transcriptKeys: cs03TranscriptKeys },
      segments: [
        { kind: 'still', imageSrc: '/adventure/animatics/cs-03/cs-03-s1.jpg', durationSeconds: 7, motion: { kind: 'push-in', fromScale: 1, toScale: 1.06, focus: { x: 0.52, y: 0.54 } }, altKey: 'cs03Scene', overlays: [{ kind: 'caption', textKey: 'cs03Letter', startSeconds: 0, endSeconds: 7 }] },
        { kind: 'still', imageSrc: '/adventure/animatics/cs-03/cs-03-s2.jpg', durationSeconds: 6, motion: { kind: 'pan-left', distance: 0.04 }, altKey: 'cs03TimeJump', overlays: [{ kind: 'title', textKey: 'cs03TimeJump', startSeconds: 0, endSeconds: 6 }] },
        { kind: 'document', titleKey: 'cs03LedgerTitle', bodyKeys: ['cs03LedgerEntry', 'cs03LedgerPlain', 'cs03Transfer', 'cs03TransferPlain'] },
      ],
    },
  },
  'cs-04': staticEntry('cs-04', cs04TranscriptKeys),
  'cs-05': staticEntry('cs-05', cs05TranscriptKeys),
  'cs-06': staticEntry('cs-06', cs06TranscriptKeys),
  'cs-07': staticEntry('cs-07', cs07TranscriptKeys),
  'cs-08': staticEntry('cs-08', cs08TranscriptKeys),
  'cs-09': staticEntry('cs-09', cs09TranscriptKeys),
  'cs-10': staticEntry('cs-10', cs10TranscriptKeys),
  'cs-11': staticEntry('cs-11', cs11TranscriptKeys),
  'cs-12': staticEntry('cs-12', cs12TranscriptKeys),
  'cs-13': staticEntry('cs-13', cs13TranscriptKeys),
  'cs-14': staticEntry('cs-14', cs14TranscriptKeys),
};

export function getCutsceneStill(slot: AvailableCutsceneSlot, stillIndex: number): StillSegment | undefined {
  const media = cutsceneManifest[slot].media;
  if (media.kind !== 'sequence') return undefined;
  return media.segments.filter((segment): segment is StillSegment => segment.kind === 'still')[stillIndex];
}

export type PortraitAsset = {
  readonly characterId: CharacterId;
  readonly expression: PortraitExpression;
  readonly src: string;
  readonly width: 2752;
  readonly height: 1536;
  readonly objectPosition: 'center top';
};

const portrait = (characterId: CharacterId, expression: PortraitExpression, file: string): PortraitAsset => ({ characterId, expression, src: `/adventure/portraits/${file}.jpg`, width: 2752, height: 1536, objectPosition: 'center top' });

export const PORTRAIT_ASSETS = [
  portrait('cheng-heng', 'calm', 'cheng-heng-calm'),
  portrait('cheng-heng-act3', 'calm', 'cheng-heng-act3-calm'),
  portrait('cheng-heng-act3', 'resolute', 'cheng-heng-act3-resolute'),
  portrait('master-zhou', 'calm', 'zhou-calm'),
  portrait('master-zhou', 'hint1', 'zhou-hint1'),
  portrait('master-zhou', 'hint2', 'zhou-hint2'),
  portrait('master-zhou', 'pleased', 'zhou-pleased'),
  portrait('master-zhou', 'worried', 'zhou-worried'),
  portrait('chen-shouye', 'calm', 'chen-shouye-calm'),
  portrait('chen-shouye', 'pleased', 'chen-shouye-pleased'),
  portrait('chen-shouye', 'aggrieved', 'chen-shouye-aggrieved'),
  portrait('chen-congzheng', 'calm', 'chen-congzheng-calm'),
  portrait('chen-congzheng', 'pleased', 'chen-congzheng-pleased'),
  portrait('chen-congzheng', 'aggrieved', 'chen-congzheng-aggrieved'),
  portrait('chen-elder', 'calm', 'chen-elder-calm'),
] as const;

export function getPortraitAsset(characterId: CharacterId, expression: PortraitExpression): PortraitAsset | undefined {
  return PORTRAIT_ASSETS.find((asset) => asset.characterId === characterId && asset.expression === expression);
}

export type ScenePlateAsset = { readonly act: 1 | 2 | 3; readonly src: string; readonly width: 2752; readonly height: 1536 };
export const SCENE_PLATE_ASSETS: Readonly<Record<1 | 2 | 3, ScenePlateAsset>> = {
  1: { act: 1, src: '/adventure/plates/plate-act1.jpg', width: 2752, height: 1536 },
  2: { act: 2, src: '/adventure/plates/plate-act2.jpg', width: 2752, height: 1536 },
  3: { act: 3, src: '/adventure/plates/plate-act3.jpg', width: 2752, height: 1536 },
};

export function getScenePlateAsset(act: 1 | 2 | 3): ScenePlateAsset {
  return SCENE_PLATE_ASSETS[act];
}
