import { defineStore } from 'pinia'
import { ref } from 'vue'
import accountService from '@/services/accountService'

export const useAccountStore = defineStore('account', () => {
  // --- State ---
  const accounts = ref([])
  const pagination = ref({})
  const currentAccount = ref(null)
  const statementData = ref([])
  const statementPagination = ref({})
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
  async function fetchAccounts(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await accountService.get(page, cleaned)
      accounts.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب شجرة الحسابات.'
      console.error(err)
      accounts.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchAccount(id) {
    loading.value = true
    error.value = null
    currentAccount.value = null
    try {
      const response = await accountService.find(id)
      currentAccount.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات الحساب المالي.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createAccount(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await accountService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء الحساب المالي.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await accountService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث الحساب المالي.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount(id) {
    loading.value = true
    error.value = null
    try {
      const response = await accountService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الحساب المالي.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAccountStatement(id, page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await accountService.getStatement(id, page, cleaned)
      statementData.value = response.data.data
      statementPagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب كشف الحساب.'
      console.error(err)
      statementData.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    pagination,
    currentAccount,
    statementData,
    statementPagination,
    loading,
    error,
    validationErrors,
    fetchAccounts,
    fetchAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    fetchAccountStatement,
  }
})
