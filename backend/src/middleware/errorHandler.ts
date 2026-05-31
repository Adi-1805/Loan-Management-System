import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err.message.includes('Only PDF')) {
    sendError(res, err.message, 400);
    return;
  }
  if (err.message.includes('File too large')) {
    sendError(res, 'File size must not exceed 5 MB', 400);
    return;
  }
  console.error(err);
  sendError(res, 'Internal server error', 500);
};
