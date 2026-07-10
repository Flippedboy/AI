/* 前后端共享的类型定义 */

// ========== 通用分页类型 ==========
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ========== 对话消息相关 ==========
export type ChatMessageType = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  type: ChatMessageType;
  isQuickQuestion: boolean;
  responseTime?: number;
  createdAt: string;
}

export interface ChatMessageListParams {
  sessionId: string;
  page?: number;
  pageSize?: number;
}

export interface CreateChatMessageParams {
  sessionId: string;
  content: string;
  type: ChatMessageType;
  isQuickQuestion?: boolean;
  responseTime?: number;
}

export interface QuickQuestion {
  id: string;
  content: string;
}

// ========== 知识库文档相关 ==========
export type KnowledgeDocStatus = 'indexing' | 'success' | 'failed';
export type KnowledgeDocType = 'pdf' | 'docx' | 'xlsx' | 'txt';

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: KnowledgeDocType;
  size: number;
  url: string;
  status: KnowledgeDocStatus;
  quoteCount: number;
  createdAt: string;
}

export interface KnowledgeDocListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateKnowledgeDocParams {
  name: string;
  type: KnowledgeDocType;
  size: number;
  url: string;
}

export interface KnowledgeStatus {
  totalDocs: number;
  indexSuccessRate: number;
  lastUpdatedAt: string;
}

// ========== 数据看板相关 ==========
export interface DashboardMetrics {
  totalChats: number;
  totalUsers: number;
  totalKnowledgeDocs: number;
  averageResponseTime: number;
  chatGrowthRate: number;
  userGrowthRate: number;
}

export interface ChatTrendItem {
  date: string;
  count: number;
}

export interface ChatTrendParams {
  dimension?: 'day' | 'week';
  days?: number;
}

export interface HotQuestion {
  question: string;
  count: number;
}

export interface KnowledgeUsageItem {
  docName: string;
  quoteCount: number;
  percentage: number;
}

// ========== 使用报告相关 ==========
export type UserReportStatus = 'generating' | 'success' | 'failed';

export interface UserReport {
  id: string;
  userId: string;
  userName?: string;
  month: string;
  content: ReportContent | null;
  status: UserReportStatus;
  exportUrlPdf?: string;
  exportUrlExcel?: string;
  createdAt: string;
}

export interface ReportContent {
  overview: {
    totalChats: number;
    totalArea: number;
    totalCleanCount: number;
  };
  frequentQuestions: Array<{
    question: string;
    count: number;
  }>;
  cleaningAdvice: string;
  supplyReminder: Array<{
    item: string;
    status: 'normal' | 'warning' | 'replace';
    detail: string;
  }>;
}

export interface CreateUserReportParams {
  userId: string;
  month: string;
}

export interface UserReportListParams {
  page?: number;
  pageSize?: number;
}

// ========== 系统配置相关 ==========
export type ConfigType = 'model' | 'knowledge' | 'interface';

export interface SystemConfig {
  key: string;
  value: string;
  type: ConfigType;
  description: string;
}

export interface UpdateSystemConfigsParams {
  configs: Array<{
    key: string;
    value: string;
  }>;
}
