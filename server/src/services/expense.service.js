import { ExpenseRepository } from '../repositories/expense.repository.js';
import { analyzeBudget } from './analyzer.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Ayı "YYYY-MM" formatına çevirir.
 */
const toMonthKey = (dateStr) => dateStr.substring(0, 7);

/**
 * Yeni harcama ekler.
 */
const addExpense = async (uid, { category, amount, description, date }) => {
  if (!category || !amount || !date) {
    throw new AppError('Kategori, tutar ve tarih zorunludur.', 400);
  }
  if (amount <= 0) {
    throw new AppError('Tutar sıfırdan büyük olmalıdır.', 400);
  }

  return ExpenseRepository.create({
    userId: uid,
    category,
    amount,
    description: description ?? '',
    date,
    month: toMonthKey(date),
  });
};

/**
 * Aya ait harcamaları listeler ve bütçe analizini döner.
 */
const getMonthlyData = async (uid, month) => {
  const [expenses, user] = await Promise.all([
    ExpenseRepository.findByMonth(uid, month),
    UserRepository.findById(uid),
  ]);

  const spentByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const analysis = await analyzeBudget(
    user?.monthlyIncome ?? 0,
    spentByCategory,
    user?.idealRatios ?? {}
  );

  return { expenses, analysis };
};

/**
 * Harcamayı günceller.
 */
const updateExpense = async (id, uid, data) => {
  const updated = await ExpenseRepository.update(id, uid, data);
  if (!updated) throw new AppError('Harcama bulunamadı veya yetkiniz yok.', 404);
  return updated;
};

/**
 * Harcamayı siler.
 */
const deleteExpense = async (id, uid) => {
  const deleted = await ExpenseRepository.remove(id, uid);
  if (!deleted) throw new AppError('Harcama bulunamadı veya yetkiniz yok.', 404);
};

/**
 * Son 6 aylık toplam harcama trendini döner.
 */
const getMonthlyTrend = async (uid) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return ExpenseRepository.findMonthlyTotals(uid, months);
};

export const ExpenseService = { addExpense, getMonthlyData, updateExpense, deleteExpense, getMonthlyTrend };
