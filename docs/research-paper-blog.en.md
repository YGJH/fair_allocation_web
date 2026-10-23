# When the cake cannot be cut: From EF1 and NSW to fairness at every step

_When resources cannot be divided freely, how should we decide who receives what?_

---

When two children want the same cake, an adult may say, “One cuts; the other chooses first.” The cutter has a reason to be careful, while the chooser can protect their own interest.

The rule works because cake can be cut. A house, computer, or course seat cannot. The hardest part of fair allocation often begins with indivisibility.

## I. When goods can be divided

In 1948, mathematician Hugo Steinhaus gave a systematic treatment of cake cutting in _The Problem of Fair Division_, an important starting point for modern fair-division research.[^1]

Divide-and-choose does not require people to share the same preferences, yet each can secure at least half of the value by their own judgment. At a larger scale, Fisher markets use budgets and prices to coordinate demand for divisible goods. The Eisenberg–Gale optimization formulation later became a central tool for studying these equilibria.[^2]

Indivisible goods, however, must be assigned whole to one person, so many elegant tools from continuous markets no longer apply directly.

## II. When goods cannot be divided: EF1, EFX, and NSW

Indivisible goods do not always admit an exactly envy-free allocation. Exact envy-freeness requires every person $i$ to believe, for every person $j$, that

$$
v_i(A_i)\geq v_i(A_j),
$$

but such an allocation may not exist with indivisible goods.

### EF1 and EFX

In 2004, Lipton, Markakis, Mossel, and Saberi developed an approximate-fairness idea closely related to EF1. Budish formally named and popularized envy-free up to one good in 2011.[^3][^4]

EF1 requires that even if $i$ envies $j$, there is some good $g$ in $j$’s bundle such that

$$
v_i(A_i)\geq v_i(A_j\setminus\{g\}).
$$

No item is actually removed. The test asks whether the envy can be attributed to one indivisible good. For nonnegative additive valuations, EF1 allocations always exist and can be found efficiently.

EFX is stronger: envy must disappear after removing any positively valued good from the envied bundle, not merely some suitable good. Existence is known for up to three agents. Whether a complete EFX allocation always exists for four agents with general additive valuations remains open.[^5]

### NSW: One score for efficiency and balance

Nash social welfare, or NSW, traces its central idea to John Nash’s 1950 work on bargaining.[^6] For an allocation $A$, it is usually defined as

$$
\operatorname{NSW}(A)
=\left(\prod_{i=1}^{n}v_i(A_i)\right)^{1/n}.
$$

If Alice and Bob receive values 12 and 3, their NSW is 6. A split of 8 and 7 has the same total value of 15 but a higher NSW of about 7.48. Multiplication prevents one person’s high value from completely hiding another person’s low value.

In a 2016 conference version, Caragiannis and coauthors proved that with indivisible goods and additive valuations, a maximum-NSW allocation is both EF1 and Pareto optimal. The full journal version appeared in 2019.[^7]

> This site sometimes displays the Nash product, $\prod_i v_i(A_i)$, directly. With a fixed number of agents, maximizing the product and maximizing its geometric mean select the same allocations; only the scale differs.

## III. Why is NSW difficult to maximize?

Allocating $m$ goods among $n$ agents creates $n^m$ candidate allocations. Moving one indivisible good can change both the envy relationships and the NSW score.

For general additive valuations, maximizing NSW is NP-hard. Lee proved in 2017 that it is APX-hard.[^8] The difficulty is therefore not limited to finding the exact optimum; there are also theoretical limits on arbitrarily close polynomial-time approximation.

Our paper narrows the setting to **identical additive valuations**: everyone gives the same value to each good, so the remaining task is to balance a commonly agreed total value. Even then, deciding whether there is an EF1 allocation satisfying

$$
\operatorname{NSW}(A)\geq T
$$

is strongly NP-complete.[^9]

A maximum-NSW allocation is already EF1. The fairness constraint does not block the optimum; finding the best balance was difficult to begin with.

## IV. What does our paper contribute?

_EF1-Constrained Nash Social Welfare with Identical Additive Valuations: Complexity, Guarantees, and Experiments_ asks: if an allocation is EF1, how much NSW must it guarantee?

### Smaller goods bring EF1 closer to optimal NSW

With identical additive valuations and a positive optimal NSW, every EF1 allocation is known to achieve at least

$$
e^{-1/e}\approx0.6922
$$

of the optimum. This is a worst-case guarantee, not a typical prediction.

The paper proves stronger results:

- If every good has the same value, every EF1 allocation is NSW-optimal
- If the largest item value $\Delta$ is small relative to the average share $\mu$, with $\Delta\leq\varepsilon\mu$, every EF1 allocation approaches optimal NSW

For a fixed number of agents, as $\varepsilon$ approaches zero, the approximation ratio satisfies

$$
\rho_n(\varepsilon)=1-O(\varepsilon^2).
$$

One extremely valuable item can create a large imbalance. When each item is small, EF1 more strongly constrains the total bundle values to remain close.

### Fairness at every step, not only at the end

Jobs and supplies often arrive one at a time. A final allocation may be EF1 even if the process remains unbalanced for a long period. The paper therefore studies **prefix-wise EF1**: after every assignment, the allocation formed so far must satisfy EF1.

PriorityNet trains a policy with Proximal Policy Optimization (PPO) and uses prospective EF1 action masking. It first removes actions that would violate EF1, then lets the model choose a high-NSW option among the remaining fair actions.

Fairness is therefore built into the feasible action set. Learning chooses among fair alternatives.

### Experimental results

