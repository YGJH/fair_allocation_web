# 第一幕實作交接

## 目前狀態

這一輪的內容／美術重點是 **第一組開場 cutscene（CS-01）與其後的第一幕初判／判詞流程**；CS-00 只維持既有播放方式。第二、三幕沒有新增篇章內容或做完整媒體整合，目前只是保留既有功能，另有共用橫向版面與相容性調整。

本機入口：

- `http://localhost:3000/zh-TW/adventure`
- `http://localhost:3000/en/adventure`

## 已完成的第一幕流程

1. CS-00 維持原播放方式。
2. 第一幕標題頁右側顯示 `cs-01-s1.jpg`。
3. 第一幕介紹頁右側顯示 `cs-01-s2.jpg`，保留周先生完整對話與「義烏縣 上控」。
4. 搜證、估值、分配與「鎖定初判」整合在同一個 Case Desk。
5. 點人物或原判即記錄線索，不再需要「已紀錄」按鈕。
6. 鎖定初判後直接進判詞，不再顯示第一幕公平直覺評分。
7. 判詞頁直接顯示 `cs-02-s1.jpg`，並在同頁選擇接受初判或改判一次。
8. 小／中／大文字設定會寫入存檔。

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
2. 從 CS-02 之後重新核對 `docs/story/master-script.zh-TW.md`、ADR 與 storyboard；不要假設後續篇章已完成內容或媒體整合。
3. 後續篇章沿用目前基準：寫實靜圖、2D UI、正常文件流、雙語、橫向緊湊配置與舊存檔相容。
4. 不要把舊 Three.js prototype 當成新版方向。

## 驗證基準

目前最後一次結果：

- `npm test`：207 passed，6 skipped
- `npx tsc --noEmit`：通過
- `npm run build`：通過
- `npm run test:e2e`：28/28 passed

應用修改完成前至少重跑 `npm test` 與 `npm run build`；使用者流程有變更時也重跑 Playwright。
