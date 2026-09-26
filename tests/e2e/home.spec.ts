import { test, expect } from '@playwright/test';

const casePath = '/cases/00000000-0000-4000-8000-000000000101';

test('home is an almost wordless scroll-driven allocation study', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  await expect(page.getByRole('heading', { name: 'How would you divide it?' })).toBeAttached();
  await expect(page.getByRole('img', { name: /Maya and Leo compare three items/i })).toBeVisible();
  await expect(page.locator('.home-intro, .home-flow')).toHaveCount(0);
  await expect(page.locator('main section')).toHaveCount(1);

  const study = page.locator('.home-scroll');
  await expect(study).toHaveAttribute('data-scroll-ready', 'true');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => study.evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--home-progress')))).toBeGreaterThan(0.9);
  await expect(page.getByRole('link', { name: 'Start allocating' }).first()).toHaveAttribute('href', `/en${casePath}`);
});

test('reduced motion and no-JS retain a complete first frame', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await reduced.newPage();
  await page.goto('/zh-TW');
  await expect(page.getByRole('heading', { name: '你會怎麼分？' })).toBeAttached();
  await expect(page.getByRole('link', { name: '開始分配' }).first()).toBeVisible();
  await expect(page.locator('.stage-webgl canvas')).toHaveCount(0);
  expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
  await reduced.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto('/en');
  await expect(staticPage.getByRole('img', { name: /Maya and Leo compare three items/i })).toBeVisible();
  await expect(staticPage.getByRole('link', { name: 'Start allocating' }).first()).toHaveAttribute('href', `/en${casePath}`);
  await staticContext.close();
});

test('keyboard users can start allocating', async ({ page }) => {
  await page.goto('/en');
  const cta = page.getByRole('link', { name: 'Start allocating' }).first();
  await cta.focus();
  await expect(cta).toBeFocused();
  await page.route('**/en/cases/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="en"><body>Case destination</body></html>' }));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/en${casePath}$`));
});

for (const locale of ['en', 'zh-TW']) {
  test(`${locale} mobile scroll study has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await expect(page.locator('.home-stage')).toBeVisible();
    expect(await page.locator('body').evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(390);
    expect(await page.locator('main section').count()).toBe(1);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole('link', { name: locale === 'en' ? 'Start allocating' : '開始分配' }).first()).toBeVisible();
  });
}
