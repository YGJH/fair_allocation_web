# 立繪卡生成指引｜Portrait Cards 與表情

> **狀態**：初稿，提示尚未生成驗證。
> **依據**：角色外貌、服裝與固定描述見 `characters.zh-TW.md`；介面版式見 `style-guide.zh-TW.md` 第 6 節；台詞原文見 `docs/story/master-script.zh-TW.md`。
> **取代**：風格指南第 7.2 節原本的「35 張、四分之三側面、不去背」。

---

## 1. 立繪卡用在哪裡

同一張立繪用在四個地方，所以構圖要能裁切、能放大：

| 版式 | 用法 |
| :--- | :--- |
| **單人台詞** | 立繪置中、放大，面向玩家；對話框在下方。對話場（CS-01、CS-04）與搜證時點到某人都用這個。 |
| **兩人對話** | 參考圖二的左右分列：說話的人亮、聽的人略暗。**程衡固定在右側**，對方在左側（CS-08、第三幕程衡回話）。 |
| **立繪卡列** | 搜證畫面底部一排小卡，只裁頭到胸口。 |
| **案台** | 分配時每位當事人一張小卡，表情隨分法即時切換。 |

## 2. 構圖規格

- **半身**：從帽頂上方留一點空，切在腰帶下方。兩片帽翅要完整入鏡。
- **正面，身體只轉約 15 度**，臉朝正前方，**眼睛看鏡頭**。立繪是在對玩家說話，這是唯一允許看鏡頭的素材，過場仍然不行。
- **不要左右翻轉圖片。** 明代衣服是右衽（右襟壓在左襟下、領口斜向右腋）；翻轉後變成左衽，在明代是夷服或壽衣的穿法。補子、佛珠、拐杖的位置也會跑掉。因此姿勢採接近正面，左右兩側都能直接用，不靠翻轉。
- **嘴巴閉著或微開**，不做說話中的嘴型。同一張要能配好幾句台詞。
- **手**：每個角色有固定手勢（見第 5 節），盡量把手放在袖中或拿著東西。手是最容易出錯的地方。
- **背景**：純色中灰，之後去背。

## 3. 生成流程

1. **準備參考圖**。已在 Flow 建好的角色，下載臉部圖與身體圖；還沒建的（第一、二幕的 B、C 級角色），先用角色設定集的「臉部模板」與「製作身體提示表」在 Nano Banana 生成兩張，挑一張臉、一張身體。
2. **生成 `calm`**。上傳兩張參考圖，用 [PORTRAIT] ＋固定描述＋手勢＋ calm 的表情句。多生幾張，挑最像參考圖的一張。
3. **核准 `calm`**。第一幕的程衡、周先生、陳守業、陳從征四張是 Gate 0B 的標準樣板；核准前不生成其他表情。
4. **其他表情一律從 `calm` 改圖**，用 [EXPRESSION-EDIT]，不要從文字重新生成。這樣臉、衣服、光線、構圖都不會變，只換表情。
5. **去背**，輸出透明背景的 PNG（見第 7 節）。
6. **審圖**（見第 8 節）。

## 4. 共用區塊

**[PORTRAIT] 立繪鎖定段**

```text
Photorealistic portrait photograph of a live-action historical drama character, China, Ming dynasty, 1570s–1580s. Waist-up: the frame runs from a little above the top of the hat down to just below the belt, with both wings of the hat fully inside the frame. The person faces the viewer, body turned only slightly, head straight, eyes looking directly into the camera as if speaking to the person in front of him. Plain flat medium-grey seamless studio backdrop with nothing on it. Soft key light from the front left, gentle fill, a subtle rim light separating the hat, hair and shoulders from the backdrop. 85mm lens, everything from hat to belt in sharp focus. Restrained low-saturation color grade, real skin texture, visible fabric weave and wear. Historically accurate Ming dynasty Han Chinese clothing: the robe closes with the right panel over the left, the collar crossing toward the wearer's right armpit. Vertical 2:3. No text, logos or watermarks.
```

**[AVOID-PORTRAIT]**

