import { expect, test } from '@playwright/test';

test('CS-00 plays its video when the browser allows motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  const video = page.locator('video');
  await expect(video).toBeVisible();
  await expect(video.locator('source')).toHaveAttribute('src', '/adventure/cutscenes/cs-00.mp4');
  await page.getByRole('button', { name: 'Enter the hall' }).click();
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime), { timeout: 5_000 }).toBeGreaterThan(0.5);
});

test('Act I opening gives the CS-01 animatic visible motion when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();

  const scene = page.locator('img[src*="cs-01-s1.jpg"]');
  await expect(scene).toBeVisible();
  const initialTransform = await scene.evaluate((image) => getComputedStyle(image).transform);
  await expect.poll(
    () => scene.evaluate((image) => getComputedStyle(image).transform),
    { timeout: 1_500 },
  ).not.toBe(initialTransform);
});

test('Act I debrief animates the CS-02 still when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await page.getByRole('button', { name: 'Open the first case' }).click();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  const people = page.locator('[aria-label="People in the case"]');
  for (const name of ['Chen Shouye', 'Chen Congzheng', 'Chen Elder']) {
    await people.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  }
  await page.getByRole('button', { name: 'The original Yiwu ruling', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to allocation' }).click();
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Show the whole scroll' }).click();

  const scene = page.locator('img[src*="cs-02-s1.jpg"]');
  await expect(scene).toBeVisible();
  const initialTransform = await scene.evaluate((image) => getComputedStyle(image).transform);
  await expect.poll(
    () => scene.evaluate((image) => getComputedStyle(image).transform),
    { timeout: 1_500 },
  ).not.toBe(initialTransform);
});

test('Act I animatics respect the browser reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await expect(page.getByRole('heading', { name: 'Paper story scroll' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  const scene = page.locator('img[src*="cs-01-s1.jpg"]');
  await expect(scene).toBeVisible();
  await expect(scene).toHaveAttribute('data-motion', 'push-in');
  await expect.poll(() => scene.evaluate((image) => getComputedStyle(image).animationName)).toBe('none');
});
