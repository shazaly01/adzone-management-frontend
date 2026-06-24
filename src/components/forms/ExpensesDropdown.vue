<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="expenses"
      :loading="loading"
      :required="required"
      :variant="variant"
      placeholder="اختر بند مصروف..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'بند المصروف' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

const expenseStore = useExpenseStore()
const { expenses, loading } = storeToRefs(expenseStore)
const error = ref(null)

onMounted(async () => {
  if (expenses.value.length === 0) {
    try {
      await expenseStore.fetchExpenses(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة المصاريف.'
      console.error('Failed to fetch expenses for dropdown:', err)
    }
  }
})
</script>
