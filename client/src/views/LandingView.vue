<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Animated counter
const stats = ref([
  { value: 0, target: 2400, suffix: '₺', label: 'Ortalama aylık tasarruf' },
  { value: 0, target: 94,   suffix: '%', label: 'Kullanıcı memnuniyeti' },
  { value: 0, target: 8700, suffix: '+', label: 'Aktif öğrenci' },
])

onMounted(() => {
  stats.value.forEach((stat, i) => {
    setTimeout(() => {
      const duration = 1800
      const start = performance.now()
      function step(now) {
        const progress = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        stat.value = Math.floor(ease * stat.target)
        if (progress < 1) requestAnimationFrame(step)
        else stat.value = stat.target
      }
      requestAnimationFrame(step)
    }, i * 150)
  })
})

const features = [
  {
    icon: '📊',
    title: 'Akıllı Bütçe Analizi',
    desc: 'Mikroiktisat prensiplerine dayalı ideal harcama oranlarıyla gerçek harcamalarını karşılaştır.',
  },
  {
    icon: '⚡',
    title: 'Anlık Uyarılar',
    desc: 'Herhangi bir kategoride bütçeni aşmaya başladığında renkli uyarılarla anında haberdar ol.',
  },
  {
    icon: '💡',
    title: 'Tasarruf Önerileri',
    desc: 'Kategoriye özel, uygulanabilir tasarruf tavsiyeleriyle ayda yüzlerce lira biriktir.',
  },
]
</script>

<template>
  <div class="landing-page">
    <!-- ─── Navbar ──────────────────────────────────────── -->
    <nav class="landing-nav">
      <div class="landing-logo">
        <div class="auth-logo-icon" style="width:34px;height:34px;font-size:1rem">💰</div>
        <span class="landing-logo-text">BütçeOptimizer</span>
      </div>
      <div class="landing-nav-actions">
        <button class="btn btn-ghost btn-sm" @click="router.push('/giris')">
          Giriş Yap
        </button>
        <button class="btn btn-primary btn-sm" @click="router.push('/kayit')">
          Ücretsiz Başla
        </button>
      </div>
    </nav>

    <!-- ─── Hero ───────────────────────────────────────── -->
    <section class="landing-hero">
      <div class="hero-bg"></div>

      <span class="hero-badge">
        🎓 Üniversite öğrencileri için tasarlandı
      </span>

      <h1 class="hero-title">
        Paranı Akıllıca<br>Yönet, Geleceğini<br>Planla
      </h1>

      <p class="hero-subtitle">
        Aylık harcamalarını takip et, ideal bütçe oranlarıyla karşılaştır ve
        bilimsel tasarruf önerileriyle finansal özgürlüğe kavuş.
      </p>

      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" @click="router.push('/kayit')">
          Hemen Başla — Ücretsiz
        </button>
        <button class="btn btn-secondary btn-lg" @click="router.push('/giris')">
          Zaten hesabım var
        </button>
      </div>

      <!-- Stats row -->
      <div class="hero-stats">
        <div v-for="stat in stats" :key="stat.label" class="hero-stat">
          <div class="hero-stat-value">
            {{ stat.value.toLocaleString('tr-TR') }}{{ stat.suffix }}
          </div>
          <div class="hero-stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Floating dashboard preview -->
      <div class="hero-preview">
        <div class="preview-card card">
          <div class="preview-header">
            <span class="text-muted text-sm">Kasım 2025 — Özet</span>
            <span class="badge badge-success">✓ Normal</span>
          </div>
          <div class="preview-stats">
            <div class="preview-stat" v-for="item in [
              { label: 'Gelir', value: '12.500 ₺', color: 'var(--success)' },
              { label: 'Gider', value: '9.840 ₺',  color: 'var(--danger)'  },
              { label: 'Kalan', value: '2.660 ₺',  color: 'var(--accent-2)'},
            ]" :key="item.label">
              <div class="preview-stat-value" :style="{ color: item.color }">{{ item.value }}</div>
              <div class="preview-stat-label text-muted text-xs">{{ item.label }}</div>
            </div>
          </div>
          <div class="preview-bars">
            <div v-for="bar in [
              { label: 'Kira', pct: 72, status: 'success' },
              { label: 'Yemek', pct: 91, status: 'warning' },
              { label: 'Eğlence', pct: 130, status: 'danger' },
            ]" :key="bar.label" class="preview-bar-row">
              <div class="preview-bar-labels">
                <span class="text-xs text-secondary">{{ bar.label }}</span>
                <span class="text-xs" :class="`text-${bar.status === 'danger' ? 'danger' : bar.status === 'warning' ? 'warning' : 'success'}`">
                  {{ bar.pct }}%
                </span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :class="bar.status"
                  :style="{ width: Math.min(bar.pct, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Features ───────────────────────────────────── -->
    <section class="features-section">
      <span class="section-label">Özellikler</span>
      <h2 class="section-title">Bütçeni optimize etmek<br>hiç bu kadar kolay olmamıştı</h2>
      <p class="section-desc">
        Tek platform, her şey dahil. Harcama takibi, analiz, uyarılar ve öneriler.
      </p>

      <div class="features-grid">
        <div
          v-for="f in features"
          :key="f.title"
          class="feature-card card-glow"
        >
          <div class="feature-icon">{{ f.icon }}</div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ─── CTA Banner ─────────────────────────────────── -->
    <section class="cta-section">
      <div class="cta-box card">
        <div class="cta-glow"></div>
        <h2 style="font-size:2rem;margin-bottom:12px">Bugün başla, yarın fark et</h2>
        <p class="text-secondary" style="margin-bottom:32px;max-width:480px;margin-inline:auto">
          Ücretsiz hesap oluştur, bütçeni ayarla ve ilk analizini dakikalar içinde gör.
        </p>
        <button class="btn btn-primary btn-lg" @click="router.push('/kayit')">
          Ücretsiz Hesap Oluştur →
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <p class="text-muted text-sm text-center">
        © 2025 BütçeOptimizer — Üniversite öğrencileri için yapıldı 💜
      </p>
    </footer>
  </div>
