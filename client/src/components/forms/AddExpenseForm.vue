<script setup>
import { ref, reactive, computed } from 'vue'
import { useExpenseStore } from '../../stores/expense.store.js'
import { useBudgetStore } from '../../stores/budget.store.js'

const emit = defineEmits(['close', 'saved'])

const expenseStore = useExpenseStore()
const budgetStore  = useBudgetStore()

const CATEGORIES = [
  { value: 'kira',      label: '🏠 Kira / Konut' },
  { value: 'yemek',     label: '🍽️ Yemek' },
  { value: 'ulasim',    label: '🚌 Ulaşım' },
  { value: 'faturalar', label: '💡 Faturalar' },
  { value: 'eglence',   label: '🎮 Eğlence' },
  { value: 'egitim',    label: '📚 Eğitim' },
  { value: 'birikim',   label: '📈 Birikim' },
  { value: 'diger',     label: '📦 Diğer' },
]

// Default to today in current month
const today = new Date().toISOString().slice(0, 10)
const [cy, cm] = budgetStore.currentMonth.split('-')
const defaultDate = today.startsWith(`${cy}-${cm}`) ? today : `${cy}-${cm}-01`

const form = reactive({
  category:    '',
  amount:      '',
  description: '',
  date:        defaultDate,
})
const error = ref('')

const isValid = computed(() =>
  form.category && Number(form.amount) > 0 && form.date
)

async function submit() {
  error.value = ''
  if (!isValid.value) {
    error.value = 'Lütfen kategori, tutar ve tarihi doldurun.'
    return
  }
  try {
    await expenseStore.addExpense({
      category:    form.category,
      amount:      Number(form.amount),
      description: form.description.trim(),
      date:        form.date,
    })
    emit('saved')
    emit('close')
  } catch (e) {
    error.value = e.message || 'Harcama eklenirken bir hata oluştu.'
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="add-expense-title">
      <div class="modal-header">
        <h2 id="add-expense-title" style="font-size:1.125rem">Harcama Ekle</h2>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')" aria-label="Kapat">✕</button>
      </div>

      <form @submit.prevent="submit" novalidate>
        <div class="modal-body">
          <div class="form-group mb-4">
            <label for="exp-category">Kategori</label>
            <select id="exp-category" v-model="form.category" required>
              <option value="" disabled>Kategori seç…</option>
              <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="form-group mb-4">
            <label for="exp-amount">Tutar (₺)</label>
            <div class="input-icon">
              <span class="icon">₺</span>
              <input
                id="exp-amount"
                v-model="form.amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                style="padding-left: 36px"
              />
            </div>
          </div>

          <div class="form-group mb-4">
            <label for="exp-date">Tarih</label>
            <input id="exp-date" v-model="form.date" type="date" required />
          </div>

          <div class="form-group mb-2">
            <label for="exp-desc">Açıklama <span class="text-muted">(isteğe bağlı)</span></label>
            <input id="exp-desc" v-model="form.description" type="text" placeholder="Kısa açıklama…" />
          </div>

          <div v-if="error" class="alert alert-danger mt-4">⚠️ {{ error }}</div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">İptal</button>
          <button
            id="add-expense-submit"
            type="submit"
            class="btn btn-primary"
            :class="{ 'btn-loading': expenseStore.submitting }"
            :disabled="expenseStore.submitting || !isValid"
          >
            Ekle
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
