import type { CaseInput } from '../domain/model';
import type { Locale } from '../i18n/copy';

export type LocalizedText = { en: string; 'zh-TW': string };
export type NarrativePhase =
  | 'prologue'
  | 'briefing'
  | 'investigation'
  | 'allocation'
  | 'judgment'
  | 'reveal'
  | 'challenge'
  | 'transition'
  | 'epilogue';

export type NarrativeAgent = {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  color: string;
};

export type NarrativeItem = {
  id: string;
  name: LocalizedText;
  shortName: LocalizedText;
  description: LocalizedText;
};

export type NarrativeClue = {
  id: string;
  targetId: string;
  kind: 'agent' | 'item' | 'npc';
  speaker: LocalizedText;
  text: LocalizedText;
  unlocksAgentId?: string;
};

export type StoryBeat = {
  speaker: LocalizedText;
  text: LocalizedText;
  action: LocalizedText;
  focusTargetId?: string;
  tone: 'narrator' | 'character' | 'system';
};

export type NarrativeScenario = {
  id: 'guild' | 'yamen' | 'palace';
  act: number;
  era: LocalizedText;
  title: LocalizedText;
  concept: 'EF1' | 'EFX' | 'NSW';
  poster: string;
  agents: NarrativeAgent[];
  items: NarrativeItem[];
  values: number[][];
  clues: NarrativeClue[];
  requiredClueIds: string[];
  opening: LocalizedText;
  storyBeats: StoryBeat[];
  allocationPrompt: LocalizedText;
  masterAllocation: number[];
  masterSilver?: number[];
};

export type EnvyPair = {
  from: number;
  to: number;
  ownValue: number;
  otherValue: number;
};

export type VerdictReport = {
  utilities: number[];
  nsw: string;
  ef: boolean;
  ef1: boolean;
  efx: boolean;
  envyPairs: EnvyPair[];
  ef1Failure?: { i: number; j: number };
  efxFailure?: { i: number; j: number; item: number };
  zeroUtility: boolean;
};

export type VerdictRecord = {
  scenarioId: NarrativeScenario['id'];
  report: VerdictReport;
  rating: number;
  mastered: boolean;
};

export type NarrativeState = {
  phase: NarrativePhase;
  actIndex: number;
  storyIndex: number;
  discoveredClueIds: string[];
  activeClueId: string | null;
  owners: number[];
  selectedItem: number | null;
  silver: number[];
  rating: number | null;
  report: VerdictReport | null;
  committedReport: VerdictReport | null;
  records: VerdictRecord[];
  challengeMastered: boolean;
};

export function localize(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export function scenarioCaseData(scenario: NarrativeScenario, locale: Locale): CaseInput {
  return {
    agents: scenario.agents.map((agent) => localize(agent.name, locale)),
    items: scenario.items.map((item) => localize(item.name, locale)),
    values: scenario.values,
  };
}
