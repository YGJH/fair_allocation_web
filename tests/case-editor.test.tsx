/** @vitest-environment jsdom */
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {expect,test,vi,afterEach} from 'vitest';
import {CaseEditor} from '../src/components/CaseEditor';
import {AllocationEditor} from '../src/components/AllocationEditor';
import {Leaderboard} from '../src/components/Leaderboard';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
test('editor displays valuation grid and allows valid publish', () => {
 render(<CaseEditor locale="zh-TW"/>);
 expect((screen.getByRole('button',{name:/發布/}) as HTMLButtonElement).disabled).toBe(false);
});
test('allocation requires every item exactly once',()=>{
 render(<AllocationEditor locale="en" caseId="c" caseData={{agents:['A'],items:['x'],values:[[1]]}}/>);
 expect((screen.getByRole('button',{name:/submit allocation/i}) as HTMLButtonElement).disabled).toBe(true);
});
test('case editor validates duplicate people and previews matrix',()=>{
 render(<CaseEditor locale="en"/>);
 fireEvent.click(screen.getByRole('button',{name:'Add agent'}));
 fireEvent.change(screen.getByLabelText('Agent 2 name'),{target:{value:'A'}});
 expect((screen.getByRole('button',{name:'Publish case'}) as HTMLButtonElement).disabled).toBe(true);
 expect(screen.getByRole('table',{name:/valuations/i})).toBeTruthy();
});
test('allocation editor shows assignment progress',()=>{
 render(<AllocationEditor locale="en" caseId="c" caseData={{agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]}}/>);
 expect(screen.getByText(/0\s*\/\s*2/)).toBeTruthy();
 fireEvent.change(screen.getByLabelText('x owner'),{target:{value:'0'}});
 expect(screen.getByText(/1\s*\/\s*2/)).toBeTruthy();
});
test('leaderboard rows link to their rating-first detail',()=>{
 render(<Leaderboard locale="zh-TW" rows={[{id:'a',kind:'visitor',nsw:'10',owners:[0]}]}/>);
 expect(screen.getByRole('link',{name:/10/}).getAttribute('href')).toBe('/zh-TW/allocations/a');
});
test('failed post shows localized retry message', async()=>{ vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false})); render(<CaseEditor locale="en"/>); screen.getByRole('button',{name:/publish/i}).click(); expect((await screen.findByRole('alert')).textContent).toMatch(/network/i); });
