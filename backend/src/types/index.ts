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

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}
