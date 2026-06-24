<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="bank-name"
          label="اسم البنك"
          v-model="form.name"
          placeholder="ادخل اسم البنك بالكامل"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">
          اسم البنك مطلوب وإلزامي.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="account-number"
          label="رقم الحساب البنكي"
          v-model="form.account_number"
          placeholder="ادخل رقم الحساب (اختياري)"
        />

        <AppInput
          id="bank-iban"
          label="رقم الآيبان (IBAN)"
          v-model="form.iban"
          placeholder="ادخل رقم الآيبان (اختياري)"
        />
      </div>

      <div>
        <AppInput
          id="opening-balance"
          label="الرصيد الافتتاحي"
          type="number"
          step="0.01"
          min="0"
          v-model="form.opening_balance"
          placeholder="ادخل الرصيد الافتتاحي (اختياري)"
        />
        <p v-if="errors.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
          لا يمكن أن يكون الرصيد الافتتاحي بالسالب.
        </p>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ البنك</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// استيراد مكونات UI الأساسية حسب الهوية المعتمدة لديك
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

// إدارة الأخطاء يدوياً بالتوافق مع قواعد الباك إند
const errors = reactive({
  name: false,
  opening_balance: false,
})

// دالة تصفير وإنشاء نموذج فارغ جديد
const createFreshForm = () => ({
  id: null,
  name: '',
  account_number: '',
  iban: '',
  opening_balance: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات الابتدائية لتحديث النموذج في حالتي الإضافة والتعديل
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        account_number: newData.account_number || '',
        iban: newData.iban || '',
        opening_balance:
          newData.opening_balance !== undefined && newData.opening_balance !== null
            ? newData.opening_balance
            : '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة التحقق اليدوي والإرسال
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

  // تمرير البيانات نظيفة للمكون الأب
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
