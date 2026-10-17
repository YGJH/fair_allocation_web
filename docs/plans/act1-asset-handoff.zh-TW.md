# 第一幕素材交接｜給接手遊戲邏輯的人與 agent

> **日期**：2026-10-18
> **目的**：把第一幕已生成的素材接進遊戲。本文只是概要與索引；細節以各連結文件為準。

---

## 1. 方向（先對齊這三點）

1. **寫實靜圖＋2D 介面，不用 Three.js**（ADR-0006）。`src/three/`、`SceneCanvas`、舊 poster 都是過時的原型，不要擴充。
2. **過場有三種做法**（ADR-0007），不是全部做成影片：
   - **影片**：只有 CS-00 和之後的 7 段。
   - **靜圖動畫（animatic）**：一組靜圖，由遊戲端加緩慢推鏡、淡入淡出與字幕。
   - **對話場**：先放一張場景圖，接著用立繪卡加對話框播台詞，和遊玩時的對話同一套元件。
3. **圖裡沒有任何要讀的字**。公文、狀子、信、字幕都由遊戲疊上，字幕不燒進影片或圖片。所有文字都要有 `en` 與 `zh-TW` 兩種版本。

## 2. 必讀文件（依序）

| 文件 | 讀什麼 |
| :--- | :--- |
| `AGENTS.md`、`GLOSSARY.md` | 規則、名詞（Scene Plate、Portrait Card、Cutscene） |
| `docs/adr/0006-*.md`、`docs/adr/0007-cutscene-formats.md` | 為什麼是靜圖＋2D、三種過場做法 |
| `docs/plans/narrative-web-game-implementation.zh-TW.md` | 實作分期，依 phase 進行 |
| `docs/story/master-script.zh-TW.md`〈第一幕〉 | 台詞原文、估值矩陣、即時反應、揭曉 |
| `docs/art/style-guide.zh-TW.md` 第 6 節 | 介面色票、字體、元件、版面 |
| `docs/art/portraits.zh-TW.md` 第 1、6 節 | 立繪版式、**台詞與立繪對照表** |
| `docs/art/storyboards/cs-act1.zh-TW.md` | CS-01～03 每張圖的秒數、推鏡、疊字 |
| `docs/art/storyboards/cs-01-14.zh-TW.md` 第 2 節 | 推鏡的四種定義 |
| `docs/art/narrative-asset-inventory.zh-TW.md` | 素材 ID、路徑、fallback 政策 |

分鏡已拆成 `cs-01-14`（總覽與共用規則）、`cs-act1`、`cs-act2`、`cs-act3` 四個檔。`cs-00.zh-TW.md` 是序幕，影片已定稿，不要再改。

## 3. 已有的素材

全部已 commit，放在 `public/adventure/` 下。

| 類別 | 檔案 | 實際規格 |
| :--- | :--- | :--- |
| 序幕影片 | `cutscenes/cs-00.mp4`、`cs-00-poster.jpg`、`cs-00-fallback.jpg` | 已接進 manifest |
| 場景底圖 | `plates/plate-act1.jpg`、`plate-act2.jpg`、`plate-act3.jpg` | 2752×1536 |
| 過場靜圖 | `animatics/cs-01/cs-01-s1.jpg`、`cs-01-s2.jpg`；`animatics/cs-02/cs-02-s1.jpg`；`animatics/cs-03/cs-03-s1.jpg`、`cs-03-s2.jpg` | 2752×1536 JPEG |
| 立繪 | `portraits/` 下 15 張，見下方 | 2752×1536 JPEG，中灰背景 |

**立繪清單**：
- 程衡：`cheng-heng-calm`，第三幕版 `cheng-heng-act3-calm`、`cheng-heng-act3-resolute`
- 周先生：`zhou-calm`、`zhou-hint1`、`zhou-hint2`、`zhou-pleased`、`zhou-worried`（提點刻意有兩張，見下方說明）
- 陳守業：`chen-shouye-calm`、`chen-shouye-pleased`、`chen-shouye-aggrieved`
- 陳從征：`chen-congzheng-calm`、`chen-congzheng-pleased`、`chen-congzheng-aggrieved`
- 陳老太公：`chen-elder-calm`

**周先生的提點刻意有兩張**：`zhou-hint1` 與 `zhou-hint2`。同一段對話裡依提點台詞的出現順序輪替，奇數句用 `hint1`、偶數句用 `hint2`，每段對話都從 `hint1` 開始。沒有 `zhou-hint` 這個檔名。

