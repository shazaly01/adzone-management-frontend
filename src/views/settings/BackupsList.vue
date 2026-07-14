<!---src\views\settings\BackupsList.vue-->
<template>
  <div class="relative">
    <!-- طبقة حظر الشاشة الكاملة أثناء عملية الاستعادة لسلامة واستقرار البيانات -->
    <div
      v-if="restoring"
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999] pointer-events-auto"
    >
      <div
        class="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-slate-200 dark:border-slate-800 animate-fade-in"
      >
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mx-auto mb-6"
        ></div>
        <h3 class="text-xl font-bold text-text-primary mb-3 text-slate-800 dark:text-slate-100">
          جاري استعادة قاعدة البيانات
        </h3>
        <p class="text-sm text-text-muted leading-relaxed text-slate-600 dark:text-slate-400">
          يتم الآن تهيئة السيرفر، تفريغ الجداول الحالية، وقراءة ملف النسخة الاحتياطية سطرًا بسطر
          وتدقيق القيود المالية.
          <br />
          <span class="text-rose-500 font-semibold mt-4 block text-base animate-pulse">
            يرجى الانتظار تماماً وعدم تحديث الصفحة أو إغلاقها.
          </span>
        </p>
      </div>
    </div>

    <!-- ترويسة الصفحة وزر النسخ اليدوي -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة النسخ الاحتياطي</h1>
      <AppButton
        v-if="authStore.can('backup.create')"
        @click="handleCreateBackup"
        :disabled="creating || restoring"
      >
        <span v-if="creating">جاري النسخ...</span>
        <span v-else>إضافة نسخة احتياطية</span>
      </AppButton>
    </div>

    <!-- كرت عرض البيانات وجدول النسخ -->
    <AppCard>
      <div class="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
        <div class="text-sm text-text-muted">إجمالي النسخ: {{ backups.length || 0 }}</div>
      </div>

      <AppTable :headers="tableHeaders" :items="backups" :is-loading="loading">
        <template #cell-size="{ item }">
          <span dir="ltr" class="text-text-primary font-medium">{{ item.size }}</span>
        </template>

        <template #cell-date="{ item }">
          <span dir="ltr" class="text-text-muted">{{ item.date }}</span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-2 space-x-reverse min-h-[36px]">
            <!-- عرض مؤشر التقدم أثناء تحميل الملف -->
            <div
              v-if="downloadProgress.fileName === item.name"
              class="flex items-center space-x-2 space-x-reverse text-sm text-emerald-500 w-full"
            >
              <span>جاري التحميل...</span>
              <span class="font-mono font-semibold">{{ downloadProgress.percentage }}%</span>
            </div>

            <!-- الأزرار التفاعلية للملفات القابلة للتنفيذ -->
            <template v-else>
              <!-- زر استعادة قاعدة البيانات -->
              <button
                v-if="authStore.can('backup.restore')"
                @click.stop="openRestoreDialog(item)"
                :disabled="restoring"
                class="p-1 text-amber-500 hover:text-amber-400 disabled:opacity-50 transition-colors"
                title="استعادة قاعدة البيانات"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M3 9l3-3m0 0l3 3m-3-3V12"
                  />
                </svg>
              </button>

              <!-- زر تحميل النسخة -->
              <button
                v-if="authStore.can('backup.download')"
                @click.stop="handleDownload(item)"
                :disabled="restoring"
                class="p-1 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 transition-colors"
                title="تحميل النسخة"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
              </button>

              <!-- زر حذف النسخة من السيرفر -->
              <button
                v-if="authStore.can('backup.delete')"
                @click.stop="openDeleteDialog(item)"
                :disabled="restoring"
                class="p-1 font-medium text-rose-500 hover:text-rose-400 disabled:opacity-50 transition-colors"
                title="حذف النسخة"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </template>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <!-- نافذة تأكيد حذف نسخة احتياطية -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف النسخة"
      :message="`هل أنت متأكد من رغبتك في حذف النسخة '${backupToDelete?.name}' نهائياً من السيرفر؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirmed="deleteSelectedBackup"
    />

    <!-- نافذة تأكيد استعادة قاعدة البيانات (تحذير صارم) -->
    <AppConfirmDialog
      v-model="isRestoreDialogOpen"
      title="تحذير: استعادة قاعدة البيانات"
      :message="`إنذار أمني حاسم: هل أنت متأكد تماماً من رغبتك في استعادة قاعدة البيانات من النسخة '${backupToRestore?.name}'؟ هذا الإجراء سيقوم بحذف كافة الجداول والقيود الحالية واستبدالها بنظام هذه النسخة بالكامل. لن تتمكن من التراجع بعد البدء.`"
      @confirmed="restoreSelectedBackup"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBackupStore } from '@/stores/backupStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات المساعدة
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// --- إعدادات الحالات والستور ---
const backupStore = useBackupStore()
const authStore = useAuthStore()
const { backups, loading, creating, restoring, downloadProgress } = storeToRefs(backupStore)
const toast = useToast()

