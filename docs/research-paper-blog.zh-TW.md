# 我們有辦法達成公平嗎？

_當資源不能任意切開，我們要怎麼決定誰拿到什麼？_

---

兩個孩子爭一塊蛋糕時，大人常說：「一個人切，另一個人先選。」切的人不敢偏心，選的人也能保護自己的利益。

這個方法之所以有效，是因為蛋糕可以切。如果要分的是房子、電腦或課程名額，事情就沒有那麼簡單。公平分配最困難的地方，往往從「不能切」開始。

## 一、當物品可以切分

1948 年，數學家 Hugo Steinhaus 以 _The Problem of Fair Division_ 系統性討論分蛋糕問題，成為現代公平分配研究的重要起點之一。[^1]

「一人切、一人選」不要求雙方有相同喜好，卻能保證每個人得到自己眼中至少一半的價值。對更大規模的可分割資源，Fisher market 則利用預算與價格協調需求；Eisenberg–Gale 的最佳化形式後來成為研究這類市場均衡的重要工具。[^2]

但不可分割物品必須完整交給某個人，許多連續市場中的漂亮方法也就不能直接套用。

## 二、當物品不能切

不可分割物品未必能產生完全無羨慕的結果。這個標準要求每個人 $i$ 面對任何人 $j$ 時都認為

$$
v_i(A_i)\geq v_i(A_j),
$$

但在不可分割物品下，這種結果未必存在。

### EF1 與 EFX

2004 年，Lipton、Markakis、Mossel 與 Saberi 發展了後來與 EF1 密切相關的近似公平概念；Budish 在 2011 年正式命名並推廣 envy-free up to one good。[^3][^4]

EF1 要求：即使 $i$ 羨慕 $j$，也能從 $j$ 的組合中找到某件物品 $g$，使得

$$
v_i(A_i)\geq v_i(A_j\setminus\{g\}).
$$

我們不是真的把物品拿走，只是在檢查：這段羨慕是否主要來自某一件不可分割物品。對非負加總估值而言，EF1 分配一定存在，而且可以有效率地找到。

EFX 更嚴格：不是移除「某一件」就夠，而是移除任何一件羨慕者重視的物品後，羨慕都要消失。目前三位參與者已有存在性結果；一般四人加總估值下是否一定存在完整 EFX 分配，仍是公開問題。[^5]

### NSW：把效率與均衡放進同一個分數

Nash social welfare（NSW，納許社會福利）的思想來自 John Nash 在 1950 年的談判研究。[^6] 對分配 $A$，NSW 通常定義為

$$
\operatorname{NSW}(A)
=\left(\prod_{i=1}^{n}v_i(A_i)\right)^{1/n}.
$$

如果 Alice 和 Bob 的所得分別是 12 與 3，NSW 是 6；若改成 8 與 7，總和同樣是 15，NSW 卻提高到約 7.48。乘法讓一個人的高分不能完全掩蓋另一個人的低分。

2016 年，Caragiannis 等人的研討會版本證明：對不可分割物品與加總估值，最大 NSW 分配同時符合 EF1 與 Pareto optimality；完整期刊版本於 2019 年發表。[^7]

> 本站有時直接顯示 Nash product，也就是 $\prod_i v_i(A_i)$。在人數固定時，最大化乘積與最大化幾何平均會選出相同分配，只是數值尺度不同。

## 三、為什麼 NSW 很難？

$m$ 件物品分給 $n$ 個人，共有 $n^m$ 種候選分配。不可分割物品每移動一次，都可能同時改變羨慕關係與 NSW。

一般加總估值下，最大化 NSW 是 NP-hard；Lee 在 2017 年進一步證明它是 APX-hard。[^8] 這表示困難不只在找到完全正確的最佳解，連任意逼近最佳解也受到理論限制。

我們的論文把問題縮到**相同加總估值**：所有人對每件物品的分數相同，問題只剩如何把共同認可的價值分得均衡。即使如此，判斷是否存在 EF1 分配使

