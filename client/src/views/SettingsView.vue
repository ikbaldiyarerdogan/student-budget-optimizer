<script setup>
import { ref, reactive, watch, computed } from 'vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppNavbar  from '../components/layout/AppNavbar.vue'
import { useAuthStore } from '../stores/auth.store.js'
import { useThemeStore } from '../stores/theme.store.js'

const authStore  = useAuthStore()
const themeStore = useThemeStore()

/* ── Income ─────────────────────────────────────────────────── */
const incomeInput = ref(authStore.monthlyIncome || '')
const incomeLoading = ref(false)
const incomeSaved   = ref(false)
const incomeError   = ref('')

watch(() => authStore.monthlyIncome, (val) => {
  incomeInput.value = val
})

async function saveIncome() {
  const amount = parseFloat(incomeInput.value)
  if (!amount || amount <= 0) {
    incomeError.value = 'Geçerli bir gelir tutarı girin.'
    return
  }
  incomeError.value = ''
  incomeLoading.value = true
  try {
    await authStore.updateMonthlyIncome(amount)
    incomeSaved.value = true
    setTimeout(() => (incomeSaved.value = false), 2500)
  } catch (e) {
    incomeError.value = 'Kaydedilemedi: ' + (e.message || 'Sunucu hatası')
  } finally {
    incomeLoading.value = false
  }
}

/* ── Ideal Ratios ────────────────────────────────────────────── */
const CATEGORY_LABELS = {
  kira: 'Kira / Konut',
  yemek: 'Yemek',
  ulasim: 'Ulaşım',
  faturalar: 'Faturalar',
  eglence: 'Eğlence',
  egitim: 'Eğitim',
  birikim: 'Birikim',
  diger: 'Diğer',
}

const ratios = reactive({ ...authStore.idealRatios })

watch(() => authStore.idealRatios, (val) => {
  Object.assign(ratios, val)
}, { immediate: true })

const ratioTotal = computed(() =>
  Object.values(ratios).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
)
const ratioValid = computed(() => Math.abs(ratioTotal.value - 100) < 0.5)

const ratioLoading = ref(false)
const ratioSaved   = ref(false)
const ratioError   = ref('')

async function saveRatios() {
  if (!ratioValid.value) {
    ratioError.value = `Oranlar toplamı %100 olmalıdır (şu an %${ratioTotal.value.toFixed(1)}).`
    return
  }
  ratioError.value = ''
  ratioLoading.value = true
  try {
    const parsed = Object.fromEntries(
      Object.entries(ratios).map(([k, v]) => [k, parseFloat(v)])
    )
    await authStore.updateIdealRatios(parsed)
    ratioSaved.value = true
    setTimeout(() => (ratioSaved.value = false), 2500)
  } catch (e) {
    ratioError.value = 'Kaydedilemedi: ' + (e.message || 'Sunucu hatası')
  } finally {
    ratioLoading.value = false
  }
}

function resetRatios() {
  Object.assign(ratios, {
    kira: 25, yemek: 22, ulasim: 12,
    faturalar: 8, eglence: 10, egitim: 8, birikim: 10, diger: 5,
  })
}

/* ── Theme ───────────────────────────────────────────────────── */
const currentTheme = computed(() => themeStore.theme)

async function toggleTheme(t) {
  try {
    await authStore.updateTheme(t)
    // themeStore is updated inside updateTheme
  } catch (e) {
    console.error('Tema güncellenemedi:', e)
    // fallback
    themeStore.setTheme(t)
  }
}

