# 《定分止爭錄》網頁遊戲實作計畫

> 日期：2026-10-13  
> 狀態：產品決策已確認，待執行  
> 範圍：以第二版劇本重建 `/{locale}/adventure`；保留既有公平分配學習站與 API。

## 1. 本計畫依據

本計畫已完整閱讀並交叉比對：

- `劇本總攬.md`
- `cutscene0.md`
- `Cutscene 0 Demo.mp4`
- `docs/story/master-script.zh-TW.md`
- `docs/art/storyboards/cs-00.zh-TW.md`
- `docs/art/style-guide.zh-TW.md`
- `docs/art/characters.zh-TW.md`
- `docs/specs/2026-10-04-narrative-fair-division-adventure.md`
- `GLOSSARY.md` 與 ADR-0004、0005、0006

### 文件優先順序

1. 劇情、對白、矩陣、門檻與結局：`docs/story/master-script.zh-TW.md`
2. 軟體行為：`docs/specs/2026-10-04-narrative-fair-division-adventure.md`
3. 視覺、角色、過場：`docs/art/`
4. 名詞：`GLOSSARY.md`
5. 根目錄的 `劇本總攬.md`、`cutscene0.md`：視為使用者提供的最新作者稿，用於校對正式文件；不讓兩套內容各自演化。

根目錄版本與 `docs/` 正式版本的大量差異來自 Markdown 格式、表格及算式標記；正式版本保留了實作需要的完整數學式。開發時不直接從 Markdown 解析遊戲資料，而是把確認過的內容轉成型別化資料並由測試鎖定。

## 已確認的產品決策（2026-10-13）

以下決策經產品討論確認，實作時不得默默改回預設值：

### 首次交付與審核

- 第一個可驗收版本是高品質垂直切片：從 CS-00 開始，完整玩完第一幕、巧解、Performance Ledger，並進入第二幕轉場。
- 每個 Phase 都提供可操作版本、測試結果與變更摘要，並由獨立 AI reviewer 驗收；reviewer 無 blocker 且必要測試通過後可自動進下一階段，不再等待使用者逐輪驗收。只有未核准的產品、劇本、美術或架構決策才回報使用者。
- 劇情事件、數值或流程如需修改，先按 Phase 提交 proposed diff；經確認後才寫入遊戲。
- 第一幕繁中垂直切片穩定後立刻完成英文版，再開始第二幕。

### 平台與畫面

- 正式版型以桌面、平板及手機橫向為準；遊戲舞台直接填滿橫向 viewport。
- 背景影像可裁切填滿，人物、字幕及操作固定在 16:9 安全區，不拉伸內容。
- 手機直向顯示可存取的旋轉提示，不載入正式操作畫面。
- 提供獨立「全螢幕遊玩」按鈕；不強迫全螢幕，也不讓方向鎖定 API 失敗阻斷遊戲。

### 調查、分配與揭曉

- 第一幕必須完成所有必要搜證；第二、三幕只強制主要劇情事件，允許部分估值維持未知便作出初判。
- 漏查不直接扣 Grade；後果只由實際分配結果與劇情反映。揭曉時標出玩家未查到的真實估值。
- 進入分配後、鎖定初判前仍可返回搜證；揭曉後不回調查，Revision 直接使用完整揭曉結果。
- 十分制 goods 使用可拖曳分界線，另提供精確的加減按鈕與完整鍵盤操作。
- 第一次只手把手引導選物、調整與鎖定，其餘操作交還玩家。
- 人物只在跨過重要門檻時作短反應，設冷卻且不洩漏正式指標。
- 初次遊玩由玩家逐步揭曉工具；已看過的內容可一鍵略過。主畫面先說人物結果與簡短結論，完整公式放在可展開卷宗。
- Revision 從 Initial Verdict 的副本繼續修改，並列前後結果；只能再次定讞一次。

### 巧解、後果與重玩

- Master Challenge 可跳過，並可從 Ledger 或暫停選單回頭補做，不阻塞主線。
- 方向與局部方法提示不影響資格；查看第三階段近似答案後不能取得巧字印。
- 任何符合挑戰目標性質的解都算完成；只有達到最佳 frontier 才授予巧字印，預設示範答案不是唯一合法答案。
- Cut-and-Choose 若選擇者對兩包估值相同，固定選擇左側／甲包，確保結果可重現。
- 所有合法裁決都能繼續，沒有答錯 Game Over；結果由 Grade、人物命運與結局承擔。
- 使用一個自動存檔與通關後章節回想。重玩預設不改歷史；玩家明確選擇覆寫時，只更新該幕並重算 Ledger／結局。
- 未解鎖的章節與結局只顯示剪影或「？？？」；Cutscene 可在當下重播，觀看後也進入不改變進度的回想。

### 媒體、美術與聲音

- `Cutscene 0 Demo.mp4` 是 CS-00 正式母片；Web 版只做必要轉碼，不重新剪輯或調色。
- 可在 CS-00 上疊加網站字幕、地點、人名、播放及略過控制。影片永遠可立即略過，字幕預設開啟。
- 玩家按「入殿」後有聲播放並記住音量。CS-00 之外先使用低調環境音、字幕與少量關鍵音效，不使用暫時 AI 配音。
- CS-01～CS-03 先以寫實靜圖、字幕和有限鏡頭運動組成 animatic。
- 暫用 Scene Plate、Portrait 與 animatic 圖像依美術規範製作；先審一張場景及每位主要角色的標準 Portrait，再批次產出。
- 生成角色必須原創且歷史可信，不模仿可辨識的演員或現代名人。
- CS-00 使用正式影片、其餘使用經確認的 provisional 素材，即可驗收第一幕垂直切片。

### 操作、存檔與品質

- 一般對話預設手動，可選自動播放；文字整句出現，不使用打字機效果。自動速度依字數計算並提供慢／標準／快三檔。
- 暫停選單提供繼續、目前任務、操作說明、音量、字幕、回想、重新開始與返回主選單；不提前顯示未解鎖公式。
- 再次進入時顯示「繼續／重新開始」，重新開始需二次確認。每個有效操作自動儲存。
- Campaign 第一版完全存在本機，不上傳進度、選擇、Grade 或分析資料。
- 舊 v1 存檔不遷移；只顯示一次篇章重製說明後建立 v2 存檔。
- 目標瀏覽器為最新兩個主要版本的 Chrome、Edge、Firefox 與 Safari。
- 媒體失敗時提供重試與「使用靜態版本繼續」；玩家訊息採卷宗語氣，技術細節只留在開發紀錄。
- 垂直切片除自動測試外，需在桌面 Chrome／Firefox／Safari，以及至少一台 iPhone 和一台 Android 橫向實機驗收。

