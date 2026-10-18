import {
  ACT_ONE_DEFINITION,
  ACT_TWO_DEFINITION,
  ACT_THREE_DEFINITION,
  type ActOneClueId,
  type ActTwoClueId,
  type ActThreeClueId,
} from './campaign-definition';
import {
  analyzeActOneAllocation,
  analyzeActTwoAllocation,
  evaluateActOneMasterChallenge,
  evaluateActTwoMasterChallenge,
  evaluateActThreeMasterChallenge,
  gradeActOne,
  gradeActTwo,
  analyzeActThreeAllocation,
  gradeActThree,
  buildEpilogueSummary,
} from './campaign-rules';
import { selectActThreePostChallengeCutscene } from './act-three-facts';
import { evaluateNationalEnding } from './ending-rules';
import { normalizeCampaignWritAllocation, toCampaignWritAllocation } from './allocation-adapter';
import type {
  ActOneRecord,
  ActTwoRecord,
  ActThreeRecord,
  CampaignAllocation,
  CampaignChallenge,
  CampaignMetrics,
  CampaignRecord,
  CampaignState,
  CampaignVerdict,
  ReplayReturnTarget,
  CampaignAct,
  CampaignEndingState,
} from './types';

const parsedCampaignStateBrand: unique symbol = Symbol('parsedCampaignState');
export type ParsedCampaignState = CampaignState & { readonly [parsedCampaignStateBrand]: true };

export type CampaignAction =
  | { type: 'RESTORE_PARSED'; state: ParsedCampaignState }
  | { type: 'COMPLETE_CUTSCENE' }
  | { type: 'BEGIN_FROM_TITLE' }
  | { type: 'COMPLETE_INTRO' }
  | { type: 'BEGIN_ACT_TWO' }
  | { type: 'BEGIN_ACT_THREE' }
  | { type: 'DISCOVER_CLUE'; clueId: ActOneClueId | ActTwoClueId | ActThreeClueId }
  | { type: 'START_ALLOCATION' }
  | { type: 'RETURN_TO_INVESTIGATION' }
  | { type: 'SET_DRAFT_ALLOCATION'; allocation: CampaignAllocation }
  | { type: 'LOCK_INITIAL_VERDICT' }
  | { type: 'SUBMIT_INTUITION_RATING'; rating: number }
  | { type: 'COMPLETE_DEBRIEF' }
  | { type: 'CHOOSE_REVISION'; revise: boolean }
  | { type: 'SET_REVISION_ALLOCATION'; allocation: CampaignAllocation }
  | { type: 'LOCK_FINAL_VERDICT' }
  | { type: 'ENTER_CHALLENGE' }
  | { type: 'SET_CHALLENGE_ALLOCATION'; allocation: CampaignAllocation }
  | { type: 'VIEW_CHALLENGE_HINT'; stage: 1 | 2 | 3 }
  | { type: 'SUBMIT_CHALLENGE' }
  | { type: 'LEAVE_CHALLENGE' }
  | { type: 'SKIP_CHALLENGE' }
  | { type: 'OPEN_LEDGER' }
  | { type: 'CONTINUE_ACT' }
  | { type: 'COMPLETE_ENDING' }
  | { type: 'START_REPLAY'; act: 1 | 2 | 3 }
  | { type: 'SET_REPLAY_ALLOCATION'; allocation: CampaignAllocation }
  | { type: 'SUBMIT_REPLAY' }
  | { type: 'CANCEL_REPLAY' }
  | { type: 'CONFIRM_REPLAY_OVERWRITE' }
  | { type: 'RESTART_CAMPAIGN' };

function cloneAllocation(allocation: CampaignAllocation): CampaignAllocation {
  return allocation.map((row) => ({
    goodId: row.goodId,
    shares: row.shares ? [...row.shares] : [],
    ...(row.owner === undefined ? {} : { owner: row.owner }),
    ...(row.writId === undefined ? {} : { writId: row.writId }),
  }));
}

