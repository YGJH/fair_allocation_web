# IP-14 完整素材／Release QA 記錄

更新：2026-10-13

## 自動化結果

- `npm test`：通過，30 個 test files（2 skipped）、203 passed（6 skipped）。新增 Xue-owned／son-owned Act II debrief 條件測試與 CS-00～CS-14 localized fallback key parity 檢查。
- `npm run test:e2e`：通過，28/28；除既有三幕 EFX 結局、CS-00 媒體錯誤 fallback、reduced motion、鍵盤、reload／語系、200% 文字、直向旋轉提示、全螢幕／方向鎖定拒絕與 Ledger／Recall 外，新增 severe CS-12 路線、zero-product CS-13 路線、三枚 Master Seal 解鎖 CS-14、CS-13／CS-14 archive gating，以及完成後 reload。Playwright 設定只有 Chromium；不宣稱 Safari／實機結果。
- `npm run build`：通過。`npx tsc --noEmit`：通過。`git diff --check`：通過。上述命令後已還原 generated `next-env.d.ts`／`tsconfig.tsbuildinfo`。
- `package.json` 沒有 lint、axe 或獨立 accessibility script；沒有額外既有命令可跑。建置僅有 Next package-lock 路徑與 middleware deprecation 警告。
- 新增 manifest parity test：CS-00～CS-14 每一 slot 都有 fallback image/transcript，`en`／`zh-TW` alt 與 transcript key 對齊；CS-00 cues 全在 `0..64.454s`。

## 素材真實狀態

- CS-00 母片 `Cutscene 0 Demo.mp4` 未覆寫：44,414,736 bytes，SHA-256 `3759b1b7fa5c0f3b4ce1d30ac8a4631a76b5bea7fac68d1a64361b589de5e8f8`。Web derivative 為 H.264/AAC、1920×1080、30fps、64.454s container、18,140,531 bytes，SHA-256 `00a33cda34ce53979060ba2af80e6e06064f37284c20248690b159ddae6b1f35`；`moov` 位於 `mdat` 前，fast-start 檢查通過。poster／reduced-motion still 均為 1920×1080。
- CS-00 derivative、poster、fallback 仍是 `provisional`，不是已核准 final。CS-01～CS-14 沒有 final media；manifest 使用 deterministic paper/data-URI fallback 與完整 localized transcript，不假造素材檔。
- Act I–III Scene Plate：3 張（`plate-act1..3`）均 `missing/blocked`；不可用舊 `public/game/posters/*.webp` 冒充。
- Portrait Cards：style guide 要求 35 張（24＋3＋4＋2＋1＋1），inventory 已逐項列出；目前 35 張均 `missing/blocked`，姓名牌＋剪影是 UI fallback policy，不是現有檔案。
- Campaign runtime 沒有 PostgreSQL／server import；CS-00 video 使用 `preload="metadata"`。production build 最大 campaign JS chunk 約 609 KB（整體 chunk 尚有共用 code）；未引入舊 Three.js scene runtime，但 `three` package 仍保留供其他產品面確認。

## 尚待人工／實機檢查

- 目標 Chrome、Firefox、Safari 版本的 CS-00 有聲解碼、暗部、聲畫同步與 fast-start runtime；目前自動化瀏覽器只驗 Chromium。
- 桌面、平板、橫向小手機及 200% text zoom 的實際 safe-area／字幕遮擋／對比；portrait gate、reduced motion、media error、keyboard path 已有自動化覆蓋。
- iPhone／Android 橫向實機、觸控、方向 API 與 fullscreen permission；自動化只驗拒絕與 gate 行為，未宣稱實機成功。
- 最終 Scene Plates、35 Portrait Cards、CS-01～CS-14 approved art/audio 與完整旁白仍待製作／核准；其缺件 fallback 已可繼續遊玩。

## 發行判定與 residual blockers

**未達 release-ready。** 自動化與 fallback 路徑通過，但有兩類 release blocker：

1. **內容／素材 blocker（高）**：CS-00 僅 provisional；3 Scene Plates、35 Portrait Cards、CS-01～CS-14 final media 均缺件。
2. **平台／人工 QA blocker（高）**：Safari／Firefox、iPhone／Android 橫向、實際字幕 safe-area、暗部與聲畫同步尚未驗收。

其餘為非阻擋警告：Next middleware convention deprecated、package-lock 位於 repository 外，以及缺少 lint／axe script。`AGENTS.md`、母片與未追蹤 source media 均保留；建置產生的 `next-env.d.ts`／`tsconfig.tsbuildinfo` 已還原。
