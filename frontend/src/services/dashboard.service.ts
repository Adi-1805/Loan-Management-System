import { api } from './api';
import { ApiResponse, Loan, SalesLead } from '@/types';

export const dashboardService = {
  getStats: () =>
    api.get<
      ApiResponse<{
        stats: {
          totalUsers: number;
          totalLoans: number;
          applied: number;
          sanctioned: number;
          disbursed: number;
          closed: number;
          rejected: number;
        };
      }>
    >('/dashboard/stats'),

  getSales: (page = 1, search = '') =>
    api.get<
      ApiResponse<{
        data: SalesLead[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >('/dashboard/sales', { params: { page, search } }),

  getSanction: () => api.get<ApiResponse<{ loans: Loan[] }>>('/dashboard/sanction'),

  getDisbursement: () =>
    api.get<ApiResponse<{ loans: Loan[] }>>('/dashboard/disbursement'),

  getCollection: () =>
    api.get<ApiResponse<{ loans: Loan[] }>>('/dashboard/collection'),

  approveLoan: (loanId: string) =>
    api.patch<ApiResponse<{ loan: Loan }>>(`/sanction/${loanId}/approve`),

  rejectLoan: (loanId: string, rejectionReason: string) =>
    api.patch<ApiResponse<{ loan: Loan }>>(`/sanction/${loanId}/reject`, {
      rejectionReason,
    }),

  disburseLoan: (loanId: string) =>
    api.patch<ApiResponse<{ loan: Loan }>>(`/disbursement/${loanId}`),

  recordPayment: (
    loanId: string,
    data: { utrNumber: string; amount: number; paymentDate: string }
  ) =>
    api.post<ApiResponse<{ payment: unknown; loan: Loan }>>(
      `/collection/${loanId}/payment`,
      data
    ),
};
