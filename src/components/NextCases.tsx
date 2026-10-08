import { copy, type Locale } from '../i18n/copy';
import { FOLLOW_UP_CHALLENGE_CASES, PRACTICE_CASES } from '../shared/example';

type CardCopy = { category: string; title: string; detail: string };

export function NextCases({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const labels: Record<(typeof PRACTICE_CASES)[number]['key'], CardCopy> = {
    identical: { category: t.identicalValues, title: t.identicalCaseTitle, detail: t.identicalCaseDetail },
    nonIdentical: { category: t.nonIdenticalValues, title: t.nonIdenticalCaseTitle, detail: t.nonIdenticalCaseDetail },
    challenge: { category: t.challengeCase, title: t.challengeCaseTitle, detail: t.challengeCaseDetail },
  };
  const challengeLabels: Record<(typeof FOLLOW_UP_CHALLENGE_CASES)[number]['key'], CardCopy> = {
    optimalTension: { category: t.optimalTensionValues, title: t.optimalTensionTitle, detail: t.optimalTensionDetail },
    equalButMovable: { category: t.equalButMovableValues, title: t.equalButMovableTitle, detail: t.equalButMovableDetail },
  };
  const recommended = PRACTICE_CASES.find((entry) => entry.key === 'nonIdentical') ?? PRACTICE_CASES[0];
  const entries = [
    { entry: recommended, text: labels[recommended.key], label: t.recommendedCase },
    ...PRACTICE_CASES.filter((entry) => entry.id !== recommended.id).map((entry) => ({ entry, text: labels[entry.key], label: t.otherCases })),
    ...FOLLOW_UP_CHALLENGE_CASES.map((entry) => ({ entry, text: challengeLabels[entry.key], label: t.followUpChallenges })),
  ];

  return (
    <section className="practice-cases" aria-labelledby="practice-cases-title">
      <header className="practice-cases__heading">
        <h4 id="practice-cases-title">{t.practiceTitle}</h4>
        <p>{t.practiceIntro}</p>
      </header>

      <ol className="practice-list">
        {entries.map(({ entry, text, label }, index) => (
          <li key={entry.id}>
            <a href={`/${locale}/cases/${entry.id}`} aria-label={`${label}. ${text.category}: ${text.title}. ${t.startCase}`}>
              <span className="practice-list__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="practice-list__copy">
                <span>{index === 0 ? t.recommendedCase : text.category}</span>
                <h5>{text.title}</h5>
                <p>{text.detail}</p>
              </div>
              <strong>{t.startCase}</strong>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
