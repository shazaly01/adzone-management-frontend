<!--src\views\documents\DocumentForm.vue-->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5 bg-surface-ground p-4 rounded-md">
      <h4 class="text-md font-semibold text-text-secondary border-b border-surface-border pb-2">
        رفع مستند جديد
      </h4>

      <AppInput
        id="document-name"
        label="اسم المستند"
        v-model="form.name"
        placeholder="مثال: شهادة السجل التجاري"
        required
      />

      <div>
        <label
          for="document-file"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          ملف المستند (PDF, صور, فيديو حتى 250 ميجا)
        </label>
        <input
          id="document-file"
          ref="fileInput"
          type="file"
          @change="handleFileChange"
          required
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-surface-ground dark:border-surface-border"
          accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
        />

        <p v-if="fileError || serverError" class="text-sm text-red-500 mt-1 font-medium">
          {{ fileError || serverError }}
        </p>
      </div>
    </div>

    <div v-if="isSaving && uploadProgress > 0" class="mt-4 mb-4">
      <div class="flex justify-between mb-1">
        <span class="text-xs font-medium text-blue-700 dark:text-white">جاري الرفع...</span>
        <span class="text-xs font-medium text-blue-700 dark:text-white">{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>
    <div class="mt-6 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving || !form.file">
        <span v-if="isSaving">جاري الرفع...</span>
        <span v-else>رفع وحفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  // تم التعديل هنا: استبدال companyId بـ targetId ودعم DECIMAL(18, 0) كـ String
  targetId: {
    type: [String, Number],
    required: true,
  },
  // تم التعديل هنا: إضافة نوع الهدف (شركة أو مشروع)
  targetType: {
    type: String,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  uploadProgress: { type: Number, default: 0 },
  serverError: { type: String, default: null },
})

const emit = defineEmits(['submit', 'cancel'])

// دالة لإنشاء نموذج فارغ متوافق مع الحقول الجديدة في السيرفر
const createFreshForm = () => ({
  target_id: props.targetId,
  target_type: props.targetType,
  name: '',
  file: null,
})

const form = ref(createFreshForm())
const fileError = ref(null)
const fileInput = ref(null)

const resetForm = () => {
  form.value = createFreshForm() // تصفير الحقول النصية
  fileError.value = null // مسح أخطاء التحقق
  if (fileInput.value) {
    fileInput.value.value = '' // تصفير اسم الملف الظاهر في المتصفح
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) {
    form.value.file = null
    return
  }

  // التحديث 4: تحقق أولي سريع في الواجهة الأمامية قبل الرفع
  const maxSize = 250 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    fileError.value = 'حجم الملف يتجاوز 50 ميجابايت، يرجى اختيار ملف أصغر.'
    form.value.file = null
    event.target.value = '' // تفريغ الحقل
    return
  }

  fileError.value = null
  form.value.file = file
}

const handleSubmit = () => {
  if (!form.value.file) {
    fileError.value = 'الرجاء اختيار ملف أولاً.'
    return
  }
  // إرسال كائن النموذج المحدث (target_id, target_type, name, file)
  emit('submit', form.value)
}

const handleCancel = () => {
  emit('cancel')
}

defineExpose({ resetForm })
</script>
