<script setup>
defineProps({
  category: { type: Object, required: true },
  // category: { key, label, icon, idealPct, actualPct, spent, diff, status, tips, estimatedSaving }
})

function formatTL(val) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY', maximumFractionDigits: 0,
  }).format(val)
}

function statusClass(status) {
  return { normal: 'success', warning: 'warning', critical: 'danger' }[status] || 'success'
}

function statusBadgeClass(status) {
  return { normal: 'badge-success', warning: 'badge-warning', critical: 'badge-danger' }[status] || 'badge-success'
}

function statusLabel(status) {
  return { normal: 'Normal', warning: 'Dikkat', critical: 'Kritik' }[status] || 'Normal'
}
</script>

<template>
  <div class="category-card card" :class="`card--${category.status}`">
    <div class="cc-header">
      <div class="cc-icon-label">
        <span class="cc-icon">{{ category.icon }}</span>
        <div>
          <div class="cc-label">{{ category.label }}</div>
          <div class="cc-spent">{{ formatTL(category.spent) }}</div>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span class="badge" :class="statusBadgeClass(category.status)">
          {{ statusLabel(category.status) }}
        </span>
        <span class="cc-pct-real" :class="`text-${statusClass(category.status)}`">
          %{{ category.actualPercent }}
        </span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="cc-progress">
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="statusClass(category.status)"
          :style="{ width: Math.min(category.actualPercent / category.idealPercent * 100, 100) + '%' }"
        ></div>
        <!-- Ideal marker -->
        <div class="ideal-marker" title="İdeal limit"></div>
      </div>
      <div class="cc-progress-labels">
        <span class="text-xs text-muted">%0</span>
        <span class="text-xs text-muted">İdeal: %{{ category.idealPercent }}</span>
      </div>
    </div>

    <!-- Diff info -->
    <div class="cc-diff" v-if="category.status !== 'normal'">
      <span class="text-xs" :class="`text-${statusClass(category.status)}`">
        İdealin {{ Math.abs(category.diff).toFixed(1) }}% üzerinde —
        tahmini fazla: {{ formatTL(category.estimatedSaving) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.category-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  transition: all var(--trans-base);
}
.category-card:hover { border-color: var(--border-strong); }
.card--warning { border-color: var(--warning-border) !important; }
.card--critical {
  border-color: var(--danger-border) !important;
  background: rgba(239, 68, 68, 0.04);
}

.cc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.cc-icon-label { display: flex; align-items: center; gap: var(--space-3); }
.cc-icon {
  font-size: 1.5rem;
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cc-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}
.cc-spent {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 2px;
}
.cc-pct-real {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
}

.cc-progress { position: relative; }
.progress-track { position: relative; }
.ideal-marker {
  position: absolute;
  right: 0; top: -4px; bottom: -4px;
  width: 2px;
  background: var(--border-strong);
  border-radius: 1px;
}
.cc-progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}
.cc-diff { margin-top: var(--space-3); }
</style>
