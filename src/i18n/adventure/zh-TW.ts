export interface EndingCopy {
  readonly formal: string;
  readonly plain: string;
}

export interface GrievanceEndingCopy {
  readonly mild: EndingCopy;
  readonly severe: EndingCopy;
}

export interface AdventureMessages {
  readonly title: string;
  readonly videoLabel: string;
  readonly enter: string;
  readonly pause: string;
  readonly resume: string;
  readonly mute: string;
  readonly unmute: string;
  readonly volume: string;
  readonly subtitles: string;
  readonly subtitlesOn: string;
  readonly subtitlesOff: string;
  readonly skip: string;
  readonly replay: string;
  readonly retry: string;
  readonly useFallback: string;
  readonly continue: string;
  readonly loading: string;
  readonly errorTitle: string;
  readonly errorBody: string;
  readonly reducedMotionTitle: string;
  readonly reducedMotionBody: string;
  readonly fallbackTitle: string;
  readonly fallbackBody: string;
  readonly fallbackAlt: string;
  readonly fallbackTitleBySlot: { readonly 'cs-00': string; readonly 'cs-01': string; readonly 'cs-02': string; readonly 'cs-03': string; readonly 'cs-04': string; readonly 'cs-05': string; readonly 'cs-06': string; readonly 'cs-07': string; readonly 'cs-08': string; readonly 'cs-09': string; readonly 'cs-10': string; readonly 'cs-11': string; readonly 'cs-12': string; readonly 'cs-13': string; readonly 'cs-14': string };
  readonly fallbackHeadingBySlot: { readonly 'cs-00': string; readonly 'cs-01': string; readonly 'cs-02': string; readonly 'cs-03': string; readonly 'cs-04': string; readonly 'cs-05': string; readonly 'cs-06': string; readonly 'cs-07': string; readonly 'cs-08': string; readonly 'cs-09': string; readonly 'cs-10': string; readonly 'cs-11': string; readonly 'cs-12': string; readonly 'cs-13': string; readonly 'cs-14': string };
  readonly fallbackAltBySlot: { readonly 'cs-00': string; readonly 'cs-01': string; readonly 'cs-02': string; readonly 'cs-03': string; readonly 'cs-04': string; readonly 'cs-05': string; readonly 'cs-06': string; readonly 'cs-07': string; readonly 'cs-08': string; readonly 'cs-09': string; readonly 'cs-10': string; readonly 'cs-11': string; readonly 'cs-12': string; readonly 'cs-13': string; readonly 'cs-14': string };
  readonly transcriptTitle: string;
  readonly cues: {
    readonly location: string;
    readonly emperor: string;
    readonly chengUncertain: string;
    readonly fengReaction: string;
    readonly chengDivide: string;
    readonly title: string;
    readonly narratorRabbits: string;
    readonly narratorLife: string;
    readonly narratorFirstCase: string;
    readonly sixYearsEarlier: string;
  };
  readonly transcript: {
    readonly scene: string;
    readonly emperor: string;
    readonly chengUncertain: string;
    readonly fengReaction: string;
    readonly chengDivide: string;
    readonly title: string;
    readonly narratorRabbits: string;
    readonly narratorLife: string;
    readonly narratorFirstCase: string;
    readonly sixYearsEarlier: string;
    readonly cs01Scene: string;
    readonly cs01Location: string;
    readonly cs01Zhou: string;
    readonly cs02Scene: string;
    readonly cs03Scene: string;
    readonly cs03Letter: string;
    readonly cs03TimeJump: string;
    readonly cs03LedgerTitle: string;
    readonly cs03LedgerEntry: string;
    readonly cs03LedgerPlain: string;
    readonly cs03Transfer: string;
    readonly cs03TransferPlain: string;
    readonly cs04Scene: string;
    readonly cs04Zhou: string;
    readonly cs04Closing: string;
    readonly cs05Scene: string;
    readonly cs05Reaction: string;
    readonly cs06Recommendation: string;
    readonly cs06Zhang: string;
    readonly cs06Feng: string;
    readonly cs06Qi: string;
    readonly cs07Rules: string;
    readonly cs07FourDays: string;
    readonly cs08Zhang: string;
    readonly cs08Cheng: string;
    readonly cs09History: string;
    readonly cs10History: string;
    readonly cs11History: string;
    readonly cs12History: string;
    readonly cs13Dialogue: string;
    readonly cs13History: string;
    readonly cs14Narration: string;
  };
  readonly actThree: {
    readonly introTitle: string;
    readonly introBody: string;
    readonly sceneName: string;
    readonly sceneDescription: string;
    readonly sceneFallback: string;
    readonly taskLabel: string;
    readonly taskProgress: (found: number, total: number) => string;
    readonly clueRead: string;
    readonly clueRecorded: string;
    readonly completeMark: string;
    readonly pendingMark: string;
    readonly peopleLabel: string;
    readonly partyNames: Record<string, { readonly name: string; readonly role: string }>;
    readonly clues: Record<string, { readonly title: string; readonly speaker: string; readonly text: string }>;
    readonly requiredCluesExplanation: string;
    readonly enterAllocation: string;
    readonly resultEnds: string;
    readonly resultRemains: string;
    readonly returnToLedger: string;
    readonly openRecall: string;
    readonly allocationHeading: string;
    readonly allocationInstructions: string;
    readonly revisionInstructions: string;
    readonly initialLabel: string;
    readonly draftLabel: string;
    readonly lock: string;
    readonly revisionLock: string;
    readonly returnToInvestigation: string;
    readonly ownerLabel: (party: string) => string;
    readonly writNames: Record<string, string>;
    readonly revisionHeading: string;
    readonly acceptInitial: string;
    readonly reviseOnce: string;
    readonly debriefHeading: string;
    readonly debriefBody: string;
    readonly utilitiesHeading: string;
    readonly envyHeading: string;
    readonly envyLine: (from: string, to: string, gap: number) => string;
    readonly removeOneHeading: string;
    readonly removeOneInstructions: string;
    readonly removeOneResult: (ef1: boolean, efx: boolean) => string;
    readonly finalHeading: string;
    readonly finalBody: string;
    readonly ef1Label: string;
    readonly efxLabel: string;
    readonly statusYes: string;
    readonly statusNo: string;
    readonly beginActThree: string;
    readonly gradeLabel: string;
    readonly gradeNames: Record<'不稱職' | '平常' | '稱職', string>;
    readonly challengeHeading: string;
    readonly challengeBody: string;
    readonly challengeSubmit: string;
    readonly challengeResult: (nsw: string) => string;
    readonly challengeComplete: string;
    readonly challengeSkip: string;
    readonly roundRobin: string;
    readonly challengeSeal: string;
    readonly ledgerHeading: string;
    readonly ledgerContinue: string;
    readonly postChallengeBoundaryTitle: string;
    readonly postChallengeBoundaryBody: string;
    readonly priorRecordsHeading: string;
    readonly priorActLabel: (act: number) => string;
    readonly priorGradeLabel: string;
    readonly sealLabel: string;
    readonly sealEarned: string;
    readonly sealNotEarned: string;
  };
  readonly ending: {
    readonly heading: string;
    readonly formalLabel: string;
    readonly companionLabel: string;
    readonly outcomeNames: Record<string, string>;
    readonly severityNames: Record<string, string>;
    readonly severityLabel: string;
    readonly mostAggrievedLabel: string;
    readonly mostAggrievedPartyNames: Record<'外朝' | '薊鎮' | '內廷', string>;
    readonly gradeNames: Record<'不稱職' | '平常' | '稱職', string>;
    readonly summaryHeading: string;
    readonly gradesLabel: string;
    readonly initialRatingsLabel: string;
    readonly sealsLabel: string;
    readonly overallSealLabel: string;
    readonly overallSealNames: Record<'國之權衡' | '持平良吏' | '循例之官', string>;
    readonly yiwuVignetteLabel: string;
    readonly hangzhouVignetteLabel: string;
    readonly vignettes: {
      readonly yiwu: { readonly 'competent-or-better': string; readonly 'ordinary-or-below': string };
      readonly hangzhou: { readonly 'competent-or-better': string; readonly 'ordinary-or-below': string };
    };
    readonly earnedMark: string;
    readonly notEarnedMark: string;
    readonly hiddenUnlocked: string;
    readonly hiddenLocked: string;
    readonly history: {
      readonly '鼎足而立': EndingCopy;
      readonly '江陵之怨': GrievanceEndingCopy;
      readonly '薊門之怨': GrievanceEndingCopy;
      readonly '大璫之怨': GrievanceEndingCopy;
      readonly '留中不發': EndingCopy;
    };
    readonly hiddenHistory: string;
    readonly continueLabel: string;
    readonly completedHeading: string;
    readonly completedBody: string;
    readonly completedLabel: string;
  };
  readonly actTwo: {
    readonly introTitle: string;
    readonly introBody: string;
    readonly sceneName: string;
    readonly sceneDescription: string;
    readonly sceneFallback: string;
    readonly taskLabel: string;
    readonly taskProgress: (found: number, total: number) => string;
    readonly clueRead: string;
    readonly clueRecorded: string;
    readonly completeMark: string;
    readonly pendingMark: string;
    readonly debriefEyebrow: string;
    readonly utilitiesHeading: string;
    readonly envyResultHeading: string;
    readonly envyPresent: string;
    readonly envyAbsent: string;
    readonly efLabel: string;
    readonly envyRemains: string;
    readonly continueVerdict: string;
    readonly revisionEyebrow: string;
    readonly initialVerdictLabel: string;
    readonly envyLines: (count: number) => string;
    readonly challengeEyebrow: string;
    readonly returnToLedger: string;
    readonly ledgerEyebrow: string;
    readonly initialLabel: string;
    readonly finalLabel: string;
    readonly gradeLabel: string;
    readonly gradeNames: Record<'不稱職' | '平常' | '稱職', string>;
    readonly harmonyLabel: string;
    readonly masterSealLabel: string;
    readonly sealEarned: string;
    readonly sealNotEarned: string;
    readonly priorRecordsHeading: string;
    readonly priorActLabel: (act: number) => string;
    readonly priorGradeLabel: string;
    readonly priorRevisionLabel: string;
    readonly priorRevisionUsed: string;
    readonly priorRevisionNotUsed: string;
    readonly priorSealLabel: string;
    readonly peopleLabel: string;
    readonly partyNames: Record<string, { readonly name: string; readonly role: string }>;
    readonly clues: Record<string, { readonly title: string; readonly speaker: string; readonly text: string }>;
    readonly allocationHeading: string;
    readonly allocationInstructions: string;
    readonly revisionInstructions: string;
    readonly goodNames: Record<string, string>;
    readonly lock: string;
    readonly revisionLock: string;
    readonly returnToInvestigation: string;
    readonly requiredCluesExplanation: string;
    readonly indivisibleLabel: string;
    readonly sharesLabel: (party: string, amount: number) => string;
    readonly ownerLabel: (party: string) => string;
    readonly initialReaction: string;
    readonly debriefHeading: string;
    readonly debriefBody: string;
    readonly missingFacts: (count: number) => string;
    readonly utility: (party: string, value: number) => string;
    readonly proportionality: string;
    readonly proportionalityUnmet: string;
    readonly matrixHeading: string;
    readonly matrixCaption: string;
    readonly matrixGoodLabel: string;
    readonly newlyRevealed: string;
    readonly alreadyHeard: string;
    readonly envyGraph: string;
    readonly harmony: (value: string) => string;
    readonly wrongOwnerLabel: string;
    readonly wrongOwner: string;
    readonly compensation: string;
    readonly revisionHeading: string;
    readonly acceptInitial: string;
    readonly reviseOnce: string;
    readonly finalHeading: string;
    readonly finalBody: string;
    readonly challengeHeading: string;
    readonly challengeBody: string;
    readonly challengeSubmit: string;
    readonly challengeComplete: string;
    readonly challengeSeal: string;
    readonly challengeSkip: string;
    readonly ledgerHeading: string;
    readonly ledgerContinue: string;
    readonly transitionHeading: string;
    readonly transitionBody: string;
  };
  readonly investigation: {
    readonly taskLabel: string;
    readonly taskProgress: (found: number, total: number) => string;
    readonly taskIncomplete: string;
    readonly enterAllocation: string;
    readonly sceneClueHotspot: string;
    readonly caseDesk: {
      readonly progressLabel: string;
      readonly investigationStep: string;
      readonly investigationHint: string;
      readonly allocationStep: string;
      readonly allocationHint: string;
      readonly complete: string;
    };
    readonly peopleLabel: string;
    readonly sceneCluesLabel: string;
    readonly discoveredLabel: string;
    readonly undiscoveredLabel: string;
    readonly portraitReaction: string;
    readonly reactions: {
      readonly paddyToYounger: { readonly name: string; readonly role: string; readonly text: string };
      readonly silverToElder: { readonly name: string; readonly role: string; readonly text: string };
      readonly brothersExchange: { readonly name: string; readonly role: string; readonly text: string };
      readonly bothAggrieved: { readonly name: string; readonly role: string; readonly text: string };
    };
    readonly scene: {
      readonly name: string;
      readonly description: string;
      readonly fallback: string;
    };
    readonly parties: {
      readonly chengHeng: { readonly name: string; readonly role: string };
      readonly masterZhou: { readonly name: string; readonly role: string };
      readonly chenShouye: { readonly name: string; readonly role: string };
      readonly chenCongzheng: { readonly name: string; readonly role: string };
      readonly chenElder: { readonly name: string; readonly role: string };
    };
    readonly clues: {
      readonly 'clue-chen-shouye-valuations': { readonly title: string; readonly speaker: string; readonly text: string };
      readonly 'clue-chen-congzheng-valuations': { readonly title: string; readonly speaker: string; readonly text: string };
      readonly 'clue-chen-elder-equal-split': { readonly title: string; readonly speaker: string; readonly text: string };
      readonly 'clue-yiwu-original-ruling': { readonly title: string; readonly speaker: string; readonly text: string };
    };
    readonly allocation: {
      readonly heading: string;
      readonly instructions: string;
      readonly revisionInstructions: string;
      readonly valuationHeading: string;
      readonly goodLabel: string;
      readonly valuePoints: (value: number) => string;
      readonly valuationNote: string;
      readonly goodNames: { readonly 'paddy-field': string; readonly 'oil-tea-hillside': string; readonly silver: string };
      readonly partyNames: {
        readonly 'chen-shouye': { readonly name: string; readonly role: string };
        readonly 'chen-congzheng': { readonly name: string; readonly role: string };
      };
      readonly shares: (good: string, party: string, amount: number) => string;
      readonly shareBar: (good: string, brother: string, brotherShares: number, brotherName: string, brotherNameShares: number) => string;
      readonly increase: (good: string, party: string) => string;
      readonly decrease: (good: string, party: string) => string;
      readonly lock: string;
      readonly revisionLock: string;
      readonly returnToInvestigation: string;
      readonly lockedExplanation: string;
      readonly invalidExplanation: string;
      readonly requiredCluesExplanation: string;
      readonly guidance: {
        readonly title: string;
        readonly body: string;
        readonly ask: string;
        readonly chooseGood: string;
        readonly adjustShares: string;
        readonly lock: string;
        readonly dismiss: string;
      };
    };
    readonly rating: {
      readonly heading: string;
      readonly body: string;
      readonly instruction: string;
      readonly choice: (rating: number) => string;
      readonly submit: string;
    };
    readonly debrief: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly intro: string;
      readonly utilityTitle: string;
      readonly utilityLead: string;
      readonly utilityDetails: string;
      readonly utilityFormula: string;
      readonly shareTitle: string;
      readonly shareLead: string;
      readonly shareDetails: string;
      readonly envyTitle: string;
      readonly envyLead: string;
      readonly envyDetails: string;
      readonly conclusionTitle: string;
      readonly conclusionGood: string;
      readonly conclusionNeedsWork: string;
      readonly conclusionBelowDue: string;
      readonly conclusionDetails: string;
      readonly next: string;
      readonly showAll: string;
      readonly continue: string;
      readonly completeAnnouncement: string;
      readonly partyUtility: (party: string, utility: number) => string;
      readonly shareBar: (party: string, utility: number) => string;
      readonly proportionalityResult: (passes: boolean) => string;
      readonly envyResult: (passes: boolean) => string;
      readonly revisionHeading: string;
      readonly revisionBody: string;
      readonly initialLabel: string;
      readonly draftLabel: string;
      readonly acceptInitial: string;
      readonly reviseOnce: string;
      readonly lockFinal: string;
      readonly finalHeading: string;
      readonly finalBody: string;
      readonly awaitLedger: string;
    };
  };
  readonly masterChallenge: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
    readonly assignmentDefinition: string;
    readonly assignmentLabel: string;
    readonly bundleA: string;
    readonly bundleB: string;
    readonly bundleShare: (bundle: string, shares: number) => string;
    readonly assignmentControl: (good: string, first: string, second: string, firstShares: number, secondShares: number) => string;
    readonly outcomeHeading: string;
    readonly dividerOutcome: (first: number, second: number) => string;
    readonly chooserOutcome: (bundle: string, utility: number) => string;
    readonly choiceAccessible: (bundle: string, utility: number) => string;
    readonly hintsHeading: string;
    readonly hintStage: (stage: number) => string;
    readonly hintText: (stage: number) => string;
    readonly hintButton: (stage: number) => string;
    readonly completionHeading: string;
    readonly completed: string;
    readonly notCompleted: string;
    readonly frontierReached: string;
    readonly completionDialogue: string;
    readonly frontierNotReached: string;
    readonly sealAwarded: string;
    readonly sealUnavailable: string;
    readonly submit: string;
    readonly submitAgain: string;
    readonly returnToLedger: string;
    readonly skip: string;
    readonly noGameOver: string;
  };
  readonly ledger: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly initialVerdict: string;
    readonly finalVerdict: string;
    readonly grade: string;
    readonly revision: string;
    readonly revisionUsed: string;
    readonly revisionNotUsed: string;
    readonly challengeStatus: string;
    readonly challengeCompleted: string;
    readonly challengeSkipped: string;
    readonly challengePending: string;
    readonly sealStatus: string;
    readonly sealEarned: string;
    readonly sealNotEarned: string;
    readonly progress: (earned: number) => string;
    readonly futureLocked: string;
    readonly returnToChallenge: string;
    readonly openRecall: string;
    readonly continue: string;
  };
  readonly recall: {
    readonly heading: string;
    readonly body: string;
    readonly slotName: (slot: string) => string;
    readonly locked: string;
    readonly replay: string;
  };
  readonly transition: {
    readonly heading: string;
    readonly body: string;
    readonly continue: string;
  };
  readonly shell: {
    readonly loading: string;
    readonly campaignTitle: string;
    readonly campaignTitleEnglish: string;
    readonly firstVisitLead: string;
    readonly start: string;
    readonly continue: string;
    readonly restart: string;
    readonly openPause: string;
    readonly languageSwitch: string;
    readonly rebuiltTitle: string;
    readonly rebuiltBody: string;
    readonly acknowledgeRebuild: string;
    readonly restartTitle: string;
    readonly restartBody: string;
    readonly cancelRestart: string;
    readonly confirmRestart: string;
    readonly recoveryCorrupt: string;
    readonly recoveryInvalid: string;
    readonly recoveryVersion: string;
    readonly recoveryLegacy: string;
    readonly storageUnavailable: string;
    readonly titleEyebrow: string;
    readonly titleLead: string;
    readonly begin: string;
    readonly introEyebrow: string;
    readonly introTitle: string;
    readonly introBody: string;
    readonly continueIntro: string;
    readonly boundaryTitle: string;
    readonly boundaryBody: string;
    readonly unavailablePhaseTitle: string;
    readonly unavailablePhaseBody: string;
  };
  readonly stage: {
    readonly stage: string;
    readonly skipToContent: string;
    readonly enterFullscreen: string;
    readonly fullscreenActive: string;
    readonly fullscreenEntered: string;
    readonly fullscreenUnsupported: string;
    readonly fullscreenFailed: string;
    readonly orientationLockUnsupported: string;
    readonly orientationLockFailed: string;
    readonly rotateTitle: string;
    readonly rotateDescription: string;
  };
  readonly pauseMenu: {
    readonly title: string;
    readonly continue: string;
    readonly currentTask: string;
    readonly controls: string;
    readonly controlsHelp: string;
    readonly subtitles: string;
    readonly volume: string;
    readonly textSize: string;
    readonly textSizeSmall: string;
    readonly textSizeMedium: string;
    readonly textSizeLarge: string;
    readonly replayCurrentCutscene: string;
    readonly recallArchive: string;
    readonly restart: string;
    readonly returnToMenu: string;
    readonly restartConfirmationTitle: string;
    readonly restartConfirmationBody: string;
    readonly cancelRestart: string;
    readonly confirmRestart: string;
    readonly tasks: {
      readonly watchCutscene: string;
      readonly openCase: string;
      readonly hearIntroduction: string;
      readonly phaseBoundary: string;
      readonly investigation: string;
      readonly allocation: string;
      readonly intuitionRating: string;
      readonly debrief: string;
      readonly revisionDecision: string;
      readonly revision: string;
      readonly finalVerdict: string;
      readonly solveMasterChallenge: string;
      readonly reviewLedger: string;
      readonly beginActTwo: string;
    };
  };
}

