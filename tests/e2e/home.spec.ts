import { test, expect } from '@playwright/test';
test('scrolling through the story drives and reverses the illustration',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/en');
 const scene=page.locator('.story-visual');
 const progress=()=>scene.evaluate(el=>Number(el.style.getPropertyValue('--story-progress')));
 await page.locator('#story').scrollIntoViewIfNeeded();
 const start=await progress();
 const position=()=>page.locator('.story-object--one').evaluate(el=>getComputedStyle(el).transform);
 const firstPosition=await position();
 await page.locator('.story-step').last().scrollIntoViewIfNeeded();
 await expect.poll(progress).toBeGreaterThan(start+.2);
 expect(await position()).not.toBe(firstPosition);
 await page.locator('.story-step').first().scrollIntoViewIfNeeded();
 await expect.poll(progress).toBeLessThan(.5);
 await expect(page).toHaveURL(/\/en$/);
});
test('reduced motion and no-JS still expose the story and destination',async({browser})=>{
 const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
 const page=await reduced.newPage();await page.goto('/zh-TW');
 await expect(page.getByRole('list',{name:'如何使用'}).locator('li')).toHaveCount(3);
 await expect(page.getByRole('link',{name:'試試範例'})).toBeVisible();
 expect(await page.locator('body').evaluate(el=>el.scrollWidth)).toBeLessThanOrEqual(390);
 expect(await page.locator('.story-visual').evaluate(el=>getComputedStyle(el).position)).not.toBe('sticky');
 await reduced.close();
 const staticContext=await browser.newContext({javaScriptEnabled:false});
 const staticPage=await staticContext.newPage();await staticPage.goto('/en');
 await expect(staticPage.getByRole('list',{name:'How it works'}).locator('li')).toHaveCount(3);
 await expect(staticPage.getByRole('link',{name:'Try the example'})).toHaveAttribute('href',/\/en\/allocations\/00000000-0000-4000-8000-000000000102$/);
 await staticContext.close();
});
test('keyboard users can skip the story and open the guided example',async({page})=>{
 await page.goto('/en');
 await page.getByRole('link',{name:/skip story/i}).focus();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#story-finish$/);
 const cta=page.getByRole('link',{name:'Try the example'});
 // Navigation is real; the destination response is stubbed because this suite runs without PostgreSQL.
 await page.route('**/en/allocations/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html lang="en"><body>Example destination</body></html>'}));
 await cta.focus();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/en\/allocations\/00000000-0000-4000-8000-000000000102$/);
});
for (const locale of ['en','zh-TW']) {
 test(`${locale} mobile home stays readable and compact`, async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(`/${locale}`);
  await expect(page.getByRole('link',{name:locale==='en'?'Try the example':'試試範例'})).toBeVisible();
  expect(await page.locator('body').evaluate(el=>el.scrollWidth)).toBeLessThanOrEqual(390);
  expect((await page.locator('.home-note').boundingBox())?.height).toBeLessThan(230);
  expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(248, 245, 238)');
 });
}
