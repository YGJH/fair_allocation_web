import { test, expect } from '@playwright/test';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE_ID, SURVEY_CASES } from '../../src/shared/example';

test.describe('bilingual learning flow', () => {
  test('allocation goes directly to the mathematical result', async ({ page }) => {
    await page.goto(`/en/cases/${EXAMPLE_CASE_ID}`);
    await expect(page.getByRole('heading', { name: 'Recognizing fairness is hard. Making it is harder.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Divide every item' })).toBeHidden();
    await page.getByRole('button', { name: 'Skip story' }).click();
    await expect(page.getByRole('heading', { name: 'Divide every item' })).toBeVisible();
    await expect(page.locator('.experience-deck__task').getByText('EF1', { exact: true })).toHaveCount(0);

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
    await expect(page.getByRole('heading', { name: 'Fairness is harder to create than it first appears.' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Try another allocation' }).getByRole('link')).toHaveCount(5);
  });

  test('curated case is complete and has no case-creation navigation', async ({ page }) => {
    await page.goto(`/zh-TW/cases/${EXAMPLE_CASE_ID}`);
    await expect(page.getByRole('heading', { name: '判斷公平很難，親手分配更難。' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Alice × Bob' })).toBeHidden();
    await page.getByRole('button', { name: '略過故事' }).click();
    await expect(page.getByRole('heading', { name: 'Alice × Bob' })).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '把每件物品分出去' })).toBeVisible();
    await expect(page.getByRole('link', { name: /建立案例|新增案例/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(new RegExp(`/en/cases/${EXAMPLE_CASE_ID}$`));
  });

  test('every stored case gets the replayable walkthrough and links to other cases', async ({ page }) => {
    await page.goto(`/zh-TW/allocations/${SURVEY_CASES[0].allocationId}`);
    await expect(page.getByRole('heading', { name: '你的分配，直接驗算' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '看看三種檢查方式' })).toBeVisible();
    await page.getByRole('tab', { name: 'EFX' }).click();
    await expect(page.getByText('移除任一重視的物品後，羨慕消失。')).toBeVisible();
    await page.getByRole('tab', { name: 'NSW' }).click();
    await expect(page.getByLabel('100 × 1 = 100')).toBeVisible();
    await expect(page.getByRole('button', { name: '再播放一次' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '現在你知道，要達到公平並不簡單。' })).toBeVisible();
    await expect(page.getByRole('link', { name: /案例 01/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /案例 03/ })).toHaveCount(0);
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByText('選擇公平程度')).toHaveCount(0);
  });
});
