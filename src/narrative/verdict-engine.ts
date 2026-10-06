import { scoreAllocation } from '../domain/score';
import type { NarrativeScenario, VerdictReport } from './types';
import { scenarioCaseData } from './types';

function itemUtilities(scenario: NarrativeScenario, owners: number[]) {
  return scenario.agents.map((_, agentIndex) => scenario.items.reduce(
    (sum, _item, itemIndex) => sum + (owners[itemIndex] === agentIndex ? scenario.values[agentIndex][itemIndex] : 0),
    0,
  ));
}

export function evaluateVerdict(
  scenario: NarrativeScenario,
  owners: number[],
  silver: number[] = scenario.agents.map(() => 0),
): VerdictReport {
  if (owners.length !== scenario.items.length || owners.some((owner) => owner < 0 || owner >= scenario.agents.length)) {
    throw new Error('Every item must have a valid owner before evaluating a verdict.');
  }

  const base = scoreAllocation(scenarioCaseData(scenario, 'en'), owners);
  const indivisibleUtilities = itemUtilities(scenario, owners);
  const utilities = indivisibleUtilities.map((utility, index) => utility + (silver[index] ?? 0));
  const nsw = utilities.reduce((product, utility) => product * BigInt(utility), 1n).toString();
  const envyPairs = scenario.agents.flatMap((_, from) => scenario.agents.flatMap((__, to) => {
    if (from === to) return [];
    const otherItems = scenario.items.reduce(
      (sum, _item, itemIndex) => sum + (owners[itemIndex] === to ? scenario.values[from][itemIndex] : 0),
      0,
    );
    const otherValue = otherItems + (silver[to] ?? 0);
    return utilities[from] < otherValue
      ? [{ from, to, ownValue: utilities[from], otherValue }]
      : [];
  }));

  return {
    utilities,
    nsw,
    ef: envyPairs.length === 0,
    ef1: base.ef1,
    efx: base.efx,
    envyPairs,
    ...(base.ef1Failure && { ef1Failure: base.ef1Failure }),
    ...(base.efxFailure && { efxFailure: base.efxFailure }),
    zeroUtility: utilities.some((utility) => utility === 0),
  };
}

export function isMasterSolution(scenario: NarrativeScenario, owners: number[], silver: number[]) {
  return scenario.masterAllocation.every((owner, index) => owners[index] === owner)
    && (!scenario.masterSilver || scenario.masterSilver.every((amount, index) => silver[index] === amount));
}
