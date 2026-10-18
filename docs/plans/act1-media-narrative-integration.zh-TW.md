# 第一幕媒體、劇情與介面整合實作計畫

> 日期：2026-10-18  
> 狀態：可開始執行  
> 範圍：把已交付的第一幕 Scene Plate、Portrait Cards、CS-01～CS-03 animatic 接入現有第二版 Campaign；不改公平規則、估值矩陣、Grade 或 Master Seal 條件。

## 1. 權威來源與不可變條件

依下列優先順序解讀；低順位文件與高順位衝突時，以高順位為準：

1. 劇情、台詞、矩陣與觸發：`docs/story/master-script.zh-TW.md`
2. 名詞：`GLOSSARY.md`
3. 架構決策：ADR-0005、0006、0007
4. 第一幕鏡頭順序：`docs/art/storyboards/cs-act1.zh-TW.md`
5. 共用運鏡：`docs/art/storyboards/cs-01-14.zh-TW.md`
6. 立繪版式與台詞對照：`docs/art/portraits.zh-TW.md`
7. 介面樣式：`docs/art/style-guide.zh-TW.md` 第 6 節
8. 素材交接：`docs/plans/act1-asset-handoff.zh-TW.md`

硬性規則：

- 寫實靜圖＋2D DOM 介面；不接回 Three.js、`SceneCanvas` 或舊 poster。
- 圖內文字不可作為可讀內容；公文、信、地點與字幕一律由介面疊加。
- 所有玩家可見文字同時維護 `zh-TW` 與 `en`。
- 初判前不得把 utility、得其分、EF 或 Grade 放進可見 DOM、ARIA 或 live region。
- 立繪不可鏡像；CSS 禁用 `scaleX(-1)`。
- 本輪只改呈現與第一幕過場順序，不改 60/20/20、20/20/60、70/70、Cut-and-Choose 50/70 等 canonical facts。

## 2. 現況與已確認落差

### 已有且可用

- `plate-act1.jpg`、`plate-act2.jpg`、`plate-act3.jpg`
- CS-01～CS-03 共 5 張 animatic still
- 第一幕所需 15 張立繪
- 全部新圖實際為 2752×1536、16:9 JPEG
- 現有 domain、Campaign reducer、Rate-Before-Reveal、Revision、Ledger 與 Master Challenge 測試基線正常

### 程式尚未做到

1. `media-manifest.ts` 的 CS-01～03 仍是紙色 `static` fallback。
2. manifest 雖有 `kind: 'animatic'`，播放器遇到非 video 仍直接走 fallback，實際沒有 animatic controller。
3. frame 型別沒有運鏡、焦點、疊字、字幕與對話／紙頁段落。
4. `ScenePlate` 與 `PortraitCard` 沒有接入新素材路徑；立繪仍顯示文字 fallback。
5. `PortraitCard` 只有一種橫列版式，尚未支援單人、兩人與小卡。
6. 搜證同時有「點人物」及「點線索列表」兩套發現入口，沒有做到「點誰，誰以單人立繪說話；內容自動記入手冊」。
7. 即時反應只顯示一張 fallback 卡；無法同時讓兄弟各自切換表情。
8. CS-02 目前綁在 `ENTER_CHALLENGE`：略過巧解就看不到；從 Ledger 補做巧解反而會重播。劇本要求它在定讞後、巧解前只播一次。
9. 玩家可見文案仍有「fallback」「provisional」「按下 CS-04」等開發語言，正式路徑不應出現。
10. `docs/art/narrative-asset-inventory.zh-TW.md` 仍把已交付素材標成 missing／blocked，已落後於本次交接。

## 3. 第一幕應有的故事順序

