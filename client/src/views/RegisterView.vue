<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'

const router    = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name:       '',
  email:      '',
  university: '',
  password:   '',
  confirm:    '',
})
const error    = ref('')
const loading  = ref(false)
const showPass = ref(false)
const step     = ref(1) // 2-step kayıt

function validateStep1() {
  if (!form.name.trim()) return 'Ad Soyad gereklidir.'
  if (!form.email.trim() || !form.email.includes('@')) return 'Geçerli bir e-posta girin.'
  if (!form.university.trim()) return 'Üniversite adı gereklidir.'
  return null
}

function validateStep2() {
  if (form.password.length < 6) return 'Şifre en az 6 karakter olmalıdır.'
  if (form.password !== form.confirm) return 'Şifreler eşleşmiyor.'
  return null
}

function nextStep() {
  const err = validateStep1()
  if (err) { error.value = err; return }
  error.value = ''
  step.value = 2
}

async function handleRegister() {
  const err = validateStep2()
  if (err) { error.value = err; return }
  error.value = ''
  loading.value = true
  try {
    await authStore.register(form.email, form.password, form.name, form.university)
    router.push('/panel')
  } catch (e) {
    error.value = mapFirebaseError(e.message)
  } finally {
    loading.value = false
  }
}

async function handleGoogleRegister() {
  error.value = ''
  loading.value = true
  try {
    await authStore.signInGoogle()
    router.push('/panel')
  } catch {
    error.value = 'Google ile kayıt başarısız. Tekrar deneyin.'
  } finally {
    loading.value = false
  }
}

function mapFirebaseError(msg) {
  if (msg.includes('email-already-in-use')) return 'Bu e-posta adresi zaten kayıtlı.'
  if (msg.includes('weak-password'))        return 'Şifre çok zayıf. Daha güçlü bir şifre seç.'
  if (msg.includes('invalid-email'))        return 'Geçersiz e-posta adresi.'
  if (msg.includes('network-request-failed')) return 'İnternet bağlantınızı kontrol edin.'
  return 'Kayıt sırasında bir hata oluştu.'
}
</script>

