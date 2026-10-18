export type CampaignAct = 1 | 2 | 3;

export type CampaignPhase =
  | 'cutscene'
  | 'title'
  | 'intro'
  | 'investigation'
  | 'allocation'
  | 'intuition-rating'
  | 'debrief'
  | 'revision-decision'
  | 'revision'
  | 'final-verdict'
  | 'challenge'
  | 'ledger'
  | 'replay'
  | 'act-two-transition'
  | 'act-three-transition'
  | 'ending'
  | 'completed';

export type CampaignCutsceneSlot =
  | 'cs-00' | 'cs-01' | 'cs-02' | 'cs-03' | 'cs-04' | 'cs-05' | 'cs-06'
  | 'cs-07' | 'cs-08' | 'cs-09' | 'cs-10' | 'cs-11' | 'cs-12' | 'cs-13' | 'cs-14';

import type { NationalEndingResolution } from './ending-rules';

export type CampaignEndingState = {
  readonly resolution: NationalEndingResolution;
  readonly hiddenEnding: boolean;
  readonly summary: CampaignEpilogueSummary;
  readonly nationalCutsceneWatched: boolean;
  readonly hiddenCutsceneWatched: boolean;
};

export type EpilogueVignetteOutcome = 'competent-or-better' | 'ordinary-or-below';
export type EpilogueSeal = '國之權衡' | '持平良吏' | '循例之官';

export type CampaignEpilogueSummary = {
  readonly grades: readonly [ActOneRecord['grade'], ActTwoRecord['grade'], ActThreeRecord['grade']];
  readonly initialRatings: readonly [ActOneRecord['intuitionRating'], ActTwoRecord['intuitionRating'], ActThreeRecord['intuitionRating']];
  readonly masterSeals: readonly [boolean, boolean, boolean];
  readonly yiwuVignette: EpilogueVignetteOutcome;
  readonly hangzhouVignette: EpilogueVignetteOutcome;
  readonly overallSeal: EpilogueSeal;
  readonly hiddenEnding: boolean;
};

export type CutsceneReturnTarget = Exclude<CampaignPhase, 'cutscene'>;

export type CampaignCutscene = {
  readonly slotId: CampaignCutsceneSlot;
  readonly returnTo: CutsceneReturnTarget;
};

export type CampaignAllocationRow = {
  /** Shares are tenths for divisible goods; mixed goods use an owner field. */
  readonly goodId: string;
  readonly shares: readonly number[];
  readonly owner?: number;
  /** Present on Third Act rows so persisted Writ allocations remain source-discoverable. */
  readonly writId?: string;
};

export type CampaignWritAllocation = readonly {
  readonly writId: string;
  readonly owner: number;
}[];

export type CampaignAllocation = readonly CampaignAllocationRow[];

/** JSON-safe subset of domain analysis. BigInts are converted at the reducer boundary. */
export type CampaignMetrics = {
  readonly utilities: readonly number[];
  readonly nsw: string;
  readonly proportionality: boolean;
  readonly ef: boolean;
  readonly ef1: boolean;
  readonly efx: boolean;
  readonly envyPairs?: readonly { readonly i: number; readonly j: number; readonly gap: number }[];
};

export type CampaignVerdict = {
  readonly allocation: CampaignAllocation;
  readonly metrics: CampaignMetrics;
  /** Facts not heard before the Initial Verdict, revealed by the Debrief. */
  readonly missingClueIds?: readonly string[];
};

export type CampaignChallenge = {
  readonly status: 'not-started' | 'in-progress' | 'skipped' | 'completed';
  readonly allocation: CampaignAllocation | null;
  readonly hintStage: 0 | 1 | 2 | 3;
  readonly sealEligible: boolean;
  readonly reachedFrontier: boolean;
  readonly masterSeal: boolean;
  /** True only after the player explicitly checks this allocation. */
  readonly checked: boolean;
  readonly returnTo: 'ledger';
};

export type ActOneRecord = {
  readonly act: 1;
  readonly initialVerdict: CampaignVerdict;
  readonly intuitionRating: 1 | 2 | 3 | 4 | 5 | null;
  readonly revisionUsed: boolean;
  readonly finalVerdict: CampaignVerdict;
  readonly grade: '不稱職' | '平常' | '稱職';
  readonly challenge: CampaignChallenge;
};

export type ActTwoRecord = {
  readonly act: 2;
  readonly initialVerdict: CampaignVerdict;
  readonly intuitionRating: 1 | 2 | 3 | 4 | 5;
  readonly revisionUsed: boolean;
  readonly finalVerdict: CampaignVerdict;
  readonly grade: '不稱職' | '平常' | '稱職';
  readonly challenge: CampaignChallenge;
};

export type ActThreeRecord = {
  readonly act: 3;
  readonly initialVerdict: CampaignVerdict;
  readonly intuitionRating: 1 | 2 | 3 | 4 | 5;
  readonly revisionUsed: boolean;
  readonly finalVerdict: CampaignVerdict;
  readonly grade: '不稱職' | '平常' | '稱職';
  readonly challenge: CampaignChallenge;
};

export type CampaignRecord = ActOneRecord | ActTwoRecord | ActThreeRecord;

export type ReplayReturnTarget = 'ledger' | 'act-two-transition' | 'act-three-transition';

export type ReplaySandbox = {
  readonly selectedAct: CampaignAct;
  readonly returnTo: ReplayReturnTarget;
  readonly draftAllocation: CampaignAllocation;
  readonly sandboxRecord: CampaignRecord | null;
};

export type CampaignState = {
  readonly act: CampaignAct;
  readonly phase: CampaignPhase;
  readonly cutscene: CampaignCutscene | null;
  readonly discoveredClueIds: readonly string[];
  readonly draftAllocation: CampaignAllocation;
  readonly initialVerdict: CampaignVerdict | null;
  readonly intuitionRating: 1 | 2 | 3 | 4 | 5 | null;
  readonly revisionAllocation: CampaignAllocation | null;
  readonly revisionUsed: boolean;
  readonly finalVerdict: CampaignVerdict | null;
  /** Completed records from earlier acts; kept separately from the active-act ledger record. */
  readonly recordHistory: readonly CampaignRecord[];
  readonly actRecord: CampaignRecord | null;
  readonly challenge: CampaignChallenge;
  readonly replay: ReplaySandbox | null;
  readonly ending: CampaignEndingState | null;
  readonly dependentResults: {
    readonly ledger: 'current';
    readonly ending: 'current';
  };
};