```text
CS-00 序幕
→ 題名
→ CS-01 S1（3 秒推近；Demo 實機回饋後加快）
→ CS-01 S2（2.5 秒定格＋「義烏縣　上控」）
→ 周先生單人對話
→ 第一幕題名／案件介紹
→ 搜證（4 項必要線索）
→ 初判與門檻反應
→ 直覺評價
→ 斷案卷宗逐項揭曉
→ 可選單次改判
→ 定讞
→ 選擇進入或略過「我分你選」
→ CS-02 S1（8 秒右移）
→ 進入 challenge，或直接到第一幕考成簿
→ CS-03 S1（7 秒推近＋信件字幕）
→ CS-03 S2（6 秒左移＋「五年後 · 萬曆八年冬」）
→ 考成簿紙頁：「五年無一上控」與「調繁」
→ 第二幕轉場
```

CS-02 是定讞結果的敘事收束，不是可反覆觸發的 Master Challenge 教學。因此：

- 首輪選擇進入巧解：CS-02 完成後進入 challenge。
- 首輪選擇略過巧解：仍播放 CS-02，完成後進入 Ledger。
- 從 Ledger 回頭補做巧解時不重播 CS-02。
- CS-03 只在玩家離開第一幕 Ledger、前往第二幕時播放。

## 4. 媒體資料模型

### 4.1 外部 seam 不變

頁面仍只需要知道：

```tsx
<CutscenePlayer
  slot="cs-01"
  locale={locale}
  settings={settings}
  suspended={pausedOrRotated}
  onSettingsChange={updateSettings}
  onComplete={advance}
/>
```

`AdventureShell` 不應知道 CS-01 有幾張圖、何時換圖、哪句用哪張立繪，亦不應自己計時。

### 4.2 manifest 採有序 segment

為同時涵蓋 ADR-0007 的 animatic、對話場及未來 CS-07／CS-13 混合過場，將播放內容建模為 sequence：

```ts
type CutsceneSegment =
  | StillSegment
  | VideoSegment
  | DialogueSegment
  | DocumentSegment;

type CutsceneSequenceMedia = {
  readonly kind: 'sequence';
  readonly segments: readonly CutsceneSegment[];
  readonly fallback: StaticCutsceneFallback;
};
```

不另外增加 Campaign phase；segment index 是播放器的暫時 UI 狀態，不寫進 campaign save。重新整理後從該 Cutscene 開頭播放，Campaign 進度仍只在整段完成後前進。

### 4.3 still 與運鏡

```ts
type NormalizedPoint = {
  readonly x: number; // 0..1
  readonly y: number; // 0..1
};

type StillMotion =
  | { readonly kind: 'push-in'; readonly fromScale: 1; readonly toScale: 1.06; readonly focus: NormalizedPoint }
  | { readonly kind: 'pull-out'; readonly fromScale: 1.06; readonly toScale: 1; readonly focus: NormalizedPoint }
  | { readonly kind: 'pan-left'; readonly distance: 0.04 }
  | { readonly kind: 'pan-right'; readonly distance: 0.04 }
  | { readonly kind: 'hold' };

type StillSegment = {
  readonly kind: 'still';
  readonly imageSrc: string;
  readonly durationSeconds: number;
  readonly motion: StillMotion;
  readonly overlays?: readonly TimedTextOverlay[];
  readonly altKey: CutsceneAltKey;
};
```

限制由 parser／tests 固定：

- `durationSeconds > 0`
- scale 不超過 1.06
- pan distance 不超過 0.04
- push/pull 必須提供 0..1 焦點
- 不允許負 scale，從資料層排除鏡像

### 4.4 疊字、字幕與文件紙頁

```ts
type TimedTextOverlay = {
  readonly kind: 'caption' | 'location' | 'title';
  readonly textKey: CutsceneTextKey;
  readonly startSeconds: number;
  readonly endSeconds: number;
};

type DocumentSegment = {
  readonly kind: 'document';
  readonly titleKey: CutsceneTextKey;
  readonly bodyKeys: readonly CutsceneTextKey[];
  readonly continueLabelKey: CutsceneTextKey;
};
```

