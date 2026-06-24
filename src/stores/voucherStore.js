//src\stores\voucherStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import voucherService from '@/services/voucherService'

export const useVoucherStore = defineStore('voucher', () => {
  // --- State ---
  const vouchers = ref([])
  const pagination = ref({})
  const currentVoucher = ref(null)
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
  async function fetchVouchers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await voucherService.get(page, cleaned)
      vouchers.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب السندات المالية.'
      console.error(err)
      vouchers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchVoucher(id) {
    loading.value = true
    error.value = null
    currentVoucher.value = null
    try {
      const response = await voucherService.find(id)
      currentVoucher.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات السند المالي.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createVoucher(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await voucherService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء السند المالي.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateVoucher(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await voucherService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث السند المالي.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteVoucher(id) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف السند المالي.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    vouchers,
    pagination,
    currentVoucher,
    loading,
    error,
    validationErrors,
    fetchVouchers,
    fetchVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
  }
})
