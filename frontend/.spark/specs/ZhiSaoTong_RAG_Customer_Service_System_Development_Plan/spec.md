# 技术方案

## 开发元信息

- 开发模式: 全栈应用
- 涉及层级: [数据库, 插件, 服务端, 前端]

## 页面路由与导航

### 页面路由
| 页面名称 | 路由路径 | 说明 |
|---------|---------|------|
| 智能对话页 | / | 应用首页，默认路由 |
| 知识库管理页 | /knowledge | 知识库文档上传与管理 |
| 数据看板页 | /dashboard | 核心指标展示与数据统计 |
| 使用报告页 | /report | 用户使用报告生成与导出 |
| 系统设置页 | /settings | 系统参数与界面偏好配置 |

### 导航设计
- 导航机制：页面路由
- 导航项：
  - 智能对话
  - 知识库管理
  - 数据看板
  - 使用报告
  - 系统设置

## 业务组件

| 组件 | 来源 | 关联页面 | 对应功能点 |
|------|------|---------|-----------|
| Button | shadcn/ui | 所有页面 | 操作按钮、快捷提问按钮 |
| Card | shadcn/ui | 所有页面 | 文档卡片、指标卡片、报告模块 |
| Badge | shadcn/ui | 知识库管理页 | 文档状态标签 |
| Input | shadcn/ui | 所有页面 | 搜索框、输入框 |
| Select | shadcn/ui | 使用报告页、系统设置页 | 下拉选择器 |
| Slider | shadcn/ui | 系统设置页 | 参数配置滑块 |
| Switch | shadcn/ui | 系统设置页 | 主题切换开关 |
| Dialog | shadcn/ui | 知识库管理页 | 删除确认弹窗 |
| Table | @lark-apaas/client-toolkit/antd-table | 数据看板页 | 明细数据展示 |
| ReactECharts | echarts-for-react | 数据看板页、使用报告页 | 折线图、柱状图、饼图 |
| Dropzone | react-dropzone | 知识库管理页 | 文档上传 |

## 数据模型

### 数据库设计

#### 对话消息表（chat_message）
用途：存储用户与AI的对话历史记录，支撑对话回溯与统计分析。
核心字段：
- session_id: varchar (会话ID，同一会话消息共享)
- content: text (消息内容)
- type: varchar ['user', 'ai'] (消息发送方类型)
- is_quick_question: boolean (是否为快捷问题)
- response_time: integer (AI响应耗时，单位毫秒)
关联关系：无独立关联，用于对话统计分析。

#### 知识库文档表（knowledge_document）
用途：存储知识库文档元信息与索引状态，支撑文档管理与RAG检索。
核心字段：
- name: varchar (文档名称)
- type: varchar ['pdf', 'docx', 'xlsx', 'txt'] (文档类型)
- size: integer (文件大小，单位字节)
- url: text (文件存储URL)
- status: varchar ['indexing', 'success', 'failed'] (索引状态)
- quote_count: integer (被引用次数)
关联关系：与对话消息为多对多关系，支持回溯引用来源。

#### 系统配置表（system_config）
用途：存储AI模型参数、知识库策略与界面偏好配置，全局生效。
核心字段：
- config_key: varchar (配置项键名，唯一)
- config_value: text (配置项值)
- config_type: varchar ['model', 'knowledge', 'interface'] (配置类型)
- description: varchar (配置项说明)
关联关系：全局单例配置，无其他表关联。

#### 用户报告表（user_report）
用途：存储生成的用户使用报告记录，支持查看与导出。
核心字段：
- user_id: varchar (目标用户ID)
- month: varchar (报告月份，格式YYYY-MM)
- content: text (报告内容JSON)
- status: varchar ['generating', 'success', 'failed'] (生成状态)
- export_url_pdf: text (PDF导出链接)
- export_url_excel: text (Excel导出链接)
关联关系：与用户为多对一关系。

## 插件设计

| 插件名称 | 基础插件 | 用途 | 调用方式 | 关联页面 | 输入参数 | 输出类型 |
|---------|---------|------|---------|---------|---------|---------|
| 智能对话回复 | ai-text-generate | 根据用户提问与知识库上下文生成流式回复 | 前端 callStream | 智能对话页 | {prompt: string, context: string[], modelParams: object} | stream\<string\> |
| 文档内容解析 | ai-doc-parser | 解析上传的知识库文档为纯文本内容 | 前端 call | 知识库管理页 | {fileUrl: File[]} | string |
| 报告内容生成 | ai-text-generate | 根据用户使用数据生成结构化报告内容 | 服务端调用 | 使用报告页 | {userId: string, month: string, usageData: object} | string |
| 知识库结构化提取 | ai-text-to-json | 从解析后的文档中提取结构化知识片段 | 服务端调用 | 知识库管理页 | {text: string, fields: object} | {fragments: Array<{content: string, metadata: object}>} |

## 业务模型

### API 设计

#### 智能对话页 相关
**页面路径**: /
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 发送消息获取AI回复 | 插件 | ai-text-generate |
| 保存对话历史 | API | POST /api/chat-messages |
| 获取历史对话 | API | GET /api/chat-messages |
| 获取快捷问题列表 | API | GET /api/quick-questions |

