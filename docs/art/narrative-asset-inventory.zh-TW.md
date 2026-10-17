# 《定分止爭錄》敘事素材盤點（IP-0）

> 狀態：內容 Gate 0A 已通過；美術樣板 Gate 0B 待完成
>
> 更新：2026-10-13
>
> 用途：提供後續 `media-manifest` 的穩定素材 ID、預定路徑、fallback 與核准狀態。本文不重述劇情；事件、對白、數值與結局仍以 canonical 文件為準。

## 1. 權威來源與欄位定義

內容與命名依下列順序解讀：

1. 劇情、對白、數值、觸發條件：[`docs/story/master-script.zh-TW.md`](../story/master-script.zh-TW.md)
2. 已確認的製作與交付決策：[`docs/plans/narrative-web-game-implementation.zh-TW.md`](../plans/narrative-web-game-implementation.zh-TW.md)
3. 視覺、尺寸、表情與角色素材代號：[`docs/art/style-guide.zh-TW.md`](style-guide.zh-TW.md)、[`docs/art/characters.zh-TW.md`](characters.zh-TW.md)
4. CS-00 鏡頭與疊字參考：[`docs/art/storyboards/cs-00.zh-TW.md`](storyboards/cs-00.zh-TW.md)
5. 名詞：[`GLOSSARY.md`](../../GLOSSARY.md)

`Cutscene 0 Demo.mp4` 是 CS-00 的正式母片。較早的 CS-00 storyboard 只供檢查鏡頭與 safe area，不得據此重新剪輯、調色或覆寫母片。

### 1.1 素材狀態

- `final`：已有核定母素材。若只寫 `final (master only)`，表示 Web derivative 仍不存在。
- `provisional`：已有可審素材，但尚未核准為 runtime 素材。
- `fallback`：已有可交付的靜態替代素材。
- `missing`：工作樹內沒有符合新版規格的素材；文件寫有 fallback 策略不等於已有檔案。

### 1.2 核准狀態

- `approved`：已由產品決策明定可作指定用途。
- `review-pending`：檔案或設計存在，但尚未完成指定審查。
- `blocked`：依 IP-0 順序，在前置樣板核准前不得製作或批次生成。

路徑欄是後續 manifest 應採用的穩定契約；標成 `missing` 的路徑目前不可引用為已存在檔案。過場正式影片可由多個 `{segment}` 組成，命名遵循 `cs-XX-{segment}.mp4`；fallback still 固定為 `cs-XX-fallback.jpg`。

## 2. Cutscene slots（15）

