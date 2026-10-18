import { describe, expect, test } from 'vitest';
import { ACT_ONE_DEFINITION, type ActOneClueId } from '../src/narrative/campaign-definition';
import {
  campaignReducer,
  initialCampaignState,
  type CampaignAction,
} from '../src/narrative/state-machine';
import { createCampaignSave, decodeCampaignSave, encodeCampaignSave } from '../src/narrative/persistence';
import {
  selectCampaignViewModel,
  selectCurrentTask,
  selectPrimaryCta,
  selectVisibleMetrics,
} from '../src/narrative/selectors';
import type { CampaignAllocation, CampaignPhase, CampaignState } from '../src/narrative/types';

const halfSplit: CampaignAllocation = ACT_ONE_DEFINITION.demonstrations.halfSplit;
const inverted: CampaignAllocation = ACT_ONE_DEFINITION.demonstrations.inverted;
const frontier: CampaignAllocation = ACT_ONE_DEFINITION.demonstrations.frontier;
const belowFrontier: CampaignAllocation = ACT_ONE_DEFINITION.demonstrations.cutAndChooseDivision;

function dispatch(state: CampaignState, action: CampaignAction) {
  const before = JSON.stringify(state);
  const next = campaignReducer(state, action);
  expect(JSON.stringify(state)).toBe(before);
  return next;
}

function reachInvestigation() {
  let state = initialCampaignState();
  state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
  state = dispatch(state, { type: 'BEGIN_FROM_TITLE' });
  state = dispatch(state, { type: 'COMPLETE_INTRO' });
  return state;
}

function discoverAll(state: CampaignState) {
  for (const { id } of ACT_ONE_DEFINITION.clues) {
    state = dispatch(state, { type: 'DISCOVER_CLUE', clueId: id });
  }
  return state;
}

function reachDebrief(allocation: CampaignAllocation = halfSplit, _rating = 3) {
  let state = discoverAll(reachInvestigation());
  state = dispatch(state, { type: 'START_ALLOCATION' });
  state = dispatch(state, { type: 'SET_DRAFT_ALLOCATION', allocation });
  return dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });
}

function reachFinalVerdict(
  allocation: CampaignAllocation = halfSplit,
  rating = 3,
) {
  let state = reachDebrief(allocation, rating);
  state = dispatch(state, { type: 'COMPLETE_DEBRIEF' });
  return dispatch(state, { type: 'CHOOSE_REVISION', revise: false });
}

