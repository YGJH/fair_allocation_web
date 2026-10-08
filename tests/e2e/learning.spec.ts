import { test, expect } from '@playwright/test';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE_ID } from '../../src/shared/example';

test.describe('bilingual learning flow', () => {
  test('allocation goes directly to the mathematical result', async ({ page }) => {
    await page.goto(`/en/cases/${EXAMPLE_CASE_ID}`);
    await expect(page.getByText('Nash social welfare')).toHaveCount(0);
    await expect(page.getByText('EF1', { exact: true })).toHaveCount(0);

    await page.route(`**/api/cases/${EXAMPLE_CASE_ID}/allocations`, (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: EXAMPLE_ALLOCATION_ID }) }));
    await page.getByRole('button', { name: /^Item 1\./ }).click();
    await page.getByRole('button', { name: 'Place here: Alice' }).click();
    await page.getByRole('button', { name: /^Item 2\./ }).click();
    await page.getByRole('button', { name: 'Place here: Bob' }).click();
    await page.getByRole('button', { name: /^Item 3\./ }).click();
    await page.getByRole('button', { name: 'Place here: Bob' }).click();
    await page.getByRole('button', { name: 'View the result' }).click();

    await expect(page).toHaveURL(new RegExp(`/en/allocations/${EXAMPLE_ALLOCATION_ID}$`));
    await expect(page.getByRole('heading', { name: 'See how the three checks work' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /submit rating/i })).toHaveCount(0);
    await page.getByRole('tab', { name: 'NSW' }).click();
    await expect(page.getByLabel('8 × 13 = 104')).toBeVisible();
  });

  test('curated case is complete and has no case-creation navigation', async ({ page }) => {
    await page.goto(`/zh-TW/cases/${EXAMPLE_CASE_ID}`);
    await expect(page.getByRole('heading', { name: 'Alice × Bob' })).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '把每件物品分出去' })).toBeVisible();
    await expect(page.getByRole('link', { name: /建立案例|新增案例/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(new RegExp(`/en/cases/${EXAMPLE_CASE_ID}$`));
  });

  test('a stored allocation never asks for a second fairness judgment', async ({ page }) => {
    await page.goto(`/zh-TW/allocations/${EXAMPLE_ALLOCATION_ID}`);
    await expect(page.getByRole('heading', { name: '你的分配，直接驗算' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '看看三種檢查方式' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByText('選擇公平程度')).toHaveCount(0);
  });
});
