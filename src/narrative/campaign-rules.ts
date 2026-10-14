import { analyzeFairness, type FairnessAnalysis } from '../domain/fairness';
import type { Allocation, CaseInput } from '../domain/model';
import { ACT_ONE_DEFINITION, ACT_TWO_DEFINITION } from './campaign-definition';
import { adaptDivisibleAllocation, adaptMixedAllocation, type VisibleAllocation } from './allocation-adapter';
import type { CampaignEpilogueSummary, CampaignRecord } from './types';

export type PerformanceGrade = '不稱職' | '平常' | '稱職';

export type MasterChallengeResult = {
  completed: boolean;
  reachedFrontier: boolean;
  masterSeal: boolean;
};

export function buildEpilogueSummary(
  records: readonly CampaignRecord[],
  hiddenEnding: boolean,
): CampaignEpilogueSummary {
  const grades = records.map((record) => record.grade) as unknown as CampaignEpilogueSummary['grades'];
  const initialRatings = records.map((record) => record.intuitionRating) as unknown as CampaignEpilogueSummary['initialRatings'];
  const masterSeals = records.map((record) => record.challenge.masterSeal) as unknown as CampaignEpilogueSummary['masterSeals'];
  const competentCount = grades.filter((grade) => grade === '稱職').length;
  return {
    grades,
    initialRatings,
    masterSeals,
    yiwuVignette: grades[0] === '稱職' ? 'competent-or-better' : 'ordinary-or-below',
    hangzhouVignette: grades[1] === '稱職' ? 'competent-or-better' : 'ordinary-or-below',
    overallSeal: competentCount === 3 ? '國之權衡' : competentCount === 2 ? '持平良吏' : '循例之官',
    hiddenEnding,
  };
}

export function analyzeActOneAllocation(input: unknown): FairnessAnalysis {
  const { caseData, allocation } = adaptDivisibleAllocation(ACT_ONE_DEFINITION, input);
  return analyzeFairness(caseData, allocation);
}

export function analyzeActTwoAllocation(input: unknown): FairnessAnalysis {
  const { caseData, allocation } = adaptMixedAllocation(ACT_TWO_DEFINITION, input);
  return analyzeFairness(caseData, allocation);
}

export function evaluateActThreeMasterChallenge(
  analysis: Pick<FairnessAnalysis, 'efx' | 'nsw'>,
  sealEligible: boolean,
): MasterChallengeResult {
  const completed = analysis.efx;
  const reachedFrontier = completed && analysis.nsw === 125125n;
  return { completed, reachedFrontier, masterSeal: reachedFrontier && sealEligible };
}

export function gradeActTwo(
  analysis: Pick<FairnessAnalysis, 'proportionality' | 'ef'>,
): PerformanceGrade {
  if (!analysis.proportionality) return '不稱職';
  return analysis.ef ? '稱職' : '平常';
}

export function evaluateActTwoMasterChallenge(
  analysis: Pick<FairnessAnalysis, 'ef' | 'nsw'>,
  sealEligible: boolean,
): MasterChallengeResult {
  const completed = analysis.ef;
  const reachedFrontier = completed && analysis.nsw === BigInt(ACT_TWO_DEFINITION.harmonyScoreTarget);
  return {
    completed,
    reachedFrontier,
    masterSeal: reachedFrontier && sealEligible,
  };
}

export function gradeActOne(analysis: Pick<FairnessAnalysis, 'utilities'>): PerformanceGrade {
  const utilities = analysis.utilities.map(Number);
  if (utilities.some((utility) => utility < ACT_ONE_DEFINITION.gradeThresholds.proportionalUtility)) {
    return '不稱職';
  }
  if (utilities.every((utility) => utility >= ACT_ONE_DEFINITION.gradeThresholds.competentUtility)) {
    return '稱職';
  }
  return '平常';
}

export function evaluateActOneMasterChallenge(
  analysis: Pick<FairnessAnalysis, 'utilities' | 'proportionality' | 'ef'>,
  sealEligible: boolean,
): MasterChallengeResult {
  const utilities = analysis.utilities.map(Number);
  const completed = analysis.proportionality && analysis.ef;
  const reachedFrontier = completed
    && utilities.every(
      (utility, party) => utility === ACT_ONE_DEFINITION.masterChallenge.frontierUtilities[party],
    );

  return {
    completed,
    reachedFrontier,
    masterSeal: reachedFrontier && sealEligible,
  };
}

export type CutAndChooseResult = {
  dividerBundleUtilities: readonly [number, number];
  chooserBundleUtilities: readonly [number, number];
  chooserSelection: 0 | 1;
  finalAnalysis: FairnessAnalysis;
};

function bundleUtilities(caseData: CaseInput, allocation: Allocation, observer: number): [number, number] {
  const totals: [number, number] = [0, 0];
  allocation.forEach((bundle, item) => {
    totals[bundle] += caseData.values[observer][item];
  });
  return totals;
}

/** Resolves the chooser's preference using the campaign-defined bundle-zero tie-break. */
export function resolveActOneCutAndChoose(
  division: VisibleAllocation = ACT_ONE_DEFINITION.demonstrations.cutAndChooseDivision,
): CutAndChooseResult {
  const { caseData, allocation: bundles } = adaptDivisibleAllocation(ACT_ONE_DEFINITION, division);
  const dividerBundleUtilities = bundleUtilities(caseData, bundles, 0);
  const chooserBundleUtilities = bundleUtilities(caseData, bundles, 1);
  const chooserSelection: 0 | 1 = chooserBundleUtilities[0] === chooserBundleUtilities[1]
    ? ACT_ONE_DEFINITION.cutAndChoose.chooserTieBreakBundle
    : chooserBundleUtilities[0] > chooserBundleUtilities[1] ? 0 : 1;
  const finalAllocation = bundles.map((bundle) => bundle === chooserSelection ? 1 : 0);
  return {
    dividerBundleUtilities,
    chooserBundleUtilities,
    chooserSelection,
    finalAnalysis: analyzeFairness(caseData, finalAllocation),
  };
}

export {
  ACT_THREE_EXHAUSTIVE_SUMMARY,
  ACT_THREE_EXAMPLES,
  analyzeActThreeAllocation,
  analyzeThirdActAllocation,
  enumerateActThreeAllocations,
  exactNSW,
  gradeActThree,
  isEF,
  isEF1,
  isEFX,
  isZeroProduct,
} from './act-three-facts';

export {
  evaluateNationalEnding,
  resolveNationalEnding,
  selectMostAggrievedParty,
} from './ending-rules';
