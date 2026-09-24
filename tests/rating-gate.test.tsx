/** @vitest-environment jsdom */
import {render,screen,cleanup,fireEvent} from '@testing-library/react';
import {expect,test,vi,beforeEach} from 'vitest';
import {RatingGate} from '../src/components/RatingGate';
import {Leaderboard} from '../src/components/Leaderboard';
beforeEach(()=>{ cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
test('no metrics or aggregate network request before rating succeeds', async () => {
 const fetchSpy=vi.spyOn(globalThis,'fetch');
 render(<RatingGate locale="en" allocationId="00000000-0000-0000-0000-000000000000" caseData={{agents:['A'],items:['x'],values:[[1]]}} owners={[0]}/>);
 expect(screen.queryByText(/NSW score/i)).toBeNull();
 expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('/results'),expect.anything());
});
test('leaderboard ties exact strings',()=>{ render(<Leaderboard locale="en" rows={[{id:'a',kind:'visitor',nsw:'0',owners:[]},{id:'b',kind:'baseline',nsw:'0',owners:[]}]}/>); expect(screen.getAllByText(/#1/).length).toBe(2); });
test('a successful vote reveals localized results and stores browser marker',async()=>{
 vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({score:{utilities:['8','13'],nsw:'104',ef1:true,efx:true},aggregate:{count:2,mean:4,histogram:[0,0,1,0,1]},caseId:'c'})} as Response);
 render(<RatingGate locale="zh-TW" allocationId="a" caseData={{agents:['Maya','Leo'],items:['x'],values:[[8],[13]]}} owners={[0]}/>);
 expect(screen.queryByText('104')).toBeNull();
 fireEvent.change(screen.getByLabelText('公平程度'),{target:{value:'5'}});
 fireEvent.click(screen.getByRole('button',{name:'提交評分'}));
 expect(await screen.findByText('104')).toBeTruthy();
 expect(localStorage.getItem('fair-rated:a')).toBe('1');
 expect(screen.queryAllByText(/Votes:|mean:|witness:|true|false/)).toHaveLength(0);
});
test('a failed vote retains the selected value',async()=>{
 vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:false} as Response);
 render(<RatingGate locale="en" allocationId="a" caseData={{agents:['A'],items:['x'],values:[[1]]}} owners={[0]}/>);
 fireEvent.change(screen.getByLabelText('Fairness'),{target:{value:'4'}});
 fireEvent.click(screen.getByRole('button',{name:'Submit rating'}));
 await screen.findByRole('alert');
 expect((screen.getByLabelText('Fairness') as HTMLSelectElement).value).toBe('4');
});
test('post failure does not mark localStorage', async()=>{ vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:false} as Response); render(<RatingGate locale="en" allocationId="a" caseData={{agents:['A'],items:['x'],values:[[1]]}} owners={[0]}/>); fireEvent.change(screen.getByLabelText('Fairness'),{target:{value:'5'}}); screen.getByText('Submit rating').click(); await screen.findByRole('alert'); expect(localStorage.getItem('fair-rated:a')).toBeNull(); });
