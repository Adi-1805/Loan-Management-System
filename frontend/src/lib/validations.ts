import { z } from 'zod';
import { EmploymentMode } from '@/types';
import { PAN_REGEX } from './constants';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  pan: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => PAN_REGEX.test(v), 'Invalid PAN (e.g. ABCDE1234F)'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  monthlySalary: z.coerce.number().min(0),
  employmentMode: z.nativeEnum(EmploymentMode),
});

export const applyLoanSchema = z.object({
  principalAmount: z.coerce.number().min(50000).max(500000),
  tenureDays: z.coerce.number().min(30).max(365),
});

export const paymentSchema = z.object({
  utrNumber: z.string().min(5, 'UTR is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type ApplyLoanForm = z.infer<typeof applyLoanSchema>;
export type PaymentForm = z.infer<typeof paymentSchema>;
