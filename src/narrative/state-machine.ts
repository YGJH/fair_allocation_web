import { NARRATIVE_SCENARIOS } from './scenarios';
import type { NarrativeState, VerdictRecord } from './types';
import { evaluateVerdict, isMasterSolution } from './verdict-engine';

export type NarrativeAction =
  | { type: 'RESTORE'; state: NarrativeState }
  | { type: 'BEGIN' }
  | { type: 'ADVANCE_STORY' }
  | { type: 'INSPECT'; clueId: string }
  | { type: 'START_ALLOCATION' }
  | { type: 'SELECT_ITEM'; itemIndex: number | null }
  | { type: 'ASSIGN'; itemIndex: number; owner: number }
  | { type: 'SET_SILVER'; amounts: number[] }
  | { type: 'COMMIT' }
  | { type: 'RATE'; rating: number }
  | { type: 'ENTER_CHALLENGE' }
  | { type: 'CHECK_CHALLENGE' }
  | { type: 'LEAVE_CHALLENGE' }
  | { type: 'CONTINUE' }
  | { type: 'NEXT_ACT' }
  | { type: 'RESTART' };

export function initialNarrativeState(): NarrativeState {
  const first = NARRATIVE_SCENARIOS[0];
  return {
    phase: 'prologue',
    actIndex: 0,
    storyIndex: 0,
    discoveredClueIds: [],
    activeClueId: null,
    owners: first.items.map(() => -1),
    selectedItem: null,
    silver: first.agents.map(() => 0),
    rating: null,
    report: null,
    committedReport: null,
    records: [],
    challengeMastered: false,
  };
}

export function canStartAllocation(state: NarrativeState) {
  const scenario = NARRATIVE_SCENARIOS[state.actIndex];
  return scenario.requiredClueIds.every((clueId) => state.discoveredClueIds.includes(clueId));
}

export function allocationComplete(state: NarrativeState) {
  return state.owners.every((owner) => owner >= 0);
}

function finishActRecord(state: NarrativeState): VerdictRecord[] {
  const scenario = NARRATIVE_SCENARIOS[state.actIndex];
  const current: VerdictRecord = {
    scenarioId: scenario.id,
    report: state.committedReport ?? state.report ?? evaluateVerdict(scenario, state.owners, state.silver),
    rating: state.rating ?? 3,
    mastered: state.challengeMastered,
  };
  return [...state.records.filter((record) => record.scenarioId !== scenario.id), current];
}

export function narrativeReducer(state: NarrativeState, action: NarrativeAction): NarrativeState {
  const scenario = NARRATIVE_SCENARIOS[state.actIndex];

  switch (action.type) {
    case 'RESTORE':
      return action.state.actIndex >= 0 && action.state.actIndex < NARRATIVE_SCENARIOS.length ? action.state : state;
    case 'BEGIN':
      return { ...state, phase: 'briefing', storyIndex: 0, activeClueId: null };
    case 'ADVANCE_STORY':
      if (state.phase !== 'briefing') return state;
      return state.storyIndex < scenario.storyBeats.length - 1
        ? { ...state, storyIndex: state.storyIndex + 1 }
        : { ...state, phase: 'investigation', storyIndex: 0 };
    case 'INSPECT':
      return {
        ...state,
        activeClueId: action.clueId,
        discoveredClueIds: state.discoveredClueIds.includes(action.clueId)
          ? state.discoveredClueIds
          : [...state.discoveredClueIds, action.clueId],
      };
    case 'START_ALLOCATION':
      return canStartAllocation(state) ? { ...state, phase: 'allocation', activeClueId: null } : state;
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.itemIndex };
    case 'ASSIGN':
      return {
        ...state,
        owners: state.owners.map((owner, index) => index === action.itemIndex ? action.owner : owner),
        selectedItem: null,
      };
    case 'SET_SILVER':
      return action.amounts.length === scenario.agents.length && action.amounts.reduce((sum, value) => sum + value, 0) === 100
        ? { ...state, silver: action.amounts }
        : state;
    case 'COMMIT':
      return allocationComplete(state) ? { ...state, phase: 'judgment', selectedItem: null } : state;
    case 'RATE': {
      if (action.rating < 1 || action.rating > 5 || !Number.isInteger(action.rating)) return state;
      const report = evaluateVerdict(scenario, state.owners, state.silver);
      return { ...state, phase: 'reveal', rating: action.rating, report, committedReport: report };
    }
    case 'ENTER_CHALLENGE':
      return { ...state, phase: 'challenge', report: null, selectedItem: null };
    case 'CHECK_CHALLENGE': {
      if (!allocationComplete(state)) return state;
      return {
        ...state,
        report: evaluateVerdict(scenario, state.owners, state.silver),
        challengeMastered: isMasterSolution(scenario, state.owners, state.silver),
      };
    }
    case 'LEAVE_CHALLENGE':
      return { ...state, phase: 'reveal', report: evaluateVerdict(scenario, state.owners, state.silver) };
    case 'CONTINUE': {
      const records = finishActRecord(state);
      return state.actIndex === NARRATIVE_SCENARIOS.length - 1
        ? { ...state, records, phase: 'epilogue' }
        : { ...state, records, phase: 'transition' };
    }
    case 'NEXT_ACT': {
      const actIndex = Math.min(state.actIndex + 1, NARRATIVE_SCENARIOS.length - 1);
      const next = NARRATIVE_SCENARIOS[actIndex];
      return {
        ...state,
        phase: 'briefing',
        actIndex,
        storyIndex: 0,
        discoveredClueIds: [],
        activeClueId: null,
        owners: next.items.map(() => -1),
        selectedItem: null,
        silver: next.id === 'palace' ? [0, 0, 100] : next.agents.map(() => 0),
        rating: null,
        report: null,
        committedReport: null,
        challengeMastered: false,
      };
    }
    case 'RESTART':
      return initialNarrativeState();
  }
}

export type EndingKind = 'prime-minister' | 'legalist' | 'autocrat' | 'scholar';

export function resolveEnding(records: VerdictRecord[]): EndingKind {
  const mastered = records.filter((record) => record.mastered).length;
  if (mastered >= 2) return 'scholar';
  const zeroes = records.filter((record) => record.report.zeroUtility).length;
  if (zeroes >= 1) return 'autocrat';
  const strict = records.filter((record) => record.report.ef || record.report.efx).length;
  if (strict >= 2) return 'legalist';
  return 'prime-minister';
}
