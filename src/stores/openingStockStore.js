import { defineStore } from 'pinia'
import { ref } from 'vue'
import openingStockService from '@/services/openingStockService'

export const useOpeningStockStore = defineStore('openingStock', () => {
  // --- State ---
  const openingStocks = ref([])
  const pagination = ref({})
  const currentOpeningStock = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Helper to clean filters ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions ---
  async function fetchOpeningStocks(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await openingStockService.get(page, cleaned)
      openingStocks.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب أرصدة بضاعة أول المدة.'
      console.error(err)
      openingStocks.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchOpeningStock(id) {
    loading.value = true
    error.value = null
    currentOpeningStock.value = null
    try {
      const response = await openingStockService.find(id)
      currentOpeningStock.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل رصيد أول المدة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createOpeningStock(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await openingStockService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إضافة رصيد أول المدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOpeningStock(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await openingStockService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث رصيد أول المدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOpeningStock(id) {
    loading.value = true
    error.value = null
    try {
      const response = await openingStockService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف السجل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    openingStocks,
    pagination,
    currentOpeningStock,
    loading,
    error,
    validationErrors,
    fetchOpeningStocks,
    fetchOpeningStock,
    createOpeningStock,
    updateOpeningStock,
    deleteOpeningStock,
  }
})
