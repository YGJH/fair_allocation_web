import { describe, expect, test } from 'vitest';
import { getAdventureCopy } from '../src/i18n/adventure';

describe('Act I canonical story copy', () => {
  test.each([
    {
      locale: 'zh-TW' as const,
      elderBrotherDetails: ['小人不懂律', '銀子是好東西，可銀子種不出稻子'],
      youngerBrotherDetails: ['我這條腿是在薊鎮牆子嶺凍壞的', '一年收不回幾斗租', '營裡修了八年鳥銃', '城西有間鐵匠鋪要盤出去'],
    },
    {
      locale: 'en' as const,
      elderBrotherDetails: ['I know nothing of the law', 'silver cannot grow rice'],
      youngerBrotherDetails: ['froze my left leg at Qiangziling in Jizhen', 'a few dou of rent in a year', 'repaired arquebuses in camp for eight years', 'a smithy for sale west of town'],
    },
  ])('preserves both brothers’ scripted motivations in $locale', ({ locale, elderBrotherDetails, youngerBrotherDetails }) => {
    const clues = getAdventureCopy(locale).investigation.clues;
    const elderBrother = clues['clue-chen-shouye-valuations'].text;
    const youngerBrother = clues['clue-chen-congzheng-valuations'].text;

    for (const detail of elderBrotherDetails) expect(elderBrother).toContain(detail);
    for (const detail of youngerBrotherDetails) expect(youngerBrother).toContain(detail);
  });

  test.each([
    {
      locale: 'zh-TW' as const,
      revealDetails: ['兩根刻著十成的竹籤', '五成', '三成', '七成', '互不嫉妒'],
      cutAndChooseDetails: ['鄉下分家還有個老辦法', '分的人怕對方把好的那堆挑走', '兩堆分得一樣重'],
      challengeOutcomeDetails: ['分的人只拿得到五成', '不敢冒險', '把兩個人的心思都問清楚'],
    },
    {
      locale: 'en' as const,
      revealDetails: ['two bamboo tallies, each marked in ten shares', 'each brother receives 50 points', 'both receive only 30 points', 'both receive 70 points without envy'],
      cutAndChooseDetails: ['old village custom', 'the divider must make the two bundles weigh the same in his own eyes'],
      challengeOutcomeDetails: ['the divider receives only five shares', 'does not know what his younger brother wants', 'understand both brothers’ minds'],
    },
  ])('retells the scripted judgment and Cut-and-Choose explanation in $locale', ({ locale, revealDetails, cutAndChooseDetails, challengeOutcomeDetails }) => {
    const copy = getAdventureCopy(locale);
    const reveal = copy.investigation.debrief.shareLead;

    for (const detail of revealDetails) expect(reveal).toContain(detail);
    for (const detail of cutAndChooseDetails) expect(copy.masterChallenge.body).toContain(detail);
    for (const detail of challengeOutcomeDetails) expect(copy.masterChallenge.completionDialogue).toContain(detail);
  });
});
