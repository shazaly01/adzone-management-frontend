//src\services\saleService.js
import apiClient from './apiClient'

const resource = '/sales'

export default {
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
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

  swapRawMaterials(id, payload) {
    return apiClient.patch(`${resource}/${id}/swap-raw-materials`, payload)
  },
}
