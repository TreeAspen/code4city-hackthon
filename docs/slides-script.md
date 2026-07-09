# Slides Script — 全场中英文讲稿（2026-07-09）

> **总时长 ~8 分钟 + Q&A**，留 2 分钟缓冲。听众：Dr. Alaa Moussawi（NYC Council 首席数据科学家，自己做 RAG 系统）、Melissa Nuñez（Assistant Deputy Director，做政策影响评估）。
> **Dashboard 那一段（Slide 6）的详细分镜在 [demo-script.md](demo-script.md)**，本文件只给衔接词。
>
> ⚠️ **上台前必须先改的四处**（详见文末「改稿清单」）：删掉 Target 页、统一日期、修掉 Elasticsearch/pgvector 矛盾、把中文页翻译成英文。

| # | 页面 | 谁讲 | 时长 |
|---|---|---|---|
| 1 | Title | Archy | 20s |
| 2 | Background | Archy | 45s |
| 3 | Problem | Archy | 80s |
| 4 | Methodology | Archy | 70s |
| 5 | Workflow | Shu | 30s |
| 6 | Dashboard（现场演示） | Shu | 180s |
| 7 | Closing | Shu | 30s |
| 8 | Q&A | 两人 | — |

---

## Slide 1 · Title（Archy，~20s）

**EN**: "Good afternoon. We're TypeHelp — I'm Archy, this is Shu. We're building semantic governance infrastructure for NYC 311, and we're going to show it to you through one very specific, very ordinary problem: a trash-clogged catch basin."

**ZH**: 下午好。我们是 TypeHelp，我是 Archy，这位是 Shu。我们在为 NYC 311 构建语义治理基础设施——今天我们会通过一个非常具体、非常日常的问题带你们看：一个被垃圾堵住的雨水口。

> 💡 开场不要念 slide 标题。直接把 catch basin 这个具象物件抛出去，它会贯穿全场。

---

## Slide 2 · Background（Archy，~45s）

**EN**: "This photo is a catch basin — a storm drain — packed with trash. When it clogs, the street floods. Now: whose problem is it? Sanitation put the trash there. Environmental Protection owns the drain. Transportation owns the road surface. Three agencies, one hole in the ground."

*(切到引言)* "And this is what a data scientist at a City Council office told us: *I'm done with the repetitive manual cleaning of 311 categories.* That sentence is why we're here."

**ZH**: 这张照片是一个被垃圾塞满的雨水口。它一堵，街道就淹。那么这是谁的问题？垃圾是 DSNY 的，排水口是 DEP 的，路面是 DOT 的——三个部门，一个地上的洞。
（切到引言）而这是一位市议会的数据科学家告诉我们的话：「我受够了反复手动清洗 311 的分类。」这句话就是我们站在这里的原因。

> 💡 "Three agencies, one hole in the ground" 是全场最好记的一句，慢一点讲。

---

## Slide 3 · Problem（Archy，~80s）

三个问题各约 25 秒，按 P2 → P1 → P3 的顺序讲（P2 是真问题，P1/P3 是它的症状）。

**P2 · Rigid Categories**

**EN**: "311 has 191 top-level categories and 951 subcategories. But the taxonomy is single-label and agency-centric — every complaint gets exactly one box, and the box is chosen by *who fixes it*, not *what's wrong*. Real problems are multi-facet and cross-agency. That trash-clogged catch basin is simultaneously a sanitation problem, a drainage problem, and a street problem. The schema can only remember one."

**ZH**: 311 有 191 个大类、951 个子类。但这个 taxonomy 是单标签、以部门为中心的——每条投诉只能进一个格子，而格子是按「谁来修」而不是「出了什么问题」划分的。现实问题是多面向、跨部门的：那个被垃圾堵住的雨水口同时是环卫问题、排水问题、路面问题。而 schema 只能记住其中一个。

**P1 · Time-Consuming Query**

**EN**: "So to answer a question the taxonomy wasn't designed for, an analyst writes precise SQL and hand-picks dozens of labels out of hundreds. Twenty-one million rows since 2020. Three and a half million in 2025 alone. After semantic filtering, the sanitation slice we actually care about is 766,000 rows — 460 megabytes. Getting to that slice is the work."