`DocumentSegment` 不自動消失；CS-03 storyboard 沒有替考成簿文字指定秒數，因此由玩家讀完後按「繼續」。內容只取 master script 已指定文字：

- 「所斷戶婚田土，五年無一上控。」
- 白話解釋
- 朱批「調繁」
- 「調他去事情更多、更難辦的大府」的既有解釋

不得另寫新的升官旁白。

### 4.5 對話段落

```ts
type DialogueLineDefinition = {
  readonly speakerId: CharacterId;
  readonly expression: PortraitExpression;
  readonly textKey: DialogueTextKey;
  readonly layout: 'solo' | 'duo';
  readonly side?: 'left' | 'right';
};

type DialogueSegment = {
  readonly kind: 'dialogue';
  readonly lines: readonly DialogueLineDefinition[];
};
```

CS-01 只使用 canonical 的周先生完整台詞，`zhou-calm`、單人置中。一般對話預設手動前進；若 `settings.dialogueAutoPlay` 開啟，依既有 `slow | standard | fast` 設定及字數計算時間。文字整句出現，不做打字機效果。

### 4.6 清除重複來源

`CutsceneManifestEntry.nextPhase` 目前無 caller，真正的返回點已存在 `CampaignState.cutscene.returnTo`。本輪移除 manifest 的 `nextPhase`，避免媒體表與 reducer 各維護一份互相矛盾的流程。

## 5. 媒體 manifest 內容

### CS-01

```text
still /cs-01-s1.jpg / 3s / push-in / focus 程衡與戥子之間
still /cs-01-s2.jpg / 2.5s / hold / location「義烏縣　上控」
dialogue / master-zhou / calm / solo / canonical CS-01 台詞
```

### CS-02

```text
still /cs-02-s1.jpg / 8s / pan-right
```

不新增「五年無人再上控」旁白；該資訊留到 CS-03 的考成簿紙頁，避免提前重複或把玩家任意判決寫成固定的完美結果。

### CS-03

```text
still /cs-03-s1.jpg / 7s / push-in / 陳從征寫信原文字幕
still /cs-03-s2.jpg / 6s / pan-left / title「五年後 · 萬曆八年冬」
document / 考成簿原句、白話、「調繁」及既有解釋
```

### fallback

- 圖片載入失敗：保留相同故事文字、文件內容與「繼續」。
- reduced motion：still 不做 transform 或 crossfade；以硬切或手動前進保留每一個故事 beat。
- 任一錯誤都不得直接略過 canonical 台詞。

## 6. Portrait 與 Scene Plate 模組

### 6.1 素材 registry

在 `src/narrative/media-manifest.ts` 或相鄰的純資料模組集中維護：

```ts
type PortraitAsset = {
  readonly characterId: CharacterId;
  readonly expression: PortraitExpression;
  readonly src: string;
  readonly width: 2752;
  readonly height: 1536;
  readonly objectPosition: string; // 本批先用 center top
};

type ScenePlateAsset = {
  readonly act: 1 | 2 | 3;
  readonly src: string;
  readonly width: 2752;
  readonly height: 1536;
};
```

元件不自行拼接檔名；使用 `getPortraitAsset(characterId, expression)` 與 `getScenePlateAsset(act)`。找不到素材時回傳明確 fallback view model，不 throw。

### 6.2 `PortraitCard` interface

```ts
type PortraitPresentation =
  | 'dialogue-solo'
  | 'dialogue-duo'
  | 'thumbnail'
  | 'workbench';

type PortraitEmphasis = 'speaker' | 'listener' | 'neutral';

type PortraitCardProps = {
  readonly portrait: PortraitViewModel;
  readonly presentation: PortraitPresentation;
  readonly emphasis?: PortraitEmphasis;
  readonly side?: 'left' | 'right';
  readonly selected?: boolean;
  readonly onActivate?: () => void;
};
```

不再讓每個 caller 各自傳 `imageSrc`、裁切和 fallback 規則。`PortraitViewModel` 包含 localized 姓名／身分、asset 或 fallback、expression 與可存取名稱。

