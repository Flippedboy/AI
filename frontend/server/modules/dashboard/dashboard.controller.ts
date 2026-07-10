import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import type {
  DashboardMetrics,
  ChatTrendItem,
  HotQuestion,
  KnowledgeUsageItem,
} from '@shared/api.interface';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(): Promise<DashboardMetrics> {
    return this.dashboardService.getMetrics();
  }

  @Get('chat-trend')
  async getChatTrend(
    @Query('dimension') dimension?: string,
    @Query('days') days?: string
  ): Promise<{ items: ChatTrendItem[] }> {
    return this.dashboardService.getChatTrend({
      dimension: dimension as 'day' | 'week' | undefined,
      days: days ? parseInt(days, 10) : undefined,
    });
  }

  @Get('hot-questions')
  async getHotQuestions(@Query('limit') limit?: string): Promise<{ items: HotQuestion[] }> {
    return this.dashboardService.getHotQuestions(limit ? parseInt(limit, 10) : 10);
  }

  @Get('knowledge-usage')
  async getKnowledgeUsage(): Promise<{ items: KnowledgeUsageItem[] }> {
    return this.dashboardService.getKnowledgeUsage();
  }
}
