import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/api.client.js'
import { useAuthStore } from './auth.store.js'

export const useBudgetStore = defineStore('budget', () => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const expenses     = ref([])      // O ayki harcamalar
  const currentMonth = ref(getCurrentMonth())  // Format: "YYYY-MM"
  const loading      = ref(false)
  const error        = ref(null)

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function getCurrentMonth() {
    return new Date().toISOString().slice(0, 7)
  }

  // ─── Getters ──────────────────────────────────────────────────────────────────
  const authStore = useAuthStore()

  const totalExpenses = computed(() =>
    expenses.value.reduce((sum, e) => sum + e.amount, 0)
  )

  const remaining = computed(() =>
    authStore.monthlyIncome - totalExpenses.value
  )

  const remainingPercent = computed(() => {
    if (!authStore.monthlyIncome) return 0
    return Math.max(0, (remaining.value / authStore.monthlyIncome) * 100)
  })

  // Kategoriye göre toplam harcama
  const byCategory = computed(() => {
    const map = {}
    for (const exp of expenses.value) {
      map[exp.category] = (map[exp.category] || 0) + exp.amount
    }
    return map
  })

  // Analiz: her kategori için gerçek oran vs ideal oran
  const categoryAnalysis = computed(() => {
    const income = authStore.monthlyIncome
    const ratios = authStore.idealRatios
    if (!income) return []

    const CATEGORY_LABELS = {
      kira:      'Kira / Konut',
      yemek:     'Yemek',
      ulasim:    'Ulaşım',
      faturalar: 'Faturalar',
      eglence:   'Eğlence',
      egitim:    'Eğitim',
      diger:     'Diğer',
    }
    const CATEGORY_ICONS = {
      kira: '🏠', yemek: '🍽️', ulasim: '🚌',
      faturalar: '💡', eglence: '🎮', egitim: '📚', diger: '📦',
    }

    return Object.entries(ratios).map(([key, idealPct]) => {
      const spent     = byCategory.value[key] || 0
      const idealAmt  = (income * idealPct) / 100
      const actualPct = income > 0 ? (spent / income) * 100 : 0
      const diff      = actualPct - idealPct

      let status = 'normal'
      if (diff > 5) status = 'critical'
      else if (diff > 0) status = 'warning'

      return {
        key,
        label:     CATEGORY_LABELS[key] || key,
        icon:      CATEGORY_ICONS[key]  || '📦',
        idealPct,
        idealAmt,
        actualPct: Math.round(actualPct * 10) / 10,
        spent,
        diff:      Math.round(diff * 10) / 10,
        status,
      }
    })
  })

  // Uyarı gerektiren kategoriler
  const alerts = computed(() =>
    categoryAnalysis.value.filter(c => c.status !== 'normal')
  )

  // ─── Actions ──────────────────────────────────────────────────────────────────
  async function fetchExpenses(month = currentMonth.value) {
    loading.value = true
    error.value   = null
    try {
      const data = await apiClient.get(`/expenses?month=${month}`)
      expenses.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function prevMonth() {
    const [y, m] = currentMonth.value.split('-').map(Number)
    const d = new Date(y, m - 2)
    currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    fetchExpenses()
  }

  function nextMonth() {
    const [y, m] = currentMonth.value.split('-').map(Number)
    const d = new Date(y, m)
    currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    fetchExpenses()
  }

  return {
    expenses, currentMonth, loading, error,
    totalExpenses, remaining, remainingPercent, byCategory, categoryAnalysis, alerts,
    fetchExpenses, prevMonth, nextMonth,
  }
})
