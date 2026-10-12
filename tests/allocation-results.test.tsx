/** @vitest-environment jsdom */
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { expect, test, vi, afterEach } from 'vitest';
import { AllocationResults } from '../src/components/AllocationResults';
import { EXAMPLE_CASE, EXAMPLE_CASE_ID, EXAMPLE_OWNERS, EXAMPLE_SCORE } from '../src/shared/example';

vi.mock('../src/components/FractionalComparison', () => ({ FractionalComparison: () => null }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('an allocation reveals its mathematical result immediately without a fairness rating', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  render(<AllocationResults locale="en" caseId={EXAMPLE_CASE_ID} caseData={EXAMPLE_CASE} owners={EXAMPLE_OWNERS} score={EXAMPLE_SCORE} />);

  expect(screen.getByRole('heading', { name: 'Your allocation, measured' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'See how the three checks work' })).toBeTruthy();
  expect(screen.queryAllByRole('radio')).toHaveLength(0);
  expect(screen.queryByRole('button', { name: /submit rating/i })).toBeNull();
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('a completed case keeps the animated explanation and links to every other case', () => {
  render(<AllocationResults locale="en" caseId={EXAMPLE_CASE_ID} caseData={EXAMPLE_CASE} owners={EXAMPLE_OWNERS} score={EXAMPLE_SCORE} />);

  fireEvent.click(screen.getByRole('tab', { name: 'NSW' }));
  expect(screen.getByLabelText('8 × 13 = 104')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Fairness is harder to create than it first appears.' })).toBeTruthy();
  expect(screen.getByRole('region', { name: 'Try another allocation' })).toBeTruthy();
  expect(screen.getAllByRole('link', { name: /Play this case/ })).toHaveLength(5);
  expect(screen.queryByRole('link', { name: /Case 01/ })).toBeNull();
  expect(screen.getByRole('link', { name: /Case 03.*Alice: 60, 40, 0; Bob: 100, 1, 1/ })).toBeTruthy();
});

test('regular allocations also show the replayable EF1, EFX, and NSW walkthrough', () => {
  render(<AllocationResults
    locale="zh-TW"
    caseId="11111111-1111-4111-8111-111111111111"
    caseData={{ agents: ['A', 'B'], items: ['x', 'y'], values: [[3, 0], [0, 2]] }}
    owners={[0, 1]}
    score={{ utilities: ['3', '2'], nsw: '6', ef1: true, efx: true }}
    standing={{ rank: 2, total: 5, tied: 1, beatPercent: 75 }}
  />);

  expect(screen.getByRole('heading', { name: '看看三種檢查方式' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: '超越同案例 75% 的其他分配' })).toBeTruthy();
  expect(screen.getByText('#2 / 5')).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'EFX' }));
  expect(screen.getByText('移除任一重視的物品後，羨慕消失。')).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'NSW' }));
  expect(screen.getByLabelText('3 × 2 = 6')).toBeTruthy();
  expect(screen.getByRole('button', { name: '再播放一次' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: '現在你知道，要達到公平並不簡單。' })).toBeTruthy();
  expect(screen.queryAllByRole('radio')).toHaveLength(0);
});

test('the first visitor allocation does not claim a made-up percentile', () => {
  render(<AllocationResults
    locale="en"
    caseId="11111111-1111-4111-8111-111111111111"
    caseData={{ agents: ['A'], items: ['x'], values: [[3]] }}
    owners={[0]}
    score={{ utilities: ['3'], nsw: '3', ef1: true, efx: true }}
    standing={{ rank: 1, total: 1, tied: 1, beatPercent: null }}
  />);

  expect(screen.getByRole('heading', { name: 'First challenger on this case' })).toBeTruthy();
  expect(screen.getByText('—')).toBeTruthy();
  expect(screen.queryByText('100%')).toBeNull();
});
