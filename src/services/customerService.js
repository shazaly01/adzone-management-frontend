import apiClient from './apiClient'

const resource = '/customers'

export default {
  // جلب قائمة العملاء مضافاً إليها فلاتر البحث والترقيم
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
      },
    })
  },

  // جلب بيانات عميل محدد عبر الـ ID
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء عميل جديد في النظام
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات عميل حالي
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف عميل من النظام
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
