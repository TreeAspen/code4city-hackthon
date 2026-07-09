# Demo Script — UX/UI & Dashboard Section (Shu Yang)

> 总时长目标 **~3 分钟**（整个 pitch <10 分钟）。每一拍都标了：**你做的操作** → 你说的话（EN 为主，ZH 对照供排练）。
> 演示数据：pilot 样本 = 数据集中最近三个月（2025-10 ~ 2025-12）每月分层随机抽样 1,200 条，共 **3,600 条**，全部经离线 LLM 多面向打标。

---

## Beat 0 · 承接（~10s）

**操作**：切到浏览器，dashboard 已打开（提前加载好）。

**EN**: "Archy just showed you the architecture. Let me show you what it feels like for the analyst who's actually stuck cleaning 311 categories every week."

**ZH**: Archy 刚讲了架构，现在我给大家看：对每周真正被 311 分类折磨的分析师来说，这个工具用起来是什么感觉。

---

## Beat 1 · 工作区一览（~20s）

**操作**：光标从左到右扫一遍三栏，不点击。

**EN**: "Three panels. On the left — project history, time range, and a spatial filter down to the community-district level. In the middle — the Extractor, where you talk to the data in plain English. On the right — analytics that update live with whatever you've selected."

**ZH**: 三个面板：左边是项目历史、时间范围和精确到社区区划的空间筛选；中间是 Extractor，用自然语言跟数据对话；右边是随选择实时更新的分析图表。

---

## Beat 2 · 核心时刻：自然语言 → 语义分栏（~45s）

**操作**：清空输入框，现场输入（或粘贴）已实测过的查询：
> **Show me everything that could clog catch basins before a storm**

点 **EXTRACT**，等 2–3 秒出结果。

**EN**: "I'll ask the question the way an analyst actually thinks: *show me everything that could clog catch basins before a storm.* No SQL, no memorizing which of the 191 complaint types apply."

（结果出现后）"Here's what happened under the hood: every record in this pilot was pre-tagged **offline** with one to four semantic facet tags — run on an open-source model, on a laptop, at zero API cost. The vocabulary is **controlled**: 29 tags, enforced at the schema level, so the model physically cannot invent a label. My query just got decomposed against that same vocabulary, and the system built these semantic columns for me on the fly."

**ZH**: 我按分析师真实的思维方式提问："暴雨前有什么东西可能堵塞雨水口"——不用写 SQL，不用背 191 个 complaint type。
（出结果后）背后的机制：pilot 里每条记录都已**离线**打好 1–4 个语义 facet 标签——用开源模型在笔记本上跑的，API 成本为零。词表是**受控的**：29 个标签、schema 层面强制约束，模型物理上无法编造标签。我的查询被分解到同一个词表上，系统即时生成了这些语义分栏。

---

## Beat 3 · Cross-agency 的证据（~20s）

**操作**：滚动 Data Preview，指一条同时带垃圾类和排水类面向的记录（如 Illegal Dumping 且落在 Drainage/Standing Water 分栏的）。

**EN**: "This is the trash-clogged catch basin from our opening slide, as data. One record filed under DSNY as illegal dumping — but it now *also* shows up under drainage and standing water. Multi-facet, cross-agency, without changing anything upstream in how 311 collects reports."

**ZH**: 这就是开场那个"垃圾堵塞雨水口"的数据版本：一条按 DSNY 归档的 Illegal Dumping 记录，现在同时出现在排水和积水的面向下。多面向、跨部门，而且完全不需要改动 311 上游的报案流程。

---

## Beat 4 · Human-in-the-loop（回答 AI reliability，~25s）

> 🎯 **实测发现的黄金时刻**：这个查询下模型会把 **CATCH BASIN 这个标签本身**留在 Excluded 栏里（它选了"原因"和"结果"，漏了物件本身）。**别修它，演它**——把 CATCH BASIN 从 Excluded 拖进 A 栏，记录数当场上涨。这是全场最有说服力的 20 秒。

**操作**：从 Excluded 栏拖 **CATCH BASIN** 到 A 栏，图表和记录数随之刷新。

**EN**: "Now look — the model gave me the causes and the consequences, but it left *catch basin itself* in the excluded column. It's a small open model running on my laptop; it's not perfect. So the analyst just drags it back." *(拖拽，记录数变化)* "The AI proposes, the analyst disposes — and the numbers update instantly. That's our answer to AI reliability: constrain the vocabulary so it can never invent a category, and keep a human in the loop for the judgment calls."

**ZH**: 注意看——模型给了我"原因"和"结果"，但把 catch basin 这个标签本身留在了 Excluded 栏里。它是跑在我笔记本上的小型开源模型，并不完美。分析师直接把它拖回来就行。（拖拽，数字变化）AI 提议，人来定夺，数字立刻更新。这就是我们对"AI 可靠性"的回答：用受控词表让它无法编造类别，用人在环处理需要判断的部分。

---

## Beat 5 · Dashboard 分析面板（~35s）