版式：

- `dialogue-solo`：置中放大，面向玩家。
- `dialogue-duo`：左右分列；程衡固定右側，speaker 正常亮度，listener 略暗；不鏡像。
- `thumbnail`：頭到胸的小卡，用於搜證底列。
- `workbench`：案台卡，允許表情交叉淡化；reduced motion 直接換圖。

圖片旁已有姓名與身分時，`img alt=""`，避免輔助技術重複朗讀；fallback 仍保留可見姓名牌。

### 6.3 `NarrativeDialogue` interface

```tsx
<NarrativeDialogue
  lines={localizedLines}
  autoPlay={settings.dialogueAutoPlay}
  speed={settings.dialogueSpeed}
  onComplete={advanceSegment}
/>
```

模組內處理目前行、PortraitCard 版式、speaker/listener 明暗、下一句、auto timer、暫停與 focus。Cutscene、搜證與未來 CS-04／CS-08 共用，不複製另一套對話框。

### 6.4 `ScenePlate` interface

保留現有 DOM hotspot 能力，但由 caller 傳 registry 解析後的 `asset`，不再遺漏 `imageSrc`：

```tsx
<ScenePlate
  asset={actOnePlate}
  name={copy.scene.name}
  description={copy.scene.description}
  hotspots={hotspots}
>
  {portraitRailAndDossier}
</ScenePlate>
```

第一幕使用 `/adventure/plates/plate-act1.jpg`。舊 `/adventure/plates/court.jpg` 及 `public/game/posters/*.webp` 不得出現在 runtime 或測試。

## 7. 各遊玩畫面的接法

### 7.1 搜證

建立 `ActOneInvestigation`，把目前散在 `AdventureShell`、`ScenePlate`、`InvestigationDossier` 的組裝集中起來：

- 背景：`plate-act1`
- 底部小卡：陳守業、陳從征、陳老太公，皆用 `calm`
- 場景 hotspot：義烏縣原判
- 點人物：開啟單人對話立繪並播放完整 canonical 陳述；讀完後才 dispatch `DISCOVER_CLUE`
- 點原判：使用 `cheng-heng-calm` 顯示「稱得很準。可惜稱的是東西，不是人。」
- 定分手冊：只負責顯示已記入的估值／線索，不再提供第二套「點列表直接發現」捷徑
- 四項線索仍全部 required；未完成不可鎖定初判

這可避免玩家沒聽人物說話，只點列表便把搜證完成。

### 7.2 初判與 Revision

案台常駐兩張 `workbench` Portrait Card，表情由純 selector 決定：

```ts
type ActOneReactionViewModel = {
  readonly portraits: Readonly<Record<'chen-shouye' | 'chen-congzheng', 'calm' | 'pleased' | 'aggrieved'>>;
  readonly announcementKey: ReactionTextKey | null;
};
```

規則：

- 水田過半給弟弟：陳守業 `aggrieved`
- 現銀過半給哥哥：陳從征 `aggrieved`
- 水田全歸兄、現銀全歸弟：兩人 `pleased`
- 其餘：`calm`
- 同時跨過兩個不利門檻時，兩人的卡可同時 `aggrieved`；不可用 `else if` 吃掉其中一方

視覺表情立即更新；live-region 短句只在 reaction key 改變時宣告一次，並延續既有冷卻政策。初判不顯示任何正式 metric。

### 7.3 斷案卷宗

- 周先生教學區加入單人立繪。
- 同一段 reveal 內的提示行依序使用 `zhou-hint1`、`zhou-hint2`、`zhou-hint1`……；每次重新進入一段對話由 hint1 開始。
- 只有 canonical 巧解結論「田還是那些田……」使用 `zhou-pleased`。
- Portrait 只承載人物與台詞，不在元件內重算 utility／比例公平／EF。

### 7.4 我分你選

