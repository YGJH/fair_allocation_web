import { describe, expect, test } from 'vitest';
import { NARRATIVE_SCENARIOS } from '../src/narrative/scenarios';
import { initialNarrativeState, narrativeReducer, resolveEnding } from '../src/narrative/state-machine';
import { evaluateVerdict, isMasterSolution } from '../src/narrative/verdict-engine';

describe('historical narrative scenarios', () => {
  test('every valuation row is normalized to 100', () => {
    for (const scenario of NARRATIVE_SCENARIOS) {
      for (const row of scenario.values) expect(row.reduce((sum, value) => sum + value, 0)).toBe(100);
    }
  });

  test('Act I master allocation is completely envy-free', () => {
    const scenario = NARRATIVE_SCENARIOS[0];
    expect(evaluateVerdict(scenario, scenario.masterAllocation)).toMatchObject({
      utilities: [65, 80],
      nsw: '5200',
      ef: true,
      ef1: true,
      efx: true,
    });
  });

  test('Act II conventional ruling passes EF1 but fails EFX', () => {
    const scenario = NARRATIVE_SCENARIOS[1];
    expect(evaluateVerdict(scenario, [0, 0, 1, 1, 2])).toMatchObject({
      utilities: [80, 30, 70],
      ef1: true,
      efx: false,
    });
  });

  test('Act II master allocation reaches strict EFX', () => {
    const scenario = NARRATIVE_SCENARIOS[1];
    expect(evaluateVerdict(scenario, scenario.masterAllocation)).toMatchObject({
      utilities: [55, 60, 70],
      ef1: true,
      efx: true,
    });
  });

  test('Act III silver compensation reaches the stated NSW optimum', () => {
    const scenario = NARRATIVE_SCENARIOS[2];
    const report = evaluateVerdict(scenario, scenario.masterAllocation, scenario.masterSilver);
    expect(report).toMatchObject({ utilities: [90, 90, 90], nsw: '729000', zeroUtility: false });
    expect(isMasterSolution(scenario, scenario.masterAllocation, scenario.masterSilver!)).toBe(true);
  });
});

describe('narrative state machine', () => {
  test('formal results stay unavailable until the player rates the verdict', () => {
    let state = initialNarrativeState();
    state = narrativeReducer(state, { type: 'BEGIN' });
    expect(state.phase).toBe('briefing');
    for (const _beat of NARRATIVE_SCENARIOS[0].storyBeats) {
      state = narrativeReducer(state, { type: 'ADVANCE_STORY' });
    }
    expect(state.phase).toBe('investigation');
    for (const clueId of NARRATIVE_SCENARIOS[0].requiredClueIds) {
      state = narrativeReducer(state, { type: 'INSPECT', clueId });
    }
    state = narrativeReducer(state, { type: 'START_ALLOCATION' });
    NARRATIVE_SCENARIOS[0].masterAllocation.forEach((owner, itemIndex) => {
      state = narrativeReducer(state, { type: 'ASSIGN', itemIndex, owner });
    });
    state = narrativeReducer(state, { type: 'COMMIT' });
    expect(state.phase).toBe('judgment');
    expect(state.report).toBeNull();

    state = narrativeReducer(state, { type: 'RATE', rating: 5 });
    expect(state.phase).toBe('reveal');
    expect(state.report?.nsw).toBe('5200');
  });

  test('mastery challenge does not overwrite the committed verdict record', () => {
    let state: ReturnType<typeof initialNarrativeState> = {
      ...initialNarrativeState(),
      phase: 'allocation',
      owners: [0, 0, 0, 0],
    };
    state = narrativeReducer(state, { type: 'COMMIT' });
    state = narrativeReducer(state, { type: 'RATE', rating: 2 });
    state = narrativeReducer(state, { type: 'ENTER_CHALLENGE' });
    NARRATIVE_SCENARIOS[0].masterAllocation.forEach((owner, itemIndex) => {
      state = narrativeReducer(state, { type: 'ASSIGN', itemIndex, owner });
    });
    state = narrativeReducer(state, { type: 'CHECK_CHALLENGE' });
    state = narrativeReducer(state, { type: 'CONTINUE' });

    expect(state.records[0].report.zeroUtility).toBe(true);
    expect(state.records[0].mastered).toBe(true);
  });

  test('mastery has priority when resolving the scholar ending', () => {
    const report = evaluateVerdict(NARRATIVE_SCENARIOS[0], NARRATIVE_SCENARIOS[0].masterAllocation);
    expect(resolveEnding([
      { scenarioId: 'guild', report, rating: 5, mastered: true },
      { scenarioId: 'yamen', report, rating: 5, mastered: true },
    ])).toBe('scholar');
  });
});