**ZH**: 于是，为了回答一个 taxonomy 没被设计来回答的问题，分析师要写精确的 SQL，从几百个标签里手工挑出几十个。2020 年至今 2100 万行，光 2025 年就 350 万行。语义过滤之后，我们真正关心的环卫切片是 76.6 万行、460 MB。**问题在于，走到那个切片本身就是全部的工作量。**

**P3 · Fragmented Collaboration**

**EN**: "And everyone rebuilds it privately — one person's Gemini prompt, another's ArcGIS project, a hard-coded list of label strings in someone's notebook. The label list is the institutional knowledge, and it lives in a Python file that nobody else can find."

**ZH**: 而每个人都在私下重建一遍——这个人的 Gemini prompt、那个人的 ArcGIS 工程、某人 notebook 里硬编码的标签列表。这份标签列表就是机构知识本身，可它躺在一个别人找不到的 Python 文件里。

> 💡 P3 的落点是 "institutional knowledge lives in a Python file" ——对着两位在市议会做数据治理的人讲，这一句最扎心。

---

## Slide 4 · Methodology（Archy，~70s）

**EN**: "Traditionally you must already know the 311 labels before you can use 311. We invert that. Three layers."

"**One — data pipeline.** Incremental pull from the Socrata open-data API into Postgres with pgvector."

"**Two — the semantic layer.** This is the core. We hand the model the official 311 taxonomy as context, and it does two things: it **maps** a plain-English question onto the official complaint types it semantically covers, and it **regroups** those official labels around the question instead of around which agency owns them. Retrieval is hybrid — SQL filters plus BM25 plus vector similarity."

"**Three — the dashboard.** Which Shu will show you live."

*(指 AI reliability 气泡)* "And you're all thinking the same thing: can you trust the model? Two answers. It never invents a category — the allowed labels are **enforced at the schema level**, so the output grammar only admits real 311 complaint types. It **regroups**; it does not generate. And every grouping is a proposal the analyst overrides in one drag. Shu will show you that too."

**ZH**: 传统上，你必须先知道 311 的标签，才能用 311。我们把它反过来。三层：
**一、数据管线**：从 Socrata 开放数据 API 增量拉取，进 Postgres + pgvector。
**二、语义层**——这是核心。我们把 311 官方 taxonomy 作为上下文交给模型，它做两件事：把自然语言问题**映射**到它在语义上覆盖的官方 complaint type；再把这些官方标签按**问题意图重新聚合**，而不是按哪个部门负责。检索是混合式的：SQL 过滤 + BM25 + 向量相似度。
**三、Dashboard**——Shu 会现场演示。
（指 AI reliability 气泡）你们现在想的是同一件事：这个模型可信吗？两个回答。它**永远不会发明分类**——允许的标签在 schema 层被强制约束，输出语法只接受真实的 311 complaint type。它做的是**重组**，不是**生成**。而且每一次聚合都只是提议，分析师一次拖拽就能推翻。这个 Shu 也会演示。

> 💡 **必须主动抛出 AI reliability，不要等被问。** Moussawi 自己建 RAG 系统，你先说，他会觉得你们想清楚了；他先问，你们就变成被审的一方。
>
> 💡 备用：如果他追问为什么不是 Elasticsearch —— "Our read pattern is a handful of analysts, QPS under one, seconds of latency are fine. The write pattern is append-only, no re-indexing. Postgres with pgvector covers that without another system to operate." （这段 workload 对比表是你们最能展示工程判断力的地方，被问到就展开讲。）

---

## Slide 5 · Workflow（Shu 接场，~30s）

**EN**: "Thanks Archy. So here's the shape of it. The analyst asks in plain English. The system maps that question onto the official 311 complaint types, regroups them around the question, and lays them out as editable columns. The analyst corrects anything that's off — and downstream, that's a filtered dataset, a map, a trend, an export. Let me just show you."

**ZH**: 谢谢 Archy。整个形态是这样：分析师用自然语言提问，系统把问题映射到 311 官方分类、按问题意图重新聚合、铺成可编辑的分栏，分析师修正不对的地方——往下游走，这就是一份过滤好的数据集、一张地图、一条趋势线、一次导出。我直接演示给你们看。