function initialAllocation(): CampaignAllocation {
  return ACT_ONE_DEFINITION.demonstrations.halfSplit.map(({ goodId, shares }) => ({ goodId, shares: [...shares] }));
}

function initialActTwoAllocation(): CampaignAllocation {
  return ACT_TWO_DEFINITION.demonstrations.eachTakesTheirFavourite.map((row) => ({
    goodId: row.goodId,
    shares: 'shares' in row ? [...row.shares] : [],
    ...('owner' in row ? { owner: row.owner } : {}),
  }));
}

function initialActThreeAllocation(): CampaignAllocation {
  return toCampaignWritAllocation(ACT_THREE_DEFINITION.demonstrations.rankOrderRoundRobin);
}

function metricsFromAnalysis(analysis: ReturnType<typeof analyzeActOneAllocation>): CampaignMetrics {
  return {
    utilities: analysis.utilities.map(Number),
    nsw: analysis.nsw.toString(),
    proportionality: analysis.proportionality,
    ef: analysis.ef,
    ef1: analysis.ef1,
    efx: analysis.efx,
    envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })),
  };
}

function verdictFromAllocation(act: CampaignAct, allocation: CampaignAllocation, discoveredClueIds: readonly string[] = []): CampaignVerdict | null {
  try {
    const analysis = act === 1 ? analyzeActOneAllocation(allocation) : act === 2 ? analyzeActTwoAllocation(allocation) : analyzeActThreeAllocation(allocation);
    const missingClueIds = act === 2
      ? ACT_TWO_DEFINITION.clues.filter(({ required, id }) => !required && !discoveredClueIds.includes(id)).map(({ id }) => id)
      : act === 3
        ? ACT_THREE_DEFINITION.clues.filter(({ required, id }) => !required && !discoveredClueIds.includes(id)).map(({ id }) => id)
        : [];
    return {
      allocation: cloneAllocation(allocation),
      metrics: metricsFromAnalysis(analysis),
      ...(missingClueIds.length ? { missingClueIds } : {}),
    };
  } catch {
    return null;
  }
}

function initialChallenge(): CampaignChallenge {
  return {
    status: 'not-started', allocation: null, hintStage: 0, sealEligible: true,
    reachedFrontier: false, masterSeal: false, checked: false, returnTo: 'ledger',
  };
}

export function initialCampaignState(): CampaignState {
  return {
    act: 1,
    phase: 'cutscene',
    cutscene: { slotId: 'cs-00', returnTo: 'title' },
    discoveredClueIds: [],
    draftAllocation: initialAllocation(),
    initialVerdict: null,
    intuitionRating: null,
    revisionAllocation: null,
    revisionUsed: false,
    finalVerdict: null,
    recordHistory: [],
    actRecord: null,
    challenge: initialChallenge(),
    replay: null,
    ending: null,
    dependentResults: { ledger: 'current', ending: 'current' },
  };
}

function requiredClues(act: CampaignAct) {
  return (act === 1 ? ACT_ONE_DEFINITION.clues : act === 2 ? ACT_TWO_DEFINITION.clues : ACT_THREE_DEFINITION.clues)
    .filter(({ required }) => required).map(({ id }) => id);
}
function hasRequiredClues(state: CampaignState) {
  return requiredClues(state.act).every((id) => state.discoveredClueIds.includes(id));
}
function challengeForAct(state: CampaignState): CampaignChallenge {
  if (state.challenge.status === 'completed') return state.challenge;
  return {
    ...state.challenge,
    status: 'in-progress',
    allocation: cloneAllocation(state.challenge.allocation
      ?? (state.act === 1 ? ACT_ONE_DEFINITION.demonstrations.cutAndChooseDivision : state.act === 2 ? ACT_TWO_DEFINITION.demonstrations.compensation : initialActThreeAllocation()) as unknown as CampaignAllocation),
    returnTo: 'ledger',
  };
}
function replaceChallenge(state: CampaignState, challenge: CampaignChallenge): CampaignState {
  return { ...state, challenge, actRecord: state.actRecord ? { ...state.actRecord, challenge } : null };
}

