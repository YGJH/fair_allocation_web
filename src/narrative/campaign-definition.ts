export type CampaignCharacterId =
  | 'cheng-heng'
  | 'master-zhou'
  | 'chen-shouye'
  | 'chen-congzheng'
  | 'chen-elder';

export type ActOnePartyId = 'chen-shouye' | 'chen-congzheng';
export type ActOneGoodId = 'paddy-field' | 'oil-tea-hillside' | 'silver';
export type ActTwoPartyId = 'pei-boqian' | 'pei-zhongwen' | 'xue-shoucheng';
export type ActTwoGoodId = 'loom-workshop' | 'mulberry-fields' | 'cash-silver' | 'raw-silk';
export type LocalizedText = { readonly 'zh-TW': string; readonly en: string };
export type ActOneClueId =
  | 'clue-chen-shouye-valuations'
  | 'clue-chen-congzheng-valuations'
  | 'clue-chen-elder-equal-split'
  | 'clue-yiwu-original-ruling';
export type ActTwoClueId =
  | 'clue-pei-boqian-valuations'
  | 'clue-pei-zhongwen-valuations'
  | 'clue-xue-shoucheng-valuations'
  | 'clue-loom-workshop-indivisible';
export type CampaignClueId = ActOneClueId | ActTwoClueId;
export type ActOneCutsceneId = 'cs-00' | 'cs-01' | 'cs-02' | 'cs-03';
export type ActTwoCutsceneId = 'cs-04' | 'cs-05' | 'cs-06';
export type ActThreeCampId = 'wai-chao' | 'ji-zhen' | 'nei-ting';
export type ActThreeClueId =
  | 'clue-wai-chao-valuations'
  | 'clue-ji-zhen-valuations'
  | 'clue-nei-ting-valuations'
  | 'clue-emperor-no-unanimity';
export type ActThreeWritId =
  | 'military-command'
  | 'salt-tax'
  | 'grain-route'
  | 'firearms'
  | 'border-market'
  | 'imperial-weaving';

export type DivisibleGoodDefinition<GoodId extends string = string> = {
  id: GoodId;
  totalShares: 10;
  values: readonly number[];
};

export type DivisibleCampaignDefinition<
  PartyId extends string = string,
  GoodId extends string = string,
> = {
  parties: readonly PartyId[];
  goods: readonly DivisibleGoodDefinition<GoodId>[];
};

export type IndivisibleGoodDefinition<GoodId extends string = string> = {
  id: GoodId;
  kind: 'indivisible';
  values: readonly number[];
};

export type ActTwoGoodDefinition =
  | (DivisibleGoodDefinition<ActTwoGoodId> & {
      kind: 'divisible';
      name: LocalizedText;
      description: LocalizedText;
    })
  | (IndivisibleGoodDefinition<ActTwoGoodId> & {
      name: LocalizedText;
      description: LocalizedText;
    });

export type ActTwoPartyDefinition = {
  name: LocalizedText;
  description: LocalizedText;
};

export type ActThreeWritDefinition = IndivisibleGoodDefinition<ActThreeWritId> & {
  name: LocalizedText;
  description: LocalizedText;
};

export type ActThreeDefinition = {
  act: 3;
  parties: readonly ActThreeCampId[];
  partyDetails: Record<ActThreeCampId, ActTwoPartyDefinition>;
  writs: readonly ActThreeWritDefinition[];
  clues: readonly { id: ActThreeClueId; required: boolean }[];
  cutscenes: readonly ('cs-07' | 'cs-08' | 'cs-09' | 'cs-10' | 'cs-11' | 'cs-12')[];
  gradeCriteria: {
    zeroProductOrEf1Failure: '不稱職';
    ef1WithoutEfx: '平常';
    efx: '稱職';
  };
  demonstrations: Record<string, readonly { writId: ActThreeWritId; owner: 0 | 1 | 2 }[]>;
};

export type ActThreeAllocation = readonly {
  writId: ActThreeWritId;
  owner: number;
}[];

export type MixedCampaignDefinition<
  PartyId extends string = string,
  Good extends { id: string } = { id: string },
> = {
  parties: readonly PartyId[];
  partyDetails: Record<PartyId, ActTwoPartyDefinition>;
  goods: readonly Good[];
};

