/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { generateMetadata } from '../src/app/[locale]/adventure/page';
import { AdventureShell } from '../src/components/adventure/AdventureShell';
import { ACT_ONE_DEFINITION } from '../src/narrative/campaign-definition';
import {
  CAMPAIGN_V2_STORAGE_KEY,
  LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY,
  LEGACY_CAMPAIGN_V1_STORAGE_KEY,
  createCampaignSave,
  decodeCampaignSave,
  encodeCampaignSave,
} from '../src/narrative/persistence';
import { campaignReducer, initialCampaignState } from '../src/narrative/state-machine';

function stubMediaQueries({ reducedMotion = true, phonePortrait = false } = {}) {
  let portrait = phonePortrait;
  const orientationListeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', vi.fn((query: string) => {
    const orientation = query.includes('orientation: portrait');
    return {
      get matches() {
        return query.includes('prefers-reduced-motion') ? reducedMotion : orientation && portrait;
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        if (orientation) orientationListeners.add(listener);
      }),
      removeEventListener: vi.fn((_event: string, listener: () => void) => orientationListeners.delete(listener)),
      addListener: vi.fn((listener: () => void) => {
        if (orientation) orientationListeners.add(listener);
      }),
      removeListener: vi.fn((listener: () => void) => orientationListeners.delete(listener)),
      dispatchEvent: vi.fn(),
    };
  }));
  return {
    setPhonePortrait(next: boolean) {
      portrait = next;
      orientationListeners.forEach((listener) => listener());
    },
  };
}

function storeCampaign(campaign = initialCampaignState(), overrides: Parameters<typeof createCampaignSave>[1] = {}) {
  const encoded = encodeCampaignSave(createCampaignSave(campaign, overrides));
  if (encoded.status !== 'encoded') throw new Error('Test campaign did not encode.');
  localStorage.setItem(CAMPAIGN_V2_STORAGE_KEY, encoded.value);
}

function readSavedCampaign() {
  const raw = localStorage.getItem(CAMPAIGN_V2_STORAGE_KEY);
  if (!raw) throw new Error('Expected a Campaign v2 save.');
  const decoded = decodeCampaignSave(raw);
  if (decoded.status !== 'restored') throw new Error('Expected a valid Campaign v2 save.');
  return decoded.envelope;
}

function campaignAtIntuitionRating() {
  let state = initialCampaignState();
  state = campaignReducer(state, { type: 'COMPLETE_CUTSCENE' });
  state = campaignReducer(state, { type: 'BEGIN_FROM_TITLE' });
  state = campaignReducer(state, { type: 'COMPLETE_CUTSCENE' });
  state = campaignReducer(state, { type: 'COMPLETE_INTRO' });
  for (const { id } of ACT_ONE_DEFINITION.clues) {
    state = campaignReducer(state, { type: 'DISCOVER_CLUE', clueId: id });
  }
  state = campaignReducer(state, { type: 'START_ALLOCATION' });
  return campaignReducer(state, { type: 'LOCK_INITIAL_VERDICT' });
}