## 2. 對遊戲的理解

這不是三個獨立的公平分配小遊戲，而是程衡七年間的一條因果鏈：

1. **序幕／第三幕倒敘**：一名七品官跪在文華殿，面對皇帝與三個權力中心，說出「臣只會分東西」。
2. **第一幕，義烏**：用可分割家產教玩家「均分」不等於真正的公平；解鎖分秤。
3. **第二幕，杭州**：加入切不開的機房，教嫉妒、找補與和氣值；解鎖妒線。
4. **第三幕，文華殿**：六道敕書全都切不開，沒有完全無嫉妒的答案；玩家以 EF1／EFX 找到「無人掀桌」的方案。
5. **終幕**：第三幕定稿決定國運，前兩幕考語決定故人短景，三枚巧字印追加隱藏結局。

遊戲的核心不是把公式做成儀表板，而是讓玩家依序經歷：

```text
先聽人說話
→ 憑直覺分配
→ 先承諾「我覺得公平」
→ 再看算學揭曉
→ 只改判一次
→ 承擔歷史後果
```

因此任何 UI 都必須遵守兩條硬規則：

- 初判前不能洩漏正式公平指標。
- 數學回饋必須由人物反應與劇情後果承載，而不是只顯示成功／失敗。

## 3. 現況與主要差距

目前 `src/narrative/`、`src/components/adventure/` 和相關測試仍是第一版原型：

| 現況 | 第二版要求 |
| --- | --- |
| 宋代商行、舊杭州遺產、五件權力印信 | 萬曆朝單一時間線；義烏、杭州、文華殿；第三幕六道敕書 |
| Three.js 場景與 Scene Runtime | 寫實 Scene Plate、Portrait Card 與 DOM 2D 介面 |
| 第一、二幕皆以不可分割物為主 | 第一幕全可分；第二幕三可分加一不可分；第三幕全不可分 |
| 第三幕有白銀滑桿 | 第三幕沒有任何可找補物 |
| 揭曉後直接挑戰／前進 | 揭曉後只能改判一次，再定讞、評等、選做巧解 |
| 舊的四種人格式結局 | 五種國運結局、輕重分支、故人短景、考成總評、隱藏結局 |
| `localStorage` 只做鬆散 shape check | 版本化且完整驗證的 campaign save |
| 沒有 Cutscene 播放模組 | CS-00～CS-14 插槽、字幕、跳過、靜圖 fallback、reduced motion |

這次應重建 campaign，而不是在舊 state machine 上逐條補丁。

## 4. 目標體驗與畫面語言

### 4.1 遊戲舞台

- 以 16:9 安全區構成橫向舞台；背景滿版裁切，桌面、平板與手機橫向皆直接填滿 viewport。
- 影像是「窗」：過場、Scene Plate、Portrait Card 都是寫實素材。
- 介面是「帳冊」：宣紙、墨、官青與單一功能性的朱紅。
- 不做紅金宮廷裝飾框、不做 SaaS 卡片牆、不做持續飄動的粒子。
- 朱紅只表示不平、妒線、警示與硃批；成功使用秧綠，巧解印章使用舊金。

### 4.2 每個主要畫面

```text
過場
┌──────────────────────────────────────┐
│              寫實影片                │
│                                      │
│         軟體疊加字幕／旁白            │
│ [略過]                        [音量] │
└──────────────────────────────────────┘

搜證
┌──────────────────────────────────────┐
│  Scene Plate                         │
│                         定分手冊      │
│                                      │
│  [人物卡] [人物卡] [人物卡]           │
│  紙色固定對話區／周先生提示            │
└──────────────────────────────────────┘

分配
┌──────────────────────────────────────┐
│ [人物＋案台] [人物＋案台] [人物＋案台] │
│                                      │
│ 十格分配桿／可拖曳物品牌              │
│                      [鎖定初判]       │
└──────────────────────────────────────┘

揭曉／改判
┌──────────────────────────────────────┐
│       案台縮到上方，妒線疊於其間       │
│          斷案卷宗由中央展開            │
│     分秤／妒線／去一物依幕解鎖         │
└──────────────────────────────────────┘
```

### 4.3 動畫原則

全站只把動態預算花在具有敘事意義的地方：

1. **Cutscene 播放與硬切**：影片本身承擔電影感。
2. **題名墨暈**：CS-00 戥子定格後，以遮罩／墨色擴散揭出《定分止爭錄》。
3. **卷宗展開**：逐項揭露指標，讓玩家看見直覺被驗算，而不是一次丟出整頁數據。
4. **妒線生成／斷裂**：朱紅線由人物卡之間畫出；去一物時線條立即重算並斷開。
5. **硃批與蓋印**：Final Verdict、Grade、Master Seal 都用一次明確的落印動作。
6. **人物反應**：Portrait Card 做短促的表情交叉淡化與微小位移，不讓角色卡持續漂浮。

技術上以 CSS transitions／Web Animations 做局部狀態回饋；需要時間軸協調的題名、卷宗、落印使用既有 GSAP。Campaign 不使用 Lenis，也不再以 Three.js 製造場景運動。

`prefers-reduced-motion` 下：

- Cutscene 改用 poster／替代靜圖與相同字幕。
- 墨暈、卷宗、妒線、落印直接切到終態。
- 所有流程、資訊與結局保持完全可用。

## 5. Cutscene 0 Demo 的使用方式

### 5.1 已確認的母檔規格

`Cutscene 0 Demo.mp4`：

- 長度：64.454 秒
- 尺寸：2560×1440
- 畫面：約 30fps、VP9
- 聲音：Opus
- 檔案：約 44.4MB
- 另含 MJPEG attached picture stream

長度接近 `cutscene0.md` 的完整版約 66 秒，確認作為正式 CS-00 母片。接入前仍需逐鏡對照分鏡第 8 節，確認字幕、疊字、安全區與轉碼沒有破壞原片；不以審片為由重新剪輯或調色。

