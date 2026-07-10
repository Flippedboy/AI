# AI 大模型开发面试总结 - 智扫通项目

## 一、项目概述

**智扫通** 是一个基于 RAG (Retrieval-Augmented Generation) 技术的扫地机器人智能客服系统。用户可以通过对话界面获取关于扫地机器人的使用指导、故障排除、维护保养等信息，同时系统提供数据看板、知识库管理、使用报告等管理功能。

**核心价值：** 将产品知识库与大语言模型结合，提供 7x24 小时智能问答服务，降低人工客服成本，提升用户自助服务体验。

---

## 二、核心考点：RAG（检索增强生成）

### 2.1 什么是 RAG？

RAG (Retrieval-Augmented Generation) 是一种将信息检索与文本生成相结合的 AI 架构。在生成回答之前，先从知识库中检索与问题相关的文档片段，将检索结果作为上下文注入大模型，从而生成更准确、更可信的回答。

### 2.2 RAG 解决的核心问题

| 问题 | 传统 LLM | RAG 方案 |
|------|----------|----------|
| 知识截止日期 | 训练数据截止后无新知识 | 实时检索最新文档 |
| 幻觉问题 | 可能编造不存在的事实 | 基于检索结果生成，有据可查 |
| 领域知识不足 | 通用模型对特定领域了解有限 | 注入领域文档作为上下文 |
| 知识更新成本 | 需要重新训练或微调 | 只需更新知识库文档 |

### 2.3 RAG 流程解析（项目实现）

`
用户提问 → 向量化(Embedding) → 向量检索(ChromaDB) → 文档重排 → 
拼接 Prompt(RAG提示模板) → LLM生成 → 流式返回
`

**本项目实现细节：**
- 使用 	ext-embedding-v4 (DashScope) 将文档和问题转为向量
- ChromaDB 存储 768 维向量，支持余弦相似度搜索
- RecursiveCharacterTextSplitter 将文档按 \n\n → \n → 。 分层切块
- 搜索参数 k=2 召回最相关的前 2 个文档片段

### 2.4 面试高频问题

**Q: RAG 和微调有什么区别？各有什么优缺点？**

| 维度 | RAG | 微调 |
|------|-----|------|
| 知识更新 | 更新文档即可，低成本 | 需要重新训练，高成本 |
| 幻觉控制 | 好（有检索依据） | 一般（依赖训练数据） |
| 推理速度 | 较慢（多了检索步骤） | 快 |
| 适用场景 | 知识问答、客服系统 | 风格模仿、特定格式输出 |
| 维护成本 | 低（只需维护知识库） | 高（需要 GPU 训练） |

**Q: RAG 中如何保证检索质量？**
1. 文档切分策略：chunk_size + chunk_overlap 平衡粒度与上下文
2. Embedding 模型选择：领域相关的 embedding 效果更好
3. 检索参数调优：调整 k 值、相似度阈值
4. 混合检索：结合关键词检索（BM25）和向量检索

**Q: 这个项目为什么选择 qwen3-max + text-embedding-v4？**
- 通义千问 qwen3-max 在中文场景表现优秀
- 阿里云 DashScope 生态集成方便
- text-embedding-v4 支持 768 维向量，维度适中，检索精度和性能平衡

---

## 三、核心考点：LangChain 框架

### 3.1 LangChain 核心概念

本项目使用 LangChain 作为 AI 引擎框架，关键组件：

| 组件 | 本项目实现 | 说明 |
|------|-----------|------|
| Model | ChatTongyi(model="qwen3-max") | 大语言模型封装 |
| Embeddings | DashScopeEmbeddings(model="text-embedding-v4") | 文本向量化 |
| Agent | create_agent() | 智能体，自主决定调用哪些工具 |
| Tool | ag_summarize, get_weather, etch_external_data 等 | 工具函数 |
| ToolMiddleware | monitor_tool, log_before_model, eport_pormpt_switch | 中间件链 |
| VectorStore | Chroma | 向量数据库 |
| Retriever | ector_store.as_retriever(search_kwargs={"k":2}) | 检索器 |
| TextSplitter | RecursiveCharacterTextSplitter(chunk_size=200) | 文档切分 |

