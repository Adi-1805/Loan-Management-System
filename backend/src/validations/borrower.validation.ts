import { z } from 'zod';
import { EmploymentMode } from '../types';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  pan: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => panRegex.test(v), 'Invalid PAN format'),
  dateOfBirth: z.coerce.date(),
  monthlySalary: z.coerce.number().min(0),
  employmentMode: z.nativeEnum(EmploymentMode),
});

export const applyLoanSchema = z.object({
  principalAmount: z.coerce.number().min(50000).max(500000),
  tenureDays: z.coerce.number().min(30).max(365),
});

export const paymentSchema = z.object({
  utrNumber: z.string().min(5, 'UTR number is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentDate: z.coerce.date(),
});

export const rejectLoanSchema = z.object({
  rejectionReason: z.string().min(5, 'Rejection reason is required'),
});