| Asset ID | Canonical 定位（不取代 master script） | 現有來源／狀態 | 預定 runtime 路徑 | Fallback | 核准狀態／工程備註 |
| --- | --- | --- | --- | --- | --- |
| `cs-00` | 文華殿倒敘序幕 | 根目錄 `Cutscene 0 Demo.mp4`（`final`）；Web 衍生素材為 `provisional` | `public/adventure/cutscenes/cs-00.mp4`（`provisional`） | `public/adventure/cutscenes/cs-00-fallback.jpg`（`provisional`）；poster 為 `public/adventure/cutscenes/cs-00-poster.jpg`（`provisional`） | 母片 `approved`；三項正式路徑素材待 runtime／Safari 與 UI safe-area 審查。Timed cues 仍為 `review-pending`。不得依 storyboard 重剪。 |
| `cs-01` | 第一幕開場；見 master script「第一幕／開場」 | 無新版素材；`missing` | `public/adventure/animatics/cs-01/`（`missing`） | `public/adventure/cutscenes/cs-01-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`：先核准 Scene Plate 與四名主要角色標準 Portrait。 |
| `cs-02` | 第一幕收尾；見 master script「第一幕／斷案卷宗」 | 無新版素材；`missing` | `public/adventure/animatics/cs-02/`（`missing`） | `public/adventure/cutscenes/cs-02-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`：不得在樣板核准前批次生成。 |
| `cs-03` | 第一幕幕間；見 master script「第一幕／幕間一」 | 無新版素材；`missing` | `public/adventure/animatics/cs-03/`（`missing`） | `public/adventure/cutscenes/cs-03-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；第一幕垂直切片必需。 |
| `cs-04` | 第二幕開場；見 master script「第二幕／開場」 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-04-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-04-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；後續批次，最低交付為 scene still＋字幕。 |
| `cs-05` | 第二幕收尾；見 master script「第二幕／斷案卷宗」 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-05-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-05-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；後續批次。 |
| `cs-06` | 第二幕幕間「三份文書，一個名字」 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-06-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-06-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；後續批次。 |
| `cs-07` | 第三幕開場「一道命令的四天」 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-07-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-07-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；「擬稿→批准→檢查」三格是 UI 動畫，不列為影片素材。 |
| `cs-08` | 第三幕巧解專屬過場 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-08-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-08-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；觸發條件只取自 master script。 |
| `cs-09` | National Ending 甲 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-09-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-09-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；最低交付為 scene still＋字幕。 |
| `cs-10` | National Ending 乙 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-10-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-10-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；輕／重變體由劇情狀態決定，不建立不同 slot ID。 |
| `cs-11` | National Ending 丙 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-11-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-11-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；輕／重變體由劇情狀態決定。 |
| `cs-12` | National Ending 丁 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-12-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-12-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；輕／重變體由劇情狀態決定。 |
| `cs-13` | National Ending 戊 | 無新版素材；`missing` | `public/adventure/cutscenes/cs-13-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-13-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；最低交付為 scene still＋字幕。 |
| `cs-14` | Hidden Ending | 無新版素材；`missing` | `public/adventure/cutscenes/cs-14-{segment}.mp4`（`missing`） | `public/adventure/cutscenes/cs-14-fallback.jpg`（`missing`）＋canonical 字幕 | `blocked`；觸發條件只取自 master script。 |

ADR-0007（2026-10-15）後，CS-01～CS-14 大多改為 animatic 或對話場，只有 7 段影片（CS-07、CS-09～CS-14）。新增素材的路徑：animatic 靜圖 `public/adventure/animatics/cs-XX/cs-XX-sN.jpg`；影片 `public/adventure/cutscenes/cs-XX-vN.mp4`，其起始畫面 `cs-XX-vN-start.jpg` 兼作 fallback。上表的「預定 runtime 路徑」欄待 manifest 更新時依此調整；逐張清單見 `docs/art/storyboards/cs-01-14.zh-TW.md`。

所有靜態 fallback 都必須沿用同一組 localized timed cues／transcript，並提供繼續操作；它們不是省略敘事文字的捷徑。

## 3. Scene Plates（3）

三張都必須是 2560×1440、16:9、無人物、無畫面內文字；下半部保持暗且簡潔。現存 `public/game/posters/*.webp` 是 1376×768 的舊 Three.js poster，全部是 `legacy/non-candidate`，不得複製、改名或冒充新版 Scene Plate。

| Asset ID | Canonical 規格來源 | 現有來源／狀態 | 預定 runtime 路徑 | Fallback | 核准狀態 |
| --- | --- | --- | --- | --- | --- |
| `plate-act1` | style guide §7.1；第一幕金華府衙二堂 | 無；`missing` | `public/adventure/plates/plate-act1.jpg` | 素材缺件時只能用可讀的紙色介面／場景名稱，不得用舊 3D poster | `blocked`：IP-0 所需的第一張原創 provisional 樣板尚未製作、尚未核准。 |
| `plate-act2` | style guide §7.1；第二幕杭州府衙大堂 | 無；`missing` | `public/adventure/plates/plate-act2.jpg` | 同上 | `blocked`：待 `plate-act1` 樣板核准後再批次製作。 |
| `plate-act3` | style guide §7.1；第三幕文華殿 | 無；`missing` | `public/adventure/plates/plate-act3.jpg` | 同上 | `blocked`：待 `plate-act1` 樣板核准後再批次製作。 |

## 4. 第一幕 Portrait Cards 與 expressions

