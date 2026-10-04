# Domain Glossary: Fair Allocation & The Art of Scales (均天下)

This glossary defines canonical terms used across the codebase, tests, specifications, and narrative scripts. Agents and developers must use these terms consistently without inventing conflicting synonyms.

---

## 1. Mathematical & Economic Concepts (公平分配核心術語)

### Additive Valuation (可加估值)
The assumption that an agent's total utility for a bundle of items equals the arithmetic sum of their individual valuations for each item in that bundle. Valuations in this system are non-negative integers ($v_i(g) \ge 0$).

### Indivisible Goods (不可分割物品)
Physical or legal goods that cannot be divided or cut into fractional pieces without destroying their fundamental utility (e.g., an antique mirror, a family plaque, a military tally). Contrast with *Divisible Goods*.

### Divisible Goods (可分割物品)
Goods that can be continuously partitioned and shared across multiple agents by arbitrary proportions (e.g., imperial silver bullion, grain reserves).

### Envy (嫉妒)
A situation where an agent $i$ perceives that the bundle assigned to another agent $j$ holds greater total subjective value to $i$ than $i$'s own assigned bundle ($v_i(A_j) > v_i(A_i)$).

### EF (Envy-Freeness / 無嫉妒)
The ideal state where no agent envies any other agent ($v_i(A_i) \ge v_i(A_j)$ for all $i, j$). In the presence of indivisible goods, a completely envy-free allocation often does not exist.

### EF1 (Envy-Free up to One Item / 減一物無嫉妒)
A fundamental relaxation of envy-freeness for indivisible goods. An allocation is EF1 if for every pair of agents $i, j$ where $i$ envies $j$, there exists at least one item $g \in A_j$ such that removing $g$ eliminates the envy ($v_i(A_i) \ge v_i(A_j \setminus \{g\})$). Under non-negative additive valuations, an EF1 allocation is mathematically guaranteed to exist.

### EFX (Envy-Free up to any positively-valued Item / 減任一物無嫉妒)
A stricter standard than EF1. An allocation is EFX if for every pair of agents $i, j$ and for *every* item $g \in A_j$ for which $i$ has positive value ($v_i(g) > 0$), removing $g$ eliminates $i$'s envy ($v_i(A_i) \ge v_i(A_j \setminus \{g\})$). The universal existence of EFX allocations remains one of the premier open problems in fair division.

### Nash Social Welfare / NSW (納許社會福利)
The geometric mean—or equivalently, the exact product—of all agents' utilities:
$$\text{NSW} = \prod_{i=1}^{n} v_i(A_i)$$
NSW balances overall efficiency with fairness because any allocation leaving an essential stakeholder with zero utility collapses the entire product to zero (*The Peril of Zero Utility*).

### Fractional NSW (可分割版本 NSW 上界)
The theoretical optimal NSW obtained when items are relaxed to be continuously divisible across agents. Computed via convex optimization (SciPy solver), serving as a benchmark upper bound.

### Rate-Before-Reveal (先評價、後揭曉)
The pedagogical mechanism requiring the user/player to commit their intuitive fairness judgment (1–5 rating) before any mathematical indicators (EF1, EFX, NSW, ranking) are exposed.

---

## 2. Narrative & World Concepts (歷史劇情與玩法術語)

### The Art of Settled Shares / 定分止爭錄
The overarching narrative adventure campaign educating players on fair allocation through historical point-and-click dilemmas. Named after *The Book of Lord Shang* (《商君書·定分》: "名分定，則私利行不苟；定分止爭，天下自治").

### Judicial Magistrate / Imperial Arbitrator (算學提刑官)
The protagonist role assumed by the player, tasked with resolving disputes through mathematical insight, forensic investigation, and ethical balance.

### Act I: Song Guild Partition (第一幕：大宋紹聖二年 · 汴京彩帛行師徒析產案)
The introductory scenario set in a Northern Song trade guild. Grounded in *The Clear and Bright Collection of Court Decisions* (《名公書判清明集》卷五〈戶婚門 · 分產〉). Focuses on two merchant brothers disputing heirloom goods, teaching subjective valuations, Envy, and EF1.

### Act II: Ming Clan Inheritance Trial (第二幕：明嘉靖三十五年 · 松江府染坊宗祧鬮分案)
The intermediate scenario set in a Ming dynasty prefectural yamen. Grounded in authentic *Huizhou Division Deeds* (《徽州分產鬮書》), Hai Rui's verdicts (《海忠介公判詞》), and *The Great Ming Code* (《大明律·戶律·田宅》). Focuses on three clan heirs fighting over clan estates and watermills, teaching EFX and its potential non-existence.

### Act III: Imperial Council Strategic Compromise (第三幕：明萬曆四年深秋 · 乾清深宮「九邊軍國大計案」)
The climactic scenario set in the midnight war council of the Forbidden City. Grounded in *History of Ming* (《明史·神宗本紀一》, 《明史·張居正傳》, 《明史·戚繼光傳》). Focuses on balancing the actual historical triumvirate—Emperor Shenzong, Grand Secretary Zhang Juzheng, Frontier Commander Qi Jiguang, and Chief Eunuch Feng Bao—teaching Nash Social Welfare, zero-collapse, and fractional bullion compensation.

### Ritual Scales / Allocation Workbench (權衡天平 / 分配案台)
The visual interactive interface where players place contested 3D tokens and assets onto individual stakeholder trays to draft allocations.

### Case Scroll Debrief (斷案卷宗)
The post-verdict reveal screen presenting the mathematical verification report, envy graph, and historical consequences of the ruling.

### Historical Endings (歷史結局矩陣)
The four branching narrative epilogues derived from cumulative player arbitration traits:
1. **Benevolent Prime Minister (萬民太和 · 盛世良相)**: Prioritizes NSW maximization and broad societal harmony.
2. **Strict Legalist (鐵面無私 · 孤高法家)**: Prioritizes absolute EF1/EFX compliance and zero envy.
3. **Cunning Autocrat (權衡偏重 · 梟雄帝業)**: Favors utilitarian concentration of power to dominant factions.
4. **Reclusive Scholar (洞見乾坤 · 算學宗師)**: Recognizes the mathematical limits of indivisible goods and retires to author seminal treatises.

### Master Challenge (巧解挑戰)
The optional pedagogical puzzle unlocked after viewing the Case Scroll Debrief, prompting the player to discover an allocation satisfying the highest formal fairness criteria (EF1 or EFX) without blocking narrative progression.

### Fractional Silver Slider (國庫白銀滑桿)
The continuous interactive control in Act III enabling arbitrary fractional division of state treasury silver bullion, demonstrating real-time Nash Social Welfare curve optimization.
