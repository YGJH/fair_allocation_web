/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { AllocationEditor } from '../src/components/AllocationEditor';
import { Leaderboard } from '../src/components/Leaderboard';

const sample = { agents: ['A', 'B'], items: ['x', 'y'], values: [[3, 0], [0, 2]] };

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('allocation requires every item and reports progress', () => {
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  const submit = screen.getByRole('button', { name: /continue to intuition/i }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);
  expect(screen.getByText(/assign every item/i)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('x owner'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('y owner'), { target: { value: '1' } });
  expect(submit.disabled).toBe(false);
  expect(screen.getByText(/every item has an owner/i)).toBeTruthy();
});

test('failed allocation submission keeps every assignment', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  fireEvent.change(screen.getByLabelText('x owner'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('y owner'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: /continue to intuition/i }));
  expect((await screen.findByRole('alert')).textContent).toMatch(/retry/i);
  expect((screen.getByLabelText('x owner') as HTMLSelectElement).value).toBe('0');
  expect((screen.getByLabelText('y owner') as HTMLSelectElement).value).toBe('1');
});

test('leaderboard rows link to their rating-first detail', () => {
  render(<Leaderboard locale="zh-TW" rows={[{ id: 'a', kind: 'visitor', nsw: '10', owners: [0] }]} />);
  expect(screen.getByRole('link', { name: /精確 NSW 10/ }).getAttribute('href')).toBe('/zh-TW/allocations/a');
});