</template>

<style scoped>
.landing-logo { display: flex; align-items: center; gap: 10px; }
.landing-logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--text-primary);
}
.landing-nav-actions { display: flex; align-items: center; gap: 10px; }

/* Stats row */
.hero-stats {
  display: flex;
  gap: 48px;
  margin-top: 56px;
  padding-top: 48px;
  border-top: 1px solid var(--border);
  animation: fadeInUp 0.7s ease 0.45s both;
}
.hero-stat { text-align: center; }
.hero-stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-stat-label { font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px; }

/* Hero preview card */
.hero-preview {
  margin-top: 64px;
  width: 100%;
  max-width: 460px;
  animation: fadeInUp 0.8s ease 0.5s both;
}
.preview-card {
  padding: 24px;
  background: rgba(17, 18, 24, 0.9);
  border-color: var(--border-strong);
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.preview-stat { text-align: center; }
.preview-stat-value { font-family: var(--font-display); font-weight: 700; font-size: 1.125rem; }
.preview-stat-label { margin-top: 2px; }
.preview-bars { display: flex; flex-direction: column; gap: 12px; }
.preview-bar-row { display: flex; flex-direction: column; gap: 6px; }
.preview-bar-labels { display: flex; justify-content: space-between; }

/* Features */
.feature-card { border-radius: var(--radius-xl); }

/* CTA */
.cta-section {
  padding: var(--space-12) var(--space-6);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}
.cta-box {
  padding: 64px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-2xl);
  border-color: var(--accent-border);
}
.cta-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,111,247,0.12), transparent);
  pointer-events: none;
}

/* Footer */
.landing-footer {
  padding: var(--space-8) var(--space-6);
  border-top: 1px solid var(--border);
}
</style>