### 5.2 Web 交付流程

1. 原始 Demo 保留在根目錄，不覆寫。
2. 產生瀏覽器交付版：
   - `public/adventure/cutscenes/cs-00.mp4`
   - H.264 + AAC、1920×1080、fast-start。
   - 不盲目把 30fps 丟幀轉成 24fps；先檢查動態，再決定保留母檔 cadence 或取得 24fps 正式 master。
   - 目標大小不超過 18MB；暗部不能出現明顯色塊。
3. 擷取：
   - `public/adventure/cutscenes/cs-00-poster.jpg`
   - `public/adventure/cutscenes/cs-00-fallback.jpg`
4. 字幕、地點、人名條、題名與旁白文字由 UI 疊加，不燒入影片。
5. 播放前先顯示「入殿」按鈕，讓使用者手勢合法啟動有聲影片；不依賴瀏覽器有聲 autoplay。
6. 提供鍵盤可操作的播放／暫停、靜音、字幕與略過。
7. `preload="metadata"`；poster 先顯示，避免 44MB 素材阻塞首屏。
8. 播放失敗、素材缺少或 reduced motion 時，改走靜圖＋字幕流程，並能正常進第一幕。

### 5.3 Cutscene 模組的介面

建立一個深模組，讓頁面不需要知道影片格式、字幕時間與 fallback 規則：

```ts
<CutscenePlayer
  slot="cs-00"
  locale={locale}
  onComplete={advance}
/>
```

模組內部負責：素材 manifest、poster、loading/error、字幕 cue、旁白 cue、立即略過、重播、reduced motion、播放結束與 focus 回復。CS-01～CS-14 沿用同一介面；尚未有影片的 slot 由 manifest 宣告 animatic 或 fallback image。

## 6. 目標程式架構

### 6.1 Campaign definition

把劇本資料與 UI 分離。Scenario definition 至少描述：

- 年代、地點、標題與劇情文案 key
- 人物、Portrait Card 素材與估值
- 可分割／不可分割 goods
- 必要搜證 clue
- 即時反應規則
- 展示用範例分法
- Grade 門檻
- Master Challenge 目標
- Cutscene slot

作者資料保留「一件水田、十成」的語意；由 domain adapter 在計算時展開成十個相同 unit item，不讓 UI 或劇本資料直接維護三十個虛擬物件。

### 6.2 Campaign engine

以純函式 reducer 作為唯一進度來源：

```text
PROLOGUE_CUTSCENE
→ TITLE
→ ACT_INTRO
→ INVESTIGATION
→ INITIAL_VERDICT
→ JUDGMENT_GATE
→ DEBRIEF
→ REVISION_DECISION
→ REVISION
→ FINAL_VERDICT
→ MASTER_CHALLENGE（可跳過）
→ ACT_TRANSITION
→ EPILOGUE
```

每幕記錄：

- 搜證進度
- Initial Verdict
- 1～5 直覺評價
- 是否使用 Revision
- Final Verdict
- Grade
- 是否取得 Master Seal

所有「能不能顯示指標」都由 selector 根據 phase 判斷，不由元件自行猜測。第三幕 Revision 額外隱藏 NSW，只在 Master Challenge 顯示。

### 6.3 純 domain 規則

在 `src/domain/` 或 `src/narrative/` 的純規則模組完成：

- 可分割 goods 的十分制展開與 utility 聚合
- Proportionality
- Envy-Freeness 與每一對的 envy gap
- EF1／EFX（沿用並擴充既有 score）
- Most Aggrieved Party 與劇本指定 tie-break
- explicit-order Round-Robin
- Cut-and-Choose
- 每幕 Grade
- Master Seal
- National Ending 與輕／重分支
- Performance Ledger 總印

規則只回傳結果，不產生文案或操作 UI。劇情元件透過結果選擇人物反應。

### 6.4 Presentation modules

預計重建 `src/components/adventure/`：

- `CutscenePlayer`：影片、字幕、fallback
- `GameStage`：16:9 舞台、HUD、focus 管理
- `ScenePlate`：底圖與可點擊實體 DOM hotspot
- `PortraitCard`：人物、表情、姓名、官職
- `InvestigationDossier`：逐步填入估值
- `AllocationWorkbench`：十格 share control 與不可分割物品牌
- `JudgmentGate`：Rate-Before-Reveal
- `CaseScrollDebrief`：逐項揭曉
- `ShareGauge`、`EnvyGraph`、`RemoveOneTest`：三件 Tools
- `PerformanceLedger`：Grade、Final Verdict 與 Master Seal
- `Epilogue`：國運、故人、總評、隱藏結局
- `PauseMenu`：任務、設定、回想與重新開始
- `RecallArchive`：已解鎖 Cutscene 與通關後章節重玩
- `LandscapeGate`：直向提示、選配全螢幕與 best-effort orientation lock

元件只接收 view model 與送出事件；不自行重算公平標準。

### 6.5 儲存與語系

- 新 save key：`settled-shares-campaign-v2`，第一版只存在本機。
- 以 schema 完整解析版本、phase、act、allocations 與 records；舊 v1 prototype save 不 restore，只顯示一次重製說明。
- 每個有效操作自動儲存；入口提供繼續或二次確認後重新開始。
- 切換 `en`／`zh-TW` 不重設進度。
- Campaign 文案可在 `src/i18n/adventure/` 依 locale 拆檔，但由 `src/i18n/copy.ts` 匯出單一型別化介面。
- CI 驗證兩個 locale 的 key 完全相同，不接受 fallback 到另一語言。

## 7. 實作階段

### Phase 0：內容與素材定版

**工作**

- 把根目錄作者稿與 `docs/` 正式稿的真實內容差異列出；確認後只維護 `docs/` 正式稿。
- 建立 Cutscene／Plate／Portrait asset manifest 與缺件清單。
- 對正式 CS-00 母片做疊字安全區檢查及 Web 轉碼測試。
- 先產出一張 Scene Plate 與主要角色標準 Portrait 供風格確認，再批次製作 provisional 素材。
- 決定字體的合法 Web 載入方式與檔案大小。

**完成條件**

