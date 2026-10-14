/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useState } from 'react';
import { GameStage, type GameStageLabels } from '../src/components/adventure/GameStage';
import { LandscapeGate } from '../src/components/adventure/LandscapeGate';
import { PauseMenu, type PauseMenuProps } from '../src/components/adventure/PauseMenu';

const stageLabels: GameStageLabels = {
  stage: 'Case stage',
  skipToContent: 'Skip to case',
  enterFullscreen: 'Play fullscreen',
  fullscreenActive: 'Fullscreen active',
  fullscreenEntered: 'Fullscreen started',
  fullscreenUnsupported: 'Fullscreen is unavailable',
  fullscreenFailed: 'Fullscreen could not start',
  orientationLockUnsupported: 'Rotation lock is unavailable; play can continue',
  orientationLockFailed: 'Rotation lock was declined; play can continue',
};

const gateLabels = {
  title: 'Rotate your phone',
  description: 'Turn this phone sideways to continue the case.',
};

const pauseLabels = {
  title: 'Case paused',
  continue: 'Continue',
  currentTask: 'Current task',
  controls: 'Controls and help',
  subtitles: 'Subtitles',
  volume: 'Volume',
  replayCurrentCutscene: 'Replay current cutscene',
  recallArchive: 'Recall Archive',
  restart: 'Restart case',
  returnToMenu: 'Return to menu',
  restartConfirmationTitle: 'Restart this case?',
  restartConfirmationBody: 'Current case progress will be replaced.',
  cancelRestart: 'Keep playing',
  confirmRestart: 'Restart now',
};

function stubPhonePortrait(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: '(orientation: portrait) and (max-width: 600px) and (pointer: coarse)',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: () => void) => listeners.delete(listener)),
    addListener: vi.fn((listener: () => void) => listeners.add(listener)),
    removeListener: vi.fn((listener: () => void) => listeners.delete(listener)),
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
  return {
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function StatefulCase() {
  const [count, setCount] = useState(0);
  return <button type="button" onClick={() => setCount((value) => value + 1)}>Evidence {count}</button>;
}

function defaultPauseProps(overrides: Partial<PauseMenuProps> = {}): PauseMenuProps {
  return {
    open: true,
    locale: 'en',
    labels: pauseLabels,
    currentTask: <p>Question the two brothers.</p>,
    controlsHelp: <p>Use Tab to move and Enter to choose.</p>,
    subtitles: true,
    volume: 0.8,
    onContinue: vi.fn(),
    onSubtitlesChange: vi.fn(),
    onVolumeChange: vi.fn(),
    onReplayCurrentCutscene: vi.fn(),
    onRestart: vi.fn(),
    onReturnToMenu: vi.fn(),
    ...overrides,
  };
}

const originalRequestFullscreen = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'requestFullscreen');

function stubRequestFullscreen(implementation: () => Promise<void>) {
  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
    configurable: true,
    value: vi.fn(implementation),
  });
  return HTMLElement.prototype.requestFullscreen as ReturnType<typeof vi.fn>;
}

beforeEach(() => {
  stubPhonePortrait(false);
  if (originalRequestFullscreen) {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', originalRequestFullscreen);
  } else {
    delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen;
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalRequestFullscreen) {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', originalRequestFullscreen);
  } else {
    delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen;
  }
});