function createRecord(state: CampaignState, finalVerdict: CampaignVerdict, revisionUsed: boolean): CampaignRecord | null {
  if (!state.initialVerdict || (state.act !== 1 && !state.intuitionRating)) return null;
  const grade = state.act === 1
    ? gradeActOne({ utilities: finalVerdict.metrics.utilities.map(BigInt) })
    : state.act === 2
      ? gradeActTwo({ proportionality: finalVerdict.metrics.proportionality, ef: finalVerdict.metrics.ef })
      : gradeActThree({ ef1: finalVerdict.metrics.ef1, efx: finalVerdict.metrics.efx, nsw: BigInt(finalVerdict.metrics.nsw) });
  return {
    act: state.act,
    initialVerdict: state.initialVerdict,
    intuitionRating: state.intuitionRating,
    revisionUsed,
    finalVerdict,
    grade,
    challenge: state.challenge,
  } as ActOneRecord | ActTwoRecord;
}
function finishFinalVerdict(state: CampaignState, allocation: CampaignAllocation, revisionUsed: boolean): CampaignState {
  const finalVerdict = verdictFromAllocation(state.act, allocation, state.discoveredClueIds);
  if (!finalVerdict) return state;
  const actRecord = createRecord(state, finalVerdict, revisionUsed);
  if (!actRecord) return state;
  return { ...state, phase: 'final-verdict', finalVerdict, revisionUsed, actRecord };
}
function allocationsEqual(left: CampaignAllocation | null, right: CampaignAllocation) {
  return left !== null && JSON.stringify(left) === JSON.stringify(right);
}
function analysisFor(act: CampaignAct, allocation: CampaignAllocation) {
  return act === 1 ? analyzeActOneAllocation(allocation) : act === 2 ? analyzeActTwoAllocation(allocation) : analyzeActThreeAllocation(allocation);
}

function replayRecord(state: CampaignState, finalVerdict: CampaignVerdict): CampaignRecord | null {
  if (!state.actRecord) return null;
  return {
    ...state.actRecord,
    finalVerdict,
    grade: state.act === 1
      ? gradeActOne({ utilities: finalVerdict.metrics.utilities.map(BigInt) })
      : state.act === 2
        ? gradeActTwo(finalVerdict.metrics)
        : gradeActThree({ ef1: finalVerdict.metrics.ef1, efx: finalVerdict.metrics.efx, nsw: BigInt(finalVerdict.metrics.nsw) }),
  } as CampaignRecord;
}

