# Demo Script — UX/UI & Dashboard Section (Shu Yang)

> 总时长目标 **~3 分钟**（整个 pitch <10 分钟）。每一拍都标了：**你做的操作** → 你说的话（EN 为主，ZH 对照供排练）。
> 演示数据：pilot 样本 = 最近三个月（2025-10 ~ 2025-12）每月分层随机抽样 1,200 条，共 **3,600 条**。

## 产品逻辑（讲之前先在脑子里过一遍）

```
① 用自然语言提问
      ↓
② 映射到 311 官方分类（模型只能从官方标签里选，schema 层 enum 约束）
      ↓
③ 按问题意图自动聚合成分栏（Debris Sources / Drainage & Sewer / …）
      ↓
④ 人工审核校正（拖拽）
      ↓
⑤ 地图 · 趋势 · 导出
```

**关键一句**：模型**从不发明分类，只重组官方分类**。这是回答 AI reliability 的核心。

---

## Beat 0 · 承接（~10s）

**操作**：切到浏览器，dashboard 已打开（提前加载好，默认就是 catch basin 查询）。

**EN**: "Archy just showed you the architecture. Let me show you what it feels like for the analyst who's actually stuck cleaning 311 categories every week."

**ZH**: Archy 刚讲了架构，现在我给大家看：对每周真正被 311 分类折磨的分析师来说，这个工具用起来是什么感觉。

---

## Beat 1 · 工作区一览（~20s）

**操作**：光标从左到右扫一遍三栏，不点击。

**EN**: "Three panels. On the left — project history, time range, and a spatial filter down to the community-district level. In the middle — the Extractor, where you ask in plain English. On the right — analytics that update live with whatever you've selected."

**ZH**: 三个面板：左边是项目历史、时间范围和精确到社区区划的空间筛选；中间是 Extractor，用自然语言提问；右边是随选择实时更新的分析图表。

---

## Beat 2 · 核心时刻：自然语言 → 官方分类 → 自动聚合（~50s）

**操作**：输入框已是 hero 查询。**清空、重新输入**（或直接点 `Catch basins` 快捷键），点 **EXTRACT**。
> **Show me everything that could clog catch basins before a storm**

**EN**: "I'll ask the question the way an analyst actually thinks: *show me everything that could clog catch basins before a storm.* No SQL. No memorizing which of the hundreds of complaint types apply."

（结果出现后，用手指点着分栏讲）
"Two things just happened. First, the system mapped my question onto the **official 311 complaint types** — every chip you see here is a real label from the city's own taxonomy. It cannot make one up: the allowed labels are enforced at the schema level. Second, it **regrouped** them around my question rather than around which agency owns them. *Debris Sources* — that's what physically enters the drain. *Drainage and Sewer* — that's the system it blocks. *Street Surface and Flooding* — that's what happens next. Those columns don't exist anywhere in 311. They exist because I asked this question."

**ZH**: 我按分析师真实的思维方式提问："暴雨前有什么东西可能堵塞雨水口"——不用写 SQL，不用背几百个 complaint type。
（指着分栏）刚才发生了两件事。第一，系统把我的问题映射到了 **311 官方分类**——你看到的每个标签都是市政自己 taxonomy 里的真实标签。它编不出来：允许的标签在 schema 层就被约束死了。第二，它按**我的问题**重新聚合，而不是按哪个部门负责。*Debris Sources* 是物理进入排水口的东西，*Drainage & Sewer* 是被堵住的系统，*Street Surface & Flooding* 是随之而来的后果。这三个分栏在 311 里根本不存在——它们存在，是因为我问了这个问题。

---

## Beat 3 · Cross-agency 的证据（~20s）

**操作**：指着 A 栏的 `ILLEGAL DUMPING` 和 B 栏的 `SEWER`，再滚动 Data Preview 指几条记录的 Borough / Community Board。

**EN**: "Look at what's sitting side by side. *Illegal dumping* is filed with Sanitation. *Sewer* belongs to Environmental Protection. *Street condition* is Transportation. Three agencies, one question, one working set. In today's 311 you'd need to know all three vocabularies to even start."

**ZH**: 看看现在并排放在一起的东西：Illegal Dumping 归 DSNY，Sewer 归 DEP，Street Condition 归 DOT。三个部门、一个问题、一份工作集。在今天的 311 里，你得同时懂这三套词汇表才能开始干活。

---

## Beat 4 · Human-in-the-loop（回答 AI reliability，~30s）

**操作**：从 **EXCLUDED** 栏拖一个明显该被包含的标签进 A 栏（推荐 `Dumpster Complaint` 或 `Litter Basket Request`），记录数当场上涨。也可以反向把某个标签拖走。

**EN**: "Now — I don't agree with all of this. *Dumpster complaint* got excluded, and in my neighborhood dumpsters are exactly what ends up in the drain. So I drag it back." *(拖拽，指记录数变化)* "The system proposes; the analyst decides. Every correction is one gesture, it's visible, it's reversible, and the numbers move with it. That's the answer to *can you trust the model*: it can never invent a category, and it never gets the last word."

**ZH**: 我不完全同意它的判断。Dumpster Complaint 被排除了，但在我住的街区，垃圾桶里的东西恰恰是最后进排水口的。所以我把它拖回来。（拖拽，指记录数变化）系统提议，分析师决定。每次修正就是一个手势——可见、可撤销，数字随之变化。这就是对"模型可信吗"的回答：它永远无法发明分类，也永远没有最终决定权。

