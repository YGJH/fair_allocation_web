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
  expect(screen.getByRole('heading', { name: 'Watch the fairness tests work' })).toBeTruthy();
  expect(screen.queryAllByRole('radio')).toHaveLength(0);
  expect(screen.queryByRole('button', { name: /submit rating/i })).toBeNull();
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('the curated allocation keeps the animated explanation and practice cases', () => {
  render(<AllocationResults locale="en" caseId={EXAMPLE_CASE_ID} caseData={EXAMPLE_CASE} owners={EXAMPLE_OWNERS} score={EXAMPLE_SCORE} />);

  fireEvent.click(screen.getByRole('tab', { name: 'NSW' }));
  expect(screen.getByLabelText('8 × 13 = 104')).toBeTruthy();
  expect(screen.getByRole('link', { name: /Identical values: Same list, different split/ })).toBeTruthy();
  expect(screen.getByRole('link', { name: /Non-identical values: Opposite priorities/ })).toBeTruthy();
  expect(screen.getByRole('link', { name: /Challenge: The shared favorites/ })).toBeTruthy();
});

test('regular allocations show the concise static result immediately', () => {
  render(<AllocationResults
    locale="zh-TW"
    caseId="11111111-1111-4111-8111-111111111111"
    caseData={{ agents: ['A', 'B'], items: ['x', 'y'], values: [[3, 0], [0, 2]] }}
    owners={[0, 1]}
    score={{ utilities: ['3', '2'], nsw: '6', ef1: true, efx: true }}
  />);

  expect(screen.getByText('6')).toBeTruthy();
  expect(screen.getAllByText('符合條件')).toHaveLength(2);
  expect(screen.queryAllByRole('radio')).toHaveLength(0);
});