export const ACT_ONE_DEFINITION = {
  act: 1,
  characters: [
    'cheng-heng',
    'master-zhou',
    'chen-shouye',
    'chen-congzheng',
    'chen-elder',
  ],
  parties: ['chen-shouye', 'chen-congzheng'],
  goods: [
    { id: 'paddy-field', totalShares: 10, values: [60, 20] },
    { id: 'oil-tea-hillside', totalShares: 10, values: [20, 20] },
    { id: 'silver', totalShares: 10, values: [20, 60] },
  ],
  clues: [
    { id: 'clue-chen-shouye-valuations', required: true },
    { id: 'clue-chen-congzheng-valuations', required: true },
    { id: 'clue-chen-elder-equal-split', required: true },
    { id: 'clue-yiwu-original-ruling', required: true },
  ],
  cutscenes: ['cs-00', 'cs-01', 'cs-02', 'cs-03'],
  gradeThresholds: {
    proportionalUtility: 50,
    competentUtility: 60,
  },
  masterChallenge: {
    frontierUtilities: [70, 70],
  },
  cutAndChoose: {
    chooserTieBreakBundle: 0,
  },
  demonstrations: {
    halfSplit: [
      { goodId: 'paddy-field', shares: [5, 5] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [5, 5] },
    ],
    inverted: [
      { goodId: 'paddy-field', shares: [0, 10] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [10, 0] },
    ],
    frontier: [
      { goodId: 'paddy-field', shares: [10, 0] },
      { goodId: 'oil-tea-hillside', shares: [5, 5] },
      { goodId: 'silver', shares: [0, 10] },
    ],
    cutAndChooseDivision: [
      { goodId: 'paddy-field', shares: [5, 5] },
      { goodId: 'oil-tea-hillside', shares: [10, 0] },
      { goodId: 'silver', shares: [0, 10] },
    ],
  },
} as const satisfies DivisibleCampaignDefinition<ActOnePartyId, ActOneGoodId> & {
  act: 1;
  characters: readonly CampaignCharacterId[];
  clues: readonly { id: ActOneClueId; required: true }[];
  cutscenes: readonly ActOneCutsceneId[];
  gradeThresholds: {
    proportionalUtility: 50;
    competentUtility: 60;
  };
  masterChallenge: {
    frontierUtilities: readonly [70, 70];
  };
  cutAndChoose: {
    chooserTieBreakBundle: 0;
  };
  demonstrations: Record<
    'halfSplit' | 'inverted' | 'frontier' | 'cutAndChooseDivision',
    readonly { goodId: ActOneGoodId; shares: readonly [number, number] }[]
  >;
};

