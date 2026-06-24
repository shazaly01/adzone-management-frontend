<!--src\components\forms\CategoriesDropdown.vue--->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="categories"
      :loading="loading"
      :required="required"
      placeholder="اختر المجموعة..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المجموعة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const categoryStore = useCategoryStore()
const { categories, loading } = storeToRefs(categoryStore)
const error = ref(null)

onMounted(async () => {
  if (categories.value.length === 0) {
    try {
      await categoryStore.fetchCategories(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة المجموعات.'
      console.error('Failed to fetch categories for dropdown:', err)
    }
  }
})
</script>
