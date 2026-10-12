# 《定分止爭錄》角色設定集

> **用途**：固定每個角色的外貌、服裝、個性與言行，並提供在 Google Flow 建立 Characters 所需的素材，讓角色在所有過場與立繪中保持一致。
> **依據**：劇情以 `docs/story/master-script.zh-TW.md` 為準；影像規則見 `style-guide.zh-TW.md`。
> **狀態**：第一版，尚未經過生成驗證。試產後依實際結果修訂固定描述。

---

## 使用方式

### 建立一個 Flow Character 的步驟

依 2026 年 10 月的 Flow 介面：角色由「臉」「身體」「語音」三部分組成，已沒有為同一角色另外生成多角度視圖的功能。

1. **臉**：在 Characters 新增角色，用「臉部模板」加上該角色的固定描述，生成臉部圖。多生成幾張，挑最符合「外貌」欄的一張。
2. **製作身體**：用「製作身體提示表」裡該角色的那一則提示。這一步決定服裝，是全劇服裝一致的來源，所以提示只寫體態與穿著，不寫臉。
3. **選取語音**：只有會開口的角色需要。依「語音設定表」從範例語音中挑一個，再把「自訂風格」欄的文字貼到右側。
4. **名字**填角色代號；若有角色資訊欄，貼上固定描述。
5. 之後每一次生成有這個角色的畫面，除了選用該 Character，**提示裡仍然原封不動貼上固定描述**。措辭不要改寫——同一件衣服換個說法，模型可能當成另一件。

**因為沒有多角度視圖**，側面與背面只能靠固定描述撐住。建好角色後，先生成一段讓他慢慢轉身的測試片段，確認側面的帽子、鬍鬚、補子都對，再開始做正式過場。

我沒有看過這一版介面，以上是依你的描述與搜尋到的教學整理的。若「製作身體」實際上的輸入方式不同（例如不接受長提示），請告訴我，我再調整提示的寫法。

### 臉部模板

```text
Photorealistic character reference portrait, head and shoulders, facing the camera, neutral expression. Plain mid-grey seamless studio backdrop, soft even lighting, 85mm lens, sharp focus on the face, real skin texture. Historically accurate Ming dynasty clothing. No text. [固定描述]
```

### 製作身體提示表

每一則都接在這句共用開頭之後：

```text
Full body, standing straight, front view, arms relaxed at the sides, plain mid-grey backdrop, soft even lighting. Historically accurate Ming dynasty clothing.
```

| 代號 | 製作身體提示 |
| :--- | :--- |
| `cheng-heng` | `Slim build, medium height, narrow shoulders. Black gauze wushamao cap with two flat oval wings extending horizontally from the back. Deep indigo-blue round-collar robe with wide sleeves, a square embroidered badge of two mandarin ducks on the chest, thin white inner collar, plain silver-plaque belt worn loose, black cloth boots. Cuffs worn pale.` |
| `cheng-heng-elder` | `Thin, slightly stooped elderly build. White hair in a topknot under a black horsehair net cap, no hat. Plain undyed grey-white cotton cross-collar robe with wide sleeves, dark cloth sash, cloth shoes.` |
| `wanli` | `Slightly plump young build. Black gauze yishan crown with two wings standing upright at the back. Bright yellow round-collar narrow-sleeved robe with four gold-embroidered coiled dragon roundels on chest, back and both shoulders, white inner collar, jade-plaque belt, black boots.` |
| `zhang-juzheng` | `Tall, upright build. Black gauze wushamao cap with two flat oval wings extending horizontally from the back. Scarlet round-collar robe with wide sleeves, a square embroidered badge of a white crane among clouds on the chest, thin white inner collar, jade-plaque belt, black boots. Very long beard reaching the chest.` |
| `zhou` | `Short, slightly stooped build. Black square-topped soft scholar's cap. Faded grey-brown cotton cross-collar robe with wide sleeves, ink stains at the cuffs, cloth shoes. Holding a bundle of paper files tied with cloth tape.` |
| `qi-jiguang` | `Stocky, broad-shouldered build, medium height. Topknot under a black horsehair net cap, no helmet. Dark navy sleeveless knee-length brigandine coat studded with rows of small brass rivets over a dull red narrow-sleeved robe, wide leather belt, black military boots. No weapon.` |
| `feng-bao` | `Medium height, slightly plump build. Black rounded eunuch's cap with a raised back and no side wings. Bright red silk round-collar robe with wide sleeves, a large gold four-clawed python embroidered across chest and shoulders, jade-plaque belt, black boots. Dark wooden prayer beads wound around the right hand.` |
| `chen-shouye` | `Short, sinewy build, sun-browned skin. Topknot under a black horsehair net cap. Undyed coarse hemp cross-collar short jacket with sleeves rolled to the elbows, matching trousers rolled to the knees, barefoot. Conical bamboo hat hanging on the back.` |
| `chen-congzheng` | `Lean, tall, soldierly posture, stiff left leg, leaning on a reddish-brown wooden crutch under the left arm. Topknot under a black horsehair net cap. Faded brick-red quilted cotton military jacket with cross collar and patched elbows, dark trousers, cloth leg wraps, straw sandals.` |
| `pei-boqian` | `Portly build, chin raised. Black six-panel round skullcap. Dark brown silk cross-collar long robe with a subtle gold-thread pattern, silk cord at the waist, jade thumb ring on the right hand, satin shoes.` |
| `pei-zhongwen` | `Thin build, narrow shoulders. Black square-topped soft scholar's cap. Pale blue wide-sleeved scholar's robe with broad dark borders at collar, cuffs and hem, dark silk cord at the waist, cloth shoes. Holding a rolled book.` |
| `xue-shoucheng` | `Lean build, strong forearms, fingertips stained dark indigo. Topknot under a black horsehair net cap. Washed-out pale blue cotton cross-collar long robe with close-fitting sleeves, cloth sash, cloth shoes.` |
| `prefect` | `Small, thin build, hunched shoulders. Black gauze wushamao cap with two flat oval wings extending horizontally from the back. Scarlet round-collar robe with wide sleeves, slightly too large, a square embroidered badge of a wild goose among clouds on the chest, plain gold-plaque belt, black boots. Clutching a creased document.` |
| `eunuch-lyu` | `Thin build. Black rounded eunuch's cap with a raised back and no side wings. Plain dark plum-purple cross-collar robe with fine pleats below the waist, no embroidery, black belt, black boots. Holding a white porcelain lidded tea bowl.` |
| `chen-elder` | `Frail, stooped elderly build, leaning on a bamboo cane. Black cloth cap. Dark blue-black cotton cross-collar long robe, cloth shoes. Long white beard.` |

