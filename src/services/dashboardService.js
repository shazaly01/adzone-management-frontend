import apiClient from './apiClient'

export default {
  /**
   * جلب إحصائيات ومؤشرات لوحة تحكم المدير (يدعم الفلترة الاختيارية بالتواريخ)
   */
  getStats(filters = {}) {
    return apiClient.get('/manager/dashboard/stats', {
      params: filters,
    })
  },
}