/* ── Format ──────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)
</script>

<template>
  <div class="app-layout">
    <AppSidebar />

    <div class="app-main">
      <AppNavbar title="Ayarlar" />

      <main class="page-content">
        <div class="settings-grid">

          <!-- ══ Aylık Gelir ══════════════════════════════════════ -->
          <section class="settings-card card">
            <div class="settings-card-header">
              <div class="settings-card-icon">💰</div>
              <div>
                <h3 class="settings-card-title">Aylık Gelir</h3>
                <p class="settings-card-desc">Bütçe hesaplamalarında kullanılacak gelir bilgisi.</p>
              </div>
            </div>

            <div class="settings-card-body">
              <!-- Current income display -->
              <div v-if="authStore.monthlyIncome" class="current-value-badge mb-4">
                <span>Mevcut Gelir:</span>
                <strong>{{ fmt(authStore.monthlyIncome) }}</strong>
              </div>

              <div class="form-group">
                <label for="income-input">Aylık Net Gelir (₺)</label>
                <div class="input-icon">
                  <span class="icon">₺</span>
                  <input
                    id="income-input"
                    v-model="incomeInput"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Örn: 10000"
                    @keydown.enter="saveIncome"
                  />
                </div>
                <p v-if="incomeError" class="form-error">⚠ {{ incomeError }}</p>
              </div>

              <div class="settings-actions">
                <button
                  id="save-income-btn"
                  class="btn btn-primary"
                  :class="{ 'btn-loading': incomeLoading }"
                  :disabled="incomeLoading"
                  @click="saveIncome"
                >
                  {{ incomeLoading ? '' : incomeSaved ? '✓ Kaydedildi' : 'Kaydet' }}
                </button>
                <Transition name="fade">
                  <span v-if="incomeSaved" class="saved-feedback">✓ Başarıyla güncellendi</span>
                </Transition>
              </div>
            </div>
          </section>

          <!-- ══ İdeal Bütçe Oranları ════════════════════════════ -->
          <section class="settings-card card">
            <div class="settings-card-header">
              <div class="settings-card-icon">🎯</div>
              <div>
                <h3 class="settings-card-title">İdeal Bütçe Oranları</h3>
                <p class="settings-card-desc">Analiz için hedef kategori oranlarını özelleştir.</p>
              </div>
            </div>

            <div class="settings-card-body">
              <!-- Total indicator -->
              <div class="ratio-total" :class="{ 'ratio-total-ok': ratioValid, 'ratio-total-err': !ratioValid }">
                <span>Toplam:</span>
                <strong>%{{ ratioTotal.toFixed(1) }}</strong>
                <span v-if="ratioValid" class="total-ok">✓</span>
                <span v-else class="total-err">≠ 100</span>
              </div>

              <div class="ratios-list">
                <div
                  v-for="(val, key) in ratios"
                  :key="key"
                  class="ratio-row"
                >
                  <label :for="`ratio-${key}`" class="ratio-label">
                    {{ CATEGORY_LABELS[key] ?? key }}
                  </label>
                  <div class="ratio-input-wrap">
                    <input
                      :id="`ratio-${key}`"
                      v-model="ratios[key]"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                    />
                    <span class="ratio-pct">%</span>
                  </div>
                  <div class="ratio-bar-track">
                    <div
                      class="ratio-bar-fill"
                      :style="{ width: Math.min(parseFloat(val) || 0, 100) + '%' }"
                    />
                  </div>
                </div>
              </div>

              <p v-if="ratioError" class="form-error mt-2">⚠ {{ ratioError }}</p>

              <div class="settings-actions mt-4">
                <button
                  id="save-ratios-btn"
                  class="btn btn-primary"
                  :class="{ 'btn-loading': ratioLoading }"
                  :disabled="ratioLoading || !ratioValid"
                  @click="saveRatios"
                >
                  {{ ratioLoading ? '' : ratioSaved ? '✓ Kaydedildi' : 'Oranları Kaydet' }}
                </button>
                <button class="btn btn-ghost" @click="resetRatios">
                  Varsayılana Sıfırla
                </button>
                <Transition name="fade">
                  <span v-if="ratioSaved" class="saved-feedback">✓ Başarıyla güncellendi</span>
                </Transition>
              </div>
            </div>
          </section>

          <!-- ══ Tema ════════════════════════════════════════════ -->
          <section class="settings-card card">
            <div class="settings-card-header">
              <div class="settings-card-icon">🎨</div>
              <div>
                <h3 class="settings-card-title">Görünüm</h3>
                <p class="settings-card-desc">Uygulama temasını seç.</p>
              </div>
            </div>

            <div class="settings-card-body">
              <div class="theme-switcher">
                <button
                  id="theme-dark-btn"
                  class="theme-btn"
                  :class="{ active: currentTheme === 'dark' }"
                  @click="toggleTheme('dark')"
                >
                  <span class="theme-preview dark-preview" />
                  <span>🌙 Koyu</span>
                </button>
                <button
                  id="theme-light-btn"
                  class="theme-btn"
                  :class="{ active: currentTheme === 'light' }"
                  @click="toggleTheme('light')"
                >
                  <span class="theme-preview light-preview" />
                  <span>☀️ Açık</span>
                </button>
              </div>
            </div>
          </section>

          <!-- ══ Profil Özeti ════════════════════════════════════ -->
          <section class="settings-card card">
            <div class="settings-card-header">
              <div class="settings-card-icon">👤</div>
              <div>
                <h3 class="settings-card-title">Profil Bilgileri</h3>
                <p class="settings-card-desc">Hesap bilgilerin.</p>
              </div>
            </div>
            <div class="settings-card-body">
              <div class="profile-row">
                <span class="profile-label">Ad Soyad</span>
                <span class="profile-value">{{ authStore.displayName }}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">E-posta</span>
                <span class="profile-value">{{ authStore.email }}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Üniversite</span>
                <span class="profile-value">{{ authStore.userProfile?.university || '—' }}</span>
              </div>
            </div>
          </section>

        </div><!-- /.settings-grid -->
      </main>
    </div>
  </div>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: var(--space-6);
  align-items: start;
}

/* Card */
.settings-card {
  overflow: hidden;
  transition: transform var(--trans-base), box-shadow var(--trans-base);
}
.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.settings-card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  border-bottom: 1px solid var(--border);
}
.settings-card-icon {
  font-size: 1.5rem;
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.settings-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}
.settings-card-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}
.settings-card-body {
  padding: var(--space-6);
}
.settings-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-5);
}
.saved-feedback {
  font-size: 0.8125rem;
  color: var(--success);
  font-weight: 500;
}

