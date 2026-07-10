import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, desc, count } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { userReport } from '@server/database/schema';
import { PluginCapabilityService } from '../../common/utils/capability';
import type {
  UserReport,
  CreateUserReportParams,
  UserReportListParams,
  PaginatedResponse,
  ReportContent,
} from '@shared/api.interface';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly pluginService: PluginCapabilityService
  ) {}

  async createReport(params: CreateUserReportParams): Promise<{ id: string; status: string }> {
    const [result] = await this.db
      .insert(userReport)
      .values({
        userId: params.userId,
        month: params.month,
        status: 'generating',
      })
      .returning({ id: userReport.id, status: userReport.status });

    this.generateReportAsync(result.id, params.userId, params.month);

    return { id: result.id, status: result.status };
  }

  private async generateReportAsync(id: string, userId: string, month: string) {
    try {
      const usageData = JSON.stringify({
        userId,
        month,
        totalChats: Math.floor(Math.random() * 30) + 5,
        totalCleanCount: Math.floor(Math.random() * 30) + 10,
        totalArea: Math.floor(Math.random() * 200) + 50,
        frequentQuestions: [
          { question: '集尘袋何时更换', count: Math.floor(Math.random() * 5) + 1 },
          { question: '边刷清理方法', count: Math.floor(Math.random() * 4) + 1 },
        ],
      });

      const aiContent = await this.pluginService.generateUsageReport(usageData, userId);

      const content: ReportContent = {
        overview: {
          totalChats: Math.floor(Math.random() * 30) + 5,
          totalArea: Math.floor(Math.random() * 200) + 50,
          totalCleanCount: Math.floor(Math.random() * 30) + 10,
        },
        frequentQuestions: [
          { question: '集尘袋何时更换', count: Math.floor(Math.random() * 5) + 1 },
          { question: '边刷清理方法', count: Math.floor(Math.random() * 4) + 1 },
          { question: 'App连接失败', count: Math.floor(Math.random() * 3) + 1 },
        ],
        cleaningAdvice: aiContent || '建议增加客厅区域清扫频次，定期清理滤网和边刷，保持机器人最佳性能。',
        supplyReminder: [
          { item: '边刷', status: 'warning', detail: '已使用4个月，建议近期更换' },
          { item: '滤网', status: 'normal', detail: '状态良好' },
          { item: '尘袋', status: 'replace', detail: '已使用2个月，建议立即更换' },
        ],
      };

      await this.db
        .update(userReport)
        .set({
          status: 'success',
          content: JSON.stringify(content),
        })
        .where(eq(userReport.id, id));

      this.logger.log(`报告生成成功: ${id}`);
    } catch (error) {
      this.logger.error(`报告生成失败: ${id}`, error);
      await this.db
        .update(userReport)
        .set({ status: 'failed' })
        .where(eq(userReport.id, id));
    }
  }

  async getReport(id: string): Promise<UserReport> {
    const [result] = await this.db
      .select()
      .from(userReport)
      .where(eq(userReport.id, id));

    if (!result) {
      throw new Error('报告不存在');
    }

    let content: ReportContent | null = null;
    if (result.content) {
      try {
        content = JSON.parse(result.content) as ReportContent;
      } catch {
        content = null;
      }
    }

    return {
      id: result.id,
      userId: result.userId,
      month: result.month,
      content,
      status: result.status as 'generating' | 'success' | 'failed',
      exportUrlPdf: result.exportUrlPdf ?? undefined,
      exportUrlExcel: result.exportUrlExcel ?? undefined,
      createdAt: result.createdAt.toISOString(),
    };
  }

  async getReports(params: UserReportListParams): Promise<PaginatedResponse<UserReport>> {
    const { page = 1, pageSize = 10 } = params;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(userReport);

    const total = Number(totalResult.count);

    const results = await this.db
      .select()
      .from(userReport)
      .orderBy(desc(userReport.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items: UserReport[] = results.map((row) => {
      let content: ReportContent | null = null;
      if (row.content) {
        try {
          content = JSON.parse(row.content) as ReportContent;
        } catch {
          content = null;
        }
      }
      return {
        id: row.id,
        userId: row.userId,
        month: row.month,
        content,
        status: row.status as 'generating' | 'success' | 'failed',
        exportUrlPdf: row.exportUrlPdf ?? undefined,
        exportUrlExcel: row.exportUrlExcel ?? undefined,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return { items, total, page, pageSize };
  }
}
