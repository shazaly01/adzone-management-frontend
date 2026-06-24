<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="account-name"
          label="اسم الحساب المالي"
          v-model="form.name"
          placeholder="أدخل اسم الحساب بالكامل (مثال: الأصول المتداولة)"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم الحساب المالي مطلوب ولا يمكن تركه فارغاً.
        </p>
        <p
          v-else-if="getServerValidationError('name')"
          class="text-rose-500 text-xs mt-1 font-bold"
        >
          {{ getServerValidationError('name') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppDropdown
            id="account-type"
            label="نوع الحساب"
            v-model="form.type"
            :options="accountTypes"
            required
          />
          <p v-if="errors.type" class="text-rose-500 text-xs mt-1 font-bold">
            نوع الحساب المختار غير صالح أو لم يتم تحديده.
          </p>
          <p
            v-else-if="getServerValidationError('type')"
            class="text-rose-500 text-xs mt-1 font-bold"
          >
            {{ getServerValidationError('type') }}
          </p>
        </div>

        <div>
          <AppDropdown
            id="account-parent"
            label="الحساب الرئيسي (الأب)"
            v-model="form.parent_id"
            :options="parentOptions"
            placeholder="حساب رئيسي جذر (بدون أب)"
          />
          <p
            v-if="getServerValidationError('parent_id')"
            class="text-rose-500 text-xs mt-1 font-bold"
          >
            {{ getServerValidationError('parent_id') }}
          </p>
        </div>
      </div>

      <div v-if="!form.id" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppCurrencyInput
            id="account-opening-balance"
            label="الرصيد الافتتاحي"
            v-model="form.opening_balance"
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
          />
          <p v-if="errors.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
            لا يمكن أن يكون الرصيد الافتتاحي أقل من صفر ويجب أن يكون قيمة رقمية.
          </p>
          <p
            v-else-if="getServerValidationError('opening_balance')"
            class="text-rose-500 text-xs mt-1 font-bold"
          >
            {{ getServerValidationError('opening_balance') }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الحساب</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import { useAccountStore } from '@/stores/accountStore'

// استيراد مكونات النظام القياسية المعتمدة (تم استبعاد AppSelect المفقود)
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
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

const accountStore = useAccountStore()

// إدارة حالات الخطأ والتحقق اليدوي المتطابق مع رسائل Laravel الفردية
const errors = reactive({
  name: false,
  type: false,
  opening_balance: false,
})

// مصفوفة الخيارات الخاصة بأنواع الحسابات المعتمدة داخل الـ Request Rule
const accountTypes = ref([
  { value: 'normal', label: 'عام / عادي', name: 'عام / عادي' },
  { value: 'cash', label: 'خزينة / نقدي', name: 'خزينة / نقدي' },
  { value: 'bank', label: 'بنكي', name: 'بنكي' },
  { value: 'customer', label: 'عملاء', name: 'عملاء' },
  { value: 'supplier', label: 'موردين', name: 'موردين' },
  { value: 'expense', label: 'مصروفات', name: 'مصروفات' },
  { value: 'income', label: 'إيرادات', name: 'إيرادات' },
])

// تجهيز كائن البيانات النظيفة
const createFreshForm = () => ({
  id: null,
  name: '',
  parent_id: '',
  type: 'normal',
  opening_balance: 0,
})

const form = ref(createFreshForm())

// دالة لجلب أخطاء التحقق الواردة من السيرفر
const getServerValidationError = (field) => {
  if (accountStore.validationErrors && accountStore.validationErrors[field]) {
    return accountStore.validationErrors[field][0]
  }
  return null
}

// تسوية الحسابات المتاحة لشجرة الخيارات ومنع الحلقات اللانهائية
const parentOptions = computed(() => {
  const flattenAccounts = (list, result = []) => {
    list.forEach((acc) => {
      if (!form.value.id || acc.id !== form.value.id) {
        result.push({
          id: acc.id,
          value: acc.id,
          name: `${acc.code} - ${acc.name}`,
          label: `${acc.code} - ${acc.name}`,
        })
        if (acc.children && acc.children.length > 0) {
          flattenAccounts(acc.children, result)
        }
      }
    })
    return result
  }
  return flattenAccounts(accountStore.accounts)
})

// مراقبة التهيئة للتعديل أو الإضافة السريعة مع الفروع
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id || null,
        name: newData.name || '',
        parent_id: newData.parent_id || '',
        type: newData.type || 'normal',
        opening_balance: newData.opening_balance || 0,
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة الفحص اليدوي والإرسال النظيف
const handleSubmit = () => {
  errors.name = false
  errors.type = false
  errors.opening_balance = false

  accountStore.validationErrors = null

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  const validTypes = ['cash', 'bank', 'customer', 'supplier', 'expense', 'income', 'normal']
  if (!form.value.type || !validTypes.includes(form.value.type)) {
    errors.type = true
    return
  }

  if (form.value.opening_balance < 0) {
    errors.opening_balance = true
    return
  }

  const payload = {
    ...form.value,
    parent_id: form.value.parent_id ? Number(form.value.parent_id) : null,
    opening_balance: Number(form.value.opening_balance),
  }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
