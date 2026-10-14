/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vitest';
import { CutscenePlayer } from '../src/components/adventure/CutscenePlayer';
import { adventureCopy } from '../src/i18n/adventure';
import {
  AUTHORED_CUTSCENE_SLOTS,
  AVAILABLE_CUTSCENE_SLOTS,
  CS00_VISUAL_ONLY_TRANSCRIPT_KEYS,
  CUTSCENE_SLOTS,
  cutsceneManifest,
  type AvailableCutsceneSlot,
} from '../src/narrative/media-manifest';

const defaultSettings = { subtitles: true, volume: 0.8 } as const;

function stubMotionPreference(reduce: boolean) {
  let matches = reduce;
  const listeners = new Set<() => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: () => void) => listeners.delete(listener)),
    addListener: vi.fn((listener: () => void) => listeners.add(listener)),
    removeListener: vi.fn((listener: () => void) => listeners.delete(listener)),
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
  return {
    mediaQuery,
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function renderPlayer(overrides: Partial<React.ComponentProps<typeof CutscenePlayer>> = {}) {
  const props: React.ComponentProps<typeof CutscenePlayer> = {
    slot: 'cs-00',
    locale: 'en',
    settings: defaultSettings,
    onSubtitlesChange: vi.fn(),
    onVolumeChange: vi.fn(),
    onComplete: vi.fn(),
    ...overrides,
  };
  return { ...render(<CutscenePlayer {...props} />), props };
}

beforeEach(() => {
  stubMotionPreference(false);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('CutscenePlayer', () => {
  test('does not play before the enter gesture and starts playback from that gesture', async () => {
    renderPlayer();
    const play = vi.mocked(HTMLMediaElement.prototype.play);

    expect(play).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));

    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    const video = document.querySelector('video') as HTMLVideoElement;
    video.currentTime = 31;
    fireEvent.timeUpdate(video);
    expect(screen.getByText('Cheng Heng: Your servant does not know whom Your Majesty should heed.')).toBeTruthy();
  });

  test('a rejected play request exposes retry and static alternatives', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new DOMException('Playback was blocked', 'NotAllowedError'),
    );
    renderPlayer();

    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Use static version' })).toBeTruthy();
  });

  test('ended and skip can complete the cutscene only once', async () => {
    const onComplete = vi.fn();
    const view = renderPlayer({ onComplete });
    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));

    fireEvent.ended(view.container.querySelector('video') as HTMLVideoElement);
    fireEvent.click(screen.getByRole('button', { name: 'Skip cutscene' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('reports subtitle and volume setting changes through callbacks', async () => {
    const onSubtitlesChange = vi.fn();
    const onVolumeChange = vi.fn();
    renderPlayer({ onSubtitlesChange, onVolumeChange });

    fireEvent.click(await screen.findByRole('button', { name: 'Subtitles on' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mute' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: '0.4' } });

    expect(onSubtitlesChange).toHaveBeenCalledWith(false);
    expect(onVolumeChange).toHaveBeenNthCalledWith(1, 0);
    expect(onVolumeChange).toHaveBeenNthCalledWith(2, 0.4);
    expect(screen.getByRole('button', { name: 'Subtitles off' }).getAttribute('aria-pressed')).toBe('false');
  });

  test('offers retry and a complete static fallback after a media error', async () => {
    const onComplete = vi.fn();
    const view = renderPlayer({ onComplete });
    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));
    const video = view.container.querySelector('video') as HTMLVideoElement;

    fireEvent.error(video);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);

    fireEvent.error(video);
    fireEvent.click(screen.getByRole('button', { name: 'Use static version' }));
    expect(screen.getByRole('heading', { name: 'Paper fallback · CS-00' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Complete cutscene transcript' })).toBeTruthy();
    expect(screen.getByText(/All my life, I have done nothing else/)).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('reduced motion never renders a video and continues from the complete transcript', async () => {
    cleanup();
    vi.unstubAllGlobals();
    stubMotionPreference(true);
    const onComplete = vi.fn();
    renderPlayer({ onComplete });

    expect(await screen.findByRole('heading', { name: 'Paper fallback · CS-00' })).toBeTruthy();
    expect(document.querySelector('video')).toBeNull();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByText('Six years earlier.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test.each(['cs-01', 'cs-02', 'cs-03'] as const)('%s static fallback exposes its complete transcript and continues', async (slot) => {
    const onComplete = vi.fn();
    renderPlayer({ slot, onComplete });
    expect(await screen.findByRole('heading', { name: `Paper fallback · ${slot.toUpperCase()}` })).toBeTruthy();
    expect(screen.getByRole('list')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('live reduced-motion changes remove media and remount it behind a fresh gate', async () => {
    const motion = stubMotionPreference(false);
    const view = renderPlayer();
    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));
    const firstVideo = view.container.querySelector('video') as HTMLVideoElement;

    expect(firstVideo).toBeTruthy();
    firstVideo.currentTime = 18;
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    act(() => motion.setMatches(true));

    expect(await screen.findByRole('heading', { name: 'Paper fallback · CS-00' })).toBeTruthy();
    expect(view.container.querySelector('video')).toBeNull();
    expect(firstVideo.currentTime).toBe(0);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);

    act(() => motion.setMatches(false));

    const enter = await screen.findByRole('button', { name: 'Enter the hall' });
    const remountedVideo = view.container.querySelector('video');
    expect(remountedVideo).toBeTruthy();
    expect(remountedVideo).not.toBe(firstVideo);
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull();
    expect((screen.getByRole('button', { name: 'Resume' }) as HTMLButtonElement).disabled).toBe(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    fireEvent.click(enter);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });

  test('controlled suspension pauses active media, blocks completion, and requires an explicit resume', async () => {
    const onComplete = vi.fn();
    const view = renderPlayer({ onComplete });
    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    view.rerender(<CutscenePlayer {...view.props} suspended />);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    fireEvent.ended(view.container.querySelector('video') as HTMLVideoElement);
    expect(onComplete).not.toHaveBeenCalled();

    view.rerender(<CutscenePlayer {...view.props} suspended={false} />);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });

  test('replay restarts the media without advancing campaign progress', async () => {
    const onComplete = vi.fn();
    renderPlayer({ onComplete });
    fireEvent.click(await screen.findByRole('button', { name: 'Enter the hall' }));
    fireEvent.click(screen.getByRole('button', { name: 'Replay' }));

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('meaningful controls support native keyboard activation', async () => {
    const user = userEvent.setup();
    const onVolumeChange = vi.fn();
    renderPlayer({ onVolumeChange });

    const enter = await screen.findByRole('button', { name: 'Enter the hall' });
    await waitFor(() => expect(document.activeElement).toBe(enter));
    await user.keyboard('{Enter}');
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    const pause = screen.getByRole('button', { name: 'Pause' });
    pause.focus();
    await user.keyboard(' ');
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);

    const resume = screen.getByRole('button', { name: 'Resume' });
    resume.focus();
    await user.keyboard('{Enter}');
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);

    const mute = screen.getByRole('button', { name: 'Mute' });
    mute.focus();
    await user.keyboard('{Enter}');
    expect(onVolumeChange).toHaveBeenCalledWith(0);
  });

  test('exposes semantic controls and restores focus when leaving', async () => {
    const launcher = document.createElement('button');
    launcher.textContent = 'Launch prologue';
    document.body.append(launcher);
    launcher.focus();
    const onComplete = vi.fn();
    const view = renderPlayer({ onComplete });

    const enter = await screen.findByRole('button', { name: 'Enter the hall' });
    await waitFor(() => expect(document.activeElement).toBe(enter));
    fireEvent.click(enter);

    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mute' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Subtitles on' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Skip cutscene' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Skip cutscene' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(launcher);

    view.unmount();
    expect(document.activeElement).toBe(launcher);
    launcher.remove();
  });
});

test('only available manifest slots can reach CutscenePlayer', () => {
  expectTypeOf<React.ComponentProps<typeof CutscenePlayer>['slot']>()
    .toEqualTypeOf<AvailableCutsceneSlot>();
  expectTypeOf<AvailableCutsceneSlot>().toEqualTypeOf<'cs-00' | 'cs-01' | 'cs-02' | 'cs-03'>();
  expect(AVAILABLE_CUTSCENE_SLOTS).toEqual(['cs-00', 'cs-01', 'cs-02', 'cs-03']);
  expect(Object.keys(cutsceneManifest)).toEqual(AVAILABLE_CUTSCENE_SLOTS);
  expect(Object.hasOwn(cutsceneManifest, 'cs-01')).toBe(true);
  for (const slot of AVAILABLE_CUTSCENE_SLOTS) {
    expect(cutsceneManifest[slot].slot).toBe(slot);
    expect(cutsceneManifest[slot].media.fallback.imageSrc).toBeTruthy();
  }
});

test('the stable slots, localized keys, and CS-00 cue keys stay in parity', () => {
  expect(CUTSCENE_SLOTS).toEqual(Array.from({ length: 15 }, (_, index) => `cs-${String(index).padStart(2, '0')}`));

  const en = adventureCopy.en;
  const zh = adventureCopy['zh-TW'];
  expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
  expect(Object.keys(en.cues).sort()).toEqual(Object.keys(zh.cues).sort());
  expect(Object.keys(en.transcript).sort()).toEqual(Object.keys(zh.transcript).sort());

  const cs00 = cutsceneManifest['cs-00'];
  expect(cs00.media.durationSeconds).toBe(64.454);
  expect(cs00.cues.at(-1)?.endSeconds).toBe(64.454);
  expect(cs00.cues.slice(-4).map(({ textKey }) => textKey)).toEqual([
    'narratorRabbits', 'narratorLife', 'narratorFirstCase', 'sixYearsEarlier',
  ]);
  expect(cs00.cues.find(({ textKey }) => textKey === 'title')).toMatchObject({
    startSeconds: 56.5,
    endSeconds: 56.9,
  });
  const normalCaptionKeys = new Set(cs00.cues.map(({ textKey }) => textKey));
  const visualOnlyKeys = new Set(CS00_VISUAL_ONLY_TRANSCRIPT_KEYS);
  for (const transcriptKey of cs00.media.fallback.transcriptKeys) {
    if (visualOnlyKeys.has(transcriptKey as typeof CS00_VISUAL_ONLY_TRANSCRIPT_KEYS[number])) continue;
    expect(normalCaptionKeys.has(transcriptKey as typeof cs00.cues[number]['textKey'])).toBe(true);
  }
  expect(cs00.cues.every(({ startSeconds, endSeconds }) => startSeconds >= 0 && endSeconds <= 64.454 && startSeconds < endSeconds)).toBe(true);
  for (const cue of cs00.cues) {
    expect(en.cues[cue.textKey]).toBeTruthy();
    expect(zh.cues[cue.textKey]).toBeTruthy();
  }
  for (const key of ['fallbackTitleBySlot', 'fallbackHeadingBySlot', 'fallbackAltBySlot'] as const) {
    expect(Object.keys(en[key]).sort()).toEqual([...CUTSCENE_SLOTS].sort());
    expect(Object.keys(zh[key]).sort()).toEqual([...CUTSCENE_SLOTS].sort());
  }
  expect(en.fallbackTitleBySlot['cs-01']).not.toBe(en.fallbackTitleBySlot['cs-00']);
  expect(zh.fallbackTitleBySlot['cs-01']).not.toBe(zh.fallbackTitleBySlot['cs-00']);
  for (const slot of AUTHORED_CUTSCENE_SLOTS) {
    const entry = cutsceneManifest[slot];
    expect(entry.media.fallback.imageSrc).toBeTruthy();
    expect(entry.media.fallback.transcriptKeys.length).toBeGreaterThan(0);
    expect(en.fallbackTitleBySlot[slot]).toBeTruthy();
    expect(zh.fallbackTitleBySlot[slot]).toBeTruthy();
    expect(en.fallbackHeadingBySlot[slot]).toContain(slot.toUpperCase());
    expect(zh.fallbackHeadingBySlot[slot]).toContain(slot.toUpperCase());
    expect(en.fallbackAltBySlot[slot]).toBeTruthy();
    expect(zh.fallbackAltBySlot[slot]).toBeTruthy();
    for (const key of entry.media.fallback.transcriptKeys) {
      expect(en.transcript[key]).toBeTruthy();
      expect(zh.transcript[key]).toBeTruthy();
    }
  }
});
