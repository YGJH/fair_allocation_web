/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { AllocationEditor } from '../src/components/AllocationEditor';
import { Leaderboard } from '../src/components/Leaderboard';
import { NextCases } from '../src/components/NextCases';
import { EXAMPLE_CASE_ID } from '../src/shared/example';

const sample = { agents: ['A', 'B'], items: ['x', 'y'], values: [[3, 0], [0, 2]] };

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('allocation requires every item and reports progress', () => {
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  const submit = screen.getByRole('button', { name: /view the result/i }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);
  expect(screen.getByText(/assign every item/i)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('x owner'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('y owner'), { target: { value: '1' } });
  expect(submit.disabled).toBe(false);
  expect(screen.getByText(/every item has an owner/i)).toBeTruthy();
});

test('envy graph updates its direction, gap, and emotion with the allocation', () => {
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  expect(screen.getAllByText('Move an item to start the comparison.').length).toBeGreaterThan(0);

  fireEvent.change(screen.getByLabelText('x owner'), { target: { value: '1' } });

  expect(screen.getByText('A envies B by 3.')).toBeTruthy();
  expect(screen.getByLabelText(/A\. Own value: 0\. Very envious, Gap 3/)).toBeTruthy();
  expect(screen.getByLabelText(/B\. Own value: 0\. Content/)).toBeTruthy();
});

test('items can be assigned with the visible tap interaction', () => {
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  fireEvent.click(screen.getByRole('button', { name: /^x\./i }));
  fireEvent.click(screen.getByRole('button', { name: 'Place here: A' }));
  expect((screen.getByLabelText('x owner') as HTMLSelectElement).value).toBe('0');
  expect(screen.getByRole('button', { name: /^x\./i }).closest('.agent-drop-zone')?.textContent).toMatch(/A/);
});

function touchAt(x: number, y: number) {
  return { identifier: 1, clientX: x, clientY: y };
}

test('touch press-and-hold drags an item to a person', () => {
  vi.useFakeTimers();
  vi.stubGlobal('scrollBy', vi.fn());
  try {
    render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
    const token = screen.getByRole('button', { name: /^x\./i });
    const zone = screen.getByRole('button', { name: 'Place here: B' }).closest('[data-drop-agent]') as HTMLElement;
    document.elementFromPoint = vi.fn(() => zone);

    fireEvent.touchStart(token, { touches: [touchAt(10, 10)], changedTouches: [touchAt(10, 10)] });
    vi.advanceTimersByTime(250);
    expect(token.dataset.dragging).toBe('true');
    const moved = fireEvent.touchMove(token, { cancelable: true, touches: [touchAt(10, 300)], changedTouches: [touchAt(10, 300)] });
    expect(moved).toBe(false);
    fireEvent.touchEnd(token, { cancelable: true, touches: [], changedTouches: [touchAt(10, 300)] });

    expect((screen.getByLabelText('x owner') as HTMLSelectElement).value).toBe('1');
  } finally {
    vi.useRealTimers();
  }
});

test('a touch swipe on an item scrolls instead of dragging', () => {
  vi.useFakeTimers();
  vi.stubGlobal('scrollBy', vi.fn());
  try {
    render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
    const token = screen.getByRole('button', { name: /^x\./i });
    document.elementFromPoint = vi.fn(() => null);

    fireEvent.touchStart(token, { touches: [touchAt(10, 10)], changedTouches: [touchAt(10, 10)] });
    const moved = fireEvent.touchMove(token, { cancelable: true, touches: [touchAt(10, 80)], changedTouches: [touchAt(10, 80)] });
    vi.advanceTimersByTime(250);
    fireEvent.touchEnd(token, { cancelable: true, touches: [], changedTouches: [touchAt(10, 80)] });

    expect(moved).toBe(true);
    expect(token.dataset.dragging).toBeUndefined();
    expect((screen.getByLabelText('x owner') as HTMLSelectElement).value).toBe('-1');
  } finally {
    vi.useRealTimers();
  }
});

test('mouse drag moves an item to a person', () => {
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  const token = screen.getByRole('button', { name: /^x\./i });
  const zone = screen.getByRole('button', { name: 'Place here: A' }).closest('[data-drop-agent]') as HTMLElement;
  document.elementFromPoint = vi.fn(() => zone);

  fireEvent.pointerDown(token, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 0, clientY: 0 });
  fireEvent.pointerMove(window, { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 120 });
  fireEvent.pointerUp(window, { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 120 });

  expect((screen.getByLabelText('x owner') as HTMLSelectElement).value).toBe('0');
});

test('failed allocation submission keeps every assignment', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  render(<AllocationEditor locale="en" caseId="c" caseData={sample} />);
  fireEvent.change(screen.getByLabelText('x owner'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('y owner'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: /view the result/i }));
  expect((await screen.findByRole('alert')).textContent).toMatch(/retry/i);
  expect((screen.getByLabelText('x owner') as HTMLSelectElement).value).toBe('0');
  expect((screen.getByLabelText('y owner') as HTMLSelectElement).value).toBe('1');
});

test('leaderboard rows link to their rating-first detail', () => {
  render(<Leaderboard locale="zh-TW" rows={[{ id: 'a', kind: 'visitor', nsw: '10', owners: [0] }]} />);
  expect(screen.getByRole('link', { name: /精確 NSW 10/ }).getAttribute('href')).toBe('/zh-TW/allocations/a');
});

test('next cases show objective valuation patterns and omit the case just completed', () => {
  render(<NextCases locale="zh-TW" currentCaseId={EXAMPLE_CASE_ID} />);

  expect(screen.getByRole('heading', { name: '再試一個分配案例' })).toBeTruthy();
  expect(screen.getByRole('link', { name: /案例 03.*Alice: 60, 40, 0; Bob: 100, 1, 1/ }).getAttribute('href')).toBe('/zh-TW/cases/00000000-0000-4000-8000-000000000301');
  expect(screen.getByRole('link', { name: /案例 05.*Alice: 4, 8, 1; Bob: 2, 10, 8/ }).getAttribute('href')).toBe('/zh-TW/cases/00000000-0000-4000-8000-000000000501');
  expect(screen.queryByRole('link', { name: /案例 01/ })).toBeNull();
  expect(screen.getAllByRole('link', { name: /開始作答/ })).toHaveLength(5);
  expect(document.querySelectorAll('.practice-list > li')).toHaveLength(5);
});
