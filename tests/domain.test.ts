import { expect, test } from 'vitest';
import { parseCase, parseAllocation } from '../src/domain/model';
import { scoreAllocation } from '../src/domain/score';
import { roundRobin } from '../src/domain/round-robin';
const c = parseCase({agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]});
test('exact NSW and EF1/EFX', () => {
  expect(scoreAllocation(c,[0,1])).toMatchObject({nsw:'6',ef1:true,efx:true});
  expect(scoreAllocation(c,[0,0]).nsw).toBe('0');
});
test('EFX uses positive goods only, with a witness', () => {
  const d = parseCase({agents:['A','B'],items:['x','y','z'],values:[[3,2,0],[0,0,0]]});
  expect(scoreAllocation(d,[1,1,1])).toMatchObject({ef1:false,efx:false,efxFailure:{i:0,j:1,item:0}});
});
test('reject missing owner, negative valuation, and empty case', () => {
  expect(() => parseAllocation(c,[0])).toThrow();
  expect(() => parseCase({agents:[],items:['x'],values:[]})).toThrow();
  expect(() => parseCase({agents:['A'],items:['x'],values:[[-1]]})).toThrow();
});
test('repeatable round robin and exact huge product', () => {
  expect(roundRobin(c,42)).toEqual(roundRobin(c,42));
  const huge = parseCase({agents:['A','B'],items:['x','y'],values:[[1000000,0],[0,1000000]]});
  expect(scoreAllocation(huge,[0,1]).nsw).toBe('1000000000000');
});
test('EF1 true and EFX false with witness', () => {
  const d = parseCase({agents:['A','B'],items:['w','x','y'],values:[[1,2,1],[0,0,0]]});
  expect(scoreAllocation(d,[0,1,1])).toMatchObject({ef1:true,efx:false,efxFailure:{i:0,j:1,item:2}});
});
test('empty bundles and zero-valued goods follow definitions', () => {
  const d = parseCase({agents:['A','B'],items:['x'],values:[[0],[0]]});
  expect(scoreAllocation(d,[0])).toMatchObject({utilities:[0n,0n],nsw:'0',ef1:true,efx:true});
  const e = parseCase({agents:['A','B'],items:['x','y'],values:[[1,0],[0,0]]});
  expect(scoreAllocation(e,[1,1]).efx).toBe(true);
});
