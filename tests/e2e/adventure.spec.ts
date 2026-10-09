import { expect, test } from '@playwright/test';
import { NARRATIVE_SCENARIOS } from '../../src/narrative/scenarios';

test('historical campaign keeps formal metrics sealed until rate-before-reveal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/zh-TW/adventure');

  await expect(page.getByRole('heading', { name: /天下之亂/ })).toBeVisible();
  await page.getByRole('button', { name: '提起天平' }).click();
  await expect(page.getByRole('heading', { name: '旁白' })).toBeVisible();
  for (let index = 0; index < NARRATIVE_SCENARIOS[0].storyBeats.length; index += 1) {
    await page.getByRole('button', { name: index === NARRATIVE_SCENARIOS[0].storyBeats.length - 1 ? '開始查案' : '繼續對話' }).click();
  }
  await expect(page.getByText('EF1', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: /沈景和/ }).click();
  await page.getByRole('button', { name: /顧雲錦/ }).click();
  await expect(page.getByText('系統 · 分配任務已開啟')).toBeVisible();
  await page.getByRole('button', { name: '開始分配' }).click();

  const allocations: Array<[RegExp, number]> = [
    [/琉璃鏡/, 0],
    [/染譜/, 1],
    [/牌匾/, 1],
    [/梅花瓶/, 0],
  ];
  for (const [itemName, agentIndex] of allocations) {
    await page.getByRole('button', { name: itemName }).first().click();
    await page.getByRole('button', { name: /放這裡/ }).nth(agentIndex).click();
  }

  await page.getByRole('button', { name: '鎖定裁決' }).click();
  await expect(page.getByText('EF1', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '5 / 5' }).click();

  await expect(page.getByText('EF1', { exact: true })).toBeVisible();
  await expect(page.getByText('5200', { exact: true })).toBeVisible();
  await expect(page.getByText('完全無嫉妒', { exact: true })).toBeVisible();
});
