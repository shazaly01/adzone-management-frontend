<!---src\components\ui\AppDropdown.vue-->
<template>
  <div class="relative w-full">
    <label
      v-if="label"
      :for="id"
      :class="[
        'block text-sm font-medium mb-1',
        props.variant === 'sales' ? 'text-gray-300' : 'text-gray-700 dark:text-text-secondary',
      ]"
    >
      {{ label }}
    </label>

    <Dropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :filter="true"
      :loading="loading"
      :required="required"
      :placeholder="placeholder"
      :show-clear="showClear"
      :disabled="disabled"
      appendTo="body"
      class="w-full"
      :pt="{
        root: ({ state }) => ({
          class: [
            'w-full inline-flex relative cursor-pointer select-none items-center h-full',
            props.variant === 'sales'
              ? 'bg-transparent dark:bg-transparent border-0 shadow-none outline-none ring-0'
              : 'bg-gray-50 border-2 transition-colors duration-200 rounded-md shadow-sm dark:bg-surface-ground border-gray-300 dark:border-surface-border hover:border-blue-500 dark:hover:border-primary',
            state.focused && props.variant !== 'sales'
              ? 'border-blue-500 ring-2 ring-blue-500 dark:border-primary dark:ring-primary outline-none'
              : '',
            disabled
              ? 'opacity-60 cursor-not-allowed pointer-events-none bg-gray-200 dark:bg-surface-ground'
              : '',
          ],
        }),
        input: {
          class: [
            'w-full bg-transparent border-0 focus:outline-none text-xs font-bold',
            props.variant === 'sales'
              ? 'text-white placeholder:text-gray-500 p-0 pr-1'
              : 'text-gray-900 dark:text-text-primary p-2',
          ],
        },
        trigger: {
          class: [
            'flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400',
            props.variant === 'sales' ? 'w-6 h-full' : 'w-12',
          ],
        },
        clearIcon: {
          class: [
            'mr-1 text-xs',
            props.variant === 'sales'
              ? 'text-gray-500 hover:text-gray-300'
              : 'text-gray-500 dark:text-gray-400 mr-2',
          ],
        },
        panel: {
          class: [
            props.variant === 'sales'
              ? 'bg-[#1a1b20] border border-[#383b45]'
              : 'bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-600',
            'rounded-md shadow-2xl',
            'mt-1',
            'overflow-hidden',
          ],
        },
        header: {
          class: [
            'p-2 border-b',
            props.variant === 'sales'
              ? 'border-[#383b45] bg-[#25272e]'
              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800',
          ],
        },
        filterInput: {
          class: [
            'w-full p-2 border rounded-md focus:outline-none text-xs',
            props.variant === 'sales'
              ? 'bg-[#25272e] border-[#383b45] text-white focus:border-[#e05e2b]'
              : 'border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-500',
          ],
        },
        list: {
          class: [
            'p-1 max-h-60 overflow-y-auto custom-scrollbar',
            props.variant === 'sales' ? 'bg-[#1a1b20]' : 'bg-white dark:bg-[#1f2937]',
            'relative z-10',
          ],
        },
        item: ({ context }) => ({
          class: [
            'p-2 rounded-md cursor-pointer overflow-hidden whitespace-nowrap text-xs',
            'transition-colors duration-150',
            !context.focused && !context.selected
              ? props.variant === 'sales'
                ? 'text-gray-300 hover:bg-[#25272e] hover:text-white'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              : '',
            context.focused && !context.selected
              ? props.variant === 'sales'
                ? 'bg-[#25272e] text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
              : '',
            context.selected
              ? props.variant === 'sales'
                ? 'bg-[#e05e2b]/20 text-[#e05e2b] font-bold'
                : 'bg-blue-50 dark:bg-primary/20 text-blue-700 dark:text-primary font-bold'
              : '',
          ],
        }),
        itemGroup: {
          class: [
            'p-2 font-bold text-xs',
            props.variant === 'sales' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400',
          ],
        },
      }"
    />
  </div>
</template>

<script setup>
import Dropdown from 'primevue/dropdown'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'name' },
  optionValue: { type: String, default: 'id' },
  placeholder: { type: String, default: 'اختر...' },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  showClear: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