<template>
  <div class="auth-page">
    <!-- ─── Visual Panel ─────────────────────────────── -->
    <div class="auth-visual">
      <div class="auth-visual-bg"></div>
      <div class="auth-visual-content">
        <div class="auth-logo-icon" style="width:56px;height:56px;font-size:1.75rem;margin-bottom:24px">
          💰
        </div>
        <h2 style="font-size:1.75rem;margin-bottom:12px;color:var(--text-primary)">
          İdeal Bütçe Oranları
        </h2>
        <div class="ratio-list">
          <div v-for="item in [
            { icon:'🏠', label:'Kira/Konut', pct:35 },
            { icon:'🍽️', label:'Yemek',      pct:22 },
            { icon:'🚌', label:'Ulaşım',     pct:12 },
            { icon:'💡', label:'Faturalar',  pct:8  },
            { icon:'🎮', label:'Eğlence',    pct:10 },
            { icon:'📚', label:'Eğitim',     pct:8  },
            { icon:'📦', label:'Diğer',      pct:5  },
          ]" :key="item.label" class="ratio-item">
            <span>{{ item.icon }} {{ item.label }}</span>
            <span class="ratio-pct">%{{ item.pct }}</span>
            <div class="progress-track" style="width:80px">
              <div class="progress-fill" :style="{ width: item.pct * 2 + 'px' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Form Panel ────────────────────────────────── -->
    <div class="auth-form-side">
      <div class="auth-box">
        <div class="auth-logo">
          <div class="auth-logo-icon">💰</div>
          <div>
            <div class="sidebar-logo-text">BütçeOptimizer</div>
            <div class="sidebar-logo-sub">Ücretsiz hesap oluştur</div>
          </div>
        </div>

        <h1 class="auth-title">Hesap Oluştur</h1>
        <p class="auth-subtitle">
          <span v-if="step === 1">Temel bilgilerini gir.</span>
          <span v-else>Şifreni belirle ve kayıt ol.</span>
        </p>

        <!-- Step indicator -->
        <div class="step-indicator mb-6">
          <div class="step-dot" :class="{ active: step >= 1 }">1</div>
          <div class="step-line"></div>
          <div class="step-dot" :class="{ active: step >= 2 }">2</div>
        </div>

        <!-- Google (step 1 only) -->
        <template v-if="step === 1">
          <button
            id="google-register-btn"
            class="btn btn-google btn-block"
            :disabled="loading"
            @click="handleGoogleRegister"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Google ile Kayıt Ol
          </button>
          <div class="auth-divider">veya e-posta ile</div>
        </template>

        <!-- Step 1 Form -->
        <form v-if="step === 1" @submit.prevent="nextStep" novalidate>
          <div class="form-group mb-4">
            <label for="reg-name">Ad Soyad</label>
            <div class="input-icon">
              <span class="icon">👤</span>
              <input id="reg-name" v-model="form.name" type="text" placeholder="Adın Soyadın" />
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="reg-email">E-posta</label>
            <div class="input-icon">
              <span class="icon">✉️</span>
              <input id="reg-email" v-model="form.email" type="email" placeholder="ornek@email.com" />
            </div>
          </div>
          <div class="form-group mb-6">
            <label for="reg-uni">Üniversite</label>
            <div class="input-icon">
              <span class="icon">🎓</span>
              <input id="reg-uni" v-model="form.university" type="text" placeholder="Üniversite adı" />
            </div>
          </div>

          <div v-if="error" class="alert alert-danger mb-4">⚠️ {{ error }}</div>

          <button id="reg-next-btn" type="submit" class="btn btn-primary btn-block btn-lg">
            Devam Et →
          </button>
        </form>

        <!-- Step 2 Form -->
        <form v-else @submit.prevent="handleRegister" novalidate>
          <div class="form-group mb-4">
            <label for="reg-pass">Şifre</label>
            <div class="input-icon">
              <span class="icon">🔒</span>
              <input
                id="reg-pass"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                placeholder="En az 6 karakter"
              />
            </div>
          </div>
          <div class="form-group mb-2">
            <label for="reg-confirm">Şifre Tekrar</label>
            <div class="input-icon">
              <span class="icon">🔒</span>
              <input
                id="reg-confirm"
                v-model="form.confirm"
                :type="showPass ? 'text' : 'password'"
                placeholder="Şifreni tekrar gir"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 mb-6" style="color:var(--text-secondary);cursor:pointer;font-size:0.8125rem">
            <input type="checkbox" v-model="showPass" />
            Şifreyi göster
          </label>

          <div v-if="error" class="alert alert-danger mb-4">⚠️ {{ error }}</div>

          <div class="flex gap-3">
            <button type="button" class="btn btn-secondary" @click="step = 1; error = ''">
              ← Geri
            </button>
            <button
              id="reg-submit-btn"
              type="submit"
              class="btn btn-primary btn-block btn-lg"
              :class="{ 'btn-loading': loading }"
              :disabled="loading"
            >
              Kayıt Ol
            </button>
          </div>
        </form>

        <div class="auth-footer">
          Zaten hesabın var mı?
          <router-link to="/giris">Giriş yap →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-visual-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 300px;
}
.ratio-list { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 20px; }
.ratio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.ratio-pct { color: var(--accent-2); font-weight: 600; font-size: 0.8125rem; min-width: 28px; }

/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
}
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--bg-glass);
  border: 1px solid var(--border-strong);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: all var(--trans-base);
}
.step-dot.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent-2);
}
.step-line {
  flex: 1;
  height: 1px;
  background: var(--border);
  max-width: 60px;
  margin: 0 8px;
}
</style>
