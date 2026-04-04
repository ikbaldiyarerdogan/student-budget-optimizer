import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/api.client.js'
import { useBudgetStore } from './budget.store.js'

export const useExpenseStore = defineStore('expense', () => {
  const submitting = ref(false)
  const error      = ref(null)

  async function addExpense(expenseData) {
    submitting.value = true
    error.value = null
    try {
      const data = await apiClient.post('/expenses', expenseData)
      // Budget store'u tetikle: mevcut ayı yenile
      const budgetStore = useBudgetStore()
      await budgetStore.fetchExpenses()
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updateExpense(id, updates) {
    submitting.value = true
    error.value = null
    try {
      const data = await apiClient.put(`/expenses/${id}`, updates)
      const budgetStore = useBudgetStore()
      await budgetStore.fetchExpenses()
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function deleteExpense(id) {
    submitting.value = true
    error.value = null
    try {
      await apiClient.delete(`/expenses/${id}`)
      const budgetStore = useBudgetStore()
      await budgetStore.fetchExpenses()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      submitting.value = false
    }
  }

  return { submitting, error, addExpense, updateExpense, deleteExpense }
})
