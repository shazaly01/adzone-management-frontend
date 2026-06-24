<!--src\components\forms\SuppliersDropdown.vue--->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="suppliers"
      :loading="loading"
      :required="required"
      :variant="variant"
      placeholder="اختر مورد..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupplierStore } from '@/stores/supplierStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المورد' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

const supplierStore = useSupplierStore()
const { suppliers, loading } = storeToRefs(supplierStore)
const error = ref(null)

onMounted(async () => {
  if (suppliers.value.length === 0) {
    try {
      await supplierStore.fetchSuppliers(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة الموردين.'
      console.error('Failed to fetch suppliers for dropdown:', err)
    }
  }
})
</script>
