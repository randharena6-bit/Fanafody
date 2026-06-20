import { Router } from 'express';
import * as medicationController from '../controllers/medicationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', medicationController.getMedications);
router.get('/today', medicationController.getTodaysMedications);
router.get('/:id', medicationController.getMedicationById);
router.post('/', medicationController.createMedication);
router.put('/:id', medicationController.updateMedication);
router.delete('/:id', medicationController.deleteMedication);

export default router;
