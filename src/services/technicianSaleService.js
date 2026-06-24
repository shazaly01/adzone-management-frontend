import apiClient from './apiClient'

const resource = '/technician/sales'

export default {
  /**
   * جلب فواتير الفني النهائية المفلترة والمرحلة من السيرفر
   */
  get(page = 1, filters = {}) {
    return apiClient.get(resource, {
      params: {
        page,
        ...filters,
      },
    })
  },

  /**
   * جلب تفاصيل فاتورة واحدة محددة للفني لمراجعتها
   */
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  /**
   * التبديل الذري للخامات من ورشة التنفيذ مع السيرفر
   */
  swapRawMaterials(id, payload) {
    return apiClient.patch(`${resource}/${id}/swap-raw-materials`, payload)
  },
}
