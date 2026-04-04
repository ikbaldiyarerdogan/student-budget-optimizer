import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getMonthlyData,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyTrend,
} from '../controllers/expense.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/trend', getMonthlyTrend);
router.get('/', getMonthlyData);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
