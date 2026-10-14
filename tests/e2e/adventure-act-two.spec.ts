import { expect, test } from '@playwright/test';

test('CS-04 opens the playable Act II investigation and CS-06 hands off to the playable Act III opening', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await page.getByRole('button', { name: 'Open the first case' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  for (const clue of [
    'Chen Shouye’s valuations', 'Chen Congzheng’s valuations',
    'The Chen elder explains the ruling', 'The original Yiwu ruling',
  ]) await page.getByRole('button', { name: clue, exact: true }).click();
  await page.getByRole('button', { name: 'Enter allocation workbench' }).click();
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Intuition rating 3' }).click();
  await page.getByRole('button', { name: 'Submit intuition rating' }).click();
  for (let index = 0; index < 3; index += 1) await page.getByRole('button', { name: 'Open next fold' }).click();
  await page.getByRole('button', { name: 'Continue to the verdict choice' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Skip Master Challenge' }).click();
  await page.getByRole('button', { name: 'Continue to CS-03' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin Act II · CS-04' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Act II: Winter/ })).toBeVisible();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  await page.getByRole('button', { name: 'The loom workshop model', exact: true }).click();
  await page.getByRole('button', { name: 'Enter allocation workbench' }).click();
  await expect(page.getByText('Harmony Score', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Intuition rating 3' }).click();
  await page.getByRole('button', { name: 'Submit intuition rating' }).click();
  await expect(page.getByRole('heading', { name: 'Case Scroll Debrief · Hangzhou' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to the verdict choice' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Act II Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: /Paper fallback/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText('The compensation challenge is complete.')).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await expect(page.getByRole('heading', { name: 'Act II Performance Ledger' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Earlier act records' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to the Act III boundary' }).click();
  await expect(page.getByRole('heading', { name: /Paper fallback/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Act III: Winter/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Begin Act III · CS-07' })).toBeVisible();
});
