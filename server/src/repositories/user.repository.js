import { db } from '../config/firebase.config.js';

const USERS_COLLECTION = 'users';

/**
 * Kullanıcıyı Firestore'da oluşturur veya varsa döndürür.
 */
const upsert = async (uid, data) => {
  const ref = db.collection(USERS_COLLECTION).doc(uid);
  await ref.set(data, { merge: true });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
};

/**
 * UID ile kullanıcıyı getirir.
 */
const findById = async (uid) => {
  const snap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Kullanıcı profilini günceller.
 */
const update = async (uid, data) => {
  const ref = db.collection(USERS_COLLECTION).doc(uid);
  await ref.update({ ...data, updatedAt: new Date().toISOString() });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
};

export const UserRepository = { upsert, findById, update };
