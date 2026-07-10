import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, desc, and, like, count } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { chatMessage } from '@server/database/schema';
import type {
  ChatMessage as ChatMessageType,
  ChatMessageListParams,
  CreateChatMessageParams,
  PaginatedResponse,
  QuickQuestion,
} from '@shared/api.interface';

const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: '1', content: '如何更换边刷' },
  { id: '2', content: '地图重建失败怎么办' },
  { id: '3', content: '如何清理尘盒' },
  { id: '4', content: 'App连接失败' },
  { id: '5', content: '预约清扫设置' },
  { id: '6', content: '滤网多久换一次' },
];

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getMessages(params: ChatMessageListParams): Promise<PaginatedResponse<ChatMessageType>> {
    const { sessionId, page = 1, pageSize = 20 } = params;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(chatMessage)
      .where(eq(chatMessage.sessionId, sessionId));

    const total = Number(totalResult.count);

    const messages = await this.db
      .select()
      .from(chatMessage)
      .where(eq(chatMessage.sessionId, sessionId))
      .orderBy(chatMessage.createdAt)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items: ChatMessageType[] = messages.map((msg) => ({
      id: msg.id,
      sessionId: msg.sessionId,
      content: msg.content,
      type: msg.type as 'user' | 'ai',
      isQuickQuestion: msg.isQuickQuestion || false,
      responseTime: msg.responseTime ?? undefined,
      createdAt: msg.createdAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async createMessage(params: CreateChatMessageParams): Promise<{ id: string }> {
    const [result] = await this.db
      .insert(chatMessage)
      .values({
        sessionId: params.sessionId,
        content: params.content,
        type: params.type,
        isQuickQuestion: params.isQuickQuestion || false,
        responseTime: params.responseTime,
      })
      .returning({ id: chatMessage.id });

    return { id: result.id };
  }

  getQuickQuestions(): { items: QuickQuestion[] } {
    return { items: QUICK_QUESTIONS };
  }
}
