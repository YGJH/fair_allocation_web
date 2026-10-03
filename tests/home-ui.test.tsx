/** @vitest-environment jsdom */
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import LocalePage from '../src/app/[locale]/page';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../src/shared/example';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} home starts with the five-question fairness survey`, async () => {
    render(await LocalePage({ params: Promise.resolve({ locale }) }));

    expect(screen.getByRole('heading', { name: locale === 'en' ? 'What feels fair to you?' : '你覺得怎樣才公平？' })).toBeTruthy();
    expect(screen.getByText(locale === 'en' ? 'Question 1 of 5' : '第 1 題，共 5 題')).toBeTruthy();
    expect(screen.getByRole('heading', { name: locale === 'en' ? '100 to 1' : '100 比 1' })).toBeTruthy();
    expect(screen.getByRole('img', { name: locale === 'en'
      ? /Nia: 100\. Items in this bar: Rare painting \+60, Record collection \+40\. Omar: 1\. Items in this bar: Bus ticket \+1/
      : /Nia: 100\. 柱內物品: Rare painting \+60, Record collection \+40\. Omar: 1\. 柱內物品: Bus ticket \+1/ })).toBeTruthy();
    expect(document.querySelectorAll('.survey-utility__segment')).toHaveLength(3);
    const matrix = screen.getByRole('table', { name: locale === 'en' ? 'Every value, side by side' : '雙方對所有物品的估值' });
    expect(within(matrix).getByRole('row', { name: /Rare painting.*60.*100/ })).toBeTruthy();
    expect(within(matrix).getByRole('row', { name: /Record collection.*40.*1/ })).toBeTruthy();
    expect(within(matrix).getByRole('row', { name: /Bus ticket.*0.*1/ })).toBeTruthy();
    expect(matrix.querySelectorAll('td.is-owner')).toHaveLength(3);
    expect(screen.getByRole('button', { name: locale === 'en' ? /Unfair/ : /不公平/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: locale === 'en' ? 'Fair' : '公平' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: locale === 'en' ? 'Make your own allocation' : '開始自己分配' })).toBeNull();
  });
}

test('five saved answers reveal personal and community statistics', async () => {
  const answers = [true, false, true, true, false];
  let answered = 0;
  vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method !== 'POST') throw new Error('unexpected request');
    answered += 1;
    return {
      ok: true,
      json: async () => ({
        answered,
        totalQuestions: 5,
        questions: SURVEY_CASES.map((entry, index) => ({
          allocationId: entry.allocationId,
          total: index < answered ? 10 + index : 0,
          fair: index < answered ? [7, 3, 8, 6, 9][index] : 0,
          unfair: index < answered ? [3, 8, 4, 7, 5][index] : 0,
          fairPercent: index < answered ? [70, 27, 67, 46, 64][index] : null,
          userVerdict: index < answered ? answers[index] : null,
        })),
      }),
    } as Response;
  }));

  render(await LocalePage({ params: Promise.resolve({ locale: 'en' }) }));
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  await screen.findByRole('heading', { name: 'The close call' });
  fireEvent.click(screen.getByRole('button', { name: 'Unfair' }));
  await screen.findByRole('heading', { name: '10 and 10' });
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  await screen.findByRole('heading', { name: 'Same list, different split' });
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  await screen.findByRole('heading', { name: 'The shared favorites' });
  fireEvent.click(screen.getByRole('button', { name: 'Unfair' }));

  expect(await screen.findByRole('heading', { name: 'Your fairness pulse' })).toBeTruthy();
  expect(document.querySelector('.survey-personal-score')?.textContent).toContain('3');
  expect(screen.getByText('70%')).toBeTruthy();
  expect(screen.getByText('27%')).toBeTruthy();
  expect(screen.getByText('67%')).toBeTruthy();
  expect(screen.queryByText('EF1')).toBeNull();
  expect(screen.queryByText('EFX')).toBeNull();
  expect(screen.getByRole('link', { name: 'Make your own allocation' }).getAttribute('href')).toBe(`/en/cases/${EXAMPLE_CASE_ID}`);
  expect(fetch).toHaveBeenCalledTimes(5);
});
