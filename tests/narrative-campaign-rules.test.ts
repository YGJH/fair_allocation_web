import { describe, expect, test } from 'vitest';
import { ACT_ONE_DEFINITION } from '../src/narrative/campaign-definition';
import {
  analyzeActOneAllocation,
  evaluateActOneMasterChallenge,
  gradeActOne,
  resolveActOneCutAndChoose,
} from '../src/narrative/campaign-rules';

describe('Act I grading', () => {
  test('uses the exact master-script boundaries', () => {
    expect(ACT_ONE_DEFINITION.gradeThresholds).toEqual({
      proportionalUtility: 50,
      competentUtility: 60,
    });
    expect(gradeActOne({ utilities: [49n, 100n] })).toBe('不稱職');
    expect(gradeActOne({ utilities: [50n, 100n] })).toBe('平常');
    expect(gradeActOne({ utilities: [59n, 100n] })).toBe('平常');
    expect(gradeActOne({ utilities: [60n, 60n] })).toBe('稱職');
  });

  test('grades canonical allocations from subjective utilities', () => {
    expect(gradeActOne(analyzeActOneAllocation(
      ACT_ONE_DEFINITION.demonstrations.inverted,
    ))).toBe('不稱職');
    expect(gradeActOne(analyzeActOneAllocation(
      ACT_ONE_DEFINITION.demonstrations.halfSplit,
    ))).toBe('平常');
    expect(gradeActOne(analyzeActOneAllocation(
      ACT_ONE_DEFINITION.demonstrations.frontier,
    ))).toBe('稱職');
  });
});

describe('Act I Master Challenge', () => {
  test('separates a valid proportional target from reaching the 70/70 frontier', () => {
    const cutAndChoose = resolveActOneCutAndChoose();
    expect(cutAndChoose.finalAnalysis).not.toBeNull();
    const validTarget = evaluateActOneMasterChallenge(cutAndChoose.finalAnalysis!, true);
    expect(validTarget).toEqual({
      completed: true,
      reachedFrontier: false,
      masterSeal: false,
    });

    const frontier = evaluateActOneMasterChallenge(
      analyzeActOneAllocation(ACT_ONE_DEFINITION.demonstrations.frontier),
      true,
    );
    expect(frontier).toEqual({
      completed: true,
      reachedFrontier: true,
      masterSeal: true,
    });
  });

  test('withholds the Master Seal after seal eligibility is lost', () => {
    expect(evaluateActOneMasterChallenge(
      analyzeActOneAllocation(ACT_ONE_DEFINITION.demonstrations.frontier),
      false,
    )).toEqual({
      completed: true,
      reachedFrontier: true,
      masterSeal: false,
    });
  });
});

describe('Act I Cut-and-Choose', () => {
  test('reproduces the scripted elder-divides, younger-chooses result', () => {
    const result = resolveActOneCutAndChoose();

    expect(result.dividerBundleUtilities).toEqual([50, 50]);
    expect(result.chooserBundleUtilities).toEqual([30, 70]);
    expect(result.chooserSelection).toBe(1);
    expect(result.finalAnalysis).toMatchObject({
      utilities: [50n, 70n],
      proportionality: true,
      ef: true,
    });
  });

  test('uses the campaign-defined bundle-zero tie-break and returns a final result', () => {
    const result = resolveActOneCutAndChoose(
      ACT_ONE_DEFINITION.demonstrations.halfSplit,
    );

    expect(ACT_ONE_DEFINITION.cutAndChoose.chooserTieBreakBundle).toBe(0);
    expect(result.chooserBundleUtilities).toEqual([50, 50]);
    expect(result.chooserSelection).toBe(0);
    expect(result.finalAnalysis).toMatchObject({
      utilities: [50n, 50n],
      proportionality: true,
      ef: true,
    });
  });
});
