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

test('the curated allocation keeps the animated explanation and practice cases', () => {
  render(<AllocationResults locale="en" caseId={EXAMPLE_CASE_ID} caseData={EXAMPLE_CASE} owners={EXAMPLE_OWNERS} score={EXAMPLE_SCORE} />);

  fireEvent.click(screen.getByRole('tab', { name: 'NSW' }));
  expect(screen.getByLabelText('8 × 13 = 104')).toBeTruthy();
  expect(screen.getByRole('link', { name: /Identical values: Same list, different split/ })).toBeTruthy();
  expect(screen.getByRole('link', { name: /Non-identical values: 100 to 1/ })).toBeTruthy();
  expect(screen.getByRole('link', { name: /Challenge: The shared favorites/ })).toBeTruthy();
  const nextCases = screen.getByRole('region', { name: 'Choose your next experiment' });
  expect(nextCases.closest('.fairness-demo')).toBeNull();
  expect(nextCases.parentElement?.className).toBe('allocation-results__next');
});

test('regular allocations show the concise static result immediately', () => {
  render(<AllocationResults
    locale="zh-TW"
    caseId="11111111-1111-4111-8111-111111111111"
    caseData={{ agents: ['A', 'B'], items: ['x', 'y'], values: [[3, 0], [0, 2]] }}
    owners={[0, 1]}
    score={{ utilities: ['3', '2'], nsw: '6', ef1: true, efx: true }}
    standing={{ rank: 2, total: 5, tied: 1, beatPercent: 75 }}
  />);

  expect(screen.getByText('6')).toBeTruthy();
  expect(screen.getByRole('heading', { name: '超越同案例 75% 的其他分配' })).toBeTruthy();
  expect(screen.getByText('#2 / 5')).toBeTruthy();
  expect(screen.getAllByText('符合條件')).toHaveLength(2);
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
