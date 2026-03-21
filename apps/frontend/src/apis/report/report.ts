import { apiClient } from '@/lib/fetchClient';

export interface CreateReportRequest {
  reportedId: number;
  reportType: string;
  content?: string;
}

export const createReport = async (data: CreateReportRequest): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>('/report', data, { authRequired: true });
};