describe('Campaign v2 legal path', () => {
  test('preserves the Act I grade, Revision, and Master Seal across the Act II handoff and reload', () => {
    let state = reachDebrief(inverted, 5);
    state = dispatch(state, { type: 'COMPLETE_DEBRIEF' });
    state = dispatch(state, { type: 'CHOOSE_REVISION', revise: true });
    state = dispatch(state, { type: 'SET_REVISION_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'LOCK_FINAL_VERDICT' });
    state = dispatch(state, { type: 'ENTER_CHALLENGE' });
    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    state = dispatch(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'SUBMIT_CHALLENGE' });
    state = dispatch(state, { type: 'LEAVE_CHALLENGE' });
    state = dispatch(state, { type: 'CONTINUE_ACT' });
    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    const actOne = state.actRecord;
    expect(state.phase).toBe('act-two-transition');
    state = dispatch(state, { type: 'BEGIN_ACT_TWO' });
    expect(state).toMatchObject({ phase: 'cutscene', act: 2, actRecord: null, recordHistory: [actOne] });
    expect(state.recordHistory[0]).toMatchObject({ act: 1, grade: '稱職', revisionUsed: true, challenge: { masterSeal: true } });
    const encoded = encodeCampaignSave(createCampaignSave(state));
    expect(encoded.status).toBe('encoded');
    if (encoded.status !== 'encoded') return;
    const decoded = decodeCampaignSave(encoded.value);
    expect(decoded.status).toBe('restored');
    if (decoded.status !== 'restored') return;
    expect(decoded.envelope.campaign.recordHistory[0]).toMatchObject({ act: 1, grade: '稱職', revisionUsed: true, challenge: { masterSeal: true } });
  });
  test('runs CS-00 through a revision, challenge, Ledger, CS-03, and the Act II transition', () => {
    let state = initialCampaignState();
    expect(state).toMatchObject({
      act: 1,
      phase: 'cutscene',
      cutscene: { slotId: 'cs-00', returnTo: 'title' },
    });

    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    expect(state.phase).toBe('title');
    state = dispatch(state, { type: 'BEGIN_FROM_TITLE' });
    expect(state).toMatchObject({ phase: 'intro', cutscene: null });
    state = dispatch(state, { type: 'COMPLETE_INTRO' });
    state = discoverAll(state);
    state = dispatch(state, { type: 'START_ALLOCATION' });
    state = dispatch(state, { type: 'SET_DRAFT_ALLOCATION', allocation: inverted });
    state = dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(state.phase).toBe('debrief');
    expect(state.initialVerdict?.metrics.utilities).toEqual([30, 30]);
    expect(state.intuitionRating).toBeNull();
    state = dispatch(state, { type: 'COMPLETE_DEBRIEF' });
    state = dispatch(state, { type: 'CHOOSE_REVISION', revise: true });
    expect(state.revisionAllocation).toEqual(inverted);
    expect(state.revisionAllocation).not.toBe(state.initialVerdict?.allocation);
    state = dispatch(state, { type: 'SET_REVISION_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'LOCK_FINAL_VERDICT' });
    expect(state).toMatchObject({
      phase: 'final-verdict',
      revisionUsed: true,
      actRecord: { grade: '稱職', revisionUsed: true },
    });

    state = dispatch(state, { type: 'ENTER_CHALLENGE' });
    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    state = dispatch(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'SUBMIT_CHALLENGE' });
    expect(state.challenge).toMatchObject({
      status: 'completed',
      reachedFrontier: true,
      masterSeal: true,
    });
    state = dispatch(state, { type: 'LEAVE_CHALLENGE' });
    expect(state.phase).toBe('ledger');
    expect(state.actRecord?.challenge.masterSeal).toBe(true);

    state = dispatch(state, { type: 'CONTINUE_ACT' });
    expect(state).toMatchObject({
      phase: 'cutscene',
      cutscene: { slotId: 'cs-03', returnTo: 'act-two-transition' },
    });
    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    expect(state).toMatchObject({ act: 2, phase: 'act-two-transition', cutscene: null });
  });

  test('supports an integrated investigation desk without requiring an allocation-phase transition', () => {
    let state = reachInvestigation();
    state = dispatch(state, { type: 'SET_DRAFT_ALLOCATION', allocation: frontier });
    expect(state).toMatchObject({ phase: 'investigation', draftAllocation: frontier });
    expect(campaignReducer(state, { type: 'LOCK_INITIAL_VERDICT' })).toBe(state);

    state = discoverAll(state);
    state = dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(state).toMatchObject({
      phase: 'debrief',
      initialVerdict: { allocation: frontier },
    });
  });

  test('gates the initial verdict on all required clues and permits investigation return only before lock', () => {
    let state = reachInvestigation();
    state = dispatch(state, { type: 'START_ALLOCATION' });
    const blocked = campaignReducer(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(blocked).toBe(state);

    state = dispatch(state, { type: 'RETURN_TO_INVESTIGATION' });
    expect(state.phase).toBe('investigation');
    state = discoverAll(state);
    state = dispatch(state, { type: 'START_ALLOCATION' });
    state = dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(campaignReducer(state, { type: 'RETURN_TO_INVESTIGATION' })).toBe(state);
    expect(state.discoveredClueIds).toEqual(ACT_ONE_DEFINITION.clues.map(({ id }) => id));
  });

  test('rejects unknown, duplicate, and out-of-phase clue discovery', () => {
    let state = reachInvestigation();
    const clue = ACT_ONE_DEFINITION.clues[0].id;
    state = dispatch(state, { type: 'DISCOVER_CLUE', clueId: clue });
    expect(campaignReducer(state, { type: 'DISCOVER_CLUE', clueId: clue })).toBe(state);
    expect(campaignReducer(state, {
      type: 'DISCOVER_CLUE',
      clueId: 'not-an-authored-clue' as ActOneClueId,
    })).toBe(state);
  });
});

describe('Rate-Before-Reveal selectors', () => {
  test('opens Act I metrics only after the initial verdict is locked', () => {
    let state = discoverAll(reachInvestigation());
    state = dispatch(state, { type: 'START_ALLOCATION' });
    state = dispatch(state, { type: 'SET_DRAFT_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });

    expect(state.initialVerdict?.metrics.utilities).toEqual([70, 70]);
    expect(selectVisibleMetrics(state)).toMatchObject({ utilities: [70, 70], proportionality: true, ef: true });
    expect(selectCampaignViewModel(state)).toEqual({
      phase: 'debrief',
      cta: 'continue-debrief',
      task: 'review-debrief',
      metrics: { utilities: [70, 70], proportionality: true, ef: true },
    });
  });

  test('applies a metric allowlist for every campaign phase', () => {
    const final = reachFinalVerdict(frontier, 5);
    const phases: readonly CampaignPhase[] = [
      'cutscene', 'title', 'intro', 'investigation', 'allocation', 'intuition-rating',
      'debrief', 'revision-decision', 'revision', 'final-verdict', 'challenge',
      'ledger', 'replay', 'act-two-transition',
    ];
    const sealed: readonly CampaignPhase[] = [
      'cutscene', 'title', 'intro', 'investigation', 'allocation',
      'intuition-rating', 'act-two-transition',
    ];

    for (const phase of phases) {
      const candidate: CampaignState = {
        ...final,
        phase,
        revisionAllocation: frontier,
        challenge: { ...final.challenge, allocation: frontier, reachedFrontier: true },
        replay: phase === 'replay'
          ? { selectedAct: 1, returnTo: 'ledger', draftAllocation: frontier, sandboxRecord: null }
          : null,
      };
      const metrics = selectVisibleMetrics(candidate);
      if (sealed.includes(phase)) {
        expect(metrics, phase).toEqual({});
      } else {
        expect(metrics.utilities, phase).toEqual([70, 70]);
        expect(metrics.proportionality, phase).toBe(true);
        expect(metrics.ef, phase).toBe(true);
      }
      expect(Object.hasOwn(metrics, 'reachedFrontier'), phase).toBe(phase === 'challenge');
      expect(Object.hasOwn(metrics, 'grade'), phase).toBe(
        phase === 'final-verdict' || phase === 'ledger' || phase === 'replay',
      );
      expect(selectPrimaryCta(candidate)).toBeTruthy();
      expect(selectCurrentTask(candidate)).toBeTruthy();
    }
  });
});

describe('verdict snapshots and revision', () => {
  test('copies action inputs into JSON-safe immutable snapshots without mutating prior states', () => {
    const mutableRows = frontier.map(({ goodId, shares }) => ({
      goodId,
      shares: [shares[0], shares[1]] as [number, number],
    }));
    const allocation: CampaignAllocation = mutableRows;
    let state = discoverAll(reachInvestigation());
    state = dispatch(state, { type: 'START_ALLOCATION' });
    const prior = state;
    state = dispatch(state, { type: 'SET_DRAFT_ALLOCATION', allocation });
    expect(state).not.toBe(prior);
    expect(prior.draftAllocation).toEqual(halfSplit);

    mutableRows[0].shares[0] = 0;
    expect(state.draftAllocation[0].shares).toEqual([10, 0]);
    state = dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(() => JSON.stringify(state)).not.toThrow();
    expect(state.initialVerdict?.metrics.nsw).toBe('4900');
  });

  test.each([0, 1.5, 6, Number.NaN])('rejects invalid intuition rating %s', (rating) => {
    let state = discoverAll(reachInvestigation());
    state = dispatch(state, { type: 'START_ALLOCATION' });
    state = dispatch(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(campaignReducer(state, { type: 'SUBMIT_INTUITION_RATING', rating })).toBe(state);
  });

  test.each([1, 2, 3, 4, 5])('does not accept a legacy Act I intuition rating %s after lock', (rating) => {
    const state = reachDebrief(halfSplit, rating);
    expect(state.intuitionRating).toBeNull();
    expect(campaignReducer(state, { type: 'SUBMIT_INTUITION_RATING', rating })).toBe(state);
  });

  test('allows exactly one revision and freezes both verdict snapshots', () => {
    let state = reachDebrief(inverted, 2);
    state = dispatch(state, { type: 'COMPLETE_DEBRIEF' });
    state = dispatch(state, { type: 'CHOOSE_REVISION', revise: true });
    state = dispatch(state, { type: 'SET_REVISION_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'LOCK_FINAL_VERDICT' });

    expect(state.initialVerdict?.metrics.utilities).toEqual([30, 30]);
    expect(state.finalVerdict?.metrics.utilities).toEqual([70, 70]);
    expect(state.revisionUsed).toBe(true);
    expect(campaignReducer(state, { type: 'CHOOSE_REVISION', revise: true })).toBe(state);
    expect(campaignReducer(state, { type: 'SET_REVISION_ALLOCATION', allocation: halfSplit })).toBe(state);
  });
});

describe('Master Challenge and non-blocking grades', () => {
  test('preserves a completed frontier result on re-entry and clears it only after an edit', () => {
    let state = reachFinalVerdict(inverted, 1);
    state = dispatch(state, { type: 'SKIP_CHALLENGE' });
    expect(state).toMatchObject({ phase: 'ledger', cutscene: null, challenge: { status: 'skipped' } });

    state = dispatch(state, { type: 'ENTER_CHALLENGE' });
    expect(state.phase).toBe('challenge');
    state = dispatch(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'SUBMIT_CHALLENGE' });
    expect(state.challenge).toMatchObject({
      status: 'completed', reachedFrontier: true, masterSeal: true,
    });
    state = dispatch(state, { type: 'LEAVE_CHALLENGE' });
    const completedChallenge = state.challenge;
    const completedRecord = state.actRecord;

    state = dispatch(state, { type: 'ENTER_CHALLENGE' });
    expect(state.phase).toBe('challenge');
    expect(state.challenge).toBe(completedChallenge);
    expect(state.actRecord).toBe(completedRecord);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    expect(encodeCampaignSave(createCampaignSave(state)).status).toBe('encoded');
    expect(campaignReducer(state, {
      type: 'SET_CHALLENGE_ALLOCATION', allocation: frontier,
    })).toBe(state);

    state = dispatch(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: belowFrontier });
    expect(state.challenge).toMatchObject({
      status: 'in-progress',
      hintStage: 0,
      sealEligible: true,
      reachedFrontier: false,
      masterSeal: false,
    });
    state = dispatch(state, { type: 'SUBMIT_CHALLENGE' });
    expect(state.challenge).toMatchObject({
      status: 'completed', reachedFrontier: false, masterSeal: false,
    });
    expect(state.actRecord?.finalVerdict.metrics.utilities).toEqual([30, 30]);
  });

  test('permanently removes seal eligibility after the stage-three hint', () => {
    let state = reachFinalVerdict(halfSplit);
    state = dispatch(state, { type: 'ENTER_CHALLENGE' });
    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    state = dispatch(state, { type: 'VIEW_CHALLENGE_HINT', stage: 1 });
    state = dispatch(state, { type: 'VIEW_CHALLENGE_HINT', stage: 3 });
    state = dispatch(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'SUBMIT_CHALLENGE' });
    expect(state.challenge).toMatchObject({
      status: 'completed', hintStage: 3, sealEligible: false,
      reachedFrontier: true, masterSeal: false,
    });
    state = dispatch(state, { type: 'LEAVE_CHALLENGE' });
    state = dispatch(state, { type: 'ENTER_CHALLENGE' });
    state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
    state = dispatch(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: belowFrontier });
    expect(state.challenge).toMatchObject({
      status: 'in-progress', hintStage: 3, sealEligible: false,
      reachedFrontier: false, masterSeal: false,
    });
  });

  test.each([
    ['不稱職', inverted],
    ['平常', halfSplit],
    ['稱職', frontier],
  ] as const)('allows the %s grade to continue to Ledger', (grade, allocation) => {
    let state = reachFinalVerdict(allocation);
    expect(state.actRecord?.grade).toBe(grade);
    state = dispatch(state, { type: 'OPEN_LEDGER' });
    expect(state.phase).toBe('ledger');
    expect(dispatch(state, { type: 'CONTINUE_ACT' }).phase).toBe('cutscene');
  });
});

describe('replay sandbox and illegal transitions', () => {
  test('keeps replay in a sandbox until overwrite synchronously recomputes derived results', () => {
    let state = reachFinalVerdict(inverted);
    state = dispatch(state, { type: 'OPEN_LEDGER' });
    const canonical = state.actRecord;
    state = dispatch(state, { type: 'START_REPLAY', act: 1 });
    state = dispatch(state, { type: 'SET_REPLAY_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'SUBMIT_REPLAY' });

    expect(state.actRecord).toBe(canonical);
    expect(state.replay).toMatchObject({
      returnTo: 'ledger',
      sandboxRecord: { grade: '稱職' },
    });
    expect(state.dependentResults).toEqual({ ledger: 'current', ending: 'current' });

    state = dispatch(state, { type: 'CONFIRM_REPLAY_OVERWRITE' });
    expect(state.phase).toBe('ledger');
    expect(state.actRecord?.finalVerdict.metrics.utilities).toEqual([70, 70]);
    expect(state.dependentResults).toEqual({ ledger: 'current', ending: 'current' });
  });

  test('cancels a Ledger replay without changing canonical history or its return phase', () => {
    let state = reachFinalVerdict(inverted);
    state = dispatch(state, { type: 'OPEN_LEDGER' });
    const canonical = state.actRecord;
    state = dispatch(state, { type: 'START_REPLAY', act: 1 });
    expect(state.replay?.returnTo).toBe('ledger');
    state = dispatch(state, { type: 'SET_REPLAY_ALLOCATION', allocation: frontier });
    state = dispatch(state, { type: 'SUBMIT_REPLAY' });
    state = dispatch(state, { type: 'CANCEL_REPLAY' });
    expect(state.phase).toBe('ledger');
    expect(state.actRecord).toBe(canonical);
    expect(state.replay).toBeNull();
  });

  test.each(['CANCEL_REPLAY', 'CONFIRM_REPLAY_OVERWRITE'] as const)(
    '%s returns replay to the Act II transition when entered there',
    (actionType) => {
      let state = reachFinalVerdict(inverted);
      state = dispatch(state, { type: 'OPEN_LEDGER' });
      state = dispatch(state, { type: 'CONTINUE_ACT' });
      state = dispatch(state, { type: 'COMPLETE_CUTSCENE' });
      expect(state.phase).toBe('act-two-transition');

      const canonical = state.actRecord;
      state = dispatch(state, { type: 'START_REPLAY', act: 1 });
      expect(state.replay?.returnTo).toBe('act-two-transition');
      state = dispatch(state, { type: 'SET_REPLAY_ALLOCATION', allocation: frontier });
      state = dispatch(state, { type: 'SUBMIT_REPLAY' });
      state = dispatch(state, { type: actionType });

      expect(state.phase).toBe('act-two-transition');
      expect(state.replay).toBeNull();
      if (actionType === 'CANCEL_REPLAY') {
        expect(state.actRecord).toBe(canonical);
      } else {
        expect(state.actRecord?.finalVerdict.metrics.utilities).toEqual([70, 70]);
        expect(state.dependentResults).toEqual({ ledger: 'current', ending: 'current' });
      }
    },
  );

  test('returns the identical object for actions illegal in the opening cutscene', () => {
    const state = initialCampaignState();
    const illegal: CampaignAction[] = [
      { type: 'BEGIN_FROM_TITLE' },
      { type: 'COMPLETE_INTRO' },
      { type: 'START_ALLOCATION' },
      { type: 'RETURN_TO_INVESTIGATION' },
      { type: 'LOCK_INITIAL_VERDICT' },
      { type: 'SUBMIT_INTUITION_RATING', rating: 3 },
      { type: 'COMPLETE_DEBRIEF' },
      { type: 'CHOOSE_REVISION', revise: true },
      { type: 'LOCK_FINAL_VERDICT' },
      { type: 'ENTER_CHALLENGE' },
      { type: 'SUBMIT_CHALLENGE' },
      { type: 'LEAVE_CHALLENGE' },
      { type: 'SKIP_CHALLENGE' },
      { type: 'OPEN_LEDGER' },
      { type: 'CONTINUE_ACT' },
      { type: 'START_REPLAY', act: 1 },
      { type: 'SUBMIT_REPLAY' },
      { type: 'CANCEL_REPLAY' },
      { type: 'CONFIRM_REPLAY_OVERWRITE' },
    ];
    for (const action of illegal) expect(campaignReducer(state, action), action.type).toBe(state);
  });

  test('rejects malformed allocations without throwing or changing state', () => {
    let state = discoverAll(reachInvestigation());
    state = dispatch(state, { type: 'START_ALLOCATION' });
    const malformed = [
      { goodId: 'paddy-field', shares: [11, -1] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [5, 5] },
    ] as CampaignAllocation;
    expect(campaignReducer(state, { type: 'SET_DRAFT_ALLOCATION', allocation: malformed })).toBe(state);
  });
});
