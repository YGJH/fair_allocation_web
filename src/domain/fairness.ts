import type { Allocation, CaseInput } from './model';

export type EnvyWitness = {
  i: number;
  j: number;
  ownUtility: bigint;
  otherUtility: bigint;
  gap: bigint;
};

export type FairnessAnalysis = {
  utilities: bigint[];
  proportionality: boolean;
  ef: boolean;
  ef1: boolean;
  efx: boolean;
  nsw: bigint;
  envyPairs: EnvyWitness[];
  ef1Failure?: { i: number; j: number };
  efxFailure?: { i: number; j: number; item: number };
};

/** Computes all additive fairness measures from each observing agent's valuation row. */
export function analyzeFairness(c: CaseInput, allocation: Allocation): FairnessAnalysis {
  const bundles = c.agents.map((_, owner) => allocation.flatMap(
    (assignedOwner, item) => assignedOwner === owner ? [item] : [],
  ));
  const perceivedBundleUtilities = c.agents.map((_, observer) => bundles.map((bundle) => bundle.reduce(
    (sum, item) => sum + BigInt(c.values[observer][item]),
    0n,
  )));
  const utilities = c.agents.map((_, agent) => perceivedBundleUtilities[agent][agent]);
  const proportionality = c.agents.every((_, agent) => {
    const totalValue = c.values[agent].reduce((sum, value) => sum + BigInt(value), 0n);
    return utilities[agent] * BigInt(c.agents.length) >= totalValue;
  });

  const envyPairs: EnvyWitness[] = [];
  let ef1Failure: FairnessAnalysis['ef1Failure'];
  let efxFailure: FairnessAnalysis['efxFailure'];

  for (let i = 0; i < c.agents.length; i += 1) {
    for (let j = 0; j < c.agents.length; j += 1) {
      if (i === j) continue;

      const ownUtility = utilities[i];
      const otherUtility = perceivedBundleUtilities[i][j];
      if (ownUtility >= otherUtility) continue;

      envyPairs.push({ i, j, ownUtility, otherUtility, gap: otherUtility - ownUtility });
      const goods = bundles[j];
      if (!goods.some((item) => ownUtility >= otherUtility - BigInt(c.values[i][item]))) {
        ef1Failure ??= { i, j };
      }
      const offendingItem = goods.find(
        (item) => c.values[i][item] > 0 && ownUtility < otherUtility - BigInt(c.values[i][item]),
      );
      if (offendingItem !== undefined) efxFailure ??= { i, j, item: offendingItem };
    }
  }

  return {
    utilities,
    proportionality,
    ef: envyPairs.length === 0,
    ef1: ef1Failure === undefined,
    efx: efxFailure === undefined,
    nsw: utilities.reduce((product, utility) => product * utility, 1n),
    envyPairs,
    ...(ef1Failure && { ef1Failure }),
    ...(efxFailure && { efxFailure }),
  };
}
