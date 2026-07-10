import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { SystemService } from './system.service';
import type { SystemConfig, UpdateSystemConfigsParams } from '@shared/api.interface';

@Controller('api/system-configs')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  async getConfigs(
    @Query('type') type?: string
  ): Promise<{ items: SystemConfig[] }> {
    return this.systemService.getConfigs(type);
  }

  @Put()
  @NeedLogin()
  async updateConfigs(
    @Body() body: UpdateSystemConfigsParams
  ): Promise<{ success: boolean }> {
    return this.systemService.updateConfigs(body);
  }
}
