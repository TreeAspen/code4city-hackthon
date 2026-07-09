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

## 二、两套系统并不相连

| | Archy 的系统 | Shu 的 dashboard(本仓库) |
|---|---|---|
| 数据 | 766K 条 · 7 部门 · 全年 | 3,600 条 · 环卫子集 · 2025-10~12 |
| 分类 | 191 大类 / 951 子类 → 337 patterns | 45 个官方 complaint type |
| 存储 | Postgres + Elasticsearch(docker compose) | 静态 JSON,打进前端 bundle |
| 检索 | BM25 + 向量混合,recall@10 = 0.9567 | 浏览器内存过滤 |
| serving 路径的 AI | 无(确定性规则,0.054 ms) | 本地 LLM(**线上版无**) |
| 评测 | FAISS ground truth + golden set | 无 |

**没有任何一行代码相连。** 若 Archy 讲完 766K 和 0.9567,Shu 切到浏览器演示 3,600 条静态数据,听众会以为是同一个系统的界面。一旦有人数记录数、或问"这就是刚才那个 ES 里的数据吗",很难收场。

## 三、三处必须今晚对齐的矛盾

1. **`481 ms`(slide 3)vs `181 ms` p95(slide 9)**。p95 不可能低于典型值,口径要统一。
2. **Slide 10 "Five question shapes, live today"** —— district ranking、trend sparklines(+267%)、lift-ranked associations(1.33×)、explain panel:**Shu 的 dashboard 一个都没有**。若台上演示的是 Shu 的界面,第一个追问就是"能跑一下第 5 个吗"。
3. **Slide 8 "the answering path contains no generative AI at all"** vs Shu 本地 dev server 每次 Extract 都调 llama3.1:8b。
   ✅ **好消息**:GitHub Pages 上的部署版恰好完全符合该描述——三个策展问题 + 关键词回退,零模型调用。**明天用线上版即可自洽。**

## 四、建议的叙事(方案 A)

把"两套系统"讲成"两个层":

> **Archy**: "…and that's the retrieval layer: 766K records, hybrid search, recall 0.9567 against exact ground truth."
>
> **Shu**: "Archy's backend answers the question. What I'll show you is how an analyst *works* with that answer. This front-end runs on a 3,600-record slice so it ships as a static page you can open on your phone right now — but every interaction you see is designed against his API."

若时间不够对齐,退到方案 B,直说:

> "We built two halves in parallel: Archy took the retrieval engine, I took the interaction layer. They're not wired together yet — that's the first thing we'd do with a real engagement."

**这句话说出来一点都不丢人。丢人的是被发现你们假装它们是一个系统。**

## 五、今晚发给 Archy 的清单

1. Precision 那 30 条 golden set 的数字是多少?没有就删掉那句话。
2. 481 ms 和 181 ms p95,哪个是哪个?
3. Slide 10 的五种问法,你的界面能现场跑吗?还是明天用我的 dashboard?
4. 若用我的 dashboard:它跑在 3,600 条静态数据上,和你的 Postgres/ES 无连接。怎么跟听众讲?我倾向"你做检索引擎、我做交互层,尚未接通"。
5. Slide 8 说 serving path 无 generative AI —— 我本地版点 Extract 会调本地 LLM。我明天用**线上版**(纯确定性、零模型调用),与你的 slide 一致。可以吗?

**第 4、5 条必须在上台前有答案。**
