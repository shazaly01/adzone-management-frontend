import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseService from '@/services/purchaseService'

export const usePurchaseStore = defineStore('purchase', () => {
  // --- State ---
  const purchases = ref([])
  const pagination = ref({})
  const currentPurchase = ref(null)
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
  async function fetchPurchases(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await purchaseService.get(page, cleaned)
      purchases.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب فواتير المشتريات.'
      console.error(err)
      purchases.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchPurchase(id) {
    loading.value = true
    error.value = null
    currentPurchase.value = null
    try {
      const response = await purchaseService.find(id)
      currentPurchase.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات فاتورة المشتريات.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createPurchase(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await purchaseService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء فاتورة المشتريات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePurchase(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await purchaseService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث فاتورة المشتريات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePurchase(id) {
    loading.value = true
    error.value = null
    try {
      const response = await purchaseService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف فاتورة المشتريات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    purchases,
    pagination,
    currentPurchase,
    loading,
    error,
    validationErrors,
    fetchPurchases,
    fetchPurchase,
    createPurchase,
    updatePurchase,
    deletePurchase,
  }
})
