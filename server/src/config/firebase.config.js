import 'dotenv/config';
import admin from 'firebase-admin';

/**
 * Private key'i normalize eder.
 * .env'de 3 farklı yazım biçimi olabilir:
 *   1. Tırnaksız, literal \n  →  FIREBASE_PRIVATE_KEY=-----BEGIN...\n...
 *   2. Tırnaklı, literal \n   →  FIREBASE_PRIVATE_KEY="-----BEGIN...\n..."
 *   3. Yanlışlıkla gerçek satır sonu — dotenv bunu tek satıra alır
 */
function parsePrivateKey(raw) {
  if (!raw) return undefined;
  // Baştaki/sondaki tırnakları temizle (kullanıcı elle eklemişse)
  let key = raw.trim().replace(/^["']|["']$/g, '');
  // Literal \n → gerçek satır sonu
  key = key.replace(/\\n/g, '\n');
  return key;
}

const serviceAccount = {
  projectId:   process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey:  parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db   = admin.firestore();
export const auth = admin.auth();
export default admin;
