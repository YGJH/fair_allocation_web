/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { InvestigationDossier } from '../src/components/adventure/InvestigationDossier';
import { ScenePlate } from '../src/components/adventure/ScenePlate';

const clueIds = [
  'clue-chen-shouye-valuations',
  'clue-chen-congzheng-valuations',
  'clue-chen-elder-equal-split',
  'clue-yiwu-original-ruling',
] as const;

afterEach(cleanup);

describe('Act I investigation', () => {
  test('requires and dispatches each canonical clue before entering allocation', () => {
    const onDiscover = vi.fn();
    const onStart = vi.fn();
    const view = render(<InvestigationDossier locale="en" discoveredClueIds={[]} onDiscoverClue={onDiscover} onStartAllocation={onStart} />);

    expect(screen.getByRole('button', { name: 'Enter allocation workbench' }).hasAttribute('disabled')).toBe(true);
    const clues = screen.getAllByRole('button', { name: /Interview/ });
    clues.forEach((clue) => fireEvent.click(clue));
    expect(onDiscover).toHaveBeenCalledTimes(4);
    expect(onDiscover.mock.calls.map(([id]) => id)).toEqual(clueIds);

    view.rerender(<InvestigationDossier locale="en" discoveredClueIds={[...clueIds]} onDiscoverClue={onDiscover} onStartAllocation={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enter allocation workbench' }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('uses a readable paper fallback and semantic clue hotspots', () => {
    const onActivate = vi.fn();
    render(
      <ScenePlate
        locale="en"
        name="Second Hall"
        description="The case is heard here."
        fallbackLabel="Scene plate unavailable."
        hotspotsLabel="Scene clues"
        hotspots={[{ id: clueIds[0], label: 'Chen Shouye’s valuations', onActivate }]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Second Hall. Scene plate unavailable.' })).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'The case is heard here.' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Chen Shouye’s valuations' }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  test('renders both locales from typed adventure copy', () => {
    const onDiscover = vi.fn();
    const { rerender } = render(<InvestigationDossier locale="en" discoveredClueIds={[]} onDiscoverClue={onDiscover} onStartAllocation={vi.fn()} />);
    expect(screen.getByText('Investigation task')).toBeTruthy();
    rerender(<InvestigationDossier locale="zh-TW" discoveredClueIds={[]} onDiscoverClue={onDiscover} onStartAllocation={vi.fn()} />);
    expect(screen.getByText('搜證任務')).toBeTruthy();
  });
});
