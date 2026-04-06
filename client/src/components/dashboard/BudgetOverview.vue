<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.store.js'
import { useBudgetStore } from '../../stores/budget.store.js'

const authStore   = useAuthStore()
const budgetStore = useBudgetStore()

const stats = computed(() => {
  const birikimCat = budgetStore.categoryAnalysis.find(c => c.category === 'birikim')
  const birikimSpent = birikimCat ? birikimCat.spent : 0

  return [
    {
      id: 'income',
      label: 'Aylık Gelir',
      value: budgetStore.income,
      icon: '💰',
      color: 'var(--teal)',
      bgColor: 'var(--teal-bg)',
      grad: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    },
    {
      id: 'expense',
      label: 'Toplam Harcama',
      value: budgetStore.totalExpenses,
      icon: '💸',
      color: budgetStore.totalExpenses > budgetStore.income ? 'var(--danger)' : 'var(--warning)',
      bgColor: budgetStore.totalExpenses > budgetStore.income ? 'var(--danger-bg)' : 'var(--warning-bg)',
      grad: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    },
    {
      id: 'remaining',
      label: 'Kalan',
      value: budgetStore.remaining,
      icon: budgetStore.remaining >= 0 ? '✅' : '⚠️',
      color: budgetStore.remaining >= 0 ? 'var(--success)' : 'var(--danger)',
      bgColor: budgetStore.remaining >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
      grad: 'linear-gradient(135deg, #10b981, #34d399)',
    },
    {
      id: 'savings',
      label: 'Tasarruf Oranı',
      value: null,
      pct: budgetStore.savingsRate,
      icon: '📊',
      color: 'var(--accent-2)',
      bgColor: 'var(--accent-bg)',
      grad: 'linear-gradient(135deg, #7c6ff7, #a78bfa)',
    },
    {
      id: 'birikim',
      label: 'Aylık Birikim',
      value: birikimSpent,
      icon: '📈',
      color: 'var(--success)',
      bgColor: 'var(--success-bg)',
      grad: 'linear-gradient(135deg, #10b981, #34d399)',
    }
  ]
})

function formatTL(val) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
  <div class="budget-overview">
    <!-- No income set warning -->
    <div v-if="budgetStore.income === 0" class="alert alert-info mb-6">
      💡 Bütçe analizini görmek için <strong>Ayarlar</strong>'dan aylık gelirinizi girin.
    </div>

    <div class="overview-grid">
      <div
        v-for="stat in stats"
        :key="stat.id"
        class="stat-card card card-glow card-animate"
        :style="{ '--grad': stat.grad }"
      >
        <div class="stat-card-inner">
          <div class="stat-icon" :style="{ background: stat.bgColor, color: stat.color }">
            {{ stat.icon }}
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value" :style="{ color: stat.color }">
              <template v-if="stat.value !== null">{{ formatTL(stat.value) }}</template>
              <template v-else>%{{ stat.pct }}</template>
            </div>
          </div>
        </div>

        <!-- Income progress bar — only show if income set -->
        <div v-if="stat.id === 'expense' && budgetStore.income > 0" class="stat-progress-label" style="margin-top: 10px;">
          Gelirin %{{ Math.round((budgetStore.totalExpenses / budgetStore.income) * 100) }}'i harcandı
        </div>
        
        <div
          v-if="stat.id === 'expense' && budgetStore.income > 0"
          class="card-full-border-progress"
          :class="budgetStore.totalExpenses / budgetStore.income > 1 ? 'border-danger' : budgetStore.totalExpenses / budgetStore.income > 0.85 ? 'border-warning' : 'border-success'"
          :style="{ '--progress': Math.min((budgetStore.totalExpenses / budgetStore.income) * 100, 100) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-5);
}
.stat-card {
  padding: var(--space-5);
  position: relative;
  overflow: hidden;
  transition: all var(--trans-base);
}
.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--grad);
  opacity: 0.05;
  pointer-events: none;
}
.stat-card-inner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}
.stat-icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.stat-info { flex: 1; }
.stat-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 6px;
}
.stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-progress { margin-top: var(--space-4); }
.stat-progress-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 6px;
}
.card-full-border-progress {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: conic-gradient(var(--border-color) var(--progress, 0%), transparent 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 5;
}
.card-full-border-progress.border-success { --border-color: var(--success); }
.card-full-border-progress.border-warning { --border-color: var(--warning); }
.card-full-border-progress.border-danger  { --border-color: var(--danger); }

@media (max-width: 1200px) {
  .overview-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .overview-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .overview-grid { grid-template-columns: 1fr; }
}
</style>
