import { defineStore } from 'pinia'
import { ref } from 'vue'
import technicianSaleService from '@/services/technicianSaleService'

export const useTechnicianSaleStore = defineStore('technicianSale', () => {
  // --- State ---
  const sales = ref([])
  const pagination = ref({})
  const currentSale = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- تصفية وتنظيف الفلاتر الفارغة تلقائياً لضمان سلامة الاستعلام ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions ---

  /**
   * جلب الفواتير النهائية الجاهزة للتنفيذ والموجهة للفني
   */
  async function fetchSales(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await technicianSaleService.get(page, cleaned)
      sales.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل النظام في جلب فواتير ورشة التنفيذ.'
      console.error(err)
      sales.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل فاتورة محددة للفني بالعبور الآمن والخامات
   */
  async function fetchSale(id) {
    loading.value = true
    error.value = null
    currentSale.value = null
    try {
      const response = await technicianSaleService.find(id)
      currentSale.value = response.data.data
    } catch (err) {
      error.value = 'فشل النظام في استرجاع تفاصيل مستند الفني المحدد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * إرسال مصفوفة تبديل وملاءمة الخامات فورا للسيرفر
   */
  async function swapRawMaterials(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await technicianSaleService.swapRawMaterials(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشلت عملية ملاءمة وتحديث خامات الورشة.'
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
    swapRawMaterials,
  }
})
