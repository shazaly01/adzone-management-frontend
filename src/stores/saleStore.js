//src\stores\saleStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import saleService from '@/services/saleService'

export const useSaleStore = defineStore('sale', () => {
  // --- State ---
  const sales = ref([])
  const pagination = ref({})
  const currentSale = ref(null)
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
  async function fetchSales(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await saleService.get(page, cleaned)
      sales.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب فواتير المبيعات.'
      console.error(err)
      sales.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSale(id) {
    loading.value = true
    error.value = null
    currentSale.value = null
    try {
      const response = await saleService.find(id)
      currentSale.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات فاتورة المبيعات.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createSale(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await saleService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء فاتورة المبيعات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSale(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await saleService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث فاتورة المبيعات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSale(id) {
    loading.value = true
    error.value = null
    try {
      const response = await saleService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف فاتورة المبيعات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function swapRawMaterials(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await saleService.swapRawMaterials(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تبديل خامات الفاتورة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    sales,
    pagination,
    currentSale,
    loading,
    error,
    validationErrors,
    fetchSales,
    fetchSale,
    createSale,
    updateSale,
    deleteSale,
    swapRawMaterials,
  }
})
