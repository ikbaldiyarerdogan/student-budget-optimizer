<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  categoryAnalysis: {
    type: Array,
    default: () => [],
  },
})

const COLORS = [
  '#7c6ff7', '#22d3ee', '#10b981', '#f59e0b',
  '#ef4444', '#a78bfa', '#34d399',
]

const chartData = computed(() => {
  const filtered = props.categoryAnalysis.filter(c => c.spent > 0)
  return {
    labels: filtered.map(c => c.label),
    datasets: [
      {
        data: filtered.map(c => c.spent),
        backgroundColor: COLORS.slice(0, filtered.length).map(c => c + 'cc'),
        borderColor: COLORS.slice(0, filtered.length),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(22,23,31,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f1f0f9',
      bodyColor: '#9491ae',
      padding: 12,
      callbacks: {
        label(ctx) {
          const val = ctx.parsed
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0
          return ` ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)}  (${pct}%)`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="pie-chart-wrapper">
    <div class="donut-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>

    <!-- Custom Legend -->
    <div class="legend">
      <div
        v-for="(cat, i) in categoryAnalysis.filter(c => c.spent > 0)"
        :key="cat.category"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: ['#7c6ff7','#22d3ee','#10b981','#f59e0b','#ef4444','#a78bfa','#34d399'][i] }" />
        <span class="legend-label">{{ cat.label }}</span>
        <span class="legend-pct">{{ cat.actualPercent }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pie-chart-wrapper {
  display: flex;
  gap: var(--space-6);
  align-items: center;
  flex-wrap: wrap;
}
.donut-container {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}
.legend {
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-label {
  flex: 1;
  color: var(--text-secondary);
}
.legend-pct {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.75rem;
}
</style>
