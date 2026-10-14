import { describe, expect, test } from 'vitest';
import { ACT_ONE_DEFINITION, ACT_THREE_DEFINITION } from '../src/narrative/campaign-definition';
import { buildEpilogueSummary } from '../src/narrative/campaign-rules';
import { evaluateNationalEnding } from '../src/narrative/ending-rules';
import { analyzeActThreeAllocation, enumerateActThreeAllocations, selectActThreePostChallengeCutscene } from '../src/narrative/act-three-facts';
import { createCampaignSave, decodeCampaignSave, encodeCampaignSave } from '../src/narrative/persistence';
import { campaignReducer, initialCampaignState } from '../src/narrative/state-machine';
import type { CampaignAllocation, CampaignState } from '../src/narrative/types';

const writAllocation = (allocation: readonly { writId: string; owner: number }[]): CampaignAllocation => allocation.map(({ writId, owner }) => ({ goodId: writId, writId, shares: [], owner }));

function actThreeAllocationState(): CampaignState {
  let state = initialCampaignState();
  const dispatch = (action: Parameters<typeof campaignReducer>[1]) => { state = campaignReducer(state, action); };
  dispatch({ type: 'COMPLETE_CUTSCENE' }); dispatch({ type: 'BEGIN_FROM_TITLE' }); dispatch({ type: 'COMPLETE_CUTSCENE' }); dispatch({ type: 'COMPLETE_INTRO' });
  for (const clue of ACT_ONE_DEFINITION.clues) dispatch({ type: 'DISCOVER_CLUE', clueId: clue.id });
  dispatch({ type: 'START_ALLOCATION' }); dispatch({ type: 'LOCK_INITIAL_VERDICT' }); dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 }); dispatch({ type: 'COMPLETE_DEBRIEF' }); dispatch({ type: 'CHOOSE_REVISION', revise: false }); dispatch({ type: 'SKIP_CHALLENGE' }); dispatch({ type: 'CONTINUE_ACT' }); dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_ACT_TWO' }); dispatch({ type: 'COMPLETE_CUTSCENE' }); dispatch({ type: 'COMPLETE_INTRO' }); dispatch({ type: 'DISCOVER_CLUE', clueId: 'clue-loom-workshop-indivisible' }); dispatch({ type: 'START_ALLOCATION' }); dispatch({ type: 'LOCK_INITIAL_VERDICT' }); dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 }); dispatch({ type: 'COMPLETE_DEBRIEF' }); dispatch({ type: 'CHOOSE_REVISION', revise: false }); dispatch({ type: 'SKIP_CHALLENGE' }); dispatch({ type: 'CONTINUE_ACT' }); dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_ACT_THREE' }); dispatch({ type: 'COMPLETE_CUTSCENE' }); dispatch({ type: 'COMPLETE_INTRO' }); dispatch({ type: 'DISCOVER_CLUE', clueId: 'clue-emperor-no-unanimity' }); dispatch({ type: 'START_ALLOCATION' });
  return state;
}

