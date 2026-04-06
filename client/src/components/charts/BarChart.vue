<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const props = defineProps({
  trendData: {
    type: Array,
    default: () => [],
  },
})

function formatMonth(str) {
  if (!str) return ''
  const [y, m] = str.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
}

const chartData = computed(() => ({
  labels: props.trendData.map(d => formatMonth(d.month)),
  datasets: [
    {
      label: 'Toplam Harcama',
      data: props.trendData.map(d => d.total),
      backgroundColor: 'rgba(124, 111, 247, 0.7)',
      borderColor: '#7c6ff7',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(167, 139, 250, 0.85)',
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(22,23,31,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f1f0f9',
      bodyColor: '#9491ae',
      padding: 12,
      callbacks: {
        label(ctx) {
          return ` ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(ctx.parsed.y)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      ticks: { color: '#9491ae', font: { size: 12 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      ticks: {
        color: '#9491ae',
        font: { size: 12 },
        callback(val) {
          if (val >= 1000) return (val / 1000).toFixed(0) + 'K ₺'
          return val + ' ₺'
        },
      },
      border: { display: false },
    },
  },
}))
</script>

<template>
  <div class="bar-chart-wrapper">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.bar-chart-wrapper {
  position: relative;
  width: 100%;
  height: 260px;
}
</style>
