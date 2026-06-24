<template>
  <div>
    <label
      v-if="label"
      :for="id"
      :class="[
        'block text-sm font-medium mb-1',
        variant === 'sales' ? 'text-gray-300' : 'text-gray-700 dark:text-text-secondary',
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      :class="[
        'block w-full rounded-md shadow-sm transition-all duration-200 p-3 focus:outline-none text-sm',
        variant === 'sales'
          ? 'bg-[#25272e] border border-[#383b45] text-white placeholder:text-gray-500 focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] focus:shadow-[0_0_10px_rgba(224,94,43,0.3)]'
          : 'bg-gray-50 border-2 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary dark:focus:border-primary',
      ]"
    ></textarea>
    <p v-if="error" class="mt-1 text-sm text-danger">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  rows: { type: [String, Number], default: 3 },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])
</script>
