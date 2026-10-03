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
  await expect(page.getByRole('heading', { name: 'What feels fair to you?' })).toBeVisible();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await expect(page.getByRole('heading', { name: '100 to 1' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Nia: 100.*Rare painting \+60.*Record collection \+40.*Omar: 1.*Bus ticket \+1/ })).toBeVisible();
  await expect(page.locator('.survey-utility__segment')).toHaveCount(3);
  const matrix = page.getByRole('table', { name: 'Every value, side by side' });
  await expect(matrix.getByRole('row', { name: /Rare painting.*60.*100/ })).toBeVisible();
  await expect(matrix.getByRole('row', { name: /Record collection.*40.*1/ })).toBeVisible();
  await expect(matrix.getByRole('row', { name: /Bus ticket.*0.*1/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Make your own allocation' })).toHaveCount(0);

  await page.getByRole('button', { name: /Fair$/ }).click();
  await expect(page.getByRole('heading', { name: 'The close call' })).toBeVisible();
  await page.getByRole('button', { name: /Unfair$/ }).click();
  await expect(page.getByRole('heading', { name: '10 and 10' })).toBeVisible();
  await page.getByRole('button', { name: /Fair$/ }).click();
  await expect(page.getByRole('heading', { name: 'Same list, different split' })).toBeVisible();
  await page.getByRole('button', { name: /Fair$/ }).click();
  await expect(page.getByRole('heading', { name: 'The shared favorites' })).toBeVisible();
  await page.getByRole('button', { name: /Unfair$/ }).click();

  await expect(page.getByRole('heading', { name: 'Your fairness pulse' })).toBeVisible();
  await expect(page.getByText('70%')).toBeVisible();
  await expect(page.getByText('27%')).toBeVisible();
  await expect(page.getByText('67%')).toBeVisible();
  await expect(page.locator('.survey-result-row').getByText('EF1')).toHaveCount(0);
  await expect(page.locator('.survey-result-row').getByText('EFX')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Make your own allocation' })).toHaveAttribute('href', `/en${casePath}`);
});

test('reduced motion and no-JS retain a complete first question', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await reduced.newPage();
  await page.goto('/zh-TW');
  await expect(page.getByRole('heading', { name: '你覺得怎樣才公平？' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '100 比 1' })).toBeVisible();
  await expect(page.getByRole('button', { name: /公平$/ }).last()).toBeVisible();
  expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  await reduced.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto('/en');
  await expect(staticPage.getByRole('heading', { name: '100 to 1' })).toBeVisible();
  await expect(staticPage.getByRole('button', { name: 'Fair', exact: true })).toBeVisible();
  await expect(staticPage.getByRole('link', { name: 'Make your own allocation' })).toHaveCount(0);
  await staticContext.close();
});

for (const locale of ['en', 'zh-TW']) {
  test(`${locale} mobile survey has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await expect(page.locator('.survey-utility')).toBeVisible();
    await expect(page.locator('.survey-utility__breakdown')).toHaveCount(2);
    await expect(page.locator('.survey-valuations')).toBeVisible();
    expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
