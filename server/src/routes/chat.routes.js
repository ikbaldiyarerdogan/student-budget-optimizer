import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { chat } from '../controllers/chat.controller.js';

const router = Router();

router.use(verifyToken);
router.post('/', chat);

export default router;
