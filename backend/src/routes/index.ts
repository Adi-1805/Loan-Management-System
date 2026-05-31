import { Router } from 'express';
import authRoutes from './auth.routes';
import borrowerRoutes from './borrower.routes';
import loanRoutes from './loan.routes';
import sanctionRoutes from './sanction.routes';
import disbursementRoutes from './disbursement.routes';
import collectionRoutes from './collection.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/borrower', borrowerRoutes);
router.use('/loans', loanRoutes);
router.use('/sanction', sanctionRoutes);
router.use('/disbursement', disbursementRoutes);
router.use('/collection', collectionRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
