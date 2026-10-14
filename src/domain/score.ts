import { analyzeFairness } from './fairness';
import type { Allocation, CaseInput } from './model';
export type Score = { utilities: bigint[]; nsw: string; ef1: boolean; efx: boolean; ef1Failure?: {i:number;j:number}; efxFailure?: {i:number;j:number;item:number} };
export type JsonScore = Omit<Score,'utilities'> & { utilities: string[] };
export function toJsonScore(score: Score): JsonScore { return { ...score, utilities: score.utilities.map(String) }; }
export function fromJsonScore(score: JsonScore): Score { return { ...score, utilities: score.utilities.map(BigInt) }; }
export function scoreAllocation(c: CaseInput, a: Allocation): Score {
  const analysis = analyzeFairness(c, a);
  return {
    utilities: analysis.utilities,
    nsw: analysis.nsw.toString(),
    ef1: analysis.ef1,
    efx: analysis.efx,
    ...(analysis.ef1Failure && { ef1Failure: analysis.ef1Failure }),
    ...(analysis.efxFailure && { efxFailure: analysis.efxFailure }),
  };
}
