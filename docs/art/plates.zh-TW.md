# 場景底圖生成指引｜plate-act1／2／3

> **狀態**：初稿，提示尚未生成驗證。
> **依據**：用途與尺寸見 `style-guide.zh-TW.md` 第 6.5、7 節；第三幕的殿內陳設以 `storyboards/cs-00.zh-TW.md` 第 5 節的 [SET] 為準。

---

## 1. 一張底圖有兩個用途

| 用途 | 要求 |
| :--- | :--- |
| **遊玩背景** | 搜證、分配、揭曉都壓在它上面。底部一排立繪卡、右側定分手冊，所以**下方三分之一與右側要空、要暗**。 |
| **場景參考圖** | CS-01、CS-04、CS-13 的靜圖從它改出來（「Same room as the reference image」）。所以**這個空間裡之後會用到的陳設都要在圖裡**，例如 CS-01 右側的門、CS-04 的兩張客座。 |

兩個用途有一處衝突。過場的構圖規則要求不對稱、有前景，但底圖是介面的背景，要穩、要正。所以底圖**不用 [STILL]，改用 [PLATE]**。兩者的色調句一字不差，只換掉構圖句。

---

## 2. 共用區塊

**[PLATE] 底圖鎖定段**

```text
Photorealistic live-action historical drama film still, China, Ming dynasty, 1570s–1580s. Shot on a full-frame cinema camera, natural motivated lighting, restrained low-saturation color grade, fine film grain. Historically accurate Ming dynasty Han Chinese architecture and furniture. Visible wood grain, wear and dust. An empty room: no people, no figures, no animals. Establishing view from standing eye level, 28mm lens, looking straight into the room, deep focus so the whole room is readable. The lower third of the frame is plain, dark, uncluttered floor with nothing on it. 16:9. No text, captions, signboards, plaques, couplets, logos or watermarks anywhere in the frame.
```

**色調句**：沿用 `storyboards/cs-01-14.zh-TW.md` 第 3 節的 [TONE-1]／[TONE-2]／[TONE-3]，接在 [PLATE] 之後。

**[AVOID-PLATE]**

```text
Avoid: people or silhouettes, legible text or calligraphy, plaques or signboards over the desk, hanging couplets, Qing dynasty decor, modern objects, electric lights, fantasy palace decoration, gold everywhere, wide-angle distortion, bright clutter in the lower part of the frame.
```

---

## 3. 三張底圖

### plate-act1｜金華府衙二堂

**用在**：第一幕全部遊玩畫面；CS-01 S1 的參考圖。

**構圖**：公案在畫面中央偏左、上方三分之一。公案後是一座素面屏風。畫面右側是一扇開著的門，透進柔和的天光（CS-01 周先生從這扇門進來）。地面是舊青磚。

```text
[PLATE]
[TONE-1]
The second hall of a Ming dynasty prefectural yamen in Jinhua, Zhejiang: a modest working hall where the judge reviews cases, not a grand palace. A long dark wooden judge's desk on a low wooden platform, set slightly left of centre in the upper third of the frame. On the desk: an inkstone, a brush rest with brushes, a cylindrical wooden holder of bamboo tallies, and a few stacks of folded files tied with string. Behind the desk, a tall plain folding screen of dark wood and pale paper panels. Dark wooden columns at both sides. On the right side of the room, an open double door lets in soft overcast daylight that falls across the floor. Old grey brick floor, worn smooth.
[AVOID-PLATE]
```

**審圖重點**：沒有匾額與對聯；右側有門與天光；公案上只有文房用品、籤筒與卷宗；下方三分之一是空地。

### plate-act2｜杭州府衙大堂

**用在**：第二幕全部遊玩畫面；CS-04 S1 的參考圖。

**構圖**：比二堂大、比二堂正式。公案在中央上方的高臺上。畫面左右兩側各有一張扶手椅配小茶几，斜放、朝向公案前的空地：左邊是知府的座位，右邊是呂太監的座位。椅子都是空的。