// --- تعريف أعمدة جدول البيانات ---
const tableHeaders = computed(() => {
  return [
    { key: 'name', label: 'اسم الملف' },
    { key: 'size', label: 'الحجم' },
    { key: 'date', label: 'تاريخ الإنشاء' },
    { key: 'actions', label: 'إجراءات', class: 'text-left' },
  ]
})

// --- جلب البيانات عند التحميل الأول للصفحة ---
onMounted(() => {
  backupStore.fetchBackups().catch(() => {
    toast.error('حدث خطأ فني أثناء محاولة جلب قائمة النسخ الاحتياطية من السيرفر.')
  })
})

// --- منطق إنشاء نسخة احتياطية جديدة يدوياً ---
const handleCreateBackup = async () => {
  try {
    toast.info('جاري بدء النسخ الاحتياطي السريع لقاعدة البيانات... يرجى الانتظار بضع ثوانٍ.')
    await backupStore.createBackup()
    toast.success('تم إنشاء النسخة الاحتياطية بنجاح تام وتم حماية الملف وتدوير النسخ القديمة.')
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'فشل تشغيل محرك النسخ الاحتياطي في السيرفر.'
    toast.error(errorMessage)
  }
}

// --- منطق تحميل الملف الآمن ---
const handleDownload = async (item) => {
  if (downloadProgress.value.fileName) {
    toast.warn('هناك عملية تنزيل ملف جارية بالفعل حالياً، يرجى الانتظار.')
    return
  }
  try {
    await backupStore.downloadBackup(item.name)
    toast.success(`اكتمل تحميل الملف '${item.name}' بنجاح داخل جهازك.`)
  } catch {
    toast.error(`تعذر تحميل الملف '${item.name}'. قد يكون الملف منتهي الصلاحية أو تم حذفه.`)
  }
}

// --- منطق حذف نسخة احتياطية ---
const isDeleteDialogOpen = ref(false)
const backupToDelete = ref(null)

const openDeleteDialog = (item) => {
  backupToDelete.value = item
  isDeleteDialogOpen.value = true
}

const deleteSelectedBackup = async () => {
  if (backupToDelete.value) {
    try {
      await backupStore.deleteBackup(backupToDelete.value.name)
      toast.success(`تم تدمير ملف النسخة '${backupToDelete.value.name}' بنجاح من السيرفر.`)
    } catch {
      toast.error('حدث خطأ أثناء محاولة تدمير الملف من القرص.')
    } finally {
      isDeleteDialogOpen.value = false
      backupToDelete.value = null
    }
  }
}

// --- منطق استعادة قاعدة البيانات ---
const isRestoreDialogOpen = ref(false)
const backupToRestore = ref(null)

const openRestoreDialog = (item) => {
  backupToRestore.value = item
  isRestoreDialogOpen.value = true
}

const restoreSelectedBackup = async () => {
  if (backupToRestore.value) {
    try {
      toast.info('جاري بدء عملية الاستعادة الحساسة وتجهيز ملفات الطوارئ المؤقتة...')
      const result = await backupStore.restoreBackup(backupToRestore.value.name)

      // إرسال رسالة النجاح القادمة من السيرفر مباشرة
      toast.success(result.message || 'تمت استعادة قاعدة البيانات بنجاح تام.')
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'فشلت عملية الاستعادة.'
      toast.error(errorMessage)
    } finally {
      isRestoreDialogOpen.value = false
      backupToRestore.value = null
    }
  }
}
</script>
