Abstract. We study the allocation of indivisible goods among agents with identical additive valuations,
focusing on envy-freeness up to one good (EF1) and Nash social welfare (NSW). Since every maximum-
NSW allocation is EF1 under additive valuations, the associated threshold problem inherits the known
strong NP-hardness of NSW maximization under identical additive valuations and is strongly NP-complete.
We therefore focus on welfare guarantees satisfied by arbitrary EF1 allocations. Although every such
allocation is known to achieve an e−1/e-approximation to the unrestricted optimal NSW, we identify
conditions yielding stronger guarantees. Under uniform valuations, every EF1 allocation is NSW-optimal.
Under an ε-small-item condition, every EF1 allocation achieves an explicit approximation ratio ρn(ϵ)
satisfying ρn(ε) = 1 − O(ε2) as ε → 0 for fixed n.
We further consider the stronger sequential requirement that EF1 be maintained after every item
assignment. For this setting, we introduce PriorityNet, a deep reinforcement learning framework trained
with Proximal Policy Optimization (PPO) and equipped with prospective EF1 action masking, which
guarantees prefix-wise EF1 by construction. Across 3,000 test instances in each of the offline full-
information and random-order online regimes (n ∈ [2, 20], m ∈ [5, 100]), PriorityNet achieves mean
normalized NSW values of 0.9911 and 0.9701, respectively. Relative to the offline Longest Processing
Time (LPT) heuristic and the online least-valued-bundle rule, it attains instance-wise win-minus-loss
rates of +27.10% and +17.87%. Its aggregate welfare matches the offline LPT baseline to four decimal
places and modestly improves upon the online baseline, from 0.9694 to 0.9701