$$
\operatorname{NSW}(A)\geq T
$$

仍是 strongly NP-complete。[^9]

最大 NSW 分配本來就是 EF1，所以真正困難的不是公平限制擋住最佳解，而是找出最佳平衡本身。

## 四、我們的論文做了什麼？

論文 _EF1-Constrained Nash Social Welfare with Identical Additive Valuations: Complexity, Guarantees, and Experiments_ 問的是：如果一個分配符合 EF1，它的 NSW 至少能保證到什麼程度？

### 物品越小，EF1 越接近最佳 NSW

已知在相同加總估值且最佳 NSW 為正時，任何 EF1 分配至少達到最佳值的

$$
e^{-1/e}\approx0.6922
$$

倍。這是最壞情況的保證，不代表一般結果只有 69.22%。

論文進一步證明：

- 如果每件物品價值相同，每一個 EF1 分配都是 NSW 最佳解
- 如果最大單件價值 $\Delta$ 相對於平均份額 $\mu$ 很小，即 $\Delta\leq\varepsilon\mu$，任意 EF1 分配都會接近最佳 NSW

當參與者人數固定、$\varepsilon$ 趨近 0 時，近似比例滿足

$$
\rho_n(\varepsilon)=1-O(\varepsilon^2).
$$

直覺上，一件極昂貴的物品足以造成巨大落差；單件物品越小，EF1 越能迫使每個人的總價值維持接近。

### 不只最後公平，每一步都公平

現實中的工作或物資常是一件件到達。只保證最後結果 EF1，過程仍可能長期失衡。因此，論文研究 **prefix-wise EF1**：每分配完一件物品，當下的結果都必須符合 EF1。

PriorityNet 使用 Proximal Policy Optimization（PPO）訓練策略，並加入 prospective EF1 action masking。系統會先排除下一步可能破壞 EF1 的選擇，再由模型從剩下的公平動作中尋找較高 NSW 的分配。

公平因此不是模型「學得像不像」，而是直接寫進可行動作；學習負責的是在公平選項中做選擇。

### 實驗結果

論文在離線完整資訊與隨機順序線上情境中各測試 3,000 個實例，涵蓋 2–20 位參與者與 5–100 件物品。[^9]

| 情境 | 平均 normalized NSW | 比較基準 | Win-minus-loss |
| --- | ---: | --- | ---: |
| 離線完整資訊 | 0.9911 | Offline LPT | +27.10% |
| 隨機順序線上 | 0.9701 | Least-valued-bundle rule | +17.87% |

Normalized NSW 是相對於可連續均分時的理想上界。Win-minus-loss 是逐實例比較中的勝率減去敗率，不是 NSW 增加百分比。

PriorityNet 的離線整體福利與 LPT 到小數第四位相同；在線上情境則由 0.9694 小幅提高到 0.9701。較準確的結論是：PriorityNet 能保證每一步 EF1，並在測試範圍中維持接近理想上界的 NSW。

## 五、現實世界的應用

相同問題會出現在許多地方：

- **課程名額**：學生偏好不同，每門課座位有限
- **工作與運算資源**：任務逐一到達，過程不能長期偏向某個人或機器
- **公共物資**：醫療設備、共享空間與救援物資通常不能任意切割

數學模型不能替社會決定誰更值得，但可以說清楚：規則保證了什麼、犧牲了什麼，以及爭議來自哪一個標準。

## 六、數學上的公平，和人心中的公平一樣嗎？

假設兩個人都認為豪宅價值 100、水桶價值 1。Alice 拿豪宅，Bob 拿水桶。

Bob 顯然羨慕 Alice；但在 EF1 檢查中，移除 Alice 唯一的豪宅後，她的組合價值變成 0。Bob 的水桶價值 1，因此這個差距極大的結果仍符合 EF1。

EF1 只表示羨慕可以歸因於一件不可分割物品，不表示兩個人過得一樣好。

