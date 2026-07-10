// ---- plugin:intelligent_customer_service_reply_1 ----
// ============================================================
// 插件 intelligent_customer_service_reply_1 (扫地机器人智能客服对话回复) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface IntelligentCustomerServiceReplyOneInput {
  /** 用户提出的扫地机器人相关问题 */
  user_question: string;
}

/**
 * capabilityClient.load('intelligent_customer_service_reply_1').call<IntelligentCustomerServiceReplyOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { response, content } = result;
 */
export interface IntelligentCustomerServiceReplyOneOutput {
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
}
// ---- end:intelligent_customer_service_reply_1 ----

// ---- plugin:knowledge_base_doc_parser_1 ----
// ============================================================
// 插件 knowledge_base_doc_parser_1 (知识库文档解析) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface KnowledgeBaseDocParserOneInput {
  /** 待解析的知识库文档文件 */
  knowledge_base_file: string[];
}

/**
 * capabilityClient.load('knowledge_base_doc_parser_1').call<KnowledgeBaseDocParserOneOutput>('parseDocToMarkdown', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content } = result;
 */
export interface KnowledgeBaseDocParserOneOutput {
  /** [object Object] */
  content: string;
}
// ---- end:knowledge_base_doc_parser_1 ----

// ---- plugin:knowledge_base_structured_extraction_1 ----
// ============================================================
// 插件 knowledge_base_structured_extraction_1 (知识库结构化提取) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface KnowledgeBaseStructuredExtractionOneInput {
  /** 解析后的文档文本内容 */
  document_text: string;
}

/**
 * capabilityClient.load('knowledge_base_structured_extraction_1').call<KnowledgeBaseStructuredExtractionOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { knowledge_fragments } = result;
 */
export interface KnowledgeBaseStructuredExtractionOneOutput {
  /** 知识片段列表，items schema: {content: string(知识内容), category: string(分类，可选值：故障排除/使用指导/配件保养/产品介绍), keywords: Array<string>(关键词数组)} */
  knowledge_fragments: unknown[];
}
// ---- end:knowledge_base_structured_extraction_1 ----

// ---- plugin:floor_robot_usage_report_generator_1 ----
// ============================================================
// 插件 floor_robot_usage_report_generator_1 (扫地机器人个性化使用报告生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FloorRobotUsageReportGeneratorOneInput {
  /** 扫地机器人用户使用数据，包括使用时长、清洁面积、清洁频次、故障记录、耗材使用情况等 */
  usage_data: string;
  /** 用户基础信息，如家庭面积、户型、使用习惯偏好等 */
  user_info?: string;
}

/**
 * capabilityClient.load('floor_robot_usage_report_generator_1').call<FloorRobotUsageReportGeneratorOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface FloorRobotUsageReportGeneratorOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:floor_robot_usage_report_generator_1 ----