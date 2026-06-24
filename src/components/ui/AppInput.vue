<!--src\components\ui\AppInput.vue--->
<template>
  <div>
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label
        :for="id"
        :class="[
          'block text-sm font-medium',
          variant === 'sales' ? 'text-gray-300' : 'text-gray-700 dark:text-text-secondary',
        ]"
      >
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :dir="dir"
      :class="[
        'block w-full rounded-md shadow-sm py-2 px-3 transition-all duration-200 text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'sales'
          ? 'bg-[#25272e] border border-[#383b45] text-white placeholder:text-gray-500 focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] focus:shadow-[0_0_10px_rgba(224,94,43,0.3)]'
          : 'bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-2 dark:focus:ring-emerald-400 dark:focus:border-emerald-400 dark:shadow-[0_0_15px_rgba(52,211,153,0.1)]',
        inputClass,
      ]"
    />
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dir: {
    type: String,
    default: null,
  },
  inputClass: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
  },
})

defineEmits(['update:modelValue'])
</script>
