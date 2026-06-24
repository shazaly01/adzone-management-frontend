<!--src\components\forms\DesignersDropdown.vue--->
<template>
  <div>
    <AppDropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="users"
      :loading="loading"
      :required="required"
      :variant="variant"
      option-label="full_name"
      option-value="id"
      placeholder="اختر مصمم..."
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المصمم' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

// استهلاك الـ Store المحدث والمحمي أمنياً لتمرير توكين التوثيق وترويسات الـ JSON تلقائياً
const userStore = useUserStore()
const { users, loading } = storeToRefs(userStore)
const error = ref(null)

onMounted(async () => {
  // شحن وتصفية المستخدمين من نوع "مصمم" فقط لتغذية حقل الكاشير
  try {
    await userStore.fetchUsers(1, {
      type: 'designer',
      per_page: 1000,
    })
  } catch (err) {
    error.value = 'فشل تحميل قائمة المصممين.'
    console.error('Failed to fetch designers via store:', err)
  }
})
</script>
