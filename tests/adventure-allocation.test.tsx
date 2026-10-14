/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { AllocationWorkbench } from '../src/components/adventure/AllocationWorkbench';
import type { CampaignAllocation } from '../src/narrative/types';
import { createCampaignSave, decodeCampaignSave, encodeCampaignSave } from '../src/narrative/persistence';
import { initialCampaignState } from '../src/narrative/state-machine';
import { analyzeActTwoAllocation } from '../src/narrative/campaign-rules';

const half: CampaignAllocation = [
  { goodId: 'paddy-field', shares: [5, 5] },
  { goodId: 'oil-tea-hillside', shares: [5, 5] },
  { goodId: 'silver', shares: [5, 5] },
];

function WorkbenchHarness({ guidanceCompleted = true, initialAllocation = half, act = 1, onAllocationChange }: { guidanceCompleted?: boolean; initialAllocation?: CampaignAllocation; act?: 1 | 2; onAllocationChange?: (allocation: CampaignAllocation) => void }) {
  const [allocation, setAllocation] = useState<CampaignAllocation>(initialAllocation);
  const changeAllocation = (next: CampaignAllocation) => { setAllocation(next); onAllocationChange?.(next); };
  return (
    <AllocationWorkbench
      locale="en"
      act={act}
      allocation={allocation}
      canLock
      guidanceCompleted={guidanceCompleted}
      onCompleteGuidance={vi.fn()}
      onChange={changeAllocation}
      onLock={vi.fn()}
      onReturn={vi.fn()}
    />
  );
}

afterEach(cleanup);

