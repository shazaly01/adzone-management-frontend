//src\stores\storeStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import storeService from '@/services/storeService'

export const useStoreStore = defineStore('store', () => {
  // --- State ---
  const stores = ref([])
  const pagination = ref({})
  const currentStore = ref(null)
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
  async function fetchStores(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await storeService.get(page, cleaned)
      stores.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات المخازن.'
      console.error(err)
      stores.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStore(id) {
    loading.value = true
    error.value = null
    currentStore.value = null
    try {
      const response = await storeService.find(id)
      currentStore.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات المخزن.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createStore(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await storeService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء المخزن.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStore(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await storeService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث المخزن.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteStore(id) {
    loading.value = true
    error.value = null
    try {
      const response = await storeService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المخزن.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stores,
    pagination,
    currentStore,
    loading,
    error,
    validationErrors,
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    deleteStore,
  }
})
