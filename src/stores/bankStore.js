//src\stores\bankStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import bankService from '@/services/bankService'

export const useBankStore = defineStore('bank', () => {
  // --- State ---
  const banks = ref([])
  const pagination = ref({})
  const currentBank = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchBanks(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await bankService.get(page, filters)
      banks.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'Failed to fetch banks.'
      console.error(err)
      banks.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchBank(id) {
    loading.value = true
    error.value = null
    currentBank.value = null
    try {
      const response = await bankService.find(id)
      currentBank.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch bank.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createBank(payload) {
    loading.value = true
    error.value = null
    try {
      await bankService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create bank.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBank(id, payload) {
    loading.value = true
    error.value = null
    try {
      await bankService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update bank.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBank(id) {
    loading.value = true
    error.value = null
    try {
      await bankService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete bank.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    banks,
    pagination,
    currentBank,
    loading,
    error,
    fetchBanks,
    fetchBank,
    createBank,
    updateBank,
    deleteBank,
  }
})
