/** @vitest-environment jsdom */
import { render,screen,cleanup } from '@testing-library/react';
import { afterEach,beforeEach,expect,test,vi } from 'vitest';
import LocalePage from '../src/app/[locale]/page';
import NewCase from '../src/app/[locale]/cases/new/page';
import { EXAMPLE_ALLOCATION_ID } from '../src/shared/example';
beforeEach(()=>{
 vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener:()=>{},removeEventListener:()=>{}}));
 vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>window.setTimeout(()=>callback(performance.now()),16));
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>window.clearTimeout(id));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
test('skip target exists on the new case page',async()=>{
 render(await NewCase({params:Promise.resolve({locale:'en'})}));
 expect(screen.getByRole('main').id).toBe('main-content');
});
for (const locale of ['en','zh-TW'] as const) {
 test(`${locale} home guides visitors to the real first allocation without scores`, async () => {
  render(await LocalePage({params:Promise.resolve({locale})}));
  expect(screen.getByRole('link',{name:locale==='en'?/try the example/i:/試試範例/}).getAttribute('href')).toBe(`/${locale}/allocations/${EXAMPLE_ALLOCATION_ID}`);
  expect(screen.queryByText(/NSW score|NSW 分數/)).toBeNull();
  expect(screen.getByRole('heading',{name:locale==='en'?/judge first/i:/先判斷/})).toBeTruthy();
  const story=screen.getByRole('list',{name:locale==='en'?/how it works/i:/如何使用/});
  expect(story.children).toHaveLength(3);
  expect(screen.getByRole('link',{name:locale==='en'?/skip story/i:/略過故事/}).getAttribute('href')).toBe('#story-finish');
  const cta=screen.getByRole('link',{name:locale==='en'?/try the example/i:/試試範例/});
  expect(cta.closest('#story-finish')).not.toBeNull();
  expect(screen.queryByRole('link',{name:locale==='en'?/create your own/i:/建立自己的案例/})).toBeNull();
 });
}
