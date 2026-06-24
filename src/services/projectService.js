//src\services\projectService.js
import apiClient from './apiClient'

const resource = '/projects'

export default {
  // التعديل: جعل الدالة تستقبل الكائن filters وتمرره لـ axios
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters, // هذا سينشر search و company_id داخل الرابط تلقائياً
      },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
