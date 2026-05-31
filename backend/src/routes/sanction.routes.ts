import { Router } from 'express';
import * as loanController from '../controllers/loan.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rejectLoanSchema } from '../validations/borrower.validation';
import { Role } from '../types';

const router = Router();

router.use(authenticate, authorize(Role.SANCTION, Role.ADMIN));

router.patch('/:loanId/approve', loanController.approve);
router.patch('/:loanId/reject', validate(rejectLoanSchema), loanController.reject);

export default router;
