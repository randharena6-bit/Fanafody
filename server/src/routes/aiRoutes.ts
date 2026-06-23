import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/chat', authMiddleware, aiController.chat);

export default router;
