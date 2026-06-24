<template>
  <AppDialog
    :model-value="isOpen"
    @update:model-value="close"
    :title="title"
    size-class="max-w-3xl"
  >
    <UserForm
      :initial-data="userData"
      :is-saving="isSaving"
      @submit="handleFormSubmit"
      @cancel="close"
    />
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import UserForm from './UserForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const userData = ref(props.user)

const title = computed(() => (props.user && props.user.id ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'))

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)
watch(
  () => props.user,
  (val) => {
    userData.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}
const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
