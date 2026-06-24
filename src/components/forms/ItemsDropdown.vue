<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="items"
      option-label="item_name"
      option-value="id"
      :loading="loading"
      :required="required"
      placeholder="اختر صنف..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الصنف' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const itemStore = useItemStore()
const { items, loading, error } = storeToRefs(itemStore)

onMounted(async () => {
  if (items.value.length === 0) {
    try {
      // جلب عدد كافي لتغذية الفلتر من الأصناف المتاحة
      await itemStore.fetchItems(1, { per_page: 1000 })
    } catch (err) {
      console.error('Failed to fetch items for dropdown:', err)
    }
  }
})
</script>
