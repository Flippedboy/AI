import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';
import { ChatService } from './chat.service';
import type {
  ChatMessageListParams,
  CreateChatMessageParams,
  ChatMessage,
  PaginatedResponse,
  QuickQuestion,
} from '@shared/api.interface';

@Controller('api/chat-messages')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMessages(
    @Query('sessionId') sessionId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<PaginatedResponse<ChatMessage>> {
    return this.chatService.getMessages({
      sessionId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Post()
  @NeedLogin()
  async createMessage(
    @Body() body: CreateChatMessageParams
  ): Promise<{ id: string }> {
    return this.chatService.createMessage(body);
  }
}

@Controller('api/quick-questions')
export class QuickQuestionController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getQuickQuestions(): { items: QuickQuestion[] } {
    return this.chatService.getQuickQuestions();
  }
}
