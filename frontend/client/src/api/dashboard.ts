import { logger, axiosForBackend } from '../utils/api_client';
import type {
  DashboardMetrics,
  ChatTrendItem,
  ChatTrendParams,
  HotQuestion,
  KnowledgeUsageItem,
} from '@shared/api.interface';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await axiosForBackend({
      url: '/api/dashboard/metrics',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取看板指标失败', error);
    throw error;
  }
}

export async function getChatTrend(params?: ChatTrendParams): Promise<{ items: ChatTrendItem[] }> {
  try {
    const response = await axiosForBackend({
      url: '/api/dashboard/chat-trend',
      method: 'GET',
      params: params as Record<string, string | number | undefined>,
    });
    return response.data;
  } catch (error) {
    logger.error('获取对话趋势失败', error);
    throw error;
  }
}

export async function getHotQuestions(limit?: number): Promise<{ items: HotQuestion[] }> {
  try {
    const response = await axiosForBackend({
      url: '/api/dashboard/hot-questions',
      method: 'GET',
      params: { limit: String(limit ?? 10) },
    });
    return response.data;
  } catch (error) {
    logger.error('获取热门问题失败', error);
    throw error;
  }
}

export async function getKnowledgeUsage(): Promise<{ items: KnowledgeUsageItem[] }> {
  try {
    const response = await axiosForBackend({
      url: '/api/dashboard/knowledge-usage',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取知识库使用情况失败', error);
    throw error;
  }
}
