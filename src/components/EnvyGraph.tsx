'use client';

import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';

type Point = { x: number; y: number };
type EnvyEdge = { from: number; to: number; gap: number; strength: number };

type PersonState = {
  ownValue: number;
  strongestGap: number;
  strength: number;
};

const WIDTH = 680;
const HEIGHT = 400;
const NODE_RADIUS = 48;

function nodePositions(count: number): Point[] {
  if (count === 1) return [{ x: WIDTH / 2, y: HEIGHT / 2 }];
  if (count === 2) return [{ x: 145, y: HEIGHT / 2 }, { x: WIDTH - 145, y: HEIGHT / 2 }];
  const radiusX = Math.min(245, 130 + count * 18);
  const radiusY = Math.min(88, 58 + count * 9);
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
    return { x: WIDTH / 2 + Math.cos(angle) * radiusX, y: HEIGHT / 2 + Math.sin(angle) * radiusY };
  });
}

function edgePath(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / distance;
  const uy = dy / distance;
  const start = { x: from.x + ux * (NODE_RADIUS + 7), y: from.y + uy * (NODE_RADIUS + 7) };
  const end = { x: to.x - ux * (NODE_RADIUS + 13), y: to.y - uy * (NODE_RADIUS + 13) };
  const bend = Math.min(42, distance * 0.14);
  const control = {
    x: (start.x + end.x) / 2 - uy * bend,
    y: (start.y + end.y) / 2 + ux * bend,
  };
  const label = {
    x: .25 * start.x + .5 * control.x + .25 * end.x,
    y: .25 * start.y + .5 * control.y + .25 * end.y,
  };
  return { d: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`, label };
}

function shortName(name: string) {
  return name.length > 15 ? `${name.slice(0, 14)}…` : name;
}

function emotionLabel(strength: number, t: typeof copy[Locale]) {
  if (strength <= 0) return t.noEnvy;
  if (strength < .18) return t.envyMoodSmall;
  if (strength < .45) return t.envyMoodMedium;
  return t.envyMoodLarge;
}

export function EnvyGraph({ locale, caseData, owners }: { locale: Locale; caseData: CaseInput; owners: number[] }) {
  const t = copy[locale];
  const assigned = owners.filter((owner) => owner >= 0).length;
  const positions = nodePositions(caseData.agents.length);
  const people: PersonState[] = caseData.agents.map((_, personIndex) => {
    const bundleValues = caseData.agents.map((__, ownerIndex) => caseData.items.reduce(
      (sum, ___, itemIndex) => sum + (owners[itemIndex] === ownerIndex ? caseData.values[personIndex][itemIndex] : 0),
      0,
    ));
    const ownValue = bundleValues[personIndex];
    const strongestGap = Math.max(0, ...bundleValues.map((value, ownerIndex) => ownerIndex === personIndex ? 0 : value - ownValue));
    const totalValue = caseData.values[personIndex].reduce((sum, value) => sum + value, 0);
    return { ownValue, strongestGap, strength: strongestGap / Math.max(1, totalValue) };
  });
  const edges: EnvyEdge[] = [];
  caseData.agents.forEach((_, from) => {
    const ownValue = people[from].ownValue;
    caseData.agents.forEach((__, to) => {
      if (from === to) return;
      const otherValue = caseData.items.reduce(
        (sum, ___, itemIndex) => sum + (owners[itemIndex] === to ? caseData.values[from][itemIndex] : 0),
        0,
      );
      const gap = otherValue - ownValue;
      if (gap > 0) {
        const totalValue = caseData.values[from].reduce((sum, value) => sum + value, 0);
        edges.push({ from, to, gap, strength: gap / Math.max(1, totalValue) });
      }
    });
  });
  const animationKey = owners.join('-');

  return (
    <section className="envy-graph" aria-labelledby="envy-graph-title">
      <div className="envy-graph__heading">
        <div>
          <h3 id="envy-graph-title">{t.envyGraphTitle}</h3>
          <p>{t.envyGraphHint}</p>
        </div>
        <span className="envy-graph__live"><i aria-hidden="true" />{t.envyGraphLive}</span>
      </div>

      <div className="envy-graph__canvas" aria-live="polite">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="envy-svg-title envy-svg-description">
          <title id="envy-svg-title">{t.envyGraphTitle}</title>
          <desc id="envy-svg-description">{assigned === 0 ? t.envyGraphEmpty : edges.length === 0 ? t.everyoneContent : t.envyGraphDescription}</desc>
          <defs>
            <marker id="envy-arrow-soft" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 8 4.5 L 0 9 z" fill="#d18b20" />
            </marker>
            <marker id="envy-arrow-strong" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 8 4.5 L 0 9 z" fill="#d94b3d" />
            </marker>
          </defs>

          <g key={`edges-${animationKey}`} className="envy-edges">
            {edges.map((edge) => {
              const path = edgePath(positions[edge.from], positions[edge.to]);
              const strong = edge.strength >= .28;
              return (
                <g className={strong ? 'envy-edge envy-edge--strong' : 'envy-edge'} key={`${edge.from}-${edge.to}`}>
                  <path className="envy-edge__line" d={path.d} markerEnd={`url(#envy-arrow-${strong ? 'strong' : 'soft'})`} />
                  <g className="envy-edge__label" transform={`translate(${path.label.x} ${path.label.y})`}>
                    <rect x="-24" y="-14" width="48" height="28" rx="14" />
                    <text textAnchor="middle" dominantBaseline="central">+{edge.gap}</text>
                  </g>
                </g>
              );
            })}
          </g>

          <g key={`people-${animationKey}`} className="envy-people">
            {caseData.agents.map((name, index) => {
              const person = people[index];
              const point = positions[index];
              const sad = person.strongestGap > 0;
              const strong = person.strength >= .28;
              const mouthY = sad ? 12 : 2;
              const mouthControl = sad ? 3 : 15;
              return (
                <g
                  className={`envy-person envy-person--${sad ? strong ? 'very-sad' : 'sad' : 'happy'}`}
                  transform={`translate(${point.x} ${point.y})`}
                  key={name}
                  role="group"
                  aria-label={`${name}. ${t.ownValue}: ${person.ownValue}. ${emotionLabel(person.strength, t)}${sad ? `, ${t.envyGap} ${person.strongestGap}` : ''}`}
                >
                  <title>{`${name}: ${emotionLabel(person.strength, t)}`}</title>
                  <g className="envy-person__animated">
                    <circle className="envy-person__halo" r="56" />
                    <circle className="envy-person__face" r="42" />
                    <circle className="envy-person__eye" cx="-14" cy="-9" r="3.5" />
                    <circle className="envy-person__eye" cx="14" cy="-9" r="3.5" />
                    <path className="envy-person__mouth" d={`M -16 ${mouthY} Q 0 ${mouthControl} 16 ${mouthY}`} />
                    {sad && <path className="envy-person__tear" d="M 19 -3 C 25 5 25 10 19 13 C 13 10 13 5 19 -3 Z" />}
                    <text className="envy-person__name" y="68" textAnchor="middle">{shortName(name)}</text>
                    <text className="envy-person__value" y="86" textAnchor="middle">{t.ownValue} {person.ownValue}</text>
                    <text className="envy-person__mood" y="104" textAnchor="middle">
                      {sad ? `${emotionLabel(person.strength, t)} · ${t.envyGap} ${person.strongestGap}` : emotionLabel(person.strength, t)}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className={edges.length ? 'envy-graph__status' : 'envy-graph__status envy-graph__status--calm'}>
        <span aria-hidden="true">{assigned === 0 ? '○' : edges.length ? '↗' : '✓'}</span>
        <p>{assigned === 0 ? t.envyGraphEmpty : edges.length === 0 ? t.everyoneContent : t.envyGraphStatus.replace('{count}', String(edges.length))}</p>
      </div>

      <ul className="sr-only">
        {edges.map((edge) => <li key={`${edge.from}-${edge.to}-summary`}>{t.envySentence.replace('{from}', caseData.agents[edge.from]).replace('{to}', caseData.agents[edge.to]).replace('{gap}', String(edge.gap))}</li>)}
      </ul>
    </section>
  );
}