> 💡 排练时先跑一遍确认 Excluded 栏里确实有 `Dumpster Complaint`（当前策展结果里有）。**这一拍是全场最有说服力的 30 秒，不要跳过。**

---

## Beat 5 · Dashboard 分析面板（~35s）

**操作**：右栏依次：切 **Category** 视图 → 开关一两个地图图层 → 指 Monthly Trend（Oct/Nov/Dec）→ 左栏地图框选一个社区看数字变化。

**EN**: "Everything on the right is downstream of that selection. The map with per-category layers — toggle what you care about. Monthly trend across the three pilot months. And the spatial filter: pick a community district, and every chart, every count, and the export re-scope instantly. When you're done, this exact filtered slice is what you download for your own pipeline."

**ZH**: 右边所有图表都跟着这个选择走：分类别图层的地图，想看什么开什么；三个月的月度趋势；空间筛选选中某个社区后，所有图表、计数和导出立即重新聚焦。做完之后，你下载的就是这份精确过滤的数据切片，直接进你自己的分析管线。

---

## Beat 6 · 收尾 & 交还（~15s）

**EN**: "This pilot is 3,600 records — a stratified sample, 1,200 per month over the three most recent months. The same pipeline scales to the full 766,000-record sanitation set on the architecture Archy walked through. We'd love your feedback — and your hardest questions."

**ZH**: 这个 pilot 是 3,600 条——最近三个月每月分层抽样 1,200 条。同一条管线配合 Archy 讲的架构可以扩展到 76.6 万条的完整 sanitation set。期待你们的反馈和最难的问题。

---

## 三个样例问题（**线上版只保证这三个**）

Extractor 上方的 `TRY:` 快捷键就是这三个，点一下直接出结果，**不调用任何模型**：

| 快捷键 | 完整问题 | 生成的分栏 | 记录数 |
|---|---|---|---|
| **Catch basins** | Show me everything that could clog catch basins before a storm | Debris Sources / Drainage & Sewer / Street Surface & Flooding | 1,413 |
| **Illegal dumping** | Find illegal dumping hotspots | Dumping Reports / Commercial & Residential Disposal / Resulting Street Conditions | 549 |
| **Rodents** | List all rat sightings and the conditions that attract them | Rodent Reports / Attracting Conditions / Related Hygiene Complaints | 1,565 |

> ⚠️ **演示时只用这三个问题。** 本地 dev server 上任何问题都会走真实 LLM（llama3.1:8b，热启动约 3 秒）；线上 GitHub Pages 上，这三个之外的问题会退化成关键词匹配，分组比较粗糙。

## Q&A 弹药

- **"How do you stop the model from hallucinating categories?"** → 它只能从官方标签里选：response schema 的 enum 把输出语法限死在真实 complaint type 上。它做的是**重组**，不是**生成**。加上拖拽校正兜底。
- **"Why not train a classifier?"** → 分类器把 taxonomy 冻结在一个切面上，但每换一个政策问题就换一个切法。语义分组让 taxonomy 保持**可查询**，而且零标注数据成本。
- **"What did this cost?"** → Pilot 全程跑在学生笔记本的开源模型上，零 API 成本。市级规模在自有基建上批跑，架构不绑定任何供应商。
- **"Accuracy?"** → 诚实说：我们做了抽检，**没有跑正式评测**——这是紧接着的下一步。而且校正界面天然产出评测和微调需要的标注数据。
- **"Live data?"** → Dashboard 已有 Live 模式（Socrata 近 30 天拉取）。

---

## 上台前 3 步（按顺序）

```bash
# 1. 关掉多余 Chrome 标签页和大型应用（这台机器内存紧张，8B 模型要 ~5GB）
# 2. 预热模型（约 2-10 秒，之后常驻显存 60 分钟）
npm run warmup
# 3. 启动本地服务器 —— 主演示路径
npm run dev     # → http://localhost:5173/code4city-hackthon/
```

先在浏览器里点一遍三个快捷键确认无误，再切到演示者视图。

## 两条演示路径

| 路径 | 地址 | Extractor 行为 |
|---|---|---|
| **主**：本地 dev 服务器 | `http://localhost:5173/code4city-hackthon/` | 三个样例走策展结果；任意其他问题走真实 LLM（llama3.1:8b，约 3 秒） |
| **备**：GitHub Pages（slides 二维码指向） | https://treeaspen.github.io/code4city-hackthon/ | **不跑模型**。三个样例问题结果已验证正确；其他问题退化为关键词匹配 |

线上站点数据完全一致（同样 3,600 条），观众扫码看到的是可用的产品。

## 故障预案

- **本地 LLM 报错/超时** → 代码静默回退到关键词映射，分栏照样出现。别慌，顺势讲："deterministic fallback 是设计的一部分——演示环境不依赖任何外部服务。"
- **8B 模型加载失败（内存不足）** → `.env.local` 里把 `VITE_OLLAMA_MODEL` 改成 `llama3.2:3b`，重启 dev server。
- **完全崩了** → 切到线上站点，三个样例照样能演，除了自由提问什么都不损失。
