---
title: 多数据源图查询，先把联邦的边界看清楚
date: 2026-10-21
category: 图数据库
tags: 联邦查询, Cypher, 虚拟知识图谱, 查询优化
description: 从常用术语和六类技术路线出发，讨论跨源图查询的执行成本、语义边界，以及值得实际验证的问题。
featured: true
---

整理 Cypher 联邦查询的资料时，我发现只搜 Cypher federation 会漏掉不少相关工作。虚拟知识图谱、图中心的 Polystore、图与关系数据的跨存储 Join，都在处理数据分散带来的问题，只是各自承担的工作不同。

把这些框架的文档放在一起看，我更关心一条查询经过了哪些系统，关联在哪里发生，最后返回的结果又保证了什么。沿着这几个问题往下看，产品之间的区别会清楚得多。

本文整理自多数据源图查询调研报告和配套术语表，产品能力核查于 2026 年 10 月 21 日。没有在统一环境下做性能测试，文中的取舍是基于架构和文档的判断。

## 先分清模型、语言和联邦

图模型描述数据怎样组织。RDF 用主语、谓语、宾语表达事实；属性图围绕节点、边及其属性建模。SPARQL 主要查询 RDF，Cypher 主要查询属性图。模型和语言分清以后，才能讨论系统之间怎样协作。

联邦查询面对的是多个自主数据源。各源保留自己的存储、权限和更新节奏，联邦层拆分查询，再把结果关联起来。分布式图数据库通常由同一个引擎管理分片，和跨几个独立业务系统查询的约束有明显差别。

几个经常一起出现的术语，可以先记住它们负责哪一层。

| 术语 | 英文与含义 | 放进系统里怎样理解 |
| --- | --- | --- |
| RDF | Resource Description Framework，资源描述框架 | 表达三元组事实的数据模型 |
| SPARQL | SPARQL Protocol and RDF Query Language | 查询 RDF 的语言及相关协议体系，全称中的 SPARQL 是递归缩写 |
| Property Graph | 属性图 | 节点和边可以带属性，路径是常见查询对象 |
| IRI | Internationalized Resource Identifier，国际化资源标识符 | 在 RDF 中给实体命名；两个名字是否指向同一实体，仍需处理 |
| VKG | Virtual Knowledge Graph，虚拟知识图谱 | 通过映射形成图视图，数据可以留在原来的源里 |
| OBDA | Ontology-Based Data Access，本体驱动数据访问 | 用本体和映射连接业务概念与底层数据 |
| OBDF | Ontology-Based Data Federation，本体驱动数据联邦 | 在语义访问之下加入多源联邦层 |
| Mapping | 映射 | 明确哪些记录构成实体、哪些字段构成属性，以及实体怎样连接 |
| Polystore | 多存储系统 | 让不同模型或专用引擎共同完成查询，具体转换和执行责任由实现决定 |

