# 两套系统的对齐 — 演示前必须解决

> 更新 2026-07-09,在看到 Archy 的完整 deck(`rechannel-chief-ds-demo`)之后重写。
> **早先版本的结论作废**:那份文档断言"仓库里没有 FAISS、没有 embedding、没有 Postgres",这对**本仓库**成立,但 Archy 在**另一个仓库**里真的建了这些。0.9567 是正当数字。

## 一、0.9567 是什么(已澄清)

Archy 的检索链路是 Postgres(source of truth)→ Elasticsearch(BM25 + 向量,混合检索)。

- **标准答案**:FAISS 暴力精确搜索的 top-10 —— 慢,但绝对正确。
- **被测对象**:线上那条又快又近似的混合检索。
- **recall@10 = 0.9567**:线上路径捞回了精确答案 10 个里的 9.567 个。

`0.70 → 0.9567` **不是调参**。第一次测出 0.70,根因是头部 pattern(6 万条相同记录)淹没候选列表——一个结构性 bug;改成 pattern-level 检索后升到 0.9567。

**这是整个 deck 最有分量的一点**:一个只有评测装置才能发现的 bug。对一位亲手建 RAG 的听众,这比 0.9567 本身重要得多。

### 但这页仍有一个洞

标题写 `Accuracy`,副标题说 `Precision scored against a human-labeled golden set — 30 queries`,**却没有给出 precision 的数字**。0.9567 是 recall@10,既不是 precision 也不是 accuracy。要么补上数字,要么删掉那句话——别留悬念。

## 二、分工是有意的 —— 但接缝要说出来

Archy 做后端检索工作流,Shu 做前端交互页面。**这是有意的分工,不是问题。**
问题在于:**听众不知道**。不明说的话,他们默认看到的是同一个系统的两个部分,然后自己发现 766K vs 3,600、以及 "serving path 无生成式 AI" vs Extractor 调模型的落差。

### 开场一句话买断所有困惑

> "We split the work: Archy built the retrieval engine, I built the interaction layer. They're separate prototypes today — you'll see both, and we'll tell you where the seam is."

### 演示时点明数据规模

> "This front-end runs on a 3,600-record slice — three months of the sanitation set — so it ships as a static page you can open on your phone. Archy's engine indexes all 766K."

### "No generative AI in the answering path" 是最好的一张牌,不是矛盾

两个原型在**同一个设计问题上做了不同选择**:

| | 意图解析(C5) | 代价 |
|---|---|---|
| Archy | 确定性规则,0.054 ms | 快、可审计、可复现;新问法要写新规则 |
| Shu | 本地小模型映射到官方分类(schema enum 约束) | 灵活、零规则维护;引入需约束+人工审核的模型 |

主动把它作为公开的设计问题抛出:

> "Archy's serving path is deterministic — no model, 0.054 milliseconds, fully auditable. Mine puts a small local model at the intent-parsing step, constrained so it can only pick from official complaint types. Both are defensible. Which one belongs in a government system is exactly the kind of question we'd want your team's opinion on."

**这可能是全场最好的一句话** —— 它把 Q&A 变成协作。前提是**你主动说**,而不是等他发现。

### Slide 10 归 Archy

`district ranking` / `trend sparklines (+267%)` / `lift-ranked associations (1.33×)` / `explain panel` —— Shu 的界面没有这些。**那页由 Archy 讲、用 Archy 的系统演示**,且不要与 Shu 的 dashboard 截图相邻。

### 明天用哪个版本?→ **已定:线上版**

https://treeaspen.github.io/code4city-hackthon/ —— 零模型调用,纯确定性,和 Archy slide 8 的 "no generative AI in the answering path" 完全一致。三个策展问题已逐个验证。

**代价**:上面那个"确定性 vs 本地模型"的设计权衡无法现场演示。**所以要用嘴讲**,在 Beat 4(human-in-the-loop)之后顺势带出:

> "The version you're seeing runs zero model calls — the mapping is precomputed. Behind it we also have a build where a small local model does that mapping live, constrained so it can only pick from official complaint types. Archy's serving path chose deterministic rules; that build chose a model. Which one belongs in a government system is exactly the question we'd want your team's opinion on."

**上台前仍要跑 `npm run warmup && npm run dev`**——万一线上站点被网络问题挡住,本地版是备份(它跑同样的三个策展问题,行为一致)。

## 三、两套系统的技术对照(供你自己心里有数)

| | Archy 的系统 | Shu 的 dashboard(本仓库) |
|---|---|---|
| 数据 | 766K 条 · 7 部门 · 全年 | 3,600 条 · 环卫子集 · 2025-10~12 |
| 分类 | 191 大类 / 951 子类 → 337 patterns | 45 个官方 complaint type |
| 存储 | Postgres + Elasticsearch(docker compose) | 静态 JSON,打进前端 bundle |
| 检索 | BM25 + 向量混合,recall@10 = 0.9567 | 浏览器内存过滤 |
| serving 路径的 AI | 无(确定性规则,0.054 ms) | 本地 LLM(**线上版无**) |
| 评测 | FAISS ground truth + golden set | 无 |

两边没有代码相连——这是分工的必然结果,不是缺陷。**只要在开场说出来就没问题。**

## 四、今晚发给 Archy 的清单

1. Precision 那 30 条 golden set 的数字是多少?没有就把 "Precision scored against…" 那句删掉,别留悬念。
2. `481 ms`(slide 3)和 `181 ms` p95(slide 9),哪个是哪个?p95 不可能低于典型值。
3. Slide 10 的五种问法由你的系统演示,对吗?我的 dashboard 没有 explain panel / sparklines / lift 关联,别把它的截图放在那页附近。
4. 开场我们明说分工("你做检索引擎、我做交互层,今天是两个独立原型")——同意吗?
5. 我打算演示本地版(真跑受约束的本地模型),正好和你 slide 8 的确定性 serving path 形成一个**公开的设计权衡**,主动抛给他们讨论。你觉得呢?线上版作备份。