> 💡 别在这页停留，它只是通往 demo 的桥。**说完最后一句立刻切浏览器。**
> ⚠️ **这页要重画**（详见文末 UI/UX 清单第 1 条）：现在的 `Input → Bottleneck → Output` 三格必须换成五步流程，因为 bottleneck 是问题、不是流程步骤，而且现在的图没有体现「映射到官方分类」和「人工审核」这两步。

---

## Slide 6 · Dashboard（Shu，现场演示，~180s）

**→ 完整分镜见 [demo-script.md](demo-script.md)**，含每一步操作、台词、备用查询和故障预案。

一句话提醒：先跑 `npm run warmup`，用本地 dev server 演示（有真实 LLM），演示查询用 **"Show me everything that could clog catch basins before a storm"**，并且**一定要演拖拽 CATCH BASIN 出 Excluded 栏那一下**——那是全场最有说服力的 20 秒。

---

## Slide 7 · Closing（Shu，~30s）

**EN**: "To be concrete about what you just saw: 3,600 records — a stratified sample, 1,200 per month across the three most recent months. Tagged offline by an open-source model running on this laptop. Zero API cost. The same pipeline scales to the full 766,000-record sanitation set on the architecture Archy described."

"We think this is a small step toward making the city's data legible — not just to us, but to the public. We'd love your feedback, and your hardest questions."

**ZH**: 说清楚你们刚才看到的是什么：3,600 条记录——最近三个月每月分层抽样 1,200 条，由跑在这台笔记本上的开源模型离线打标，API 成本为零。同一条管线，在 Archy 描述的架构上可以扩展到完整的 76.6 万条环卫数据集。
我们认为这是让城市数据变得可读的一小步——不只是对我们，也是对公众。期待你们的反馈，以及最难的问题。

> 💡 **给 Nuñez 一个钩子**（她的自述是「评估政策影响、识别服务缺口」）。如果时间允许，收尾前加一句：
> **EN**: "And the reason we care about catch basins specifically: once you can see which community districts have clogged-drain complaints spiking *before* a storm, cleaning crews stop being reactive."
> **ZH**: 我们之所以特别关心雨水口：一旦你能看到哪些社区在暴雨**之前**堵塞投诉就在上升，清理队伍就不再是被动响应。

---

## Slide 8 · Q&A 弹药

| 会被问的 | 怎么答 |
|---|---|
| **模型会编造类别吗？** | 不会。schema 层 enum 约束，输出语法只允许 29 个受控标签 / 45 个官方 complaint type。剩余噪声由拖拽校正兜底。 |
| **为什么不训练一个分类器？** | 分类器把 taxonomy 冻结在一个切面上，但每换一个政策问题就换一个切法。语义标签 + 在线分解让 taxonomy 保持**可查询**。而且零标注数据成本。 |
| **准确率多少？** | 诚实说：3,559/3,600 条打上标签，平均 2.5 个标签/条，我们做了抽检但**没有跑正式评测**——这是紧接着的下一步。而且校正界面天然产出评测和微调需要的标注数据。 |
| **成本？** | Pilot 全程跑在学生笔记本的开源模型上，零 API 成本。市级规模在自有基建上批跑，架构不绑定任何供应商。 |
| **为什么 pgvector 不是 Elasticsearch？** | 见 Slide 4 备注的 workload 对比：append-only 写入、QPS < 1、秒级延迟可接受——不需要再运维一套搜索系统。 |
| **能接实时数据吗？** | Dashboard 已有 Live 模式（Socrata 近 30 天拉取）。需要生产化的是打标层，做成每日夜批即可。 |
| **词表谁来定？谁维护？** | 好问题，也是我们想请教的：目前 29 个标签是从 catch-basin 场景反推的。真实部署里它应该由跨部门共同维护——这正是我们说的「治理基础设施」。 |

> 💡 最后一题请**主动**在 Q&A 开头抛出来当作请教。对着两位做数据治理的人，把开放问题交给他们，比假装有答案得分高得多。

