import { defineStore } from 'pinia'
import backupService from '@/services/backupService'

export const useBackupStore = defineStore('backup', {
  state: () => ({
    backups: [],
    loading: false, // مؤشر حالة جلب قائمة الملفات
    creating: false, // مؤشر حالة زر "إنشاء نسخة احتياطية"
    restoring: false, // مؤشر حالة الاستعادة الحساسة (لقفل الشاشة والعمليات الحسابية)
    downloadProgress: {
      fileName: null, // اسم الملف الذي يتم تنزيله حالياً
      percentage: 0, // نسبة مئوية لتقدم التنزيل الفعلي
    },
  }),

  actions: {
    // جلب قائمة ملفات الباك اب المتوفرة أونلاين
    async fetchBackups() {
      this.loading = true
      try {
        const response = await backupService.getAll()
        this.backups = response.data.data
      } catch (error) {
        console.error('فشل في جلب قائمة النسخ الاحتياطية:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // طلب إنشاء نسخة احتياطية فورية يدوياً
    async createBackup() {
      this.creating = true
      try {
        await backupService.create()
        // تحديث القائمة فوراً لعرض الملف الجديد في الواجهة
        await this.fetchBackups()
      } catch (error) {
        console.error('فشل إنشاء نسخة احتياطية يدوية:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    // حذف نسخة احتياطية من السيرفر وتحديث القائمة محلياً
    async deleteBackup(fileName) {
      try {
        await backupService.delete(fileName)
        // تنظيف الواجهة فوراً بحذف الملف المحذوف دون الحاجة لإعادة تحميل الصفحة
        this.backups = this.backups.filter((item) => item.name !== fileName)
      } catch (error) {
        console.error('فشل حذف ملف النسخة الاحتياطية:', error)
        throw error
      }
    },

    // تحميل ملف الباك اب بآلية الروابط الموقعة زمنياً الآمنة
    async downloadBackup(fileName) {
      this.downloadProgress.fileName = fileName
      this.downloadProgress.percentage = 0

      try {
        // 1. طلب الرابط الموقّع والآمن من الـ API
        const urlResponse = await backupService.getDownloadUrl(fileName)
        const signedUrl = urlResponse.data.download_url

        // 2. تتبع تقدم التحميل الفعلي
        const onProgress = (progressEvent) => {
          if (progressEvent.total > 0) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            this.downloadProgress.percentage = percentCompleted
          }
        }

        // 3. تنزيل الملف الفعلي عبر الرابط الموقع المشفر
        const response = await backupService.download(signedUrl, onProgress)

        // 4. معالجة وتدشين تحميل الملف داخل متصفح المستخدم
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()

        // تنظيف وحذف العناصر المؤقتة من الذاكرة لعدم حدوث تسريب ميموري بالمتصفح
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('فشل تحميل النسخة الاحتياطية:', error)
        throw error
      } finally {
        // إعادة تهيئة تتبع التحميل
        this.downloadProgress.fileName = null
        this.downloadProgress.percentage = 0
      }
    },

    // استعادة قاعدة البيانات مع تفعيل حظر للواجهات لضمان عدم حدوث تشوه للقيود المالية الحالية
    async restoreBackup(fileName) {
      this.restoring = true
      try {
        const response = await backupService.restore(fileName)

        // إعادة جلب القائمة لتحديث الحركات وقفل المزامنة
        await this.fetchBackups()

        return response.data
      } catch (error) {
        console.error('فشلت عملية استعادة قاعدة البيانات من الستور:', error)
        throw error
      } finally {
        this.restoring = false
      }
    },
  },
})
