<!--src\components\forms\CustomersDropdown.vue--->
<template>
  <div>
    <AppDropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="customers"
      :loading="loading"
      :required="required"
      :variant="variant"
      placeholder="اختر عميل..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customerStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'العميل' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

const customerStore = useCustomerStore()
const { customers, loading } = storeToRefs(customerStore)
const error = ref(null)

onMounted(async () => {
  if (customers.value.length === 0) {
    try {
      await customerStore.fetchCustomers(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة العملاء.'
      console.error('Failed to fetch customers for dropdown:', err)
    }
  }
})
</script>
