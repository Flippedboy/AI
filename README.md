# 智扫通 · RAG 智能客服系统

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.139-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/LangChain-0.3-339933" alt="LangChain" />
  <img src="https://img.shields.io/badge/ChromaDB-0.6-FC6D26" alt="ChromaDB" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

> 基于 RAG 技术的扫地机器人智能客服系统。结合大语言模型与向量检索，为用户提供精准、高效的智能问答服务。

作为一个全栈项目，它将 Python FastAPI 后端与 React 前端有机结合，搭载 LangChain 框架和 ChromaDB 向量数据库，实现了从知识库管理到智能问答的完整闭环。

---

## 核心功能

### 智能对话
- RAG 检索增强生成，答案更准确
- SSE 流式响应，实时交互体验
- 快捷问题栏，一键咨询

### 数据看板
- ECharts 可视化报表
- 对话趋势分析
- 热门问题排行
- 知识库引用分布

### 知识库管理
- 支持 PDF/TXT 文档上传
- 自动索引处理
- 向量检索查询

### 使用报告
- AI 自动生成使用报告
- 耗材提醒与清洁建议
- 多用户支持

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | React 19, TypeScript, Vite 7, TailwindCSS 4 |
| 前端 UI | Radix UI, Lucide Icons, ECharts, Framer Motion |
| 后端 API | Python 3.12, FastAPI 0.139, Uvicorn |
| AI 引擎 | LangChain 0.3, ChatTongyi (qwen3-max), ChromaDB |
| 向量库 | ChromaDB, text-embedding-v4 (768维) |

---

## 快速开始

### 环境要求

- Python >= 3.9
- Node.js >= 22.0.0
- npm >= 10.0.0
- DASHSCOPE_API_KEY 环境变量（可选，用于 AI 对话）

### 启动方式

`ash
# 方式一：Windows 双击 start.bat
# 方式二：手动启动

# 终端 1 - Python 后端
cd backend
set PYTHONPATH=%cd%
python api_server.py

# 终端 2 - 前端
cd frontend
npm install --ignore-scripts
set NODE_ENV=development
npx vite --config vite.config.ts
`

### 访问地址

| 服务 | 地址 |
|---|---|
| 前端页面 | http://localhost:8080 |
| 后端 API | http://localhost:8000 |
| API 文档 | http://localhost:8000/docs |

---

## 项目结构

`
AI/
├── backend/                     # Python 后端
│   ├── api_server.py            # FastAPI API 服务（统一入口，含 Mock 数据）
│   ├── agent/                   # AI Agent
│   │   ├── agent_tools.py       # Agent 工具函数
│   │   ├── middleware.py        # Agent 中间件
│   │   └── react_agent.py       # ReAct Agent 实现
│   ├── rag/                     # RAG 引擎
│   │   ├── rag_service.py       # RAG 检索服务
│   │   ├── vector.py            # 向量数据库操作
│   │   └── vector_store.py      # ChromaDB 封装
│   ├── model/                   # 模型工厂
│   │   └── factory.py           # 语言模型工厂
│   └── utils/                   # 工具函数
│       ├── config_handler.py    # 配置处理
│       ├── file_handler.py      # 文件处理
│       └── logger_handler.py    # 日志处理
│
├── frontend/                    # 前端项目
│   ├── client/                  # React 客户端
│   │   └── src/
│   │       ├── api/             # API 接口层
│   │       ├── pages/           # 页面组件
│   │       │   ├── chat/        # 智能对话
│   │       │   ├── dashboard/   # 数据看板
│   │       │   ├── knowledge/   # 知识库管理
│   │       │   ├── report/      # 使用报告
│   │       │   └── settings/    # 系统设置
│   │       └── utils/           # 工具函数
│   ├── shared/                  # 前后端共享类型定义
│   │   └── api.interface.ts     # API 接口类型
│   └── server/                  # NestJS 服务端（保留扩展）
│
├── docs/screenshots/            # 界面截图（运行后自行截图替换）
├── start.bat                    # Windows 一键启动
├── start.ps1                    # PowerShell 启动脚本
└── README.md                    # 项目说明文档
`

---

## 界面预览

> 以下截图留空，启动项目后请自行截图替换到 \docs/screenshots/\ 目录

| 页面 | 预览 |
|------|------|
| 🏠 智能对话 | ![](docs/screenshots/chat.png) |
| 📊 数据看板 | ![](docs/screenshots/dashboard.png) |
| 📚 知识库管理 | ![](docs/screenshots/knowledge.png) |
| 📄 使用报告 | ![](docs/screenshots/report.png) |

---

## API 文档

| 方法 | 端点 | 说明 |
|---|---|---|
| GET | /api/health | 健康检查 |
| POST | /api/ai/chat | AI 对话 (SSE 流式) |
| GET | /api/ai/quick-questions | 快捷问题列表 |
| GET | /api/dashboard/metrics | 仪表盘概览指标 |
| GET | /api/dashboard/chat-trend | 对话趋势数据 |
| GET | /api/knowledge-documents | 知识文档列表 |
| POST | /api/knowledge-documents | 创建知识文档 |
| DELETE | /api/knowledge-documents/:id | 删除知识文档 |
| GET | /api/knowledge/status | 知识库状态 |
| POST | /api/user-reports | 创建使用报告 |
| GET | /api/user-reports | 报告列表 |
| GET | /api/user-reports/:id | 报告详情 |
| GET | /api/system-configs | 系统配置 |
| PUT | /api/system-configs | 更新系统配置 |

---

## 技术亮点

1. **前后端分离架构**：React 19 + FastAPI 高效协作，API 接口统一管理
2. **RAG 智能检索**：LangChain + ChromaDB 实现知识库语义检索，提升回答准确率
3. **SSE 流式响应**：支持对话流的实时展示，用户体验流畅
4. **完整的 Mock 数据**：后端内置模拟数据，无需外部依赖即可运行
5. **TypeScript 全栈**：前后端共享类型定义，减少接口对接错误
6. **现代化 UI**：React 19 + TailwindCSS 4 + Radix UI + ECharts 丰富可视化

---

MIT License
