'use client';

import type { RefObject } from 'react';
import { resolveActOneCutAndChoose } from '../../narrative/campaign-rules';
import { ACT_ONE_DEFINITION } from '../../narrative/campaign-definition';
import type { CampaignAllocation, CampaignChallenge } from '../../narrative/types';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import { PortraitCard } from './PortraitCard';
import styles from './MasterChallenge.module.css';

type MasterChallengeProps = {
  readonly locale: Locale;
  readonly challenge: CampaignChallenge;
  readonly onChange: (allocation: CampaignAllocation) => void;
  readonly onHint: (stage: 1 | 2 | 3) => void;
  readonly onSubmit: () => void;
  readonly onSkip: () => void;
  readonly onLeave: () => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
};

export function MasterChallenge({
  locale,
  challenge,
  onChange,
  onHint,
  onSubmit,
  onSkip,
  onLeave,
  headingRef,
}: MasterChallengeProps) {
  const adventureCopy = getAdventureCopy(locale);
  const copy = adventureCopy.masterChallenge;
  const zhou = adventureCopy.investigation.parties.masterZhou;
  const allocation = challenge.allocation;
  const outcome = allocation ? resolveActOneCutAndChoose(allocation) : null;
  const goodNames = getAdventureCopy(locale).investigation.allocation.goodNames;
  const bundleLabel = (bundle: number) => bundle === 0 ? copy.bundleA : copy.bundleB;

  return (
    <section className={styles.panel} aria-labelledby="master-challenge-title">
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h2 ref={headingRef} tabIndex={-1} id="master-challenge-title">{copy.heading}</h2>
      <PortraitCard locale={locale} characterId="master-zhou" expression="hint1" presentation="workbench" name={zhou.name} role={zhou.role} />
      <p>{copy.body}</p>
      <p className={styles.definition}>{copy.assignmentDefinition}</p>

      <div className={styles.goods} aria-label={copy.assignmentLabel}>
        {ACT_ONE_DEFINITION.goods.map((good) => {
          const row = allocation?.find((candidate) => candidate.goodId === good.id);
          const firstBundleShares = row?.shares[0] ?? 0;
          return (
            <fieldset key={good.id} className={styles.good}>
              <legend>{goodNames[good.id]}</legend>
              <label htmlFor={`challenge-${good.id}`}>
                {copy.bundleShare(bundleLabel(0), firstBundleShares)}
              </label>
              <input
                id={`challenge-${good.id}`}
                type="range"
                min={0}
                max={10}
                step={1}
                value={firstBundleShares}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (!allocation || !Number.isInteger(value)) return;
                  onChange(allocation.map((candidate) => candidate.goodId === good.id
                    ? { goodId: candidate.goodId, shares: [value, 10 - value] as const }
                    : candidate));
                }}
                aria-label={copy.assignmentControl(goodNames[good.id], bundleLabel(0), bundleLabel(1), firstBundleShares, 10 - firstBundleShares)}
                aria-valuetext={copy.assignmentControl(goodNames[good.id], bundleLabel(0), bundleLabel(1), firstBundleShares, 10 - firstBundleShares)}
              />
              <div className={styles.bundleLabels} aria-hidden="true">
                <span>{bundleLabel(0)} {firstBundleShares}/10</span>
                <span>{bundleLabel(1)} {10 - firstBundleShares}/10</span>
              </div>
            </fieldset>
          );
        })}
      </div>

      {outcome ? (
        <div className={styles.outcome} aria-labelledby="challenge-outcome-title">
          <h3 id="challenge-outcome-title">{copy.outcomeHeading}</h3>
          <p>{copy.dividerOutcome(outcome.dividerBundleUtilities[0], outcome.dividerBundleUtilities[1])}</p>
          <p>{copy.chooserOutcome(
            bundleLabel(outcome.chooserSelection),
            outcome.chooserBundleUtilities[outcome.chooserSelection],
          )}</p>
          <p className={styles.accessibleEquivalent}>{copy.choiceAccessible(
            bundleLabel(outcome.chooserSelection),
            outcome.chooserBundleUtilities[outcome.chooserSelection],
          )}</p>
        </div>
      ) : null}

      <div className={styles.hints} aria-labelledby="challenge-hints-title">
        <h3 id="challenge-hints-title">{copy.hintsHeading}</h3>
        <p>{copy.hintStage(challenge.hintStage)}</p>
        {challenge.hintStage > 0 ? (
          <div>
            <PortraitCard locale={locale} characterId="master-zhou" expression={challenge.hintStage % 2 === 0 ? 'hint2' : 'hint1'} presentation="workbench" name={zhou.name} role={zhou.role} />
            <p>{copy.hintText(challenge.hintStage)}</p>
          </div>
        ) : null}
        <div className={styles.actions}>
          {([1, 2, 3] as const).map((stage) => (
            <button
              key={stage}
              type="button"
              className={styles.secondary}
              disabled={challenge.hintStage >= stage}
              onClick={() => onHint(stage)}
            >
              {copy.hintButton(stage)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.completion} aria-labelledby="challenge-completion-title" aria-live="polite">
        <h3 id="challenge-completion-title">{copy.completionHeading}</h3>
        <p>{challenge.status === 'completed' ? copy.completed : copy.notCompleted}</p>
        <p>{challenge.reachedFrontier ? copy.frontierReached : copy.frontierNotReached}</p>
        {challenge.status === 'completed' ? (
          <div>
            {challenge.reachedFrontier ? <PortraitCard locale={locale} characterId="master-zhou" expression="pleased" presentation="workbench" name={zhou.name} role={zhou.role} /> : null}
            <p>{copy.completionDialogue}</p>
          </div>
        ) : null}
        <p>{challenge.masterSeal ? copy.sealAwarded : copy.sealUnavailable}</p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onSubmit}>
          {challenge.status === 'completed' ? copy.submitAgain : copy.submit}
        </button>
        <button type="button" className={styles.secondary} onClick={onLeave}>{copy.returnToLedger}</button>
        <button type="button" className={styles.text} onClick={onSkip}>{copy.skip}</button>
      </div>
      <p className={styles.accessibleEquivalent}>{copy.noGameOver}</p>
    </section>
  );
}

export type { MasterChallengeProps };