每張規格為 1024×1536（2:3）寫實半身像、場景暗部虛化背景、不去背、無文字；臉孔必須原創，不模仿演員或現代名人。角色外觀只取自 `characters.zh-TW.md`。缺件時依計畫使用「姓名牌＋剪影」維持可玩性；目前工作樹內也沒有已核准的剪影檔，因此該 fallback 是 UI 政策，不得標成現有素材。

Campaign character ID 與美術檔名 stem 分層：例如 `master-zhou` 對應角色設定集既有 stem `zhou`，避免把產品 ID 漂移到媒體檔名。

| Portrait asset ID | Campaign character ID | 表情 | 現有來源／狀態 | 預定 runtime 路徑 | Fallback | 核准狀態 |
| --- | --- | --- | --- | --- | --- | --- |
| `portrait-cheng-heng-calm` | `cheng-heng` | `calm` | 無；`missing` | `public/adventure/portraits/cheng-heng-calm.jpg` | 姓名牌＋剪影 | `blocked`：四名主要角色標準樣板之一。 |
| `portrait-zhou-calm` | `master-zhou` | `calm` | 無；`missing` | `public/adventure/portraits/zhou-calm.jpg` | 姓名牌＋剪影 | `blocked`：四名主要角色標準樣板之一。 |
| `portrait-zhou-hint` | `master-zhou` | `hint` | 無；`missing` | `public/adventure/portraits/zhou-hint.jpg` | 姓名牌＋剪影 | `blocked`：標準 `calm` 核准前不得生成其他表情。 |
| `portrait-chen-shouye-calm` | `chen-shouye` | `calm` | 無；`missing` | `public/adventure/portraits/chen-shouye-calm.jpg` | 姓名牌＋剪影 | `blocked`：四名主要角色標準樣板之一。 |
| `portrait-chen-shouye-pleased` | `chen-shouye` | `pleased` | 無；`missing` | `public/adventure/portraits/chen-shouye-pleased.jpg` | 姓名牌＋剪影 | `blocked`：標準 `calm` 核准前不得生成其他表情。 |
| `portrait-chen-shouye-aggrieved` | `chen-shouye` | `aggrieved` | 無；`missing` | `public/adventure/portraits/chen-shouye-aggrieved.jpg` | 姓名牌＋剪影 | `blocked`：標準 `calm` 核准前不得生成其他表情。 |
| `portrait-chen-congzheng-calm` | `chen-congzheng` | `calm` | 無；`missing` | `public/adventure/portraits/chen-congzheng-calm.jpg` | 姓名牌＋剪影 | `blocked`：四名主要角色標準樣板之一。 |
| `portrait-chen-congzheng-pleased` | `chen-congzheng` | `pleased` | 無；`missing` | `public/adventure/portraits/chen-congzheng-pleased.jpg` | 姓名牌＋剪影 | `blocked`：標準 `calm` 核准前不得生成其他表情。 |
| `portrait-chen-congzheng-aggrieved` | `chen-congzheng` | `aggrieved` | 無；`missing` | `public/adventure/portraits/chen-congzheng-aggrieved.jpg` | 姓名牌＋剪影 | `blocked`：標準 `calm` 核准前不得生成其他表情。 |
| `portrait-chen-elder-calm` | `chen-elder` | `calm` | 無；`missing` | `public/adventure/portraits/chen-elder-calm.jpg` | 姓名牌＋剪影 | `blocked`：待核心四名標準樣板核准後製作。 |

上述 10 張是第一幕 gameplay inventory。為使全劇需求可逐項核對，style guide §7.2 的其餘 25 張 Portrait Card 如下；目前全部仍缺件，缺件時一律使用姓名牌＋剪影 UI 政策，不把政策誤標成檔案：

