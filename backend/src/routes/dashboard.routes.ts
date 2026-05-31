import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

router.get('/stats', authorize(Role.ADMIN), dashboardController.stats);
router.get('/sales', authorize(Role.SALES, Role.ADMIN), dashboardController.sales);
router.get('/sanction', authorize(Role.SANCTION, Role.ADMIN), dashboardController.sanction);
router.get(
  '/disbursement',
  authorize(Role.DISBURSEMENT, Role.ADMIN),
  dashboardController.disbursement
);
router.get(
  '/collection',
  authorize(Role.COLLECTION, Role.ADMIN),
  dashboardController.collection
);

export default router;