### 3.2 Agent 架构

`python
self.agent = create_agent(
    model=chat_model,
    system_prompt=load_system_prompts(),
    tools=[rag_summarize, get_weather, ...],
    middleware=[monitor_tool, log_before_model, report_pormpt_switch],
)
`

Agent 的工作流程：
1. 接收用户输入
2. 根据 System Prompt 判断需要调用哪些工具
3. 按中间件链顺序执行工具调用
4. 汇总工具结果生成最终回答

### 3.3 面试高频问题

**Q: Agent 和 Chain 的区别？**
- Chain 是预定义好的固定流程（先 A 后 B）
- Agent 根据输入动态决策调用哪些工具，更灵活
- 本项目使用 Agent，因为用户问题多样，需要动态路由

**Q: ToolMiddleware 的作用？**
在 Agent 的工具调用链中插入拦截逻辑：
- monitor_tool：监控工具执行耗时和结果
- log_before_model：记录模型调用日志
- eport_pormpt_switch：根据上下文切换提示词（普通问答 vs 报告生成）

---

## 四、核心考点：向量数据库

### 4.1 ChromaDB 在本项目中的应用

`python
self.vector_store = Chroma(
    collection_name="agent",
    embedding_function=embed_model,
    persist_directory="chroma_db",
)
`

- 使用开源的 ChromaDB，轻量级且无需单独部署
- 数据持久化到 chroma_db 目录
- 初始化时自动加载已有向量数据

### 4.2 面试高频问题

**Q: 向量数据库和传统数据库有什么区别？**
- 传统数据库：精确匹配（WHERE id = 5）
- 向量数据库：相似度搜索（找到最相似的向量）
- 向量数据库使用 ANN (Approximate Nearest Neighbor) 算法
- ChromaDB 默认使用 HNSW (Hierarchical Navigable Small World) 索引

**Q: 本项目如何处理文档去重？**
- 使用 MD5 哈希校验文件唯一性
- 处理过的文件 MD5 存储在 md5.txt
- 新增文件时先计算 MD5，已存在则跳过

**Q: Embedding 模型的工作原理？**
将文本映射到高维空间中的向量，语义相近的文本在空间中的距离更近。本项目使用 	ext-embedding-v4 生成 768 维向量。

---

## 五、核心考点：前后端交互

### 5.1 SSE 流式对话

**为什么选择 SSE 而不是 WebSocket？**
| 维度 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 服务端→客户端单向 | 双向 |
| 协议 | HTTP（兼容性好） | 独立协议 |
| 实现复杂度 | 简单 | 复杂 |
| 适用场景 | AI 流式输出、消息推送 | 实时双工通信 |
| 自动重连 | 原生支持 | 需手动实现 |

**本项目 SSE 实现：**

后端 (FastAPI)：
`python
@app.post("/api/ai/chat")
async def ai_chat(body: dict):
    async def generate():
        for chunk in agent.execute_stream(question):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
`

前端 (React)：
`	ypescript
const response = await fetch(API_URL + '/api/ai/chat', { method: 'POST', body });
const reader = response.body.getReader();
while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: true });
    // 解析 SSE data: 行并渲染
}
`

### 5.2 架构选型：为什么不是 NestJS+PostgreSQL？

项目原本使用 NestJS + Lark 平台，但为了实现独立运行和开源，做了以下改造：

| 原方案 | 现方案 | 原因 |
|--------|--------|------|
| NestJS + PostgreSQL | Python FastAPI + 内存存储 | 无需数据库，零部署成本 |
| Lark capabilityClient | 原生 fetch | 去除平台绑定 |
| Lark 平台组件 | 原生 React 组件 | 跨平台可运行 |
| NODE_ENV=development(Unix) | set NODE_ENV=development(Windows) | Windows 兼容 |

### 5.3 面试高频问题

