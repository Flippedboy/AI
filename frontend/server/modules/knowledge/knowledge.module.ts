import { Module } from '@nestjs/common';
import { KnowledgeController, KnowledgeStatusController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

@Module({
  controllers: [KnowledgeController, KnowledgeStatusController],
  providers: [KnowledgeService],
})
export class KnowledgeModule {}
