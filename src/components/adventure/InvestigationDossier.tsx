'use client';

import type { Locale } from '../../i18n/copy';
import type { NarrativeScenario } from '../../narrative/types';
import { localize } from '../../narrative/types';

export function InvestigationDossier({
  locale,
  scenario,
  discoveredClueIds,
}: {
  locale: Locale;
  scenario: NarrativeScenario;
  discoveredClueIds: string[];
}) {
  const unlockedAgents = new Set(
    scenario.clues
      .filter((clue) => discoveredClueIds.includes(clue.id) && clue.unlocksAgentId)
      .map((clue) => clue.unlocksAgentId),
  );

  return (
    <details className="adventure-dossier">
      <summary>{locale === 'zh-TW' ? '定分手冊' : 'Allocation dossier'} <span>{unlockedAgents.size}/{scenario.agents.length}</span></summary>
      <div className="adventure-dossier__body">
        <h2>{locale === 'zh-TW' ? '主觀估值' : 'Subjective valuations'}</h2>
        <p>{locale === 'zh-TW' ? '詢問當事人後，數值會自動記入。' : 'Interview each claimant to record their values.'}</p>
        <div className="adventure-dossier__scroll" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">{locale === 'zh-TW' ? '人物' : 'Person'}</th>
                {scenario.items.map((item) => <th scope="col" key={item.id}>{localize(item.shortName, locale)}</th>)}
              </tr>
            </thead>
            <tbody>
              {scenario.agents.map((agent, agentIndex) => {
                const unlocked = unlockedAgents.has(agent.id);
                return (
                  <tr key={agent.id}>
                    <th scope="row">{localize(agent.name, locale)}</th>
                    {scenario.items.map((item, itemIndex) => <td key={item.id}>{unlocked ? scenario.values[agentIndex][itemIndex] : '？'}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
