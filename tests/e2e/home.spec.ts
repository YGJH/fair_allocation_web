import { test, expect } from '@playwright/test';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../../src/shared/example';

const casePath = `/cases/${EXAMPLE_CASE_ID}`;

function surveySummary(answered: number) {
  const verdicts = [true, false, true, true, false];
  return {
    answered,
    totalQuestions: 5,
    questions: SURVEY_CASES.map((entry, index) => ({
      allocationId: entry.allocationId,
      total: index < answered ? 10 + index : 0,
      fair: index < answered ? [7, 3, 8, 6, 9][index] : 0,
      unfair: index < answered ? [3, 8, 4, 7, 5][index] : 0,
      fairPercent: index < answered ? [70, 27, 67, 46, 64][index] : null,
      userVerdict: index < answered ? verdicts[index] : null,
    })),
  };
}

test('home asks five utility-chart questions before showing statistics', async ({ page }) => {
  let answered = 0;
  await page.route('**/api/survey', (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    answered += 1;
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(surveySummary(answered)) });
  });

  await page.goto('/en');
  await expect(page.getByRole('heading', { name: 'Fairness has formulas. Intuition has questions.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What feels fair to you?' })).toBeHidden();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'See the five cases' }).click();
  await expect(page.getByRole('heading', { name: 'What feels fair to you?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fairness has formulas. Intuition has questions.' })).toBeHidden();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await expect(page.getByRole('heading', { name: '100 to 1' })).toHaveCount(0);
  await expect(page.getByText('Each row is one item. Read across it to compare how differently the agents value that same item.')).toBeVisible();
  await expect(page.getByRole('img', { name: /Alice: 100.*Item 1 \+60.*Item 2 \+40.*Bob: 1.*Item 3 \+1/ })).toBeVisible();
  await expect(page.locator('.survey-utility__segment')).toHaveCount(3);
  const barBottoms = await page.locator('.survey-utility__stack').evaluateAll((bars) => bars.map((bar) => bar.getBoundingClientRect().bottom));
  expect(barBottoms).toHaveLength(2);
  expect(Math.abs(barBottoms[0] - barBottoms[1])).toBeLessThan(0.01);
  await expect(page.locator('.survey-utility__scale--zero')).toHaveText('0');
  await expect(page.locator('.survey-utility__scale--max')).toHaveText('100');
  await expect(page.getByRole('list', { name: 'How each person scores the items' }).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Make your own allocation' })).toHaveCount(0);

  await page.getByRole('button', { name: /Fair$/ }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 5')).toBeVisible();
  await page.getByRole('button', { name: /Unfair$/ }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 3 of 5')).toBeVisible();
  await page.getByRole('button', { name: /Fair$/ }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 4 of 5')).toBeVisible();
  await page.getByRole('button', { name: /Fair$/ }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 5 of 5')).toBeVisible();
  await page.getByRole('button', { name: /Unfair$/ }).click();

  await expect(page.getByRole('heading', { name: 'Your answers' })).toBeVisible();
  await expect(page.getByText('70%')).toBeVisible();
  await expect(page.getByText('27%')).toBeVisible();
  await expect(page.getByText('67%')).toBeVisible();
  await expect(page.locator('.survey-result-row').getByText('EF1')).toHaveCount(0);
  await expect(page.locator('.survey-result-row').getByText('EFX')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Make your own allocation' })).toHaveAttribute('href', `/en${casePath}`);
});

test('reduced motion remains interactive and no-JS keeps the introduction readable', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await reduced.newPage();
  await page.goto('/zh-TW');
  await page.getByRole('button', { name: '略過故事' }).click();
  await expect(page.getByRole('heading', { name: '你覺得怎樣才公平？' })).toBeVisible();
  await expect(page.getByText('每一列代表同一件物品；橫向比較可以看出不同參與者對這件物品的估值差異。')).toBeVisible();
  await expect(page.getByRole('button', { name: /公平$/ }).last()).toBeVisible();
  expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  await reduced.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto('/en');
  await expect(staticPage.getByRole('heading', { name: 'Fairness has formulas. Intuition has questions.' })).toBeVisible();
  await expect(staticPage.getByText(/Fair-allocation research uses standards/)).toBeVisible();
  await expect(staticPage.getByRole('button', { name: 'Fair', exact: true })).toHaveCount(0);
  await staticContext.close();
});

for (const locale of ['en', 'zh-TW']) {
  test(`${locale} mobile survey has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await page.getByRole('button', { name: locale === 'en' ? 'Skip story' : '略過故事' }).click();
    await expect(page.locator('.survey-utility')).toBeVisible();
    await expect(page.locator('.survey-utility__breakdown')).toHaveCount(2);
    await expect(page.locator('.survey-valuations')).toBeVisible();
    expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
