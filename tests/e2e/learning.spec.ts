import { test, expect } from '@playwright/test';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE_ID } from '../../src/shared/example';

test.describe('bilingual learning flow', () => {
  test('allocation goes directly to the mathematical result', async ({ page }) => {
    await page.goto(`/en/cases/${EXAMPLE_CASE_ID}`);
    await expect(page.getByText('Nash social welfare')).toHaveCount(0);
    await expect(page.getByText('EF1', { exact: true })).toHaveCount(0);

    await page.route(`**/api/cases/${EXAMPLE_CASE_ID}/allocations`, (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: EXAMPLE_ALLOCATION_ID }) }));
    await page.getByRole('button', { name: /^Sketchbook\./ }).click();
    await page.getByRole('button', { name: 'Place here: Maya' }).click();
    await page.getByRole('button', { name: /^Lantern\./ }).click();
    await page.getByRole('button', { name: 'Place here: Leo' }).click();
    await page.getByRole('button', { name: /^Notebook\./ }).click();
    await page.getByRole('button', { name: 'Place here: Leo' }).click();
    await page.getByRole('button', { name: 'View the result' }).click();

    await expect(page).toHaveURL(new RegExp(`/en/allocations/${EXAMPLE_ALLOCATION_ID}$`));
    await expect(page.getByRole('heading', { name: 'Watch the fairness tests work' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /submit rating/i })).toHaveCount(0);
    await page.getByRole('tab', { name: 'NSW' }).click();
    await expect(page.getByLabel('8 × 13 = 104')).toBeVisible();
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

  test('a stored allocation never asks for a second fairness judgment', async ({ page }) => {
    await page.goto(`/zh-TW/allocations/${EXAMPLE_ALLOCATION_ID}`);
    await expect(page.getByRole('heading', { name: '你的分配，直接驗算' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '看三種公平概念如何運作' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByText('選擇公平程度')).toHaveCount(0);
  });
});
