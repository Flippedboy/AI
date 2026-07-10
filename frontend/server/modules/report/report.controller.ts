import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { ReportService } from './report.service';
import type {
  UserReport,
  CreateUserReportParams,
  UserReportListParams,
  PaginatedResponse,
} from '@shared/api.interface';

@Controller('api/user-reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @NeedLogin()
  async createReport(
    @Body() body: CreateUserReportParams
  ): Promise<{ id: string; status: string }> {
    return this.reportService.createReport(body);
  }

  @Get(':id')
  async getReport(@Param('id') id: string): Promise<UserReport> {
    return this.reportService.getReport(id);
  }

  @Get()
  async getReports(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<PaginatedResponse<UserReport>> {
    const params: UserReportListParams = {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.reportService.getReports(params);
  }
}
