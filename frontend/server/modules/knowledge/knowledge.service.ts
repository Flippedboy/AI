import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, desc, ilike, and, count, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { knowledgeDocument } from '@server/database/schema';
import type {
  KnowledgeDocument as KnowledgeDocType,
  KnowledgeDocListParams,
  CreateKnowledgeDocParams,
  PaginatedResponse,
  KnowledgeStatus,
} from '@shared/api.interface';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getDocuments(params: KnowledgeDocListParams): Promise<PaginatedResponse<KnowledgeDocType>> {
    const { keyword, page = 1, pageSize = 20 } = params;

    const whereConditions = [];
    if (keyword) {
      whereConditions.push(ilike(knowledgeDocument.name, `%${keyword}%`));
    }
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(knowledgeDocument)
      .where(whereClause);

    const total = Number(totalResult.count);

    const docs = await this.db
      .select()
      .from(knowledgeDocument)
      .where(whereClause)
      .orderBy(desc(knowledgeDocument.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items: KnowledgeDocType[] = docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type as 'pdf' | 'docx' | 'xlsx' | 'txt',
      size: doc.size,
      url: doc.url,
      status: doc.status as 'indexing' | 'success' | 'failed',
      quoteCount: doc.quoteCount,
      createdAt: doc.createdAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async createDocument(params: CreateKnowledgeDocParams): Promise<{ id: string }> {
    const [result] = await this.db
      .insert(knowledgeDocument)
      .values({
        name: params.name,
        type: params.type,
        size: params.size,
        url: params.url,
        status: 'indexing',
      })
      .returning({ id: knowledgeDocument.id });

    return { id: result.id };
  }

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    await this.db
      .delete(knowledgeDocument)
      .where(eq(knowledgeDocument.id, id));
    return { success: true };
  }

  async updateDocumentStatus(id: string, status: 'indexing' | 'success' | 'failed'): Promise<void> {
    await this.db
      .update(knowledgeDocument)
      .set({ status })
      .where(eq(knowledgeDocument.id, id));
  }

  async getStatus(): Promise<KnowledgeStatus> {
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(knowledgeDocument);

    const [successResult] = await this.db
      .select({ count: count() })
      .from(knowledgeDocument)
      .where(eq(knowledgeDocument.status, 'success'));

    const total = Number(totalResult.count);
    const successCount = Number(successResult.count);
    const indexSuccessRate = total > 0 ? Math.round((successCount / total) * 1000) / 10 : 100;

    const [lastResult] = await this.db
      .select({ updatedAt: knowledgeDocument.updatedAt })
      .from(knowledgeDocument)
      .orderBy(desc(knowledgeDocument.updatedAt))
      .limit(1);

    return {
      totalDocs: total,
      indexSuccessRate,
      lastUpdatedAt: lastResult?.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
