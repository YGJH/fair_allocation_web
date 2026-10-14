/** @vitest-environment jsdom */
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getAdventureCopy } from '../src/i18n/adventure';
import { NationalEnding } from '../src/components/adventure/NationalEnding';
import type { CampaignEndingState } from '../src/narrative/types';

afterEach(cleanup);

function ending(endingId: CampaignEndingState['resolution']['ending'], severity: CampaignEndingState['resolution']['severity']): CampaignEndingState {
  return {
    resolution: {
      ending: endingId,
      severity,
      mostAggrievedParty: endingId === '江陵之怨' ? '外朝' : endingId === '薊門之怨' ? '薊鎮' : endingId === '大璫之怨' ? '內廷' : null,
      envyGap: endingId === '鼎足而立' || endingId === '留中不發' ? null : 12,
    },
    hiddenEnding: false,
    summary: {
      grades: ['稱職', '平常', '不稱職'],
      initialRatings: [4, 3, 2],
      masterSeals: [false, false, false],
      yiwuVignette: 'competent-or-better',
      hangzhouVignette: 'ordinary-or-below',
      overallSeal: '循例之官',
      hiddenEnding: false,
    },
    nationalCutsceneWatched: true,
    hiddenCutsceneWatched: false,
  };
}

describe('NationalEnding', () => {
  test('renders the canonical severity-specific copy for all grievance endings in both locales', () => {
    for (const locale of ['zh-TW', 'en'] as const) {
      const copy = getAdventureCopy(locale).ending;
      for (const endingId of ['江陵之怨', '薊門之怨', '大璫之怨'] as const) {
        for (const severity of ['mild', 'severe'] as const) {
          render(<NationalEnding locale={locale} ending={ending(endingId, severity)} records={[]} onContinue={vi.fn()} />);
          expect(screen.getByText(copy.history[endingId][severity].formal, { exact: true })).toBeTruthy();
          expect(screen.getByText(copy.history[endingId][severity].plain, { exact: true })).toBeTruthy();
          cleanup();
        }
      }
      for (const endingId of ['鼎足而立', '留中不發'] as const) {
        render(<NationalEnding locale={locale} ending={ending(endingId, 'none')} records={[]} onContinue={vi.fn()} />);
        expect(screen.getByText(copy.history[endingId].formal, { exact: true })).toBeTruthy();
        expect(screen.getByText(copy.history[endingId].plain, { exact: true })).toBeTruthy();
        cleanup();
      }
    }
  });

  test('localizes ending metadata and record-driven epilogue summary in both locales', () => {
    for (const locale of ['en', 'zh-TW'] as const) {
      const copy = getAdventureCopy(locale).ending;
      render(<NationalEnding locale={locale} ending={ending('江陵之怨', 'mild')} records={[]} onContinue={vi.fn()} />);
      expect(screen.getByText(`${copy.mostAggrievedLabel}: ${copy.mostAggrievedPartyNames['外朝']}`, { exact: true })).toBeTruthy();
      expect(screen.getAllByText(copy.gradeNames['稱職'], { exact: false }).length).toBeGreaterThan(0);
      expect(screen.getByText(copy.vignettes.yiwu['competent-or-better'], { exact: false })).toBeTruthy();
      expect(screen.getByText(copy.vignettes.hangzhou['ordinary-or-below'], { exact: false })).toBeTruthy();
      expect(screen.getByText(copy.overallSealNames['循例之官'], { exact: true })).toBeTruthy();
      if (locale === 'en') {
        expect(screen.queryByText(/外朝|薊鎮|內廷/)).toBeNull();
      }
      cleanup();
    }
  });

  test('attaches the phase heading ref and replaces the control with a persisted completion state', () => {
    const headingRef = createRef<HTMLHeadingElement>();
    const onContinue = vi.fn();
    const completed = ending('鼎足而立', 'none');
    render(<NationalEnding locale="en" ending={completed} records={[]} headingRef={headingRef} onContinue={onContinue} />);
    expect(headingRef.current).toBe(screen.getByRole('heading', { name: 'Three legs standing' }));
    expect(headingRef.current?.tabIndex).toBe(-1);
    expect(screen.getByRole('button', { name: 'Complete epilogue' })).toBeTruthy();

    cleanup();
    render(<NationalEnding locale="en" ending={completed} records={[]} headingRef={headingRef} completed onContinue={onContinue} />);
    expect(screen.getByText('Epilogue complete')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Complete epilogue' })).toBeNull();
  });
});