---

## A. UI/UX 部分的修改清单（你问的重点）

### 1. Workflow 页要重画 —— 这是最重要的一处

现在是 `Input → Bottleneck → Output` 三格。两个问题：**bottleneck 是问题不是流程步骤**；而且它没有体现你们真正的产品逻辑。换成这五步（横向流程图，每步一个方块）：

```
①  ASK                 ②  MAP                    ③  GROUP
   Plain-English          → Official 311            → Auto-aggregate into
   question                 complaint types            question-shaped columns
   "what clogs catch        (schema-enforced;          (Debris Sources /
    basins before            model cannot invent        Drainage & Sewer /
    a storm?"                a label)                   Street Surface)

                       ④  REVIEW              ⑤  VISUALIZE
                          → Analyst drags        → Map · trend · export
                            to correct
                            (human in the loop)
```

**每格底下配一张对应的界面截图**：① Extractor 输入框特写；② 官方标签 chip 特写（放大一个 `ILLEGAL DUMPING` chip，让人看清这是真实的 311 标签）；③ 三个分栏的全景；④ 拖拽中的状态（半透明卡片跟随光标）；⑤ 地图 + 趋势图。

> 💡 ②③ 两格是全 deck 最需要被看懂的地方。**② 的视觉重点是"标签是官方的"，③ 的视觉重点是"分栏是问题驱动的"。** 现在的 deck 完全没有把这个区别画出来。

### 2. 给 ② 加一个"约束"的视觉隐喻

Moussawi 会立刻想到 hallucination。与其用文字辩解，不如画出来：在 ② 那格里画一个**闭合的标签池**（191 个小方块的网格），几个被高亮选中，旁边一行小字 `enum-constrained · 0 invented labels`。这一张图省掉三十秒的解释。

### 3. Dashboard 页的截图必须换新

现在 deck 里的截图是旧版（A–E 五个固定桶、旧的 Try 快捷键 Odors/Hazards）。新版的分栏是**问题驱动的动态命名**（Debris Sources / Drainage & Sewer / …），这正是你们的卖点，旧截图反而在削弱它。**用新截图，并且截图里要能看到 EXCLUDED 栏**——它是"人工审核"这一步存在的视觉证据。

### 4. 二维码旁边加一行小字

线上版不跑模型，只保证三个样例问题。加一行：`Live demo: three sample questions · full semantic search runs locally`。这样扫码的人不会以为产品坏了，而且这句话本身就传达了"我们知道自己在做什么"。

### 5. 术语在全 deck 内保持一致

现在混用了 category / label / tag / complaint type。**统一成两个词**：
- **complaint type**（官方的、311 给的、模型只能选不能造）
- **column**（问题驱动的、模型生成的、分析师可编辑的）

「tag」这个词从 deck 里全部删掉——它会让人以为你们在原数据上加了新字段，从而引出"那你们的标注质量怎么保证"这个你不想在 8 分钟里回答的问题。

---

## B. 内容/事实修改清单（演示前必做）

1. **删掉 Target 页。** 那是你们对 Moussawi 和 Nuñez 的 LinkedIn 调研截图——绝对不能出现在给他们本人看的 deck 里。**导出 PDF 后再确认一遍。**
2. **统一日期。** 多数页角标还是 "Apr 26, 2026"（黑客松日期），标题页是 July 9。全改成 July 9 或直接删掉。
3. **技术栈自相矛盾。** 架构图写 Postgres + pgvector + BM25，Methodology 页写 Elasticsearch。**选 pgvector**（Slide 4 备注里有理由），把 Elasticsearch 那个方块改掉。
4. **中文内容全部翻译。** 架构图标注和 Instacart vs NYC 311 对比表现在是中文，听众看不懂。那张对比表其实很出彩（append-only、QPS<1、秒级延迟可接受 → 所以不需要重型搜索基建），建议保留并翻译，它是你们工程判断力的最佳展示。
5. **数字更新**：demo 数据现在是 **3,600 条 / 最近三个月（2025-10~12）**，不是旧版的 3,000 条全年。
6. **单位写清楚**："766K, 460M" → "766K rows / 460 MB"。
