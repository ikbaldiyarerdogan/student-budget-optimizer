<script setup>
import { onMounted, ref, computed } from 'vue'
import AppSidebar   from '../components/layout/AppSidebar.vue'
import AppNavbar    from '../components/layout/AppNavbar.vue'
import PieChart     from '../components/charts/PieChart.vue'
import BarChart     from '../components/charts/BarChart.vue'
import { useBudgetStore } from '../stores/budget.store.js'
import apiClient from '../services/api.client.js'

const budgetStore = useBudgetStore()
const trendData   = ref([])
const trendLoading = ref(true)

const fmt = (n) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)

onMounted(async () => {
  // Ensure monthly data is fetched (dashboard may have pre-loaded it)
  if (!budgetStore.analysis) {
    await budgetStore.fetchMonthlyData()
  }

  // Fetch 6-month trend from server
  // Interceptor returns { success, data }, so unwrap .data
  try {
    const res = await apiClient.get('/expenses/trend')
    trendData.value = res?.data ?? res ?? []
  } catch {
    trendData.value = []
  } finally {
    trendLoading.value = false
  }
})

const hasCategoryData = computed(() =>
  budgetStore.categoryAnalysis.some(c => c.spent > 0)
)

// Compute top saving opportunity
const topSaving = computed(() => {
  const items = budgetStore.categoryAnalysis
    .filter(c => c.status !== 'normal')
    .sort((a, b) => b.estimatedSaving - a.estimatedSaving)
  return items[0] ?? null
})

// Highest spend category
const topSpend = computed(() => {
  return [...budgetStore.categoryAnalysis]
    .sort((a, b) => b.spent - a.spent)
    .filter(c => c.spent > 0)[0] ?? null
})

// Months with highest spending in trend
const trendPeak = computed(() => {
  if (!trendData.value.length) return null
  return [...trendData.value].sort((a, b) => b.total - a.total)[0]
})

