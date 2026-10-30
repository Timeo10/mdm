import { fetchApi } from './api';
import {
  TierPendingApproval,
  SubmitTiersForApprovalDto,
  ApproveTiersDto,
  RejectTiersDto,
  ApprovalStatistics,
  ApprovalStatus,
} from '../types';

export const TierPendingApprovalApi = {
  getAll: (status?: ApprovalStatus) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<TierPendingApproval[]>(`/tiers-pending${query}`);
  },

  getById: (uuid: string) =>
    fetchApi<TierPendingApproval>(`/tiers-pending/${uuid}`),

  submit: (data: SubmitTiersForApprovalDto) =>
    fetchApi<TierPendingApproval>('/tiers-pending', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  bulkSubmit: (data: { tiers: SubmitTiersForApprovalDto[]; source: 'etl' | 'api'; submittedBy?: string }) =>
    fetchApi<{ submitted: number; errors: Array<{ index: number; error: string }> }>('/tiers-pending/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approve: (uuid: string, data: ApproveTiersDto) =>
    fetchApi(`/tiers-pending/${uuid}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reject: (uuid: string, data: RejectTiersDto) =>
    fetchApi<TierPendingApproval>(`/tiers-pending/${uuid}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (uuid: string) =>
    fetchApi<void>(`/tiers-pending/${uuid}`, {
      method: 'DELETE',
    }),

  getStatistics: () =>
    fetchApi<ApprovalStatistics>('/tiers-pending/statistics'),
};