跨幕的變化（程衡第三幕的短鬚、戚繼光邊關的披風與佩刀）不另建角色，在該鏡頭的提示裡加一句即可。

### 語音設定表

只列會開口的角色。範例語音的名稱我無法預先得知，所以寫的是挑選方向；選定後請把語音名稱補進最後一欄，之後才能重現。

| 代號 | 從範例語音中挑 | 自訂風格（貼到右側欄位） | 選定的語音 |
| :--- | :--- | :--- | :--- |
| `cheng-heng` | 年輕男聲，中音，清亮，不帶播音腔 | `說標準國語。語速偏慢，平穩，句子短，尾音不上揚。冷靜、認真，不卑不亢，沒有情緒起伏。` | 待填 |
| `cheng-heng-elder` | 老年男聲，偏低，溫和，略帶沙啞 | `說標準國語。語速慢，停頓多，像對晚輩交代往事。平靜、清明，沒有感慨的腔調。適合長時間旁白。` | 待填 |
| `wanli` | 年輕男聲，偏輕，偏平 | `說標準國語。聲音很輕，語速慢，完全沒有起伏，從不提高音量。聽不出喜怒，冷靜而壓抑。` | 待填 |
| `zhang-juzheng` | 中老年男聲，低沉，厚實 | `說標準國語。語速偏慢，咬字清楚，每個字都有重量。嚴厲、從容，不容反駁。` | 待填 |
| `feng-bao`（備用） | 中年男聲，偏高，柔軟 | `說標準國語。輕聲細語，不疾不徐，帶著笑意但沒有溫度。不要誇張的尖細。` | 待填 |

若自訂風格欄用英文效果較好，對應的英文是：語速 slow／measured，語氣 calm／flat／stern／gentle，並加上 `speaks Mandarin Chinese`。

老年程衡要念全劇旁白。若 Flow 的語音只能用在生成的影片裡、不能單獨輸出長段旁白，旁白就得另找配音工具，屆時以這裡的風格描述為準。

### 通則

- **臉孔一律原創**，不參照任何在世或已故的演員。歷史人物只取傳世畫像上的大特徵。
- **固定描述只寫「這個人長什麼樣、穿什麼」**，不寫場景、動作、情緒。那些屬於每個鏡頭自己的提示。
- **明代的「青」是深藍**，英文一律寫 deep indigo-blue，不寫 green 或 cyan。
- **官帽**統一寫法：*black gauze wushamao cap with two flat oval wings extending horizontally from the back*。

### 角色總表

| 代號 | 角色 | 級別 | 聲音 | 出現的過場 | 出現的幕 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `cheng-heng` | 程衡（青年） | A | 要 | CS-00、01、04、05、07、08、13 | 全部 |
| `cheng-heng-elder` | 程衡（老年） | A | 要（旁白） | CS-14；全劇旁白 | — |
| `wanli` | 萬曆帝 | A | 要 | CS-00、07、13 | 三 |
| `zhang-juzheng` | 張居正 | A | 要 | CS-00、06、07、08、10 | 三 |
| `zhou` | 周先生 | B | 不要 | CS-01、04 | 全部 |
| `qi-jiguang` | 戚繼光 | B | 不要 | CS-00、06、11 | 三 |
| `feng-bao` | 馮保 | B | 不要（見風格指南 5.4） | CS-00、06、07、12 | 三 |
| `chen-shouye` | 陳守業 | B | 不要 | CS-02；故人短景 | 一 |
| `chen-congzheng` | 陳從征 | B | 不要 | CS-03；故人短景 | 一 |
| `pei-boqian` | 裴伯謙 | B | 不要 | 故人短景 | 二 |
| `pei-zhongwen` | 裴仲文 | B | 不要 | 故人短景 | 二 |
| `xue-shoucheng` | 薛守成 | B | 不要 | CS-05；故人短景 | 二 |
| `prefect` | 杭州知府 | B | 不要 | CS-04、05 | 二 |
| `eunuch-lyu` | 呂太監 | B | 不要 | CS-04、05、06 | 二 |
| `chen-elder` | 陳老太公 | C | 不要 | — | 一 |

