import type { Locale } from '../copy';
import { adventureEn } from './en';
import { adventureZhTW, type AdventureMessages } from './zh-TW';

export const adventureCopy: Readonly<Record<Locale, AdventureMessages>> = {
  en: adventureEn,
  'zh-TW': adventureZhTW,
};

export function getAdventureCopy(locale: Locale): AdventureMessages {
  return adventureCopy[locale];
}

export { adventureEn, adventureZhTW };
export type { AdventureMessages };
export type AdventureShellMessages = AdventureMessages['shell'];
export type AdventureStageMessages = AdventureMessages['stage'];
export type AdventurePauseMenuMessages = AdventureMessages['pauseMenu'];
