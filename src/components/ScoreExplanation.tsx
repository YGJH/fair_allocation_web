import type { JsonScore } from '../domain/score';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';
import type { AllocationStanding } from '../server/repository';
import { FairnessWalkthrough } from './FairnessWalkthrough';

export function ScoreExplanation({ locale, score, caseData, owners, standing = null, animated = false }: { locale: Locale; score: JsonScore; caseData: CaseInput; owners: number[]; standing?: AllocationStanding | null; animated?: boolean }) {
  const t = copy[locale];
  const standingPanel = standing ? <NswStanding locale={locale} standing={standing} /> : null;

  if (animated) {
    return <div className="results-block results-block--walkthrough">{standingPanel}<FairnessWalkthrough locale={locale} score={score} caseData={caseData} owners={owners} /></div>;
  }

  const criteria = [
    { key: 'ef1', name: t.ef1, definition: t.ef1Definition, passes: score.ef1, failure: score.ef1Failure },
    { key: 'efx', name: t.efx, definition: t.efxDefinition, passes: score.efx, failure: score.efxFailure },
  ] as const;

  return (
    <div className="results-block">
      <div className="result-score">
        <div>
          <p className="eyebrow">{t.nswScore}</p>
          <p className="score-number">{score.nsw}</p>
        </div>
        <p>{t.nswExplanation}</p>
      </div>

      {standingPanel}

      <div className="utility-section">
        <h3>{t.bundleValue}</h3>
        <ul className="utility-list">
          {score.utilities.map((utility, i) => <li key={caseData.agents[i]}><span>{caseData.agents[i]}</span><strong>{utility}</strong></li>)}
        </ul>
      </div>

      <div className="criteria">
        {criteria.map((criterion) => (
          <article className="criterion" key={criterion.key}>
            <div className="criterion-heading">
              <strong>{criterion.name}</strong>
              <span className={criterion.passes ? 'badge badge-positive' : 'badge badge-negative'}>
                {criterion.passes ? t.meetsCriterion : t.failsCriterion}
              </span>
            </div>
            <p>{criterion.definition}</p>
            {criterion.failure && (
              <p className="witness">
                {t.witness}: {caseData.agents[criterion.failure.i]} → {caseData.agents[criterion.failure.j]}
                {'item' in criterion.failure ? ` · ${caseData.items[criterion.failure.item]}` : ''}
              </p>
            )}
          </article>
        ))}
      </div>
      <details className="definition-details"><summary>{t.moreDetail}</summary><p>{t.positiveConvention}</p></details>
    </div>
  );
}

function NswStanding({ locale, standing }: { locale: Locale; standing: AllocationStanding }) {
  const t = copy[locale];
  const hasPeers = standing.beatPercent !== null;
  const tiedPeers = Math.max(0, standing.tied - 1);
  const headline = hasPeers
    ? t.beatsAllocations.replace('{percent}', String(standing.beatPercent))
    : t.firstCompetitionEntry;

  return (
    <section className="nsw-standing" aria-labelledby="nsw-standing-title">
      <div className="nsw-standing__score">
        <p id="nsw-standing-title">{t.nswPr}</p>
        <p><strong>{hasPeers ? standing.beatPercent : '—'}</strong>{hasPeers && <span>%</span>}</p>
      </div>
      <div className="nsw-standing__summary">
        <h3>{headline}</h3>
        <p>{hasPeers ? t.competitionSample : t.firstCompetitionDetail}</p>
        {hasPeers && <span className="nsw-standing__track" aria-hidden="true"><i style={{ width: `${standing.beatPercent}%` }} /></span>}
      </div>
      <dl className="nsw-standing__meta">
        <div><dt>{t.competitionRank}</dt><dd>#{standing.rank} / {standing.total}</dd></div>
        {tiedPeers > 0 && <div><dt>{t.sameScore}</dt><dd>{t.tiedAllocations.replace('{count}', String(tiedPeers))}</dd></div>}
      </dl>
    </section>
  );
}
