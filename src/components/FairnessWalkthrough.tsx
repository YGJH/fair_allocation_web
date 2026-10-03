'use client';

import { useState, type CSSProperties } from 'react';
import type { CaseInput } from '../domain/model';
import type { JsonScore } from '../domain/score';
import { copy, type Locale } from '../i18n/copy';

type Step = 'ef1' | 'efx' | 'nsw';
type Pair = { viewer: number; other: number; ownValue: number; otherValue: number; otherItems: number[] };

function bundleItems(owners: number[], owner: number) {
  return owners.flatMap((itemOwner, item) => itemOwner === owner ? [item] : []);
}

function valueOf(caseData: CaseInput, owners: number[], viewer: number, owner: number) {
  return bundleItems(owners, owner).reduce((sum, item) => sum + caseData.values[viewer][item], 0);
}

function comparisonPair(caseData: CaseInput, owners: number[], failure?: { i: number; j: number }): Pair | null {
  if (failure) {
    return {
      viewer: failure.i,
      other: failure.j,
      ownValue: valueOf(caseData, owners, failure.i, failure.i),
      otherValue: valueOf(caseData, owners, failure.i, failure.j),
      otherItems: bundleItems(owners, failure.j),
    };
  }
  let best: Pair | null = null;
  caseData.agents.forEach((_, viewer) => caseData.agents.forEach((__, other) => {
    if (viewer === other) return;
    const pair = {
      viewer,
      other,
      ownValue: valueOf(caseData, owners, viewer, viewer),
      otherValue: valueOf(caseData, owners, viewer, other),
      otherItems: bundleItems(owners, other),
    };
    if (!best || pair.otherValue - pair.ownValue > best.otherValue - best.ownValue) best = pair;
  }));
  return best;
}

function itemName(name: string) {
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
}

export function FairnessWalkthrough({
  locale,
  score,
  caseData,
  owners,
}: {
  locale: Locale;
  score: JsonScore;
  caseData: CaseInput;
  owners: number[];
}) {
  const t = copy[locale];
  const [step, setStep] = useState<Step>('ef1');
  const [run, setRun] = useState(0);
  const steps: Step[] = ['ef1', 'efx', 'nsw'];
  const activeIndex = steps.indexOf(step);
  const ef1Pair = comparisonPair(caseData, owners, score.ef1Failure);
  const efxPair = comparisonPair(caseData, owners, score.efxFailure);

  function selectStep(next: Step) {
    setStep(next);
    setRun((value) => value + 1);
  }

  function next() {
    if (activeIndex < steps.length - 1) selectStep(steps[activeIndex + 1]);
    else setRun((value) => value + 1);
  }

  return (
    <section className="fairness-walkthrough" aria-label={t.walkthroughTitle}>
      <header className="fairness-walkthrough__header">
        <p>{t.walkthroughIntro}</p>
        <span>{activeIndex + 1} / {steps.length}</span>
      </header>

      <div className="fairness-walkthrough__tabs" role="tablist" aria-label={t.walkthroughTitle}>
        {steps.map((name) => (
          <button
            type="button"
            role="tab"
            aria-selected={step === name}
            aria-controls="fairness-demo-panel"
            className={step === name ? 'is-active' : ''}
            key={name}
            onClick={() => selectStep(name)}
          >
            <span aria-hidden="true">{name === 'ef1' ? '◒' : name === 'efx' ? '✦' : '×'}</span>
            {name === 'ef1' ? t.ef1 : name === 'efx' ? t.efx : t.nswShort}
          </button>
        ))}
      </div>

      <div id="fairness-demo-panel" className={`fairness-demo fairness-demo--${step}`} role="tabpanel" key={`${step}-${run}`}>
        {step === 'ef1' && ef1Pair && <RemovalDemo kind="ef1" pair={ef1Pair} locale={locale} score={score} caseData={caseData} />}
        {step === 'efx' && efxPair && <RemovalDemo kind="efx" pair={efxPair} locale={locale} score={score} caseData={caseData} />}
        {step === 'nsw' && <NswDemo locale={locale} score={score} caseData={caseData} />}
      </div>

      <div className="fairness-walkthrough__actions">
        <p aria-live="polite">{step === 'ef1' ? t.ef1Definition : step === 'efx' ? t.efxDefinition : t.nswExplanation}</p>
        <button className="button button-secondary" type="button" onClick={next}>
          {activeIndex < steps.length - 1 ? t.nextConcept : t.playAgain}
        </button>
      </div>
    </section>
  );
}

