import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as collectionService from '../services/collection.service';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const recordPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await collectionService.recordPayment(
      req.params.loanId as string,
      req.user!.userId,
      req.body
    );
    sendSuccess(res, result, 'Payment recorded');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getPayments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const payments = await collectionService.getPaymentsByLoan(req.params.loanId as string);
    sendSuccess(res, { payments });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};
