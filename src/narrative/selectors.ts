import { ACT_ONE_DEFINITION, ACT_TWO_DEFINITION, ACT_THREE_DEFINITION } from './campaign-definition';
import { analyzeActOneAllocation, analyzeActTwoAllocation, analyzeActThreeAllocation, gradeActOne, gradeActTwo, gradeActThree } from './campaign-rules';
import type { CampaignMetrics, CampaignPhase, CampaignState } from './types';

export type VisibleCampaignMetrics = {
  readonly utilities?: readonly number[];
  readonly proportionality?: boolean;
  readonly ef?: boolean;
  readonly grade?: '不稱職' | '平常' | '稱職';
  readonly reachedFrontier?: boolean;
  readonly harmonyScore?: string;
  readonly ef1?: boolean;
  readonly efx?: boolean;
  readonly envyPairs?: readonly { readonly i: number; readonly j: number; readonly gap: number }[];
};

export type CampaignCtaId =
  | 'skip-cutscene'
  | 'begin-campaign'
  | 'continue-intro'
  | 'start-allocation'
  | 'lock-initial-verdict'
  | 'submit-intuition-rating'
  | 'continue-debrief'
  | 'choose-revision'
  | 'lock-final-verdict'
  | 'open-ledger'
  | 'submit-challenge'
  | 'return-to-ledger'
  | 'continue-to-act-two'
  | 'submit-replay'
  | 'continue-act-two'
  | 'complete-ending';

export type CampaignTaskId =
  | 'watch-cutscene'
  | 'open-case'
  | 'hear-introduction'
  | 'find-required-clues'
  | 'prepare-initial-verdict'
  | 'rate-initial-verdict'
  | 'review-debrief'
  | 'decide-revision'
  | 'prepare-revision'
  | 'review-final-verdict'
  | 'solve-master-challenge'
  | 'review-ledger'
  | 'review-replay-sandbox'
  | 'begin-act-two'
  | 'review-ending';

const SEALED_PHASES: readonly CampaignPhase[] = [
  'cutscene',
  'title',
  'intro',
  'investigation',
  'allocation',
  'intuition-rating',
  'act-two-transition',
];

function visibleVerdictMetrics(
  metrics: CampaignMetrics,
  grade?: '不稱職' | '平常' | '稱職',
): VisibleCampaignMetrics {
  return {
    utilities: [...metrics.utilities],
    proportionality: metrics.proportionality,
    ef: metrics.ef,
    ...(grade ? { grade } : {}),
  };
}

function analyzeVisibleAllocation(state: CampaignState): VisibleCampaignMetrics {
  const allocation = state.phase === 'revision'
    ? state.revisionAllocation
    : state.phase === 'challenge'
      ? state.challenge.allocation
      : state.replay?.draftAllocation;
  if (!allocation) return {};

  const analysis = state.act === 1 ? analyzeActOneAllocation(allocation) : state.act === 2 ? analyzeActTwoAllocation(allocation) : analyzeActThreeAllocation(allocation);
  const base = visibleVerdictMetrics({
    utilities: analysis.utilities.map(Number),
    nsw: analysis.nsw.toString(),
    proportionality: analysis.proportionality,
    ef: analysis.ef,
    ef1: analysis.ef1,
    efx: analysis.efx,
  });

  if (state.phase === 'revision' && state.act === 2) {
    return { ...base, harmonyScore: analysis.nsw.toString(), envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })) };
  }
  if (state.phase === 'revision' && state.act === 3) {
    return { ...base, ef1: analysis.ef1, efx: analysis.efx, envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })) };
  }
  if (state.phase === 'challenge') {
    return { ...base, reachedFrontier: state.challenge.reachedFrontier, ...(state.act === 2 ? { harmonyScore: analysis.nsw.toString() } : {}) };
  }
  if (state.phase === 'replay') {
    return { ...base, grade: state.act === 1 ? gradeActOne(analysis) : gradeActTwo(analysis) };
  }
  return base;
}