The paper tests 3,000 instances in each of an offline full-information setting and a random-order online setting, covering 2–20 agents and 5–100 goods.[^9]

| Setting | Mean normalized NSW | Baseline | Win-minus-loss |
| --- | ---: | --- | ---: |
| Offline, full information | 0.9911 | Offline LPT | +27.10% |
| Online, random order | 0.9701 | Least-valued-bundle rule | +17.87% |

Normalized NSW is measured against the ideal upper bound from a perfectly divisible equal share. Win-minus-loss is the win rate minus the loss rate in instance-level comparisons, not the percentage increase in NSW.

PriorityNet’s aggregate offline welfare matches LPT to four decimal places. Online, normalized NSW rises modestly from 0.9694 to 0.9701. The careful conclusion is that PriorityNet guarantees EF1 at every step while staying close to the ideal welfare upper bound over the tested range.

## V. Real-world applications

The same structure appears in many settings:

- **Courses and seats**: Students have different preferences, and every class has limited capacity
- **Jobs and computing resources**: Tasks arrive over time, and the process should not consistently disadvantage one person or machine
- **Public supplies**: Medical equipment, shared spaces, and emergency goods cannot always be divided

Mathematics cannot decide who is more deserving. It can state clearly what a rule guarantees, what it sacrifices, and which criterion produced a disputed result.

## VI. Does mathematical fairness feel fair?

Suppose two people both value a mansion at 100 and a bucket at 1. Alice receives the mansion; Bob receives the bucket.

Bob clearly envies Alice. Yet after removing Alice’s only item for the EF1 comparison, her bundle is worth 0. Bob’s bucket is worth 1, so this highly unequal allocation still satisfies EF1.

EF1 says that envy can be attributed to one indivisible good. It does not say that the two people are equally well off.

Pareto optimality can also be permissive. If Alice receives every good and values each one positively, transferring anything to Bob makes Alice worse off. “Alice takes everything” may therefore be Pareto optimal, but that does not make the outcome equal or acceptable.

These examples do not make the definitions useless. They show that each captures only one part of fairness. Human judgment may also care about need, prior ownership, transparency, and whether inequality accumulates over time.

That is why this site asks visitors for an intuitive judgment before revealing EF1, EFX, and NSW. A formula is not the final judge. It is a mirror that helps us see which part of fairness our intuition values.

## Conclusion

Divisible cake allows elegant procedures. Indivisible goods force us to accept approximations. NSW creates a measurable balance between efficiency and equality, while PriorityNet asks every step of the process to preserve EF1.

Our paper draws several boundaries: optimal NSW remains difficult to find, every EF1 allocation has a baseline welfare guarantee, that guarantee approaches optimality as individual goods become small, and fairness can be built directly into a learning system’s feasible actions.

Fair allocation has no single formula. The important task is to explain honestly what a rule protects and which trade-offs it accepts.

## Read the full paper

_EF1-Constrained Nash Social Welfare with Identical Additive Valuations: Complexity, Guarantees, and Experiments_

By Zih-Sian Yang, Yi-Hao Chen, Yu-Te Kuan, Cheng-Jui Wu, Chuang-Chieh Lin, and Po-An Chen

- [Read the abstract and download the paper on arXiv](https://arxiv.org/abs/2609.03846v4)
- [Read the arXiv HTML version](https://arxiv.org/html/2609.03846v4)

## References

[^1]: Steinhaus, H. (1948). “The Problem of Fair Division.” _Econometrica_, 16(1), 101–104. https://www.jstor.org/stable/1914289

[^2]: Eisenberg, E., & Gale, D. (1959). “Consensus of Subjective Probabilities: The Pari-Mutuel Method.” _The Annals of Mathematical Statistics_, 30(1), 165–168. https://doi.org/10.1214/aoms/1177706369

[^3]: Lipton, R. J., Markakis, E., Mossel, E., & Saberi, A. (2004). “On Approximately Fair Allocations of Indivisible Goods.” _EC ’04_, 125–131. https://doi.org/10.1145/988772.988792

[^4]: Budish, E. (2011). “The Combinatorial Assignment Problem: Approximate Competitive Equilibrium from Equal Incomes.” _Journal of Political Economy_, 119(6), 1061–1103. https://doi.org/10.1086/664613

[^5]: Ashuri, A., Gkatzelis, V., & Sgouritsa, A. (2025). “EF2X Exists For Four Agents.” _arXiv:2412.00254v2_. https://arxiv.org/abs/2412.00254v2

[^6]: Nash, J. F. (1950). “The Bargaining Problem.” _Econometrica_, 18(2), 155–162. https://doi.org/10.2307/1907266

[^7]: Caragiannis, I., Kurokawa, D., Moulin, H., Procaccia, A. D., Shah, N., & Wang, J. (2019). “The Unreasonable Fairness of Maximum Nash Welfare.” _ACM Transactions on Economics and Computation_, 7(3), Article 12. https://doi.org/10.1145/3355902

[^8]: Lee, E. (2017). “APX-Hardness of Maximizing Nash Social Welfare with Indivisible Items.” _Information Processing Letters_, 122, 17–20. https://doi.org/10.1016/j.ipl.2017.01.012

[^9]: Yang, Z.-S., Chen, Y.-H., Kuan, Y.-T., Wu, C.-J., Lin, C.-C., & Chen, P.-A. (2026). “EF1-Constrained Nash Social Welfare with Identical Additive Valuations: Complexity, Guarantees, and Experiments.” _arXiv:2609.03846v4_. https://arxiv.org/abs/2609.03846v4
