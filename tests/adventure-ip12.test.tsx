/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AdventureShell } from '../src/components/adventure/AdventureShell';
import { RecallArchive } from '../src/components/adventure/RecallArchive';
import { ACT_ONE_DEFINITION } from '../src/narrative/campaign-definition';
import {
  CAMPAIGN_V2_STORAGE_KEY,
  createCampaignSave,
  encodeCampaignSave,
} from '../src/narrative/persistence';
import { campaignReducer, initialCampaignState } from '../src/narrative/state-machine';
import type { CampaignState } from '../src/narrative/types';

function campaignAtActThreeTransition(): CampaignState {
  let state = initialCampaignState();
  const dispatch = (action: Parameters<typeof campaignReducer>[1]) => {
    state = campaignReducer(state, action);
  };

  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'BEGIN_FROM_TITLE' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'COMPLETE_INTRO' });
  for (const { id } of ACT_ONE_DEFINITION.clues) dispatch({ type: 'DISCOVER_CLUE', clueId: id });
  dispatch({ type: 'START_ALLOCATION' });
  dispatch({ type: 'LOCK_INITIAL_VERDICT' });
  dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 });
  dispatch({ type: 'COMPLETE_DEBRIEF' });
  dispatch({ type: 'CHOOSE_REVISION', revise: false });
  dispatch({ type: 'SKIP_CHALLENGE' });
  dispatch({ type: 'CONTINUE_ACT' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });

  dispatch({ type: 'BEGIN_ACT_TWO' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });
  dispatch({ type: 'COMPLETE_INTRO' });
  dispatch({ type: 'DISCOVER_CLUE', clueId: 'clue-loom-workshop-indivisible' });
  dispatch({ type: 'START_ALLOCATION' });
  dispatch({ type: 'LOCK_INITIAL_VERDICT' });
  dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 });
  dispatch({ type: 'COMPLETE_DEBRIEF' });
  dispatch({ type: 'CHOOSE_REVISION', revise: false });
  dispatch({ type: 'SKIP_CHALLENGE' });
  dispatch({ type: 'CONTINUE_ACT' });
  dispatch({ type: 'COMPLETE_CUTSCENE' });

  return state;
}

function storeCampaign(campaign: CampaignState) {
  const encoded = encodeCampaignSave(createCampaignSave(campaign));
  if (encoded.status !== 'encoded') throw new Error('Test campaign did not encode.');
  localStorage.setItem(CAMPAIGN_V2_STORAGE_KEY, encoded.value);
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('IP-12 Act III localization and recall archive', () => {
  test('renders the localized Act III transition button in both locales', async () => {
    const user = userEvent.setup();
    storeCampaign(campaignAtActThreeTransition());

    const en = render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Continue campaign' }));
    expect(screen.getByRole('button', { name: 'Begin Act III · CS-07' })).toBeTruthy();
    en.unmount();

    render(<AdventureShell locale="zh-TW" />);
    await user.click(await screen.findByRole('button', { name: '繼續篇章' }));
    expect(screen.getByRole('button', { name: '開始第三幕 · CS-07' })).toBeTruthy();
  });

  test('renders localized EF1 and EFX statuses in the Act III Final Verdict', async () => {
    const user = userEvent.setup();
    let state = campaignAtActThreeTransition();
    const dispatch = (action: Parameters<typeof campaignReducer>[1]) => {
      state = campaignReducer(state, action);
    };
    dispatch({ type: 'BEGIN_ACT_THREE' });
    dispatch({ type: 'COMPLETE_CUTSCENE' });
    dispatch({ type: 'COMPLETE_INTRO' });
    dispatch({ type: 'DISCOVER_CLUE', clueId: 'clue-emperor-no-unanimity' });
    dispatch({ type: 'START_ALLOCATION' });
    dispatch({ type: 'LOCK_INITIAL_VERDICT' });
    dispatch({ type: 'SUBMIT_INTUITION_RATING', rating: 3 });
    dispatch({ type: 'COMPLETE_DEBRIEF' });
    dispatch({ type: 'CHOOSE_REVISION', revise: false });
    dispatch({ type: 'LOCK_FINAL_VERDICT' });
    storeCampaign(state);

    const en = render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Continue campaign' }));
    expect(screen.getByText(/EF1: (yes|no) · EFX: (yes|no)/)).toBeTruthy();
    en.unmount();

    render(<AdventureShell locale="zh-TW" />);
    await user.click(await screen.findByRole('button', { name: '繼續篇章' }));
    expect(screen.getByText(/EF1: (是|否) · EFX: (是|否)/)).toBeTruthy();
  });

  test('shows only authored campaign slots and preserves watched-slot replay', () => {
    const onReplay = vi.fn();
    render(<RecallArchive locale="en" watchedSlots={['cs-00', 'cs-12']} onReplay={onReplay} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(13);
    expect(screen.queryByText(/cs-13|cs-14/)).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Replay' })).toHaveLength(2);
  });
});