級別：A 會在過場開口；B 在過場出現但不開口；C 只需要立繪。

---

## A 級

### 程衡（青年）｜`cheng-heng`

**1. 身分與戲份**
主角，玩家扮演。徽州休寧商籍出身的進士，字秉均。第一幕二十八歲（金華府推官），第二幕三十三歲（杭州府推官），第三幕三十四歲（戶科給事中）。虛構人物。

**2. 外貌**
清瘦，中等身高，肩窄。臉型偏長，顴骨略高，眉毛平直，眼神專注而不銳利——看人像在看一本帳。膚色偏淺的小麥色。手指細長，右手拇指與食指有撥算珠磨出的薄繭。
最好認的特徵：**全場唯一穿深藍官袍的人**，在一片紅袍之間一眼可辨。

**3. 服裝**
烏紗帽；深藍色圓領大袖袍；胸前方形補子繡一對鸂鶒（七品文官）；白色內襯交領露出一線；素銀腰帶，鬆鬆地掛在腰間；黑色布靴。袍子乾淨，但袖口磨得發白。全劇不換。
- 第一幕：無鬚。
- 第二幕：無鬚，冬天在袍外加一件深灰色披風。
- 第三幕：唇上蓄短鬚，其餘不變。

**4. 隨身物**
- **舊戥子**：稱銀子的小桿秤，桿長約一尺，深色木桿磨得發亮，配一只小銅盤。父親的遺物。
- **十三檔算盤**：烏木框，上二下五珠，其中一顆珠子遺失，用紅繩打結補上。

**5. 個性**
沉靜、較真、不卑不亢、有一點書呆子氣。
他相信：人會爭，是因為沒有人把帳算給兩邊看。

**6. 言行舉止**
- 站姿端正但不僵硬；跪著的時候背也是直的。
- 聽人說話從不插嘴，垂著眼，手指在袖中無聲地撥算。
- 開口前有一個固定動作：把戥子從袖中取出，輕輕擱在案上。
- 說話慢，句子短，不用形容詞。對皇帝與對農夫是同一種語氣。
- 緊張時不會提高聲音，反而更慢。
- 幾乎不笑；真正鬆一口氣時，只是肩膀放下來。

**7. 聲音**
男聲，中音偏清亮，語速偏慢，平穩，尾音不上揚。年輕但不輕浮。

**8. Flow 建置素材**

固定描述（第一、二幕）：

```text
Cheng Heng: a slim Han Chinese man aged about 28, medium height, narrow shoulders, a long narrow face with slightly high cheekbones, straight eyebrows, calm attentive dark eyes, clean-shaven, light tan skin, hair fully tucked under his hat. He wears Ming dynasty civil official dress: a black gauze wushamao cap with two flat oval wings extending horizontally from the back, a deep indigo-blue round-collar robe with wide sleeves, a square embroidered rank badge on the chest showing a pair of mandarin ducks among waves, a thin white inner collar, a plain silver-plaque belt hanging loosely at the waist, and black cloth boots. The robe is clean but worn pale at the cuffs.
```

第三幕把 `aged about 28` 改為 `aged about 34`、`clean-shaven` 改為 `a short neat moustache`，其餘一字不改。

角色資訊欄：貼上固定描述，另加一句 `Quiet, exact, unhurried. Never smiles broadly. Speaks slowly in short sentences.`

**9. 不可走樣**
- 袍子永遠是深藍，不可變紅、變綠、變黑。
- 補子是一對水鳥，不是鶴、不是龍。
- 帽翅是水平的橢圓形，不是向上翹，也不是長條硬翅。
- 不佩刀、不持扇、不戴眼鏡。

---

### 程衡（老年）｜`cheng-heng-elder`

**1. 身分與戲份**
全劇旁白的聲音；只在隱藏結局 CS-14 露面，地點是徽州休寧老屋的天井。約七十歲，已辭官歸里多年。

**2. 外貌**
與青年程衡是同一張臉老去：臉更瘦，顴骨更明顯，眼角與額頭有深紋，眼神比年輕時柔和。白髮束於頭頂，稀疏的白色長鬚。背微駝，手上有老人斑，手指仍然細長。

**3. 服裝**
黑色網巾束髮，不戴帽；灰白色素布交領道袍，深色布腰帶，布鞋。家居打扮，沒有任何官服的痕跡。

**4. 隨身物**
同一桿戥子、同一把缺珠算盤，並排放在書案上；一冊空白的線裝簿子；一枝筆。

**5. 個性**
平和、清明、不再著急。
他相信：切不開的東西沒有完美的分法，但可以再往前算一步。

**6. 言行舉止**
動作慢而準。寫字前會先把紙撫平。說話像在對一個晚輩交代事情，沒有感慨的腔調。

**7. 聲音**
老年男聲，偏低、溫和、略帶沙啞，語速慢，停頓多。全劇旁白用這個聲音，需要長時間聆聽也不疲乏。

**8. Flow 建置素材**

固定描述：