function formatMonth(str) {
  if (!str) return ''
  const [y, m] = str.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar />

    <div class="app-main">
      <AppNavbar title="Raporlar & Grafikler" />

      <main class="page-content">
        <!-- Loading -->
        <div v-if="budgetStore.loading || trendLoading" class="loading-state">
          <div class="spinner" />
          <span>Raporlar yükleniyor…</span>
        </div>

        <template v-else>
          <!-- ── Summary KPIs ── -->
          <div class="kpi-grid mb-8">
            <div class="card kpi-card">
              <div class="kpi-icon" style="--kpi-color:#7c6ff7">📊</div>
              <div class="kpi-value">{{ fmt(budgetStore.totalExpenses) }}</div>
              <div class="kpi-label">Bu Ay Harcama</div>
            </div>
            <div class="card kpi-card">
              <div class="kpi-icon" style="--kpi-color:#10b981">💚</div>
              <div class="kpi-value">{{ budgetStore.savingsRate }}%</div>
              <div class="kpi-label">Tasarruf Oranı</div>
            </div>
            <div class="card kpi-card">
              <div class="kpi-icon" style="--kpi-color:#22d3ee">🏆</div>
              <div class="kpi-value">{{ topSpend?.label ?? '—' }}</div>
              <div class="kpi-label">En Yüksek Kategori</div>
            </div>
            <div class="card kpi-card" v-if="topSaving">
              <div class="kpi-icon" style="--kpi-color:#f59e0b">💡</div>
              <div class="kpi-value">{{ fmt(topSaving.estimatedSaving) }}</div>
              <div class="kpi-label">Tasarruf Fırsatı</div>
            </div>
          </div>

          <!-- ── Charts Row ── -->
          <div class="charts-row mb-8">
            <!-- Pie chart -->
            <div class="card card-body chart-card">
              <div class="chart-header mb-4">
                <h3 class="chart-title">Kategori Dağılımı</h3>
                <span class="chart-subtitle">{{ budgetStore.currentMonthLabel }}</span>
              </div>

              <div v-if="!hasCategoryData" class="empty-chart">
                <div class="empty-icon">🥧</div>
                <p>Bu ay henüz harcama yok.</p>
              </div>
              <PieChart v-else :category-analysis="budgetStore.categoryAnalysis" />
            </div>

            <!-- Bar chart -->
            <div class="card card-body chart-card">
              <div class="chart-header mb-4">
                <h3 class="chart-title">Aylık Trend</h3>
                <span class="chart-subtitle">Son 6 Ay</span>
              </div>

              <div v-if="!trendData.length" class="empty-chart">
                <div class="empty-icon">📉</div>
                <p>Henüz yeterli trend verisi yok.</p>
              </div>
              <BarChart v-else :trend-data="trendData" />
            </div>
          </div>

          <!-- ── Category Table ── -->
          <section class="card mb-8">
            <div class="card-header">
              <h3 class="chart-title">Kategori Detay Analizi</h3>
              <span class="badge badge-accent">{{ budgetStore.currentMonthLabel }}</span>
            </div>

            <div v-if="!hasCategoryData" class="empty-chart" style="padding:var(--space-12)">
              <div class="empty-icon">📋</div>
              <p>Bu ay henüz harcama yok.</p>
            </div>

            <div v-else class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Harcama</th>
                    <th>İdeal Oran</th>
                    <th>Gerçek Oran</th>
                    <th>Fark</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="cat in budgetStore.categoryAnalysis"
                    :key="cat.category"
                    class="cat-row"
                  >
                    <td class="cat-name-cell">{{ cat.label }}</td>
                    <td class="text-primary font-semibold">{{ fmt(cat.spent) }}</td>
                    <td class="text-muted">%{{ cat.idealPercent }}</td>
                    <td class="text-primary">%{{ cat.actualPercent }}</td>
                    <td>
                      <span
                        class="diff-pill"
                        :class="{
                          'diff-over': cat.diff > 0,
                          'diff-under': cat.diff < 0,
                          'diff-ok': cat.diff === 0,
                        }"
                      >
                        {{ cat.diff > 0 ? '+' : '' }}{{ cat.diff }}%
                      </span>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="{
                          'badge-danger':  cat.status === 'critical',
                          'badge-warning': cat.status === 'warning',
                          'badge-success': cat.status === 'normal',
                        }"
                      >
                        {{
                          cat.status === 'critical' ? '🔴 Kritik'
                          : cat.status === 'warning' ? '🟡 Uyarı'
                          : '🟢 Normal'
                        }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- ── Insights ── -->
          <section class="insights-grid" v-if="topSaving || trendPeak">
            <div class="card card-body insight-card" v-if="topSaving">
              <div class="insight-icon">💡</div>
              <h4 class="insight-title">En Büyük Tasarruf Fırsatı</h4>
              <p class="insight-body">
                <strong>{{ topSaving.label }}</strong> kategorisinde ideal oranın
                <strong>{{ topSaving.diff }}%</strong> üzerindesin.
                İdeal orana dönersen yaklaşık
                <strong class="text-accent">{{ fmt(topSaving.estimatedSaving) }}</strong>
                tasarruf edebilirsin.
              </p>
              <ul v-if="topSaving.tips.length" class="tip-list">
                <li v-for="tip in topSaving.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>

            <div class="card card-body insight-card" v-if="trendPeak">
              <div class="insight-icon">📈</div>
              <h4 class="insight-title">En Yüksek Harcama Ayı</h4>
              <p class="insight-body">
                Son 6 ay içinde en fazla harcamayı
                <strong>{{ formatMonth(trendPeak.month) }}</strong> ayında yaptın:
                <strong class="text-accent">{{ fmt(trendPeak.total) }}</strong>.
              </p>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}
.kpi-card {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: transform var(--trans-base), box-shadow var(--trans-base);
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.kpi-icon {
  font-size: 1.5rem;
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06);
  margin-bottom: var(--space-1);
}
.kpi-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}
.kpi-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Charts row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--space-4);
}
@media (max-width: 900px) {
  .charts-row { grid-template-columns: 1fr; }
}
.chart-card { display: flex; flex-direction: column; }
.chart-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}
.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.chart-subtitle {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

/* Diff pill */
.diff-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}
.diff-over  { background: var(--danger-bg);  color: var(--danger);  }
.diff-under { background: var(--success-bg); color: var(--success); }
.diff-ok    { background: var(--bg-glass);   color: var(--text-muted); }

/* Category row hover */
.cat-name-cell { font-weight: 500; color: var(--text-primary); }
.text-accent { color: var(--accent-2); }
.font-semibold { font-weight: 600; color: var(--text-primary); }

/* Insights */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}
.insight-card { display: flex; flex-direction: column; gap: var(--space-3); }
.insight-icon { font-size: 2rem; }
.insight-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.insight-body {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
.tip-list {
  margin: 0;
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.tip-list li {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Empty */
.empty-chart {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-3); padding: var(--space-10);
  color: var(--text-secondary); text-align: center;
}
.empty-icon { font-size: 2.5rem; }

/* Loading */
.loading-state {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-4); padding: var(--space-16); color: var(--text-muted);
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.mb-8 { margin-bottom: var(--space-8); }
</style>
