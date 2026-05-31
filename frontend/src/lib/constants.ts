import { Role } from '@/types';

export const TOKEN_KEY = 'lms_token';
export const USER_KEY = 'lms_user';

export const INTEREST_RATE = 12;
export const MIN_LOAN = 50000;
export const MAX_LOAN = 500000;
export const MIN_TENURE = 30;
export const MAX_TENURE = 365;

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const ROLE_ROUTES: Record<Role, string[]> = {
  [Role.ADMIN]: ['/dashboard', '/dashboard/sales', '/dashboard/sanction', '/dashboard/disbursement', '/dashboard/collection'],
  [Role.BORROWER]: ['/borrower/profile', '/borrower/upload', '/borrower/apply'],
  [Role.SALES]: ['/dashboard', '/dashboard/sales'],
  [Role.SANCTION]: ['/dashboard', '/dashboard/sanction'],
  [Role.DISBURSEMENT]: ['/dashboard', '/dashboard/disbursement'],
  [Role.COLLECTION]: ['/dashboard', '/dashboard/collection'],
};

export const ROLE_HOME: Record<Role, string> = {
  [Role.ADMIN]: '/dashboard',
  [Role.BORROWER]: '/borrower/profile',
  [Role.SALES]: '/dashboard/sales',
  [Role.SANCTION]: '/dashboard/sanction',
  [Role.DISBURSEMENT]: '/dashboard/disbursement',
  [Role.COLLECTION]: '/dashboard/collection',
};
