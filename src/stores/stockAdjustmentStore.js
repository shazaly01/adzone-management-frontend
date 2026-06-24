import { defineStore } from 'pinia'
import { ref } from 'vue'
import stockAdjustmentService from '@/services/stockAdjustmentService'

export const useStockAdjustmentStore = defineStore('stockAdjustment', () => {
  // --- State ---
  const stockAdjustments = ref([])
  const pagination = ref({})
  const currentStockAdjustment = ref(null)
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
  async function fetchStockAdjustments(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await stockAdjustmentService.get(page, cleaned)
      stockAdjustments.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب طلبات التسوية الجردية.'
      console.error(err)
      stockAdjustments.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStockAdjustment(id) {
    loading.value = true
    error.value = null
    currentStockAdjustment.value = null
    try {
      const response = await stockAdjustmentService.find(id)
      currentStockAdjustment.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل التسوية الجردية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createStockAdjustment(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await stockAdjustmentService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء التسوية الجردية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStockAdjustment(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await stockAdjustmentService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث التسوية الجردية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteStockAdjustment(id) {
    loading.value = true
    error.value = null
    try {
      const response = await stockAdjustmentService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف التسوية الجردية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stockAdjustments,
    pagination,
    currentStockAdjustment,
    loading,
    error,
    validationErrors,
    fetchStockAdjustments,
    fetchStockAdjustment,
    createStockAdjustment,
    updateStockAdjustment,
    deleteStockAdjustment,
  }
})
