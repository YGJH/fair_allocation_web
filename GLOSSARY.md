# Domain Glossary: Fair Allocation & The Art of Settled Shares (定分止爭錄)

This glossary defines canonical terms used across the codebase, tests, specifications, and narrative scripts. Agents and developers must use these terms consistently without inventing conflicting synonyms.

---

## 1. Mathematical & Economic Concepts (公平分配核心術語)

### Additive Valuation (可加估值)
The assumption that an agent's total utility for a bundle of items equals the arithmetic sum of their individual valuations for each item in that bundle. Valuations in this system are non-negative integers ($v_i(g) \ge 0$).

### Indivisible Goods (不可分割物品)
Physical or legal goods that cannot be divided or cut into fractional pieces without destroying their fundamental utility (e.g., a loom workshop with its weaving licence, an imperial writ of authority). Contrast with *Divisible Goods*.

### Divisible Goods (可分割物品)
Goods that can be partitioned and shared across multiple agents by proportion (e.g., paddy fields, silver, raw silk). In the narrative campaign every divisible good is split in tenths (成).

### Proportionality (得其分 / 比例公平)
An allocation in which every agent values their own bundle at no less than $1/n$ of everything ($v_i(A_i) \ge v_i(M)/n$). With two agents it coincides with envy-freeness; with three or more it does not.
_Avoid_: fair share (ambiguous), equal split.

### Envy (嫉妒)
A situation where an agent $i$ perceives that the bundle assigned to another agent $j$ holds greater total subjective value to $i$ than $i$'s own assigned bundle ($v_i(A_j) > v_i(A_i)$).

### EF (Envy-Freeness / 無嫉妒)
The ideal state where no agent envies any other agent ($v_i(A_i) \ge v_i(A_j)$ for all $i, j$). In the presence of indivisible goods, a completely envy-free allocation often does not exist.

### EF1 (Envy-Free up to One Item / 減一物無嫉妒)
A fundamental relaxation of envy-freeness for indivisible goods. An allocation is EF1 if for every pair of agents $i, j$ where $i$ envies $j$, there exists at least one item $g \in A_j$ such that removing $g$ eliminates the envy ($v_i(A_i) \ge v_i(A_j \setminus \{g\})$). Under non-negative additive valuations, an EF1 allocation is mathematically guaranteed to exist.

### EFX (Envy-Free up to any positively-valued Item / 減任一物無嫉妒)
A stricter standard than EF1. An allocation is EFX if for every pair of agents $i, j$ and for *every* item $g \in A_j$ for which $i$ has positive value ($v_i(g) > 0$), removing $g$ eliminates $i$'s envy ($v_i(A_i) \ge v_i(A_j \setminus \{g\})$). The universal existence of EFX allocations remains one of the premier open problems in fair division.

### Nash Social Welfare / NSW (納許社會福利)
The exact product of all agents' utilities:
$$\text{NSW} = \prod_{i=1}^{n} v_i(A_i)$$
NSW balances overall efficiency with fairness because any allocation leaving a party with zero utility collapses the entire product to zero (*Zero Product*). In narrative dialogue it is called the *Harmony Score*.

### Zero Product (零乘積)
An allocation in which at least one agent's utility is zero, so NSW is zero regardless of what the others receive.
_Avoid_: zero-collapse, zero-utility crash.

### Fractional NSW (可分割版本 NSW 上界)
The theoretical optimal NSW obtained when items are relaxed to be continuously divisible across agents. Computed via convex optimization (SciPy solver), serving as a benchmark upper bound in sandbox mode. Not used by the narrative campaign.

### Compensation (找補)
Offsetting the advantage of whoever receives an indivisible good by shifting shares of divisible goods to the other agents.
_Avoid_: side payment, silver reconciliation.

### Cut-and-Choose (我分你選)
The two-agent procedure in which one agent partitions the goods into two bundles and the other picks first. It guarantees proportionality to both without anyone revealing their valuations.

### Round-Robin (輪流揀選)
The procedure in which agents take turns picking their most-valued remaining item in a fixed order until none remain. It always yields an EF1 allocation, and the picking order determines who benefits.
_Avoid_: draft, picking sequence.

### Rate-Before-Reveal (先評價、後揭曉)
The pedagogical mechanism requiring the player to commit their intuitive fairness judgment (1–5 rating) on their *Initial Verdict* before any mathematical indicator is exposed.

---

## 2. Narrative & World Concepts (歷史劇情與玩法術語)

### The Art of Settled Shares / 定分止爭錄
The narrative adventure campaign teaching fair allocation through three connected cases in the Wanli reign of the Ming dynasty (1574–1581). Named after *The Book of Lord Shang* (《商君書·定分》: "名分定，則私利行不苟；定分止爭，天下自治").

### Cheng Heng (程衡，字秉均)
The fictional protagonist played by the player throughout all three acts: an abacus-trained *jinshi* from a Huizhou merchant family who rises from Prefectural Judge to Supervising Secretary.
_Avoid_: 算學提刑官, Judicial Magistrate, Imperial Arbitrator.

### Prefectural Judge (府推官)
Cheng Heng's office in Acts I and II (rank 7a): the official of a prefecture who retries cases appealed from its counties. Addressed as 「大人」 in dialogue.

### Supervising Secretary (戶科給事中)
Cheng Heng's office in Act III (rank 7b): a low-ranking official of the Office of Scrutiny for Revenue who inspects edicts before they are issued and may send them back.