```text
Cheng Heng as an old man: a thin Han Chinese man aged about 70 with the same long narrow face and slightly high cheekbones, deep lines at the eyes and forehead, gentle dark eyes, white hair tied in a topknot under a black horsehair net cap, a sparse long white beard, age spots on his hands, slightly stooped back. He wears a plain undyed grey-white cotton cross-collar robe with wide sleeves, a dark cloth sash and cloth shoes. No hat, no official insignia.
```

**9. 不可走樣**
- 必須看得出是同一個人老了，不是另一個老人。
- 不穿官服，不戴烏紗帽。

---

### 萬曆帝 朱翊鈞｜`wanli`

**1. 身分與戲份**
明神宗，十九歲，在位第九年。第三幕的裁決者；序幕與結局戊有開口台詞。

**2. 外貌**
年輕，臉圓而飽滿，體態微胖，膚色白，像很少曬到太陽。唇上有剛長出來、幾乎看不清的淡鬚。眼皮略厚，眼神沒有起伏，讓人看不出他在想什麼。
最好認的特徵：**全場唯一的黃色**，以及那張過分平靜的年輕的臉。

**3. 服裝**
烏紗翼善冠（黑色，冠後兩片帽翅向上豎起）；明黃色圓領窄袖袍，胸、背、兩肩各一個金線盤龍團紋；玉帶；黑靴。這是皇帝的常服，不是戴冕旒的大禮服。

**4. 隨身物**
無。面前的御案上有筆、硃砂硯與一疊奏章。

**5. 個性**
寡言、敏感、壓抑、正在學著不信任任何人。
他相信：這三個人說的都是實話，所以三個人都不能全信。

**6. 言行舉止**
- 坐得很正，幾乎不動；右手始終平按在御案上。
- 唯一的小動作是食指在案面上輕敲一下——那代表他做了決定。
- 說話聲音輕，從不提高；越不高興越輕。
- 看人時不轉頭，只轉眼睛。
- 對張居正稱「張先生」，對馮保稱「大伴」，對戚繼光稱「戚少保」。

**7. 聲音**
年輕男聲，偏輕、偏平，語速慢，沒有情緒起伏。不是威嚴，是冷靜。

**8. Flow 建置素材**

固定描述：

```text
The Wanli Emperor: a Han Chinese man aged 19 with a soft round full face, slightly plump build, pale skin, a faint barely visible moustache, heavy-lidded impassive dark eyes. He wears Ming dynasty imperial everyday dress: a black gauze yishan crown whose two wings stand upright at the back, a bright yellow round-collar narrow-sleeved robe with four gold-embroidered coiled dragon roundels on the chest, back and both shoulders, a white inner collar, a jade-plaque belt and black boots.
```

角色資訊欄另加：`Sits very still, right hand flat on the desk. Speaks softly and evenly, never raises his voice.`

**9. 不可走樣**
- 袍子是黃色，不是紅色或金色鎧甲。
- 不戴前後垂珠簾的冕冠。
- 不可蓄明顯的鬍鬚，不可看起來超過二十五歲。

---

### 張居正｜`zhang-juzheng`

**1. 身分與戲份**
內閣首輔，五十七歲，掌權第十年。第三幕的三家之一（外朝／文官）；提拔程衡的人。CS-06、CS-08 有開口台詞。

**2. 外貌**
身材高，站得筆直。長方臉，眼窩深，目光嚴厲，眉間有常年皺眉留下的豎紋。面色略顯疲倦——他已經帶病工作。
最好認的特徵：**一把長及胸口的濃密長鬚**，黑中夾灰，梳理得一絲不亂。

**3. 服裝**
烏紗帽；緋紅色圓領大袖袍；胸前方形補子繡雲中白鶴（一品文官）；玉帶；黑靴。衣料厚重，沒有一道多餘的摺痕。

**4. 隨身物**
手持一份奏疏；書案上有一本厚冊（考成簿）與硃筆。

**5. 個性**
剛強、精明、自負、對事不對人——但記得每一個人。
他相信：沒有錢，什麼都是空話；而錢必須握在算得清帳的人手裡。

**6. 言行舉止**
- 走路快，停下時很穩。
- 說話不疾不徐，每句話都像已經想過三遍。
- 習慣動作：思考時用右手順一下長鬚；下決定時用筆在冊子上畫一個圈。
- 經過人身邊說話時不轉頭。
- 極少笑。CS-08 那一聲笑是全劇唯一一次。

**7. 聲音**
男聲，低沉、厚、有重量，語速偏慢，咬字清楚。

**8. Flow 建置素材**

固定描述：

```text
Zhang Juzheng: a tall Han Chinese man aged 57 with an upright bearing, a long rectangular face, deep-set stern dark eyes, a vertical frown line between the brows, slightly tired complexion, and a very long full beard reaching his chest, black streaked with grey and neatly combed. He wears Ming dynasty civil official dress: a black gauze wushamao cap with two flat oval wings extending horizontally from the back, a scarlet round-collar robe with wide sleeves, a square embroidered rank badge on the chest showing a white crane among clouds, a thin white inner collar, a jade-plaque belt and black boots.
```

角色資訊欄另加：`Severe, deliberate, rarely smiles. Strokes his beard when thinking.`

