<!---src\components\forms\TreasuriesDropdown.vue-->
<template>
  <div>
    <AppDropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="treasuries"
      :loading="loading"
      :required="required"
      :variant="variant"
      placeholder="اختر خزنة مالية..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الخزنة المالية' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

const treasuryStore = useTreasuryStore()
const { treasuries, loading } = storeToRefs(treasuryStore)
const error = ref(null)

onMounted(async () => {
  if (treasuries.value.length === 0) {
    try {
      // تمرير الصفحة الأولى وفلتر جلب عدد كافي للمنسدلة
      await treasuryStore.fetchTreasuries(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة الخزائن المالية.'
      console.error('Failed to fetch treasuries for dropdown:', err)
    }
  }
})
</script>