**操作**：右栏依次：切 **Category** 视图 → 点开/关一两个地图图层 → 指 Monthly Trend（10/11/12 三个月）→ 左栏地图框选一个社区看数字变化。

**EN**: "Everything on the right is downstream of that semantic selection. The category map with per-facet layers — toggle what you care about. Monthly trend across the three pilot months. And the spatial filter: pick a community district, and every chart, count, and the export re-scopes instantly. When you're done, this exact filtered slice is what you download for your own pipeline."

**ZH**: 右边所有图表都跟着语义选择走：分面向图层的地图，想看什么开什么；三个月的月度趋势；空间筛选选中某个社区后，所有图表、计数和导出立即重新聚焦。做完之后，你下载的就是这份精确过滤的数据切片，直接进你自己的分析管线。

---

## Beat 6 · 收尾 & 交还（~15s）

**EN**: "This pilot is 3,600 records — a stratified sample, 1,200 per month over the most recent three months. The same pipeline scales to the full 766K-record sanitation set with the Postgres + pgvector architecture Archy walked through. We'd love your feedback — and your hardest questions."

**ZH**: 这个 pilot 是 3,600 条——最近三个月每月分层抽样 1,200 条。同一条管线配合 Archy 讲的 Postgres + pgvector 架构可以扩展到 76.6 万条的完整 sanitation set。期待你们的反馈和最难的问题。

---

## 备用演示查询（都实测过语义分解）

| 查询 | 预期分栏效果 |
|---|---|
| Show me everything that could clog catch basins before a storm | Stormwater/Drainage + 垃圾来源（含因果关联标签） |
| List all rat sightings | Rodents + Dead Animal 等卫生面向 |
| Find illegal dumping hotspots | 垃圾/倾倒各面向；配合地图讲热点 |
| Show flooding and drainage issues | 水患相关面向全亮 |

## Q&A 弹药

- **"How do you stop the LLM from hallucinating categories?"** → Schema-level enum constraint: the model's output grammar only admits the 29 controlled tags / 45 official complaint types. Plus the drag-to-correct loop for residual noise.（schema 层 enum 约束 + 人工校正兜底）
- **"Why not train a classifier?"** → The taxonomy question changes with every policy question — a classifier freezes one cut of it. Semantic tagging + on-the-fly decomposition keeps the taxonomy *queryable*. Also: zero labeled training data needed.（分类器把 taxonomy 冻结在一个切面上；语义标签让 taxonomy 可查询，且无需标注数据）
- **"What did this cost?"** → The pilot ran on a free open-source model on a student laptop. At city scale you'd batch on your own infra — the architecture doesn't assume any vendor.（免费开源模型 + 笔记本；市级规模在自有基建上批跑，不绑定供应商）
- **"Accuracy?"** → Honest answer: ~96% of records got tags, avg 2.5 tags each; we spot-checked but haven't run a formal eval — that's the immediate next step, and the correction UI generates exactly the labeled data an eval needs.（诚实说没做正式评测，但校正界面天然产出评测/训练数据）
- **"Live data?"** → The dashboard has a live Socrata mode already (recent-30-days pull); the offline tagging layer is the piece we'd productionize as a nightly batch.（已有 Live 模式；打标层生产化为每日夜批）

## 上台前 3 步（按顺序）

```bash
# 1. 关掉多余 Chrome 标签页和大型应用（这台机器内存紧张，8B 模型要 ~5GB）
# 2. 预热模型（约 10 秒，之后常驻显存 60 分钟）
npm run warmup
# 3. 启动本地服务器 —— 这是主演示路径（有完整 LLM 语义模式）
npm run dev     # → http://localhost:5173/code4city-hackthon/
```

先在浏览器里跑一次演示查询确认一切正常，再切到演示者视图。

## 两条演示路径

| 路径 | 地址 | Extractor 行为 |
|---|---|---|
| **主**：本地 dev 服务器 | `http://localhost:5173/code4city-hackthon/` | 真实 LLM 语义分解（llama3.1:8b，热启动 2–4 秒） |
| **备**：GitHub Pages（也是 slides 上二维码指向的） | https://treeaspen.github.io/code4city-hackthon/ | 确定性关键词映射（观众的浏览器访问不到你的本地模型，属预期行为） |

线上站点数据完全一致（同样 3,600 条已打标记录），只是分栏用确定性映射生成。观众扫码看到的是可用的产品，不是坏页面。

## 故障预案

- **Extractor 报错/超时** → 代码会**静默回退**到确定性关键词映射，分栏照样出现，只是分组更粗。别慌，顺势讲："deterministic fallback 是设计的一部分——演示环境不依赖任何外部服务。"
- **8B 模型加载失败（内存不足）** → `.env.local` 里把 `VITE_OLLAMA_MODEL` 改成 `llama3.2:3b`，重启 dev server（3b 已下载，约 2 秒响应，质量略降）。
- **首次查询很慢** → 说明没预热，`npm run warmup` 忘了跑。
- **完全没网 / 全崩** → 直接用线上站点或截图讲。
