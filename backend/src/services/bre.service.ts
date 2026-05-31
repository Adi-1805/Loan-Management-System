import { calculateAge } from '../utils/age';
import { EmploymentMode } from '../types';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export interface BreInput {
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  pan: string;
}

export interface BreResult {
  approved: boolean;
  errors: string[];
}

export const validateBre = (input: BreInput): BreResult => {
  const errors: string[] = [];
  const age = calculateAge(input.dateOfBirth);

  if (age < 23) {
    errors.push(`Age ${age} is below minimum requirement of 23 years`);
  }
  if (age > 50) {
    errors.push(`Age ${age} exceeds maximum limit of 50 years`);
  }
  if (input.monthlySalary < 25000) {
    errors.push(`Monthly salary ₹${input.monthlySalary} is below minimum ₹25,000`);
  }
  if (input.employmentMode === EmploymentMode.UNEMPLOYED) {
    errors.push('Unemployed applicants are not eligible for loans');
  }
  const pan = input.pan.toUpperCase().trim();
  if (!PAN_REGEX.test(pan)) {
    errors.push('Invalid PAN format. Expected format: ABCDE1234F');
  }

  return {
    approved: errors.length === 0,
    errors,
  };
};

export const PAN_REGEX_PATTERN = PAN_REGEX;
