import mongoose, { Document, Schema, Types } from 'mongoose';
import { LoanStatus } from '../types';

export interface ILoan extends Document {
  borrowerId: Types.ObjectId;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  sanctionedBy?: Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: Types.ObjectId;
  disbursedAt?: Date;
  rejectionReason?: string;
  totalPaid: number;
  outstandingAmount: number;
  createdAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    principalAmount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.LEAD,
    },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    rejectionReason: { type: String },
    totalPaid: { type: Number, default: 0 },
    outstandingAmount: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

loanSchema.index({ borrowerId: 1, status: 1 });
loanSchema.index({ status: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
