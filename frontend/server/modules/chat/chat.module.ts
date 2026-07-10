import { Module } from '@nestjs/common';
import { ChatController, QuickQuestionController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController, QuickQuestionController],
  providers: [ChatService],
})
export class ChatModule {}