```text
Avoid: mirrored clothing with the collar crossing the wrong way, cropped hat wings, props or furniture in the background, dramatic shadows across the face, exaggerated grin or shouting, teeth showing, glossy beauty-filter skin, heavy makeup on men, Qing dynasty queue hairstyle or shaved forehead, Qing fur-brimmed hats, Korean gat hats, fantasy costume, anime or illustration style, extra fingers, fused hands.
```

**[EXPRESSION-EDIT] 改表情**（上傳該角色核准的 `calm`）

```text
Edit the reference portrait. Keep everything identical: the same person, face shape, age, hair, beard, hat, clothing, hands, pose, framing, lighting and grey backdrop. Change only the facial expression: [表情句]. The eyes still look into the camera. Keep the change small and natural, as a restrained film actor would play it.
```

**表情句**

表情要小而明確，像歷史正劇的演員，不像遊戲的情緒圖示。

| 代號 | 中文 | 表情句（貼進 [表情句]） |
| :--- | :--- | :--- |
| `calm` | 平靜 | `a composed, neutral face, attentive eyes, mouth closed, as if listening carefully` |
| `pleased` | 滿意 | `the brows relax and the eyes soften, the corners of the mouth ease very slightly upward; no grin, no teeth` |
| `aggrieved` | 不平 | `the jaw tightens, lips pressed together, brows drawn faintly together, a held-back complaint in the eyes` |
| `displeased` | 不悅 | `a cold, hard stillness: the face set, no smile, the eyes steady and unblinking, a faint tension at the jaw; restrained anger, not shouting` |
| `approving` | 認可 | `a faint, controlled look of approval: the chin lifts a little, the eyes steady, the corners of the mouth barely lift` |
| `worried` | 憂慮 | `the brows drawn up and together, uneasy eyes, lips slightly parted as if about to speak in a low voice` |
| `hint` | 提點 | `the eyebrows slightly raised, a knowing half-smile, the look of an old teacher about to point something out` |

**為什麼沒有「大怒」**：萬曆帝在劇本裡從不提高音量（角色設定集），他的怒是 `displeased` 那種冷。全劇沒有人當堂發作；最重的反應是馮保「不笑了，只是把佛珠一顆一顆數過去」。誇張的表情放在寫實照片上也最容易像假人。

## 5. 角色清單

`[代號]` 是角色設定集的固定描述全文。生成 `calm` 時的完整提示是：

```text
[PORTRAIT]
[代號]
Hands: [手勢]
Expression: [calm 的表情句]
[AVOID-PORTRAIT]
```

| 檔名代號 | 角色 | 手勢（貼進 Hands） | 表情 | 張數 |
| :--- | :--- | :--- | :--- | :---: |
| `cheng-heng` | 程衡（第一、二幕） | `both hands folded inside his wide sleeves in front of his waist` | calm | 1 |
| `cheng-heng-act3` | 程衡（第三幕） | 同上 | calm、resolute | 2 |
| `zhou` | 周先生 | `both arms holding a bundle of paper files tied with cloth tape against his chest` | calm、hint（兩張：`hint1`、`hint2`）、worried、pleased | 5 |
| `chen-shouye` | 陳守業 | `his rough, sun-browned hands hang at his sides; sleeves rolled to the elbows` | calm、pleased、aggrieved | 3 |
| `chen-congzheng` | 陳從征 | `a reddish-brown wooden crutch under his left arm, his left hand on its grip, right hand at his side` | calm、pleased、aggrieved | 3 |
| `chen-elder` | 陳老太公 | `both hands resting on top of a bamboo cane held in front of him` | calm | 1 |
| `pei-boqian` | 裴伯謙 | `hands clasped behind his back, chin raised` | calm、pleased、aggrieved | 3 |
| `pei-zhongwen` | 裴仲文 | `both hands holding a rolled book in front of his chest` | calm、pleased、aggrieved | 3 |
| `xue-shoucheng` | 薛守成 | `holding a folded paper document in both hands at his waist; dark indigo-stained fingertips` | calm、pleased、aggrieved | 3 |
| `prefect` | 杭州知府 | `clutching a creased folded document in both hands at his chest` | worried | 1 |
| `eunuch-lyu` | 呂太監 | `holding a white porcelain lidded tea bowl at chest height, one hand on the lid` | calm、displeased | 2 |
| `zhang-juzheng` | 張居正 | `both hands folded inside his wide sleeves in front of his waist` | calm、pleased、aggrieved、displeased | 4 |
| `qi-jiguang` | 戚繼光 | `his right hand resting on his wide leather belt, left arm relaxed` | calm、pleased、aggrieved、displeased | 4 |
| `feng-bao` | 馮保 | `dark wooden prayer beads wound around his right hand, held at chest height` | calm、pleased、aggrieved、displeased | 4 |
| `wanli` | 萬曆帝 | `seated behind a desk, his right hand resting flat on the desk top` | calm、displeased、approving | 3 |
| | | | **合計** | **42** |

