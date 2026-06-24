import apiClient from './apiClient'

const resource = '/suppliers'

export default {
  // جلب قائمة الموردين مع معاملات التصفية والبحث والترقيم
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
      },
    })
  },

  // جلب بيانات مورد محدد عبر المعرف الفردي
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء وتدوين مورد جديد في النظام
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات مورد حالي
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف مورد من قاعدة البيانات
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