```text
[PLATE]
[TONE-2]
The main hall of a Ming dynasty prefectural yamen in Hangzhou in winter: larger and more formal than a side hall. A long dark wooden judge's desk on a raised platform two steps high, centred in the upper third of the frame, with a tall carved wooden screen behind it. On the far left and far right of the hall, one empty wooden armchair each with a small tea table beside it, both chairs angled inward toward the open floor in front of the desk. Tall lattice doors along one side let in cold overcast daylight; a faint haze of silk fluff in the air. Dark red-brown columns, grey stone floor.
[AVOID-PLATE]
```

**審圖重點**：兩張椅子都空著、斜放，不是正對鏡頭並排；沒有匾額（「明鏡高懸」之類一律不要）；色調偏冷灰。

### plate-act3｜文華殿

**用在**：第三幕全部遊玩畫面；CS-13 S1 的參考圖；CS-09 的鼎也在這個殿裡。

**一定要和 CS-00 是同一個殿。** 所以優先用改圖，不要從文字重新生成。

**作法 A（優先）：從 CS-00 改。** 從 `Cutscene 0 Demo.mp4` 截一張看得到最多殿內陳設的畫面（A2 的起始畫面最合適），上傳到 Nano Banana，用下面的改圖提示：

```text
Edit the reference image. Keep the same hall exactly: the same columns, floor, windows, dais, throne, desk, gilded screen, two braziers and lighting.
Remove every person from the hall. Move the camera to stand in the middle of the central aisle at standing eye level, looking straight down the aisle at the throne: the throne and the gilded screen in the upper third of the frame, the steps below them, one brazier on either side of the foot of the steps. The lower third of the frame is empty dark polished floor.
Keep the same photographic style and color grade. No text, no plaques.
```

**作法 B（作法 A 失敗時）：從文字生成**，把 `cs-00.zh-TW.md` 第 5 節的 [SET] 整段貼在中間：

```text
[PLATE]
[TONE-3]
[SET]
The hall is empty. Seen straight down the central aisle: the throne and the gilded screen in the upper third of the frame, the steps leading down from the dais, one brazier on either side of the foot of the steps.
[AVOID-PLATE]
```

**審圖重點**：與 CS-00 並排比對，柱子顏色、地面反光、屏風、炭盆數量（恰好兩個）都一致；殿內沒有人；御案上兩支蠟燭。

---

## 4. 從底圖改出過場靜圖

CS-01 S1、CS-04 S1、CS-13 S1 的提示都以「Same room as the reference image」開頭。操作時：

1. **上傳底圖當參考圖**。畫面裡有角色時，另外上傳該角色的 Flow Character 臉部圖與身體圖。
2. **在提示裡寫明換角度**（分鏡已寫好鏡頭與機位）。底圖是正面，過場是斜角，模型需要被明確告知。
3. **一張圖最多加兩個人**。要三個人（CS-04）時，先加兩個坐著的人，再以那張圖為參考加上前景的程衡。
4. **換角度後陳設走樣**時，先把底圖裁成需要的那一角，再請模型往外延伸畫面，比直接換角度穩定。

**選做：側角參考圖**。若同一個場景會出現多張斜角畫面，可以先從底圖改出一張「同一個房間、從右前方斜看、無人」的圖，核准後當第二張參考圖。每張底圖最多一張側角圖，檔名加 `-alt`，只放 `docs/art/refs/`，不進遊戲。

---

## 5. 檔案與尺寸

| 項目 | 規格 |
| :--- | :--- |
| 遊戲用 | 2560×1440 JPEG，`public/adventure/plates/plate-actN.jpg` |
| 生成原檔與淘汰稿 | `docs/art/refs/plates/` |

Nano Banana 輸出的尺寸若不是 2560×1440，等比放大或裁切到這個尺寸。裁切時從上方或左右裁，不要裁掉下方的空地。

**順序**：先做 `plate-act1`，核准後（Gate 0B）再做另外兩張。`plate-act3` 可以和 act1 同時做，因為它的標準已經由 CS-00 定好。
