<!--src\components\forms\StoresDropdown.vue--->
<template>
  <div class="w-full h-full">
    <AppDropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="stores"
      :loading="loading"
      :required="required"
      :variant="variant"
      placeholder="اختر مخزن..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/storeStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المخزن' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

const storeStore = useStoreStore()
const { stores, loading } = storeToRefs(storeStore)
const error = ref(null)

onMounted(async () => {
  if (stores.value.length === 0) {
    try {
      // تمرير الصفحة الأولى وفلتر جلب عدد كافي للمنسدلة
      await storeStore.fetchStores(1, { per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة المخازن.'
      console.error('Failed to fetch stores for dropdown:', err)
    }
  }
})
</script>
