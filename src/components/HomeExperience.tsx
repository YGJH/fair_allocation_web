'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { Allocation, CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';
import type { SurveyQuestionKey, SurveySummary } from '../shared/survey';

type Question = {
  key: SurveyQuestionKey;
  allocationId: string;
  caseData: CaseInput;
  owners: Allocation;
};

type Props = {
  locale: Locale;
  allocationHref: string;
  questions: Question[];
};

const SESSION_KEY = 'fairness-survey-session';
const ITEM_COLORS = ['#45d2ad', '#86b7ff', '#ffb85a', '#c9a7ff', '#ff8f7b'];

function isSessionId(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export function HomeExperience({ locale, allocationHref, questions }: Props) {
  const t = copy[locale];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!isSessionId(stored)) return;
    setSessionId(stored);
    let active = true;
    void fetch(`/api/survey?sessionId=${encodeURIComponent(stored)}`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<SurveySummary>;
      })
      .then((data) => {
        if (!active) return;
        setSummary(data);
        const next = data.questions.findIndex((question) => question.userVerdict === null);
        if (next >= 0) setQuestionIndex(next);
      })
      .catch(() => {
        // A previous session is optional; the current question remains fully usable.
      });
    return () => { active = false; };
  }, []);

  function ensureSession() {
    if (sessionId) return sessionId;
    const next = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, next);
    setSessionId(next);
    return next;
  }

  async function answer(verdict: boolean) {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId: ensureSession(),
          allocationId: questions[questionIndex].allocationId,
          verdict,
        }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json() as SurveySummary;
      setSummary(data);
      const next = data.questions.findIndex((question) => question.userVerdict === null);
      if (next >= 0) setQuestionIndex(next);
    } catch {
      setError(t.surveyError);
    } finally {
      setPending(false);
    }
  }

  const complete = summary?.answered === questions.length;
  const current = questions[questionIndex];
  const currentCopy = current ? {
    identical: { category: t.identicalValues, title: t.identicalCaseTitle, detail: t.identicalCaseDetail },
    nonIdentical: { category: t.nonIdenticalValues, title: t.nonIdenticalCaseTitle, detail: t.nonIdenticalCaseDetail },
    optimalTension: { category: t.optimalTensionValues, title: t.optimalTensionTitle, detail: t.optimalTensionDetail },
    equalButMovable: { category: t.equalButMovableValues, title: t.equalButMovableTitle, detail: t.equalButMovableDetail },
    challenge: { category: t.challengeCase, title: t.challengeCaseTitle, detail: t.challengeCaseDetail },
  }[current.key] : null;
  const fairAnswers = summary?.questions.filter((question) => question.userVerdict === true).length ?? 0;
  const utilityBundles = current ? current.caseData.agents.map((agent, personIndex) => {
    const items = current.caseData.items
      .map((item, itemIndex) => ({
        item,
        itemIndex,
        contribution: current.caseData.values[personIndex][itemIndex],
      }))
      .filter(({ itemIndex }) => current.owners[itemIndex] === personIndex);
    const utility = items.reduce((total, { contribution }) => total + contribution, 0);
    return { agent, items, utility };
  }) : [];
  const maxUtility = Math.max(1, ...utilityBundles.map(({ utility }) => utility));

  return (
    <main id="main-content" className="home-main home-survey">
      <section className="survey-shell" aria-labelledby="home-title">
        <header className="survey-intro">
          <div>
            <p className="survey-kicker">{t.surveyEyebrow}</p>
            <h1 id="home-title">{t.surveyTitle}</h1>
          </div>
          <p>{t.surveyIntro}</p>
        </header>

        <div className={complete ? 'survey-workspace is-complete' : 'survey-workspace'}>
          {!complete && current && currentCopy ? (
            <div className="survey-question" key={current.allocationId}>
              <div className="survey-question__topline">
                <span>{t.surveyProgress.replace('{current}', String(questionIndex + 1)).replace('{total}', String(questions.length))}</span>
                <div className="survey-progress" aria-hidden="true">
                  {questions.map((question, index) => <i className={index <= questionIndex ? 'is-active' : ''} key={question.allocationId} />)}
                </div>
              </div>

              <div className="survey-question__layout">
                <div className="survey-prompt">
                  <p className="survey-category">{currentCopy.category}</p>
                  <h2>{currentCopy.title}</h2>
                  <p>{currentCopy.detail}</p>
                  <div className="survey-valuations">
                    <header>
                      <strong>{t.surveyValuationTitle}</strong>
                      <span>{t.surveyValuationHint}</span>
                    </header>
                    <table aria-label={t.surveyValuationTitle}>
                      <thead>
                        <tr>
                          <th scope="col">{t.goods}</th>
                          {current.caseData.agents.map((agent) => <th scope="col" key={agent}>{agent}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {current.caseData.items.map((item, itemIndex) => (
                          <tr key={item}>
                            <th scope="row">
                              <i style={{ '--survey-item-color': ITEM_COLORS[itemIndex % ITEM_COLORS.length] } as CSSProperties} />
                              <span>{item}<small>{t.surveyAllocatedTo.replace('{agent}', current.caseData.agents[current.owners[itemIndex]])}</small></span>
                            </th>
                            {current.caseData.agents.map((agent, personIndex) => (
                              <td className={current.owners[itemIndex] === personIndex ? 'is-owner' : undefined} key={agent}>
                                {current.caseData.values[personIndex][itemIndex]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <figure className="survey-utility" aria-labelledby={`survey-utility-title-${questionIndex}`}>
                  <figcaption>
                    <strong id={`survey-utility-title-${questionIndex}`}>{t.surveyUtilityTitle}</strong>
                    <span>{t.surveyUtilityHint}</span>
                  </figcaption>
                  <div
                    className="survey-utility__chart"
                    role="img"
                    aria-label={utilityBundles.map(({ agent, utility, items }) => `${agent}: ${utility}. ${t.surveyUtilityBreakdown}: ${items.map(({ item, contribution }) => `${item} +${contribution}`).join(', ')}`).join('. ')}
                  >
                    {utilityBundles.map(({ agent, utility, items }) => (
                      <div
                        className="survey-utility__column"
                        key={agent}
                        style={{ '--survey-utility-height': `${utility / maxUtility * 100}%` } as CSSProperties}
                      >
                        <div className="survey-utility__meter" aria-hidden="true">
                          <div className="survey-utility__stack">
                            {items.map(({ item, itemIndex, contribution }) => (
                              <i
                                className={contribution === 0 ? 'survey-utility__segment is-zero' : 'survey-utility__segment'}
                                key={itemIndex}
                                style={{
                                  '--survey-item-color': ITEM_COLORS[itemIndex % ITEM_COLORS.length],
                                  '--survey-item-share': utility > 0 ? contribution / utility : 0,
                                } as CSSProperties}
                              >
                                {contribution / maxUtility >= .12 && <span>{item}<b>+{contribution}</b></span>}
                              </i>
                            ))}
                          </div>
                          <strong className="survey-utility__total">{utility}</strong>
                        </div>
                        <h3>{agent}</h3>
                        <div className="survey-utility__breakdown">
                          <span>{t.surveyUtilityBreakdown}</span>
                          <ul>
                            {items.map(({ item, itemIndex, contribution }) => (
                              <li key={itemIndex}>
                                <i style={{ '--survey-item-color': ITEM_COLORS[itemIndex % ITEM_COLORS.length] } as CSSProperties} />
                                <span>{item}</span>
                                <strong>+{contribution}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </figure>
              </div>

              <div className="survey-decision" aria-live="polite">
                <div>
                  <h2>{t.surveyQuestion}</h2>
                  <p>{t.surveyDecisionHint}</p>
                </div>
                <div className="survey-decision__buttons">
                  <button type="button" className="survey-choice survey-choice--unfair" disabled={pending} onClick={() => answer(false)}>
                    <span aria-hidden="true">×</span>{t.unfairChoice}
                  </button>
                  <button type="button" className="survey-choice survey-choice--fair" disabled={pending} onClick={() => answer(true)}>
                    <span aria-hidden="true">✓</span>{t.fairChoice}
                  </button>
                </div>
              </div>
              {pending && <p className="survey-status" role="status">{t.surveySaving}</p>}
              {error && <p className="survey-status" role="alert">{error}</p>}
            </div>
          ) : summary ? (
            <div className="survey-results" aria-live="polite">
              <header className="survey-results__header">
                <div>
                  <p className="survey-kicker">{t.surveyComplete}</p>
                  <h2>{t.surveyResultsTitle}</h2>
                </div>
                <p className="survey-personal-score"><strong>{fairAnswers}</strong><span>/ {questions.length}<br />{t.surveyFairCount}</span></p>
              </header>

              <div className="survey-results__list">
                {summary.questions.map((result, index) => {
                  const question = questions[index];
                  const title = {
                    identical: t.identicalCaseTitle,
                    nonIdentical: t.nonIdenticalCaseTitle,
                    optimalTension: t.optimalTensionTitle,
                    equalButMovable: t.equalButMovableTitle,
                    challenge: t.challengeCaseTitle,
                  }[question.key];
                  return (
                    <article className="survey-result-row" key={result.allocationId}>
                      <div className="survey-result-row__answer">
                        <span>{index + 1}</span>
                        <div>
                          <h3>{title}</h3>
                          <p>{t.yourAnswer}: <strong>{result.userVerdict ? t.fairChoice : t.unfairChoice}</strong></p>
                        </div>
                      </div>
                      <div className="survey-result-row__community">
                        <div><span>{t.communityFair}</span><strong>{result.fairPercent ?? 0}%</strong></div>
                        <span className="survey-result-bar" aria-hidden="true"><i style={{ width: `${result.fairPercent ?? 0}%` }} /></span>
                        <small>{result.total} {t.surveyResponses}</small>
                      </div>
                    </article>
                  );
                })}
              </div>

              <footer className="survey-results__footer">
                <p>{t.surveyResultsIntro}</p>
                <a className="button button-primary" href={allocationHref}>{t.tryExample}</a>
              </footer>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