Pareto optimality 也可能很寬鬆。如果 Alice 拿走所有物品，而且她對每件物品都有正價值，那麼把任何一件轉給 Bob 都會讓 Alice 變差。因此「一個人拿走全部」也可能是 Pareto optimal，但這不表示結果平等或容易被接受。

這些例子不是要否定數學標準，而是提醒我們：每個定義只照亮公平的一部分。人還會在意需求、所有權、程序是否透明，以及不平等會不會持續累積。

這也是本站先請使用者憑直覺判斷，再揭示 EF1、EFX 與 NSW 的原因。公式不是最後的裁判，而是一面鏡子，讓我們看見自己的公平直覺究竟在乎什麼。

## 結語

可分割的蛋糕讓我們設計漂亮的程序；不可分割物品迫使我們接受近似公平；NSW 在效率與均衡之間建立可計算的尺度；PriorityNet 則要求分配過程的每一步都守住 EF1。

我們的論文畫出幾條界線：最佳 NSW 仍然難找，任意 EF1 已有基本福利保證，物品越小時這個保證越接近最佳值，而公平限制也可以直接放進學習系統的可行動作。

公平分配沒有唯一公式。重要的是誠實說明：我們選擇保護什麼，又願意承擔哪些代價。

## 閱讀完整論文

_EF1-Constrained Nash Social Welfare with Identical Additive Valuations: Complexity, Guarantees, and Experiments_

作者：Zih-Sian Yang、Yi-Hao Chen、Yu-Te Kuan、Cheng-Jui Wu、Chuang-Chieh Lin、Po-An Chen

- [閱讀 arXiv 摘要並下載全文](https://arxiv.org/abs/2609.03846v4)
- [閱讀 arXiv HTML 版本](https://arxiv.org/html/2609.03846v4)

## 參考資料

[^1]: Steinhaus, H. (1948). “The Problem of Fair Division.” _Econometrica_, 16(1), 101–104. <https://www.jstor.org/stable/1914289>

[^2]: Eisenberg, E., & Gale, D. (1959). “Consensus of Subjective Probabilities: The Pari-Mutuel Method.” _The Annals of Mathematical Statistics_, 30(1), 165–168. <https://doi.org/10.1214/aoms/1177706369>

[^3]: Lipton, R. J., Markakis, E., Mossel, E., & Saberi, A. (2004). “On Approximately Fair Allocations of Indivisible Goods.” _EC ’04_, 125–131. <https://doi.org/10.1145/988772.988792>

[^4]: Budish, E. (2011). “The Combinatorial Assignment Problem: Approximate Competitive Equilibrium from Equal Incomes.” _Journal of Political Economy_, 119(6), 1061–1103. <https://doi.org/10.1086/664613>

[^5]: Ashuri, A., Gkatzelis, V., & Sgouritsa, A. (2025). “EF2X Exists For Four Agents.” _arXiv:2412.00254v2_. <https://arxiv.org/abs/2412.00254v2>

[^6]: Nash, J. F. (1950). “The Bargaining Problem.” _Econometrica_, 18(2), 155–162. <https://doi.org/10.2307/1907266>

[^7]: Caragiannis, I., Kurokawa, D., Moulin, H., Procaccia, A. D., Shah, N., & Wang, J. (2019). “The Unreasonable Fairness of Maximum Nash Welfare.” _ACM Transactions on Economics and Computation_, 7(3), Article 12. <https://doi.org/10.1145/3355902>

[^8]: Lee, E. (2017). “APX-Hardness of Maximizing Nash Social Welfare with Indivisible Items.” _Information Processing Letters_, 122, 17–20. <https://doi.org/10.1016/j.ipl.2017.01.012>

[^9]: Yang, Z.-S., Chen, Y.-H., Kuan, Y.-T., Wu, C.-J., Lin, C.-C., & Chen, P.-A. (2026). “EF1-Constrained Nash Social Welfare with Identical Additive Valuations: Complexity, Guarantees, and Experiments.” _arXiv:2609.03846v4_. <https://arxiv.org/abs/2609.03846v4>
