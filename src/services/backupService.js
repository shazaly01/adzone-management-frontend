import apiClient from './apiClient'

const resource = '/backups'

export default {
  // جلب كل النسخ من السيرفر
  getAll() {
    return apiClient.get(resource)
  },

  // إنشاء نسخة احتياطية جديدة يدوياً
  create() {
    return apiClient.post(resource)
  },

  // حذف نسخة احتياطية نهائياً من السيرفر
  delete(fileName) {
    return apiClient.delete(resource, {
      params: {
        file_name: fileName,
      },
    })
  },

  // جلب رابط تحميل مؤقت وموقع برمجياً (صالح لمدة دقيقتين فقط) لتأمين ملفات الباك اب
  getDownloadUrl(fileName) {
    return apiClient.get(`${resource}/download-url`, {
      params: {
        file_name: fileName,
      },
    })
  },

  // التحميل الفعلي للملف باستخدام الرابط الموقع لحماية السيرفر من ثغرات التحميل المباشر
  download(signedUrl, onProgress) {
    return apiClient.get(signedUrl, {
      responseType: 'blob', // ضروري لمعالجة الملف المسترجع كـ Blob
      onDownloadProgress: onProgress,
    })
  },

  // طلب استعادة قاعدة البيانات من نسخة معينة مع تفعيل نظام الطوارئ للتراجع التلقائي في السيرفر
  restore(fileName) {
    return apiClient.post(`${resource}/restore`, {
      file_name: fileName,
    })
  },
}
