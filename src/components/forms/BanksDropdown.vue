<!--src\components\forms\BanksDropdown.vue--->
<template>
  <div>
    <AppDropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="banks"
      :loading="loading"
      :required="required"
      :variant="variant"
      placeholder="اختر بنك..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'البنك' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

const bankStore = useBankStore()
const { banks, loading } = storeToRefs(bankStore)
const error = ref(null)

onMounted(async () => {
  if (banks.value.length === 0) {
    try {
      // تمرير الصفحة الأولى وفلتر جلب عدد كافي للمنسدلة
      await bankStore.fetchBanks(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة البنوك.'
      console.error('Failed to fetch banks for dropdown:', err)
    }
  }
})
</script>
