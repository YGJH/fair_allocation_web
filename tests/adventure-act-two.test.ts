import { describe, expect, test } from 'vitest';
import { ACT_TWO_DEFINITION } from '../src/narrative/campaign-definition';
import { analyzeActTwoAllocation, gradeActTwo } from '../src/narrative/campaign-rules';
import { selectVisibleMetrics } from '../src/narrative/selectors';
import { campaignReducer, initialCampaignState } from '../src/narrative/state-machine';
import type { CampaignState } from '../src/narrative/types';
import { createCampaignSave, decodeCampaignSave, encodeCampaignSave } from '../src/narrative/persistence';

const compensation = ACT_TWO_DEFINITION.demonstrations.compensation;

describe('Act II gameplay facts and disclosure boundary', () => {
  test('canonical compensation is EF with 44/44/68 and Harmony Score 131648', () => {
    const analysis = analyzeActTwoAllocation(compensation);
    expect(analysis.utilities.map(Number)).toEqual([44, 44, 68]);
    expect(analysis.ef).toBe(true);
    expect(analysis.nsw).toBe(131648n);
    expect(gradeActTwo(analysis)).toBe('稱職');
  });

  test('the wrong workshop owner is not repairable by divisible shares', () => {
    const analysis = analyzeActTwoAllocation(ACT_TWO_DEFINITION.demonstrations.patriarchal);
    expect(analysis.ef).toBe(false);
    expect(analysis.envyPairs.length).toBeGreaterThan(0);
  });

  test('allows an incomplete investigation but reveals missing valuations at Debrief', () => {
    const base = initialCampaignState();
    let state: CampaignState = {
      ...base,
      act: 2 as const,
      phase: 'investigation' as const,
      cutscene: null,
      draftAllocation: compensation.map((row) => ({ goodId: row.goodId, shares: 'shares' in row ? [...row.shares] : [], ...('owner' in row ? { owner: row.owner } : {}) })),
      discoveredClueIds: ['clue-loom-workshop-indivisible'],
    };
    state = campaignReducer(state, { type: 'START_ALLOCATION' });
    state = campaignReducer(state, { type: 'SET_DRAFT_ALLOCATION', allocation: compensation as any });
    state = campaignReducer(state, { type: 'LOCK_INITIAL_VERDICT' });
    expect(state.phase).toBe('intuition-rating');
    expect(selectVisibleMetrics(state)).toEqual({});
    state = campaignReducer(state, { type: 'SUBMIT_INTUITION_RATING', rating: 3 });
    expect(state.phase).toBe('debrief');
    expect(state.initialVerdict?.missingClueIds).toEqual([
      'clue-pei-boqian-valuations', 'clue-pei-zhongwen-valuations', 'clue-xue-shoucheng-valuations',
    ]);
    expect(selectVisibleMetrics(state).harmonyScore).toBeUndefined();
  });

  test('Act II state and mixed allocation remain JSON-safe through autosave codec', () => {
    const base = initialCampaignState();
    const state: CampaignState = { ...base, act: 2, phase: 'investigation', cutscene: null, draftAllocation: compensation.map((row) => ({ goodId: row.goodId, shares: 'shares' in row ? [...row.shares] : [], ...('owner' in row ? { owner: row.owner } : {}) })), discoveredClueIds: ['clue-loom-workshop-indivisible'] };
    const encoded = encodeCampaignSave(createCampaignSave(state));
    expect(encoded.status).toBe('encoded');
    if (encoded.status === 'encoded') expect(decodeCampaignSave(encoded.value).status).toBe('restored');
  });
});
