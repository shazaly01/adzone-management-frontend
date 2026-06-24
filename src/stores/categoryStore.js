//src\stores\categoryStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryService from '@/services/categoryService'

export const useCategoryStore = defineStore('category', () => {
  // --- State ---
  const categories = ref([])
  const pagination = ref({})
  const currentCategory = ref(null)
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
  async function fetchCategories(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await categoryService.get(page, cleaned)
      categories.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب المجموعات.'
      console.error(err)
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchCategory(id) {
    loading.value = true
    error.value = null
    currentCategory.value = null
    try {
      const response = await categoryService.find(id)
      currentCategory.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات المجموعة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await categoryService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء المجموعة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await categoryService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث المجموعة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(id) {
    loading.value = true
    error.value = null
    try {
      const response = await categoryService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المجموعة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    pagination,
    currentCategory,
    loading,
    error,
    validationErrors,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
