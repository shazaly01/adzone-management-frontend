import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '@/services/supplierService'

export const useSupplierStore = defineStore('supplier', () => {
  // --- State (الحالات التفاعلية للموردين) ---
  const suppliers = ref([])
  const pagination = ref({})
  const currentSupplier = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Helper to clean filters (تنظيف الفلاتر من القيم الفارغة) ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions (الدوال والعمليات) ---

  // 1. جلب قائمة الموردين وتحديث مظهر الجدول والترقيم
  async function fetchSuppliers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await supplierService.get(page, cleaned)
      suppliers.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب قائمة الموردين من الخادم.'
      console.error(err)
      suppliers.value = []
    } finally {
      loading.value = false
    }
  }

  // 2. جلب بيانات مورد واحد للتعديل أو العرض التفصيلي المعمق
  async function fetchSupplier(id) {
    loading.value = true
    error.value = null
    currentSupplier.value = null
    try {
      const response = await supplierService.find(id)
      currentSupplier.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات المورد المطلوبة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 3. إضافة مورد جديد ومعالجة أخطاء التحقق القياسية
  async function createSupplier(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await supplierService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء المورد الجديد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 4. تحديث بيانات المورد ومعالجة الـ Validation
  async function updateSupplier(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await supplierService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات المورد المعني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 5. حذف واستبعاد المورد من النظام
  async function deleteSupplier(id) {
    loading.value = true
    error.value = null
    try {
      const response = await supplierService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إتمام عملية حذف المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    suppliers,
    pagination,
    currentSupplier,
    loading,
    error,
    validationErrors,
    fetchSuppliers,
    fetchSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
})
