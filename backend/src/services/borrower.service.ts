import { BorrowerProfile } from '../models/BorrowerProfile';
import { Loan } from '../models/Loan';
import { EmploymentMode, LoanStatus } from '../types';
import { validateBre } from './bre.service';
import {
  calculateSimpleInterest,
  calculateTotalRepayment,
  roundCurrency,
} from '../utils/loanCalculator';

const INTEREST_RATE = 12;

export const saveProfile = async (
  userId: string,
  data: {
    fullName: string;
    pan: string;
    dateOfBirth: Date;
    monthlySalary: number;
    employmentMode: EmploymentMode;
  }
) => {
  const bre = validateBre({
    dateOfBirth: data.dateOfBirth,
    monthlySalary: data.monthlySalary,
    employmentMode: data.employmentMode,
    pan: data.pan,
  });

  if (!bre.approved) {
    return { approved: false, errors: bre.errors };
  }

  const profile = await BorrowerProfile.findOneAndUpdate(
    { userId },
    {
      userId,
      fullName: data.fullName,
      pan: data.pan.toUpperCase(),
      dateOfBirth: data.dateOfBirth,
      monthlySalary: data.monthlySalary,
      employmentMode: data.employmentMode,
      isBreApproved: true,
    },
    { upsert: true, new: true }
  );

  return { approved: true, profile };
};

export const uploadSalarySlip = async (userId: string, fileUrl: string) => {
  const profile = await BorrowerProfile.findOne({ userId });
  if (!profile || !profile.isBreApproved) {
    throw new Error('Complete BRE-approved profile before uploading salary slip');
  }

  profile.salarySlipUrl = fileUrl;
  await profile.save();
  return profile;
};

export const applyForLoan = async (
  userId: string,
  data: { principalAmount: number; tenureDays: number }
) => {
  const profile = await BorrowerProfile.findOne({ userId });
  if (!profile?.isBreApproved) {
    throw new Error('Profile must pass BRE before applying');
  }
  if (!profile.salarySlipUrl) {
    throw new Error('Upload salary slip before applying for a loan');
  }

  const BLOCKING_STATUSES = [
    LoanStatus.APPLIED,
    LoanStatus.SANCTIONED,
    LoanStatus.DISBURSED,
  ];

  const existingActiveLoan = await Loan.findOne({
    borrowerId: userId,
    status: { $in: BLOCKING_STATUSES },
  });

  if (existingActiveLoan) {
    const statusMessages: Record<string, string> = {
      [LoanStatus.APPLIED]: 'You already have a loan application under review.',
      [LoanStatus.SANCTIONED]: 'You have a sanctioned loan awaiting disbursement.',
      [LoanStatus.DISBURSED]: 'You have an active disbursed loan with outstanding repayment.',
    };
    throw new Error(
      statusMessages[existingActiveLoan.status] ??
        'You already have an active loan. Close or wait for rejection before applying again.'
    );
  }

  const simpleInterest = roundCurrency(
    calculateSimpleInterest(data.principalAmount, INTEREST_RATE, data.tenureDays)
  );
  const totalRepayment = roundCurrency(
    calculateTotalRepayment(data.principalAmount, simpleInterest)
  );

  const loan = await Loan.create({
    borrowerId: userId,
    principalAmount: data.principalAmount,
    tenureDays: data.tenureDays,
    interestRate: INTEREST_RATE,
    simpleInterest,
    totalRepayment,
    status: LoanStatus.APPLIED,
    totalPaid: 0,
    outstandingAmount: totalRepayment,
  });

  return loan;
};

export const getBorrowerProfile = async (userId: string) => {
  return BorrowerProfile.findOne({ userId });
};

export const getBorrowerLoans = async (userId: string) => {
  return Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
};
