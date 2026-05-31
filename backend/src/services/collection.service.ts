import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { LoanStatus } from '../types';
import { roundCurrency } from '../utils/loanCalculator';

export const recordPayment = async (
  loanId: string,
  collectedBy: string,
  data: { utrNumber: string; amount: number; paymentDate: Date }
) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error('Loan not found');
  if (loan.status !== LoanStatus.DISBURSED) {
    throw new Error('Payments can only be recorded for DISBURSED loans');
  }

  if (data.amount > loan.outstandingAmount) {
    throw new Error(
      `Payment amount cannot exceed outstanding balance of ₹${loan.outstandingAmount}`
    );
  }

  const existingUtr = await Payment.findOne({ utrNumber: data.utrNumber });
  if (existingUtr) {
    throw new Error('UTR number already exists');
  }

  const payment = await Payment.create({
    loanId,
    utrNumber: data.utrNumber,
    amount: data.amount,
    paymentDate: data.paymentDate,
    collectedBy,
  });

  loan.totalPaid = roundCurrency(loan.totalPaid + data.amount);
  loan.outstandingAmount = roundCurrency(loan.totalRepayment - loan.totalPaid);

  if (loan.outstandingAmount <= 0) {
    loan.outstandingAmount = 0;
    loan.status = LoanStatus.CLOSED;
  }

  await loan.save();

  return { payment, loan };
};

export const getPaymentsByLoan = async (loanId: string) => {
  return Payment.find({ loanId }).sort({ paymentDate: -1 });
};
