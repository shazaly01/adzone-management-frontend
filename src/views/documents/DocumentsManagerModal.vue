<!--src\views\documents\DocumentsManagerModal.vue-->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
      @click.self="closeModal"
    >
      <div
        class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-4xl transform max-h-[90vh] flex flex-col"
      >
        <div
          class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 flex-shrink-0"
        >
          <div>
            <h3 class="text-lg font-semibold text-text-primary">إدارة المستندات</h3>
            <p class="text-sm text-text-muted">
              {{ targetType === 'company' ? 'للشركة' : 'للمشروع' }}: {{ owner.name }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="overflow-y-auto flex-grow">
          <DocumentForm
            ref="documentFormRef"
            :target-id="owner.id"
            :target-type="targetType"
            :is-saving="loading"
            :upload-progress="uploadProgress"
            @submit="handleUploadDocument"
            @cancel="closeModal"
            class="mb-8"
          />

          <hr class="border-surface-border my-6" />

          <h4 class="text-md font-semibold text-text-secondary mb-4">المستندات المرفوعة</h4>

          <DocumentsList
            :documents="documents"
            :loading="loading"
            :error="error"
            @delete="openDeleteDialog"
            @preview="openPreviewModal"
          />
        </div>

        <AppConfirmDialog
          v-model="isDeleteDialogOpen"
          title="تأكيد حذف المستند"
          :message="`هل أنت متأكد من حذف مستند '${documentToDelete?.name}'؟`"
          @confirmed="deleteSelectedDocument"
        />
      </div>
    </div>
  </Transition>

  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="previewDoc"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
      @click.self="closePreview"
    >
      <div
        class="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col bg-surface-ground rounded-lg shadow-2xl overflow-hidden"
      >
        <div
          class="flex justify-between items-center p-4 bg-surface-section border-b border-surface-border"
        >
          <h3 class="text-white font-bold truncate">{{ previewDoc.name }}</h3>
          <div class="flex items-center space-x-4 space-x-reverse">
            <a
              :href="previewDoc.url"
              download
              target="_blank"
              class="text-sky-400 hover:text-sky-300 font-medium text-sm"
            >
              تحميل الملف
            </a>
            <button
              @click="closePreview"
              class="text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-grow bg-gray-900 flex items-center justify-center overflow-auto p-2">
          <img
            v-if="isImage(previewDoc.extension)"
            :src="previewDoc.url"
            class="max-w-full max-h-full object-contain"
            alt="Preview"
          />

          <video
            v-else-if="isVideo(previewDoc.extension)"
            :src="previewDoc.url"
            controls
            class="max-w-full max-h-full"
          ></video>

          <iframe
            v-else-if="canPreviewInIframe(previewDoc.extension)"
            :src="previewDoc.url"
            class="w-full h-full border-none bg-white"
          ></iframe>

          <div v-else class="text-center text-white">
            <p class="text-xl mb-4">⚠️ لا يمكن معاينة هذا النوع من الملفات مباشرة</p>
            <a
              :href="previewDoc.url"
              download
              class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              اضغط هنا لتحميل الملف
            </a>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import DocumentsList from './DocumentsList.vue'
import DocumentForm from './DocumentForm.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // نغير المسمى ليكون عاماً (صاحب المستندات)
  owner: { type: Object, required: true },
  // نحدد النوع هنا (company أو project)
  targetType: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const documentStore = useDocumentStore()
const { documents, loading, error, uploadProgress } = storeToRefs(documentStore)
const toast = useToast()
const documentFormRef = ref(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.owner) {
      // نمرر المعرف والنوع معاً للـ Store
      documentStore.fetchDocuments(props.owner.id, props.targetType).catch(() => {
        toast.error('حدث خطأ أثناء جلب المستندات.')
      })
    }
  },
  { immediate: true },
)

const handleUploadDocument = async (formData) => {
  try {
    await documentStore.createDocument(formData)
    toast.success(`تم رفع مستند '${formData.name}' بنجاح.`)

    if (documentFormRef.value) {
      documentFormRef.value.resetForm()
    }
  } catch (err) {
    let errorMessage = 'حدث خطأ غير متوقع أثناء رفع المستند.'

    if (err.response) {
      const status = err.response.status

      // 1. خطأ تجاوز حجم السيرفر (قبل وصول الملف للارافيل)
      if (status === 413) {
        errorMessage =
          'حجم الملف كبير جداً! السيرفر يرفض استلام ملفات بهذا الحجم (يرجى مراجعة php.ini).'
      }

      // 2. خطأ التحقق من البيانات (الرسائل المعربة التي وضعناها في StoreDocumentRequest)
      else if (status === 422) {
        // فحص وجود أخطاء محددة لحقل الملف
        const validationErrors = err.response.data?.errors
        if (validationErrors && validationErrors.file) {
          // جلب الرسالة المعربة: "حجم الملف كبير جداً (أكبر من 50 ميغا)..."
          errorMessage = validationErrors.file[0]
        } else {
          errorMessage = err.response.data?.message || 'بيانات الملف غير صالحة.'
        }
      }

      // 3. أي رسالة خطأ أخرى مرسلة من السيرفر
      else if (err.response.data?.message) {
        errorMessage = err.response.data.message
      }
    } else if (err.message.includes('Network Error')) {
      errorMessage = 'فشل الاتصال: قد يكون حجم الملف كبيراً جداً وانقطع الاتصال قبل اكتماله.'
    }

    toast.error(errorMessage)
  }
}

// --- منطق الحذف ---
const isDeleteDialogOpen = ref(false)
const documentToDelete = ref(null)

const openDeleteDialog = (doc) => {
  documentToDelete.value = doc
  isDeleteDialogOpen.value = true
}

const deleteSelectedDocument = async () => {
  if (!documentToDelete.value) return
  try {
    // نمرر المعرف والنوع لضمان تحديث القائمة بعد الحذف
    await documentStore.deleteDocument(documentToDelete.value.id, props.owner.id, props.targetType)
    toast.success('تم حذف المستند بنجاح.')
  } catch (err) {
    toast.error('حدث خطأ أثناء الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
}

// --- [جديد] منطق المعاينة ---
const previewDoc = ref(null)

const openPreviewModal = (doc) => {
  // --- إضافة سطر الطباعة هنا ---
  console.log('🔥 Preview Document Data:', doc)
  console.log('🔗 URL to be opened:', doc.url)
  // ---------------------------

  previewDoc.value = doc
}

const closePreview = () => {
  previewDoc.value = null
}

// دالة مساعدة: هل الملف صورة؟
const isImage = (ext) => {
  if (!ext) return false
  return ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg'].includes(ext.toLowerCase())
}

// دالة مساعدة: هل الملف فيديو؟
const isVideo = (ext) => {
  if (!ext) return false
  return ['mp4', 'mov'].includes(ext.toLowerCase())
}

// دالة مساعدة: هل الملف قابل للعرض في Iframe؟
const canPreviewInIframe = (ext) => {
  if (!ext) return false
  return ['pdf', 'txt', 'json'].includes(ext.toLowerCase())
}
</script>
