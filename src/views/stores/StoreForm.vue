<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="store-name"
          label="اسم المخزن"
          v-model="form.name"
          placeholder="ادخل اسم المخزن (مثال: مخزن المواد الخام، المخزن الرئيسي)"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم المخزن مطلوب وإلزامي.
        </p>
      </div>

      <div>
        <AppInput
          id="store-location"
          label="الموقع / العنوان"
          v-model="form.location"
          placeholder="ادخل موقع أو عنوان المخزن (اختياري)"
        />
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ المخزن</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// استيراد مكونات واجهة المستخدم المعتمدة في النظام
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// إدارة أخطاء الإدخال محلياً ويدوياً
const errors = reactive({
  name: false,
})

// دالة توليد كائن نموذج فارغ وجديد
const createFreshForm = () => ({
  id: null,
  name: '',
  location: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات الابتدائية لتعبئة النموذج في حالات التعديل أو تصفيره عند الإضافة
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        location: newData.location || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة التحقق من المدخلات وإرسال البيانات للمكون الأب
const handleSubmit = () => {
  errors.name = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
