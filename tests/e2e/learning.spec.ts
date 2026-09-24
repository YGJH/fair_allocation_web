import {test,expect} from '@playwright/test';
test.describe('bilingual learning flow',()=>{
 test.skip(!process.env.DATABASE_URL,'requires disposable PostgreSQL DATABASE_URL with migrations');
 test('first visit opens the real guided allocation', async ({page}) => {
  await page.goto('/en');
  await page.getByRole('link',{name:'Try the example'}).click();
  await expect(page).toHaveURL(/\/en\/allocations\/00000000-0000-4000-8000-000000000102$/);
  await expect(page.getByText('NSW score')).toHaveCount(0);
 });
 test('Traditional Chinese flow shares case and gates reveal', async ({page}) => {
  await page.goto('/zh-TW/cases/new');
  await page.getByRole('button',{name:'新增參與者'}).click();
  await page.getByRole('button',{name:'新增物品'}).click();
  await page.getByLabel('參與者 1 名稱').fill('A');
  await page.getByLabel('參與者 2 名稱').fill('B');
  await page.getByLabel('物品 1 名稱').fill('x');
  await page.getByLabel('物品 2 名稱').fill('y');
  await page.getByLabel('A 對 x 的估值').fill('3');
  await page.getByLabel('A 對 y 的估值').fill('0');
  await page.getByLabel('B 對 x 的估值').fill('0');
  await page.getByLabel('B 對 y 的估值').fill('2');
  await page.getByRole('button',{name:'發布案例'}).click();
  await expect(page).toHaveURL(/\/zh-TW\/cases\/[0-9a-f-]+$/);
  await page.getByLabel('x 的歸屬').selectOption({label:'A'});
  await page.getByLabel('y 的歸屬').selectOption({label:'B'});
  await page.getByRole('button',{name:'提交分配'}).click();
  await expect(page).toHaveURL(/\/zh-TW\/allocations\/[0-9a-f-]+$/);
  await expect(page.getByText('NSW 分數')).toHaveCount(0);
  await page.getByLabel('公平程度').selectOption('5');
  await page.getByRole('button',{name:'提交評分'}).click();
  await expect(page.getByText('NSW 分數')).toBeVisible();
  await expect(page.getByText('6',{exact:true})).toBeVisible();
  const allocationId=page.url().split('/').pop();
  await page.getByRole('button',{name:'English'}).click();
  await expect(page).toHaveURL(new RegExp(`/en/allocations/${allocationId}$`));
  await expect(page.getByText('NSW score')).toBeVisible();
 });
});
