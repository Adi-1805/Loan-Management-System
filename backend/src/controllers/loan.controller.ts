import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as loanService from '../services/loan.service';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const listLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loans = await loanService.getLoans(req.user!.userId, req.user!.role);
    sendSuccess(res, { loans });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loan = await loanService.getLoanById(
      req.params.id as string,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, { loan });
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const approve = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loan = await loanService.approveLoan(req.params.loanId as string, req.user!.userId);
    sendSuccess(res, { loan }, 'Loan sanctioned');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const reject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loan = await loanService.rejectLoan(
      req.params.loanId as string,
      req.user!.userId,
      req.body.rejectionReason
    );
    sendSuccess(res, { loan }, 'Loan rejected');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const disburse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loan = await loanService.disburseLoan(req.params.loanId as string, req.user!.userId);
    sendSuccess(res, { loan }, 'Loan disbursed');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};