**9. 不可走樣**
- 長鬚是他的辨識關鍵，不可變短或消失。
- 補子是白鶴，不是龍或蟒。
- 與杭州知府同穿紅袍，靠長鬚、身高與補子區分。

---

## B 級

### 周先生｜`zhou`

**1. 身分與戲份**
程衡的幕賓（私人聘用的文書顧問），五十餘歲的老刑名。三幕皆隨行；在遊戲中是系統提示的聲音。虛構人物。

**2. 外貌**
個子不高，微駝，圓臉，花白的山羊鬚。眼角的笑紋很深，眼神精明又帶點看熱鬧的興味。
最好認的特徵：**山羊鬚與總是抱在懷裡的一疊卷宗**。

**3. 服裝**
黑色四方平定巾（方頂的軟帽）；褪色的灰褐色交領道袍，袖口有墨漬；布鞋。沒有任何官服標記——他不是官。

**4. 隨身物**
一疊用布條捆著的卷宗；一把舊摺扇，講解時當指示棒用。

**5. 個性**
嘴碎、心細、世故、護短。
他相信：道理要說成人話才有用。

**6. 言行舉止**
- 走在程衡側後方半步。
- 說話前先「大人——」拖一聲。
- 講解時用摺扇指著東西，一樣一樣數。
- 聽到不公道的事會咂一下嘴。
- 在高官面前立刻收聲，退到柱子後面。

**7. 聲音**
過場中不開口。若日後為遊戲內提示配音：中年偏老的男聲，略帶沙啞，語速中等，像在講故事。

**8. Flow 建置素材**

固定描述：

```text
Master Zhou: a short, slightly stooped Han Chinese man in his mid fifties with a round face, a greying goatee, deep laugh lines at the eyes and a shrewd, amused expression. He wears a black square-topped soft scholar's cap, a faded grey-brown cotton cross-collar robe with wide sleeves and ink stains at the cuffs, and cloth shoes. He carries a bundle of paper case files tied with cloth tape and a worn folding fan. No official insignia.
```

**9. 不可走樣**
- 不穿官服，不戴烏紗帽。
- 不可比程衡高。

---

### 戚繼光｜`qi-jiguang`

**1. 身分與戲份**
薊鎮總兵官，五十四歲，鎮守長城十四年。第三幕的三家之一（薊鎮／邊軍）；記得程衡的人。

**2. 外貌**
中等身高，肩寬背厚，像一塊石頭。方臉，皮膚被風沙曬得黝黑粗糙，短而硬的花白鬍鬚。眼睛不大，看人很直。
最好認的特徵：**全場唯一穿戎服、不穿寬袖袍的人**；左眉有一道舊疤（設計上的辨識記號，非史實）。

**3. 服裝**
戎服：深藏青色的無袖長罩甲，布面上釘著成排的小銅釘；內穿暗紅色窄袖袍；寬皮帶；黑色戰靴。不戴頭盔，黑色網巾束髮。
- 文華殿內：如上，不佩刀。
- 邊關（CS-06、CS-11）：加一件深色披風，腰間佩刀。

設計說明：史實上武官入殿應穿官服，但那樣他與張居正、馮保同為紅袍，玩家難以分辨。採用戎服是戲劇上的取捨。

**4. 隨身物**
佩刀（僅邊關場景）；一封字跡歪斜的舊信，夾在兵書裡。

**5. 個性**
直率、沉穩、護兵、對朝堂的彎彎繞繞沒有耐心。
他相信：仗打起來的時候，不能回頭問第二個人。

**6. 言行舉止**
- 站著時雙腳分開與肩同寬，雙手自然垂放或背在身後。
- 話少而直，說完就停，不補充。
- 對文官的長篇大論會微微偏開視線。
- 對士兵說話會壓低聲音，像怕吵醒誰。

**7. 聲音**
過場中不開口。設定上是粗啞有力的男聲，帶山東口音的硬朗。

**8. Flow 建置素材**

固定描述：

```text
Qi Jiguang: a stocky, broad-shouldered Han Chinese man aged 54 of medium height, with a square weathered sun-darkened face, a short stiff grizzled beard, small direct dark eyes and a faint old scar through his left eyebrow. Hair in a topknot under a black horsehair net cap, no helmet. He wears Ming dynasty military dress: a dark navy sleeveless knee-length brigandine coat studded with rows of small brass rivets, worn over a dull red narrow-sleeved robe, a wide leather belt and black military boots.
```

邊關場景在末尾加：`He also wears a dark wool cloak and a sheathed sabre at his waist.`

**9. 不可走樣**
- 不穿全套鐵甲、不戴頭盔。
- 不可比張居正高或瘦。
- 文華殿內不佩刀。

---

### 馮保｜`feng-bao`

**1. 身分與戲份**
司禮監掌印太監兼提督東廠，約五十歲。皇帝稱他「大伴」。第三幕的三家之一（內廷／宮裡）；聽說過程衡的人。

**2. 外貌**
中等身材，微胖，面白無鬚，皮膚光滑得不像這個年紀。嘴角習慣性地帶著一點笑，但眼睛不笑。手白而軟，保養得很好。
最好認的特徵：**無鬚的臉與一串不離手的佛珠**。