describe('IP-12 Third Act state boundary', () => {
  test('keeps formal indicators hidden before the Initial Verdict and requires one owner for all six Writs', () => {
    const state = actThreeAllocationState();
    expect(state.act).toBe(3);
    expect(state.draftAllocation).toHaveLength(6);
    expect(state.draftAllocation.every(({ owner }) => Number.isInteger(owner))).toBe(true);
    expect(state.initialVerdict).toBeNull();
    expect(state.phase).toBe('allocation');
  });

  test('preserves Rate-Before-Reveal, allows exactly one Revision, and reaches the Act III boundary', () => {
    let state = actThreeAllocationState();
    const dispatch = (action: Parameters<typeof campaignReducer>[1]) => { state = campaignReducer(state, action); };
    dispatch({ type: 'LOCK_INITIAL_VERDICT' });
    expect(state.phase).toBe('intuition-rating');
    dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 4 });
    expect(state.phase).toBe('debrief');
    expect(state.initialVerdict?.metrics.ef1).toBeDefined();
    dispatch({ type: 'COMPLETE_DEBRIEF' }); dispatch({ type: 'CHOOSE_REVISION', revise: true });
    expect(state.phase).toBe('revision');
    dispatch({ type: 'LOCK_FINAL_VERDICT' });
    expect(state.phase).toBe('final-verdict');
    dispatch({ type: 'SKIP_CHALLENGE' });
    expect(state.phase).toBe('ledger');
    expect(state.actRecord?.act).toBe(3);
    dispatch({ type: 'CONTINUE_ACT' });
    expect(state.phase).toBe('cutscene');
    expect(state.cutscene?.slotId).toBe('cs-12');
    dispatch({ type: 'COMPLETE_CUTSCENE' });
    expect(state.phase).toBe('ending');
    expect(state.ending?.resolution.ending).toBe('大璫之怨');
    dispatch({ type: 'COMPLETE_ENDING' });
    expect(state.phase).toBe('completed');
    const encoded = encodeCampaignSave(createCampaignSave(state));
    expect(encoded.status).toBe('encoded');
    if (encoded.status === 'encoded') expect(decodeCampaignSave(encoded.value).envelope.campaign.phase).toBe('completed');
  });

  test('changes only the epilogue summary when earlier Grades change, not the Act III National Ending', () => {
    const records = (grades: ['稱職' | '平常' | '不稱職', '稱職' | '平常' | '不稱職', '稱職' | '平常' | '不稱職']) => grades.map((grade, index) => ({
      act: (index + 1) as 1 | 2 | 3,
      grade,
      intuitionRating: 3 as const,
      challenge: { masterSeal: false },
    })) as unknown as CampaignState['recordHistory'];
    const allCompetent = buildEpilogueSummary(records(['稱職', '稱職', '稱職']), false);
    const strong = buildEpilogueSummary(records(['稱職', '稱職', '平常']), false);
    const ordinary = buildEpilogueSummary(records(['平常', '不稱職', '平常']), false);
    expect(allCompetent.overallSeal).toBe('國之權衡');
    expect(strong.yiwuVignette).toBe('competent-or-better');
    expect(strong.hangzhouVignette).toBe('competent-or-better');
    expect(strong.overallSeal).toBe('持平良吏');
    expect(ordinary.yiwuVignette).toBe('ordinary-or-below');
    expect(ordinary.hangzhouVignette).toBe('ordinary-or-below');
    expect(ordinary.overallSeal).toBe('循例之官');
    const actThree = evaluateNationalEnding({ utilities: [40, 35, 30], nsw: '42000', proportionality: false, ef: false, ef1: true, efx: false, envyPairs: [{ i: 2, j: 0, gap: 12 }] });
    const sameActThree = evaluateNationalEnding({ utilities: [40, 35, 30], nsw: '42000', proportionality: false, ef: false, ef1: true, efx: false, envyPairs: [{ i: 2, j: 0, gap: 12 }] });
    expect(actThree).toMatchObject({ ending: '大璫之怨', severity: 'mild', mostAggrievedParty: '內廷' });
    expect(actThree).toEqual(sameActThree);
  });

  test('selects only authored post-challenge vignettes from Final Verdict facts', () => {
    const efx = analyzeActThreeAllocation(writAllocation(ACT_THREE_DEFINITION.demonstrations.efxFrontier));
    expect(selectActThreePostChallengeCutscene(efx)).toBe('cs-09');
    const grievance = analyzeActThreeAllocation(writAllocation(ACT_THREE_DEFINITION.demonstrations.unbalanced));
    expect(selectActThreePostChallengeCutscene(grievance)).toMatch(/^cs-1[012]$/);
    for (const expected of ['cs-10', 'cs-11', 'cs-12'] as const) {
      const candidate = enumerateActThreeAllocations().find((analysis) => selectActThreePostChallengeCutscene(analysis) === expected);
      expect(candidate, expected).toBeDefined();
    }
    const zeroProduct = analyzeActThreeAllocation(writAllocation(ACT_THREE_DEFINITION.writs.map(({ id }) => ({ writId: id, owner: 0 }))));
    expect(selectActThreePostChallengeCutscene(zeroProduct)).toBe('cs-13');
  });

  test('rejects an active Act III challenge carrying an Act I allocation', () => {
    const state = actThreeAllocationState();
    const challenge = { ...state.challenge, status: 'in-progress' as const, allocation: ACT_ONE_DEFINITION.demonstrations.halfSplit, checked: false };
    const crafted = { ...state, challenge };
    expect(decodeCampaignSave(JSON.stringify(createCampaignSave(crafted))).status).toBe('reset');
  });

  test('rejects a skipped Act III challenge carrying an Act I allocation', () => {
    const state = actThreeAllocationState();
    const challenge = { ...state.challenge, status: 'skipped' as const, allocation: ACT_ONE_DEFINITION.demonstrations.halfSplit, checked: false };
    const crafted = { ...state, challenge };
    expect(decodeCampaignSave(JSON.stringify(createCampaignSave(crafted))).status).toBe('reset');
  });

  test('round-trips persisted Third Act Writ rows and canonical EFX metrics', () => {
    const allocation = writAllocation(ACT_THREE_DEFINITION.demonstrations.efxFrontier);
    expect(analyzeActThreeAllocation(allocation)).toMatchObject({ ef1: true, efx: true, utilities: [35n, 55n, 55n] });
    const state = actThreeAllocationState();
    const withAllocation = { ...state, draftAllocation: allocation };
    const encoded = encodeCampaignSave(createCampaignSave(withAllocation));
    expect(encoded.status).toBe('encoded');
    if (encoded.status === 'encoded') expect(decodeCampaignSave(encoded.value).status).toBe('restored');
  });
});
