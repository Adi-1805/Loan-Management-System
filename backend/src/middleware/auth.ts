import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';
import { JwtPayload, Role } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Unauthorized - No token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, 'Unauthorized - Invalid token', 401);
  }
};

export const authorize =
  (...roles: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Forbidden - Insufficient permissions', 403);
      return;
    }
    next();
  };