/** Canonical Act II facts from master-script.zh-TW.md §第二幕 §§2–7. */
export const ACT_TWO_DEFINITION = {
  act: 2,
  parties: ['pei-boqian', 'pei-zhongwen', 'xue-shoucheng'],
  partyDetails: {
    'pei-boqian': {
      name: { 'zh-TW': '裴伯謙', en: 'Pei Boqian' },
      description: {
        'zh-TW': '長子；認定祖產與家業門面都該歸長房。',
        en: 'Elder son; he believes the ancestral estate and the family business’s standing belong to the senior branch.',
      },
    },
    'pei-zhongwen': {
      name: { 'zh-TW': '裴仲文', en: 'Pei Zhongwen' },
      description: {
        'zh-TW': '次子，新中舉人，開春要進京會試，急著要盤纏與束脩。',
        en: 'Younger son, newly successful in the provincial examination; he must travel to the capital for the spring examination and needs travel money and tuition.',
      },
    },
    'xue-shoucheng': {
      name: { 'zh-TW': '薛守成', en: 'Xue Shoucheng' },
      description: {
        'zh-TW': '贅婿；替岳父掌機房二十年，握著岳父臨終按了指印的分家文書（鬮書）。',
        en: 'Son-in-law; he has run his father-in-law’s workshop for twenty years and holds the partition deed bearing his father-in-law’s dying fingerprint.',
      },
    },
  },
  goods: [
    {
      id: 'loom-workshop',
      kind: 'indivisible',
      name: { 'zh-TW': '裴氏機房', en: 'Pei Loom Workshop' },
      description: {
        'zh-TW': '三十張花樓織機，連同織造局發給的領織牌照（替宮裡織布的許可）。織機一拆散，這張許可立刻作廢。',
        en: 'Thirty drawlooms, together with the weaving licence issued by the imperial weaving office. If the looms are dismantled, the licence immediately becomes void.',
      },
      values: [30, 10, 50],
    },
    {
      id: 'mulberry-fields',
      kind: 'divisible',
      totalShares: 10,
      name: { 'zh-TW': '桑田', en: 'Mulberry Fields' },
      description: {
        'zh-TW': '清丈新量出的實數：三百畝桑田。',
        en: 'The newly surveyed amount: three hundred mu of mulberry fields.',
      },
      values: [40, 30, 10],
    },
    {
      id: 'cash-silver',
      kind: 'divisible',
      totalShares: 10,
      name: { 'zh-TW': '現銀', en: 'Cash Silver' },
      description: {
        'zh-TW': '現銀三千兩。',
        en: 'Three thousand taels of cash silver.',
      },
      values: [10, 40, 10],
    },
    {
      id: 'raw-silk',
      kind: 'divisible',
      totalShares: 10,
      name: { 'zh-TW': '生絲', en: 'Raw Silk' },
      description: {
        'zh-TW': '生絲一百擔；庫中存貨，可賣，也可上機。',
        en: 'One hundred dan of raw silk in storage; it can be sold or put on the looms.',
      },
      values: [20, 20, 30],
    },
  ],
  fairnessRequirements: {
    proportionalShare: { numerator: 1, denominator: 3 },
    envyFree: true,
    compensation: {
      indivisibleGoodId: 'loom-workshop',
      recipientPartyId: 'xue-shoucheng',
      divisibleGoodId: 'raw-silk',
      shares: [2, 2, 6],
    },
  },
  gradeThresholds: {
    proportionalShare: { numerator: 1, denominator: 3 },
    competentCriterion: 'ef',
  },
  harmonyScoreTarget: 131_648,
  clues: [
    { id: 'clue-pei-boqian-valuations', required: false },
    { id: 'clue-pei-zhongwen-valuations', required: false },
    { id: 'clue-xue-shoucheng-valuations', required: false },
    { id: 'clue-loom-workshop-indivisible', required: true },
  ],
  cutscenes: ['cs-04', 'cs-05', 'cs-06'],
  // The matrix remains deterministic in the authored definition; optional private statements are revealed by clue progress.
  unknownValuations: [],
  demonstrations: {
    patriarchal: [
      { goodId: 'loom-workshop', owner: 0 },
      { goodId: 'mulberry-fields', shares: [10, 0, 0] },
      { goodId: 'cash-silver', shares: [0, 10, 0] },
      { goodId: 'raw-silk', shares: [0, 0, 10] },
    ],
    eachTakesTheirFavourite: [
      { goodId: 'loom-workshop', owner: 2 },
      { goodId: 'mulberry-fields', shares: [10, 0, 0] },
      { goodId: 'cash-silver', shares: [0, 10, 0] },
      { goodId: 'raw-silk', shares: [0, 0, 10] },
    ],
    equalLooking: [
      { goodId: 'loom-workshop', owner: 2 },
      { goodId: 'mulberry-fields', shares: [10, 0, 0] },
      { goodId: 'cash-silver', shares: [0, 10, 0] },
      { goodId: 'raw-silk', shares: [5, 5, 0] },
    ],
    compensation: [
      { goodId: 'loom-workshop', owner: 2 },
      { goodId: 'mulberry-fields', shares: [10, 0, 0] },
      { goodId: 'cash-silver', shares: [0, 10, 0] },
      { goodId: 'raw-silk', shares: [2, 2, 6] },
    ],
  },
} as const satisfies MixedCampaignDefinition<ActTwoPartyId, ActTwoGoodDefinition> & {
  act: 2;
  fairnessRequirements: {
    proportionalShare: { numerator: 1; denominator: 3 };
    envyFree: true;
    compensation: {
      indivisibleGoodId: 'loom-workshop';
      recipientPartyId: 'xue-shoucheng';
      divisibleGoodId: 'raw-silk';
      shares: readonly [2, 2, 6];
    };
  };
  gradeThresholds: {
    proportionalShare: { numerator: 1; denominator: 3 };
    competentCriterion: 'ef';
  };
  harmonyScoreTarget: 131648;
  clues: readonly { id: ActTwoClueId; required: boolean }[];
  cutscenes: readonly ActTwoCutsceneId[];
  unknownValuations: readonly ActTwoClueId[];
  demonstrations: Record<string, readonly unknown[]>;
};

