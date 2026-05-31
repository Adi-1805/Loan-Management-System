import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const sales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const search = (req.query.search as string) || '';
    const result = await dashboardService.getSalesLeads(page, limit, search);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const sanction = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loans = await dashboardService.getSanctionQueue();
    sendSuccess(res, { loans });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const disbursement = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const loans = await dashboardService.getDisbursementQueue();
    sendSuccess(res, { loans });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const collection = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const loans = await dashboardService.getCollectionQueue();
    sendSuccess(res, { loans });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const stats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await dashboardService.getAdminStats();
    sendSuccess(res, { stats });
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};
