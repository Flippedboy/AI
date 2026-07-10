import { logger, axiosForBackend } from '../utils/api_client';
import type {
  ChatMessage,
  ChatMessageListParams,
  CreateChatMessageParams,
  PaginatedResponse,
  QuickQuestion,
} from '@shared/api.interface';

export async function getChatMessages(params: ChatMessageListParams): Promise<PaginatedResponse<ChatMessage>> {
  try {
    const response = await axiosForBackend({
      url: '/api/chat-messages',
      method: 'GET',
      params: params as Record<string, string | number | undefined>,
    });
    return response.data;
  } catch (error) {
    logger.error('获取对话消息失败', error);
    throw error;
  }
}

export async function createChatMessage(params: CreateChatMessageParams): Promise<{ id: string }> {
  try {
    const response = await axiosForBackend({
      url: '/api/chat-messages',
      method: 'POST',
      data: params,
    });
    return response.data;
  } catch (error) {
    logger.error('保存对话消息失败', error);
    throw error;
  }
}

export async function getQuickQuestions(): Promise<{ items: QuickQuestion[] }> {
  try {
    const response = await axiosForBackend({
      url: '/api/ai/quick-questions',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取快捷问题失败', error);
    throw error;
  }
}