### 實際檔案與文件規格的差異

接的時候要處理，或和美術端確認：

| 項目 | 文件規格 | 實際 | 建議 |
| :--- | :--- | :--- | :--- |
| 立繪比例與背景 | 2:3 直式、去背的透明 PNG | 16:9 橫式，人物置中，中灰背景沒去背 | 先用 CSS 裁切（`object-fit: cover`，`object-position` 取中上），不阻擋開發；之後換成去背 PNG 時只改副檔名與裁切設定 |
| 圖片尺寸 | 2560×1440 | 2752×1536，一樣是 16:9 | 不用處理 |

## 4. 第一幕的流程與素材對應

| 段落 | 畫面 | 素材 |
| :--- | :--- | :--- |
| CS-01 | 靜圖動畫，接對話場 | `cs-01-s1`（6 秒，推近，焦點在程衡與戥子之間）→ `cs-01-s2`（5 秒，定格，疊字「義烏縣　上控」）→ 周先生台詞，`zhou-calm` 單人置中 |
| 搜證 | 底圖加底部一排立繪卡，右側定分手冊 | `plate-act1`；點到誰就用他的 `calm` 單人置中說話。程衡那句「稱得很準…」用 `cheng-heng-calm` |
| 初判 | 即時反應：立繪切換表情，卡旁加一句短台詞 | 水田大半給弟弟 → `chen-shouye-aggrieved`；現銀大半給哥哥 → `chen-congzheng-aggrieved`；水田歸兄、現銀歸弟 → 兩人都 `pleased` |
| 揭曉 | 斷案卷宗 | 周先生的教學 → `zhou-hint1`／`zhou-hint2` 輪替；巧解 → `zhou-pleased` |
| CS-02 | 靜圖動畫 | `cs-02-s1`（8 秒，右移） |
| 我分你選 | 古法挑戰 | 周先生 → `zhou-hint1`／`zhou-hint2` 輪替 |
| CS-03 | 靜圖動畫 | `cs-03-s1`（7 秒，推近，信的內容以字幕呈現）→ `cs-03-s2`（6 秒，左移，字幕「五年後 · 萬曆八年冬」）→ 考成簿那一行用介面的紙頁呈現 |

逐句的立繪對照見 `portraits.zh-TW.md` 第 6 節。

## 5. 程式端要做的事

1. **`src/narrative/media-manifest.ts`**：CS-01～03 目前是 `kind: 'static'`，fallback 是紙色的 SVG 佔位圖。改成 `kind: 'animatic'`，把上表的圖與秒數填進 `frames`。
2. **擴充 animatic 的格式**：`AnimaticCutsceneMedia.frames` 目前只有 `imageSrc` 和 `durationSeconds`。分鏡還需要：
   - 推鏡：推近／拉遠／左移／右移／定格，以及推近的焦點
   - 每張圖的疊字
   - 字幕的時間點
3. **對話場**：CS-01 在靜圖之後接立繪與台詞，manifest 目前沒有這種結構。可以讓過場結束後由 state machine 進入一段對話，或在 manifest 加一種「對話段」，請選一種做。
4. **立繪卡元件**，要有三種版式：
   - **單人**：置中，面向玩家
   - **兩人**：左右分列，程衡固定在右側，說話的人亮、聽的人略暗
   - **小卡**：底部列與案台用，只裁頭到胸口
5. **測試**：`tests/adventure-stage.test.tsx` 引用的 `/adventure/plates/court.jpg` 是舊路徑，現在的底圖是 `plate-act1.jpg`。依 AGENTS.md，完成前要跑 `npm test` 與 `npm run build`，使用者流程有改的話再跑 Playwright。

## 6. 注意事項

- **立繪不可左右翻轉**。明代衣服是右衽，翻轉後會變成左衽，那是夷服或壽衣的穿法。兩人版式靠擺位，不靠鏡像。
- **朱紅只表示「有人不平」**，用在妒線、不平的表情框與警示，其他地方不用（style guide 6.1）。
- **推鏡幅度很小**：100% 到 106%，或平移畫面寬度的 4%。靜圖四周已預留裁切空間。
- **不要用 `public/game/posters/*.webp` 冒充新素材**，那是舊 Three.js 的圖。
- **repo 根目錄可能有未追蹤的影片與草稿**，是製作中的素材，不要刪。
- **第二幕以後的素材還沒生成**。混合過場（CS-07、CS-13，先播靜圖再接影片）的播放方式也還沒決定（ADR-0007），第一幕不受影響。
