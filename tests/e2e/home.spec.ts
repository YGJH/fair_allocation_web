import { test, expect } from '@playwright/test';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../../src/shared/example';

const casePath = `/cases/${EXAMPLE_CASE_ID}`;

function surveySummary(answered: number) {
  const verdicts = [true, false, true];
  return {
    answered,
    totalQuestions: 3,
    questions: SURVEY_CASES.map((entry, index) => ({
      allocationId: entry.allocationId,
      total: index < answered ? 10 + index : 0,
      fair: index < answered ? [7, 3, 8][index] : 0,
      unfair: index < answered ? [3, 8, 4][index] : 0,
      fairPercent: index < answered ? [70, 27, 67][index] : null,
      userVerdict: index < answered ? verdicts[index] : null,
    })),
  };
}

test('home asks three fixed-allocation questions before showing statistics', async ({ page }) => {
  let answered = 0;
  await page.route('**/api/survey', (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    answered += 1;
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(surveySummary(answered)) });
  });

  await page.goto('/en');
  await expect(page.getByRole('heading', { name: 'What feels fair to you?' })).toBeVisible();
  await expect(page.getByText('Question 1 of 3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Same list, different split' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Make your own allocation' })).toHaveCount(0);

  await page.getByRole('button', { name: /Fair$/ }).click();
  await expect(page.getByRole('heading', { name: 'Opposite priorities' })).toBeVisible();
  await page.getByRole('button', { name: /Unfair$/ }).click();
  await expect(page.getByRole('heading', { name: 'The shared favorites' })).toBeVisible();
  await page.getByRole('button', { name: /Fair$/ }).click();

  await expect(page.getByRole('heading', { name: 'Your fairness pulse' })).toBeVisible();
  await expect(page.getByText('70%')).toBeVisible();
  await expect(page.getByText('27%')).toBeVisible();
  await expect(page.getByText('67%')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Make your own allocation' })).toHaveAttribute('href', `/en${casePath}`);
});

test('reduced motion and no-JS retain a complete first question', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await reduced.newPage();
  await page.goto('/zh-TW');
  await expect(page.getByRole('heading', { name: '你覺得怎樣才公平？' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '同一張清單，不同分法' })).toBeVisible();
  await expect(page.getByRole('button', { name: /公平$/ }).last()).toBeVisible();
  expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  await reduced.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto('/en');
  await expect(staticPage.getByRole('heading', { name: 'Same list, different split' })).toBeVisible();
  await expect(staticPage.getByRole('button', { name: 'Fair' })).toBeVisible();
  await expect(staticPage.getByRole('link', { name: 'Make your own allocation' })).toHaveCount(0);
  await staticContext.close();
});

for (const locale of ['en', 'zh-TW']) {
  test(`${locale} mobile survey has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await expect(page.locator('.fixed-allocation')).toBeVisible();
    expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
