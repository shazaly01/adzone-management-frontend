//src\stores\customerStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerService from '@/services/customerService'

export const useCustomerStore = defineStore('customer', () => {
  // --- State (الحالات التفاعلية للعملاء) ---
  const customers = ref([])
  const pagination = ref({})
  const currentCustomer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Helper to clean filters (دالة مساعدة لتنظيف حقول الفلترة الفارغة) ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions (العمليات وسير البيانات) ---

  // 1. جلب قائمة العملاء من السيرفر وتحديث المظهر والتنقل الرقمي
  async function fetchCustomers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await customerService.get(page, cleaned)
      customers.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات العملاء المسجلين.'
      console.error(err)
      customers.value = []
    } finally {
      loading.value = false
    }
  }

  // 2. جلب بيانات عميل منفرد لتفاصيل العرض أو التهيئة المعمقة
  async function fetchCustomer(id) {
    loading.value = true
    error.value = null
    currentCustomer.value = null
    try {
      const response = await customerService.find(id)
      currentCustomer.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات العميل المطلوبة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 3. إنشاء عميل جديد مع معالجة أخطاء التحقق القادمة من الباك إند
  async function createCustomer(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await customerService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تسجيل العميل الجديد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 4. تحديث العميل ومعالجة أخطاء الـ Unique أو القيود المدخلة
  async function updateCustomer(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await customerService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات العميل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 5. حذف العميل
  async function deleteCustomer(id) {
    loading.value = true
    error.value = null
    try {
      const response = await customerService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف العميل من قاعدة البيانات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // تصدير كافة الحالات والدوال للاستخدام الخارجي في الشاشات
  return {
    customers,
    pagination,
    currentCustomer,
    loading,
    error,
    validationErrors,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
})
