/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { AllocationEditor } from '../src/components/AllocationEditor';
import { Leaderboard } from '../src/components/Leaderboard';
import { NextCases } from '../src/components/NextCases';

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

test('next cases provide one recommendation without implying a required sequence', () => {
  render(<NextCases locale="zh-TW" />);

  expect(screen.getByText('推薦先做')).toBeTruthy();
  expect(screen.getByRole('link', { name: /推薦先做.*一個 100 分，一個 1 分/ })).toBeTruthy();
  expect(screen.getByRole('link', { name: /換你來分.*12 分和 8 分，怎麼看？/ }).getAttribute('href')).toBe('/zh-TW/cases/00000000-0000-4000-8000-000000000501');
  expect(screen.getByRole('link', { name: /換你來分.*都是 10 分，就公平嗎？/ }).getAttribute('href')).toBe('/zh-TW/cases/00000000-0000-4000-8000-000000000601');
  expect(screen.getAllByRole('link', { name: /開始作答/ })).toHaveLength(5);
  expect(document.querySelectorAll('.practice-list > li')).toHaveLength(5);
});