### Send-Back (封駁 / 退回)
A Supervising Secretary's refusal to issue an edict he judges improper. In dialogue it is always phrased as "退回"; the three-stage path of an edict is "擬稿 (票擬) → 批准 (批紅) → 檢查 (六科)".

### Master Zhou (周先生)
Cheng Heng's private secretary, present in all three acts, whose lines serve as the in-fiction system prompts explaining each concept and the next action to the player.
_Avoid_: 師爺.

### The Three Camps (三家)
The parties of Act III. Dialogue calls them 文官, 邊軍, and 宮裡; documentation and tables call them 外朝, 薊鎮, and 內廷. They are led respectively by Zhang Juzheng, Qi Jiguang, and Feng Bao.

### Act I: Yiwu Brothers' Partition (第一幕：萬曆三年春 · 義烏陳氏兄弟析產案)
Two brothers divide three divisible goods after a county ruling that halved everything. Teaches subjective valuation, Proportionality, and Cut-and-Choose.

### Act II: Hangzhou Loom Workshop Partition (第二幕：萬曆八年冬 · 杭州裴氏機房鬮分案)
Three heirs divide three divisible goods and one indivisible workshop under pressure from the land survey and the imperial weaving office. Teaches Envy, the Envy Graph, Compensation, and the Harmony Score.

### Act III: Wenhua Hall Audience (第三幕：萬曆九年冬 · 文華殿歲計召對)
The Three Camps contest six indivisible Writs with nothing left to compensate with. Teaches that EF may not exist, EF1, EFX, Zero Product, and Round-Robin.

### Writ (敕書)
One of the six indivisible grants of authority contested in Act III (符, 鹽, 糧, 火, 市, 織). Each can be held by exactly one camp.
_Avoid_: seal, token, 印信.

### Proposal (定分條陳)
The allocation of the six Writs that Cheng Heng submits to the emperor in Act III. The emperor, not the player, decides; the ending follows from the Proposal's properties.

### Cutscene (過場)
A non-interactive sequence identified by a CS number in the master script. It takes one of three forms: generated video, an animatic of photoreal stills with slow game-side camera moves, or a dialogue scene that opens on a still and plays its lines through Portrait Cards.
_Avoid_: cinematic, FMV, movie.

### Scene Plate (場景底圖)
The photoreal still image of a location that sits behind the interface during gameplay, one per act.
_Avoid_: diorama, 3D scene, background.

### Portrait Card (立繪卡)
The framed photoreal portrait that represents a character during gameplay; clicking it makes the character speak, and its expression changes to show their reaction to the current allocation.
_Avoid_: avatar, sprite, token.

### Allocation Workbench (分配案台)
The interactive interface where the player assigns goods to each party: sliders in tenths for Divisible Goods and drag-and-drop for Indivisible Goods.
_Avoid_: ritual scales.

### Initial Verdict (初判)
The first allocation the player commits in an act, made without any mathematical indicator visible and rated under Rate-Before-Reveal.

### Revision (改判 / 改擬)
The single optional re-allocation allowed after the Case Scroll Debrief, made with the unlocked Tools visible. The result, revised or not, is the *Final Verdict*.

### Final Verdict (定讞)
The allocation that is graded in the Performance Ledger and that determines endings.

### Case Scroll Debrief (斷案卷宗)
The post-verdict reveal presenting the act's indicators and the aggrieved party's reaction.

### Tools (工具)
The three indicators unlocked act by act and shown only during Revision and Master Challenges: the *Share Gauge*, the *Envy Graph*, and the *Remove-One Test*.

### Share Gauge (分秤)
The tool unlocked in Act I showing, for each party, what fraction of everything they believe they received.

### Envy Graph (妒線)
The tool unlocked in Act II drawing a red line from each party to every party they envy.

### Harmony Score (和氣值)
The in-fiction name for NSW, introduced in Act II.

### Remove-One Test (去一物)
The tool unlocked in Act III letting the player remove items one at a time from an envied bundle to see whether envy ends; it is how EF1 ("過得去") and EFX ("穩") are demonstrated.

### Performance Ledger (考成簿)
The in-fiction scoring record. Each act's Final Verdict receives one Grade and may earn a Master Seal.

### Grade (考語)
One of three ratings per act, in ascending order: 不稱職, 平常, 稱職. Thresholds per act are defined in the master script.

### Master Challenge (巧解挑戰)
The optional puzzle after each act's Final Verdict asking for the act's best allocation. It does not block progression.

### Master Seal (「巧」字印)
The mark earned by solving an act's Master Challenge. All three unlock the hidden ending.

### Most Aggrieved Party (最不平者)
In Act III, the camp with the largest envy gap under the Final Verdict; ties go to the camp with lower utility. It selects which grievance ending plays.

### National Ending (國運結局)
One of five outcomes determined solely by the Act III Final Verdict:
1. **鼎足而立**: EFX holds.
2. **江陵之怨**: the Most Aggrieved Party is 外朝.
3. **薊門之怨**: the Most Aggrieved Party is 薊鎮.
4. **大璫之怨**: the Most Aggrieved Party is 內廷.
5. **留中不發**: Zero Product.

Endings 2–4 each have a mild variant (EF1 holds) and a severe variant (EF1 fails).

### Hidden Ending (定分宗師)
The epilogue appended after any National Ending when all three Master Seals are held.
