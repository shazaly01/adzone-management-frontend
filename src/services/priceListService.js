// src/services/priceListService.js
import apiClient from './apiClient' // [تعديل التوافق]: الاستيراد من الكائن المحلي الصحيح المعتمد بمشروعك

export default {
  /**
   * جلب كافة فئات الأسعار المعتمدة في النظام (جمهور، جملة، موزعون...)
   */
  get(filters = {}) {
    return apiClient.get('/api/price-lists', { params: filters })
  },

  /**
   * جلب تفاصيل فئة سعرية محددة
   */
  find(id) {
    return apiClient.get(`/api/price-lists/${id}`)
  },

  /**
   * إنشاء فئة سعرية جديدة
   */
  create(payload) {
    return apiClient.post('/api/price-lists', payload)
  },

  /**
   * تحديث فئة سعرية قائمة
   */
  update(id, payload) {
    return apiClient.put(`/api/price-lists/${id}`, payload)
  },

  /**
   * حذف فئة سعرية ناعماً
   */
  delete(id) {
    return apiClient.delete(`/api/price-lists/${id}`)
  },
}
