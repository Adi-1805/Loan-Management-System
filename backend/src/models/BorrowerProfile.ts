import mongoose, { Document, Schema, Types } from 'mongoose';
import { EmploymentMode } from '../types';

export interface IBorrowerProfile extends Document {
  userId: Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl?: string;
  isBreApproved: boolean;
}

const borrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    employmentMode: {
      type: String,
      enum: Object.values(EmploymentMode),
      required: true,
    },
    salarySlipUrl: { type: String },
    isBreApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BorrowerProfile = mongoose.model<IBorrowerProfile>(
  'BorrowerProfile',
  borrowerProfileSchema
);
