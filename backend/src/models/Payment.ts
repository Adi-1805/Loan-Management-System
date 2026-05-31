import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  loanId: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  collectedBy: Types.ObjectId;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    utrNumber: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

paymentSchema.index({ utrNumber: 1 }, { unique: true });
paymentSchema.index({ loanId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