describe('LandscapeGate', () => {
  test('small-phone portrait hides and makes underlying controls inert', async () => {
    stubPhonePortrait(true);
    const view = render(
      <LandscapeGate labels={gateLabels}>
        <button type="button">Make allocation</button>
      </LandscapeGate>,
    );

    expect(await screen.findByRole('dialog', { name: gateLabels.title })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Make allocation' })).toBeNull();
    const gatedContent = view.container.querySelector('[inert]');
    expect(gatedContent?.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('dialog', { name: gateLabels.title }));
  });

  test('returning to landscape reveals the same mounted child state', async () => {
    const orientation = stubPhonePortrait(false);
    render(
      <LandscapeGate labels={gateLabels}>
        <StatefulCase />
      </LandscapeGate>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Evidence 0' }));
    expect(screen.getByRole('button', { name: 'Evidence 1' })).toBeTruthy();

    act(() => orientation.setMatches(true));
    expect(screen.queryByRole('button', { name: 'Evidence 1' })).toBeNull();

    act(() => orientation.setMatches(false));
    expect(screen.getByRole('button', { name: 'Evidence 1' })).toBeTruthy();
  });

  test('desktop portrait remains playable because it does not match the phone gate', async () => {
    stubPhonePortrait(false);
    render(
      <LandscapeGate labels={gateLabels}>
        <button type="button">Open dossier</button>
      </LandscapeGate>,
    );

    expect(await screen.findByRole('button', { name: 'Open dossier' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: gateLabels.title })).toBeNull();
  });

  test('inside GameStage the rotate dialog stays in the fullscreen target and gates stage chrome', async () => {
    const orientation = stubPhonePortrait(false);
    const onBlockedChange = vi.fn();
    render(
      <GameStage
        labels={stageLabels}
        landscapeGateLabels={gateLabels}
        onLandscapeBlockedChange={onBlockedChange}
      >
        <button type="button">Open case</button>
      </GameStage>,
    );

    const stage = screen.getByRole('region', { name: stageLabels.stage });
    expect(screen.getByRole('button', { name: 'Open case' })).toBeTruthy();
    act(() => orientation.setMatches(true));

    const gate = screen.getByRole('dialog', { name: gateLabels.title });
    expect(stage.contains(gate)).toBe(true);
    expect(screen.queryByRole('button', { name: 'Open case' })).toBeNull();
    expect(screen.queryByRole('button', { name: stageLabels.enterFullscreen })).toBeNull();
    expect(onBlockedChange).toHaveBeenLastCalledWith(true);

    act(() => orientation.setMatches(false));
    expect(screen.getByRole('button', { name: 'Open case' })).toBeTruthy();
    expect(onBlockedChange).toHaveBeenLastCalledWith(false);
  });
});

describe('GameStage fullscreen controls', () => {
  test('reports an unsupported fullscreen API without hiding play', async () => {
    const user = userEvent.setup();
    render(<GameStage labels={stageLabels}><button type="button">Play case</button></GameStage>);

    await user.click(screen.getByRole('button', { name: stageLabels.enterFullscreen }));

    expect(screen.getByRole('status').textContent).toBe(stageLabels.fullscreenUnsupported);
    expect(screen.getByRole('button', { name: 'Play case' })).toBeTruthy();
  });

  test('reports fullscreen rejection without preventing keyboard play', async () => {
    const user = userEvent.setup();
    stubRequestFullscreen(() => Promise.reject(new DOMException('Denied', 'NotAllowedError')));
    const onPlay = vi.fn();
    render(
      <GameStage labels={stageLabels} backgroundImageSrc="/adventure/plates/court.jpg">
        <button type="button" onClick={onPlay}>Play case</button>
      </GameStage>,
    );

    const fullscreen = screen.getByRole('button', { name: stageLabels.enterFullscreen });
    fullscreen.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe(stageLabels.fullscreenFailed));
    const play = screen.getByRole('button', { name: 'Play case' });
    play.focus();
    await user.keyboard(' ');
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  test('announces fullscreen success and exposes a centered stage main region', async () => {
    const user = userEvent.setup();
    const requestFullscreen = stubRequestFullscreen(() => Promise.resolve());
    render(<GameStage labels={stageLabels}><p>Case content</p></GameStage>);

    expect(screen.getByRole('region', { name: stageLabels.stage })).toBeTruthy();
    const skipLink = screen.getByRole('link', { name: stageLabels.skipToContent });
    expect(skipLink.getAttribute('href')).toMatch(/^#/);

    await user.click(screen.getByRole('button', { name: stageLabels.enterFullscreen }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe(stageLabels.fullscreenEntered));
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button', { name: stageLabels.fullscreenActive }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('main').textContent).toContain('Case content');
  });

  test('orientation lock rejection replaces success with non-blocking feedback', async () => {
    const user = userEvent.setup();
    stubRequestFullscreen(() => Promise.resolve());
    const lock = vi.fn(() => Promise.reject(new DOMException('Denied', 'NotAllowedError')));
    vi.stubGlobal('screen', { orientation: { lock } });
    render(
      <GameStage labels={stageLabels} lockOrientationOnFullscreen>
        <button type="button">Continue case</button>
      </GameStage>,
    );

    await user.click(screen.getByRole('button', { name: stageLabels.enterFullscreen }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe(stageLabels.orientationLockFailed));
    expect(lock).toHaveBeenCalledWith('landscape');
    expect(screen.getByRole('button', { name: 'Continue case' })).toBeTruthy();
  });

  test('missing optional orientation lock is also non-blocking', async () => {
    const user = userEvent.setup();
    stubRequestFullscreen(() => Promise.resolve());
    vi.stubGlobal('screen', { orientation: {} });
    render(
      <GameStage labels={stageLabels} lockOrientationOnFullscreen>
        <button type="button">Continue case</button>
      </GameStage>,
    );

    await user.click(screen.getByRole('button', { name: stageLabels.enterFullscreen }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe(stageLabels.orientationLockUnsupported));
    expect(screen.getByRole('button', { name: 'Continue case' })).toBeTruthy();
  });
});

describe('PauseMenu', () => {
  test('moves focus inside, closes on Escape, and restores launcher focus', async () => {
    const user = userEvent.setup();

    function PauseHarness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open pause</button>
          <PauseMenu {...defaultPauseProps({ open, onContinue: () => setOpen(false) })} />
        </>
      );
    }

    render(<PauseHarness />);
    const launcher = screen.getByRole('button', { name: 'Open pause' });
    await user.click(launcher);

    const continueButton = screen.getByRole('button', { name: pauseLabels.continue });
    await waitFor(() => expect(document.activeElement).toBe(continueButton));
    expect(screen.getByRole('dialog', { name: pauseLabels.title })).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(launcher);
  });

  test('provides semantic settings and calls their callbacks from keyboard controls', async () => {
    const user = userEvent.setup();
    const props = defaultPauseProps();
    render(<PauseMenu {...props} />);

    expect(screen.getByRole('heading', { name: pauseLabels.currentTask })).toBeTruthy();
    expect(screen.getByText('Question the two brothers.')).toBeTruthy();
    expect(screen.getByText('Use Tab to move and Enter to choose.')).toBeTruthy();

    const subtitles = screen.getByRole('checkbox', { name: pauseLabels.subtitles });
    subtitles.focus();
    await user.keyboard(' ');
    expect(props.onSubtitlesChange).toHaveBeenCalledWith(false);

    fireEvent.change(screen.getByRole('slider', { name: pauseLabels.volume }), { target: { value: '0.35' } });
    expect(props.onVolumeChange).toHaveBeenCalledWith(0.35);

    const replay = screen.getByRole('button', { name: pauseLabels.replayCurrentCutscene });
    replay.focus();
    await user.keyboard('{Enter}');
    expect(props.onReplayCurrentCutscene).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: pauseLabels.returnToMenu }));
    expect(props.onReturnToMenu).toHaveBeenCalledTimes(1);
  });

  test('contains keyboard focus and prevents the inert background from reclaiming it', async () => {
    const user = userEvent.setup();
    const outside = document.createElement('button');
    outside.textContent = 'Outside control';
    document.body.append(outside);
    render(<PauseMenu {...defaultPauseProps()} />);

    const first = screen.getByRole('button', { name: pauseLabels.continue });
    const last = screen.getByRole('button', { name: pauseLabels.returnToMenu });
    await waitFor(() => expect(document.activeElement).toBe(first));

    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);

    outside.focus();
    expect(document.activeElement).toBe(first);
    outside.remove();
  });

  test('requires a second explicit action before restart', async () => {
    const user = userEvent.setup();
    const props = defaultPauseProps();
    render(<PauseMenu {...props} />);

    await user.click(screen.getByRole('button', { name: pauseLabels.restart }));

    expect(props.onRestart).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: pauseLabels.restartConfirmationTitle })).toBeTruthy();
    const cancel = screen.getByRole('button', { name: pauseLabels.cancelRestart });
    await waitFor(() => expect(document.activeElement).toBe(cancel));

    await user.click(cancel);
    expect(screen.getByRole('button', { name: pauseLabels.restart })).toBeTruthy();
    expect(props.onRestart).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: pauseLabels.restart }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: pauseLabels.restart })).toBeTruthy();
    expect(props.onContinue).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: pauseLabels.restart }));
    await user.click(screen.getByRole('button', { name: pauseLabels.confirmRestart }));
    expect(props.onRestart).toHaveBeenCalledTimes(1);
  });

  test('omits replay when no current cutscene is available and keeps a keyboard escape route', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<PauseMenu {...defaultPauseProps({ onReplayCurrentCutscene: undefined, onContinue })} />);

    expect(screen.queryByRole('button', { name: pauseLabels.replayCurrentCutscene })).toBeNull();
    await user.tab();
    await user.keyboard('{Escape}');
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
