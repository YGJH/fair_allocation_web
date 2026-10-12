import { copy, type Locale } from '../i18n/copy';
import { CURATED_CASES } from '../shared/example';

export function NextCases({ locale, currentCaseId }: { locale: Locale; currentCaseId?: string }) {
  const t = copy[locale];
  const entries = CURATED_CASES.filter((entry) => entry.id !== currentCaseId);

  return (
    <section className="practice-cases" aria-labelledby="practice-cases-title">
      <header className="practice-cases__heading">
        <h2 id="practice-cases-title">{t.practiceTitle}</h2>
        <p>{t.practiceIntro}</p>
      </header>

      <ol className="practice-list">
        {entries.map((entry) => {
          const caseNumber = CURATED_CASES.findIndex((candidate) => candidate.id === entry.id) + 1;
          const caseLabel = t.caseOption.replace('{number}', String(caseNumber).padStart(2, '0'));
          const itemCount = t.caseItemCount.replace('{count}', String(entry.caseData.items.length));
          const valuesLabel = entry.caseData.agents
            .map((agent, index) => `${agent}: ${entry.caseData.values[index].join(', ')}`)
            .join('; ');

          return (
            <li key={entry.id}>
              <a href={`/${locale}/cases/${entry.id}`} aria-label={`${caseLabel}. ${itemCount}. ${valuesLabel}. ${t.startCase}`}>
                <span className="practice-list__number" aria-hidden="true">{String(caseNumber).padStart(2, '0')}</span>
                <div className="practice-list__copy">
                  <h3>{caseLabel}</h3>
                  <span>{itemCount}</span>
                  <div className="practice-list__values" aria-hidden="true">
                    {entry.caseData.agents.map((agent, index) => (
                      <span key={agent}><b>{agent}</b>{entry.caseData.values[index].join(' · ')}</span>
                    ))}
                  </div>
                </div>
                <strong>{t.startCase}</strong>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