- 首輪無論選擇進入或略過 challenge，都先播放一次 CS-02；從 Ledger 補做時不再觸發。
- 周先生教學與三階提示使用 `NarrativeDialogue`；hint1／hint2 依段落重新輪替。
- challenge 完成、frontier 與 seal eligibility 規則完全沿用現有 domain module。

## 8. State machine 修正

第一幕定讞建立 `ActOneRecord` 後保留選擇畫面，兩條首輪路徑為：

```text
進入巧解 → cutscene(cs-02, returnTo=challenge) → challenge
略過巧解 → cutscene(cs-02, returnTo=ledger) → ledger
```

從 Ledger 補做第一幕 challenge 時直接進 `challenge`，不再觸發 CS-02。Act II／III 暫時維持現有媒體行為，避免本輪順手改動未審核流程。

必加 reducer／persistence tests：

1. 接受初判與使用 Revision 兩條路都能抵達同一 Final Verdict 選擇畫面。
2. 首輪進入 challenge 只播放一次 CS-02，並沿用既有 `returnTo=challenge` 存檔。
3. 首輪略過 challenge 仍播放一次 CS-02，完成後進 Ledger。
4. Ledger 補做 challenge 直接進入，不重播 CS-02。
5. persistence allowlist 同時接受 `cs-02 → challenge` 與 `cs-02 → ledger`，舊的 in-flight v2 save 不失效。
6. CS-03 完成後才把 active act 切到 2。

不新增 save schema 欄位或提高版本；現有 `cutscene.slotId + returnTo` 足以表示兩條返回路徑。

## 9. 文案修正

### 必須改成 canonical

- CS-01 周先生使用 master script 完整台詞，不使用目前縮寫版。
- CS-03 信件使用 master script 原句。
- CS-03 紙頁完整呈現「五年無一上控」與「調繁」。
- `en` 使用相同資訊，不逐字硬譯成現代 SaaS 語氣。

### 必須移除的玩家可見開發語言

- 「paper fallback」「provisional」
- 「按下 CS-04」或其他 slot 操作說明
- 「場景底圖尚未備妥」——第一幕素材已存在
- 把 `CS-01` 等內部 ID 當成故事標題

slot ID 可保留在程式、測試與開發診斷，不出現在正常故事文案。

## 10. Test-first 工作包

### WP-1：manifest contract

先寫失敗測試，再改型別與資料：

- CS-01 segment 順序、3/2.5 秒、push-in/hold、疊字、周先生對話
- CS-02 8 秒 pan-right
- CS-03 7/6 秒、push-in/pan-left、信件字幕、時間疊字與 document
- 所有 image path 存在
- scale/pan/focus invariant
- `zh-TW`／`en` keys 完全一致

### WP-2：SequenceCutscenePlayer

測試：

- fake timers 下依序換 segment
- pause/resume 不遺失剩餘時間
- skip/onComplete idempotent
- dialogue 手動與 auto-play
- document 等待玩家繼續
- reduced motion 無 transform/crossfade，但故事內容完整
- 圖片錯誤可讀 fallback
- suspended 時停止 timer，恢復後繼續
- archive replay 不 dispatch Campaign advance

### WP-3：Portrait／Scene 模組

測試：

- 四種 presentation class 與 duo speaker/listener emphasis
- 程衡固定右側的 caller contract
- 無 `transform: scaleX(-1)`
- JPEG 裁切使用 `object-fit: cover; object-position: center top`
- 圖片失敗顯示姓名牌
- `plate-act1` 路徑及 hotspot 鍵盤操作

### WP-4：Act I 整合

測試：

- 點三名人物顯示正確 calm 立繪與 canonical 對話
- 點原判顯示程衡 calm
- 對話完成才記入 clue
- dossier 不能繞過對話直接解鎖
- 即時反應可以同時顯示兩人不平
- frontier 顯示兩人 pleased
- debrief／challenge 的 hint1、hint2 每段重置並輪替
- 初判 DOM／ARIA 仍無正式 metric