- 每個劇情數值與資產 ID 只有一個來源。
- CS-00 可在 Chrome、Firefox、Safari 的目標版本播放，或明確走 fallback。

### Phase 1：規則層，先紅後綠

**工作**

- 先寫第二版三幕的 scenario-fact tests。
- 實作 divisible adapter、Proportionality、EF、envy gap、Most Aggrieved、grading、ending resolver 與 explicit Round-Robin。
- 以窮舉鎖定劇本數值。

**完成條件**

- 第一幕：50／50、30／30、70／70、Cut-and-Choose 50／70。
- 第二幕：錯置機房無 EF；最佳 Harmony Score 131,648 且 EF。
- 第三幕：EF 0、EFX 31、EF1 153、Zero Product 219；唯一 NSW 最大值 125,125。
- 每個 Grade 邊界、五個 National Ending 與 tie-break 都有測試。

### Phase 2：Campaign engine 與 persistence

**工作**

- 以第二版 phase 重寫 state machine。
- 加入單次 Revision、Final Verdict、Ledger、Master Seal。
- 實作版本化 save、invalid save recovery、locale-preserving restore。
- 建立 indicator visibility selector。

**完成條件**

- 初判與自評前看不到正式指標。
- 每幕最多一次 Revision。
- 不改判時 Initial Verdict 正確成為 Final Verdict。
- 第三幕 Revision 看不到 NSW。
- Reload 與切換語系後進度不丟失。

### Phase 3：序幕垂直切片

**工作**

- 建立 `CutscenePlayer`。
- 接入 CS-00 Web 版、字幕 cue、略過與靜圖 fallback。
- 完成戥子定格、墨暈題名、「六年前」與進入第一幕的轉場。
- 移除序幕舊的「算學提刑官／提起天平」內容。

**完成條件**

- 首次進入經使用者手勢播放有聲 CS-00。
- 播完、略過、播放錯誤與 reduced motion 四條路都能抵達第一幕。
- 焦點在轉場後落到第一幕主要標題。

### Phase 4：第一幕完整可玩

**工作**

- Scene Plate／Portrait Card／定分手冊。
- 三個十分制 goods 的拖曳分界、加減按鈕、鍵盤與觸控操作。
- Initial Verdict、直覺評價、分秤揭曉、單次改判、Grade。
- Cut-and-Choose、可回頭補做的 Master Challenge。
- 以核准的 provisional 靜圖完成 CS-01～CS-03 animatic，接到第二幕轉場。
- 繁中垂直切片確認後立即補齊英文文案與版面。

**完成條件**

- 玩家能不靠滑鼠完成全幕。
- 調查前估值保持未知；初判中只出現人物反應。
- 70／70 正確取得「稱職」；只有達成最佳 frontier 才取得巧字印。
- CS-00 至第二幕轉場形成完整可操作的中英文垂直切片。

### Phase 5：第二幕完整可玩

**工作**

- 混合一件不可分 goods 與三個十分制 goods。
- 必要劇情完成後允許在部分估值仍未知時初判；揭曉時標出漏查資料。
- Envy Graph、Compensation、Harmony Score。
- 無法以找補修復錯置機房的教學演示。
- CS-04～CS-06 fallback slots 與第二幕 Ledger。

**完成條件**

- 妒線依每個人的主觀估值正確繪製。
- 2／2／6 生絲分法得到 44、44、68 與 131,648。
- Harmony Score 只在劇本允許的 phase 出現。

### Phase 6：第三幕與完整結局

**工作**

- 「擬稿 → 批准 → 檢查」三格介面動畫與兩個 Zero Product 原稿。
- 必要劇情完成後允許在部分估值仍未知時初判；漏查本身不扣 Grade。
- 六道 Writ、rank-order Round-Robin、去一物互動。
- EF1／EFX 的「過得去／穩」回饋。
- Final Verdict 硃批。
- 五種 National Ending、grievance 輕重、故人短景、考成總評、隱藏結局。
- CS-07～CS-14 fallback slots。

**完成條件**

- Act III Final Verdict 唯一決定 National Ending。
- Acts I／II 只改變故人短景與總評。
- 三枚 Master Seal 在任一 National Ending 後追加「定分宗師」。

### Phase 7：正式素材、效能與產品 QA

**工作**

- 逐批替換 15 個 Cutscene slot、3 張 Scene Plate、35 張 Portrait。
- 移除 campaign 的 Three.js path；確認其他頁面的 Three.js 使用後再決定是否移除 package。
- 圖片尺寸、影片 bitrate、字體 subset、lazy loading 與記憶體檢查。
- 桌面與橫向手機視覺校對。
- 完整中英文校對、字幕 timing 與旁白 transcript 校對。

**完成條件**

- Production build 不需要 PostgreSQL 就能完整玩 campaign。
- 無素材的 slot 仍有可理解的 fallback。
- 沒有鍵盤陷阱、字幕遮擋、不可讀對比或只能靠顏色理解的資訊。
- reduced motion、影片錯誤與重新整理皆不阻斷進度。

## 8. 測試策略

### Unit／exhaustive

- 三幕的所有劇本數值與窮舉分布。
- Grade、Master Seal、Ending、Most Aggrieved tie-break。
- state machine 的每個合法與非法 transition。
- indicator visibility。
- save schema 與 migration/reset。

### Component

- Cutscene ended／skip／error／reduced-motion。
- Dossier 的估值解鎖。
- 十格 share control 的總和與鍵盤操作。
- 不可分割物的點選與 drag alternative。
- Case Scroll 的揭曉順序。
- Envy Graph 與 Remove-One Test 的可讀文字等價內容。

### Playwright

至少覆蓋：

1. CS-00 → 第一幕搜證 → 初判 → 評價 → 揭曉 → 改判 → Grade。
2. 不使用滑鼠完成第一幕。
3. 切換語系及 reload 保留進度。
4. reduced motion／影片失敗仍可繼續。
5. 手機直向顯示旋轉提示，橫向恢復完整遊戲；全螢幕拒絕不阻斷流程。
6. 一次完整三幕流程抵達 EFX National Ending。
7. 一次 grievance 輕結局、一次 grievance 重結局、一次 Zero Product 結局。
8. 三枚 Master Seal 觸發隱藏結局。
9. 章節回想預設不改紀錄，明確覆寫後正確重算 Ledger／結局。

