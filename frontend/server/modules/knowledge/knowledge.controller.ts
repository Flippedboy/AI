import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { KnowledgeService } from './knowledge.service';
import type {
  KnowledgeDocument,
  KnowledgeDocListParams,
  CreateKnowledgeDocParams,
  PaginatedResponse,
  KnowledgeStatus,
} from '@shared/api.interface';

@Controller('api/knowledge-documents')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async getDocuments(
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<PaginatedResponse<KnowledgeDocument>> {
    return this.knowledgeService.getDocuments({
      keyword,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Post()
  @NeedLogin()
  async createDocument(
    @Body() body: CreateKnowledgeDocParams
  ): Promise<{ id: string }> {
    return this.knowledgeService.createDocument(body);
  }

  @Delete(':id')
  @NeedLogin()
  async deleteDocument(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.knowledgeService.deleteDocument(id);
  }
}

@Controller('api/knowledge/status')
export class KnowledgeStatusController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async getStatus(): Promise<KnowledgeStatus> {
    return this.knowledgeService.getStatus();
  }
}
