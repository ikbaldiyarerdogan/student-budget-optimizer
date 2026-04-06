<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar     from '../components/layout/AppSidebar.vue'
import AppNavbar      from '../components/layout/AppNavbar.vue'
import BudgetOverview from '../components/dashboard/BudgetOverview.vue'
import CategoryCard   from '../components/dashboard/CategoryCard.vue'
import AlertBanner    from '../components/dashboard/AlertBanner.vue'
import AddExpenseForm from '../components/forms/AddExpenseForm.vue'
import { useBudgetStore } from '../stores/budget.store.js'
import { useAuthStore }   from '../stores/auth.store.js'

const budgetStore = useBudgetStore()
const authStore   = useAuthStore()
const router      = useRouter()

const showAddForm = ref(false)

onMounted(async () => {
  await budgetStore.fetchMonthlyData()
})

function formatMonth(str) {
  const [y, m] = str.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar />

    <div class="app-main">
      <AppNavbar title="Dashboard">
        <template #actions>
          <button
            id="open-add-expense-btn"
            class="btn btn-primary btn-sm"
            @click="showAddForm = true"
          >
            + Harcama Ekle
          </button>
        </template>
      </AppNavbar>

      <main class="page-content">
        <!-- Month Navigation -->
        <div class="month-nav">
          <button class="btn btn-ghost btn-sm" @click="budgetStore.prevMonth()">← Önceki Ay</button>
          <h2 class="month-title">{{ formatMonth(budgetStore.currentMonth) }}</h2>
          <button
            class="btn btn-ghost btn-sm"
            @click="budgetStore.nextMonth()"
            :disabled="budgetStore.isCurrentMonth()"
          >
            Sonraki Ay →
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="budgetStore.loading" class="loading-state">
          <div class="spinner"></div>
          <span>Yükleniyor…</span>
        </div>

        <template v-else>
          <!-- Budget Overview Cards -->
          <BudgetOverview class="mb-8" />

          <!-- Alerts / Uyarılar -->
          <AlertBanner
            v-if="budgetStore.alerts.length > 0"
            :alerts="budgetStore.alerts"
            class="mb-8"
          />

          <!-- Category breakdown -->
          <section class="section mb-8">
            <div class="section-header mb-4">
              <h3 class="section-title-sm">Kategori Analizi</h3>
              <button class="btn btn-ghost btn-sm" @click="router.push('/ayarlar')">
                ⚙️ İdeal Oranları Düzenle
              </button>
            </div>

            <div v-if="budgetStore.categoryAnalysis.length === 0" class="empty-state card card-body">
              <div class="empty-icon">📊</div>
              <p>Bu ay henüz harcama yok.</p>
              <button class="btn btn-primary btn-sm mt-4" @click="showAddForm = true">
                İlk Harcamayı Ekle
              </button>
            </div>

            <div v-else class="category-grid">
              <CategoryCard
                v-for="cat in budgetStore.categoryAnalysis"
                :key="cat.category"
                :category="cat"
              />
            </div>
          </section>

          <!-- Recent Expenses -->
          <section class="section">
            <div class="section-header mb-4">
              <h3 class="section-title-sm">Son Harcamalar</h3>
              <router-link to="/harcamalar" class="btn btn-ghost btn-sm">
                Tümünü Gör →
              </router-link>
            </div>

            <div v-if="budgetStore.expenses.length === 0" class="empty-state card card-body">
              <div class="empty-icon">💸</div>
              <p>Bu ay henüz harcama eklenmedi.</p>
            </div>

            <div v-else class="card">
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Kategori</th>
                      <th>Açıklama</th>
                      <th style="text-align:right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="exp in budgetStore.expenses.slice(0, 8)"
                      :key="exp.id"
                    >
                      <td class="text-muted">{{ exp.date }}</td>
                      <td>
                        <span class="category-pill">{{ exp.category }}</span>
                      </td>
                      <td class="text-secondary">{{ exp.description || '—' }}</td>
                      <td style="text-align:right;font-weight:600;color:var(--text-primary)">
                        {{ new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY', maximumFractionDigits:0 }).format(exp.amount) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </template>
      </main>
    </div>

    <!-- Add Expense Modal -->
    <Transition name="fade">
      <AddExpenseForm
        v-if="showAddForm"
        @close="showAddForm = false"
        @saved="showAddForm = false"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* Month navigation */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
}
.month-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Section */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title-sm {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Category grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

/* Category pill */
.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--accent-bg);
  color: var(--accent-2);
  border: 1px solid var(--accent-border);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-12);
}
.empty-icon { font-size: 2.5rem; margin-bottom: var(--space-3); }

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-16);
  color: var(--text-muted);
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.mb-8 { margin-bottom: var(--space-8); }
.mt-4 { margin-top: var(--space-4); }
</style>