### 每階段驗證

- 開發中跑最小相關 Vitest。
- 每個 playable phase 完成後跑 `npm test`、`npm run test:e2e`、`npm run build`。
- 視覺 phase 以 1440×900 桌面、1280×720、小型橫向手機截圖比較。
- 垂直切片另以桌面 Chrome／Firefox／Safari、iPhone 與 Android 橫向實機驗收。

## 9. 素材清單與缺件策略

| 類型 | 最終需求 | 目前 | 缺件時 |
| --- | ---: | ---: | --- |
| Cutscene slot | 15 | CS-00 正式母片 1 支 | CS-01～CS-03 先做核准的 animatic；其餘 Scene still＋字幕＋繼續按鈕 |
| Scene Plate | 3 | 新版 0 | 先審一張原創 provisional 樣板，再批次產出；不用舊 3D poster |
| Portrait | 35 | 新版 0 | 先鎖主要角色原創臉型；缺件時以姓名牌＋剪影維持可玩性 |
| 字幕／旁白文案 | 兩語系 | 中文劇本完整 | 該 milestone 不完成前不視為可交付 |
| 聲音 | CS-00 既有音軌；其餘待產 | 1 | 字幕必須完整，旁白可暫無聲 |

## 10. 主要風險與控制方式

1. **重複文件漂移**：正式內容只在 `docs/` 維護；根目錄稿待確認後歸檔，而非雙向同步。
2. **影片過重或 Safari 不相容**：保留正式母片，交付 H.264/AAC fast-start，poster 優先，失敗時讓玩家選擇重試或靜態版本。
3. **素材未齊拖住程式**：所有 Cutscene、Plate、Portrait 都由 manifest 提供 fallback。
4. **舊存檔污染新版流程**：使用 v2 key 與 schema；不猜測遷移第一版 allocation。
5. **數學規則散落 UI**：所有規則由純 campaign engine／domain module 提供，元件只顯示 view model。
6. **拖曳造成無障礙阻塞**：每個 drag 都有「選物 → 指派給某人」的按鈕等價操作。
7. **動畫喧賓奪主**：只保留題名、卷宗、妒線、落印四種 UI 敘事動畫。
8. **Three.js 清理影響學習站**：先刪 campaign 的 Scene Runtime 使用；確認 `AllocationField.tsx` 等剩餘引用後再移除 dependency。
9. **英文落後中文**：型別與測試要求 key 對齊；不以舊第一版英文文案填充新版劇情。

## 11. 最終完成定義

以下全部成立才算第二版網頁遊戲完成：

- 三幕依正確歷史時間線與角色名稱完整可玩。
- Rate-Before-Reveal、一次 Revision、Final Verdict、Performance Ledger 與 Master Challenge 全部正確。
- 劇本指定數值與 729 種第三幕分布由測試鎖定。
- 五種 National Ending、三組 grievance 對象、輕重分支、兩段故人短景、三種總印與隱藏結局皆可達。
- CS-00 正式母片已以 Web 交付版接入；CS-01～CS-03 有核准的 animatic，其餘 slot 至少有可理解的 fallback。
- `en`、`zh-TW` 內容完整，切換不丟進度。
- 鍵盤、橫向手機、reduced motion、影片失敗皆能完成遊戲。
- Campaign 不再執行舊 Three.js diorama，也不再出現第一版角色、地名、白銀補償或舊結局。
- `npm test`、`npm run test:e2e`、`npm run build` 全部通過。

## 12. Executable Implementation Plan

本節是工程執行順序。第一輪只交付已確認的垂直切片：**CS-00 → 第一幕完整流程 → CS-03 → 第二幕轉場**。第二、三幕不得在第一幕的規則、狀態與互動尚未通過 Gate 之前平行擴寫。

### 12.1 執行原則

- 依下列 IP-0～IP-8 的依賴順序工作；內容 Gate 0A 通過後即可進行規則與 state machine，美術 Gate 0B 只阻擋批次美術與 animatic，不讓素材缺件阻塞規則或 fallback 流程。
- Domain 與 state machine 採 test-first：先寫會失敗的事實／轉移測試，再實作，再重構。
- React 元件不重算 fairness、Grade 或 ending；只呈現 narrative selector 產生的 view model。
- 不直接解析 Markdown 作 runtime content，也不建立第三份長期劇本來源。
- 每個工作包完成時提供：變更檔案、可操作路徑、測試結果、尚未完成項目。
- 實作前先閱讀目前安裝版本位於 `node_modules/next/dist/docs/` 的 Client Component、CSS、media 與 route 文件；不依賴既有 Next.js 印象。

### 12.2 目標檔案配置

```text
src/domain/
  fairness.ts                 # 單一深模組：utility、比例公平、EF、EF1、EFX、NSW、envy witnesses
  model.ts                    # 保留 learning site 的 CaseInput／Allocation 邊界
  score.ts                    # 維持既有 API，委派至 fairness.ts

src/narrative/
  campaign-definition.ts      # 第二版三幕的型別化 scenario facts；先只填完整 Act I
  allocation-adapter.ts       # 可見 goods／十分制 shares → domain unit goods
  campaign-rules.ts           # Grade、Master frontier、Cut-and-Choose、Ledger、ending
  state-machine.ts            # 唯一 campaign reducer
  selectors.ts                # indicator visibility 與 component view models
  persistence.ts              # v2 save schema、restore、舊版提示
  media-manifest.ts           # CS-00～CS-14 的 video／animatic／fallback 宣告
  types.ts                    # 上述模組共享的最小公開型別

src/i18n/adventure/
  zh-TW.ts                    # 第二版繁中 copy
  en.ts                       # 相同 key 的自然歷史劇英文
  index.ts                    # 型別安全的 locale lookup

src/components/adventure/
  AdventureShell.tsx          # 只組合 engine、save 與目前 phase
  GameStage.tsx               # 橫向滿版舞台及 16:9 safe area
  LandscapeGate.tsx           # 直向提示、選配全螢幕、best-effort orientation lock
  CutscenePlayer.tsx          # video／animatic／fallback 深模組
  ScenePlate.tsx
  PortraitCard.tsx
  InvestigationDossier.tsx
  AllocationWorkbench.tsx
  JudgmentGate.tsx
  CaseScrollDebrief.tsx
  ShareGauge.tsx
  PerformanceLedger.tsx
  PauseMenu.tsx
  RecallArchive.tsx
  adventure.css

public/adventure/
  cutscenes/cs-00.mp4
  cutscenes/cs-00-poster.jpg
  cutscenes/cs-00-fallback.jpg
  animatics/cs-01/*
  animatics/cs-02/*
  animatics/cs-03/*
  plates/*
  portraits/*
```

