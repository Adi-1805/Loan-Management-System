import { Router } from 'express';
import * as loanController from '../controllers/loan.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate, authorize(Role.DISBURSEMENT, Role.ADMIN));

router.patch('/:loanId', loanController.disburse);

export default router;
