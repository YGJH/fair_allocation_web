/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MasterChallenge } from '../src/components/adventure/MasterChallenge';
import { PerformanceLedger } from '../src/components/adventure/PerformanceLedger';
import { ACT_ONE_DEFINITION } from '../src/narrative/campaign-definition';
import { campaignReducer, initialCampaignState } from '../src/narrative/state-machine';
import type { ActOneRecord } from '../src/narrative/types';

function completedState() {
  let state = initialCampaignState();
  state = campaignReducer(state, { type: 'COMPLETE_CUTSCENE' });
  state = campaignReducer(state, { type: 'BEGIN_FROM_TITLE' });
  state = campaignReducer(state, { type: 'COMPLETE_CUTSCENE' });
  state = campaignReducer(state, { type: 'COMPLETE_INTRO' });
  for (const { id } of ACT_ONE_DEFINITION.clues) state = campaignReducer(state, { type: 'DISCOVER_CLUE', clueId: id });
  state = campaignReducer(state, { type: 'START_ALLOCATION' });
  state = campaignReducer(state, { type: 'LOCK_INITIAL_VERDICT' });
  state = campaignReducer(state, { type: 'SUBMIT_INTUITION_RATING', rating: 3 });
  state = campaignReducer(state, { type: 'COMPLETE_DEBRIEF' });
  state = campaignReducer(state, { type: 'CHOOSE_REVISION', revise: false });
  state = campaignReducer(state, { type: 'ENTER_CHALLENGE' });
  return campaignReducer(state, { type: 'COMPLETE_CUTSCENE' });
}

describe('IP-7 Act I handoff', () => {
  test('cut-and-choose computes the younger brother choice and 70/70 seal through the reducer rule', () => {
    let state = completedState();
    state = campaignReducer(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: ACT_ONE_DEFINITION.demonstrations.frontier });
    state = campaignReducer(state, { type: 'SUBMIT_CHALLENGE' });
    expect(state.challenge.status).toBe('completed');
    expect(state.challenge.reachedFrontier).toBe(true);
    expect(state.challenge.masterSeal).toBe(true);

    render(<MasterChallenge locale="en" challenge={state.challenge} onChange={() => {}} onHint={() => {}} onSubmit={() => {}} onSkip={() => {}} onLeave={() => {}} />);
    expect(screen.getAllByText(/younger brother chooses Bundle B/).length).toBe(2);
    expect(screen.getByText(/found the authored solution/)).toBeTruthy();
  });

  test('stage three hint disqualifies the seal, while a completed challenge remains complete until edited', () => {
    let state = completedState();
    state = campaignReducer(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: ACT_ONE_DEFINITION.demonstrations.frontier });
    state = campaignReducer(state, { type: 'VIEW_CHALLENGE_HINT', stage: 3 });
    state = campaignReducer(state, { type: 'SUBMIT_CHALLENGE' });
    expect(state.challenge.status).toBe('completed');
    expect(state.challenge.sealEligible).toBe(false);
    expect(state.challenge.masterSeal).toBe(false);
    state = campaignReducer(state, { type: 'LEAVE_CHALLENGE' });
    state = campaignReducer(state, { type: 'ENTER_CHALLENGE' });
    state = campaignReducer(state, { type: 'COMPLETE_CUTSCENE' });
    expect(state.challenge.status).toBe('completed');
    expect(state.challenge.masterSeal).toBe(false);
    state = campaignReducer(state, { type: 'SET_CHALLENGE_ALLOCATION', allocation: ACT_ONE_DEFINITION.demonstrations.halfSplit });
    expect(state.challenge.status).toBe('in-progress');
  });

  test('ledger exposes only Act I records and keeps the three-seal progress bounded', () => {
    const state = completedState();
    const record = state.actRecord as ActOneRecord;
    render(<PerformanceLedger locale="en" record={record} onChallenge={() => {}} onContinue={() => {}} onRecall={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Act I record' })).toBeTruthy();
    expect(screen.getByText('Initial Verdict')).toBeTruthy();
    expect(screen.getByText('Final Verdict')).toBeTruthy();
    expect(screen.getByText(/Master Seal progress: 0 of 3/)).toBeTruthy();
    expect(screen.queryByText(/NSW|EF1|EFX/)).toBeNull();
  });
});