### WP-5：流程、E2E 與文件同步

- 修正 CS-02 reducer 順序
- 更新 asset inventory 的已存在路徑、尺寸與狀態；保留「未去背」為已知 provisional 差異
- 修正 `tests/adventure-stage.test.tsx` 的舊 plate 路徑
- 更新第一幕 Playwright journey

## 11. 防止「看起來很怪」的驗收清單

### 劇情一致性

- [ ] CS-01～03 的事件、台詞及順序逐項對照 master script，沒有新增角色動機或新史實。
- [ ] 任意合法 Initial／Final Verdict 都可繼續；CS-02 不把玩家判決硬說成 70/70。
- [ ] CS-03 才揭示「五年無一上控」與「調繁」。
- [ ] Master Challenge 可略過、補做，且不阻塞主線。
- [ ] 沒有把周先生寫成「師爺」，沒有使用 glossary 的 Avoid 名詞。

### 視覺與素材

- [ ] Scene Plate、animatic、Portrait 都沒有被拉伸。
- [ ] 16:9 灰底立繪裁切後，帽子、臉、胸口及姓名牌不互相遮擋。
- [ ] 沒有左右翻轉，右衽方向保持正確。
- [ ] CS-01 推近焦點落在程衡與戥子，不把周先生裁出畫面。
- [ ] CS-02 右移後仍看得到左側陳守業與右上煙。
- [ ] CS-03 S1 不讓字幕遮住手、筆與信；S2 不讓時間字遮住信使。
- [ ] 圖片內若有生成的模糊文字，不被當作可讀內容；正式文字皆由 UI 疊加。
- [ ] 朱紅只用於不平、警示與印章；不拿來裝飾普通按鈕。

### 版面與可存取性

- [ ] 1440×900、1280×720、844×390 橫向皆無關鍵裁切。
- [ ] 200% text zoom 時字幕、對話框與控制不互蓋。
- [ ] 鍵盤可完成 CS-01、搜證、分配、揭曉、challenge 與 CS-03。
- [ ] reduced motion、圖片錯誤、全螢幕拒絕與旋轉 gate 都不阻斷進度。
- [ ] 圖像不是唯一資訊來源；表情變化另有短句／狀態文字。
- [ ] 手機直向只顯示旋轉提示，不在背後偷偷推進 timer。

### 靜態掃描

完成時執行：

```bash
rg -n "public/game/posters|SceneCanvas|SceneViewport|scaleX\(-1\)|/adventure/plates/court\.jpg" \
  src/components/adventure src/narrative tests

rg -n "fallback|provisional|按下 CS-|Press CS-" src/i18n/adventure
```

命中若是 runtime 文案或第一幕路徑，必須修正；測試名稱、錯誤處理技術詞可逐條說明。

## 12. 完成驗證

迭代時先跑：

```bash
npm test -- tests/adventure-cutscene.test.tsx \
  tests/adventure-investigation.test.tsx \
  tests/adventure-allocation.test.tsx \
  tests/adventure-verdict-flow.test.tsx \
  tests/narrative-game.test.ts
```

完成前必跑：

```bash
npm test
npm run test:e2e -- tests/e2e/adventure.spec.ts
npm run build
```

另以真實瀏覽器逐張驗收 CS-01～03、三種 Portrait 版式、三個 viewport、兩個 locale、normal/reduced-motion、正常素材／錯誤 fallback。截圖對照本文件第 11 節後，才可宣告完成。

## 13. 本輪非目標

- 不重算或修改第一幕公平規則。
- 不生成、去背或重畫素材；本批 JPEG 先以 CSS 裁切接入。
- 不開始第二幕 Portrait／animatic 製作。
- 不處理 CS-07／CS-13 的實際素材，但 sequence contract 必須能容納未來 still＋video。
- 不移除 `three` package；只確保 Campaign 不重新引用舊路徑。
