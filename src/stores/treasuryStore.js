//src\stores\treasuryStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import treasuryService from '@/services/treasuryService'

export const useTreasuryStore = defineStore('treasury', () => {
  // --- State ---
  const treasuries = ref([])
  const pagination = ref({})
  const currentTreasury = ref(null)
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
  async function fetchTreasuries(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await treasuryService.get(page, cleaned)
      treasuries.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات الخزائن المالية.'
      console.error(err)
      treasuries.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchTreasury(id) {
    loading.value = true
    error.value = null
    currentTreasury.value = null
    try {
      const response = await treasuryService.find(id)
      currentTreasury.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات الخزنة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTreasury(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await treasuryService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء الخزنة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTreasury(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await treasuryService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث الخزنة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTreasury(id) {
    loading.value = true
    error.value = null
    try {
      const response = await treasuryService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الخزنة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    treasuries,
    pagination,
    currentTreasury,
    loading,
    error,
    validationErrors,
    fetchTreasuries,
    fetchTreasury,
    createTreasury,
    updateTreasury,
    deleteTreasury,
  }
})
