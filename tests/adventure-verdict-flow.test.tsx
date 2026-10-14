/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CaseScrollDebrief } from '../src/components/adventure/CaseScrollDebrief';
import { JudgmentGate } from '../src/components/adventure/JudgmentGate';
import { AllocationWorkbench } from '../src/components/adventure/AllocationWorkbench';
import { ShareGauge } from '../src/components/adventure/ShareGauge';
import type { CampaignVerdict } from '../src/narrative/types';

const verdict: CampaignVerdict = {
  allocation: [
    { goodId: 'paddy-field', shares: [5, 5] },
    { goodId: 'oil-tea-hillside', shares: [5, 5] },
    { goodId: 'silver', shares: [5, 5] },
  ],
  metrics: {
    utilities: [50, 50],
    nsw: '2500',
    proportionality: true,
    ef: true,
    ef1: true,
    efx: true,
  },
};

const oneSidedVerdict: CampaignVerdict = {
  ...verdict,
  metrics: {
    ...verdict.metrics,
    utilities: [100, 0],
    nsw: '0',
    proportionality: false,
    ef: false,
  },
};

afterEach(cleanup);

describe('IP-6 verdict flow components', () => {
  test('keeps formal terms out of the rating boundary and submits once from keyboard controls', async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();
    render(<JudgmentGate locale="en" onRate={onRate} />);

    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(document.body.textContent).not.toMatch(/Share Gauge|NSW|EF1|EFX|proportionality|envy gap|Master Seal|frontier|Grade/i);

    const rating = screen.getByRole('button', { name: 'Intuition rating 3' });
    rating.focus();
    await user.keyboard('{Enter}');
    expect(rating.getAttribute('aria-pressed')).toBe('true');
    const submit = screen.getByRole('button', { name: 'Submit intuition rating' });
    await user.click(submit);
    await user.click(submit);
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith(3);
  });

  test('reveals the Case Scroll in order and records a show-all completion', async () => {
    const user = userEvent.setup();
    const onWatched = vi.fn();
    render(
      <CaseScrollDebrief
        locale="en"
        verdict={verdict}
        watched={false}
        onWatched={onWatched}
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'The brothers’ outcomes' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: '得其分 · Proportionality' })).toBeNull();
    await user.click(screen.getByText('How the clerk adds the subjective values'));
    expect(screen.getByText(/uᵢ\(Aᵢ\) = Σ vᵢ\(g\)/)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Envy · EF' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open next fold' }));
    expect(screen.getAllByRole('heading', { name: '得其分 · Proportionality' })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Open next fold' }));
    expect(screen.getByRole('heading', { name: 'Envy · EF' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open next fold' }));
    expect(screen.getByRole('heading', { name: 'The clerk’s short conclusion' })).toBeTruthy();
    expect(onWatched).toHaveBeenCalled();
  });

  test('reports one-sided proportionality failures without claiming both brothers are below due', async () => {
    const user = userEvent.setup();
    render(<CaseScrollDebrief locale="en" verdict={oneSidedVerdict} watched onWatched={vi.fn()} onContinue={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Show the whole scroll' }));
    expect(screen.getByText('At least one brother falls below his due share.')).toBeTruthy();
    expect(screen.getByText(/At least one brother falls below his due share; the scroll records/)).toBeTruthy();
    expect(screen.queryByText(/both brothers short of their due|Neither brother reaches his due share/i)).toBeNull();
  });

  test('updates the accessible live Share Gauge when a revision draft changes', () => {
    const { rerender } = render(<ShareGauge locale="en" verdict={verdict} />);
    expect(screen.getByText('Chen Shouye: own outcome 50 of 100')).toBeTruthy();

    rerender(<ShareGauge locale="en" verdict={{ ...verdict, metrics: { ...verdict.metrics, utilities: [70, 30] } }} />);
    expect(screen.getByText('Chen Shouye: own outcome 70 of 100')).toBeTruthy();
    expect(screen.getByRole('img', { name: /Chen Shouye: 70%/ })).toBeTruthy();
  });

  test('show all is one explicit action and Revision mode keeps the return route and formal metrics sealed', async () => {
    const user = userEvent.setup();
    const onWatched = vi.fn();
    const onLock = vi.fn();
    render(
      <>
        <CaseScrollDebrief locale="en" verdict={verdict} watched onWatched={onWatched} onContinue={vi.fn()} />
        <AllocationWorkbench
          locale="en"
          allocation={verdict.allocation}
          canLock
          revisionMode
          onChange={vi.fn()}
          onLock={onLock}
          onReturn={vi.fn()}
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Show the whole scroll' }));
    expect(screen.getByRole('heading', { name: 'The clerk’s short conclusion' })).toBeTruthy();
    expect(onWatched).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Return to investigation' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Lock Final Verdict' })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/utilities|NSW|EF1|EFX|Grade|frontier/i);
  });
});
