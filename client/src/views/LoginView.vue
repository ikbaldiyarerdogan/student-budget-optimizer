<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const error      = ref('')
const loading    = ref(false)
const showPass   = ref(false)

async function handleEmailLogin() {
  error.value = ''
  if (!form.email || !form.password) {
    error.value = 'Lütfen tüm alanları doldurun.'
    return
  }
  loading.value = true
  try {
    await authStore.signInEmail(form.email, form.password)
    const redirect = route.query.redirect || '/panel'
    router.push(redirect)
  } catch (err) {
    error.value = mapFirebaseError(err.message)
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.signInGoogle()
    router.push('/panel')
  } catch (err) {
    console.error('[Google Login hatası]', err)
    error.value = mapFirebaseError(err?.message || '')
  } finally {
    loading.value = false
  }
}

function mapFirebaseError(msg = '') {
  console.error('[Giriş hatası]', msg)   // Gerçek hatayı konsola yaz
  if (msg.includes('user-not-found'))        return 'Bu e-posta adresiyle kayıtlı hesap bulunamadı.'
  if (msg.includes('wrong-password'))        return 'Şifre hatalı.'
  if (msg.includes('invalid-credential'))    return 'E-posta veya şifre hatalı.'
  if (msg.includes('too-many-requests'))     return 'Çok fazla başarısız deneme. Lütfen bekleyin.'
  if (msg.includes('network-request-failed')) return 'İnternet bağlantınızı kontrol edin.'
  if (msg.includes('api-key-not-valid') || msg.includes('API_KEY_SERVICE_BLOCKED') || msg.includes('invalid-api-key'))
    return 'Firebase API Key geçersiz. client/.env dosyasını kontrol edin.'
  if (msg.includes('auth/configuration-not-found') || msg.includes('PROJECT_NOT_FOUND'))
    return 'Firebase projesi bulunamadı. client/.env içindeki PROJECT_ID\'yi kontrol edin.'
  if (msg.includes('popup-closed-by-user'))  return 'Google giriş penceresi kapatıldı.'
  if (msg.includes('popup-blocked'))         return 'Popup engellendi. Tarayıcı ayarlarını kontrol edin.'
  // Geliştime için gerçek mesajı göster
  return msg || 'Giriş sırasında bir hata oluştu.'
}
</script>

<template>
  <div class="auth-page">
    <!-- ─── Visual Panel ─────────────────────────────── -->
    <div class="auth-visual">
      <div class="auth-visual-bg"></div>
      <div class="auth-visual-content">
        <div class="visual-logo">
          <div class="auth-logo-icon" style="width:56px;height:56px;font-size:1.75rem;margin-bottom:24px">
            💰
          </div>
        </div>
        <h2 style="font-size:1.75rem;margin-bottom:12px;color:var(--text-primary)">
          Bütçeni Optimize Et
        </h2>
        <p style="color:var(--text-secondary);max-width:320px;text-align:center;line-height:1.7">
          Mikroiktisat prensiplerine dayalı bütçe analizi ile
          finansal hedeflerine ulaş.
        </p>

        <div class="visual-stats">
          <div class="visual-stat card">
            <div class="visual-stat-val">%22</div>
            <div class="visual-stat-label">İdeal yemek harcaması</div>
          </div>
          <div class="visual-stat card">
            <div class="visual-stat-val">2.660₺</div>
            <div class="visual-stat-label">Ortalama tasarruf</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Form Panel ────────────────────────────────── -->
    <div class="auth-form-side">
      <div class="auth-box">
        <!-- Logo -->
        <div class="auth-logo">
          <div class="auth-logo-icon">💰</div>
          <div>
            <div class="sidebar-logo-text">BütçeOptimizer</div>
            <div class="sidebar-logo-sub">Öğrenci Bütçe Yöneticisi</div>
          </div>
        </div>

        <h1 class="auth-title">Tekrar hoş geldin</h1>
        <p class="auth-subtitle">Hesabına giriş yap ve bütçeni yönetmeye devam et.</p>

        <!-- Google -->
        <button
          id="google-login-btn"
          class="btn btn-google btn-block"
          :disabled="loading"
          @click="handleGoogleLogin"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" />
          Google ile Devam Et
        </button>

        <div class="auth-divider">veya</div>

        <!-- Form -->
        <form @submit.prevent="handleEmailLogin" novalidate>
          <div class="form-group mb-4">
            <label for="login-email">E-posta Adresi</label>
            <div class="input-icon">
              <span class="icon">✉️</span>
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                placeholder="ornek@universite.edu.tr"
                autocomplete="email"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group mb-2">
            <label for="login-password">Şifre</label>
            <div class="input-icon">
              <span class="icon">🔒</span>
              <input
                id="login-password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                placeholder="En az 6 karakter"
                autocomplete="current-password"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="flex items-center justify-between mb-6" style="font-size:0.8125rem">
            <label class="flex items-center gap-2" style="color:var(--text-secondary);cursor:pointer">
              <input type="checkbox" v-model="showPass" />
              Şifreyi göster
            </label>
          </div>

          <!-- Error -->
          <div v-if="error" class="alert alert-danger mb-4" role="alert">
            ⚠️ {{ error }}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            class="btn btn-primary btn-block btn-lg"
            :class="{ 'btn-loading': loading }"
            :disabled="loading"
          >
            Giriş Yap
          </button>
        </form>

        <div class="auth-footer">
          Hesabın yok mu?
          <router-link to="/kayit">Ücretsiz kayıt ol →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-stats {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}
.visual-stat {
  padding: 16px 20px;
  text-align: center;
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}
.visual-stat-val {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--accent-2);
}
.visual-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}
.auth-visual-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}
</style>
