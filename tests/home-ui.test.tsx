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

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} home starts with the three-question fairness survey`, async () => {
    render(await LocalePage({ params: Promise.resolve({ locale }) }));

    expect(screen.getByRole('heading', { name: locale === 'en' ? 'What feels fair to you?' : '你覺得怎樣才公平？' })).toBeTruthy();
    expect(screen.getByText(locale === 'en' ? 'Question 1 of 3' : '第 1 題，共 3 題')).toBeTruthy();
    expect(screen.getByRole('heading', { name: locale === 'en' ? 'Same list, different split' : '同一張清單，不同分法' })).toBeTruthy();
    expect(screen.getByRole('button', { name: locale === 'en' ? /Unfair/ : /不公平/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: locale === 'en' ? 'Fair' : '公平' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: locale === 'en' ? 'Make your own allocation' : '開始自己分配' })).toBeNull();
  });
}

test('three saved answers reveal personal and community statistics', async () => {
  const answers = [true, false, true];
  let answered = 0;
  vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method !== 'POST') throw new Error('unexpected request');
    answered += 1;
    return {
      ok: true,
      json: async () => ({
        answered,
        totalQuestions: 3,
        questions: SURVEY_CASES.map((entry, index) => ({
          allocationId: entry.allocationId,
          total: index < answered ? 10 + index : 0,
          fair: index < answered ? [7, 3, 8][index] : 0,
          unfair: index < answered ? [3, 8, 4][index] : 0,
          fairPercent: index < answered ? [70, 27, 67][index] : null,
          userVerdict: index < answered ? answers[index] : null,
        })),
      }),
    } as Response;
  }));

  render(await LocalePage({ params: Promise.resolve({ locale: 'en' }) }));
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));
  await screen.findByRole('heading', { name: 'Opposite priorities' });
  fireEvent.click(screen.getByRole('button', { name: 'Unfair' }));
  await screen.findByRole('heading', { name: 'The shared favorites' });
  fireEvent.click(screen.getByRole('button', { name: 'Fair' }));

  expect(await screen.findByRole('heading', { name: 'Your fairness pulse' })).toBeTruthy();
  expect(document.querySelector('.survey-personal-score')?.textContent).toContain('2');
  expect(screen.getByText('70%')).toBeTruthy();
  expect(screen.getByText('27%')).toBeTruthy();
  expect(screen.getByText('67%')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Make your own allocation' }).getAttribute('href')).toBe(`/en/cases/${EXAMPLE_CASE_ID}`);
  expect(fetch).toHaveBeenCalledTimes(3);
});
