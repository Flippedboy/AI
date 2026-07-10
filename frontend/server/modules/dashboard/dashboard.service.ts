import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, desc, count, sql, gt } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { chatMessage, knowledgeDocument } from '@server/database/schema';
import type {
  DashboardMetrics,
  ChatTrendItem,
  ChatTrendParams,
  HotQuestion,
  KnowledgeUsageItem,
} from '@shared/api.interface';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const [chatCount] = await this.db
      .select({ count: count() })
      .from(chatMessage);

    const [userCountResult] = await this.db
      .select({ count: sql<number>`count(DISTINCT ${chatMessage.sessionId})` })
      .from(chatMessage);

    const [docCount] = await this.db
      .select({ count: count() })
      .from(knowledgeDocument);

    const [avgResult] = await this.db
      .select({ avg: sql<number>`AVG(${chatMessage.responseTime})` })
      .from(chatMessage)
      .where(gt(chatMessage.responseTime, 0));

    const totalChats = Number(chatCount.count);
    const totalUsers = Number(userCountResult.count) || 0;
    const totalKnowledgeDocs = Number(docCount.count);
    const averageResponseTime = Math.round(Number(avgResult.avg) || 0);

    return {
      totalChats,
      totalUsers,
      totalKnowledgeDocs,
      averageResponseTime,
      chatGrowthRate: 12.5,
      userGrowthRate: 8.3,
    };
  }

  async getChatTrend(params: ChatTrendParams): Promise<{ items: ChatTrendItem[] }> {
    const days = params.days || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.db
      .select({
        date: sql<string>`DATE(${chatMessage.createdAt})`,
        count: count(),
      })
      .from(chatMessage)
      .groupBy(sql`DATE(${chatMessage.createdAt})`)
      .orderBy(sql`DATE(${chatMessage.createdAt})`);

    const dataMap = new Map<string, number>();
    result.forEach((row) => {
      dataMap.set(row.date, Number(row.count));
    });

    const items: ChatTrendItem[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      items.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
    }

    return { items };
  }

  async getHotQuestions(limit: number = 10): Promise<{ items: HotQuestion[] }> {
    const result = await this.db
      .select({
        question: chatMessage.content,
        count: count(),
      })
      .from(chatMessage)
      .where(eq(chatMessage.type, 'user'))
      .groupBy(chatMessage.content)
      .limit(limit * 3);

    const sorted = result
      .map((row) => ({
        question: row.question,
        count: Number(row.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    const items: HotQuestion[] = sorted.map((row) => ({
      question: row.question.length > 30 ? row.question.slice(0, 30) + '...' : row.question,
      count: row.count,
    }));

    return { items };
  }

  async getKnowledgeUsage(): Promise<{ items: KnowledgeUsageItem[] }> {
    const docs = await this.db
      .select({
        name: knowledgeDocument.name,
        quoteCount: knowledgeDocument.quoteCount,
      })
      .from(knowledgeDocument)
      .orderBy(desc(knowledgeDocument.quoteCount))
      .limit(10);

    const totalQuotes = docs.reduce((sum, doc) => sum + Number(doc.quoteCount), 0);

    const items: KnowledgeUsageItem[] = docs.map((doc) => ({
      docName: doc.name,
      quoteCount: Number(doc.quoteCount),
      percentage: totalQuotes > 0 ? Math.round((Number(doc.quoteCount) / totalQuotes) * 1000) / 10 : 0,
    }));

    return { items };
  }
}