| Portrait asset ID | Campaign character ID | 表情 | 預定 runtime 路徑 | 現有來源／狀態 | Fallback |
| --- | --- | --- | --- | --- | --- |
| `portrait-pei-boqian-calm` | `pei-boqian` | `calm` | `public/adventure/portraits/pei-boqian-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-pei-boqian-pleased` | `pei-boqian` | `pleased` | `public/adventure/portraits/pei-boqian-pleased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-pei-boqian-aggrieved` | `pei-boqian` | `aggrieved` | `public/adventure/portraits/pei-boqian-aggrieved.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-pei-zhongwen-calm` | `pei-zhongwen` | `calm` | `public/adventure/portraits/pei-zhongwen-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-pei-zhongwen-pleased` | `pei-zhongwen` | `pleased` | `public/adventure/portraits/pei-zhongwen-pleased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-pei-zhongwen-aggrieved` | `pei-zhongwen` | `aggrieved` | `public/adventure/portraits/pei-zhongwen-aggrieved.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-xue-shoucheng-calm` | `xue-shoucheng` | `calm` | `public/adventure/portraits/xue-shoucheng-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-xue-shoucheng-pleased` | `xue-shoucheng` | `pleased` | `public/adventure/portraits/xue-shoucheng-pleased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-xue-shoucheng-aggrieved` | `xue-shoucheng` | `aggrieved` | `public/adventure/portraits/xue-shoucheng-aggrieved.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-zhang-juzheng-calm` | `zhang-juzheng` | `calm` | `public/adventure/portraits/zhang-juzheng-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-zhang-juzheng-pleased` | `zhang-juzheng` | `pleased` | `public/adventure/portraits/zhang-juzheng-pleased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-zhang-juzheng-aggrieved` | `zhang-juzheng` | `aggrieved` | `public/adventure/portraits/zhang-juzheng-aggrieved.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-qi-jiguang-calm` | `qi-jiguang` | `calm` | `public/adventure/portraits/qi-jiguang-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-qi-jiguang-pleased` | `qi-jiguang` | `pleased` | `public/adventure/portraits/qi-jiguang-pleased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-qi-jiguang-aggrieved` | `qi-jiguang` | `aggrieved` | `public/adventure/portraits/qi-jiguang-aggrieved.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-feng-bao-calm` | `feng-bao` | `calm` | `public/adventure/portraits/feng-bao-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-feng-bao-pleased` | `feng-bao` | `pleased` | `public/adventure/portraits/feng-bao-pleased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-feng-bao-aggrieved` | `feng-bao` | `aggrieved` | `public/adventure/portraits/feng-bao-aggrieved.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-wanli-calm` | `wanli-emperor` | `calm` | `public/adventure/portraits/wanli-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-wanli-displeased` | `wanli-emperor` | `displeased` | `public/adventure/portraits/wanli-displeased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-wanli-approving` | `wanli-emperor` | `approving` | `public/adventure/portraits/wanli-approving.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-prefect-calm` | `prefect` | `calm` | `public/adventure/portraits/prefect-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-prefect-displeased` | `prefect` | `displeased` | `public/adventure/portraits/prefect-displeased.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-eunuch-lyu-calm` | `eunuch-lyu` | `calm` | `public/adventure/portraits/eunuch-lyu-calm.jpg` | 無；`missing` | 姓名牌＋剪影 |
| `portrait-eunuch-lyu-displeased` | `eunuch-lyu` | `displeased` | `public/adventure/portraits/eunuch-lyu-displeased.jpg` | 無；`missing` | 姓名牌＋剪影 |

合計 35 張：第一幕表格 10 張＋本表 25 張，與 style guide §7.2 的分類（24＋3＋4＋2＋1＋1）一致。`public/adventure/plates/` 的三張 Scene Plate 也仍為 `missing`；不得以 `public/game/posters/*.webp` 舊 poster 冒充。

## 5. CS-00 正式 Web 衍生素材（provisional）

IP-3 已從正式母片製作正式路徑的 Web 影片、poster 與 reduced-motion fallback。三項素材已完成檔案層級驗證，狀態為 `provisional`；仍須以目標版本 Safari 及實際 Cutscene UI 完成人工 runtime、暗部與 safe-area 審查。

### 5.1 母片與轉檔紀錄

