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
      await apiClient.post('/expenses', expenseData)
      const budgetStore = useBudgetStore()
      await budgetStore.fetchMonthlyData()
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
      await apiClient.put(`/expenses/${id}`, updates)
      const budgetStore = useBudgetStore()
      await budgetStore.fetchMonthlyData()
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
      await budgetStore.fetchMonthlyData()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      submitting.value = false
    }
  }

  return { submitting, error, addExpense, updateExpense, deleteExpense }
})
