import { logger, axiosForBackend } from '../utils/api_client';
import type {
  KnowledgeDocument,
  KnowledgeDocListParams,
  CreateKnowledgeDocParams,
  PaginatedResponse,
  KnowledgeStatus,
} from '@shared/api.interface';

export async function getKnowledgeDocuments(
  params?: KnowledgeDocListParams
): Promise<PaginatedResponse<KnowledgeDocument>> {
  try {
    const response = await axiosForBackend({
      url: '/api/knowledge-documents',
      method: 'GET',
      params: params as Record<string, string | number | undefined>,
    });
    return response.data;
  } catch (error) {
    logger.error('获取知识库文档失败', error);
    throw error;
  }
}

export async function createKnowledgeDocument(
  params: CreateKnowledgeDocParams
): Promise<{ id: string }> {
  try {
    const response = await axiosForBackend({
      url: '/api/knowledge-documents',
      method: 'POST',
      data: params,
    });
    return response.data;
  } catch (error) {
    logger.error('创建知识库文档失败', error);
    throw error;
  }
}

export async function deleteKnowledgeDocument(id: string): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend({
      url: `/api/knowledge-documents/${id}`,
      method: 'DELETE',
    });
    return response.data;
  } catch (error) {
    logger.error('删除知识库文档失败', error);
    throw error;
  }
}

export async function getKnowledgeStatus(): Promise<KnowledgeStatus> {
  try {
    const response = await axiosForBackend({
      url: '/api/knowledge/status',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取向量库状态失败', error);
    throw error;
  }
}
