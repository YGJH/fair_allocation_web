import { expect, test } from '@playwright/test';

test('Act I presents the scripted testimony, judgment, challenge, and five-year transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  const cs01Arrival = page.locator('img[src*="cs-01-s1.jpg"]');
  await expect(cs01Arrival).toBeVisible();
  await expect.poll(() => cs01Arrival.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Open the first case' }).click();
  const cs01Petition = page.locator('img[src*="cs-01-s2.jpg"]');
  await expect(cs01Petition).toBeVisible();
  await expect.poll(() => cs01Petition.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/If the ruling was so even, why do both cry injustice/)).toBeVisible();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  const yamenPlate = page.locator('img[src*="plate-act1.jpg"]');
  await expect(yamenPlate).toBeVisible();
  await expect.poll(() => yamenPlate.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  const people = page.locator('[aria-label="People in the case"]');
  await people.getByRole('button', { name: /^Chen Shouye/ }).click();
  const elderPortrait = people.getByRole('button', { name: /^Chen Shouye/ }).locator('img[src*="chen-shouye-calm.jpg"]');
  await expect(elderPortrait).toBeVisible();
  await expect.poll(() => elderPortrait.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/silver cannot grow rice/)).toBeVisible();
  await people.getByRole('button', { name: /^Chen Congzheng/ }).click();
  await expect(page.getByText(/repaired arquebuses in camp for eight years/)).toBeVisible();
  await people.getByRole('button', { name: /^Chen Elder/ }).click();
  await page.getByRole('button', { name: 'The original Yiwu ruling', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to allocation' }).click();

  await page.getByRole('slider', { name: /Paddy fields:/ }).fill('10');
  await page.getByRole('slider', { name: /Oil-tea hills:/ }).fill('5');
  await page.getByRole('slider', { name: /Silver:/ }).fill('0');
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Show the whole scroll' }).click();
  const cs02Outcome = page.locator('img[src*="cs-02-s1.jpg"]');
  await expect(cs02Outcome).toBeVisible();
  await expect.poll(() => cs02Outcome.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/Nothing was conjured into being/)).toBeVisible();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();

  await page.getByRole('button', { name: 'Cut, then let the younger brother choose' }).click();
  await expect(page.getByText(/old village custom for dividing an estate/)).toBeVisible();
  await page.locator('#challenge-paddy-field').fill('5');
  await page.locator('#challenge-oil-tea-hillside').fill('10');
  await page.locator('#challenge-silver').fill('0');
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText(/divider receives only five shares/)).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await page.getByRole('button', { name: 'Close the Act I record' }).click();

  const cs03Letter = page.locator('img[src*="cs-03-s1.jpg"]');
  await expect(cs03Letter).toBeVisible();
  await expect.poll(() => cs03Letter.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/The new judge brought a small steelyard to the case/)).toBeVisible();
  const cs03Courier = page.locator('img[src*="cs-03-s2.jpg"]');
  await expect(cs03Courier).toBeVisible({ timeout: 10_000 });
  await expect.poll(() => cs03Courier.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'Performance Ledger' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Send him where the work is heavier and the cases harder/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Five years later' })).toBeVisible();
});
