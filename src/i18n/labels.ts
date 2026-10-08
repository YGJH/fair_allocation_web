import type { Locale } from './copy';

/** Curated exercises use numeric item IDs so the object itself never biases a choice. */
export function displayItemName(locale: Locale, item: string, index = 0) {
  if (!/^\d+$/.test(item)) return item;
  const number = item || String(index + 1);
  return locale === 'zh-TW' ? `物品 ${number}` : `Item ${number}`;
}