**3. 服裝**
黑色內官帽（圓頂、後部隆起，兩側沒有帽翅）；大紅色蟒袍——紅色絲綢圓領袍，胸前與兩肩有大幅金線繡的四爪蟒紋；玉帶；黑靴。全場最華麗的一身。

**4. 隨身物**
一串深色木質佛珠，繞在右手上。

**5. 個性**
圓滑、細心、記仇、極度忠於皇帝本人。
他相信：萬歲爺身邊，總得有一雙只替他看的眼睛。

**6. 言行舉止**
- 走路沒有聲音，站立時微微躬身。
- 說話輕聲細語，自稱「奴婢」（對皇帝）或「咱家」（對其他人）。
- 高興與不高興都在笑；不高興時笑容會一點一點收起來。
- 生氣時不說話，只是一顆一顆地數佛珠。
- 會替皇帝整理衣角、蓋毯子，動作自然得像家人。

**7. 聲音**
過場中預設不開口。設定上是偏高、柔軟、不疾不徐的男聲，不要誇張的尖細。

**8. Flow 建置素材**

固定描述：

```text
Feng Bao: a Han Chinese palace eunuch aged about 50 of medium height and slightly plump build, with a smooth pale beardless face, a habitual faint smile that does not reach his cool dark eyes, and soft well-kept hands. He wears a black rounded eunuch's cap with a raised back and no side wings, a bright red silk round-collar robe with wide sleeves embroidered with a large gold four-clawed python across the chest and shoulders, a jade-plaque belt and black boots. A string of dark wooden prayer beads is wound around his right hand.
```

**9. 不可走樣**
- 絕對無鬚。
- 帽子沒有兩側帽翅（與文官區分）。
- 袍上是金蟒，底色大紅；不可變成黃袍。

---

### 陳守業｜`chen-shouye`

**1. 身分與戲份**
第一幕的兄長，四十出頭，義烏農夫，一家七口靠二十畝田吃飯。虛構人物。

**2. 外貌**
矮而結實，筋肉分明，皮膚曬成深褐色，臉上皺紋深。手腳粗大，指甲縫裡有洗不掉的泥。
最好認的特徵：**赤腳，褲管捲到膝蓋**。

**3. 服裝**
黑色網巾束髮；未染色的粗麻短衫，交領，袖子捲到手肘；同質地的褲子，褲管捲到膝蓋；赤腳。背後掛一頂竹斗笠。

**4. 隨身物**
竹斗笠；田間場景有一把秧苗。

**5. 個性**
寡言、固執、顧家、不擅長替自己說話。
他相信：田在，一家人就餓不死。

**6. 言行舉止**
- 在官面前不敢抬頭，雙手不知道放哪裡，會搓衣角。
- 說話短，一句一停。
- 絕望時不吵，蹲下去抱著頭。
- 高興時也只是抬頭看一眼。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
Chen Shouye: a short, sinewy Han Chinese farmer in his early forties with deeply sun-browned skin, a lined face, large rough hands and dirt under his fingernails. Hair in a topknot under a black horsehair net cap. He wears an undyed coarse hemp cross-collar short jacket with the sleeves rolled to the elbows, matching trousers rolled up to the knees, and is barefoot. A conical woven bamboo hat hangs on his back.
```

**9. 不可走樣**
- 不穿鞋。
- 衣服是未染的粗麻本色，不是白色絲綢。

---

### 陳從征｜`chen-congzheng`

**1. 身分與戲份**
第一幕的弟弟，三十五歲，戚家軍退伍的鳥銃手，在薊鎮凍壞了左腿。他寄往薊鎮的信，是戚繼光記得程衡的原因。虛構人物。

**2. 外貌**
比哥哥高，精瘦，站姿仍有軍人的樣子。臉上有短鬍渣，右頰有一小片火藥燒灼留下的暗色疤痕。左腿僵直。
最好認的特徵：**左腋下一根棗紅色的木拐，與一件褪色的紅色舊軍襖**。

**3. 服裝**
黑色網巾束髮；褪成磚紅色的舊棉軍襖，交領，肘部有補丁；深色褲子，小腿纏布綁腿；草鞋。

**4. 隨身物**
棗木拐杖，握把處磨得發亮。

**5. 個性**
爽直、要強、重情義、嘴上不饒人。
他相信：有手藝就餓不死，不想靠哥哥養。

**6. 言行舉止**
- 說話大聲、直接，會拍自己的左腿當佐證。
- 不滿時把拐杖往地上一頓。
- 站著時重心在右腿，卻不肯坐下。
- 寫字用左手壓紙、右手握筆，字跡歪斜。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
Chen Congzheng: a lean Han Chinese army veteran aged 35, taller than average, with a soldier's upright posture, short stubble, and a small dark powder-burn scar on his right cheek. His left leg is stiff and he leans on a reddish-brown wooden crutch under his left arm. Hair in a topknot under a black horsehair net cap. He wears a faded brick-red quilted cotton military jacket with a cross collar and patched elbows, dark trousers, cloth leg wraps and straw sandals.
```

**9. 不可走樣**
- 拐杖永遠在左邊。
- 軍襖是褪色的紅，不是鮮紅，也不是鎧甲。

---

### 裴伯謙｜`pei-boqian`

**1. 身分與戲份**
第二幕的長子，約四十五歲，杭州機戶裴家的長房。虛構人物。

