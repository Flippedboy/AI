import { Module, Global } from '@nestjs/common';
import { PluginCapabilityService } from './utils/capability';

@Global()
@Module({
  providers: [PluginCapabilityService],
  exports: [PluginCapabilityService],
})
export class CommonModule {}
