import { logger, axiosForBackend } from '../utils/api_client';
import type {
  UserReport,
  CreateUserReportParams,
  UserReportListParams,
  PaginatedResponse,
} from '@shared/api.interface';

export async function createUserReport(params: CreateUserReportParams): Promise<{ id: string; status: string }> {
  try {
    const response = await axiosForBackend({
      url: '/api/user-reports',
      method: 'POST',
      data: params,
    });
    return response.data;
  } catch (error) {
    logger.error('生成用户报告失败', error);
    throw error;
  }
}

export async function getUserReport(id: string): Promise<UserReport> {
  try {
    const response = await axiosForBackend({
      url: `/api/user-reports/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取报告详情失败', error);
    throw error;
  }
}

export async function getUserReports(
  params?: UserReportListParams
): Promise<PaginatedResponse<UserReport>> {
  try {
    const response = await axiosForBackend({
      url: '/api/user-reports',
      method: 'GET',
      params: params as Record<string, string | number | undefined>,
    });
    return response.data;
  } catch (error) {
    logger.error('获取报告列表失败', error);
    throw error;
  }
}
