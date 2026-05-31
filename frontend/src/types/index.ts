export enum Role {
  ADMIN = 'ADMIN',
  BORROWER = 'BORROWER',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
}

export enum LoanStatus {
  LEAD = 'LEAD',
  APPLIED = 'APPLIED',
  REJECTED = 'REJECTED',
  SANCTIONED = 'SANCTIONED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export enum EmploymentMode {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface BorrowerProfile {
  _id: string;
  userId: string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl?: string;
  isBreApproved: boolean;
}

export interface Loan {
  _id: string;
  borrowerId: { _id: string; name: string; email: string } | string;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  sanctionedBy?: { name: string; email: string };
  sanctionedAt?: string;
  disbursedBy?: { name: string; email: string };
  disbursedAt?: string;
  rejectionReason?: string;
  totalPaid: number;
  outstandingAmount: number;
  createdAt: string;
}

export interface SalesLead {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  hasProfile: boolean;
}
