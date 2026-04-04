import { UserService } from '../services/user.service.js';

/**
 * GET /api/users/me — Profil getir
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await UserService.getProfile(req.user.uid);
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/me — Profil oluştur/güncelle (ilk giriş sonrası)
 */
export const upsertProfile = async (req, res, next) => {
  try {
    const { name, email, university } = req.body;
    const user = await UserService.upsertProfile(req.user.uid, { name, email, university });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/me/settings — Gelir ve ideal oranları güncelle
 */
export const updateSettings = async (req, res, next) => {
  try {
    const user = await UserService.updateSettings(req.user.uid, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
