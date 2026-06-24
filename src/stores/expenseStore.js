//src\stores\expenseStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import expenseService from '@/services/expenseService'

export const useExpenseStore = defineStore('expense', () => {
  // --- State ---
  const expenses = ref([])
  const pagination = ref({})
  const currentExpense = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchExpenses(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await expenseService.get(page, filters)
      expenses.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'Failed to fetch expenses.'
      console.error(err)
      expenses.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchExpense(id) {
    loading.value = true
    error.value = null
    currentExpense.value = null
    try {
      const response = await expenseService.find(id)
      currentExpense.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch expense.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createExpense(payload) {
    loading.value = true
    error.value = null
    try {
      await expenseService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create expense.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateExpense(id, payload) {
    loading.value = true
    error.value = null
    try {
      await expenseService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update expense.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteExpense(id) {
    loading.value = true
    error.value = null
    try {
      await expenseService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete expense.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    expenses,
    pagination,
    currentExpense,
    loading,
    error,
    fetchExpenses,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
  }
})