export const adventureZhTW: AdventureMessages = {
  title: '序幕：執秤之人',
  videoLabel: '序幕：執秤之人',
  enter: '入殿',
  pause: '暫停',
  resume: '繼續播放',
  mute: '靜音',
  unmute: '取消靜音',
  volume: '音量',
  subtitles: '字幕',
  subtitlesOn: '字幕已開啟',
  subtitlesOff: '字幕已關閉',
  skip: '略過過場',
  replay: '重播',
  retry: '重試',
  useFallback: '改看故事卷',
  continue: '繼續',
  loading: '準備過場中…',
  errorTitle: '影片無法播放',
  errorBody: '您可以重試，或改看包含完整劇情文字的故事卷。',
  reducedMotionTitle: '故事卷',
  reducedMotionBody: '已依照您的減少動態設定，以靜態故事卷呈現。',
  fallbackTitle: '故事卷',
  fallbackBody: '以下文字保留這段過場的完整劇情。',
  fallbackAlt: '文華殿內，萬曆帝御案前的冬日召對',
  fallbackTitleBySlot: {
    'cs-00': '序幕：執秤之人', 'cs-01': '義烏陳氏兄弟析產', 'cs-02': '兄弟各得其分', 'cs-03': '義烏來信',
    'cs-04': '杭州裴氏機房', 'cs-05': '機房照常開動', 'cs-06': '入京薦書', 'cs-07': '三道關口',
    'cs-08': '最少的一份', 'cs-09': '鼎足而立', 'cs-10': '江陵之怨', 'cs-11': '薊門之怨',
    'cs-12': '大璫之怨', 'cs-13': '留中不發', 'cs-14': '定分宗師',
  },
  fallbackHeadingBySlot: {
    'cs-00': '紙面故事卷', 'cs-01': '紙面故事卷', 'cs-02': '紙面故事卷', 'cs-03': '紙面故事卷', 'cs-04': '紙面故事卷',
    'cs-05': '紙面故事卷', 'cs-06': '紙面故事卷', 'cs-07': '紙面故事卷', 'cs-08': '紙面故事卷', 'cs-09': '紙面故事卷',
    'cs-10': '紙面故事卷', 'cs-11': '紙面故事卷', 'cs-12': '紙面故事卷', 'cs-13': '紙面故事卷', 'cs-14': '紙面故事卷',
  },
  fallbackAltBySlot: {
    'cs-00': '文華殿內，萬曆帝御案前的冬日召對', 'cs-01': '金華府衙二堂', 'cs-02': '陳氏兄弟田埂與鐵匠鋪交接',
    'cs-03': '油燈下陳從征寫信', 'cs-04': '杭州府衙', 'cs-05': '裴氏機房開機', 'cs-06': '三份推薦文書',
    'cs-07': '三道關口的故事卷', 'cs-08': '最少一份的故事卷', 'cs-09': '鼎足而立的故事卷', 'cs-10': '江陵之怨的故事卷',
    'cs-11': '薊門之怨的故事卷', 'cs-12': '大璫之怨的故事卷', 'cs-13': '留中不發的故事卷', 'cs-14': '定分宗師的故事卷',
  },
  transcriptTitle: '完整過場文字',
  cues: {
    location: '萬曆九年冬　北京　文華殿',
    emperor: '萬曆帝：程衡。張先生說他是為了太倉，戚少保說他是為了邊關，大伴說他是為了朕。三個人說的都是實話。你告訴朕——朕該聽誰的？',
    chengUncertain: '程衡：臣不知道該聽誰的。',
    fengReaction: '殿中一靜。馮保嘴角微微一動。',
    chengDivide: '程衡：臣只會分東西。',
    title: '畫面定格在戥子的秤星上。墨色暈開，題名浮現：《定分止爭錄》。',
    narratorRabbits: '老年程衡：商君說，一隻兔子在野地裡跑，一百個人追；滿市的兔子擺在攤上，路過的人看都不看。不是兔子變多了，是名分定了。',
    narratorLife: '老年程衡：我這一輩子沒做過別的事，就是替人把名分定下來。',
    narratorFirstCase: '老年程衡：頭一回，是在義烏。那年我二十八歲，剛學會穿官袍。',
    sixYearsEarlier: '六年前。',
  },
  transcript: {
    scene: '萬曆九年冬，北京文華殿。殿外落雪，殿內炭盆燒得正旺。馮保侍立御座旁；張居正與戚繼光分立丹陛之下。七品小官程衡跪在走道正中，面前擱著一桿舊戥子。',
    emperor: '萬曆帝：「程衡。張先生說他是為了太倉，戚少保說他是為了邊關，大伴說他是為了朕。三個人說的都是實話。你告訴朕——朕該聽誰的？」',
    chengUncertain: '程衡：「臣不知道該聽誰的。」',
    fengReaction: '殿中一靜。馮保嘴角微微一動。',
    chengDivide: '程衡：「臣只會分東西。」',
    title: '畫面定格在戥子的秤星上。墨色暈開，題名浮現：《定分止爭錄》。',
    narratorRabbits: '老年程衡：「商君說，一隻兔子在野地裡跑，一百個人追；滿市的兔子擺在攤上，路過的人看都不看。不是兔子變多了，是名分定了。」',
    narratorLife: '「我這一輩子沒做過別的事，就是替人把名分定下來。」',
    narratorFirstCase: '「頭一回，是在義烏。那年我二十八歲，剛學會穿官袍。」',
    sixYearsEarlier: '六年前。',
    cs01Scene: '金華府衙二堂。新到任的程衡把戥子擱上公案，周先生抱著義烏送來的積案進門。',
    cs01Location: '義烏縣　上控',
    cs01Zhou: '周先生：「大人，這案子有意思。兄弟倆分家，義烏知縣照律法判的：每樣東西一人一半，一厘不差。結果哥哥不服，弟弟也不服，兩個人一起告到咱們這兒來了。判得這麼平，怎麼兩邊都喊冤？大人先去問問，他們各自到底想要什麼。」',
    cs02Scene: '陳守業在田埂上插秧，抬頭看見城西升起一縷鐵匠鋪的煙。',
    cs03Scene: '油燈下，陳從征用左手壓著紙，給薊鎮老營的同袍寫信。',
    cs03Letter: '陳從征寫道：「府裡新來的程大人，審案子帶著一桿稱銀子的小秤。他沒多給我一文錢，可我哥和我，如今又在一張桌上吃飯了。」',
    cs03TimeJump: '五年後 · 萬曆八年冬',
    cs03LedgerTitle: '考成簿',
    cs03LedgerEntry: '「所斷戶婚田土，五年無一上控。」',
    cs03LedgerPlain: '他判過的分家、田產官司，五年來沒有一件再有人往上告。',
    cs03Transfer: '御史朱批：調繁',
    cs03TransferPlain: '調他去事情更多、更難辦的大府。',
    cs04Scene: 'CS-04 · 杭州府衙。清丈限期與織造局的上供期限，同時壓在裴氏機房這一案上。',
    cs04Zhou: '周先生：「機房劈不得。先問清楚每個人眼裡什麼最重，別讓冊子與機子一起停下。」',
    cs04Closing: '杭州案在兩道期限之間展開。',
    cs05Scene: 'CS-05 · 三十張花樓織機同時開動；魚鱗圖冊落下三個戶名。',
    cs05Reaction: '機房整體歸置，領織牌照保住了。',
    cs06Recommendation: 'CS-06 · 浙江巡按的薦書送往京城：清丈如期、上供無誤。',
    cs06Zhang: '張居正在政績簿上圈起程衡的名字：「會算帳的進士，不多。」',
    cs06Feng: '馮保聽完杭州的回報，記住了那個帶秤的推官。',
    cs06Qi: '薊鎮，戚繼光把陳從征的舊信重新夾回兵書。',
    cs07Rules: 'CS-07 · 周先生說明擬稿、批紅、六科檢查三關。', cs07FourDays: '四日之間，兩份零乘積的稿子被退回，程衡奉召入文華殿。',
    cs08Zhang: 'CS-08 · 張居正在文華門外停步，看見最少的一份落在提拔程衡的人手裡。', cs08Cheng: '程衡：「三家連乘，所得最多。」',
    cs09History: 'CS-09 · 文華殿中央，三足銅鼎的三道影子一樣長。', cs10History: 'CS-10 · 深夜內閣，程衡的名字旁多了一個黑圈。', cs11History: 'CS-11 · 薊鎮城牆上，戚繼光把佩刀橫在城垛。', cs12History: 'CS-12 · 夜裡司禮監，馮保對著燭火一顆顆捻佛珠。', cs13Dialogue: '萬曆帝：「你這一份，朕替你乘過了。」', cs13History: 'CS-13 · 萬曆帝把建議書推到御案角落，留中不發。', cs14Narration: 'CS-14 · 徽州休寧老屋天井，老年程衡在空白簿子封皮寫下《定分止爭錄》。',
  },
  actTwo: {
    introTitle: '第二幕：萬曆八年冬 · 杭州裴氏機房鬮分案',
    introBody: '清丈田冊等著落戶，宮裡的織料不能停。三位繼承人要分三種可分物與一件不可分的機房。',
    sceneName: '杭州府衙', sceneDescription: '清丈期限與織造局的催辦，同時落在裴氏機房案上。', sceneFallback: '杭州府衙場景底圖仍是 provisional；紙面 fallback 誠實保留搜證與遊玩。',
    taskLabel: '第二幕搜證', taskProgress: (found, total) => `已記入線索 ${found}/${total}`,
    clueRead: '詢問', clueRecorded: '已記入', completeMark: '✓', pendingMark: '…',
    debriefEyebrow: '斷案卷宗', utilitiesHeading: '效用', envyResultHeading: '嫉妒結果',
    envyPresent: '至少一人覺得另一人的所得更好。', envyAbsent: 'EF · 沒有妒線', efLabel: 'EF', envyRemains: '仍有嫉妒',
    continueVerdict: '前往定讞選擇', revisionEyebrow: '改判', initialVerdictLabel: '初判',
    envyLines: (count) => `${count} 條妒線`, challengeEyebrow: '巧解挑戰', returnToLedger: '返回考成簿',
    ledgerEyebrow: '考成簿', initialLabel: '初判', finalLabel: '定讞', gradeLabel: '考語',
    gradeNames: { '不稱職': '不稱職', '平常': '平常', '稱職': '稱職' },
    harmonyLabel: '和氣值', masterSealLabel: '巧字印', sealEarned: '已取得', sealNotEarned: '未取得',
    priorRecordsHeading: '前幕記錄', priorActLabel: (act) => `第${act}幕記錄`, priorGradeLabel: '考語',
    priorRevisionLabel: '是否改判', priorRevisionUsed: '是', priorRevisionNotUsed: '否', priorSealLabel: '巧字印', peopleLabel: '案中當事人',
    partyNames: { 'pei-boqian': { name: '裴伯謙', role: '長子' }, 'pei-zhongwen': { name: '裴仲文', role: '次子' }, 'xue-shoucheng': { name: '薛守成', role: '贅婿、機房掌事' } },
    clues: {
      'clue-pei-boqian-valuations': { title: '裴伯謙的估值', speaker: '裴伯謙', text: '桑田值 40 分，機房 30 分，生絲 20 分，現銀 10 分。' },
      'clue-pei-zhongwen-valuations': { title: '裴仲文的估值', speaker: '裴仲文', text: '進京趕考要盤纏，現銀值 40 分；桑田 30 分，生絲 20 分，機房 10 分。' },
      'clue-xue-shoucheng-valuations': { title: '薛守成的估值', speaker: '薛守成', text: '二十年守著織機，機房值 50 分；生絲 30 分，田與銀各 10 分。' },
      'clue-loom-workshop-indivisible': { title: '花樓織機模型', speaker: '程衡', text: '機房連同領織牌照不能劈開；一拆就只剩柴，牌照也作廢。' },
    },
    allocationHeading: '混合物分配案台', allocationInstructions: '機房只能整件交給一人；其餘物品各分十成。請先憑直覺提出初判。', revisionInstructions: '妒線與找補工具已開放。這一幕的和氣值可在改判時查看。', goodNames: { 'loom-workshop': '裴氏機房', 'mulberry-fields': '桑田', 'cash-silver': '現銀', 'raw-silk': '生絲' }, lock: '鎖定初判', revisionLock: '鎖定定讞', returnToInvestigation: '返回搜證', requiredCluesExplanation: '請先記下機房不可分的線索。三人的私下估值可以留到卷宗揭曉才知道。', indivisibleLabel: '不可分 · 一人持有', sharesLabel: (party, amount) => `${party}：${amount}/10 成`, ownerLabel: (party) => `機房持有人：${party}`, initialReaction: '當事人對分置有所反應，但正式指標尚未揭曉。', debriefHeading: '斷案卷宗 · 杭州案', debriefBody: '完整估值矩陣現在展開；初判前漏聽的陳述會明白標記。', missingFacts: (count) => `初判前漏聽 ${count} 項估值陳述，現在補行揭示。`, utility: (party, value) => `${party}：所得 ${value} / 100`, proportionality: '每人按自己的眼光都至少拿到全案三分之一。', proportionalityUnmet: '至少一人按自己的眼光未拿到全案三分之一。', matrixHeading: '完整估值矩陣', matrixCaption: '下表列出每項家產按各人眼光的原訂估值；狀態標記該估值是本次新揭示或初判前已聽取。', matrixGoodLabel: '家產', newlyRevealed: '本次新揭示', alreadyHeard: '初判前已聽取', envyGraph: '妒線圖', harmony: (value) => `和氣值：${value}`, wrongOwnerLabel: '機房由兩位少爺中的任何一人持有時', wrongOwner: '三種可分物怎麼調都消不掉全部妒線。', compensation: '標準找補：機房給薛守成，生絲分成 2／2／6。所得為 44／44／68，EF 成立，和氣值 131648。', revisionHeading: '選定第二幕定讞', acceptInitial: '接受初判', reviseOnce: '改判一次', finalHeading: '第二幕定讞', finalBody: '混合物分法已凍結，將記入考成簿。', challengeHeading: '第二幕巧解挑戰', challengeBody: '找出無人眼紅、並達到標準和氣值 frontier 的分法。', challengeSubmit: '檢查分法', challengeComplete: '找補挑戰完成。', challengeSeal: '達到 131648 frontier，取得巧字印。', challengeSkip: '略過巧解挑戰', ledgerHeading: '第二幕考成簿', ledgerContinue: '前往第三幕交界', transitionHeading: '第三幕交界', transitionBody: 'CS-06 收束第二幕。按下 CS-07 後，第三幕搜證便會開放。',
  },
  actThree: {
    introTitle: '第三幕：萬曆九年冬 · 文華殿歲計召對', introBody: '六道不可分割的敕書要分給外朝、薊鎮、內廷；沒有可分的物品可以替各家調和，只能把每道敕書整件定給一方。', sceneName: '文華殿與六科廊', sceneDescription: '三家人等著看六道敕書如何定分。', sceneFallback: '文華殿場景底圖仍待美術審核；紙面 fallback 保留全部搜證目標與操作。', taskLabel: '第三幕搜證', taskProgress: (found, total) => `已記入線索 ${found}/${total}`, clueRead: '詢問', clueRecorded: '已記入', completeMark: '✓', pendingMark: '…', peopleLabel: '殿上三家',
    partyNames: { 'wai-chao': { name: '外朝', role: '文官 · 張居正' }, 'ji-zhen': { name: '薊鎮', role: '邊軍 · 戚繼光' }, 'nei-ting': { name: '內廷', role: '宮裡 · 馮保' } },
    clues: { 'clue-wai-chao-valuations': { title: '張居正的估值', speaker: '張居正', text: '鹽三十、糧二十、火二十、市十五、織十，兵符五分。' }, 'clue-ji-zhen-valuations': { title: '戚繼光的估值', speaker: '戚繼光', text: '兵符三十五、糧三十、火二十、鹽十、市五，織造零分。' }, 'clue-nei-ting-valuations': { title: '馮保的估值', speaker: '馮保', text: '鹽三十五、織二十、火十五；兵符、糧、市各十分。' }, 'clue-emperor-no-unanimity': { title: '皇帝的吩咐', speaker: '萬曆帝', text: '朕不要三家都歡喜；只要散了朝，沒有人回去掀桌子。' } }, requiredCluesExplanation: '先記下皇帝的吩咐，才能鎖定初判；三家私下估值可留到揭曉再知。', enterAllocation: '進入分配案台', resultEnds: '妒線斷了', resultRemains: '妒線仍在', returnToLedger: '返回考成簿', openRecall: '開啟回想庫',
    allocationHeading: '六道敕書分配案台', allocationInstructions: '每道敕書不可分割，且只能有一個主人。初判時不顯示正式指標。', revisionInstructions: '分秤、妒線、去一物已開啟；改判時仍不顯示和氣值。', initialLabel: '初判', draftLabel: '改判草案', lock: '鎖定初判', revisionLock: '鎖定定讞', returnToInvestigation: '返回搜證', ownerLabel: (party) => `歸 ${party}`,
    writNames: { 'military-command': '符｜薊鎮節制', 'salt-tax': '鹽｜兩淮鹽課', 'grain-route': '糧｜邊餉轉運', firearms: '火｜火器督造', 'border-market': '市｜宣大互市', 'imperial-weaving': '織｜蘇杭織造' }, revisionHeading: '選擇第三幕定讞', acceptInitial: '維持初判', reviseOnce: '改判一次', debriefHeading: '斷案卷宗 · 六道敕書', debriefBody: '完整估值矩陣現在展開；正式指標等你自評後才顯示。', utilitiesHeading: '各家所得', envyHeading: '妒線', envyLine: (from, to, gap) => `${from} 看 ${to} 眼紅 ${gap} 分。`, removeOneHeading: '去一物測試', removeOneInstructions: '選一條妒線，再從被看的案上逐件拿走敕書。結果依正式估值計算。', removeOneResult: (ef1, efx) => efx ? 'EFX（穩）：拿走任何一件對方看得上的敕書，妒線都會斷。' : ef1 ? 'EF1（過得去）：拿走某一件敕書，妒線會斷；但不是每一件都行。' : 'EF1 不成立：拿走一件仍不足以斷掉妒線。', finalHeading: '第三幕定讞', finalBody: '定分條陳已記入考成簿；繼續即可進入國運結局。', ef1Label: 'EF1', efxLabel: 'EFX', statusYes: '是', statusNo: '否', beginActThree: '開始第三幕 · CS-07', gradeLabel: '考語', gradeNames: { '不稱職': '不稱職', '平常': '平常', '稱職': '稱職' }, challengeHeading: '第三幕巧解挑戰', challengeBody: '先看依品級輪揀，再找一個 EFX 分法；和氣值只在巧解挑戰顯示。', challengeSubmit: '檢查分法', challengeResult: (nsw) => `和氣值（各家所得相乘）：${nsw}`, challengeComplete: '挑戰完成。', challengeSkip: '略過巧解挑戰', roundRobin: '依品級輪揀', challengeSeal: '達到作者設定前沿，取得「巧」字印。', ledgerHeading: '第三幕考成簿', ledgerContinue: '前往第三幕結束邊界', postChallengeBoundaryTitle: '第三幕邊界', postChallengeBoundaryBody: '第三幕的分配、巧解挑戰與考成已完成。接下來進入終幕。', priorRecordsHeading: '前幕記錄', priorActLabel: (act) => `第${act}幕記錄`, priorGradeLabel: '考語', sealLabel: '巧字印', sealEarned: '已取得', sealNotEarned: '未取得',
  },
  ending: {
    heading: '終幕：硃批之後', formalLabel: '史書體', companionLabel: '白話', outcomeNames: { '鼎足而立': '鼎足而立', '江陵之怨': '江陵之怨', '薊門之怨': '薊門之怨', '大璫之怨': '大璫之怨', '留中不發': '留中不發' }, severityNames: { none: '—', mild: '輕', severe: '重' }, severityLabel: '輕重', mostAggrievedLabel: '最不平者', mostAggrievedPartyNames: { '外朝': '外朝', '薊鎮': '薊鎮', '內廷': '內廷' }, gradeNames: { '不稱職': '不稱職', '平常': '平常', '稱職': '稱職' }, summaryHeading: '考成總評', gradesLabel: '三幕考語', initialRatingsLabel: '初判自評 → 實際考語', sealsLabel: '巧字印', overallSealLabel: '總印', overallSealNames: { '國之權衡': '國之權衡', '持平良吏': '持平良吏', '循例之官': '循例之官' }, yiwuVignetteLabel: '義烏陳家', hangzhouVignetteLabel: '杭州裴家', vignettes: { yiwu: { 'competent-or-better': '城西鐵匠鋪爐火正旺，陳守業送新米進城，兄弟倆坐在門檻上分一碗黃酒。', 'ordinary-or-below': '鐵匠鋪的招牌換了別家姓氏。陳守業一個人在田裡，田埂那頭的十畝地荒著。' }, hangzhou: { 'competent-or-better': '機房掛著「裴薛合記」的新匾，裴仲文從京城寄回一封家書。', 'ordinary-or-below': '機房大門貼著織造局的封條，三十張花樓機蒙著布。' } }, earnedMark: '已取得', notEarnedMark: '未取得', hiddenUnlocked: '三枚巧字印俱全：隱藏結局已開。', hiddenLocked: '隱藏結局未開：三枚巧字印尚未俱全。', history: {
      '鼎足而立': { formal: '九年冬，歲計定。明年六月，太師張居正卒。朝野洶洶，謂必有大獄。然鹽課、糧道、火器各有成敕，名分已定，欲奪者無所藉口，事竟寢。戚繼光鎮薊門如故，終其任，邊牆無警。上嘗指文華殿故處謂左右曰：「昔有青袍小臣跪於此，朕始知天下事可以算而定也。」', plain: '第二年夏天，張首輔病逝。人人都以為朝廷要大亂，要有人被清算。可是六件事早就各有其主，誰想搶，都找不到藉口。事情就這麼過去了。戚將軍守著長城，一直守到老。皇上後來常指著我跪過的那塊地方說：原來天下的事，是可以算清楚的。' },
      '江陵之怨': { mild: { formal: '歲計行，太倉歲入漸絀，清丈新冊束於高閣，一條鞭之議屢下屢格。居正力疾視事，明年六月卒。上嘆曰：「先生之志，竟未竟也。」', plain: '國庫的進帳一年比一年少，量好的田冊沒人去用，新政推一步、退一步。張首輔帶病撐著，第二年夏天過世。他想做的事，終究沒有做完。我被調離京城，去陝西做了個地方官。' }, severe: { formal: '居正怒，以考成法劾衡「妄議歲計，動搖國本」，謫雲南某驛典史。新政自是中輟。後十餘年，寧夏、朝鮮、播州三役並興，太倉無旬月之儲。', plain: '張首輔大怒，一道彈劾把我貶到雲南的小驛站。新政從此停了。十幾年後，朝廷三面打仗，國庫裡的錢撐不過一個月。' } },
      '薊門之怨': { mild: { formal: '繼光三疏乞休，不許。十一年，調鎮廣東。行之日，薊人遮道。十五年，卒於登州里第，家無餘貲。', plain: '戚將軍三次請求辭官，皇上都不准。兩年後，他被調去廣東。離開那天，薊鎮的百姓攔在路上不讓他走。又過了幾年，他病逝在山東老家，家裡沒有留下一點錢。我留在戶科，再也沒有升過官。' }, severe: { formal: '糧道既歸他司，南兵餉屢不繼。營中鼓譟，守臣以計定之，戮數百人，薊鎮精銳自是耗矣。後三十餘年，東事起，朝議每思戚少保，而少保墓木已拱。', plain: '軍糧交給別人管以後，戚將軍從浙江帶來的兵，一再領不到餉。營裡鬧了起來，官府設計鎮壓，殺了幾百人。長城上最能打的一支兵，就這樣沒了。三十多年後，東北戰事大起，朝廷才想起戚將軍——他墳上的樹，已經很高了。陳從征的鐵匠鋪收到一封從薊鎮退回的信，封皮上寫著「查無此營」。' } },
      '大璫之怨': { mild: { formal: '保日夕言於上前，謂外廷結黨。十年六月居正卒，言官承風交章發其事。十二年，籍其家，新政盡罷。', plain: '馮公公天天在皇上耳邊說：文官們結成了一夥。第二年張首輔一過世，彈劾他的奏章就像雪片一樣飛來。又過兩年，張家被抄，新政全部廢除。我被算成「張首輔的人」，丟了官，回了徽州老家。' }, severe: { formal: '是夜，緹騎至六科廊，逮衡下鎮撫司。廷杖六十，謫戍。上自是益信近侍，後遣中官四出開礦榷稅，天下騷然。', plain: '當天夜裡，東廠的人就到六科把我抓走了。我在朝堂上挨了六十棍，被發配到邊疆。從那以後，皇上越來越只信身邊的太監，後來還派他們到各地開礦收稅，天下不得安寧。' } },
      '留中不發': { formal: '疏入，留中。歲計竟不行，各衙門循舊例支吾而已。上由是悟：凡事之不可分者，不如不分。其後章奏留中者歲以千計，郊廟不親，朝講不御，蓋自此始。', plain: '我的建議書送上去，皇上沒有批，就那樣擱著。明年的六件事，誰也沒拿到授權，各個衙門只能照舊例敷衍。皇上從這一夜學到一件事：既然怎麼分都有人掀桌子，那就乾脆不分。後來，他擱著不批的奏章一年有上千份，不上朝，不見大臣——都是從這一夜開始的。我被扣了俸祿，不久就丟了官。' },
    }, hiddenHistory: '切得開的東西，總有辦法讓人人不眼紅。切不開的，沒有。這不是人心不足，是算學的邊界。我能做的，只是走到邊界上，再往前算一步。', continueLabel: '完成終幕', completedHeading: '終幕已完成', completedBody: '本結局已完成並保存；重新載入本次劇情後仍可回到這裡。', completedLabel: '終幕已完成',
  },
  investigation: {
    taskLabel: '搜證任務',
    taskProgress: (found, total) => `必要線索 ${found}/${total}`,
    taskIncomplete: '四項必要線索尚未齊全。請先逐一詢問並讀過案卷，才能進入分配案台。',
    enterAllocation: '前往分配家產',
    sceneClueHotspot: '查看案上的縣判原卷',
    caseDesk: {
      progressLabel: '案件流程',
      investigationStep: '聽取陳述',
      investigationHint: '詢問三位當事人，並查看義烏縣原判。',
      allocationStep: '分配家產',
      allocationHint: '依兩兄弟各自看重的家產分配十成。',
      complete: '已完成',
    },
    peopleLabel: '案中人物',
    sceneCluesLabel: '場景線索',
    discoveredLabel: '已記入',
    undiscoveredLabel: '詢問',
    portraitReaction: '等待陳述',
    reactions: {
      paddyToYounger: { name: '陳守業', role: '兄', text: '陳守業蹲了下去，抱著頭不說話。' },
      silverToElder: { name: '陳從征', role: '弟', text: '陳從征苦笑：「大人，我哥拿這銀子做什麼？埋在灶台底下嗎？」' },
      brothersExchange: { name: '陳守業', role: '陳氏兄弟', text: '兄弟倆第一次對看了一眼。' },
      bothAggrieved: { name: '陳氏兄弟', role: '當事人', text: '陳守業抱頭不語；陳從征苦笑著望向案上的現銀。' },
    },
    scene: {
      name: '金華府衙二堂',
      description: '程衡把戥子擱上公案，義烏陳氏兄弟的析產案送到了府裡。',
      fallback: '案卷紙頁仍保留案件名稱與搜證操作。',
    },
    parties: {
      chengHeng: { name: '程衡', role: '金華府推官' },
      masterZhou: { name: '周先生', role: '程衡的幕僚' },
      chenShouye: { name: '陳守業', role: '兄，種田為生' },
      chenCongzheng: { name: '陳從征', role: '弟，戚家軍退伍鳥銃手' },
      chenElder: { name: '陳老太公', role: '陳氏族長' },
    },
    clues: {
      'clue-chen-shouye-valuations': {
        title: '陳守業的估值',
        speaker: '陳守業',
        text: '老爺，小人不懂律。小人只曉得，二十畝田養七口人剛剛好，劈走十畝，就得餓死兩個。這田在小人心裡值 60 分。山場和銀子，各算 20 分罷——銀子是好東西，可銀子種不出稻子。',
      },
      'clue-chen-congzheng-valuations': {
        title: '陳從征的估值',
        speaker: '陳從征',
        text: '大人，我這條腿是在薊鎮牆子嶺凍壞的，水田是下不去了。分我十畝田，我只能佃給別人，一年收不回幾斗租，頂多值 20 分。我要的是銀子——60 分。城西有間鐵匠鋪要盤出去，我在營裡修了八年鳥銃，這手藝餓不死人。山場嘛，20 分，有也好。',
      },
      'clue-chen-elder-equal-split': {
        title: '陳老太公說明原判',
        speaker: '陳老太公',
        text: '縣尊判得沒錯呀！田各十畝，山各十五畝，銀各五十兩，戥子稱過的，一厘不差。',
      },
      'clue-yiwu-original-ruling': {
        title: '義烏縣原判',
        speaker: '義烏縣原判',
        text: '判詞工整：「依令均分，各得其半。」程衡把戥子往判詞上一壓：「稱得很準。可惜稱的是東西，不是人。」',
      },
    },
    allocation: {
      heading: '分配案台',
      instructions: '每項家產共十成。滑桿設定哥哥所得，弟弟取得餘額。先憑直覺分配，指標稍後揭曉。',
      revisionInstructions: '初判會固定在旁供你比較。調整改判草案時，分秤與其他正式工具會即時更新；鎖定定讞後，整份記錄便會凍結。',
      valuationHeading: '兩兄弟眼中的家產價值',
      goodLabel: '家產',
      valuePoints: (value) => `${value} 分`,
      valuationNote: '分數是兄弟各自的主觀看法，不是市價。',
      goodNames: { 'paddy-field': '水田', 'oil-tea-hillside': '油茶山場', silver: '現銀' },
      partyNames: {
        'chen-shouye': { name: '陳守業', role: '兄' },
        'chen-congzheng': { name: '陳從征', role: '弟' },
      },
      shares: (good, party, amount) => `${good}分給${party}${amount}成`,
      shareBar: (good, brother, brotherShares, brotherName, brotherNameShares) => `${good}：${brother} ${brotherShares} 成；${brotherName} ${brotherNameShares} 成`,
      increase: (good, party) => `增加${good}給${party}的份額`,
      decrease: (good, party) => `減少${good}給${party}的份額`,
      lock: '鎖定初判',
      revisionLock: '鎖定定讞',
      returnToInvestigation: '返回搜證',
      lockedExplanation: '初判已鎖定；接下來先記下你的直覺評價。',
      invalidExplanation: '每項家產必須維持十成，這次調整未能套用。',
      requiredCluesExplanation: '請先完成四項必要線索，才能鎖定初判。',
      guidance: {
        title: '第一次使用案台',
        body: '滑桿設定哥哥的份額，弟弟取得其餘；也可返回上一步重看證詞。',
        ask: '參照兄弟各自說出的估值。',
        chooseGood: '設定分給哥哥的成數。',
        adjustShares: '拖動分配桿，或用方向鍵調整。',
        lock: '分好三項家產後鎖定初判。',
        dismiss: '知道了',
      },
    },
    rating: {
      heading: '記下你的初判直覺',
      body: '在看見案卷的衡量結果以前，請評價你對這份分配的直覺感受。',
      instruction: '請選擇 1 到 5 分。',
      choice: (rating) => `直覺評價 ${rating} 分`,
      submit: '提交直覺評價',
    },
    debrief: {
      eyebrow: '斷案卷宗',
      heading: '逐摺讀完判詞',
      intro: '你的初判已經留存。現在，卷宗一摺一摺展開。',
      utilityTitle: '兄弟各自所得',
      utilityLead: '先聽兄弟各自眼中的所得。',
      utilityDetails: '書吏如何相加各人的主觀估值',
      utilityFormula: '對每一人而言，效用是 uᵢ(Aᵢ) = Σ vᵢ(g)：把他親口說出的各項家產價值，逐項相加到自己所得的那一份。',
      shareTitle: '得其分 · 比例公平',
      shareLead: '周先生取出兩根刻著十成的竹籤：「先別管東西是怎麼分的，只問他本人一句：全部家產算十成，你覺得自己拿到了幾成？兩個人分家，拿到五成以上，就不算吃虧。這叫得其分。大人看看，您這一判，兩根籤各停在幾成？」原判每樣對半，兄弟各得五成；若把水田分給弟弟、現銀分給哥哥，山場仍對半，兩人各只得三成；水田給哥哥、現銀給弟弟、山場對半，兄弟各得七成，也互不嫉妒。周先生又道：「田還是那些田，銀子一兩也沒多。每樣對半分，兩人各拿五成；各拿各想要的，兩人各拿七成。多出來的這些，不是變出來的，是因為有人肯先問一句：你到底想要什麼。」',
      shareDetails: '兩人分家時，每人認定的自己所得，至少要達到全部家產價值的一半：vᵢ(Aᵢ) ≥ vᵢ(M)/2。',
      envyTitle: '嫉妒 · EF 無嫉妒',
      envyLead: '再把各自的所得，和對方那一份放在一起比較。',
      envyDetails: '若兩人都不覺得對方那一份比自己的更好，便是無嫉妒：vᵢ(Aᵢ) ≥ vᵢ(Aⱼ)。',
      conclusionTitle: '書吏短評',
      conclusionGood: '這一判讓兄弟各得其分，也沒有人盯著對方手裡的那一份。',
      conclusionNeedsWork: '兄弟都得其分，但至少有一人仍覺得對方那一份更好。',
      conclusionBelowDue: '至少有一人未得其分；卷宗記下這一判讓誰短了應得之分。',
      conclusionDetails: '正式術語現在已揭開。你可以接受初判，或只改判一次。',
      next: '展開下一摺',
      showAll: '一鍵展開全卷',
      continue: '前往定讞選擇',
      completeAnnouncement: '斷案卷宗已全部展開。',
      partyUtility: (party, utility) => `${party}：自己所得 ${utility}/100`,
      shareBar: (party, utility) => `${party}：按其估值取得全數的 ${utility}%`,
      proportionalityResult: (passes) => passes ? '兄弟兩人都得其分。' : '至少有一人未得其分。',
      envyResult: (passes) => passes ? '兄弟互不嫉妒：符合 EF 無嫉妒。' : '至少一人嫉妒對方：未符合 EF 無嫉妒。',
      revisionHeading: '選擇定讞',
      revisionBody: '初判已固定在下方。你可以保留它，也可以在鎖定定讞前改判一次。',
      initialLabel: '初判',
      draftLabel: '改判草案',
      acceptInitial: '接受初判',
      reviseOnce: '改判一次',
      lockFinal: '鎖定定讞',
      finalHeading: '定讞',
      finalBody: '這份記錄已經凍結，結果現在會帶入考成簿。',
      awaitLedger: '接下來可開啟考成簿，或選做巧解挑戰。'
    },
  },
  masterChallenge: {
    eyebrow: '巧解挑戰',
    heading: '我分你選',
    body: '鄉下分家還有個老辦法，不用官府：一個人把家產分成兩堆，另一個人先挑。分的人怕對方把好的那堆挑走，只好把兩堆分得一樣重。大人試試看，替哥哥守業分成兩堆。',
    assignmentDefinition: '每項家產共十成。分堆與弟弟的選擇，會和挑戰是否完成分開顯示。',
    assignmentLabel: '分堆分配',
    bundleA: '甲堆',
    bundleB: '乙堆',
    bundleShare: (bundle, shares) => `${bundle}：${shares} 成`,
    assignmentControl: (good, first, second, firstShares, secondShares) => `${good}：${first} ${firstShares} 成；${second} ${secondShares} 成`,
    outcomeHeading: '分的人與選的人',
    dividerOutcome: (first, second) => `分的人看甲堆值 ${first} 分，乙堆值 ${second} 分。`,
    chooserOutcome: (bundle, utility) => `弟弟選了${bundle}，按他的估值是 ${utility} 分。`,
    choiceAccessible: (bundle, utility) => `文字結果：弟弟選${bundle}；弟弟所得 ${utility} 分。`,
    hintsHeading: '提示',
    hintStage: (stage) => stage === 0 ? '尚未使用提示。' : `已使用第 ${stage} 階提示。`,
    hintText: (stage) => stage === 1 ? '方向提示：先讓兩堆在分的人眼中大致平衡。' : stage === 2 ? '局部方法提示：把兄看重的水田、弟看重的現銀分到相反兩堆，山場居中。' : '近答案提示：70／70 frontier 讓兩項高估值家產分居兩堆，油茶山場各半。',
    hintButton: (stage) => `查看第 ${stage} 階提示`,
    completionHeading: '挑戰完成',
    completed: '這份分配達到得其分的條件，挑戰完成。',
    notCompleted: '這份分配尚未達到得其分的條件。',
    frontierReached: '已找到本案的巧解。',
    completionDialogue: '周先生：「這個辦法，保證沒有人吃虧，可是分的人只拿得到五成——他不知道弟弟要什麼，不敢冒險。要讓兩邊都拿七成，得有人把兩個人的心思都問清楚。大人，那個人就是您。」',
    frontierNotReached: '這份分法還有改進餘地。',
    sealAwarded: '已蓋巧字印。',
    sealUnavailable: '這次不蓋巧字印。',
    submit: '查驗分法',
    submitAgain: '查驗修改後的分法',
    returnToLedger: '返回考成簿',
    skip: '略過巧解挑戰',
    noGameOver: '巧解挑戰是選做的；你可以隨時回到考成簿。'
  },
  ledger: {
    eyebrow: '考成簿',
    heading: '第一幕記錄',
    initialVerdict: '初判',
    finalVerdict: '定讞',
    grade: '考語',
    revision: '是否改判',
    revisionUsed: '是',
    revisionNotUsed: '否',
    challengeStatus: '巧解挑戰',
    challengeCompleted: '已完成',
    challengeSkipped: '已略過',
    challengePending: '尚未完成',
    sealStatus: '巧字印',
    sealEarned: '已取得',
    sealNotEarned: '未取得',
    progress: (earned) => `巧字印進度：${earned}/3；闔上義烏案卷即可開啟第二幕。`,
    futureLocked: '義烏來信之後，第二幕的指標與記錄才會出現。',
    returnToChallenge: '返回巧解挑戰',
    openRecall: '開啟回憶檔案',
    continue: '闔上第一幕案卷',
  },
  recall: {
    heading: '回憶檔案',
    body: '只可重播已觀看或本幕已交付的過場；重播不會改動篇章記錄。',
    slotName: (slot) => `${slot} · 已交付 fallback`,
    locked: '後續過場已鎖定',
    replay: '重播',
  },
  transition: {
    heading: '五年後',
    body: '義烏來信收束第一幕。繼續前往杭州，展開下一案搜證。',
    continue: '開始第二幕 · 杭州',
  },
  shell: {
    loading: '展開篇章中…',
    campaignTitle: '定分止爭錄',
    campaignTitleEnglish: 'The Art of Settled Shares',
    firstVisitLead: '隨程衡走過萬曆年間三樁彼此相連的案子。',
    start: '開始篇章',
    continue: '繼續篇章',
    restart: '重新開始',
    openPause: '開啟暫停選單',
    languageSwitch: 'English',
    rebuiltTitle: '篇章已重新製作',
    rebuiltBody: '《定分止爭錄》已依第二版劇本重製。舊版進度不會帶入；確認後將從新序幕開始。',
    acknowledgeRebuild: '知道了，開啟新版',
    restartTitle: '確定重新開始？',
    restartBody: '目前保存在這部裝置上的篇章進度將由序幕取代。',
    cancelRestart: '保留進度',
    confirmRestart: '重新開始篇章',
    recoveryCorrupt: '先前的篇章記錄無法讀取，已備妥一份新的案卷。您可以重新開始。',
    recoveryInvalid: '先前的篇章記錄不完整，已備妥一份新的案卷。您可以重新開始。',
    recoveryVersion: '這份篇章記錄來自未支援的版本，已備妥一份新的案卷。',
    recoveryLegacy: '舊版進度不會帶入新版篇章。',
    storageUnavailable: '此瀏覽器目前無法保存篇章；仍可繼續遊玩，但重新載入後進度可能遺失。',
    titleEyebrow: '萬曆年間 · 程衡案卷',
    titleLead: '我這一輩子沒做過別的事，就是替人把名分定下來。',
    begin: '翻開第一案',
    introEyebrow: '六年前',
    introTitle: '第一幕：萬曆三年春 · 義烏陳氏兄弟析產案',
    introBody: '金華府推官程衡接到一樁上控：知縣把每樣家產各判一半，陳家兄弟卻都不服。',
    continueIntro: '開始查案',
    boundaryTitle: '第一幕搜證與分配',
    boundaryBody: '此階段將於下一個製作階段開放。您的序幕、設定與目前進度都已保留。',
    unavailablePhaseTitle: '篇章仍在續修',
    unavailablePhaseBody: '這段進度屬於尚未接入的製作階段；記錄仍會保留。',
  },
  stage: {
    stage: '《定分止爭錄》遊戲舞台',
    skipToContent: '跳至篇章內容',
    enterFullscreen: '全螢幕遊玩',
    fullscreenActive: '已進入全螢幕',
    fullscreenEntered: '已進入全螢幕。',
    fullscreenUnsupported: '此瀏覽器不提供全螢幕；仍可繼續遊玩。',
    fullscreenFailed: '未能進入全螢幕；仍可繼續遊玩。',
    orientationLockUnsupported: '無法鎖定橫向；仍可繼續遊玩。',
    orientationLockFailed: '未能鎖定橫向；仍可繼續遊玩。',
    rotateTitle: '請將手機轉為橫向',
    rotateDescription: '把手機橫放後，即可繼續目前篇章。進度不會遺失。',
  },
  pauseMenu: {
    title: '篇章暫停',
    continue: '繼續',
    currentTask: '目前任務',
    controls: '操作與設定',
    controlsHelp: '使用 Tab 移動焦點，按 Enter 或空白鍵選擇。過場可隨時略過。',
    subtitles: '字幕',
    volume: '音量',
    textSize: '文字大小',
    textSizeSmall: '小',
    textSizeMedium: '中',
    textSizeLarge: '大',
    replayCurrentCutscene: '重播目前過場',
    recallArchive: '回憶檔案',
    restart: '重新開始',
    returnToMenu: '返回主選單',
    restartConfirmationTitle: '確定重新開始？',
    restartConfirmationBody: '目前篇章進度將由序幕取代。',
    cancelRestart: '繼續目前篇章',
    confirmRestart: '重新開始篇章',
    tasks: {
      watchCutscene: '觀看或略過序幕。',
      openCase: '翻開第一案。',
      hearIntroduction: '閱讀義烏陳氏兄弟析產案的案情。',
      phaseBoundary: '等待第一幕搜證與分配開放。',
      investigation: '找齊四項必要線索，才能進入分配案台。',
      allocation: '調整每項家產的成數，然後鎖定初判。',
      intuitionRating: '在正式指標揭曉前，記下 1 至 5 分的直覺評價。',
      debrief: '一摺一摺讀完斷案卷宗。',
      revisionDecision: '選擇接受初判，或只改判一次。',
      revision: '比較固定的初判與唯一一次改判草案。',
      finalVerdict: '查看已凍結的定讞。',
      solveMasterChallenge: '分成兩堆，查看弟弟的選擇，也可以完成巧解挑戰。',
      reviewLedger: '查看第一幕考成簿，選擇下一個交界。',
      beginActTwo: '闔上義烏來信，即可開啟第二幕搜證。'
    },
  },
};
