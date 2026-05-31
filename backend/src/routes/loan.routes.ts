import { Router } from 'express';
import * as loanController from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', loanController.listLoans);
router.get('/:id', loanController.getLoan);

export default router;
