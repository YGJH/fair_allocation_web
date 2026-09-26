import { test, expect } from '@playwright/test';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE_ID } from '../../src/shared/example';

test.describe('bilingual learning flow', () => {
  test('allocation comes before intuition and mathematical results', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'Start allocating' }).first().click();
    await expect(page).toHaveURL(new RegExp(`/en/cases/${EXAMPLE_CASE_ID}$`));
    await expect(page.getByText('Nash social welfare')).toHaveCount(0);
    await expect(page.getByText('EF1', { exact: true })).toHaveCount(0);

    await page.route(`**/api/cases/${EXAMPLE_CASE_ID}/allocations`, (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: EXAMPLE_ALLOCATION_ID }) }));
    await page.getByRole('button', { name: /^Sketchbook\./ }).click();
    await page.getByRole('button', { name: 'Place here: Maya' }).click();
    await page.getByRole('button', { name: /^Lantern\./ }).click();
    await page.getByRole('button', { name: 'Place here: Leo' }).click();
    await page.getByRole('button', { name: /^Notebook\./ }).click();
    await page.getByRole('button', { name: 'Place here: Leo' }).click();
    await page.getByRole('button', { name: 'Continue to intuition' }).click();

    await expect(page).toHaveURL(new RegExp(`/en/allocations/${EXAMPLE_ALLOCATION_ID}$`));
    await expect(page.getByRole('radio')).toHaveCount(5);
    await expect(page.getByText('Nash social welfare')).toHaveCount(0);

    await page.route(`**/api/allocations/${EXAMPLE_ALLOCATION_ID}/ratings`, (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ rating: 4, score: { utilities: ['8', '13'], nsw: '104', ef1: true, efx: true }, aggregate: { count: 1, mean: 4, histogram: [0, 0, 0, 1, 0] } }) }));
    await page.getByRole('radio', { name: /4.*fair/i }).check();
    await page.getByRole('button', { name: 'Submit rating' }).click();
    await expect(page.getByText('Nash social welfare')).toBeVisible();
    await expect(page.getByText('EF1', { exact: true })).toBeVisible();
    await expect(page.getByText('EFX', { exact: true })).toBeVisible();
  });

  test('curated case is complete and has no case-creation navigation', async ({ page }) => {
    await page.goto(`/zh-TW/cases/${EXAMPLE_CASE_ID}`);
    await expect(page.getByRole('heading', { name: 'Maya × Leo' })).toBeVisible();
    await expect(page.getByRole('table', { name: '估值' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '拉動物品來分配' })).toBeVisible();
    await expect(page.getByRole('link', { name: /建立案例|新增案例/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(new RegExp(`/en/cases/${EXAMPLE_CASE_ID}$`));
  });

  test('failed example rating offers an explicit local-only reveal', async ({ page }) => {
    await page.route(`**/api/allocations/${EXAMPLE_ALLOCATION_ID}/ratings`, (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
    await page.goto(`/en/allocations/${EXAMPLE_ALLOCATION_ID}`);
    await page.getByRole('radio', { name: /3.*unsure/i }).check();
    await page.getByRole('button', { name: 'Submit rating' }).click();
    await expect(page.getByText('Nash social welfare')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reveal result' }).click();
    await expect(page.getByText('Nash social welfare')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Community responses' })).toHaveCount(0);
  });
});
