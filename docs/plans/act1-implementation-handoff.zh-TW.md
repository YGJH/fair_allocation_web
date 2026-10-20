# 第一幕實作交接

## 本次 Git 變更紀錄（相對 `35cf069`）

這次提交整理的是第一幕互動與敘事呈現；第二、三幕原有可玩流程沒有增加新的劇情或正式媒體。主要變更：

1. `AdventureShell` 將第一幕 Case Desk 拆成「聽取證詞 → 分配家產」兩個可返回的步驟；四項必要線索齊備才能進入分配。第一幕改用紙本配色、單一捲動區與窄螢幕縱向版面；第二、三幕仍沿用原本的整合式案台。
2. `InvestigationDossier` 的人物、原判與線索清單可點選記錄、重看證詞；分配案台新增兩兄弟對三項家產的主觀估值表及更明確的十成滑桿說明。初判前仍不顯示公平指標。
3. 第一幕標題、介紹、判詞頁改用 `media-manifest` 的 CS-01／CS-02 靜圖與共用 `AnimaticStill` 動態；系統偏好減少動態時停用動畫。CS-00 播放方式與既有 CS-03 流程未改。
4. 中英文補回兩兄弟證詞的動機細節、分秤的五／三／七成講解，以及我分你選的教學與完成台詞；巧解完成時即呈現結語，是否取得巧字印仍依原有 frontier 條件判定。
5. 新增僅在 `NODE_ENV=development` 可用的第一幕 UI 比較試作：`/{locale}/adventure?variant=focus|guided|dossier`。它不使用正式 campaign reducer／存檔，也不代表已採納的遊戲流程；正式環境及無參數入口仍為 `AdventureShell`。
6. 更新元件測試與完整第一幕 E2E，新增雙語文案、CS-00／CS-01／CS-02 動態及 reduced-motion、第一幕劇情到第二幕轉場的測試；調整第二幕銜接與既有全程測試以適配兩步式案台。

**待產品確認**：目前第一幕在 `LOCK_INITIAL_VERDICT` 後直接進入揭曉，`intuitionRating` 為 `null`；第二、三幕仍保留自評。這是既有實作加上本次介面所延續的行為，**與 `GLOSSARY.md` 的 Rate-Before-Reveal、ADR-0005 及 `docs/story/master-script.zh-TW.md` 的每幕先評價後揭曉不一致**。不要把此交接文件視為修改上述決策的授權；下次規劃時須決定補回第一幕自評，或先正式修訂產品文件與相依測試／存檔說明。

## 目前狀態

這一輪的內容／美術重點是 **第一組開場 cutscene（CS-01）與其後的第一幕初判／判詞流程**；CS-00 只維持既有播放方式。第二、三幕沒有新增篇章內容或做完整媒體整合，目前只是保留既有功能，另有共用橫向版面與相容性調整。

本機入口：

- `http://localhost:3000/zh-TW/adventure`
- `http://localhost:3000/en/adventure`

## 已完成的第一幕流程

1. CS-00 維持原播放方式。
2. 第一幕標題頁右側顯示 `cs-01-s1.jpg`，沿用 manifest 的 3 秒推近動態。
3. 第一幕介紹頁右側顯示 `cs-01-s2.jpg`，保留周先生完整對話與「義烏縣 上控」。
4. 搜證與分配仍在同一個 Case Desk，但改成清楚的兩步：先聽證，四項線索齊備後再進入分配；分配時可返回重看證詞。
5. 點人物、證詞或原判即記錄線索；線索清單可重看內容，不再需要「已紀錄」按鈕，也不重複展開同一段證詞。
6. 分配頁摘要列出兩兄弟對三種家產的主觀估值；滑桿調整分給哥哥的成數，弟弟自動取得餘額。初判鎖定前仍不顯示公平指標。
7. 鎖定初判後直接進判詞，不再顯示第一幕公平直覺評分。
8. 判詞頁直接顯示 `cs-02-s1.jpg`，沿用 manifest 的 8 秒右移動態，並在同頁選擇接受初判或改判一次。
9. Case Desk 使用紙本配色與單一捲動區；窄螢幕改為縱向流程，不再要求左右內欄各自捲動。
10. 小／中／大文字設定會寫入存檔。

CS-01／CS-02 的動態在系統啟用「減少動態效果」時會自動停用；CS-00 則改用完整逐字稿 fallback。

舊存檔中的 CS-01、CS-02、第一幕 intuition rating 與 revision-decision 仍可繼續讀取。

## 重要檔案

- `src/components/adventure/AdventureShell.tsx`：控制整體幕次與畫面切換；第一幕簡化流程主要在這裡。
- `src/components/adventure/AdventureShell.module.css`：全幕舞台、Case Desk、標題／介紹雙欄與文字尺寸樣式。
- `src/components/adventure/InvestigationDossier.tsx`：第一幕搜證、點擊即記錄、整合分配工作台。
- `src/components/adventure/ScenePlate.tsx`：場景圖、hotspot、人物對話的正常文件流；避免圖片與文字重疊。
- `src/components/adventure/AllocationWorkbench.tsx`：財產分配 slider 與人物反應。
- `src/components/adventure/CaseScrollDebrief.tsx`：判詞、CS-02 圖片及接受／改判選項。
- `src/components/adventure/PauseMenu.tsx`：小／中／大文字設定。
- `src/components/adventure/CutscenePlayer.tsx`、`NarrativeDialogue.tsx`：cutscene sequence 與人物對話顯示。
- `src/narrative/media-manifest.ts`：cutscene、場景圖與人物立繪的素材登錄。
- `src/narrative/state-machine.ts`：第一幕 phase 與初判／改判狀態轉換。
- `src/narrative/persistence.ts`、`types.ts`、`selectors.ts`：存檔相容、nullable 第一幕評分與文字設定。
- `src/i18n/adventure/en.ts`、`zh-TW.ts`：雙語劇情及介面文字。
- `public/adventure/animatics/`、`public/adventure/portraits/`：目前接入的靜圖與人物素材。

## 下一位建議從哪裡開始

1. 先完整玩一次第一幕，確認目前的視覺與互動基準。
2. 先處理上方第一幕 Rate-Before-Reveal 的產品決策衝突；試作版僅供比較，不要移植其中的手寫計分或狀態流程到正式 campaign。
3. 從 CS-02 之後重新核對 `docs/story/master-script.zh-TW.md`、ADR 與 storyboard；第二、三幕已有可玩主流程與 E2E，但 CS-04～CS-14 仍為紙色靜態 fallback，不能視為正式媒體整合已完成。
4. 後續篇章沿用目前基準：寫實靜圖、2D UI、正常文件流、雙語、橫向緊湊配置與舊存檔相容；不要把舊 Three.js prototype 當成新版方向。
5. 上線前補桌面 Safari／Firefox、iPhone Safari 與 Android Chrome 橫向實機驗收；目前通過的是自動化瀏覽器測試，不等同實機驗收。

## 驗證基準

本次工作目錄驗證結果：

- `npm test`：212 passed，6 skipped（31 個測試檔通過、2 個略過）
- `npm run build`：通過，包含 TypeScript 檢查；仍有 Next.js middleware 棄用、Turbopack root 設定警告。
- `npm run test:e2e`：33/33 passed（Playwright 自動化）。
- `git diff --check`：通過。

應用修改完成前至少重跑 `npm test` 與 `npm run build`；使用者流程有變更時也重跑 Playwright。
