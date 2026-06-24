<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="category-name"
          label="اسم التصنيف"
          v-model="form.name"
          placeholder="ادخل اسم التصنيف (مثال: المأكولات، الأجهزة الإلكترونية)"
          required
          @input="clearBackendError('name')"
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم التصنيف مطلوب ولا يمكن تركه فارغاً.
        </p>
        <div v-if="validationErrors && validationErrors.name">
          <p
            v-for="(error, index) in validationErrors.name"
            :key="index"
            class="text-rose-500 text-xs mt-1 font-bold"
          >
            {{ error }}
          </p>
        </div>
      </div>

      <div>
        <AppDropdown
          id="category-parent"
          label="التصنيف الرئيسي (الأب)"
          v-model="form.parent_id"
          :options="parentOptions"
          placeholder="اختر التصنيف الأب (اختياري - لجعله تصنيفاً فرعياً)"
          @change="clearBackendError('parent_id')"
        />
        <div v-if="validationErrors && validationErrors.parent_id">
          <p
            v-for="(error, index) in validationErrors.parent_id"
            :key="index"
            class="text-rose-500 text-xs mt-1 font-bold"
          >
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ التصنيف</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { storeToRefs } from 'pinia'

// استيراد مكونات الواجهة الأساسية القياسية لنظامك
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
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

const categoryStore = useCategoryStore()
// [تعديل التوافق]: استخراج validationErrors من الستور لربطها وعرضها بالواجهة
const { categories, validationErrors } = storeToRefs(categoryStore)

// إدارة أخطاء الإدخال المحلية
const errors = reactive({
  name: false,
})

// تصفير وتجهيز كائن النموذج الافتراضي
const createFreshForm = () => ({
  id: null,
  name: '',
  parent_id: '',
})

const form = ref(createFreshForm())

// فلترة التصنيفات المتاحة لتكون خيارات للتصنيف الأب
const parentOptions = computed(() => {
  return categories.value
    .filter((cat) => !form.value.id || cat.id !== form.value.id)
    .map((cat) => ({
      id: cat.id,
      name: cat.path || cat.name,
    }))
})

// مراقبة البيانات الممررة لتهيئة حقول النموذج عند التعديل أو الإضافة
watch(
  () => props.initialData,
  (newData) => {
    // تصفير أخطاء الباك إند السابقة عند فتح المودال أو تبديل البيانات
    if (categoryStore.validationErrors) {
      categoryStore.validationErrors = null
    }

    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        parent_id: newData.parent_id || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة لتنظيف خطأ محدد بمجرد قيام المستخدم بالتعديل والكتابة لتبسيط الـ UX
const clearBackendError = (field) => {
  if (validationErrors.value && validationErrors.value[field]) {
    delete validationErrors.value[field]
  }
}

// دالة التحقق اليدوي والإرسال
const handleSubmit = () => {
  errors.name = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  // تحويل القيمة إلى رقم أو إرسالها فارغة للباك إند
  const payload = {
    ...form.value,
    parent_id: form.value.parent_id ? Number(form.value.parent_id) : null,
  }

  emit('submit', payload)
}

const handleCancel = () => {
  if (categoryStore.validationErrors) {
    categoryStore.validationErrors = null
  }
  emit('cancel')
}
</script>
