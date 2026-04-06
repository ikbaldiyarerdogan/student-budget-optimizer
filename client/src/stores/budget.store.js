import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/api.client.js'

export const useBudgetStore = defineStore('budget', () => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const expenses     = ref([])
  const analysis     = ref(null)   // backend'den gelen bütçe analizi
  const currentMonth = ref(getCurrentMonth())
  const loading      = ref(false)
  const error        = ref(null)

  function getCurrentMonth() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  // ─── Getters ──────────────────────────────────────────────────────────────────
  const totalExpenses    = computed(() => analysis.value?.totalSpent ?? 0)
  const income           = computed(() => analysis.value?.income ?? 0)
  const remaining        = computed(() => analysis.value?.remainingBalance ?? 0)
  const savingsRate      = computed(() => analysis.value?.savingsRate ?? 0)
  const overallStatus    = computed(() => analysis.value?.overallStatus ?? 'healthy')
  const categoryAnalysis = computed(() => analysis.value?.categoryAnalysis ?? [])
  const alerts           = computed(() => analysis.value?.alerts ?? [])

  const currentMonthLabel = computed(() => {
    const [y, m] = currentMonth.value.split('-').map(Number)
    return new Date(y, m - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  })

  // ─── Actions ──────────────────────────────────────────────────────────────────
  async function fetchMonthlyData(month = currentMonth.value) {
    loading.value = true
    error.value   = null
    try {
      // Interceptor returns response.data: { success, data: { expenses, analysis } }
      const res  = await apiClient.get(`/expenses?month=${month}`)
      const body = res?.data ?? res          // unwrap { expenses, analysis }
      expenses.value = body?.expenses ?? []
      analysis.value = body?.analysis ?? null
    } catch (err) {
      console.error('[budget.store] fetchMonthlyData error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function prevMonth() {
    const [y, m] = currentMonth.value.split('-').map(Number)
    const d = new Date(y, m - 2)
    currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    fetchMonthlyData(currentMonth.value)
  }

  function nextMonth() {
    const [y, m] = currentMonth.value.split('-').map(Number)
    const d = new Date(y, m)
    currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    fetchMonthlyData(currentMonth.value)
  }

  function isCurrentMonth() {
    return currentMonth.value === getCurrentMonth()
  }

  return {
    expenses, analysis, currentMonth, loading, error,
    totalExpenses, income, remaining, savingsRate, overallStatus,
    categoryAnalysis, alerts, currentMonthLabel,
    fetchMonthlyData, prevMonth, nextMonth, isCurrentMonth,
  }
})
