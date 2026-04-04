import { auth } from '../config/firebase.config.js';

/**
 * Firebase ID Token doğrulama middleware'i.
 * Her korumalı route'tan önce çalışır.
 * Geçerli token varsa req.user'ı doldurur ve devam eder.
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Yetkilendirme token\'ı bulunamadı.' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
};
