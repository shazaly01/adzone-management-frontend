<!--src\components\ui\AppCurrencyInput.vue--->
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
    </label>

    <div class="relative">
      <div
        :class="[
          'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10 text-xs',
          variant === 'sales' ? 'text-gray-400 font-medium' : 'text-gray-500 dark:text-text-muted',
        ]"
      >
        <span class="font-bold">{{ DEFAULT_CURRENCY }}</span>
      </div>

      <input
        :id="id"
        ref="inputRef"
        type="text"
        :value="displayValue"
        @input="handleInput"
        :placeholder="placeholder"
        :required="required"
        dir="ltr"
        :class="[
          'block w-full pr-12 pl-3 py-2 rounded-md text-sm font-bold text-right transition-all duration-200 focus:outline-none',
          variant === 'sales'
            ? 'bg-[#25272e] border border-[#383b45] text-white placeholder:text-gray-500 focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] focus:shadow-[0_0_10px_rgba(224,94,43,0.3)]'
            : 'bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-2 dark:focus:ring-emerald-400 dark:focus:border-emerald-400',
        ]"
        inputmode="decimal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { DEFAULT_CURRENCY } from '@/utils/formatters'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [Number, String], default: '' },
  placeholder: { type: String, default: '0' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

const displayValue = ref('')

const formatNumber = (value) => {
  if (!value) return ''
  let parts = value.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

watch(
  () => props.modelValue,
  (newValue) => {
    const currentRaw = displayValue.value.replace(/,/g, '')
    if (newValue != currentRaw) {
      displayValue.value = formatNumber(newValue)
    }
  },
  { immediate: true },
)

const handleInput = (event) => {
  let value = event.target.value
  value = value.replace(/[^0-9.]/g, '')

  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  const rawValue = value === '' ? null : value
  emit('update:modelValue', rawValue)
  displayValue.value = formatNumber(value)
}
</script>
