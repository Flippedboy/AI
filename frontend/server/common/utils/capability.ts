import { Injectable, Inject, Logger } from '@nestjs/common';
import { CapabilityService } from '@lark-apaas/fullstack-nestjs-core';
import type {
  FloorRobotUsageReportGeneratorOneOutput,
  KnowledgeBaseStructuredExtractionOneOutput,
} from '@shared/plugin-types';

export const PLUGIN_IDS = {
  REPORT_GENERATOR: 'floor_robot_usage_report_generator_1',
  STRUCTURED_EXTRACTION: 'knowledge_base_structured_extraction_1',
} as const;

@Injectable()
export class PluginCapabilityService {
  private readonly logger = new Logger(PluginCapabilityService.name);

  constructor(
    @Inject(CapabilityService) private readonly capabilityService: CapabilityService
  ) {}

  async generateUsageReport(
    usageData: string,
    userInfo?: string
  ): Promise<string> {
    try {
      const result = (await this.capabilityService
        .load(PLUGIN_IDS.REPORT_GENERATOR)
        .call(
          'textGenerate',
          {
            usage_data: usageData,
            user_info: userInfo,
          } as unknown as Record<string, unknown>
        )) as FloorRobotUsageReportGeneratorOneOutput;
      return result.content;
    } catch (error) {
      this.logger.error('生成使用报告失败', error);
      throw error;
    }
  }

  async extractKnowledgeFragments(
    documentText: string
  ): Promise<unknown[]> {
    try {
      const result = (await this.capabilityService
        .load(PLUGIN_IDS.STRUCTURED_EXTRACTION)
        .call(
          'textToJson',
          {
            document_text: documentText,
          } as unknown as Record<string, unknown>
        )) as KnowledgeBaseStructuredExtractionOneOutput;
      return result.knowledge_fragments;
    } catch (error) {
      this.logger.error('知识库结构化提取失败', error);
      throw error;
    }
  }
}
