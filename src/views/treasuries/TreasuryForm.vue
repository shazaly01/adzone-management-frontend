<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="treasury-name"
          label="اسم الخزنة المالية"
          v-model="form.name"
          placeholder="ادخل اسم الخزنة (مثال: الخزينة الرئيسية)"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم الخزنة مطلوب ولا يمكن تركه فارغاً.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppCurrencyInput
            id="treasury-opening-balance"
            label="الرصيد الافتتاحي"
            v-model="form.opening_balance"
            placeholder="0.00 (اختياري)"
          />
          <p v-if="errors.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
            لا يمكن أن يكون الرصيد الافتتاحي للخزينة بالسالب.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الخزنة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// استيراد مكونات الواجهة القياسية المعتمدة في النظام
import AppInput from '@/components/ui/AppInput.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
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

// إدارة الأخطاء يدوياً بالتطابق التام مع رسائل الباك إند
const errors = reactive({
  name: false,
  opening_balance: false,
})

// دالة تصفير وإنشاء كائن النموذج الافتراضي
const createFreshForm = () => ({
  id: null,
  name: '',
  opening_balance: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات الممررة لتهيئة النموذج للتعديل أو إعادته لحالته الأولى عند الإضافة
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        opening_balance:
          newData.opening_balance !== null && newData.opening_balance !== undefined
            ? newData.opening_balance
            : '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة التحقق اليدوي والإرسال للأب
const handleSubmit = () => {
  errors.name = false
  errors.opening_balance = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  if (form.value.opening_balance !== '' && form.value.opening_balance < 0) {
    errors.opening_balance = true
    return
  }

  // إعداد البيانات وتجهيزها بشكل نهائي للباك إند
  const payload = {
    ...form.value,
    opening_balance: form.value.opening_balance !== '' ? Number(form.value.opening_balance) : null,
  }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
