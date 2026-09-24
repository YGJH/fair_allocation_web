import type { Allocation, CaseInput } from './model';
export type Score = { utilities: bigint[]; nsw: string; ef1: boolean; efx: boolean; ef1Failure?: {i:number;j:number}; efxFailure?: {i:number;j:number;item:number} };
export type JsonScore = Omit<Score,'utilities'> & { utilities: string[] };
export function toJsonScore(score: Score): JsonScore { return { ...score, utilities: score.utilities.map(String) }; }
export function fromJsonScore(score: JsonScore): Score { return { ...score, utilities: score.utilities.map(BigInt) }; }
export function scoreAllocation(c: CaseInput, a: Allocation): Score {
  const utilities = c.agents.map((_, i) => c.items.reduce((s, _, g) => s + (a[g] === i ? BigInt(c.values[i][g]) : 0n), 0n));
  const nsw = utilities.reduce((p,u) => p*u, 1n).toString();
  let ef1Failure: Score['ef1Failure'];
  let efxFailure: Score['efxFailure'];
  for (let i=0;i<c.agents.length;i++) for (let j=0;j<c.agents.length;j++) {
    if (i===j) continue;
    const goods = a.flatMap((owner,g) => owner===j ? [g] : []);
    const other = goods.reduce((s,g) => s+BigInt(c.values[i][g]),0n);
    if (utilities[i]>=other) continue;
    if (!goods.some(g => utilities[i]>=other-BigInt(c.values[i][g]))) ef1Failure ??= {i,j};
    const offending = goods.find(g => c.values[i][g]>0 && utilities[i]<other-BigInt(c.values[i][g]));
    if (offending!==undefined) efxFailure ??= {i,j,item:offending};
  }
  return {utilities,nsw,ef1:!ef1Failure,efx:!efxFailure,...(ef1Failure && {ef1Failure}),...(efxFailure && {efxFailure})};
}
