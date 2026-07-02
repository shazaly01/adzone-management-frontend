//src\services\userService.js
import apiClient from './apiClient'

const resource = '/users'

export default {
  /**
   * جلب قائمة المستخدمين مضافاً إليها فلاتر البحث، والنوع (مثل المصممين)، والترقيم الآمن
   */
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
      },
    })
  },

  // جلب بيانات مستخدم محدد عبر الـ ID
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مستخدم جديد في النظام
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات مستخدم حالي
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف مستخدم من النظام
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
