<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-xl shadow-2xl p-6 w-full max-w-3xl transform overflow-y-auto max-h-[90vh] custom-scrollbar"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalTitle"
        >
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
            <h3
              id="modal-title"
              class="text-xl font-bold text-text-primary flex items-center gap-2"
            >
              <span
                class="w-2.5 h-2.5 rounded-full"
                :class="voucher?.voucher_type === 'receipt' ? 'bg-emerald-500' : 'bg-rose-500'"
              ></span>
              {{ modalTitle }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1.5 rounded-full hover:bg-surface-border transition-colors"
              aria-label="Close"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <VoucherForm
            :initial-data="voucher"
            :is-saving="isSaving"
            :accounts="accounts"
            :validation-errors="validationErrors"
            :is-type-disabled="isTypeDisabled"
            @submit="handleFormSubmit"
            @cancel="close"
          />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import VoucherForm from './VoucherForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  voucher: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  accounts: {
    type: Array,
    required: true,
  },
  validationErrors: {
    type: Object,
    default: null,
  },
  // الخاصية البنائية الجديدة لتمرير حالة قفل حقل النوع للتأكيد البصري
  isTypeDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

// احتساب عنوان النافذة بشكل تفصيلي وموجه لاسم وصنف الشاشة المفتوحة حالياً
const modalTitle = computed(() => {
  const isReceipt = props.voucher?.voucher_type === 'receipt'

  if (props.voucher && props.voucher.id) {
    const prefix = isReceipt ? 'تعديل سند قبض' : 'تعديل سند صرف'
    return `${prefix} رقم (${props.voucher.voucher_number || props.voucher.id})`
  } else {
    return isReceipt ? 'إنشاء سند قبض جديد' : 'إنشاء سند صرف جديد'
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