### 角色專屬的表情調整

固定的表情句之外，以下角色在 [表情句] 後面再加一句：

| 角色・表情 | 加上 |
| :--- | :--- |
| 程衡・`resolute` | 不在表情句表裡，直接用：`calm and firm, the gaze level and unwavering, mouth closed; quiet certainty, not defiance` |
| 第三幕程衡的 `calm` | 從 `cheng-heng-calm` 改圖，不重新生成：`Add a short neat moustache and make him look about six years older; keep everything else.` |
| 馮保・`calm` | `a faint, polite smile that does not reach the eyes`（他的平靜本來就帶笑） |
| 馮保・`aggrieved` | `the polite smile fading little by little` |
| 馮保・`displeased` | `no smile at all, the eyes half-lowered toward the beads in his hand`（唯一不看鏡頭的表情） |
| 裴伯謙・`calm` | `a haughty, self-assured look, the chin raised` |
| 陳守業・`aggrieved` | `the head lowered, eyes cast down, the jaw clenched`（劇本是蹲下抱頭，半身照改成低頭） |
| 陳從征・`aggrieved` | `a bitter, wry half-smile on one side of the mouth` |
| 薛守成・`aggrieved` | `quiet and withdrawn, eyes lowered, lips pressed thin` |
| 張居正・`pleased` | `a short, almost reluctant smile of recognition`（CS-08 最後一句的「忽然笑了一聲」） |
| 萬曆帝・`calm` | `a young face that shows nothing, quiet and watchful` |

### 第三幕三方的四級表情

三方的表情對應條陳的評定，玩家改分法時即時切換：

| 表情 | 條件 | 劇本依據 |
| :--- | :--- | :--- |
| `pleased` | 不眼紅任何一家 | — |
| `calm` | 尚未呈上條陳 | 搜證陳奏 |
| `aggrieved` | 眼紅某家，但拿掉一件就不眼紅（EF1） | 示範一：馮保「笑容一點點收起來」；示範三：張居正「眉頭動了一下」 |
| `displeased` | 拿掉任何一件都還眼紅（EF1 不成立） | 示範二：馮保「不笑了」 |

## 6. 台詞與立繪對照

只列有台詞的角色。程式端依此在每句台詞旁切換立繪。