垂直切片切換完成後移除 campaign 已無引用的：

- `src/components/adventure/SceneCanvas.tsx`
- `src/components/adventure/SceneViewport.tsx`
- `src/narrative/scenarios.ts`
- `src/narrative/verdict-engine.ts`

`three` package 暫不在此切片移除；先確認學習站 `AllocationField.tsx` 等剩餘引用。

### IP-0：內容同步與素材 Gate

**依賴**：無  
**結果**：工程使用的內容與視覺樣板得到確認。

1. 比對根目錄作者稿與 canonical docs，只列真正的事件、對白、數值差異，忽略 Markdown 格式差異。
2. 將 proposed changes 直接以文件 diff 提交，不建立另一份 master script。
3. 建立 15 個 Cutscene slot、3 張 Scene Plate、Portrait expressions 的 asset inventory；每個 ID 標記 `final | provisional | fallback`。
4. 從 CS-00 取 poster／fallback 候選幀，驗證疊加字幕與 16:9 safe area。
5. 製作並提交一張第一幕 Scene Plate，以及陳守業、陳從征、程衡、周先生的標準 Portrait 樣板。
6. 樣板確認前不批次生成 CS-01～CS-03 animatic 或其他表情。

**Gate 0A／內容（已通過）**

- 劇本比對已確認：沒有需要套用的事件、對白、數值或流程 diff。
- 第一幕每個人物、good、clue、Cutscene 都有穩定 ID。
- 第一幕四項 authored 搜證全部列為 required。
- 原始 `Cutscene 0 Demo.mp4` 保留原位且未覆寫。

Gate 0A 通過後可開始 IP-1／IP-2；不得因 provisional 美術缺件延後 domain 或 state machine。

**Gate 0B／美術樣板（未通過）**

- Scene Plate 與四名主要角色標準 Portrait 尚待製作與確認。
- Gate 0B 只阻擋批次 Portrait、Scene Plate 與 CS-01～CS-03 animatic；元件先使用姓名牌、剪影與紙色場景 fallback。

### IP-1：公平規則與第一幕 facts

**依賴**：Gate 0A  
**主要檔案**：`src/domain/fairness.ts`、`src/domain/score.ts`、`src/narrative/campaign-definition.ts`、`src/narrative/allocation-adapter.ts`、`src/narrative/campaign-rules.ts`

#### 先寫測試

新增：

- `tests/domain-fairness.test.ts`
- `tests/narrative-scenario-facts.test.ts`
- `tests/narrative-campaign-rules.test.ts`

測試必須先覆蓋：

1. 十分制 share 只能是 0～10 的整數，同一 good 各方合計必須為 10。
2. 一件十分制 good 投影為十個同價值 unit goods；utility 聚合回玩家看到的 good。
3. 第一幕對半分得到 50／50。
4. 第一幕倒置得到 30／30。
5. 第一幕 frontier 分法得到 70／70，且雙方不嫉妒。
6. Cut-and-Choose 由兄分、弟選，劇本結果為 50／70。
7. Proportionality、EF 與 envy witness 使用各人的主觀估值，不使用市場價格。
8. Grade 邊界及「完成挑戰」與「取得巧字印」是兩個不同結果。
9. 既有 learning site 的 `scoreAllocation` JSON contract 不改變。

#### 實作

- `fairness.ts` 一次回傳完整 analysis，不建立每個 metric 一個薄 wrapper。
- `allocation-adapter.ts` 隱藏 unit expansion；UI 永遠只看三件 goods 的十格 shares。
- `campaign-rules.ts` 實作 Act I Grade、Cut-and-Choose 與 frontier 判定；不含 React、locale、storage 或 media。
- `score.ts` 改為委派共用核心，但保持既有匯出型別及 API 測試相容。

**驗證**

```bash
npm test -- tests/domain-fairness.test.ts tests/narrative-scenario-facts.test.ts tests/narrative-campaign-rules.test.ts tests/domain.test.ts tests/api.test.ts
```

**Gate 1（已通過）**：上述數值全部由測試鎖定，既有 learning site domain/API 測試仍通過；Cut-and-Choose 平手選甲規則已由測試固定。

### IP-2：Campaign state machine、selectors 與 save v2

**依賴**：Gate 1  
**主要檔案**：`src/narrative/types.ts`、`state-machine.ts`、`selectors.ts`、`persistence.ts`

#### 先寫測試

重寫 `tests/narrative-game.test.ts`，新增 `tests/narrative-persistence.test.ts`，覆蓋：

1. 合法主路徑：CS-00 → title → intro → investigation → initial verdict → rating → debrief → revision decision → revision → final verdict → challenge／skip → ledger → CS-03 → Act II transition。
2. 第一幕缺少必要 clue 時不能鎖定初判；鎖定前可回搜證。
3. 自評前 selectors 不提供任何正式 metric。
4. Revision 從 Initial Verdict 複製，且每幕最多一次。
5. Master Challenge 可跳過、返回、完成但未達 frontier、達 frontier 授印、看第三階提示後不授印。
6. 任一 Grade 都能繼續，沒有失敗 Game Over。
7. 每個 reducer action 不可改寫舊 state object。
8. v2 save round-trip、corrupt save reset、v1 one-time notice、locale switch 不改進度。
9. replay 預設 sandbox；使用者確認覆寫才更新 record 並重算依賴結果。
10. `selectVisibleMetrics` 在每個 phase 的 allowlist 正確。

#### 實作

- `CampaignState` 分開保存 `draftAllocation`、`initialVerdict`、`intuitionRating`、`revisionAllocation`、`finalVerdict`、`actRecord`。
- Cutscene phase 使用 slot ID 與 `returnTo`，避免為十五支影片建立十五個 phase。
- `selectors.ts` 是 UI 取得 metric、提示、CTA、任務文字的唯一入口。
- `persistence.ts` 用 Zod 解析完整 save envelope：`version`、`campaign`、`settings`、`recall`。
- `RESTORE` 只接受 parser 結果，不允許 reducer 接任意 `NarrativeState`。