/** The sole campaign disclosure boundary for formal metrics. */
export function selectVisibleMetrics(state: CampaignState): VisibleCampaignMetrics {
  if ((state.intuitionRating === null && state.act !== 1) || SEALED_PHASES.includes(state.phase)) return {};

  if (state.phase === 'debrief' || state.phase === 'revision-decision') {
    return state.initialVerdict ? visibleVerdictMetrics(state.initialVerdict.metrics) : {};
  }
  if (state.phase === 'revision' || state.phase === 'challenge' || state.phase === 'replay') {
    return analyzeVisibleAllocation(state);
  }
  if (state.phase === 'final-verdict' || state.phase === 'ledger') {
    return state.finalVerdict
      ? { ...visibleVerdictMetrics(state.finalVerdict.metrics, state.actRecord?.grade), ...(state.act === 3 ? { ef1: state.finalVerdict.metrics.ef1, efx: state.finalVerdict.metrics.efx } : {}) }
      : {};
  }
  return {};
}

export function selectRequiredClueProgress(state: CampaignState) {
  const definition = state.act === 1 ? ACT_ONE_DEFINITION : state.act === 2 ? ACT_TWO_DEFINITION : ACT_THREE_DEFINITION;
  const total = definition.clues.filter(({ required }) => required).length;
  const found = definition.clues.filter(({ id, required }) => required && state.discoveredClueIds.includes(id)).length;
  return { found, total, complete: found === total };
}

export function selectCanStartAllocation(state: CampaignState) {
  return state.phase === 'investigation' && selectRequiredClueProgress(state).complete;
}

export function selectPrimaryCta(state: CampaignState): CampaignCtaId {
  switch (state.phase) {
    case 'cutscene': return 'skip-cutscene';
    case 'title': return 'begin-campaign';
    case 'intro': return 'continue-intro';
    case 'investigation': return 'start-allocation';
    case 'allocation': return 'lock-initial-verdict';
    case 'intuition-rating': return 'submit-intuition-rating';
    case 'debrief': return 'continue-debrief';
    case 'revision-decision': return 'choose-revision';
    case 'revision': return 'lock-final-verdict';
    case 'final-verdict': return 'open-ledger';
    case 'challenge':
      return state.challenge.status === 'completed' ? 'return-to-ledger' : 'submit-challenge';
    case 'ledger': return 'continue-to-act-two';
    case 'replay': return 'submit-replay';
    case 'act-two-transition': return 'continue-act-two';
    case 'act-three-transition': return 'continue-act-two';
    case 'ending': return 'complete-ending';
    case 'completed': return 'complete-ending';
  }
}

export function selectCurrentTask(state: CampaignState): CampaignTaskId {
  switch (state.phase) {
    case 'cutscene': return 'watch-cutscene';
    case 'title': return 'open-case';
    case 'intro': return 'hear-introduction';
    case 'investigation': return 'find-required-clues';
    case 'allocation': return 'prepare-initial-verdict';
    case 'intuition-rating': return 'rate-initial-verdict';
    case 'debrief': return 'review-debrief';
    case 'revision-decision': return 'decide-revision';
    case 'revision': return 'prepare-revision';
    case 'final-verdict': return 'review-final-verdict';
    case 'challenge': return 'solve-master-challenge';
    case 'ledger': return 'review-ledger';
    case 'replay': return 'review-replay-sandbox';
    case 'act-two-transition': return 'begin-act-two';
    case 'act-three-transition': return 'begin-act-two';
    case 'ending': return 'review-ending';
    case 'completed': return 'review-ending';
  }
}

export type CampaignViewModel = {
  readonly phase: CampaignPhase;
  readonly cta: CampaignCtaId;
  readonly task: CampaignTaskId;
  readonly metrics: VisibleCampaignMetrics;
};

export function selectCampaignViewModel(state: CampaignState): CampaignViewModel {
  return {
    phase: state.phase,
    cta: selectPrimaryCta(state),
    task: selectCurrentTask(state),
    metrics: selectVisibleMetrics(state),
  };
}
