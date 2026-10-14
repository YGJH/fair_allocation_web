/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { ActTwoChallenge } from '../src/components/adventure/ActTwoChallenge';
import { ActTwoDebrief } from '../src/components/adventure/ActTwoVerdict';
import { MasterChallenge } from '../src/components/adventure/MasterChallenge';
import { ACT_TWO_DEFINITION } from '../src/narrative/campaign-definition';
import { analyzeActTwoAllocation } from '../src/narrative/campaign-rules';
import type { CampaignVerdict } from '../src/narrative/types';
import { initialCampaignState } from '../src/narrative/state-machine';

type ActTwoDemonstration =
  | typeof ACT_TWO_DEFINITION.demonstrations.patriarchal
  | typeof ACT_TWO_DEFINITION.demonstrations.compensation;

function verdictFor(allocation: ActTwoDemonstration): CampaignVerdict {
  const analysis = analyzeActTwoAllocation(allocation);
  return {
    allocation: allocation.map((row) => ({ goodId: row.goodId, shares: 'shares' in row ? [...row.shares] : [], ...('owner' in row ? { owner: row.owner } : {}) })),
    metrics: {
      utilities: analysis.utilities.map(Number),
      nsw: analysis.nsw.toString(),
      proportionality: analysis.proportionality,
      ef: analysis.ef,
      ef1: analysis.ef1,
      efx: analysis.efx,
      envyPairs: analysis.envyPairs.map(({ i, j, gap }) => ({ i, j, gap: Number(gap) })),
    },
    missingClueIds: ['clue-pei-zhongwen-valuations', 'clue-xue-shoucheng-valuations'],
  };
}

afterEach(cleanup);

describe('IP-10 Act II debrief', () => {
  test('conditionally reports unmet proportionality and reveals the authored matrix with investigation status', () => {
    render(<ActTwoDebrief locale="en" verdict={verdictFor(ACT_TWO_DEFINITION.demonstrations.patriarchal)} onContinue={() => {}} />);

    expect(screen.getByText('At least one party falls below one third of the whole in their own valuation.')).toBeTruthy();
    expect(screen.queryByText('Each party reaches at least one third of the whole in their own valuation.')).toBeNull();
    expect(screen.getByRole('table', { name: /authored value of every good/i })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Pei Boqian' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: '30 Already heard' })).toBeTruthy();
    expect(screen.getAllByRole('cell', { name: '10 Newly revealed' })).toHaveLength(3);
    expect(screen.getByRole('cell', { name: '50 Newly revealed' })).toBeTruthy();
    expect(screen.getByText(/no split of the three divisible goods removes every envy/)).toBeTruthy();
  });

  test('does not attach the son-owned dead-end note to an Xue-owned allocation', () => {
    render(<ActTwoDebrief locale="en" verdict={verdictFor(ACT_TWO_DEFINITION.demonstrations.compensation)} onContinue={() => {}} />);

    expect(screen.queryByText(/When the workshop owner is either son/)).toBeNull();
  });

  test('phase headings remain programmatically focusable across Act I and Act II challenge components', () => {
    const actOneRef = { current: null } as RefObject<HTMLHeadingElement | null>;
    const actTwoRef = { current: null } as RefObject<HTMLHeadingElement | null>;
    render(
      <>
        <MasterChallenge locale="en" challenge={initialCampaignState().challenge} headingRef={actOneRef} onChange={() => {}} onHint={() => {}} onSubmit={() => {}} onSkip={() => {}} onLeave={() => {}} />
        <ActTwoChallenge locale="en" challenge={initialCampaignState().challenge} headingRef={actTwoRef} onChange={() => {}} onSubmit={() => {}} onSkip={() => {}} onLeave={() => {}} />
      </>,
    );
    const actOneHeading = screen.getByRole('heading', { name: 'Cut, then let the younger brother choose' });
    const actTwoHeading = screen.getByRole('heading', { name: 'Act II Master Challenge' });
    expect(actOneHeading.tabIndex).toBe(-1);
    expect(actTwoHeading.tabIndex).toBe(-1);
    expect(actOneRef.current).toBe(actOneHeading);
    expect(actTwoRef.current).toBe(actTwoHeading);
    expect(document.querySelectorAll('#master-challenge-title')).toHaveLength(1);
    expect(document.querySelectorAll('#act-two-challenge-title')).toHaveLength(1);
  });
});