**所需 API**:
```typescript
// 获取历史对话记录 [领域模型: ChatMessage] [对应页面功能: 历史消息展示]
GET /api/chat-messages?sessionId=xxx&page=1&pageSize=20
Response: {
  items: Array<{
    id: string;
    content: string;
    type: 'user' | 'ai';
    createdAt: string;
  }>;
  total: number;
}

// 保存对话消息 [领域模型: ChatMessage] [对应页面功能: 消息持久化]
POST /api/chat-messages
Request Body: {
  sessionId: string;
  content: string;
  type: 'user' | 'ai';
  responseTime?: number;
}
Response: {
  id: string;
}

// 获取快捷问题列表 [领域模型: QuickQuestion] [对应页面功能: 快捷问题按钮展示]
GET /api/quick-questions
Response: {
  items: Array<{
    id: string;
    content: string;
  }>;
}
```

#### 知识库管理页 相关
**页面路径**: /knowledge
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 上传解析文档 | 插件 | ai-doc-parser + ai-text-to-json |
| 获取文档列表 | API | GET /api/knowledge-documents |
| 搜索文档 | API | GET /api/knowledge-documents?keyword=xxx |
| 删除文档 | API | DELETE /api/knowledge-documents/:id |
| 获取向量库状态 | API | GET /api/knowledge/status |

**所需 API**:
```typescript
// 获取知识库文档列表 [领域模型: KnowledgeDocument] [对应页面功能: 文档卡片展示]
GET /api/knowledge-documents?keyword=xxx&page=1&pageSize=20
Response: {
  items: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    status: 'indexing' | 'success' | 'failed';
    quoteCount: number;
    createdAt: string;
  }>;
  total: number;
}

// 上传文档元信息 [领域模型: KnowledgeDocument] [对应页面功能: 文档上传后保存]
POST /api/knowledge-documents
Request Body: {
  name: string;
  type: string;
  size: number;
  url: string;
}
Response: {
  id: string;
}

// 删除文档 [领域模型: KnowledgeDocument] [对应页面功能: 文档删除]
DELETE /api/knowledge-documents/:id
Response: {
  success: boolean;
}

// 获取向量库状态 [领域模型: KnowledgeStatus] [对应页面功能: 底部状态条展示]
GET /api/knowledge/status
Response: {
  totalDocs: number;
  indexSuccessRate: number;
  lastUpdatedAt: string;
}
```

#### 数据看板页 相关
**页面路径**: /dashboard
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 获取核心指标统计 | API | GET /api/dashboard/metrics |
| 获取对话趋势数据 | API | GET /api/dashboard/chat-trend |
| 获取热门问题排行 | API | GET /api/dashboard/hot-questions |
| 获取知识库引用占比 | API | GET /api/dashboard/knowledge-usage |

**所需 API**:
```typescript
// 获取核心指标统计 [领域模型: DashboardMetrics] [对应页面功能: 顶部指标卡展示]
GET /api/dashboard/metrics
Response: {
  totalChats: number;
  totalUsers: number;
  totalKnowledgeDocs: number;
  averageResponseTime: number;
  chatGrowthRate: number;
  userGrowthRate: number;
}

// 获取对话趋势数据 [领域模型: ChatTrend] [对应页面功能: 对话趋势折线图]
GET /api/dashboard/chat-trend?dimension=day&days=30
Response: {
  items: Array<{
    date: string;
    count: number;
  }>;
}

// 获取热门问题排行 [领域模型: HotQuestion] [对应页面功能: 热门问题柱状图]
GET /api/dashboard/hot-questions?limit=10
Response: {
  items: Array<{
    question: string;
    count: number;
  }>;
}

// 获取知识库引用占比 [领域模型: KnowledgeUsage] [对应页面功能: 知识库引用饼图]
GET /api/dashboard/knowledge-usage
Response: {
  items: Array<{
    docName: string;
    quoteCount: number;
    percentage: number;
  }>;
}
```

#### 使用报告页 相关
**页面路径**: /report
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 生成用户报告 | 插件 + API | POST /api/user-reports |
| 获取报告列表 | API | GET /api/user-reports |
| 导出报告为PDF/Excel | 平台能力 | 前端导出工具 |
| 获取用户列表 | 平台能力 | 内置用户系统 |

**所需 API**:
```typescript
// 生成用户使用报告 [领域模型: UserReport] [对应页面功能: 报告生成]
POST /api/user-reports
Request Body: {
  userId: string;
  month: string;
}
Response: {
  id: string;
  status: 'generating' | 'success' | 'failed';
}

// 获取报告详情 [领域模型: UserReport] [对应页面功能: 报告内容展示]
GET /api/user-reports/:id
Response: {
  id: string;
  userId: string;
  month: string;
  content: object;
  status: 'generating' | 'success' | 'failed';
  exportUrlPdf?: string;
  exportUrlExcel?: string;
  createdAt: string;
}

// 获取报告列表 [领域模型: UserReport] [对应页面功能: 历史报告查看]
GET /api/user-reports?page=1&pageSize=10
Response: {
  items: Array<{
    id: string;
    userId: string;
    userName: string;
    month: string;
    status: string;
    createdAt: string;
  }>;
  total: number;
}
```

#### 系统设置页 相关
**页面路径**: /settings
**功能全景**：
| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 获取系统配置 | API | GET /api/system-configs |
| 保存系统配置 | API | PUT /api/system-configs |
| 主题与字体设置保存 | 前端存储 | localStorage |

**所需 API**:
```typescript
// 获取系统配置列表 [领域模型: SystemConfig] [对应页面功能: 配置项展示]
GET /api/system-configs
Response: {
  items: Array<{
    key: string;
    value: string;
    type: 'model' | 'knowledge' | 'interface';
    description: string;
  }>;
}

// 批量更新系统配置 [领域模型: SystemConfig] [对应页面功能: 配置保存]
PUT /api/system-configs
Request Body: {
  configs: Array<{
    key: string;
    value: string;
  }>;
}
Response: {
  success: boolean;
}