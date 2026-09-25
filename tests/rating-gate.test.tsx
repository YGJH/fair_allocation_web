/** @vitest-environment jsdom */
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { RatingGate } from '../src/components/RatingGate';
import { Leaderboard } from '../src/components/Leaderboard';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE, EXAMPLE_CASE_ID, EXAMPLE_OWNERS, EXAMPLE_SCORE } from '../src/shared/example';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

test('no metrics or aggregate network request before rating succeeds', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  render(<RatingGate locale="en" allocationId="00000000-0000-0000-0000-000000000000" caseData={{ agents: ['A'], items: ['x'], values: [[1]] }} owners={[0]} />);
  expect(screen.queryByText(/Nash social welfare/i)).toBeNull();
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(screen.getAllByRole('radio')).toHaveLength(5);
});

test('leaderboard ties exact strings', () => {
  render(<Leaderboard locale="en" rows={[{ id: 'a', kind: 'visitor', nsw: '0', owners: [] }, { id: 'b', kind: 'baseline', nsw: '0', owners: [] }]} />);
  expect(screen.getAllByText(/#1/)).toHaveLength(2);
});

test('a successful vote reveals localized results and stores browser marker', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ score: { utilities: ['8', '13'], nsw: '104', ef1: true, efx: true }, aggregate: { count: 2, mean: 4, histogram: [0, 0, 1, 0, 1] }, caseId: 'c' }) } as Response);
  render(<RatingGate locale="zh-TW" allocationId="a" caseData={{ agents: ['Maya', 'Leo'], items: ['x'], values: [[8], [13]] }} owners={[0]} />);
  expect(screen.queryByText('104')).toBeNull();
  fireEvent.click(screen.getByRole('radio', { name: /5.*非常公平/ }));
  fireEvent.click(screen.getByRole('button', { name: '提交評分' }));
  expect(await screen.findByText('104')).toBeTruthy();
  expect(localStorage.getItem('fair-rated:a')).toBe('1');
  expect(screen.queryAllByText(/Votes:|mean:|witness:|true|false/)).toHaveLength(0);
});

test('a failed vote retains the selected value without revealing results', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
  render(<RatingGate locale="en" allocationId="a" caseData={{ agents: ['A'], items: ['x'], values: [[1]] }} owners={[0]} />);
  const rating = screen.getByRole('radio', { name: /4.*fair/i });
  fireEvent.click(rating);
  fireEvent.click(screen.getByRole('button', { name: 'Submit rating' }));
  await screen.findByRole('alert');
  expect((rating as HTMLInputElement).checked).toBe(true);
  expect(screen.queryByText(/Nash social welfare/i)).toBeNull();
  expect(localStorage.getItem('fair-rated:a')).toBeNull();
});

test('the curated example offers an explicit local reveal after a failed vote', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
  render(<RatingGate locale="en" allocationId={EXAMPLE_ALLOCATION_ID} caseId={EXAMPLE_CASE_ID} caseData={EXAMPLE_CASE} owners={EXAMPLE_OWNERS} fallbackResult={{ score: EXAMPLE_SCORE, caseId: EXAMPLE_CASE_ID }} />);
  fireEvent.click(screen.getByRole('radio', { name: /3.*unsure/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit rating' }));
  const reveal = await screen.findByRole('button', { name: /reveal result/i });
  expect(screen.queryByText('104')).toBeNull();
  fireEvent.click(reveal);
  expect(await screen.findByText('104')).toBeTruthy();
  expect(screen.queryByRole('heading', { name: /community responses/i })).toBeNull();
  expect(localStorage.getItem(`fair-rated-local:${EXAMPLE_ALLOCATION_ID}`)).toBe('1');
});
