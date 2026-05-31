import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as borrowerService from '../services/borrower.service';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload';

export const createProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await borrowerService.saveProfile(req.user!.userId, req.body);
    if (!result.approved) {
      sendError(res, 'BRE validation failed', 400, result.errors);
      return;
    }
    sendSuccess(res, result, 'Profile saved and BRE approved');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const uploadSlip = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }
    const uploaded = await uploadBufferToCloudinary(
      req.file.buffer,
      'lms/salary-slips'
    );
    const fileUrl = uploaded.secure_url;
    const profile = await borrowerService.uploadSalarySlip(req.user!.userId, fileUrl);
    sendSuccess(res, { profile, fileUrl }, 'Salary slip uploaded');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const applyLoan = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const loan = await borrowerService.applyForLoan(req.user!.userId, req.body);
    sendSuccess(res, { loan }, 'Loan application submitted', 201);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const profile = await borrowerService.getBorrowerProfile(req.user!.userId);
    sendSuccess(res, { profile });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getMyLoans = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const loans = await borrowerService.getBorrowerLoans(req.user!.userId);
    sendSuccess(res, { loans });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};
