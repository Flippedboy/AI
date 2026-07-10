import { logger, axiosForBackend } from '../utils/api_client';
import type { SystemConfig, UpdateSystemConfigsParams } from '@shared/api.interface';

export async function getSystemConfigs(): Promise<{ items: SystemConfig[] }> {
  try {
    const response = await axiosForBackend({
      url: '/api/system-configs',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取系统配置失败', error);
    throw error;
  }
}

export async function updateSystemConfigs(params: UpdateSystemConfigsParams): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend({
      url: '/api/system-configs',
      method: 'PUT',
      data: params,
    });
    return response.data;
  } catch (error) {
    logger.error('更新系统配置失败', error);
    throw error;
  }
}
