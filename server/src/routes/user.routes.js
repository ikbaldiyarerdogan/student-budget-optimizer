import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getProfile, upsertProfile, updateSettings } from '../controllers/user.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/me', getProfile);
router.post('/me', upsertProfile);
router.patch('/me/settings', updateSettings);

export default router;
