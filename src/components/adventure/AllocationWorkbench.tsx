'use client';

import type { CSSProperties } from 'react';
import type { Locale } from '../../i18n/copy';
import type { NarrativeScenario, VerdictReport } from '../../narrative/types';
import { localize } from '../../narrative/types';

export function AllocationWorkbench({
  locale,
  scenario,
  owners,
  selectedItem,
  silver,
  report,
  challenge,
  onSelect,
  onAssign,
  onSilver,
  onCommit,
}: {
  locale: Locale;
  scenario: NarrativeScenario;
  owners: number[];
  selectedItem: number | null;
  silver: number[];
  report: VerdictReport | null;
  challenge: boolean;
  onSelect: (itemIndex: number | null) => void;
  onAssign: (itemIndex: number, owner: number) => void;
  onSilver: (amounts: number[]) => void;
  onCommit: () => void;
}) {
  const complete = owners.every((owner) => owner >= 0);
  const selectedName = selectedItem === null ? null : localize(scenario.items[selectedItem].shortName, locale);
  const zh = locale === 'zh-TW';

  function setFirstSilver(value: number) {
    const second = Math.min(silver[1] ?? 0, 100 - value);
    onSilver([value, second, 100 - value - second]);
  }

  function setSecondSilver(value: number) {
    onSilver([silver[0] ?? 0, value, 100 - (silver[0] ?? 0) - value]);
  }

  return (
    <section className="adventure-workbench" aria-labelledby="workbench-title">
      <header>
        <div>
          <p>{challenge ? (zh ? '巧解挑戰 · 即時驗算' : 'Master challenge · Live verification') : (zh ? '權衡天平' : 'Ritual scales')}</p>
          <h2 id="workbench-title">{localize(scenario.allocationPrompt, locale)}</h2>
        </div>
        <strong>{owners.filter((owner) => owner >= 0).length}/{owners.length}</strong>
      </header>

      <div className="adventure-workbench__items" aria-label={zh ? '待分配物品' : 'Goods to allocate'}>
        {scenario.items.map((item, itemIndex) => (
          <button
            type="button"
            className={selectedItem === itemIndex ? 'is-selected' : ''}
            aria-pressed={selectedItem === itemIndex}
            onClick={() => onSelect(selectedItem === itemIndex ? null : itemIndex)}
            key={item.id}
          >
            <span>{localize(item.shortName, locale)}</span>
            <small>{owners[itemIndex] >= 0 ? localize(scenario.agents[owners[itemIndex]].name, locale) : (zh ? '尚未分配' : 'Unassigned')}</small>
          </button>
        ))}
      </div>

      <div className="adventure-workbench__agents">
        {scenario.agents.map((agent, agentIndex) => {
          const itemIndexes = scenario.items.map((_, index) => index).filter((index) => owners[index] === agentIndex);
          return (
            <section key={agent.id} style={{ '--agent-color': agent.color } as CSSProperties}>
              <header>
                <span aria-hidden="true">{localize(agent.name, locale).slice(0, 1)}</span>
                <div><h3>{localize(agent.name, locale)}</h3><p>{localize(agent.role, locale)}</p></div>
              </header>
              <ul>
                {itemIndexes.map((itemIndex) => <li key={scenario.items[itemIndex].id}>{localize(scenario.items[itemIndex].shortName, locale)}</li>)}
                {!itemIndexes.length && <li className="is-empty">{zh ? '案台仍空' : 'Tray empty'}</li>}
              </ul>
              <button
                type="button"
                disabled={selectedItem === null}
                onClick={() => selectedItem !== null && onAssign(selectedItem, agentIndex)}
              >
                {selectedName ? (zh ? `把「${selectedName}」放這裡` : `Give ${selectedName} here`) : (zh ? '先選一件物品' : 'Choose an item first')}
              </button>
            </section>
          );
        })}
      </div>

      {scenario.id === 'palace' && (
        <fieldset className="silver-allocation">
          <legend>{zh ? '太倉現銀一百萬兩' : 'One million taels of treasury silver'}</legend>
          <p>{zh ? '滑桿每一點代表一萬兩；第三方自動取得餘額。' : 'Each point represents ten thousand taels; the third faction receives the remainder.'}</p>
          <label>
            <span>{localize(scenario.agents[0].name, locale)} <strong>{silver[0]} {zh ? '萬兩' : 'points'}</strong></span>
            <input type="range" min="0" max="100" value={silver[0]} onChange={(event) => setFirstSilver(Number(event.target.value))} />
          </label>
          <label>
            <span>{localize(scenario.agents[1].name, locale)} <strong>{silver[1]} {zh ? '萬兩' : 'points'}</strong></span>
            <input type="range" min="0" max={100 - silver[0]} value={silver[1]} onChange={(event) => setSecondSilver(Number(event.target.value))} />
          </label>
          <div className="silver-allocation__remainder">
            <span>{localize(scenario.agents[2].name, locale)}</span><strong>{silver[2]} {zh ? '萬兩' : 'points'}</strong>
          </div>
        </fieldset>
      )}

      {challenge && report && (
        <div className={report.zeroUtility ? 'challenge-meter is-crisis' : 'challenge-meter'} aria-live="polite">
          <span>{scenario.concept}</span>
          <strong>{scenario.concept === 'NSW' ? report.nsw : scenario.concept === 'EFX' ? (report.efx ? '✓' : '×') : (report.ef1 ? '✓' : '×')}</strong>
          <small>{report.utilities.join(' × ')}</small>
        </div>
      )}

      <footer>
        <p>{complete ? (zh ? '所有物品已有歸屬。' : 'Every item has an owner.') : (zh ? '必須先分完所有物品。' : 'Allocate every item first.')}</p>
        <button type="button" className="adventure-primary" disabled={!complete} onClick={onCommit}>
          {challenge ? (zh ? '即時驗算' : 'Verify challenge') : (zh ? '鎖定裁決' : 'Seal verdict')}
        </button>
      </footer>
    </section>
  );
}
