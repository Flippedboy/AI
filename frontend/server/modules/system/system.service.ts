import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { systemConfig } from '@server/database/schema';
import type { SystemConfig, UpdateSystemConfigsParams } from '@shared/api.interface';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getConfigs(configType?: string): Promise<{ items: SystemConfig[] }> {
    const result = configType
      ? await this.db.select().from(systemConfig).where(eq(systemConfig.configType, configType))
      : await this.db.select().from(systemConfig);

    const items: SystemConfig[] = result.map((row) => ({
      key: row.configKey,
      value: row.configValue,
      type: row.configType as 'model' | 'knowledge' | 'interface',
      description: row.description ?? '',
    }));

    return { items };
  }

  async updateConfigs(params: UpdateSystemConfigsParams): Promise<{ success: boolean }> {
    for (const config of params.configs) {
      await this.db
        .update(systemConfig)
        .set({ configValue: config.value })
        .where(eq(systemConfig.configKey, config.key));
    }

    return { success: true };
  }
}