**2. 外貌**
身材發福，臉闊而多肉，唇上兩撇細鬚。下巴習慣性地微微抬起，看人時眼睛往下。
最好認的特徵：**一身帶金線花紋的錦袍與抬著的下巴**。

**3. 服裝**
黑色六瓣小帽；深褐色絲綢交領長袍，織有金線暗花；腰間絲絛；右手拇指戴一枚玉扳指；緞面鞋。

**4. 隨身物**
玉扳指。

**5. 個性**
倨傲、守舊、好面子、並非壞人。
他相信：祖產不能流到外姓手裡，這是長子的本分。

**6. 言行舉止**
- 雙手背在身後或攏在袖中。
- 說話慢條斯理，提到妹夫時只稱「他」或「姓薛的」。
- 不滿時轉動拇指上的扳指。
- 被說中時會清一下喉嚨。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
Pei Boqian: a portly Han Chinese merchant aged about 45 with a broad fleshy face, a thin two-part moustache, and a chin held slightly raised. He wears a black six-panel round skullcap, a dark brown silk cross-collar long robe woven with a subtle gold-thread pattern, a silk cord at the waist, a jade thumb ring on his right hand and satin shoes.
```

**9. 不可走樣**
- 不穿官服，沒有補子與烏紗帽。

---

### 裴仲文｜`pei-zhongwen`

**1. 身分與戲份**
第二幕的次子，二十八歲，新中舉人，開春要進京會試。虛構人物。

**2. 外貌**
瘦，膚色蒼白，肩膀單薄，眼下有熬夜讀書的青影。神情認真而略帶焦慮。右手中指有墨漬。
最好認的特徵：**淡藍色的儒衫與方巾**。

**3. 服裝**
黑色方巾；淡藍色寬袖襴衫，領、袖、下襬鑲深色寬邊；深色絲絛；布鞋。

**4. 隨身物**
一卷書，習慣性地握在手裡。

**5. 個性**
認真、自尊心強、不通世務、容易臉紅。
他相信：等自己考上了，全家都會好起來。

**6. 言行舉止**
- 自稱「學生」，說話引經據典，句子偏長。
- 激動時聲音發顫、眼眶泛紅。
- 緊張時把書卷握得更緊。
- 對機房的事一無所知，也不掩飾。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
Pei Zhongwen: a thin, pale Han Chinese scholar aged 28 with narrow shoulders, faint dark circles under earnest anxious eyes, and an ink stain on the middle finger of his right hand. He wears a black square-topped soft scholar's cap, a pale blue wide-sleeved scholar's robe trimmed with broad dark borders at the collar, cuffs and hem, a dark silk cord at the waist and cloth shoes. He holds a rolled book.
```

**9. 不可走樣**
- 與周先生同戴方巾，靠年齡、膚色與淡藍色衣服區分。

---

### 薛守成｜`xue-shoucheng`

**1. 身分與戲份**
第二幕的贅婿，約四十二歲，替岳父掌管機房二十年。CS-05 機房開動時出現。虛構人物。

**2. 外貌**
清瘦，沉靜，前臂結實。臉上沒有多餘的表情。
最好認的特徵：**十根手指的指尖都染著洗不掉的靛青色**。

**3. 服裝**
黑色網巾束髮；洗得發白的藍色棉布交領長袍，袖子便於工作地略收；布腰帶；布鞋。

**4. 隨身物**
一張摺好的文書（岳父按了指印的分家文書），收在懷裡。

**5. 個性**
隱忍、務實、話少、有底線。
他相信：機房是他一張機一張機守下來的。

**6. 言行舉止**
- 站在兩位少爺的後方半步，從不搶先開口。
- 說話平靜、不帶情緒，只陳述事實。
- 憤怒時不喊冤，把文書慢慢摺好收回懷裡。
- 在織機旁會不自覺伸手去試絲線的鬆緊。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
Xue Shoucheng: a lean, quiet Han Chinese weaver-foreman aged about 42 with strong forearms, a composed unreadable face, and all ten fingertips permanently stained dark indigo blue. Hair in a topknot under a black horsehair net cap. He wears a washed-out pale blue cotton cross-collar long robe with close-fitting sleeves, a cloth sash and cloth shoes.
```

**9. 不可走樣**
- 指尖的靛青必須看得見。
- 袍子是洗白的淺藍棉布，不可與程衡的深藍官袍混淆。

---

### 杭州知府｜`prefect`

**1. 身分與戲份**
杭州府的長官，約五十歲，正四品。第二幕催辦之人之一，被清丈期限逼得焦頭爛額。虛構人物，不具名。

**2. 外貌**
瘦小，肩膀內縮，短而稀疏的鬍鬚，額上常有薄汗。眼神游移。
最好認的特徵：**紅袍穿在他身上顯得太大，手裡總捏著一份公文**。

**3. 服裝**
烏紗帽；緋紅色圓領大袖袍；胸前補子繡雲雁（四品文官）；素金腰帶；黑靴。

**4. 隨身物**
一份蓋著大印的公文，捏得起皺。

**5. 個性**
謹小慎微、怕事、其實不壞。
他相信：只要期限內交得出去，什麼都好說。

**6. 言行舉止**
- 坐不住，不時用袖口擦額頭。
- 說話快，句尾常回到「期限」。
- 對呂太監陪笑，對程衡催促。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
The Prefect of Hangzhou: a small, thin Han Chinese man aged about 50 with hunched narrow shoulders, a short sparse beard, a faint sheen of sweat on his forehead and restless eyes. He wears Ming dynasty civil official dress: a black gauze wushamao cap with two flat oval wings extending horizontally from the back, a scarlet round-collar robe with wide sleeves that looks slightly too large for him, a square embroidered rank badge on the chest showing a wild goose among clouds, a plain gold-plaque belt and black boots. He clutches a creased official document.
```

