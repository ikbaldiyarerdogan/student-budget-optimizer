import { UserRepository } from '../repositories/user.repository.js';
import { DEFAULT_IDEAL_RATIOS } from './analyzer.service.js';

/**
 * Yeni kullanıcı kaydı sonrası profil oluşturur veya günceller.
 */
const upsertProfile = async (uid, { name, email, university }) => {
  return UserRepository.upsert(uid, {
    name,
    email,
    university: university ?? '',
    monthlyIncome: 0,
    idealRatios: DEFAULT_IDEAL_RATIOS,
    theme: 'dark',
    createdAt: new Date().toISOString(),
  });
};

/**
 * Kullanıcı profilini getirir.
 */
const getProfile = async (uid) => {
  const user = await UserRepository.findById(uid);
  if (!user) return null;
  return user;
};

/**
 * Aylık gelir ve/veya ideal oranları günceller.
 */
const updateSettings = async (uid, { monthlyIncome, idealRatios, university, theme }) => {
  const updates = {};
  if (monthlyIncome !== undefined) updates.monthlyIncome = monthlyIncome;
  if (idealRatios !== undefined) updates.idealRatios = idealRatios;
  if (university !== undefined) updates.university = university;
  if (theme !== undefined) updates.theme = theme;

  return UserRepository.update(uid, updates);
};

export const UserService = { upsertProfile, getProfile, updateSettings };