describe('Act I allocation workbench', () => {
  test('keeps all three goods at ten shares while plus/minus and real keyboard controls operate', async () => {
    const user = userEvent.setup();
    render(<WorkbenchHarness />);

    await user.click(screen.getByRole('button', { name: 'Increase Paddy fields share for Chen Shouye' }));
    const paddy = screen.getByRole('slider', { name: /Paddy fields: Chen Shouye, 6 shares; Chen Congzheng, 4 shares/ });
    expect(paddy.getAttribute('aria-valuetext')).toBe('Paddy fields: Chen Shouye, 6 shares; Chen Congzheng, 4 shares');
    await user.click(paddy);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('slider', { name: /Paddy fields: Chen Shouye, 5 shares; Chen Congzheng, 5 shares/ })).toBeTruthy();

    expect(screen.getAllByRole('slider')).toHaveLength(3);
    for (const slider of screen.getAllByRole('slider')) {
      const values = slider.getAttribute('aria-valuetext')?.match(/(\d+) shares/g)?.map((value) => Number(value.split(' ')[0])) ?? [];
      expect(values[0] + values[1]).toBe(10);
    }
  });

  test('announces canonical edge-triggered reactions without formal metrics', async () => {
    const user = userEvent.setup();
    render(<WorkbenchHarness />);
    const increaseYounger = screen.getByRole('button', { name: 'Increase Paddy fields share for Chen Congzheng' });
    await user.click(increaseYounger);
    expect(screen.getByRole('status').textContent).toContain('Chen Shouye crouches down, holding his head in silence.');
    await user.click(increaseYounger);
    expect(screen.getAllByText('Chen Shouye crouches down, holding his head in silence.').length).toBe(1);
    await user.click(screen.getByRole('button', { name: 'Decrease Paddy fields share for Chen Congzheng' }));
    await user.click(screen.getByRole('button', { name: 'Decrease Paddy fields share for Chen Congzheng' }));
    expect(screen.queryByRole('status')).toBeNull();

    for (let index = 0; index < 5; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Increase Paddy fields share for Chen Shouye' }));
      await user.click(screen.getByRole('button', { name: 'Increase Silver share for Chen Congzheng' }));
    }
    expect(screen.getByRole('status').textContent).toContain('For the first time, the brothers look at each other.');
    expect(document.body.textContent).not.toMatch(/utilities|proportionality|NSW|EF1|EFX|Grade|frontier/i);
  });

  test('resolves Paddy mutations by goodId after a shuffled persisted reload', async () => {
    const shuffled: CampaignAllocation = [
      { goodId: 'silver', shares: [5, 5] },
      { goodId: 'paddy-field', shares: [5, 5] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
    ];
    const encoded = encodeCampaignSave(createCampaignSave({ ...initialCampaignState(), phase: 'allocation', cutscene: null, draftAllocation: shuffled }));
    expect(encoded.status).toBe('encoded');
    if (encoded.status !== 'encoded') return;
    const decoded = decodeCampaignSave(encoded.value);
    expect(decoded.status).toBe('restored');
    if (decoded.status !== 'restored') return;

    const user = userEvent.setup();
    render(<WorkbenchHarness initialAllocation={decoded.envelope.campaign.draftAllocation} />);
    await user.click(screen.getByRole('button', { name: 'Increase Paddy fields share for Chen Shouye' }));

    expect(screen.getByRole('slider', { name: /Paddy fields: Chen Shouye, 6 shares; Chen Congzheng, 4 shares/ })).toBeTruthy();
    expect(screen.getByRole('slider', { name: /Silver: Chen Shouye, 5 shares; Chen Congzheng, 5 shares/ })).toBeTruthy();
    expect(screen.getByRole('slider', { name: /Oil-tea hills: Chen Shouye, 5 shares; Chen Congzheng, 5 shares/ })).toBeTruthy();
  });

  test('announces the silver-to-elder edge reaction after crossing five shares', async () => {
    const user = userEvent.setup();
    render(<WorkbenchHarness />);
    const increaseElder = screen.getByRole('button', { name: 'Increase Silver share for Chen Shouye' });
    await user.click(increaseElder);
    expect(screen.getByRole('status').textContent).toContain('Chen Congzheng smiles bitterly');
    await user.click(increaseElder);
    expect(screen.getAllByText(/Chen Congzheng smiles bitterly/).length).toBe(1);
  });

  test('shows and dismisses first-use guidance', async () => {
    const user = userEvent.setup();
    const onCompleteGuidance = vi.fn();
    render(<AllocationWorkbench locale="en" allocation={half} canLock guidanceCompleted={false} onCompleteGuidance={onCompleteGuidance} onChange={vi.fn()} onLock={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'First time at the workbench' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onCompleteGuidance).toHaveBeenCalledTimes(1);
  });

  test('does not expose a lock control when required clues are incomplete', () => {
    const onLock = vi.fn();
    render(<AllocationWorkbench locale="zh-TW" allocation={half} canLock={false} guidanceCompleted onCompleteGuidance={vi.fn()} onChange={vi.fn()} onLock={onLock} onReturn={vi.fn()} />);
    const lock = screen.getByRole('button', { name: '鎖定初判' });
    expect(lock.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('請先完成四項必要線索，才能鎖定初判。')).toBeTruthy();
  });
});

describe('Act II allocation workbench', () => {
  test('transfers raw silk shares deterministically to reach the canonical 2/2/6 compensation path', async () => {
    const user = userEvent.setup();
    const initialActTwo: CampaignAllocation = [
      { goodId: 'loom-workshop', shares: [], owner: 2 },
      { goodId: 'mulberry-fields', shares: [10, 0, 0] },
      { goodId: 'cash-silver', shares: [0, 10, 0] },
      { goodId: 'raw-silk', shares: [0, 0, 10] },
    ];
    let finalAllocation = initialActTwo;
    render(<WorkbenchHarness act={2} initialAllocation={initialActTwo} onAllocationChange={(next) => { finalAllocation = next; }} />);
    const rawSilk = () => screen.getAllByRole('slider').slice(-3);
    fireEvent.change(rawSilk()[0], { target: { value: '2' } });
    expect(rawSilk()[0].getAttribute('aria-label')).toBe('Pei Boqian: 2/10 shares');
    expect(rawSilk()[1].getAttribute('aria-label')).toBe('Pei Zhongwen: 0/10 shares');
    expect(rawSilk()[2].getAttribute('aria-label')).toBe('Xue Shoucheng: 8/10 shares');
    fireEvent.change(rawSilk()[1], { target: { value: '2' } });
    expect(rawSilk()[0].getAttribute('aria-label')).toBe('Pei Boqian: 2/10 shares');
    expect(rawSilk()[1].getAttribute('aria-label')).toBe('Pei Zhongwen: 2/10 shares');
    expect(rawSilk()[2].getAttribute('aria-label')).toBe('Xue Shoucheng: 6/10 shares');
    expect((screen.getByRole('radio', { name: 'Xue Shoucheng' }) as HTMLInputElement).checked).toBe(true);
    expect(analyzeActTwoAllocation(finalAllocation).utilities.map(Number)).toEqual([44, 44, 68]);
  });
});
