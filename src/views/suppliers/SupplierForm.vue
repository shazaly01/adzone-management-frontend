<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="supplier-name"
          label="اسم المورد"
          v-model="form.name"
          placeholder="ادخل اسم المورد أو الشركة الموردة"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم المورد مطلوب وإلزامي.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="supplier-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="ادخل رقم الهاتف (اختياري)"
        />

        <AppInput
          id="supplier-tax-number"
          label="الرقم الضريبي (Tax Number)"
          v-model="form.tax_number"
          placeholder="ادخل الرقم الضريبي للمورد (اختياري)"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppCurrencyInput
            id="supplier-opening-balance"
            label="الرصيد الافتتاحي"
            v-model="form.opening_balance"
            placeholder="0.00 (اختياري)"
          />
          <p v-if="errors.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
            لا يمكن أن يكون الرصيد الافتتاحي للمورد بالسالب.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ المورد</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// استيراد مكونات واجهة المستخدم القياسية المعتمدة في النظام
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

// إدارة أخطاء التحقق محلياً ويدوياً بالتوافق مع الـ Request
const errors = reactive({
  name: false,
  opening_balance: false,
})

// دالة تهيئة كائن نموذج نظيف وجديد للمورد
const createFreshForm = () => ({
  id: null,
  name: '',
  phone: '',
  tax_number: '',
  opening_balance: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات الابتدائية لتعبئة الحقول عند تعديل بيانات المورد أو تصفيرها عند الإضافة
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        phone: newData.phone || '',
        tax_number: newData.tax_number || '',
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

// دالة التحقق اليدوي البسيط قبل الإرسال الفعلي
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
