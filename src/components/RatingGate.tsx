'use client';

import { useEffect, useState } from 'react';
import type { CaseInput, Allocation } from '../domain/model';
import type { Aggregate } from '../server/repository';
import type { JsonScore } from '../domain/score';
import { copy, type Locale } from '../i18n/copy';
import { ScoreExplanation } from './ScoreExplanation';
import { FractionalComparison } from './FractionalComparison';

type Result = {
  score: JsonScore;
  aggregate: Aggregate | null;
  caseId?: string;
  persistence: 'live' | 'local';
};

type FallbackResult = { score: JsonScore; caseId: string };

export function RatingGate({
  locale,
  allocationId,
  caseData,
  owners,
  caseId,
  fallbackResult,
}: {
  locale: Locale;
  allocationId: string;
  caseData: CaseInput;
  owners: Allocation;
  caseId?: string;
  fallbackResult?: FallbackResult;
}) {
  const t = copy[locale];
  const [rating, setRating] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [previous, setPrevious] = useState(false);
  const [offerLocal, setOfferLocal] = useState(false);

  async function loadResults() {
    setError('');
    setPending(true);
    try {
      const response = await fetch(`/api/allocations/${allocationId}/results`);
      if (!response.ok) throw new Error();
      const payload = await response.json();
      setResult({ ...payload, persistence: 'live' });
    } catch {
      setError(t.ratingUnavailable);
      setOfferLocal(Boolean(fallbackResult));
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (fallbackResult && localStorage.getItem(`fair-rated-local:${allocationId}`)) {
      setPrevious(true);
      setResult({ score: fallbackResult.score, aggregate: null, caseId: fallbackResult.caseId, persistence: 'local' });
      return;
    }
    if (localStorage.getItem(`fair-rated:${allocationId}`)) {
      setPrevious(true);
      void loadResults();
    }
    // The allocation identity defines this one-time browser check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationId]);

  async function submit() {
    if (!rating || pending) return;
    setError('');
    setOfferLocal(false);
    setPending(true);
    try {
      const response = await fetch(`/api/allocations/${allocationId}/ratings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: Number(rating) }),
      });
      if (!response.ok) throw new Error();
      const payload = await response.json();
      localStorage.setItem(`fair-rated:${allocationId}`, '1');
      setResult({ ...payload, caseId: caseId ?? payload.caseId, persistence: 'live' });
    } catch {
      setError(t.ratingUnavailable);
      setOfferLocal(Boolean(fallbackResult));
    } finally {
      setPending(false);
    }
  }

  function revealLocally() {
    if (!fallbackResult) return;
    localStorage.setItem(`fair-rated-local:${allocationId}`, '1');
    setResult({ score: fallbackResult.score, aggregate: null, caseId: fallbackResult.caseId, persistence: 'local' });
    setError('');
    setOfferLocal(false);
  }

  const ratingLabels = [t.ratingOne, t.ratingTwo, t.ratingThree, t.ratingFour, t.ratingFive];
  const groups = caseData.agents.map((name, personIndex) => ({
    name,
    items: caseData.items.flatMap((item, itemIndex) => owners[itemIndex] === personIndex
      ? [{ name: item, value: caseData.values[personIndex][itemIndex] }]
      : []),
  }));
  const targetCaseId = caseId ?? result?.caseId;

  return (
    <section className="judgment">
      <nav className="breadcrumb" aria-label={locale === 'en' ? 'Breadcrumb' : '麵包屑導覽'}>
        <a href={`/${locale}`}>{t.backHome}</a>
        {targetCaseId && <><span aria-hidden="true">/</span><a href={`/${locale}/cases/${targetCaseId}`}>{t.navCase}</a></>}
      </nav>

      <header className="page-heading judgment-heading">
        <h1>{result ? t.resultsTitle : t.judgeTitle}</h1>
        <p>{result ? (result.persistence === 'local' ? t.localResultNote : previous ? t.previousResults : t.showResults) : t.judgeHint}</p>
      </header>

      <div className="judgment-layout">
        <div>
          <section className="panel bundle-panel" aria-labelledby="allocation-title">
            <div className="panel-heading">
              <div><h2 id="allocation-title">{t.allocation}</h2></div>
              <span className="badge">{caseData.items.length} {t.goods}</span>
            </div>
            <div className="bundle-grid">
              {groups.map(({ name, items }, i) => (
                <article className="bundle" key={name}>
                  <p className="bundle-person"><span className="person-icon" aria-hidden="true">{i + 1}</span>{name}</p>
                  <ul>
                    {items.length ? items.map((item) => (
                      <li key={item.name}>
                        <span>{item.name}</span>
                        <strong className="item-score" aria-label={`${t.itemValue} ${item.value}`}>{item.value}</strong>
                      </li>
                    )) : <li className="empty-bundle">{t.unassignedItems}</li>}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {result && (
            <section className="panel results-panel" aria-labelledby="results-title">
              <div className="panel-heading"><div><p className="flow-step">03 / 03</p><h2 id="results-title">{t.resultsTitle}</h2></div></div>
              <ScoreExplanation locale={locale} score={result.score} caseData={caseData} />
            </section>
          )}
        </div>

        <aside className="judgment-side">
          {!result ? (
            <section className="panel vote-panel" aria-busy={pending} aria-labelledby="rating-title">
              <p className="flow-step">02 / 03</p>
              <h2 id="rating-title">{t.chooseRating}</h2>
              {error && <p role="alert">{error}</p>}
              {offerLocal && fallbackResult && (
                <div className="offline-choice">
                  <h3>{t.offlineChoiceTitle}</h3>
                  <p>{t.offlineChoiceDetail}</p>
                  <button className="button button-secondary" type="button" onClick={revealLocally}>{t.continueLocally}</button>
                </div>
              )}
              {!previous ? (
                <>
                  <fieldset className="rating-fieldset" disabled={pending}>
                    <legend className="sr-only">{t.fairnessLabel}</legend>
                    <div className="rating-options">
                      {ratingLabels.map((label, index) => {
                        const value = String(index + 1);
                        return (
                          <label className="rating-option" key={value}>
                            <input type="radio" name="fair-rating" value={value} checked={rating === value} onClick={() => setRating(value)} onChange={(event) => setRating(event.target.value)} />
                            <span className="rating-number">{value}</span>
                            <span>{label.replace(/^\d\s—\s/, '')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <button className="button button-primary" type="button" disabled={!rating || pending} onClick={submit}>{pending ? t.submitting : t.submitRating}</button>
                </>
              ) : (
                <button className="button button-secondary" type="button" disabled={pending} onClick={loadResults}>{pending ? t.submitting : t.retry}</button>
              )}
            </section>
          ) : (
            <>
              {result.aggregate ? (
                <section className="panel aggregate-panel" aria-labelledby="responses-title">
                  <h2 id="responses-title">{t.votes}</h2>
                  <div className="aggregate-summary"><p className="aggregate-number">{result.aggregate.count}</p><p>{t.average}<strong>{result.aggregate.mean === null ? '—' : result.aggregate.mean.toFixed(1)} / 5</strong></p></div>
                  <ol className="histogram">
                    {result.aggregate.histogram.map((count, i) => <li key={i}><span>{i + 1}</span><span className="bar-track" aria-hidden="true"><span style={{ width: `${result.aggregate!.count ? count / result.aggregate!.count * 100 : 0}%` }} /></span><strong>{count}</strong></li>)}
                  </ol>
                  <p className="muted">{t.surveyCaveat}</p>
                </section>
              ) : (
                <section className="panel local-note"><h2>{t.offlineChoiceTitle}</h2><p>{t.localResultNote}</p></section>
              )}
              {targetCaseId && <a className="button button-primary back-to-case" href={`/${locale}/cases/${targetCaseId}`}>{t.backToCase} <span aria-hidden="true">↗</span></a>}
              {result.persistence === 'live' && targetCaseId && <FractionalComparison locale={locale} caseId={targetCaseId} />}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
