import { ExpenseService } from '../services/expense.service.js';

/**
 * GET /api/expenses?month=YYYY-MM — Aylık harcamalar + analiz
 */
export const getMonthlyData = async (req, res, next) => {
  try {
    const month = req.query.month ?? new Date().toISOString().substring(0, 7);
    const data = await ExpenseService.getMonthlyData(req.user.uid, month);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/expenses — Yeni harcama ekle
 */
export const createExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseService.addExpense(req.user.uid, req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/expenses/:id — Harcama güncelle
 */
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseService.updateExpense(req.params.id, req.user.uid, req.body);
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/expenses/:id — Harcama sil
 */
export const deleteExpense = async (req, res, next) => {
  try {
    await ExpenseService.deleteExpense(req.params.id, req.user.uid);
    res.json({ success: true, message: 'Harcama silindi.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/expenses/trend — Son 6 aylık trend
 */
export const getMonthlyTrend = async (req, res, next) => {
  try {
    const trend = await ExpenseService.getMonthlyTrend(req.user.uid);
    res.json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
};
