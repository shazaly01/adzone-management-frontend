import apiClient from './apiClient'

export default {
  getStats(filters = {}) {
    return apiClient.get('/dashboard/stats', {
      params: filters,
    })
  },
}
