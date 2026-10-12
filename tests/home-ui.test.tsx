/** @vitest-environment jsdom */
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import LocalePage from '../src/app/[locale]/page';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../src/shared/example';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function enterJudgmentTask(locale: 'en' | 'zh-TW') {
  const continueLabel = locale === 'en' ? 'Continue' : '繼續';
  fireEvent.click(screen.getByRole('button', { name: continueLabel }));
  fireEvent.click(screen.getByRole('button', { name: continueLabel }));
  fireEvent.click(screen.getByRole('button', { name: locale === 'en' ? 'See the five cases' : '看看五個案例' }));
}

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} home starts with the five-question fairness survey`, async () => {
    render(await LocalePage({ params: Promise.resolve({ locale }) }));

    expect(screen.getByRole('heading', { name: locale === 'en' ? 'Fairness has formulas. Intuition has questions.' : '公平有公式，直覺卻常有疑問。' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: locale === 'en' ? 'What feels fair to you?' : '你覺得怎樣才公平？' })).toBeNull();
    enterJudgmentTask(locale);

    expect(screen.getByRole('heading', { name: locale === 'en' ? 'What feels fair to you?' : '你覺得怎樣才公平？' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: locale === 'en' ? 'Look at five allocations. Tell us what feels fair.' : '先看五個案例，告訴我們你覺得公不公平。' })).toBeNull();
    expect(screen.getByText(locale === 'en' ? 'Question 1 of 5' : '第 1 題，共 5 題')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: locale === 'en' ? '100 to 1' : '一個 100 分，一個 1 分' })).toBeNull();
    expect(screen.getByText(locale === 'en'
      ? 'Each row is one item. Read across it to compare how differently the agents value that same item.'
      : '每一列代表同一件物品；橫向比較可以看出不同參與者對這件物品的估值差異。')).toBeTruthy();
    expect(screen.getByRole('img', { name: locale === 'en'
      ? /Alice: 100\. Included items: Item 1 \+60, Item 2 \+40\. Bob: 1\. Included items: Item 3 \+1/
      : /Alice: 100\. 包含的物品: 物品 1 \+60, 物品 2 \+40\. Bob: 1\. 包含的物品: 物品 3 \+1/ })).toBeTruthy();
    expect(document.querySelectorAll('.survey-utility__segment')).toHaveLength(3);
    const itemList = screen.getByRole('list', { name: locale === 'en' ? 'How each person scores the items' : '每個人會給物品幾分' });
    expect(itemList.querySelectorAll('.survey-item-row')).toHaveLength(3);
    expect(itemList.textContent).toContain(locale === 'en' ? 'Item 1' : '物品 1');
    expect(screen.queryByRole('table')).toBeNull();
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
  enterJudgmentTask('en');
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Next question' }));
  await screen.findByText('Question 2 of 5');
  fireEvent.click(screen.getByRole('button', { name: 'Unfair' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Next question' }));
  await screen.findByText('Question 3 of 5');
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Next question' }));
  await screen.findByText('Question 4 of 5');
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Next question' }));
  await screen.findByText('Question 5 of 5');
  fireEvent.click(screen.getByRole('button', { name: 'Unfair' }));

  expect(await screen.findByRole('heading', { name: 'Your answers' })).toBeTruthy();
  expect(document.querySelector('.survey-personal-score')?.textContent).toContain('3');
  expect(screen.getByText('70%')).toBeTruthy();
  expect(screen.getByText('27%')).toBeTruthy();
  expect(screen.getByText('67%')).toBeTruthy();
  expect(document.querySelector('.survey-results__list')?.textContent).not.toContain('EF1');
  expect(document.querySelector('.survey-results__list')?.textContent).not.toContain('EFX');
  expect(screen.getByRole('link', { name: 'Make your own allocation' }).getAttribute('href')).toBe(`/en/cases/${EXAMPLE_CASE_ID}`);
  expect(fetch).toHaveBeenCalledTimes(5);
});
