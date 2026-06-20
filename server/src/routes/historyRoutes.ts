import { Router } from 'express';
import * as historyController from '../controllers/historyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/daily', historyController.getDailySummary);
router.post('/log', historyController.logMedication);
router.get('/range', historyController.getHistoryByDateRange);
router.get('/:medicationId', historyController.getMedicationLogs);

export default router;
