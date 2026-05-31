import { Router } from 'express';
import * as borrowerController from '../controllers/borrower.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { applyLoanSchema, profileSchema } from '../validations/borrower.validation';
import { Role } from '../types';
import { validateBre } from '../services/bre.service';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize(Role.BORROWER));

router.get('/profile', borrowerController.getProfile);
router.post('/profile', validate(profileSchema), borrowerController.createProfile);
router.post('/bre', validate(profileSchema), (req: AuthenticatedRequest, res) => {
  const bre = validateBre({
    dateOfBirth: req.body.dateOfBirth,
    monthlySalary: req.body.monthlySalary,
    employmentMode: req.body.employmentMode,
    pan: req.body.pan,
  });
  if (!bre.approved) {
    sendError(res, 'BRE validation failed', 400, bre.errors);
    return;
  }
  sendSuccess(res, { approved: true }, 'BRE validation passed');
});
router.post('/upload', upload.single('salarySlip'), borrowerController.uploadSlip);
router.post('/apply', validate(applyLoanSchema), borrowerController.applyLoan);
router.get('/loans', borrowerController.getMyLoans);

export default router;