beforeEach(() => {
  localStorage.clear();
  stubMediaQueries();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AdventureShell Campaign v2 integration', () => {
  test('route metadata is canonical, localized, and free of obsolete implementation and metric terms', async () => {
    const en = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    const zh = await generateMetadata({ params: Promise.resolve({ locale: 'zh-TW' }) });

    expect(en).toMatchObject({
      title: 'The Art of Settled Shares',
      description: expect.stringContaining('Cheng Heng'),
    });
    expect(zh).toMatchObject({
      title: expect.stringContaining('定分止爭錄'),
      description: expect.stringContaining('程衡'),
    });
    expect(`${en.title} ${en.description} ${zh.title} ${zh.description}`)
      .not.toMatch(/Three\.js|EF1|EFX|Nash|NSW|納許/);
  });

  test('server rendering is storage-free and keeps a stable loading boundary until mount', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const html = renderToString(<AdventureShell locale="en" />);

    expect(html).toContain('Opening the campaign');
    expect(getItem).not.toHaveBeenCalled();

    render(<AdventureShell locale="en" />);
    expect(await screen.findByRole('button', { name: 'Begin campaign' })).toBeTruthy();
    expect(getItem).toHaveBeenCalled();
  });

  test('a missing save starts fresh while valid progress offers Continue and a confirmed Restart', async () => {
    const user = userEvent.setup();
    const first = render(<AdventureShell locale="en" />);
    expect(await screen.findByRole('button', { name: 'Begin campaign' })).toBeTruthy();
    first.unmount();

    const title = campaignReducer(initialCampaignState(), { type: 'COMPLETE_CUTSCENE' });
    storeCampaign(title);
    render(<AdventureShell locale="en" />);

    const restart = await screen.findByRole('button', { name: 'Restart' });
    await user.click(restart);
    expect(screen.getByRole('heading', { name: 'Restart the campaign?' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep progress' }));
    expect(readSavedCampaign().campaign.phase).toBe('title');

    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(restart);
    expect(screen.getByRole('button', { name: 'Continue campaign' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Restart' }));
    await user.click(screen.getByRole('button', { name: 'Restart campaign' }));
    expect(await screen.findByRole('heading', { name: /Paper story scroll/ })).toBeTruthy();
    await waitFor(() => expect(readSavedCampaign().campaign.phase).toBe('cutscene'));
  });

  test('valid progress continues in place and switching locale does not rewrite it', async () => {
    const user = userEvent.setup();
    const title = campaignReducer(initialCampaignState(), { type: 'COMPLETE_CUTSCENE' });
    storeCampaign(title, { volume: 0.35 });
    render(<AdventureShell locale="en" />);

    const languageLink = await screen.findByRole('link', { name: '繁中' });
    expect(languageLink.getAttribute('href')).toBe('/zh-TW/adventure');
    await user.click(screen.getByRole('button', { name: 'Continue campaign' }));
    expect(screen.getByRole('heading', { name: 'The Art of Settled Shares' })).toBeTruthy();
    expect(readSavedCampaign()).toMatchObject({ campaign: { phase: 'title' }, settings: { volume: 0.35 } });
  });

  test('corrupt storage resets visibly to a recoverable valid save', async () => {
    localStorage.setItem(CAMPAIGN_V2_STORAGE_KEY, '{broken');
    render(<AdventureShell locale="en" />);

    expect(await screen.findByText(/could not be read/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Begin campaign' })).toBeTruthy();
    await waitFor(() => expect(readSavedCampaign().campaign.phase).toBe('cutscene'));
    expect(document.body.textContent).not.toContain('SyntaxError');
  });

  test('legacy progress shows the rebuilt notice once and marks it seen only after acknowledgement', async () => {
    const user = userEvent.setup();
    localStorage.setItem(LEGACY_CAMPAIGN_V1_STORAGE_KEY, '{}');
    render(<AdventureShell locale="en" />);

    expect(await screen.findByRole('heading', { name: 'The campaign has been rebuilt' })).toBeTruthy();
    const acknowledge = screen.getByRole('button', { name: 'Open the rebuilt campaign' });
    expect(document.activeElement).toBe(acknowledge);
    expect(acknowledge.closest('[role="dialog"]')).toBeTruthy();
    expect(document.querySelector('[inert]')).toBeTruthy();
    expect(localStorage.getItem(LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(CAMPAIGN_V2_STORAGE_KEY)).toBeNull();

    await user.click(acknowledge);
    expect(localStorage.getItem(LEGACY_CAMPAIGN_NOTICE_STORAGE_KEY)).toBe('seen');
    const start = screen.getByRole('button', { name: 'Begin campaign' });
    expect(start).toBeTruthy();
    expect(document.activeElement).toBe(start);
    await waitFor(() => expect(readSavedCampaign().version).toBe(2));
  });

  test('storage unavailability is non-technical and does not prevent starting', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const user = userEvent.setup();
    render(<AdventureShell locale="en" />);

    expect(await screen.findByText(/cannot save the campaign right now/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Begin campaign' }));
    expect(await screen.findByRole('heading', { name: /Paper story scroll/ })).toBeTruthy();
    expect(document.body.textContent).not.toContain('SecurityError');
  });

  test('a throwing localStorage getter keeps the campaign usable without repeated access', async () => {
    const localStorageGetter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const user = userEvent.setup();
    render(<AdventureShell locale="en" />);

    expect(await screen.findByText(/cannot save the campaign right now/)).toBeTruthy();
    expect(localStorageGetter).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Begin campaign' }));
    expect(await screen.findByRole('heading', { name: /Paper story scroll/ })).toBeTruthy();
    expect(localStorageGetter).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).not.toContain('SecurityError');
  });

  test('CS-00 completion autosaves watched recall exactly at the title', async () => {
    const user = userEvent.setup();
    render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Begin campaign' }));
    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    const titleHeading = await screen.findByRole('heading', { name: 'The Art of Settled Shares' });
    expect(document.activeElement).toBe(titleHeading);
    await waitFor(() => expect(readSavedCampaign()).toMatchObject({
      campaign: { phase: 'title' },
      recall: { watchedCutsceneSlots: ['cs-00'] },
    }));
  });

  test('pause and portrait gates suspend active CS-00 without advancing or autoplaying on return', async () => {
    cleanup();
    vi.unstubAllGlobals();
    const orientation = stubMediaQueries({ reducedMotion: false, phonePortrait: false });
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<AdventureShell locale="en" />);

    await user.click(await screen.findByRole('button', { name: 'Begin campaign' }));
    await user.click(await screen.findByRole('button', { name: 'Enter the hall' }));
    expect(play).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Open pause menu' }));
    expect(pause).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(play).toHaveBeenCalledTimes(1);

    act(() => orientation.setPhonePortrait(true));
    expect(screen.getByRole('dialog', { name: 'Rotate your phone' })).toBeTruthy();
    fireEvent.ended(document.querySelector('video') as HTMLVideoElement);
    expect(readSavedCampaign().campaign.phase).toBe('cutscene');

    act(() => orientation.setPhonePortrait(false));
    expect(screen.queryByRole('dialog', { name: 'Rotate your phone' })).toBeNull();
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Resume' })).toBeTruthy();
  });

  test('pause settings autosave, replay remounts CS-00, and restart remains confirmed', async () => {
    const user = userEvent.setup();
    render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Begin campaign' }));
    await screen.findByRole('heading', { name: /Paper story scroll/ });
    await user.click(screen.getByRole('button', { name: 'Open pause menu' }));

    expect(screen.getByRole('dialog', { name: 'Campaign paused' })).toBeTruthy();
    await user.click(screen.getByRole('checkbox', { name: 'Subtitles' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: '0.4' } });
    await user.click(screen.getByRole('radio', { name: 'Large' }));
    await waitFor(() => expect(readSavedCampaign().settings).toMatchObject({ subtitles: false, volume: 0.4, textSize: 'large' }));
    expect(document.querySelector('[data-adventure-v2]')?.getAttribute('data-text-size')).toBe('large');

    await user.click(screen.getByRole('button', { name: 'Replay current cutscene' }));
    expect(await screen.findByRole('heading', { name: /Paper story scroll/ })).toBeTruthy();
    expect(readSavedCampaign().campaign.phase).toBe('cutscene');

    await user.click(screen.getByRole('button', { name: 'Open pause menu' }));
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(readSavedCampaign().campaign.phase).toBe('cutscene');
    expect(screen.getByRole('heading', { name: 'Restart the campaign?' })).toBeTruthy();
  });

  test('keeps evidence, valuation controls, and answer submission in one restorable case desk', async () => {
    const user = userEvent.setup();
    const first = render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Begin campaign' }));
    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Open the first case' }));
    await user.click(screen.getByRole('button', { name: 'Begin investigation' }));

    expect(screen.getByRole('heading', { name: 'Act I investigation and allocation', level: 1 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Allocation workbench' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Enter allocation workbench' })).toBeNull();
    expect((screen.getByRole('button', { name: 'Lock Initial Verdict' }) as HTMLButtonElement).disabled).toBe(true);

    for (const name of ['Chen Shouye', 'Chen Congzheng', 'Chen Elder']) {
      await user.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }));
    }
    await user.click(screen.getByRole('button', { name: 'The original Yiwu ruling' }));
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    await user.click(screen.getByRole('button', { name: 'Increase Paddy fields share for Chen Shouye' }));
    await waitFor(() => {
      const saved = readSavedCampaign();
      expect(saved.campaign.phase).toBe('investigation');
      expect(saved.campaign.draftAllocation[0]).toEqual({ goodId: 'paddy-field', shares: [6, 4] });
      expect(saved.recall.firstUseGuidanceCompleted).toBe(true);
    });

    first.unmount();
    render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Continue campaign' }));
    expect(await screen.findByRole('heading', { name: 'Act I investigation and allocation', level: 1 })).toBeTruthy();
    expect(screen.getByRole('slider', { name: /Paddy fields: Chen Shouye, 6 shares; Chen Congzheng, 4 shares/ })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Lock Initial Verdict' }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByRole('heading', { name: 'First time at the workbench' })).toBeNull();
  });

  test('rates, reveals, revises, and updates the live Share Gauge from the reachable shell path', async () => {
    const user = userEvent.setup();
    storeCampaign(campaignAtIntuitionRating());
    render(<AdventureShell locale="en" />);

    await user.click(await screen.findByRole('button', { name: 'Continue campaign' }));
    expect(screen.getByRole('heading', { name: 'Read the judgment in four steps' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Show the whole scroll' }));
    await user.click(screen.getByRole('button', { name: 'Revise once' }));

    expect(screen.getByRole('heading', { name: '得其分 · Proportionality' })).toBeTruthy();
    expect(screen.getByText('Chen Shouye: own outcome 50 of 100')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Increase Paddy fields share for Chen Shouye' }));
    expect(screen.getByText('Chen Shouye: own outcome 56 of 100')).toBeTruthy();
  });

  test('the delivered path reaches the honest investigation boundary without formal metric leakage', async () => {
    const user = userEvent.setup();
    render(<AdventureShell locale="en" />);
    await user.click(await screen.findByRole('button', { name: 'Begin campaign' }));
    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    const title = await screen.findByRole('heading', { name: 'The Art of Settled Shares' });
    expect(document.activeElement).toBe(title);
    await user.click(screen.getByRole('button', { name: 'Open the first case' }));

    const intro = screen.getByRole('heading', { name: /Partition of the Chen Brothers/ });
    expect(document.activeElement).toBe(intro);
    await user.click(screen.getByRole('button', { name: 'Begin investigation' }));
    const boundary = screen.getByRole('heading', { name: 'Act I investigation and allocation' });
    expect(document.activeElement).toBe(boundary);

    await user.click(screen.getByRole('button', { name: 'Open pause menu' }));
    expect(screen.getByText('Discover all four required clues before entering the allocation workbench.')).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/EF1|EFX|Nash|Harmony Score|NSW/);
  });
});
