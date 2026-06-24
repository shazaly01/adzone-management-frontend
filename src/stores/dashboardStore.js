import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardService from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  // --- State ---
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchStats(filters = {}) {
    loading.value = true
    error.value = null

    // تنظيف الفلاتر تلقائياً من القيم الفارغة (null أو نصوص فارغة) قبل إرسالها
    const cleanedFilters = Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})

    try {
      const response = await dashboardService.getStats(cleanedFilters)
      stats.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب إحصائيات لوحة التحكم.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
})