/* Current value */
.current-value-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.current-value-badge strong { color: var(--accent-2); }

/* Ratio total */
.ratio-total {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: var(--space-5);
  border: 1px solid;
}
.ratio-total-ok { background: var(--success-bg); border-color: var(--success-border); color: var(--success); }
.ratio-total-err { background: var(--danger-bg);  border-color: var(--danger-border);  color: var(--danger); }
.total-ok { margin-left: auto; font-weight: 700; }
.total-err { margin-left: auto; font-weight: 700; font-size: 0.75rem; }

/* Ratios list */
.ratios-list { display: flex; flex-direction: column; gap: var(--space-3); }
.ratio-row {
  display: grid;
  grid-template-columns: 120px 80px 1fr;
  align-items: center;
  gap: var(--space-3);
}
.ratio-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}
.ratio-input-wrap {
  position: relative;
}
.ratio-input-wrap input {
  width: 100%;
  padding: 6px 28px 6px 10px;
  font-size: 0.875rem;
  text-align: right;
}
.ratio-pct {
  position: absolute;
  right: 10px; top: 50%;
  transform: translateY(-50%);
  font-size: 0.8125rem;
  color: var(--text-muted);
  pointer-events: none;
}
.ratio-bar-track {
  height: 6px;
  background: var(--bg-glass);
  border-radius: 99px;
  overflow: hidden;
}
.ratio-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 0.4s ease;
}

/* Theme switcher */
.theme-switcher {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.theme-btn {
  flex: 1;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid var(--border);
  background: var(--bg-glass);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--trans-base);
  font-family: var(--font-body);
}
.theme-btn.active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent-2);
}
.theme-btn:hover:not(.active) {
  background: var(--bg-glass-hover);
}
.theme-preview {
  width: 80px; height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.dark-preview {
  background: linear-gradient(135deg, #0a0b0f 0%, #16171f 100%);
}
.light-preview {
  background: linear-gradient(135deg, #f4f5f9 0%, #ffffff 100%);
}

/* Profile */
.profile-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}
.profile-row:last-child { border-bottom: none; }
.profile-label { font-size: 0.8125rem; color: var(--text-secondary); }
.profile-value { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }

/* Spacing utils */
.mb-4 { margin-bottom: var(--space-4); }
.mt-2 { margin-top: var(--space-2); }
.mt-4 { margin-top: var(--space-4); }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
