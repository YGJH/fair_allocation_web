import { copy, type Locale } from '../i18n/copy';

export type LeaderRow = { id: string; kind: string; nsw: string; owners: number[] };

export function Leaderboard({ locale, rows }: { locale: Locale; rows: LeaderRow[] }) {
  const t = copy[locale];
  let rank = 0;
  let last = '';
  const hasVisitor = rows.some((row) => row.kind !== 'baseline');

  return (
    <section className="panel leaderboard" aria-labelledby="leaderboard-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t.exactNsw}</p>
          <h2 id="leaderboard-title">{t.leaderboard}</h2>
        </div>
      </div>
      {!hasVisitor && <p className="empty-note">{t.noEntries}</p>}
      <ol>
        {rows.map((row, index) => {
          if (row.nsw !== last) {
            rank = index + 1;
            last = row.nsw;
          }
          return (
            <li key={row.id}>
              <a href={`/${locale}/allocations/${row.id}`} aria-label={`${row.kind === 'baseline' ? t.baseline : t.visitor}, ${t.exactNsw} ${row.nsw}`}>
                <span className="rank">#{rank}</span>
                <span className="leader-kind">
                  {row.kind === 'baseline' ? t.baseline : t.visitor}
                  {row.kind === 'baseline' && <span className="badge">{t.caseEyebrow}</span>}
                </span>
                <span className="leader-score"><small>{t.exactNsw}</small><strong>{row.nsw}</strong></span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
