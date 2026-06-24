<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="customer-name"
          label="اسم العميل"
          v-model="form.name"
          placeholder="ادخل اسم العميل بالكامل"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم العميل مطلوب وإلزامي.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="customer-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="ادخل رقم الهاتف (اختياري)"
        />

        <AppInput
          id="customer-email"
          label="البريد الإلكتروني"
          v-model="form.email"
          type="email"
          placeholder="example@domain.com (اختياري)"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppCurrencyInput
            id="customer-credit-limit"
            label="الحد الائتماني"
            v-model="form.credit_limit"
            placeholder="0.00 (اختياري)"
          />
          <p v-if="errors.credit_limit" class="text-rose-500 text-xs mt-1 font-bold">
            لا يمكن أن يكون الحد الائتماني أقل من صفر.
          </p>
        </div>

        <div>
          <AppCurrencyInput
            id="customer-opening-balance"
            label="الرصيد الافتتاحي"
            v-model="form.opening_balance"
            placeholder="0.00 (اختياري)"
          />
          <p v-if="errors.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
            لا يمكن أن يكون الرصيد الافتتاحي للعميل بالسالب.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ العميل</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// استيراد المكونات القياسية من مكتبة الـ UI الخاصة بنظامك
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

// كائن إدارة الأخطاء يدوياً بالتوافق مع قواعد التحقق
const errors = reactive({
  name: false,
  credit_limit: false,
  opening_balance: false,
})

// دالة تهيئة كائن نموذج نظيف وجديد للعميل
const createFreshForm = () => ({
  id: null,
  name: '',
  phone: '',
  email: '',
  credit_limit: '',
  opening_balance: '',
})

const form = ref(createFreshForm())

// مراقبة البروبس الممررة لتعبئة الحقول عند تعديل بيانات العميل أو تصفيرها عند الإضافة
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        phone: newData.phone || '',
        email: newData.email || '',
        credit_limit:
          newData.credit_limit !== null && newData.credit_limit !== undefined
            ? newData.credit_limit
            : '',
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

// دالة التحقق اليدوي البسيط قبل الإرسال الفعلي إلى الستور والأب
const handleSubmit = () => {
  errors.name = false
  errors.credit_limit = false
  errors.opening_balance = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  if (form.value.credit_limit !== '' && form.value.credit_limit < 0) {
    errors.credit_limit = true
    return
  }

  if (form.value.opening_balance !== '' && form.value.opening_balance < 0) {
    errors.opening_balance = true
    return
  }

  // إعداد البيانات وتجهيزها بشكل نهائي للباك إند
  const payload = {
    ...form.value,
    credit_limit: form.value.credit_limit !== '' ? Number(form.value.credit_limit) : null,
    opening_balance: form.value.opening_balance !== '' ? Number(form.value.opening_balance) : null,
  }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