**驗證**

```bash
npm test -- tests/narrative-game.test.ts tests/narrative-persistence.test.ts
```

**Gate 2（已通過）**：完整第一幕狀態路徑可在純 Vitest 中跑完，任一非法 action 都保持 state 不變；save v2 會拒絕不可到達或偽造的 phase、clue、verdict、challenge 與 replay 組合。

### IP-3：CS-00 Web 媒體與 CutscenePlayer

**依賴**：Gate 2  
**主要檔案**：`src/narrative/media-manifest.ts`、`src/components/adventure/CutscenePlayer.tsx`、`src/i18n/adventure/*`

1. 保留根目錄母片，輸出 H.264/AAC、1080p、fast-start 的 Web derivative；不重新剪輯、不調色、不盲目改幀率。
2. 對暗部、字幕安全區、聲畫同步與 Safari 解碼做人工檢查；成品以 18MB 為目標上限，品質不足時先提高預算而非破壞暗部。
3. 產生 poster 與 reduced-motion fallback。
4. 在 manifest 定義 CS-00 duration、poster、fallback、localized timed cues 與下一個 phase。
5. `CutscenePlayer` 實作：入殿 gate、有聲播放、字幕預設開、立即略過、暫停、靜音／音量、重播、ended、error retry、靜態 fallback、focus restore。
6. `prefers-reduced-motion` 不載入動態播放，直接走 poster＋相同字幕／旁白。
7. 音量與字幕設定寫入 save settings，不把 playback time 當 campaign progress。

#### Component tests

新增 `tests/adventure-cutscene.test.tsx`：

- mock `HTMLMediaElement.play`／`pause` 及 media events。
- 驗證 ended 與 skip 只 dispatch 一次 completion。
- 驗證 error 可重試或切換 fallback。
- 驗證 reduced motion、字幕切換、音量記憶與 keyboard controls。

**驗證**

```bash
npm test -- tests/adventure-cutscene.test.tsx
```

**Gate 3（自動化部分已通過）**：Web derivative、拒絕 autoplay、播放錯誤、reduced motion、鍵盤控制與 completion idempotence 已由測試及獨立 reviewer 驗證。Safari／手機實機播放與 responsive safe-area 必須在 IP-4 接入 GameStage 後完成，不在未掛載元件上虛報。

### IP-4：GameStage、橫向 Gate 與 UI foundation

**依賴**：Gate 2、Gate 3  
**主要檔案**：`AdventureShell.tsx`、`GameStage.tsx`、`LandscapeGate.tsx`、`PauseMenu.tsx`、`adventure.css`

1. 讓 `AdventureShell` 只負責 reducer、persistence、locale 與 phase component composition。
2. 建立滿 viewport 背景與中央 16:9 safe area；背景 `cover`，關鍵 UI 不超出 safe area。
3. 直向手機顯示旋轉提示；旋轉回橫向後保持同一 state。
4. 全螢幕為使用者主動按鈕；API 缺少或拒絕時顯示非阻塞回饋。
5. 建立宣紙、墨、官青、朱紅、秧綠、舊金 tokens；重寫現有 minified adventure CSS。
6. 加入 skip link、focus-visible、字幕 safe area、200% text zoom 與 reduced-motion 規則。
7. 暫停選單先實作垂直切片需要的任務、操作、音量、字幕、重播 CS-00、重新開始與返回。

新增 `tests/adventure-stage.test.tsx`，測 portrait gate、orientation API 缺失、fullscreen rejection、focus 與 pause menu。

**驗證**

```bash
npm test -- tests/adventure-stage.test.tsx
```

**Gate 4（自動化驗收已通過）**：1440×900、1280×720 與小型手機橫向沒有關鍵控制被裁切；直向不能誤操作底下的遊戲；pause／orientation suspension、fullscreen topology、modal focus/inert、metadata 與 legacy graph isolation 已由獨立 reviewer 驗證。Safari／實機方向與 200% zoom 仍屬實機 residual note。

### IP-5：第一幕搜證與分配

**依賴**：Gate 4  
**主要檔案**：`ScenePlate.tsx`、`PortraitCard.tsx`、`InvestigationDossier.tsx`、`AllocationWorkbench.tsx`

1. 把 Act I canonical facts 接入 `campaign-definition.ts`；內容用 copy key，不在 JSX 寫中英字串。
2. Scene Plate hotspots 使用真正 button，Portrait Card 顯示姓名、身分、當前反應與 focus state。
3. 第一次互動只引導一次「詢問 → 選 good → 拖曳／加減 → 鎖定」；之後不重播。
4. 完成所有必要人物對話後才能鎖定第一幕初判。
5. 分配桿每件 good 恆有十格：拖曳分界快速調整；加減按鈕與方向鍵逐格調整；所有變動保持總和 10。
6. 初判期間不渲染 metric DOM；重要門檻只觸發節流過的人物台詞。
7. 鎖定前保留「返回搜證」，鎖定後 allocation snapshot 不可修改。

新增：

- `tests/adventure-investigation.test.tsx`
- `tests/adventure-allocation.test.tsx`

測試 mouse、keyboard、touch-equivalent events、總和 invariant、required clues、返回調查、reaction cooldown 與 metric absence。

**驗證**

```bash
npm test -- tests/adventure-investigation.test.tsx tests/adventure-allocation.test.tsx
```

**Gate 5（已通過）**：不使用滑鼠也能完成搜證與 3 件 goods 分配；任何操作序列都不能產生總和不為 10 的 share；四項 canonical reactions、一次性操作教學、hotspots、partial-save reload 與 shuffled-row safety 已由獨立 reviewer 驗證。

### IP-6：Rate-Before-Reveal、Revision 與 Case Scroll

**依賴**：Gate 5  
**主要檔案**：`JudgmentGate.tsx`、`CaseScrollDebrief.tsx`、`ShareGauge.tsx`、`AdventureShell.tsx`