/** Canonical Third Act facts from master-script.zh-TW.md §§3–10. */
export const ACT_THREE_DEFINITION = {
  act: 3,
  parties: ['wai-chao', 'ji-zhen', 'nei-ting'],
  partyDetails: {
    'wai-chao': {
      name: { 'zh-TW': '外朝', en: 'Outer Court' },
      description: {
        'zh-TW': '文官（張首輔）',
        en: 'Civil officials (Grand Secretary Zhang Juzheng).',
      },
    },
    'ji-zhen': {
      name: { 'zh-TW': '薊鎮', en: 'Jizhen' },
      description: {
        'zh-TW': '邊軍（戚將軍）',
        en: 'The frontier army (General Qi Jiguang).',
      },
    },
    'nei-ting': {
      name: { 'zh-TW': '內廷', en: 'Inner Court' },
      description: {
        'zh-TW': '宮裡（馮公公）',
        en: 'The palace (Eunuch Feng Bao).',
      },
    },
  },
  writs: [
    {
      id: 'military-command',
      kind: 'indivisible',
      name: { 'zh-TW': '符｜薊鎮節制', en: 'Military Writ | Command of Jizhen' },
      description: {
        'zh-TW': '長城守軍聽誰指揮',
        en: 'Who commands the Great Wall garrison.',
      },
      values: [5, 35, 10],
    },
    {
      id: 'salt-tax',
      kind: 'indivisible',
      name: { 'zh-TW': '鹽｜兩淮鹽課', en: 'Salt Writ | Lianghuai Salt Tax' },
      description: {
        'zh-TW': '賣鹽的稅，全國最大一筆現銀',
        en: 'The salt tax, the largest source of ready silver in the realm.',
      },
      values: [30, 10, 35],
    },
    {
      id: 'grain-route',
      kind: 'indivisible',
      name: { 'zh-TW': '糧｜邊餉轉運', en: 'Grain Writ | Frontier Provisions' },
      description: {
        'zh-TW': '軍糧由誰運、誰發',
        en: 'Who transports and issues the army’s grain.',
      },
      values: [20, 30, 10],
    },
    {
      id: 'firearms',
      kind: 'indivisible',
      name: { 'zh-TW': '火｜火器督造', en: 'Firearms Writ | Weapons Manufacture' },
      description: {
        'zh-TW': '槍砲由誰造',
        en: 'Who manufactures the guns and cannon.',
      },
      values: [20, 20, 15],
    },
    {
      id: 'border-market',
      kind: 'indivisible',
      name: { 'zh-TW': '市｜宣大互市', en: 'Market Writ | Xuan-Da Border Trade' },
      description: {
        'zh-TW': '與草原部落的邊境買賣',
        en: 'The border trade with the steppe tribes.',
      },
      values: [15, 5, 10],
    },
    {
      id: 'imperial-weaving',
      kind: 'indivisible',
      name: { 'zh-TW': '織｜蘇杭織造', en: 'Weaving Writ | Suzhou-Hangzhou Weaving' },
      description: {
        'zh-TW': '替宮裡織綢緞',
        en: 'Weaving silk for the palace.',
      },
      values: [10, 0, 20],
    },
  ],
  clues: [
    { id: 'clue-wai-chao-valuations', required: false },
    { id: 'clue-ji-zhen-valuations', required: false },
    { id: 'clue-nei-ting-valuations', required: false },
    { id: 'clue-emperor-no-unanimity', required: true },
  ],
  cutscenes: ['cs-07', 'cs-08', 'cs-09', 'cs-10', 'cs-11', 'cs-12'],
  gradeCriteria: {
    zeroProductOrEf1Failure: '不稱職',
    ef1WithoutEfx: '平常',
    efx: '稱職',
  },
  demonstrations: {
    rankOrderRoundRobin: [
      { writId: 'military-command', owner: 1 },
      { writId: 'salt-tax', owner: 0 },
      { writId: 'grain-route', owner: 0 },
      { writId: 'firearms', owner: 1 },
      { writId: 'border-market', owner: 2 },
      { writId: 'imperial-weaving', owner: 2 },
    ],
    reverseRankOrder: [
      { writId: 'military-command', owner: 1 },
      { writId: 'salt-tax', owner: 2 },
      { writId: 'grain-route', owner: 0 },
      { writId: 'firearms', owner: 1 },
      { writId: 'border-market', owner: 0 },
      { writId: 'imperial-weaving', owner: 2 },
    ],
    unbalanced: [
      { writId: 'military-command', owner: 1 },
      { writId: 'salt-tax', owner: 0 },
      { writId: 'grain-route', owner: 1 },
      { writId: 'firearms', owner: 2 },
      { writId: 'border-market', owner: 0 },
      { writId: 'imperial-weaving', owner: 0 },
    ],
    efxFrontier: [
      { writId: 'military-command', owner: 1 },
      { writId: 'salt-tax', owner: 2 },
      { writId: 'grain-route', owner: 0 },
      { writId: 'firearms', owner: 1 },
      { writId: 'border-market', owner: 0 },
      { writId: 'imperial-weaving', owner: 2 },
    ],
    nswMaximum: [
      { writId: 'military-command', owner: 1 },
      { writId: 'salt-tax', owner: 2 },
      { writId: 'grain-route', owner: 1 },
      { writId: 'firearms', owner: 0 },
      { writId: 'border-market', owner: 0 },
      { writId: 'imperial-weaving', owner: 2 },
    ],
  },
} as const satisfies ActThreeDefinition;