function RemovalDemo({
  kind,
  pair,
  locale,
  score,
  caseData,
}: {
  kind: 'ef1' | 'efx';
  pair: Pair;
  locale: Locale;
  score: JsonScore;
  caseData: CaseInput;
}) {
  const t = copy[locale];
  const passes = kind === 'ef1' ? score.ef1 : score.efx;
  const positiveItems = pair.otherItems.filter((item) => caseData.values[pair.viewer][item] > 0);
  const removable = kind === 'ef1'
    ? pair.otherItems.slice().sort((a, b) => caseData.values[pair.viewer][b] - caseData.values[pair.viewer][a]).slice(0, 1)
    : positiveItems;
  const rows = removable.map((item) => ({
    item,
    value: caseData.values[pair.viewer][item],
    remaining: pair.otherValue - caseData.values[pair.viewer][item],
  }));

  return (
    <>
      <div className="fairness-demo__copy">
        <div>
          <p className="fairness-demo__concept">{kind === 'ef1' ? t.ef1Question : t.efxQuestion}</p>
          <p>{(kind === 'ef1' ? t.ef1DemoIntro : t.efxDemoIntro)
            .replaceAll('{person}', caseData.agents[pair.viewer])
            .replaceAll('{other}', caseData.agents[pair.other])}</p>
        </div>
        <span className={passes ? 'badge badge-positive' : 'badge badge-negative'}>{passes ? t.meetsCriterion : t.failsCriterion}</span>
      </div>

      <div className="removal-stage" aria-label={(kind === 'ef1' ? t.ef1DemoIntro : t.efxDemoIntro)
        .replaceAll('{person}', caseData.agents[pair.viewer])
        .replaceAll('{other}', caseData.agents[pair.other])}>
        <div className="removal-bundle removal-bundle--own">
          <span>{caseData.agents[pair.viewer]} · {t.currentBundle}</span>
          <strong>{pair.ownValue}</strong>
        </div>
        <div className="removal-stage__relation" aria-hidden="true">
          <span>{pair.ownValue >= pair.otherValue ? '≥' : '<'}</span>
          <i />
        </div>
        <div className="removal-bundle removal-bundle--other">
          <span>{caseData.agents[pair.other]} · {t.otherBundle}</span>
          <strong>{pair.otherValue}</strong>
          <div className="removal-items">
            {pair.otherItems.map((item) => (
              <span className={rows.some((row) => row.item === item) ? 'is-tested' : ''} key={caseData.items[item]}>
                {itemName(caseData.items[item])}<b>{caseData.values[pair.viewer][item]}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="removal-checks">
        {rows.length ? rows.map((row, index) => {
          const works = pair.ownValue >= row.remaining;
          return (
            <div className={works ? 'removal-check is-pass' : 'removal-check is-fail'} style={{ '--check-order': index } as CSSProperties} key={row.item}>
              <span className="removal-check__item">{t.removeItem} <strong>{caseData.items[row.item]}</strong></span>
              <span className="removal-check__math">{pair.otherValue} − {row.value} = <strong>{row.remaining}</strong></span>
              <span className="removal-check__result">{pair.ownValue} {works ? '≥' : '<'} {row.remaining} <b aria-label={works ? t.removalWorks : t.removalFails}>{works ? '✓' : '×'}</b></span>
            </div>
          );
        }) : <p className="removal-check removal-check--empty">{t.noValuedItems}</p>}
      </div>
    </>
  );
}

function NswDemo({ locale, score, caseData }: { locale: Locale; score: JsonScore; caseData: CaseInput }) {
  const t = copy[locale];
  return (
    <>
      <div className="fairness-demo__copy">
        <div>
          <p className="fairness-demo__concept">{t.nswQuestion}</p>
          <p>{t.nswDemoIntro}</p>
        </div>
        <span className="badge badge-positive">{t.exactScore}</span>
      </div>
      <div className="nsw-stage">
        <div className="nsw-people">
          {score.utilities.map((utility, index) => (
            <div className="nsw-person" style={{ '--utility-order': index } as CSSProperties} key={caseData.agents[index]}>
              <span>{caseData.agents[index]}</span>
              <strong>{utility}</strong>
            </div>
          ))}
        </div>
        <div className="nsw-equation" aria-label={`${score.utilities.join(' × ')} = ${score.nsw}`}>
          <span>{score.utilities.join(' × ')}</span>
          <i>=</i>
          <strong>{score.nsw}</strong>
        </div>
      </div>
      <p className="nsw-note">{t.nswBalanceNote}</p>
    </>
  );
}
