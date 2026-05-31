import { api } from './api';
import { ApiResponse, BorrowerProfile, Loan } from '@/types';
import { ProfileForm, ApplyLoanForm } from '@/lib/validations';

export const borrowerService = {
  getProfile: () => api.get<ApiResponse<{ profile: BorrowerProfile | null }>>('/borrower/profile'),

  validateBre: (data: ProfileForm) =>
    api.post<ApiResponse<{ approved: boolean }>>('/borrower/bre', data),

  saveProfile: (data: ProfileForm) =>
    api.post<ApiResponse<{ approved: boolean; profile: BorrowerProfile }>>('/borrower/profile', data),

  uploadSlip: (file: File) => {
    const formData = new FormData();
    formData.append('salarySlip', file);
    return api.post<ApiResponse<{ profile: BorrowerProfile; fileUrl: string }>>(
      '/borrower/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  applyLoan: (data: ApplyLoanForm) =>
    api.post<ApiResponse<{ loan: Loan }>>('/borrower/apply', data),

  getLoans: () => api.get<ApiResponse<{ loans: Loan[] }>>('/borrower/loans'),
};
