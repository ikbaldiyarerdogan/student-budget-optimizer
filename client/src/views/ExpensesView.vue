<script setup>
import { onMounted, ref, computed } from 'vue'
import AppSidebar     from '../components/layout/AppSidebar.vue'
import AppNavbar      from '../components/layout/AppNavbar.vue'
import AddExpenseForm from '../components/forms/AddExpenseForm.vue'
import { useBudgetStore }  from '../stores/budget.store.js'
import { useExpenseStore } from '../stores/expense.store.js'

const budgetStore  = useBudgetStore()
const expenseStore = useExpenseStore()

const showAddForm    = ref(false)
const editingExpense = ref(null)
const deleteConfirmId = ref(null)
const filterCategory  = ref('')
const sortBy          = ref('date-desc')

const CATEGORIES = [
  { value: '',          label: 'Tüm Kategoriler' },
  { value: 'kira',      label: '🏠 Kira / Konut' },
  { value: 'yemek',     label: '🍽️ Yemek' },
  { value: 'ulasim',    label: '🚌 Ulaşım' },
  { value: 'faturalar', label: '💡 Faturalar' },
  { value: 'eglence',   label: '🎮 Eğlence' },
  { value: 'egitim',    label: '📚 Eğitim' },
  { value: 'birikim',   label: '📈 Birikim' },
  { value: 'diger',     label: '📦 Diğer' },
]

const CAT_LABELS = {
  kira:'🏠 Kira', yemek:'🍽️ Yemek', ulasim:'🚌 Ulaşım',
  faturalar:'💡 Faturalar', eglence:'🎮 Eğlence', egitim:'📚 Eğitim', birikim:'📈 Birikim', diger:'📦 Diğer',
}

onMounted(async () => {
  await budgetStore.fetchMonthlyData()
})

const filteredExpenses = computed(() => {
  let list = [...budgetStore.expenses]
  if (filterCategory.value) {
    list = list.filter(e => e.category === filterCategory.value)
  }
  switch (sortBy.value) {
    case 'date-desc':  list.sort((a, b) => b.date.localeCompare(a.date)); break
    case 'date-asc':   list.sort((a, b) => a.date.localeCompare(b.date)); break
    case 'amount-desc':list.sort((a, b) => b.amount - a.amount); break
    case 'amount-asc': list.sort((a, b) => a.amount - b.amount); break
  }
  return list
})

const filteredTotal = computed(() =>
  filteredExpenses.value.reduce((s, e) => s + e.amount, 0)
)

function formatTL(val) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
}

function formatMonth(str) {
  const [y, m] = str.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}

async function confirmDelete(id) {
  deleteConfirmId.value = id
}

