import { analyzeFairness, type EnvyWitness, type FairnessAnalysis } from '../domain/fairness';
import {
  ACT_THREE_DEFINITION,
  type ActThreeAllocation,
  type ActThreeWritId,
} from './campaign-definition';
import {
  adaptThirdActAllocation,
  validateThirdActAllocation,
} from './allocation-adapter';
import { evaluateNationalEnding } from './ending-rules';

export type ThirdActAllocationAnalysis = FairnessAnalysis & {
  readonly allocation: ActThreeAllocation;
  readonly owners: readonly number[];
};

/** The authored Third Act grade table in master-script.zh-TW.md §10. */
export type ThirdActGrade = '不稱職' | '平常' | '稱職';

export function analyzeActThreeAllocation(input: unknown): ThirdActAllocationAnalysis {
  const allocation = validateThirdActAllocation(input);
  const domain = adaptThirdActAllocation(ACT_THREE_DEFINITION, allocation);
  const analysis = analyzeFairness(domain.caseData, domain.allocation);
  return {
    ...analysis,
    allocation,
    owners: [...domain.allocation],
  };
}

/** Alias using the domain-facing name used by the other act analyzers. */
export const analyzeThirdActAllocation = analyzeActThreeAllocation;

export function isEF(analysis: Pick<FairnessAnalysis, 'ef'>): boolean {
  return analysis.ef;
}

export function isEF1(analysis: Pick<FairnessAnalysis, 'ef1'>): boolean {
  return analysis.ef1;
}

export function isEFX(analysis: Pick<FairnessAnalysis, 'efx'>): boolean {
  return analysis.efx;
}

export function isZeroProduct(analysis: Pick<FairnessAnalysis, 'nsw'>): boolean {
  return analysis.nsw === 0n;
}

export function exactNSW(analysis: Pick<FairnessAnalysis, 'nsw'>): bigint {
  return analysis.nsw;
}

export function utilitiesOf(analysis: Pick<FairnessAnalysis, 'utilities'>): readonly bigint[] {
  return analysis.utilities;
}

export function envyGapsOf(analysis: Pick<FairnessAnalysis, 'envyPairs'>): readonly EnvyWitness[] {
  return analysis.envyPairs;
}

export function gradeActThree(analysis: Pick<FairnessAnalysis, 'ef1' | 'efx' | 'nsw'>): ThirdActGrade {
  if (analysis.nsw === 0n || !analysis.ef1) return ACT_THREE_DEFINITION.gradeCriteria.zeroProductOrEf1Failure;
  if (!analysis.efx) return ACT_THREE_DEFINITION.gradeCriteria.ef1WithoutEfx;
  return ACT_THREE_DEFINITION.gradeCriteria.efx;
}

/** Selects the authored post-challenge vignette from the Act III Final Verdict. */
export function selectActThreePostChallengeCutscene(
  analysis: Pick<FairnessAnalysis, 'efx' | 'nsw' | 'envyPairs' | 'utilities'> & Partial<Pick<FairnessAnalysis, 'ef1'>>,
): 'cs-09' | 'cs-10' | 'cs-11' | 'cs-12' | 'cs-13' {
  const resolution = evaluateNationalEnding({
    utilities: analysis.utilities.map(Number),
    nsw: analysis.nsw.toString(),
    proportionality: false,
    ef: analysis.efx,
    ef1: analysis.ef1 ?? false,
    efx: analysis.efx,
    envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })),
  });
  switch (resolution.ending) {
    case '鼎足而立': return 'cs-09';
    case '江陵之怨': return 'cs-10';
    case '薊門之怨': return 'cs-11';
    case '大璫之怨': return 'cs-12';
    case '留中不發': return 'cs-13';
  }
}

export type ThirdActExhaustiveSummary = {
  readonly allocationCount: number;
  readonly efCount: number;
  readonly efxCount: number;
  readonly ef1Count: number;
  readonly zeroProductCount: number;
  readonly maxNSW: bigint;
  readonly maxNSWAllocationCount: number;
  readonly maxNSWAllocation: ActThreeAllocation;
  readonly maxNSWIsEFX: boolean;
};

function allocationForOwners(owners: readonly number[]): ActThreeAllocation {
  return ACT_THREE_DEFINITION.writs.map((writ, index) => ({
    writId: writ.id,
    owner: owners[index],
  }));
}

/** Enumerates owners in lexicographic base-three order, with Writ order fixed by the script. */
export function enumerateActThreeAllocations(): readonly ThirdActAllocationAnalysis[] {
  const records: ThirdActAllocationAnalysis[] = [];
  const writCount = ACT_THREE_DEFINITION.writs.length;
  const allocationCount = 3 ** writCount;
  for (let index = 0; index < allocationCount; index += 1) {
    const owners = ACT_THREE_DEFINITION.writs.map((_, writ) =>
      Math.floor(index / (3 ** (writCount - writ - 1))) % 3,
    );
    records.push(analyzeActThreeAllocation(allocationForOwners(owners)));
  }
  return records;
}

function summarize(records: readonly ThirdActAllocationAnalysis[]): ThirdActExhaustiveSummary {
  const maxNSW = records.reduce((maximum, record) => maximum > record.nsw ? maximum : record.nsw, 0n);
  const maxima = records.filter((record) => record.nsw === maxNSW);
  return {
    allocationCount: records.length,
    efCount: records.filter((record) => record.ef).length,
    efxCount: records.filter((record) => record.efx).length,
    ef1Count: records.filter((record) => record.ef1).length,
    zeroProductCount: records.filter((record) => record.nsw === 0n).length,
    maxNSW,
    maxNSWAllocationCount: maxima.length,
    maxNSWAllocation: maxima[0].allocation,
    maxNSWIsEFX: maxima.length === 1 && maxima[0].efx,
  };
}

/** Stable exhaustive facts for the six authored Writs (3^6 = 729). */
export const ACT_THREE_EXHAUSTIVE_SUMMARY = summarize(enumerateActThreeAllocations());
export const THIRD_ACT_EXHAUSTIVE_SUMMARY = ACT_THREE_EXHAUSTIVE_SUMMARY;

export const ACT_THREE_EXAMPLES = ACT_THREE_DEFINITION.demonstrations;

export type { ActThreeWritId };
