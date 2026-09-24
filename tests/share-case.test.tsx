/** @vitest-environment jsdom */
import { cleanup,fireEvent,render,screen } from '@testing-library/react';
import { afterEach,expect,test } from 'vitest';
import { ShareCase } from '../src/components/ShareCase';
afterEach(cleanup);
test('share action shows a selectable URL when clipboard is unavailable',async()=>{
 render(<ShareCase locale="en" caseId="case-1"/>);
 fireEvent.click(screen.getByRole('button',{name:'Copy case link'}));
 expect(await screen.findByText(/\/en\/cases\/case-1/)).toBeTruthy();
});