async function handleDelete() {
  if (!deleteConfirmId.value) return
  await expenseStore.deleteExpense(deleteConfirmId.value)
  deleteConfirmId.value = null
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-main">
      <AppNavbar title="Harcamalar">
        <template #actions>
          <button id="add-expense-btn" class="btn btn-primary btn-sm" @click="showAddForm = true">
            + Harcama Ekle
          </button>
        </template>
      </AppNavbar>

      <main class="page-content">
        <!-- Month Nav -->
        <div class="month-nav mb-6">
          <button class="btn btn-ghost btn-sm" @click="budgetStore.prevMonth()">← Önceki Ay</button>
          <h2 class="month-title">{{ formatMonth(budgetStore.currentMonth) }}</h2>
          <button class="btn btn-ghost btn-sm" :disabled="budgetStore.isCurrentMonth()" @click="budgetStore.nextMonth()">
            Sonraki Ay →
          </button>
        </div>

        <!-- Filters -->
        <div class="filters card card-body mb-6">
          <div class="filters-row">
            <div class="form-group" style="min-width:180px">
              <label for="filter-cat">Kategori</label>
              <select id="filter-cat" v-model="filterCategory">
                <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div class="form-group" style="min-width:180px">
              <label for="sort-by">Sırala</label>
              <select id="sort-by" v-model="sortBy">
                <option value="date-desc">Tarih (Yeni → Eski)</option>
                <option value="date-asc">Tarih (Eski → Yeni)</option>
                <option value="amount-desc">Tutar (Büyük → Küçük)</option>
                <option value="amount-asc">Tutar (Küçük → Büyük)</option>
              </select>
            </div>
            <div class="filter-summary">
              <span class="text-muted text-sm">{{ filteredExpenses.length }} harcama</span>
              <span class="filter-total">{{ formatTL(filteredTotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="budgetStore.loading" class="loading-state">
          <div class="spinner"></div>
          <span>Yükleniyor…</span>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredExpenses.length === 0" class="empty-state card card-body">
          <div class="empty-icon">💸</div>
          <p>{{ filterCategory ? 'Bu kategoride harcama yok.' : 'Bu ay henüz harcama eklenmedi.' }}</p>
          <button class="btn btn-primary btn-sm mt-4" @click="showAddForm = true">
            Harcama Ekle
          </button>
        </div>

        <!-- Expense List -->
        <div v-else class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Kategori</th>
                  <th>Açıklama</th>
                  <th style="text-align:right">Tutar</th>
                  <th style="text-align:right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exp in filteredExpenses" :key="exp.id">
                  <td class="text-muted text-sm">{{ exp.date }}</td>
                  <td>
                    <span class="category-pill">{{ CAT_LABELS[exp.category] || exp.category }}</span>
                  </td>
                  <td class="text-secondary">{{ exp.description || '—' }}</td>
                  <td style="text-align:right;font-weight:600;color:var(--text-primary)">
                    {{ formatTL(exp.amount) }}
                  </td>
                  <td style="text-align:right">
                    <button
                      class="btn btn-ghost btn-sm"
                      style="color:var(--danger);padding:4px 8px"
                      @click="confirmDelete(exp.id)"
                      :disabled="expenseStore.submitting"
                      :aria-label="`Sil: ${exp.description || exp.category}`"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Add Expense Modal -->
    <Transition name="fade">
      <AddExpenseForm v-if="showAddForm" @close="showAddForm = false" @saved="showAddForm = false" />
    </Transition>

    <!-- Delete Confirm Modal -->
    <Transition name="fade">
      <div v-if="deleteConfirmId" class="modal-overlay" @click.self="deleteConfirmId = null">
        <div class="modal" style="max-width:380px">
          <div class="modal-header">
            <h3 style="font-size:1rem">Harcamayı Sil</h3>
          </div>
          <div class="modal-body">
            <p class="text-secondary">Bu harcamayı silmek istediğine emin misin? Bu işlem geri alınamaz.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="deleteConfirmId = null">İptal</button>
            <button
              class="btn btn-danger"
              :class="{ 'btn-loading': expenseStore.submitting }"
              :disabled="expenseStore.submitting"
              @click="handleDelete"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.month-nav {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-glass); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: var(--space-3) var(--space-5);
}
.month-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }

.filters-row {
  display: flex; align-items: flex-end; gap: var(--space-5); flex-wrap: wrap;
}
.filter-summary {
  margin-left: auto;
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
}
.filter-total {
  font-family: var(--font-display); font-size: 1.25rem;
  font-weight: 700; color: var(--text-primary);
}

.category-pill {
  display: inline-flex; align-items: center;
  padding: 2px 10px; border-radius: 99px;
  font-size: 0.75rem; font-weight: 500;
  background: var(--accent-bg); color: var(--accent-2);
  border: 1px solid var(--accent-border);
  white-space: nowrap;
}
.empty-state { text-align: center; padding: var(--space-12); }
.empty-icon  { font-size: 2.5rem; margin-bottom: var(--space-3); }
.loading-state {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-4); padding: var(--space-16); color: var(--text-muted);
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--border); border-top-color: var(--accent);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
.mb-6 { margin-bottom: var(--space-6); }
.mt-4 { margin-top: var(--space-4); }
</style>