GQL、SQL/PGQ 和 GraphQL 也要分别看。GQL 是独立的属性图查询语言，SQL/PGQ 把属性图查询放进 SQL。GraphQL 主要组织 API 字段请求，不能仅凭名称就推断它支持数据库里的路径匹配与跨源优化。[语言模型的区别可参见这篇论文](https://www.vldb.org/pvldb/vol18/p1798-libkin.pdf)。

## 从接入多个库，到在现有数据上定义图

早期数据库联邦主要隐藏数据的位置和接口差异。语义网把统一访问扩展到 RDF，SPARQL 1.1 在 2013 年规范了 `SERVICE`，允许把部分查询交给指定端点。自动选择哪些端点、怎样安排 Join，则留给引擎处理。[SPARQL 联邦规范](https://www.w3.org/TR/sparql11-federated-query/)说明了这层分工。

后来，图也逐渐成为访问现有数据的一种方式。表里的主外键、关系表和 JSON 字段，可以通过映射呈现为节点与边。查询者看到图，执行器实际访问的仍可能是关系库或湖仓。

原报告里的框架大致可以放进六类。这个分类用于确定候选范围，不是产品排名。

| 路线 | 代表体系 | 优先问清的事 |
| --- | --- | --- |
| RDF 端点联邦 | FedX、Jena、GraphDB 集成的 FedX | 谁选择端点，词表和实体身份是否一致 |
| 语义虚拟化 | Ontop、Stardog、Virtuoso | 谁负责映射，谁负责多源执行 |
| 已有属性图的组合 | Neo4j Composite Databases | 跨图结果怎样关联，路径到哪里终止 |
| 外部数据上的属性图 | PuppyGraph、Neo4j Virtual Graph | 哪些表构成节点与边，路径和语言覆盖到什么程度 |
| SQL 联邦与数据虚拟化 | Trino、Dremio、Denodo、Teiid | Join 在哪里执行，缓存怎样刷新 |
| 引擎构件与优化框架 | Calcite、DataFusion Federation、GOpt | 已经提供哪一层，还要自行补多少执行与治理工作 |

两个例子能说明这种分工。

[FedX](https://rdf4j.org/documentation/programming/federation/)可以自动选择相关 SPARQL 端点并合并结果。接入关系库或普通业务 API 时，还需要相应的包装与映射。

[Ontop](https://ontop-vkg.org/guide/)把 SPARQL 改写为关系源执行的 SQL，也支持连接 Trino 等联邦后端。采用这种组合时，上层负责语义改写，下层承担多源执行。评估方案要沿着这两层继续看，才能知道问题该由谁解决。

## 跨源查询贵在哪里

假设要查找某类设备当前的严重告警，再找出关联工单。设备关系在图里，告警由 API 提供，工单保存在关系库中。这只是说明执行顺序的例子，不对应某个产品的实测。

一种计划先在图中筛选设备，再带着设备 ID 请求告警，最后关联工单。另一种计划先筛出严重告警，把设备 ID 交给图端过滤。哪一种更便宜，取决于过滤后还剩多少记录，以及接口是否允许这样访问。

**源选择**决定访问哪些源。**下推**（Pushdown）决定把哪些操作交给源执行。**基数估计**（Cardinality Estimation）估计每一步大约产出多少记录，影响 Join 顺序和数据传输量。这几个问题彼此相关，但不能相互替代。

如果告警 API 必须先拿到设备 ID 才能调用，第二种计划就未必可行。对同一个 ID 逐条发请求，又可能把一次查询变成大量网络往返。批量绑定可以减少请求，前提是源接口支持批量访问，并且没有改变重复值和缺失值的处理。

下推也有边界。[Trino 的文档](https://trino.io/docs/current/optimizer/pushdown.html)明确说明，下推能力取决于连接器；Join 下推要求表来自同一 Catalog，相关谓词也能下推。能查询多个 Catalog，并不意味着跨 Catalog 的 Join 会自动交给某个远端数据库完成。

虚拟图同样会付出扫描和传输成本。缓存复用已读取的数据，物化（Materialization）把计算结果保存下来供后续使用。两者都需要考虑更新与失效。[PuppyGraph 文档](https://docs.puppygraph.com/modeling/data-sources/)同时提供外部数据源、本地缓存表和联合数据源，就能看到这些方式如何共存。

评估时，我会把“是否需要预先全量导入”和“执行时搬了多少数据”分开记录。只统计最终返回的几行结果，很容易看漏中间扫描、传输和重复请求的成本。

## 图语义到了跨源边界，还剩下多少

SQL Join 可以连接两组记录，图路径查询还要处理路径长度、环和重复元素。数据来自不同源时，节点身份也需要定义。两个系统都存在 `device_id`，并不能保证编号范围、空值和实体含义一致。

[Neo4j Composite Databases 的文档](https://neo4j.com/docs/operations-manual/current/scalability/composite-databases/concepts/)给出了很明确的限制，关系不能直接跨越成员图。可以用代理节点和业务键连接不同图的查询结果，但跨图递归仍需要额外设计。

语言兼容范围也值得逐项检查。核查时，[Neo4j Virtual Graph 的预览文档](https://neo4j.com/docs/virtual-graph/aura/cypher-coverage/)仍列出 `OPTIONAL MATCH`、写入和最短路径等限制；旧式变长路径语法与有明确上界的量化路径，覆盖情况也不同。选型时要拿实际查询验证，单看“支持 Cypher”几个字不够。

另外，新鲜度、一致性和溯源回答的是不同问题。刚读到的数据可以很新，却未必属于同一个跨源时间点。溯源（Provenance）说明答案由哪些数据、经过哪些操作产生，也不会自动补出全局一致快照。

当某个源超时或分页被截断，系统应当明确告知结果是否完整。把部分结果当成完整答案，会让后续分析失去依据。这类行为需要在验证阶段就约定清楚。

## 近期研究在补哪些缺口

这轮资料中，我觉得下面几项工作值得连着读。它们分别处理计划、映射和访问接口，不能直接当成可互换的产品。

[GOpt](https://arxiv.org/abs/2503.22091)用图中间表示 GIR（Graph Intermediate Representation）保留图模式及相关语义，让图优化规则有机会在计划展开前发挥作用。可对接多个后端，说明框架便于复用；一次查询能否跨后端执行，还需要联邦层支持。

[OBDF 的研究](https://www.inf.unibz.it/~calvanese/papers-html/KnoSys-2025.html)关心语义映射层和联邦层之间的信息交流。映射知道实体来自哪里，执行层知道数据怎样分布。源间关系如果无法参与共同优化，就可能保留一些本来可以消除的分支或 Join。

[MICRO](https://arxiv.org/abs/2603.13835)直接研究图存储与关系存储之间的跨模型 Join，用统一代数表达候选计划，再由学习排序优化器选择执行方式。我更看重它把不同执行位置放到一起比较的思路。它避免要求全部数据先统一到一个模型，但执行中仍可能转换或物化中间数据，不能理解为完全不搬数据。

[HeFQUIN 的 JSON API 工作](https://olafhartig.de/files/HartigWestman2026Demo.pdf)则把接口的输入依赖纳入查询，先绑定变量，再构造 API 请求，把返回的 JSON 在运行时映射为 RDF。它的[现行文档](https://liusemweb.github.io/HeFQUIN/doc/queries.html)仍要求显式分配数据源。读它更适合学习异构接口如何参与执行计划，而不是据此假定自动源选择已经解决。

## 真要落地，先用一组查询把边界跑出来

候选范围确定后，先整理业务必须保留的查询语义。固定跳数与递归路径是否都需要，关系缺失时保留哪一侧，跨源重复记录怎样处理，都应写成能核对结果的用例。

验证集要覆盖跨源多跳，也要覆盖一个源变慢、失败或只返回部分数据的情况。全局聚合与 Top-N 需要单独测。把每个源的局部结果直接截断再合并，可能改变最终答案；是否允许提前截断，要能证明。

性能记录除了延迟，还应有远程请求数、扫描量与网络字节，冷缓存和热缓存分开。P50 是延迟中位数，P95 是第 95 百分位，平均耗时掩盖的问题可以从尾部请求里继续查。结果完整性与数据新鲜度也要独立记录。

如果已有多个 SPARQL 端点，可以从 FedX 一类体系开始；如果数据主要在表和湖仓，先决定业务是否确实需要图路径，再比较 SQL 联邦、语义映射或外部属性图方案。打算自研时，[Calcite 的 Adapter 文档](https://calcite.apache.org/docs/adapter)适合帮助划分源访问与优化规则的接口，但运行时和资源控制仍要安排实现。

我会优先保留能解释执行计划的方案。性能不理想时，至少要查得出哪些过滤留在了源端，哪个 Join 放大了中间结果，以及哪一次远程请求开始变慢。

## 参考资料

- [SPARQL 联邦规范](https://www.w3.org/TR/sparql11-federated-query/)，用于区分标准规定与引擎优化。
- [Neo4j Composite Databases](https://neo4j.com/docs/operations-manual/current/scalability/composite-databases/concepts/)及 [Virtual Graph 语言覆盖](https://neo4j.com/docs/virtual-graph/aura/cypher-coverage/)，用于核对跨图关系和查询子集。
- [Ontop](https://ontop-vkg.org/guide/)与 [OBDF 论文](https://www.inf.unibz.it/~calvanese/papers-html/KnoSys-2025.html)，用于理解语义映射和多源执行的分工。
- [Trino 下推文档](https://trino.io/docs/current/optimizer/pushdown.html)与 [PuppyGraph 数据源文档](https://docs.puppygraph.com/modeling/data-sources/)，用于核对执行位置和缓存机制。
- [MICRO](https://arxiv.org/abs/2603.13835)、[GOpt](https://arxiv.org/abs/2503.22091)和 [HeFQUIN](https://olafhartig.de/files/HartigWestman2026Demo.pdf)，用于继续阅读跨模型优化与异构接口研究。