| 項目 | 值 |
| --- | --- |
| 母片 | 根目錄 `Cutscene 0 Demo.mp4`；44,414,736 bytes；container duration `64.454000s` |
| 母片 SHA-256 | `3759b1b7fa5c0f3b4ce1d30ac8a4631a76b5bea7fac68d1a64361b589de5e8f8`（轉檔前後相同） |
| 母片 video | VP9 Profile 0；2560×1440；`yuv420p`；30 fps；stream duration `64.433312s` |
| 母片 audio | Opus；48 kHz；stereo；stream duration `64.454000s` |
| Web video | H.264 High@4.1；1920×1080；`yuv420p`；30 fps；1,933 frames；stream duration `64.433333s` |
| Web audio | AAC-LC 128 kb/s；48 kHz；stereo；stream duration `64.454000s` |
| 轉檔設定 | `libx264` CRF 25.5、`slow` preset、4 reference frames；Lanczos 縮放；未指定或改造 fps；`+faststart` |

Web MP4 為 18,140,531 bytes（17.30 MiB），SHA-256 為 `00a33cda34ce53979060ba2af80e6e06064f37284c20248690b159ddae6b1f35`。`moov` atom 位於 offset 32，早於 offset 72,127 的 `mdat`。完整音訊／影片 decode 無錯誤；影片與音訊皆從 `0.000000s` 開始，並保留母片的 1,933 個 video frames 與原始聲畫時序。

### 5.2 正式 stills

| 用途 | 母片時間 | 正式檔案 | 尺寸 | 大小 | SHA-256 | 狀態 |
| --- | ---: | --- | ---: | ---: | --- | --- |
| poster | `00:02.000` | `public/adventure/cutscenes/cs-00-poster.jpg` | 1920×1080 | 164,791 bytes | `f79ee027eca6754e04d1c74bc0dc1ef8a4eb71a4bf5d8bb80c928a77da6bbc62` | `provisional`；正式路徑，待 runtime／UI review |
| reduced-motion fallback | `00:31.000` | `public/adventure/cutscenes/cs-00-fallback.jpg` | 1920×1080 | 289,512 bytes | `989579d1b7c4c6f55dc95ae3f92115d53629869636238024982a2f271ab142b3` | `provisional`；正式路徑，待 runtime／UI review |

正式 stills 是由母片指定時間直接抽幀、Lanczos 縮放與 JPEG 編碼所得，未裁切、調色或加字。與已核准來源候選縮放後的 SSIM 分別為 `0.993595` 與 `0.993355`；候選 review artifacts 已在正式檔驗證後移除。`58s` 候選先前因過暗淘汰，衍生 JPEG 仍不存在。

### 5.3 Safe-area 審查筆記

共同要求：背景可 crop-fill，但人物、字幕、地點／人名條與播放、略過、音量控制都必須留在 16:9 safe area；字幕由 UI 疊加，不可再燒字。正式核准前須用實際 Cutscene UI 檢查桌面、橫向小手機及 200% text zoom。本次沒有把 UI overlay 燒入 stills，也未宣稱已完成實機 safe-area 驗證。

- `00:02.000`：開場建立場景，不預先使用末段核心畫面。storyboard 的地點字位於左下；若 runtime 同時放地點條或播放控制，左下可能碰撞。至少預留底部約 15–20% 畫高及左右控制邊界。
- `00:31.000`：位於實測 `00:30.733` scene change 後約 0.267 秒，避開切點本身。審查時須確認中央／下方人物、御案、衣袍或手部不被底部字幕與控制遮住。

兩張正式 stills 仍需以實際 Cutscene UI 檢查 controls/subtitles 疊加後的對比。

## 6. 第一幕非媒體穩定 ID（供 definition／manifest 對接）

本節只固定識別字，不新增或改寫 canonical 劇情。

### 6.1 Characters

| Campaign ID | 名稱 | Portrait stem |
| --- | --- | --- |
| `cheng-heng` | 程衡 | `cheng-heng` |
| `master-zhou` | 周先生 | `zhou` |
| `chen-shouye` | 陳守業 | `chen-shouye` |
| `chen-congzheng` | 陳從征 | `chen-congzheng` |
| `chen-elder` | 陳老太公 | `chen-elder` |

