import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body.email, req.body.password);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    sendError(res, (err as Error).message, 401);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    sendSuccess(res, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};
