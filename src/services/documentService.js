// src/services/documentService.js
import apiClient from './apiClient'

const resource = '/documents'

export default {
  /**
   * جلب المستندات بناءً على المعرف والنوع (شركة أو مشروع)
   */
  get(targetId, targetType) {
    return apiClient.get(resource, {
      params: {
        target_id: targetId,
        target_type: targetType,
      },
    })
  },

  /**
   * رفع مستند جديد باستخدام FormData لدعم الملفات
   */
  // عدل هذا الجزء فقط
  create(payload, onUploadProgress) {
    // <--- 1. إضافة المعامل هنا
    const formData = new FormData()

    formData.append('target_id', payload.target_id)
    formData.append('target_type', payload.target_type)
    formData.append('name', payload.name)

    if (payload.file) {
      formData.append('file', payload.file)
    }

    return apiClient.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress, // <--- 2. تمرير الدالة لـ Axios
    })
  },

  /**
   * حذف مستند
   */
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
