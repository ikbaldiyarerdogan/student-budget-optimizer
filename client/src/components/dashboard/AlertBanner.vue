<script setup>
defineProps({
  alerts: { type: Array, default: () => [] },
})

const TIPS = {
  kira:      ['Ev arkadaşı ile paylaşımlı yaşamayı değerlendir.', 'Şehir merkezinden biraz uzak, ulaşımı kolay semtlere bak.'],
  yemek:     ['Haftada 2 gün dışarıda yemekten kaçın — aylık ~600 TL tasarruf.', 'Haftalık yemek planı yaparak market alışverişini optimize et.', 'Öğrenci yemekhanelerini dene.'],
  ulasim:    ['Toplu taşıma abonmanı daha ekonomik olabilir.', 'Bisiklet veya yürüyüş ile kısa mesafeleri karşıla.'],
  faturalar: ['Kullanmadığın cihazları bekleme konumundan çıkar.', 'Mobil paketini gözden geçir.'],
  eglence:   ['Bu ay için eğlence limiti belirle.', 'Ücretsiz etkinlikleri (sergi, festival) değerlendir.', 'Abonelik hizmetlerini arkadaşlarınla paylaş.'],
  egitim:    ['İkinci el kitap platformlarını kullan.', 'Kütüphane ve e-kaynakları daha fazla kullan.'],
  diger:     ['Bu kategorideki harcamaları detaylı takip et.', 'Gerçekten ihtiyaç duyduğun alışverişleri 24 saat bekle.'],
}

function getTip(category) {
  const tips = TIPS[category] || []
  return tips[Math.floor(Math.random() * tips.length)] || ''
}

function formatTL(val) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
  <div v-if="alerts.length > 0" class="alert-section">
    <div class="alert-section-header">
      <h3 class="section-heading">⚠️ Bütçe Uyarıları</h3>
      <span class="badge" :class="alerts.some(a => a.status === 'critical') ? 'badge-danger' : 'badge-warning'">
        {{ alerts.length }} kategori
      </span>
    </div>

    <div class="alerts-grid">
      <div
        v-for="alert in alerts"
        :key="alert.category"
        class="alert-card"
        :class="alert.status === 'critical' ? 'alert-card--critical' : 'alert-card--warning'"
      >
        <div class="alert-card-header">
          <span class="alert-icon">{{ alert.icon }}</span>
          <div class="alert-info">
            <div class="alert-label">{{ alert.label }}</div>
            <div class="alert-meta">
              İdeal %{{ alert.idealPercent }} → Gerçek %{{ alert.actualPercent }}
              <span class="alert-over">+%{{ Math.abs(alert.diff).toFixed(1) }}</span>
            </div>
          </div>
          <span v-if="alert.status === 'critical'" class="alert-badge alert-badge--critical">Kritik</span>
          <span v-else class="alert-badge alert-badge--warning">Dikkat</span>
        </div>

        <div class="alert-tip">
          <span class="alert-tip-icon">💡</span>
          <span>{{ alert.tips && alert.tips.length > 0 ? alert.tips[0] : (getTip(alert.category) || 'Bu kategori için harcamalarınızı gözden geçirin.') }}</span>
        </div>

        <div v-if="alert.estimatedSaving > 0" class="alert-saving">
          Tahmini aylık fazla harcama:
          <strong :class="alert.status === 'critical' ? 'text-danger' : 'text-warning'">
            {{ formatTL(alert.estimatedSaving) }}
          </strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.section-heading {
  font-size: 1rem;
  font-weight: 600;
}
.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}
.alert-card {
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 1px solid;
  transition: all var(--trans-base);
}
.alert-card--warning {
  background: var(--warning-bg);
  border-color: var(--warning-border);
}
.alert-card--critical {
  background: var(--danger-bg);
  border-color: var(--danger-border);
}

.alert-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.alert-icon { font-size: 1.5rem; }
.alert-info { flex: 1; min-width: 0; }
.alert-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}
.alert-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}
.alert-over {
  font-weight: 600;
  margin-left: 4px;
}
.alert-card--critical .alert-over { color: var(--danger); }
.alert-card--warning  .alert-over { color: var(--warning); }

.alert-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 99px;
  white-space: nowrap;
  border: 1px solid;
}
.alert-badge--critical {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: var(--danger-border);
}
.alert-badge--warning {
  background: var(--warning-bg);
  color: var(--warning);
  border-color: var(--warning-border);
}

.alert-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}
.alert-tip-icon { flex-shrink: 0; }

.alert-saving {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: right;
}
</style>