CS-00 的具名角色 ID 為 `wanli-emperor`、`zhang-juzheng`、`qi-jiguang`、`feng-bao`；角色設定集的萬曆帝媒體 stem 保留為 `wanli`。

### 6.2 Divisible Goods

| Good ID | Canonical 名稱 | 工程約束 |
| --- | --- | --- |
| `paddy-field` | 水田 | 10 成；估值只取 master script |
| `oil-tea-hillside` | 油茶山場 | 10 成；估值只取 master script |
| `silver` | 現銀 | 10 成；估值只取 master script |

不得為三種 goods 在 authored content 中各建立十個可見 ID；unit expansion 屬後續 domain adapter 實作。

### 6.3 Clues

| Clue ID | Canonical 節點 | Required 狀態 |
| --- | --- | --- |
| `clue-chen-shouye-valuations` | 陳守業估值 | `required` |
| `clue-chen-congzheng-valuations` | 陳從征估值 | `required` |
| `clue-chen-elder-equal-split` | 陳老太公對原判的說明 | `required` |
| `clue-yiwu-original-ruling` | 義烏縣原判 | `required` |

產品已確認第一幕四個 authored 搜證節點全部 required；第二、三幕另依「允許資訊不足判決」規則定義最低門檻。

### 6.4 Cutscenes

第一幕路徑使用 `cs-00`、`cs-01`、`cs-02`、`cs-03`；其內容位置只取 master script，媒體狀態見第 2 節。

## 7. 內容比對與待核准事項

- 根目錄 `劇本總攬.md` 對 `docs/story/master-script.zh-TW.md`：未發現事件、對白、數值或流程的真正內容差異；根稿的算式空白屬 Markdown／匯出遺失。
- 根目錄 `cutscene0.md` 對 `docs/art/storyboards/cs-00.zh-TW.md`：未發現真正內容差異；storyboard 把同一句台詞拆到多段是呈現切段，不是改寫。
- 因此本次沒有可直接套用的 story proposed diff，也沒有修改 canonical story/spec。
- 產品已確認比對結果，並明示第一幕四項 authored clues 全部 required（見 §6.3）。
- CS-00 storyboard 的 38／66 秒組接方案已被「現有 Demo 是正式母片」的較新決策覆蓋；不得為配合 storyboard 重排母片。Timed cues 必須審 64.454 秒母片後另行定義。

## 8. Gate 0 狀態

### Gate 0A／內容：passed

- 產品確認根目錄作者稿與 canonical docs 沒有真正的事件、對白、數值或流程差異。
- 第一幕穩定 ID 已建立，四項 authored clues 全部 required。
- CS-00 poster 與 reduced-motion fallback 的來源幀已選定。
- 因此 IP-1／IP-2 可開始，不因美術缺件延後規則與 state machine。

### Gate 0B／美術樣板：blocked

1. `plate-act1` 原創 provisional Scene Plate 樣板不存在；舊 `public/game/posters/yamen.webp` 不可替代。
2. 四名主要角色標準 Portrait 樣板 `cheng-heng-calm`、`zhou-calm`、`chen-shouye-calm`、`chen-congzheng-calm` 全部不存在，原創臉型尚未鎖定。
3. CS-01～CS-03 animatic 在樣板核准前仍為 `blocked`；程式先使用可讀的紙色 still 與姓名牌／剪影 fallback。

### IP-3 待辦

1. CS-00 H.264/AAC Web derivative、正式 poster 與正式 fallback 已以 `provisional` 狀態交付；timed cues 尚未製作。
2. CS-00 尚未完成目標版本 Chrome／Firefox／Safari 播放驗證、暗部人工審查及 UI safe-area 審查。
3. Phase 0 的合法 Web 字體載入方式與檔案大小仍未決定。

已滿足的保護條件：根目錄 `Cutscene 0 Demo.mp4` 仍是唯一 CS-00 正式母片；轉檔前後 SHA-256 相同。Web derivative 未重新剪輯、調色、裁切、降噪或改造幀率，母片未被覆寫、刪除或改名。
