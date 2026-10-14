import { describe, expect, test } from 'vitest';
import { analyzeFairness } from '../src/domain/fairness';
import { parseCase } from '../src/domain/model';
import { fromJsonScore, scoreAllocation, toJsonScore } from '../src/domain/score';

describe('fairness analysis', () => {
  test('computes equal own utilities and subjective envy witnesses from the observer row', () => {
    const caseData = parseCase({
      agents: ['A', 'B'],
      items: ['x', 'y'],
      values: [
        [50, 70],
        [10, 50],
      ],
    });

    expect(analyzeFairness(caseData, [0, 1])).toMatchObject({
      utilities: [50n, 50n],
      nsw: 2500n,
      proportionality: false,
      ef: false,
      ef1: true,
      efx: true,
      envyPairs: [{ i: 0, j: 1, ownUtility: 50n, otherUtility: 70n, gap: 20n }],
    });
  });

  test('reports proportionality and EF when every agent receives enough by their own values', () => {
    const caseData = parseCase({
      agents: ['A', 'B'],
      items: ['x', 'y'],
      values: [
        [6, 4],
        [3, 7],
      ],
    });

    expect(analyzeFairness(caseData, [0, 1])).toMatchObject({
      utilities: [6n, 7n],
      proportionality: true,
      ef: true,
      envyPairs: [],
    });
  });

  test('distinguishes EF1 from EFX and ignores zero-valued goods in the EFX universal test', () => {
    const caseData = parseCase({
      agents: ['A', 'B'],
      items: ['own', 'large', 'small', 'zero'],
      values: [
        [2, 3, 1, 0],
        [0, 0, 0, 0],
      ],
    });

    expect(analyzeFairness(caseData, [0, 1, 1, 1])).toMatchObject({
      ef: false,
      ef1: true,
      efx: false,
      efxFailure: { i: 0, j: 1, item: 2 },
    });
  });

  test('returns deterministic EF1 and EFX failure witnesses', () => {
    const caseData = parseCase({
      agents: ['A', 'B'],
      items: ['own', 'first', 'second'],
      values: [
        [1, 2, 2],
        [0, 0, 0],
      ],
    });

    expect(analyzeFairness(caseData, [0, 1, 1])).toMatchObject({
      ef1: false,
      efx: false,
      ef1Failure: { i: 0, j: 1 },
      efxFailure: { i: 0, j: 1, item: 1 },
    });
  });

  test('keeps zero utility and the exact NSW product', () => {
    const caseData = parseCase({
      agents: ['A', 'B'],
      items: ['x', 'y'],
      values: [
        [0, 0],
        [0, 7],
      ],
    });

    expect(analyzeFairness(caseData, [0, 1])).toMatchObject({
      utilities: [0n, 7n],
      nsw: 0n,
    });
  });
});

test('scoreAllocation preserves its public and serialized contract while delegating', () => {
  const caseData = parseCase({
    agents: ['A', 'B'],
    items: ['x', 'y'],
    values: [
      [3, 0],
      [0, 2],
    ],
  });
  const score = scoreAllocation(caseData, [0, 1]);

  expect(score).toEqual({ utilities: [3n, 2n], nsw: '6', ef1: true, efx: true });
  expect(toJsonScore(score)).toEqual({ utilities: ['3', '2'], nsw: '6', ef1: true, efx: true });
  expect(fromJsonScore(toJsonScore(score))).toEqual(score);
});