**9. 不可走樣**
- 鬍鬚短而稀疏，不可與張居正的長鬚相似。

---

### 呂太監｜`eunuch-lyu`

**1. 身分與戲份**
杭州織造局的管事太監，約四十歲。第二幕催辦之人之一；他的回報讓馮保知道了程衡。虛構人物。

**2. 外貌**
瘦，面色偏黃，無鬚，眼皮半垂，神情懶散而不耐。手指修長。
最好認的特徵：**無鬚、深色袍服，手裡總端著一只茶盞**。

**3. 服裝**
黑色內官帽（與馮保同式，無帽翅）；深絳紫色素面交領袍，腰下有細褶；黑色腰帶；黑靴。比馮保樸素得多，沒有任何繡紋。

**4. 隨身物**
一只白瓷蓋碗茶盞。

**5. 個性**
傲慢、懶散、只關心交差、懂得拿上頭壓人。
他相信：外頭的事與他無關，宮裡的差事誤不得。

**6. 言行舉止**
- 斜靠在椅上，用碗蓋慢慢撥茶沫，說話不看人。
- 自稱「咱家」，語氣慢而帶刺。
- 不高興時把茶盞重重一擱。
- 離開前會回頭看人一眼，不說話。

**7. 聲音**
過場中不開口。

**8. Flow 建置素材**

固定描述：

```text
Eunuch Lyu: a thin Han Chinese eunuch aged about 40 with a sallow beardless face, half-lowered eyelids, a languid impatient expression and long fingers. He wears a black rounded eunuch's cap with a raised back and no side wings, a plain dark plum-purple cross-collar robe with fine pleats below the waist and no embroidery, a black belt and black boots. He holds a white porcelain lidded tea bowl.
```

**9. 不可走樣**
- 無鬚。
- 袍子素面無繡，不可穿紅色蟒袍（那是馮保）。

---

## C 級

### 陳老太公｜`chen-elder`

**1. 身分與戲份**
第一幕的陳氏族長，七十多歲。只在遊玩中以立繪出現，只有一種表情。虛構人物。

**2. 外貌與服裝**
瘦弱，背駝，長長的白鬍鬚，眼神渾濁而和善。黑色布帽；深藍黑色棉布交領長袍；布鞋；拄一根竹杖。

**3. 個性與言行**
和氣、糊塗、只認律條。說話慢，反覆同一句「律上寫著均分」，說完會看看左右，等人附和。

**4. 立繪用固定描述**

```text
Elder Chen: a frail, stooped Han Chinese village elder in his late seventies with a long white beard and kind, cloudy eyes. He wears a black cloth cap, a dark blue-black cotton cross-collar long robe and cloth shoes, and leans on a bamboo cane.
```

---

## 容易混淆的組合

生成多人畫面時特別檢查：

| 組合 | 相同之處 | 靠什麼區分 |
| :--- | :--- | :--- |
| 張居正／杭州知府 | 紅袍、烏紗帽 | 張：高、長鬚、白鶴補子；知府：瘦小、短鬚、雲雁補子。兩人不同幕，不會同框 |
| 張居正／馮保 | 紅色袍服 | 馮：無鬚、無帽翅、金蟒；張：長鬚、有帽翅、方形補子 |
| 馮保／呂太監 | 無鬚、同式帽 | 馮：大紅金蟒、微胖；呂：絳紫素面、瘦 |
| 程衡／薛守成 | 藍色衣服 | 程：深藍官袍、烏紗帽、補子；薛：洗白的淺藍布袍、網巾、靛青指尖 |
| 周先生／裴仲文 | 方巾 | 周：五十多歲、灰褐袍、山羊鬚；裴：年輕蒼白、淡藍襴衫 |
| 陳守業／陳從征 | 兄弟，臉型相近 | 兄：矮、赤腳、粗麻衣；弟：高、拐杖、褪紅軍襖 |

第三幕文華殿四人同框時的色彩：黃（皇帝）、紅配長鬚（張）、藏青戎服（戚）、紅配金蟒無鬚（馮）、深藍（程衡，跪於最遠處）。

---

## 待確認事項

- **馮保的年齡**：設定為約五十歲，是為了戲劇效果的估計，未查證其確切生年。
- **戚繼光左眉的疤、陳從征右頰的火藥疤**：皆為方便辨識而加的設計，非史實。
- **各角色的語音**：等試產時在 Flow 實際試聽後，把選定的範例語音名稱補進「語音設定表」最後一欄。
- **「製作身體」的實際行為**：提示表是依「以簡短提示生成全身」的理解寫的，尚未實測它能接受多長、多細的描述。
- **固定描述的有效性**：所有英文描述尚未實際生成過。試產程衡與萬曆帝後，依結果修訂其餘角色的寫法。
