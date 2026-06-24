//src\stores\itemStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import itemService from '@/services/itemService'
import priceListService from '@/services/priceListService' // جلب خدمات فئات الأسعار للمصفوفة

export const useItemStore = defineStore('item', () => {
  // --- State ---
  const items = ref([])
  const pagination = ref({})
  const currentItem = ref(null)
  const priceLists = ref([]) // لتغذية الدرج الجانبي بفئات الأسعار المتاحة (جمهور، جملة...)
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

  // جلب فئات الأسعار المعتمدة لبناء المصفوفة السعرية في الواجهة
  async function fetchPriceLists() {
    loading.value = true
    error.value = null
    try {
      const response = await priceListService.get()
      priceLists.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب فئات الأسعار المعتمدة.'
      console.error(err)
      priceLists.value = []
    } finally {
      loading.value = false
    }
  }

  // جلب قائمة الأصناف مع الفلترة المتقدمة والبحث
  async function fetchItems(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await itemService.get(page, cleaned)
      items.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب قائمة الأصناف من النظام.'
      console.error(err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  // جلب تفاصيل صنف محدد شجرياً للتعديل أو العرض
  async function fetchItem(id) {
    loading.value = true
    error.value = null
    currentItem.value = null
    try {
      const response = await itemService.find(id)
      currentItem.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات الصنف المالي.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // إنشاء صنف جديد ومزامنة مصفوفاته اللانهائية
  async function createItem(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await itemService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تسجيل الصنف الجديد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث صنف قائم وإعادة هيكلة مصفوفاته
  async function updateItem(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await itemService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات الصنف.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف واستبعاد صنف ناعماً من النظام
  async function deleteItem(id) {
    loading.value = true
    error.value = null
    try {
      const response = await itemService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف واستبعاد الصنف.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث كميات المخزون اللحظية فقط للأصناف النشطة في الشبكة تلافياً للبطء
  async function refreshItemsStock(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await itemService.refreshStock(payload)
      return response.data.data // إرجاع كائن الـ Map الخفيف مباشرة للـ Component
    } catch (err) {
      error.value = 'فشل في تحديث بيانات المخزون اللحظي للأصناف.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    pagination,
    currentItem,
    priceLists,
    loading,
    error,
    validationErrors,
    fetchPriceLists,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    refreshItemsStock,
  }
})
