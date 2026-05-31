import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paymentSchema } from '../validations/borrower.validation';
import { Role } from '../types';

const router = Router();

router.use(authenticate, authorize(Role.COLLECTION, Role.ADMIN));

router.post('/:loanId/payment', validate(paymentSchema), collectionController.recordPayment);
router.get('/:loanId/payments', collectionController.getPayments);

export default router;
