<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>
    <div class="relative w-full">
      <input
        :id="id"
        type="date"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :required="required"
        class="w-full p-2 bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-surface-border rounded-md shadow-sm text-gray-900 dark:text-text-primary transition-colors duration-200 hover:border-blue-500 dark:hover:border-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-primary dark:focus:ring-primary focus:outline-none text-sm scheme-dark-date"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* تحسين شكل وألوان أيقونة اختيار التاريخ لتتناسب مع التصميم الداكن */
:global(.dark) .scheme-dark-date::-webkit-calendar-picker-indicator {
  filter: invert(0.8) sepia(1) saturate(5) hue-rotate(175deg);
  cursor: pointer;
}
</style>
