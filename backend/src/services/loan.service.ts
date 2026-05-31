import mongoose from 'mongoose';
import { Loan } from '../models/Loan';
import { LoanStatus, Role } from '../types';

export const getLoans = async (userId: string, role: Role) => {
  if (role === Role.BORROWER) {
    return Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
  }
  return Loan.find().sort({ createdAt: -1 }).populate('borrowerId', 'name email');
};

export const getLoanById = async (loanId: string, userId: string, role: Role) => {
  const loan = await Loan.findById(loanId).populate('borrowerId', 'name email');
  if (!loan) {
    throw new Error('Loan not found');
  }
  if (role === Role.BORROWER && loan.borrowerId.toString() !== userId) {
    throw new Error('Access denied');
  }
  return loan;
};

export const approveLoan = async (loanId: string, executiveId: string) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error('Loan not found');
  if (loan.status !== LoanStatus.APPLIED) {
    throw new Error('Only APPLIED loans can be sanctioned');
  }

  loan.status = LoanStatus.SANCTIONED;
  loan.sanctionedBy = new mongoose.Types.ObjectId(executiveId);
  loan.sanctionedAt = new Date();
  loan.rejectionReason = undefined;
  await loan.save();
  return loan;
};

export const rejectLoan = async (
  loanId: string,
  executiveId: string,
  rejectionReason: string
) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error('Loan not found');
  if (loan.status !== LoanStatus.APPLIED) {
    throw new Error('Only APPLIED loans can be rejected');
  }

  loan.status = LoanStatus.REJECTED;
  loan.sanctionedBy = new mongoose.Types.ObjectId(executiveId);
  loan.sanctionedAt = new Date();
  loan.rejectionReason = rejectionReason;
  await loan.save();
  return loan;
};

export const disburseLoan = async (loanId: string, executiveId: string) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error('Loan not found');
  if (loan.status !== LoanStatus.SANCTIONED) {
    throw new Error('Only SANCTIONED loans can be disbursed');
  }

  loan.status = LoanStatus.DISBURSED;
  loan.disbursedBy = new mongoose.Types.ObjectId(executiveId);
  loan.disbursedAt = new Date();
  await loan.save();
  return loan;
};
