# Methodology 页 — 声称 vs 实际（给 Archy）

> 核实日期 2026-07-09，基于仓库 `main` 分支的实际代码。
> **动机**：听众 Dr. Moussawi 每天建这类系统。任何一个"我们用了 X"而 X 不存在的地方，一问就穿帮，且会连带清空其余部分的可信度。

## 对照表

| Slide 上写的 | 代码里实际是什么 | 判断 |
|---|---|---|
| `766K raw data → Build search index` | 无索引。`scripts/preprocess.js` 流式解析 450MB CSV，按月分层抽样 1,200×3 = 3,600 条 → 静态 JSON | ❌ 改 |
| 技术栈 `Python + PostgreSQL` | 无 Python，无数据库。Node 脚本 + 打进 bundle 的静态 JSON | ❌ 改 |
| `Identify different patterns: 766K → 337` | 未做。受控词表是 `src/app/buckets.ts` 里的 **45 个官方 complaint type**。**337 来源不明** | ❌ 删或解释 |
| `Enrichment: Text → Vector (Embedding)` | 无 embedding、无向量、无相似度检索 | ❌ 删 |
| 技术栈 `embeddings (bge, vector)` | 仓库内无任何 embedding 代码或依赖 | ❌ 删 |
| `E.g: Blocked drain = clogged sewer` | 语义等价关系成立，但由 LLM 在 prompt 中判断，非向量相似度 | ⚠️ 改措辞 |
| 技术栈 `Elasticsearch` | 不存在。且与架构图的 pgvector 自相矛盾 | ❌ 删 |
| 技术栈 `FastAPI` | 不存在。无后端，纯静态 SPA | ❌ 删 |
| `LLM API` | ✅ 本地 Ollama（llama3.1:8b），零 API 成本 | ✅ 改措辞 |
| `HITL` | ✅ 拖拽校正真实可用 | ✅ 保留 |
| `Natural Language → Structured Query` | ✅ 问题 → 官方 complaint type 集合 | ✅ 保留 |
| `Organize Dictionary` | ✅ 即问题驱动的分栏 | ✅ 保留 |
| `Heatmap & Barplot` | ✅ 地图 + 月度趋势 | ✅ 保留 |
| 技术栈 `React` | ✅ Vite + React SPA | ✅ 保留 |

**额外注意**：离线打的 3,559 条语义标签（`tagRecords.mjs` 产物）在 2026-07-09 的重构后**已不被 UI 使用**。若 "LLM Enrichment (offline)" 指的是它，则当前 serving 路径中它贡献为零。

## 真实工作流

```
① 抽样   450MB CSV (766K 行) --流式解析--> 分层抽样 1,200/月 × 3 月 = 3,600 条静态 JSON
② 词表   45 个官方 311 complaint type，人工归入 5 个语义桶 (buckets.ts)
③ 提问   分析师自然语言提问
④ 映射   本地 LLM (llama3.1:8b) 将问题映射到官方 complaint type
          ↑ response schema 的 enum 锁死输出，模型无法发明标签
⑤ 聚合   同一次调用按问题意图把选中标签重组为分栏
⑥ 审核   分析师拖拽校正 (HITL)
⑦ 呈现   浏览器内存过滤 → 地图 · 月度趋势 · 导出
```

无数据库、无索引、无向量、无后端。**这是一个诚实的 pilot 应有的样子。**

## 建议改法：每格拆成 Pilot / At scale 两行

| | Data Pipeline | Semantic Layer | Dashboard |
|---|---|---|---|
| **流程** | 766K rows (460 MB) ↓ stratified sample ↓ 3,600 rows (3 months) | 45 official complaint types as vocabulary ↓ LLM maps question → official types, regroups by intent ↓ human-in-the-loop | Ask in plain English ↓ map → group ↓ analyst corrects ↓ Map · Trend · Export |
| **Pilot（今天跑的）** | Node + static JSON | local open-source LLM, $0 API cost | React SPA, in-memory |
| **At scale（架构目标）** | Postgres + pgvector | + embeddings for recall | FastAPI |

### 三处具体措辞

1. 删 `766K → 337` → 换成 `766K rows → 3,600-row pilot sample (1,200/month × 3 months)`。除非能当场解释 337。
2. 删 `Enrichment: Text → Vector (Embedding)` 和 `bge` → 换成 `Question → official complaint types (schema-enforced enum)`。例子改写为 `"Blocked drain" → Sewer, Standing Water, Root/Sewer/Sidewalk Condition`，并注明是模型的语义判断。
3. 删 `Elasticsearch`，与架构图统一到 pgvector，且标注为 `at scale`。

## 会被问到什么，怎么答

- **"索引怎么建的？"** → Pilot 没有索引，3,600 条在浏览器里过滤就够了。到 766K 规模，Postgres 的 tsvector + pgvector HNSW 是我们的选择——因为写入是 append-only、QPS < 1、秒级延迟可接受，不需要再运维一套 Elasticsearch。
- **"embedding 用什么模型？"** → Pilot 阶段没有用 embedding。问题到官方标签的映射由 LLM 在受控词表上完成，enum 约束保证零幻觉。Embedding 是我们下一步提升召回的方向，尤其是词表扩展到 191 个大类之后。
- **"为什么不用 embedding？"** → 45 个标签的词表可以整个放进 prompt。到 951 个子类时就必须先做向量召回再交给 LLM 重排——那是架构图右半边的事。
- **"这跑在哪？"** → 我的笔记本。开源模型，零 API 成本，离线可跑。这也是为什么它可以部署在市政内网里，数据不出门。
