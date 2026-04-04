import { db } from '../config/firebase.config.js';

const COLLECTION = 'expenses';

/**
 * Yeni harcama oluşturur.
 */
const create = async (data) => {
  const ref = await db.collection(COLLECTION).add({
    ...data,
    createdAt: new Date().toISOString(),
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
};

/**
 * Kullanıcının belirtilen aya ait harcamalarını getirir.
 * @param {string} uid
 * @param {string} month  - Format: "YYYY-MM"
 */
const findByMonth = async (uid, month) => {
  const snap = await db
    .collection(COLLECTION)
    .where('userId', '==', uid)
    .where('month', '==', month)
    .orderBy('date', 'desc')
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Harcamayı günceller — sadece kendi harcamasını güncelleyebilir.
 */
const update = async (id, uid, data) => {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();

  if (!snap.exists || snap.data().userId !== uid) {
    return null;
  }

  await ref.update({ ...data, updatedAt: new Date().toISOString() });
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};

/**
 * Harcamayı siler — sadece kendi harcamasını silebilir.
 */
const remove = async (id, uid) => {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();

  if (!snap.exists || snap.data().userId !== uid) {
    return false;
  }

  await ref.delete();
  return true;
};

/**
 * Son 6 ay için aylık toplam harcamaları döner (trend grafik için).
 */
const findMonthlyTotals = async (uid, months) => {
  const results = await Promise.all(
    months.map(async (month) => {
      const snap = await db
        .collection(COLLECTION)
        .where('userId', '==', uid)
        .where('month', '==', month)
        .get();

      const total = snap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      return { month, total };
    })
  );
  return results;
};

export const ExpenseRepository = { create, findByMonth, update, remove, findMonthlyTotals };
