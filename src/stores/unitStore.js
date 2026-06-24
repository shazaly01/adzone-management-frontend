import { defineStore } from 'pinia'
import { ref } from 'vue'
import unitService from '@/services/unitService'

export const useUnitStore = defineStore('unit', () => {
  // --- State ---
  const units = ref([])
  const pagination = ref({})
  const currentUnit = ref(null)
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
  async function fetchUnits(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await unitService.get(page, cleaned)
      units.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب الوحدات.'
      console.error(err)
      units.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchUnit(id) {
    loading.value = true
    error.value = null
    currentUnit.value = null
    try {
      const response = await unitService.find(id)
      currentUnit.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات الوحدة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createUnit(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await unitService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء الوحدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUnit(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await unitService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث الوحدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUnit(id) {
    loading.value = true
    error.value = null
    try {
      const response = await unitService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الوحدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    units,
    pagination,
    currentUnit,
    loading,
    error,
    validationErrors,
    fetchUnits,
    fetchUnit,
    createUnit,
    updateUnit,
    deleteUnit,
  }
})