**Q: 前端如何处理流式数据的实时渲染？**
1. etch 获取 Response 对象
2. esponse.body.getReader() 获取流读取器
3. TextDecoder 解码二进制块
4. 按 \n 分割解析 SSE data 行
5. 每收到一个 chunk 就更新 React state，触发重新渲染

**Q: FastAPI 的 StreamingResponse 原理？**
基于 Python 的异步生成器 (async generator)，使用 Starlette 底层的 ASGI 协议实现 HTTP 长连接。yield 的每个数据块都会立即通过 HTTP 连接发送，不会被缓冲。

---

## 六、核心技术：LangChain Agent Tool

### 6.1 自定义工具函数

`python
@tool(description="从向量存储中检索参考资料")
def rag_summarize(query: str) -> str:
    return rag.rag_summarize(query)

@tool(description="获取指定城市的天气")
def get_weather(city: str) -> str:
    return f"城市{city}天气为晴天，气温26摄氏度"
`

### 6.2 工具设计原则

1. **描述清晰**：description 决定了 LLM 是否能正确选择工具
2. **参数明确**：类型注解帮助 LLM 理解参数含义
3. **错误处理**：工具内部应捕获异常，返回友好信息
4. **幂等性**：多次调用相同参数应返回相同结果

---

## 七、系统设计考量

### 7.1 可扩展性

- **知识库**：支持 PDF/TXT/Markdown 格式，可轻松扩展
- **模型切换**：通过 YAML 配置文件更换 LLM 模型
- **数据持久化**：当前使用内存存储，可替换为 SQLite/PostgreSQL

### 7.2 容错设计

- **Fallback 机制**：Agent 不可用时自动降级为模拟回复
- **异步报告生成**：报告生成失败不影响其他功能
- **CORS 全面开放**：前后端分离开发无跨域问题

### 7.3 面试题预测

**Q: 如果用户量从 1 增长到 10000，系统瓶颈在哪？如何优化？**
1. **内存存储 → 外置数据库**：替换为 SQLite/PostgreSQL/Redis
2. **向量检索 → 索引优化**：增加 HNSW 索引参数调优
3. **LLM 调用 → 缓存 + 限流**：对热门问题启用缓存
4. **前端 → 构建优化**：代码分割、懒加载、CDN 部署
5. **API → 水平扩展**：FastAPI 支持 Gunicorn 多进程

**Q: 如何评估 RAG 系统质量？**
1. 检索命中率：检索结果是否包含正确答案
2. 生成准确率：回答是否基于检索结果
3. 用户满意度：对话结束后的用户评分
4. 脏数据影响：删除知识后对应问题回答是否受影响

---

## 八、技术栈面试清单

### 前端
- React 19：Hooks 使用（useState, useEffect, useCallback）
- TypeScript：类型定义、泛型、接口设计
- Vite 7：模块热替换、构建优化
- TailwindCSS 4：原子化 CSS
- ECharts：数据可视化图表配置
- SSE 流式渲染：ReadableStream API

### 后端
- FastAPI：路由设计、请求验证、异常处理
- Uvicorn：ASGI 服务器、异步编程
- LangChain：Agent、Tool、Middleware 架构
- ChromaDB：向量存储、相似度搜索
- Embedding：文本向量化、语义检索

### 架构
- RAG 架构设计
- 前后端分离模式
- SSE 流式通信
- 内存数据存储
- 异步任务处理

---

## 九、项目亮点总结

1. **RAG 架构落地**：将理论 RAG 框架落地为可运行的智能客服系统，涵盖从文档索引到流式输出的全流程
2. **全栈独立部署**：前端 React + 后端 Python FastAPI，无需外部数据库和服务，单机即可运行
3. **流式对话体验**：SSE 技术实现 AI 回答逐字输出，用户体验接近 ChatGPT
4. **数据可视化**：ECharts 集成多种图表类型，直观展示运营数据
5. **架构解耦**：成功从 Lark 平台解耦，实现跨平台兼容
6. **容错设计**：Agent 降级、异步报告、异常处理覆盖全面