| 角色 | 台詞（劇本位置） | 立繪 | 版式 |
| :--- | :--- | :--- | :--- |
| 周先生 | 「大人，這案子有意思……」（CS-01） | `zhou-calm` | 單人 |
| 周先生 | 分秤、我分你選、妒線、找補、和氣值、輪流揀選、去一物的教學 | `zhou-hint1`、`zhou-hint2` 輪替 | 單人 |
| 周先生 | 「田還是那些田……」（第一幕巧解）、示範三的提示 | `zhou-pleased` | 單人 |
| 周先生 | 「大人，這回麻煩了……」（CS-04）、前一夜叮囑、示範二的提示 | `zhou-worried` | 單人 |
| 周先生 | 朝廷三關的說明（CS-07） | 旁白，不用立繪 | — |
| 陳守業 | 搜證陳述 | `chen-shouye-calm` | 單人 |
| 陳從征 | 搜證陳述 | `chen-congzheng-calm` | 單人 |
| 陳從征 | 「我哥拿這銀子做什麼？」「這比縣裡判的還不如！」 | `chen-congzheng-aggrieved` | 卡旁短句 |
| 陳老太公 | 「縣尊判得沒錯呀！」 | `chen-elder-calm` | 單人 |
| 程衡 | 「稱得很準。可惜稱的是東西，不是人。」「這東西劈不得……」 | `cheng-heng-calm` | 單人 |
| 知府 | CS-04 | `prefect-worried` | 單人 |
| 呂太監 | CS-04 | `eunuch-lyu-calm` | 單人 |
| 呂太監 | 「你這一判，是要咱家的命。」 | `eunuch-lyu-displeased` | 卡旁短句 |
| 裴伯謙、裴仲文、薛守成 | 搜證陳述 | 各自 `calm` | 單人 |
| 裴伯謙 | 「他一個外姓，拿得比我這個長房還多！」 | `pei-boqian-aggrieved` | 卡旁短句 |
| 薛守成 | 「明天起，機房不開門了。」 | `xue-shoucheng-aggrieved` | 卡旁短句 |
| 萬曆帝 | 「朕聽說你在杭州……」、搜證、「你們自己說。」 | `wanli-calm` | 單人 |
| 程衡 | 「回陛下，杭州有生絲可以分……」 | `cheng-heng-act3-calm` | 兩人（左：萬曆帝） |
| 萬曆帝 | 「再擬一次。只有一次。」 | `wanli-displeased` | 單人 |
| 張居正、戚繼光、馮保 | 搜證陳奏 | 各自 `calm` | 單人 |
| 張居正、戚繼光、馮保 | 只說給程衡聽的那句 | 各自 `calm`（馮保那句帶笑，`calm` 已含） | 單人 |
| 馮保 | 示範一「奴婢只是……睡不著。」 | `feng-bao-aggrieved` | 單人 |
| 張居正 | CS-08 第一句 | `zhang-juzheng-aggrieved` | 兩人（右：程衡） |
| 程衡 | 「元輔所得最少。三家連乘，所得最多。」 | `cheng-heng-act3-resolute` | 兩人（左：張居正） |
| 張居正 | 「當年老夫在考成簿上圈你……」 | `zhang-juzheng-pleased` | 兩人（右：程衡） |
| 萬曆帝 | 硃批後（依結局） | `wanli-approving`（稱職）／`wanli-displeased`（不稱職） | 單人 |

**周先生的提點有兩張**：`zhou-hint1` 與 `zhou-hint2` 是同一個表情的兩種姿態，刻意保留，讓連續好幾句教學時畫面不會一成不變。規則：同一段對話裡，周先生的提點台詞依出現順序輪替，第 1、3、5… 句用 `hint1`，第 2、4… 句用 `hint2`；每段對話都從 `hint1` 開始。沒有 `zhou-hint` 這個檔名。

## 7. 去背與檔案

- **去背**：Nano Banana 不能直接輸出透明背景，所以統一在中灰背景上生成，再去背。工具任選：Photoshop「移除背景」、Canva、remove.bg；也可以把整批圖交給我用 `rembg` 一次處理。帽翅的黑紗與鬍鬚邊緣最容易被吃掉，去背後要放大檢查。
- **遊戲用**：1024×1536 透明 PNG，`public/adventure/portraits/{代號}-{表情}.png`。
- **原檔**：灰背景的原圖放 `docs/art/refs/portraits/`，之後要改表情或重新去背時從這裡開始。

## 8. 審圖

- [ ] 與角色的 Flow 臉部圖是同一個人；同一角色的各表情之間，臉、衣服、光線、構圖完全相同。
- [ ] 衣領右衽（領口斜向穿者的右腋）。
- [ ] 帽翅完整入鏡；文官帽翅水平，萬曆帝的翅朝上，太監的帽子沒有翅。
- [ ] 眼睛看鏡頭（馮保 `displeased` 除外）。
- [ ] 表情的差別小而看得出來；四張縮成小卡並排時仍分得清。
- [ ] 手指數正確；道具（戥子、拐杖、佛珠、茶碗）在角色設定集指定的那隻手。
- [ ] 背景乾淨，去背後邊緣沒有灰邊或缺角。