1. 鎖定初判後只顯示 1～5 主觀評價；DOM、ARIA label 與 live region 都不能提前包含正式 metric。
2. 評價提交後以手動步驟依序展開：人物 utility → Proportionality → EF／envy → 簡短結論。
3. 每一步先顯示角色語言，再提供可展開公式；已看過的 reveal 記入 recall，重玩可一鍵完成動畫。
4. Revision 畫面並列 Initial 與 Draft；正式工具可見並即時重算，但不能第二次返回搜證。
5. Final Verdict 落印後凍結 record；不提供無限驗算循環。
6. 對半、倒置、frontier 三種劇本分法的視覺文案與 domain 數值必須一致。

新增 `tests/adventure-verdict-flow.test.tsx`，覆蓋 sealed metrics、rating、逐步揭曉、skip reveal、單次 revision、final freeze。

**驗證**

```bash
npm test -- tests/adventure-verdict-flow.test.tsx
```

**Gate 6（已通過）**：玩家不可能在自評前由可見或輔助技術文字取得答案；Revision 永遠只有一次；Case Scroll、單次改判、live revision tools、utility formula 與 one-sided conclusion 已由獨立 reviewer 驗證。

### IP-7：巧解、Ledger、CS-01～CS-03 與英文

**依賴**：Gate 6  
**主要檔案**：`PerformanceLedger.tsx`、`RecallArchive.tsx`、`media-manifest.ts`、`src/i18n/adventure/*`

1. 實作 Cut-and-Choose 互動：玩家作為兄長切分，弟弟依自己的估值決定；tie-break 由 canonical 規則固定。
2. 三階提示各自記錄；第三階段使 seal eligibility 為 false，但仍可完成挑戰。
3. 完成條件與 frontier 分開顯示；只有 70／70 frontier 且仍 eligible 才蓋巧字印。
4. Ledger 顯示 Initial Verdict、Final Verdict、Grade、是否用 Revision、巧字印狀態與補做入口。
5. Gate 0B 通過後，依核准樣板製作 CS-01～CS-03 animatic；Gate 未通過時先接可讀的紙色 still fallback，使用同一 `CutscenePlayer` contract，不建立特例播放器。
6. CS-03 結束後顯示第二幕轉場 teaser，但不讓玩家進入尚未完成的第二幕 gameplay。
7. 完成所有英文 copy；key 必須與繁中完全一致。英文採自然歷史劇語氣，正式術語只在揭曉後出現。
8. Recall Archive 可重播已看 Cutscene；重播 completion 不 dispatch campaign advance。

新增：

- `tests/adventure-master-challenge.test.tsx`
- `tests/adventure-ledger.test.tsx`
- 擴充 `tests/i18n.test.ts`

**驗證**

```bash
npm test -- tests/adventure-master-challenge.test.tsx tests/adventure-ledger.test.tsx tests/i18n.test.ts
```

**Gate 7（已通過）**：繁中與英文都能從 CS-00 玩到第二幕轉場；跳過巧解、補做巧解、看提示、不授印與 frontier 授印皆正確；CS-01～CS-03 fallback、PauseMenu、字幕完整性與 browser branch coverage 已由獨立 reviewer 驗證。

### IP-8：整合、移除舊路徑與垂直切片驗收

**依賴**：Gate 7

1. 重寫 `tests/e2e/adventure.spec.ts`，不得再引用第一版 scenario data。
2. E2E 至少覆蓋：
   - 第一次完整流程與 70／70 巧字印。
   - 指標在評價前不存在。
   - 跳過 CS-00、影片 error fallback、reduced motion。
   - reload／切語系／繼續存檔。
   - 直向 gate、旋轉回橫向、fullscreen rejection。
   - 跳過巧解後從 Ledger 補做。
   - 鍵盤完成完整第一幕。
3. 移除 `SceneCanvas`、`SceneViewport`、舊 scenario 與舊 verdict engine；`rg` 確認沒有第一版角色、地名、銀兩滑桿與 adventure Three.js import。
4. 檢查 console error、React hydration、focus order、200% zoom、字幕遮擋及色彩以外的狀態提示。
5. 實機驗收：桌面 Chrome／Firefox／Safari、iPhone Safari 橫向、Android Chrome 橫向。
6. 整理 Phase 交付摘要，列出 provisional assets 與第二幕前仍待完成的項目。

**自動驗證**

```bash
npm test
npm run test:e2e -- tests/e2e/adventure.spec.ts
npm run build
rg -n "SceneCanvas|SceneViewport|算學提刑官|scenario\\.id === '(guild|yamen|palace)'" src/components/adventure src/narrative
```

最後一個 `rg` 預期沒有第二版 campaign 的 runtime 命中；若命中必須逐條說明。

**Gate 8／垂直切片完成定義**

- CS-00 正式母片、題名、第一幕、巧解、Ledger、CS-03 與第二幕轉場連續可玩。
- 繁中與英文都完成，切換不重設進度。
- 桌面、平板、手機橫向、鍵盤、reduced motion、媒體失敗均不阻斷流程。
- 所有自動測試與 production build 通過。
- 獨立 AI reviewer 無 blocker、完整驗證通過後才開始第二幕工作包；只有新產品決策或人工美術核准才升級給使用者。

## 13. 垂直切片後續工作包

Gate 8 通過後，依相同模式逐幕交付：

1. **IP-9／第二幕 domain facts**：先鎖定混合 goods、envy、compensation、Harmony Score 131,648 與 Grade 測試。
2. **IP-10／第二幕 gameplay**：允許部分估值未知便初判；實作 Envy Graph、補償與 CS-04～CS-06。
3. **IP-11／第三幕 exhaustive rules**：窮舉 729 種 allocation，鎖定 EF 0、EFX 31、EF1 153、Zero Product 219、NSW 最大值 125,125。
4. **IP-12／第三幕 gameplay**：六道 Writ、Round-Robin、Remove-One Test、Final Verdict 與 CS-07～CS-12。
5. **IP-13／Epilogue**：五種 National Ending、grievance 輕重、故人短景、總評、隱藏結局與 CS-13～CS-14。
6. **IP-14／完整素材與 release QA**：替換 provisional assets、完整字幕／聲音校對、全流程 E2E、效能與實機回歸。

每個後續工作包仍遵守「先 facts tests、再 engine、再 UI、最後 E2E」；不得以第二幕需求回頭把規則塞進 React 元件。