export function campaignReducer(state: CampaignState, action: CampaignAction): CampaignState {
  switch (action.type) {
    case 'RESTORE_PARSED': {
      if (action.state.act === 1 && action.state.phase === 'intuition-rating') {
        return { ...action.state, phase: 'debrief', intuitionRating: null };
      }
      return action.state;
    }
    case 'COMPLETE_CUTSCENE': {
      if (state.phase !== 'cutscene' || !state.cutscene) return state;
      const slot = state.cutscene.slotId;
      if (state.ending && state.cutscene.returnTo === 'ending') {
        if (slot !== 'cs-14' && state.ending.hiddenEnding) {
          return {
            ...state,
            phase: 'cutscene',
            cutscene: { slotId: 'cs-14', returnTo: 'ending' },
            ending: { ...state.ending, nationalCutsceneWatched: true },
          };
        }
        return {
          ...state,
          phase: 'ending',
          cutscene: null,
          ending: {
            ...state.ending,
            nationalCutsceneWatched: state.ending.nationalCutsceneWatched || slot !== 'cs-14',
            hiddenCutsceneWatched: state.ending.hiddenCutsceneWatched || slot === 'cs-14',
          },
        };
      }
      return {
        ...state,
        act: slot === 'cs-03' ? 2 : slot === 'cs-06' ? 3 : state.act,
        phase: state.cutscene.returnTo,
        cutscene: null,
      };
    }
    case 'BEGIN_FROM_TITLE':
      return state.phase === 'title' ? { ...state, phase: 'intro', cutscene: null } : state;
    case 'BEGIN_ACT_TWO':
      if (state.phase !== 'act-two-transition' || !state.actRecord || state.act !== 2) return state;
      return {
        ...state,
        phase: 'cutscene',
        cutscene: { slotId: 'cs-04', returnTo: 'intro' },
        discoveredClueIds: [], draftAllocation: initialActTwoAllocation(), initialVerdict: null,
        intuitionRating: null, revisionAllocation: null, revisionUsed: false,
        finalVerdict: null,
        recordHistory: [...state.recordHistory, state.actRecord],
        actRecord: null, challenge: initialChallenge(), replay: null, ending: null,
      };
    case 'BEGIN_ACT_THREE':
      if (state.phase !== 'act-three-transition' || !state.actRecord || state.act !== 3) return state;
      return {
        ...state,
        phase: 'cutscene', cutscene: { slotId: 'cs-07', returnTo: 'intro' },
        discoveredClueIds: [], draftAllocation: initialActThreeAllocation(), initialVerdict: null,
        intuitionRating: null, revisionAllocation: null, revisionUsed: false, finalVerdict: null,
        recordHistory: [...state.recordHistory, state.actRecord], actRecord: null, challenge: initialChallenge(), replay: null, ending: null,
      };
    case 'COMPLETE_INTRO': return state.phase === 'intro' ? { ...state, phase: 'investigation' } : state;
    case 'DISCOVER_CLUE': {
      if (state.phase !== 'investigation' || state.discoveredClueIds.includes(action.clueId)) return state;
      const valid = state.act === 1
        ? ACT_ONE_DEFINITION.clues.some(({ id }) => id === action.clueId)
        : state.act === 2
          ? ACT_TWO_DEFINITION.clues.some(({ id }) => id === action.clueId)
          : ACT_THREE_DEFINITION.clues.some(({ id }) => id === action.clueId);
      return valid ? { ...state, discoveredClueIds: [...state.discoveredClueIds, action.clueId] } : state;
    }
    case 'START_ALLOCATION': return state.phase === 'investigation' ? { ...state, phase: 'allocation' } : state;
    case 'RETURN_TO_INVESTIGATION': return state.phase === 'allocation' && !state.initialVerdict ? { ...state, phase: 'investigation' } : state;
    case 'SET_DRAFT_ALLOCATION': {
      if ((state.phase !== 'investigation' && state.phase !== 'allocation') || !verdictFromAllocation(state.act, state.act === 3 ? normalizeCampaignWritAllocation(action.allocation) : action.allocation, state.discoveredClueIds)) return state;
      return { ...state, draftAllocation: cloneAllocation(state.act === 3 ? normalizeCampaignWritAllocation(action.allocation) : action.allocation) };
    }
    case 'LOCK_INITIAL_VERDICT': {
      if ((state.phase !== 'investigation' && state.phase !== 'allocation') || !hasRequiredClues(state)) return state;
      const initialVerdict = verdictFromAllocation(state.act, state.draftAllocation, state.discoveredClueIds);
      return initialVerdict ? {
        ...state,
        phase: state.act === 1 ? 'debrief' : 'intuition-rating',
        initialVerdict,
        intuitionRating: state.act === 1 ? null : state.intuitionRating,
      } : state;
    }
    case 'SUBMIT_INTUITION_RATING':
      if (state.phase !== 'intuition-rating' || !Number.isInteger(action.rating) || action.rating < 1 || action.rating > 5) return state;
      return { ...state, phase: 'debrief', intuitionRating: action.rating as 1 | 2 | 3 | 4 | 5 };
    case 'COMPLETE_DEBRIEF': return state.phase === 'debrief' ? { ...state, phase: 'revision-decision' } : state;
    case 'CHOOSE_REVISION':
      if ((state.phase !== 'revision-decision' && !(state.act === 1 && state.phase === 'debrief')) || !state.initialVerdict) return state;
      if (!action.revise) return finishFinalVerdict(state, state.initialVerdict.allocation, false);
      if (state.revisionUsed) return state;
      return { ...state, phase: 'revision', revisionUsed: true, revisionAllocation: cloneAllocation(state.initialVerdict.allocation) };
    case 'SET_REVISION_ALLOCATION': {
      const allocation = state.act === 3 ? normalizeCampaignWritAllocation(action.allocation) : action.allocation;
      if (state.phase !== 'revision' || !verdictFromAllocation(state.act, allocation, state.discoveredClueIds)) return state;
      return { ...state, revisionAllocation: cloneAllocation(allocation) };
    }
    case 'LOCK_FINAL_VERDICT':
      return state.phase === 'revision' && state.revisionUsed && state.revisionAllocation
        ? finishFinalVerdict(state, state.revisionAllocation, true) : state;
    case 'ENTER_CHALLENGE': {
      if ((state.phase !== 'final-verdict' && state.phase !== 'ledger') || !state.actRecord) return state;
      const challenge = challengeForAct(state);
      const next = state.challenge.status === 'completed' ? state : replaceChallenge(state, challenge);
      if (state.act === 1) return { ...next, phase: 'challenge', cutscene: null };
      return { ...next, phase: 'cutscene', cutscene: { slotId: state.act === 2 ? 'cs-05' : 'cs-08', returnTo: 'challenge' } };
    }
    case 'SET_CHALLENGE_ALLOCATION': {
      const allocation = state.act === 3 ? normalizeCampaignWritAllocation(action.allocation) : action.allocation;
      if (state.phase !== 'challenge' || !verdictFromAllocation(state.act, allocation, state.discoveredClueIds)) return state;
      if (allocationsEqual(state.challenge.allocation, allocation)) return state;
      return replaceChallenge(state, { ...state.challenge, status: 'in-progress', allocation: cloneAllocation(allocation), checked: false, reachedFrontier: false, masterSeal: false });
    }
    case 'VIEW_CHALLENGE_HINT':
      if (state.phase !== 'challenge' || action.stage <= state.challenge.hintStage) return state;
      return replaceChallenge(state, { ...state.challenge, hintStage: action.stage, sealEligible: action.stage === 3 ? false : state.challenge.sealEligible, masterSeal: action.stage === 3 ? false : state.challenge.masterSeal });
    case 'SUBMIT_CHALLENGE': {
      if (state.phase !== 'challenge' || !state.challenge.allocation) return state;
      const verdict = verdictFromAllocation(state.act, state.challenge.allocation, state.discoveredClueIds);
      if (!verdict) return state;
      const analysis = analysisFor(state.act, state.challenge.allocation);
      const result = state.act === 1
        ? evaluateActOneMasterChallenge(analysis, state.challenge.sealEligible)
        : state.act === 2
          ? evaluateActTwoMasterChallenge(analysis, state.challenge.sealEligible)
          : evaluateActThreeMasterChallenge({ efx: analysis.efx, nsw: BigInt(analysis.nsw) }, state.challenge.sealEligible);
      return replaceChallenge(state, { ...state.challenge, status: result.completed ? 'completed' : 'in-progress', checked: true, reachedFrontier: result.reachedFrontier, masterSeal: result.masterSeal });
    }
    case 'LEAVE_CHALLENGE': return state.phase === 'challenge' && state.actRecord ? { ...state, phase: state.challenge.returnTo } : state;
    case 'SKIP_CHALLENGE': {
      if ((state.phase !== 'final-verdict' && state.phase !== 'challenge') || !state.actRecord) return state;
      const next = replaceChallenge(state, state.challenge.status === 'completed' ? state.challenge : { ...state.challenge, status: 'skipped' });
      return { ...next, phase: 'ledger', cutscene: null };
    }
    case 'OPEN_LEDGER': return state.phase === 'final-verdict' && state.actRecord ? { ...state, phase: 'ledger' } : state;
    case 'CONTINUE_ACT':
      if (state.phase !== 'ledger' || !state.actRecord) return state;
      if (state.act === 3) {
        if (!state.finalVerdict) return state;
        const resolution = evaluateNationalEnding(state.finalVerdict);
        const hiddenEnding = [...state.recordHistory, state.actRecord].length === 3
          && [...state.recordHistory, state.actRecord].every((record) => record.challenge.masterSeal);
        const slotId = selectActThreePostChallengeCutscene(analyzeActThreeAllocation(state.finalVerdict.allocation));
        if (!slotId) return state;
        const completedRecords = [...state.recordHistory, state.actRecord];
        const ending: CampaignEndingState = {
          resolution,
          hiddenEnding,
          summary: buildEpilogueSummary(completedRecords, hiddenEnding),
          nationalCutsceneWatched: false,
          hiddenCutsceneWatched: false,
        };
        return { ...state, phase: 'cutscene', cutscene: { slotId, returnTo: 'ending' }, ending };
      }
      return { ...state, phase: 'cutscene', cutscene: { slotId: state.act === 1 ? 'cs-03' : 'cs-06', returnTo: state.act === 1 ? 'act-two-transition' : 'act-three-transition' } };
    case 'COMPLETE_ENDING':
      return state.phase === 'ending' && state.ending ? { ...state, phase: 'completed' } : state;
    case 'START_REPLAY': {
      const boundaryAct = state.phase === 'act-two-transition' ? 1 : state.phase === 'act-three-transition' ? 2 : state.act;
      if ((state.phase !== 'ledger' && state.phase !== 'act-two-transition' && state.phase !== 'act-three-transition') || action.act !== boundaryAct || !state.actRecord) return state;
      return { ...state, phase: 'replay', replay: { selectedAct: action.act, returnTo: state.phase as ReplayReturnTarget, draftAllocation: cloneAllocation(state.actRecord.finalVerdict.allocation), sandboxRecord: null } };
    }
    case 'SET_REPLAY_ALLOCATION': {
      if (state.phase !== 'replay' || !state.replay) return state;
      const allocation = state.replay.selectedAct === 3 ? normalizeCampaignWritAllocation(action.allocation) : action.allocation;
      if (!verdictFromAllocation(state.replay.selectedAct, allocation, state.discoveredClueIds)) return state;
      return { ...state, replay: { ...state.replay, draftAllocation: cloneAllocation(allocation), sandboxRecord: null } };
    }
    case 'SUBMIT_REPLAY': {
      if (state.phase !== 'replay' || !state.replay) return state;
      const verdict = verdictFromAllocation(state.replay.selectedAct, state.replay.draftAllocation, state.discoveredClueIds);
      const sandboxRecord = verdict ? replayRecord(state, verdict) : null;
      return sandboxRecord ? { ...state, replay: { ...state.replay, sandboxRecord } } : state;
    }
    case 'CANCEL_REPLAY': return state.phase === 'replay' && state.replay ? { ...state, phase: state.replay.returnTo, replay: null } : state;
    case 'CONFIRM_REPLAY_OVERWRITE':
      if (state.phase !== 'replay' || !state.replay?.sandboxRecord) return state;
      return { ...state, phase: state.replay.returnTo, actRecord: state.replay.sandboxRecord, finalVerdict: state.replay.sandboxRecord.finalVerdict, challenge: state.replay.sandboxRecord.challenge, replay: null, dependentResults: { ledger: 'current', ending: 'current' } };
    case 'RESTART_CAMPAIGN': return initialCampaignState();
  }
}
