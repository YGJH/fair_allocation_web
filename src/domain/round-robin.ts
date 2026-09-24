import type { Allocation, CaseInput } from './model';
function rng(seed: number) { let x=(seed|0)||1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x>>>0)/4294967296); }; }
export function roundRobin(c: CaseInput, seed: number): Allocation {
  const r = rng(seed); const order = c.agents.map((_,i)=>i);
  for (let i=order.length-1;i>0;i--) { const j=Math.floor(r()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
  const remaining = new Set(c.items.map((_,i)=>i)); const owners = Array(c.items.length).fill(-1); let turn=0;
  while (remaining.size) {
    const agent = order[turn % order.length]; let best = [...remaining][0];
    for (const g of remaining) if (c.values[agent][g] > c.values[agent][best] || (c.values[agent][g] === c.values[agent][best] && g < best)) best = g;
    owners[best]=agent; remaining.delete(best); turn++;
  }
  return owners;
}
