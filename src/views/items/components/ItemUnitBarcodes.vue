<template>
  <div class="space-y-2">
    <label class="block text-xs font-bold text-text-secondary">
      الباركودات المرتبطة (امسح بالإسكانر مباشرة 🛒)
    </label>

    <div class="relative">
      <input
        v-model="newBarcode"
        @keydown.enter.prevent="addBarcodeTag"
        type="text"
        placeholder="امسح الباركود هنا..."
        class="block w-full px-3 py-1.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary text-xs font-mono outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
      />
      <span
        class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted italic select-none"
      >
        Enter ↩
      </span>
    </div>

    <div class="flex flex-wrap gap-1 mt-1.5">
      <span
        v-for="(bc, bIdx) in props.modelValue"
        :key="bIdx"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-section text-text-primary font-mono text-[11px] font-bold rounded border border-surface-border transition-all hover:border-rose-300 group"
      >
        {{ bc }}
        <button
          type="button"
          @click="removeBarcodeTag(bIdx)"
          class="text-text-muted hover:text-rose-500 text-[10px] mr-0.5 font-black transition-colors"
          title="إزالة هذا الباركود"
        >
          ✕
        </button>
      </span>

      <p
        v-if="!props.modelValue || props.modelValue.length === 0"
        class="text-[10px] text-text-muted italic pt-0.5"
      >
        لم يتم ربط أي باركود مخصص لهذه الوحدة بعد.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  modelValue: { type: Array, required: true, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])
const toast = useToast()
const newBarcode = ref('')

/**
 * إضافة تاق باركود جديد للوحدة النشطة تلقائياً فور صدور إشارة الـ Enter من الإسكانر
 */
const addBarcodeTag = () => {
  const code = newBarcode.value.trim()
  if (!code) return

  // منع تكرار نفس الباركود في نفس الوحدة لتفادي تضارب قواعد البيانات
  if (props.modelValue.includes(code)) {
    toast.warning('هذا الباركود مدرج مسبقاً لهذه الوحدة.')
    newBarcode.value = ''
    return
  }

  // تمرير المصفوفة الجديدة للأب للحفاظ على تدفق البيانات أحادي الاتجاه
  emit('update:modelValue', [...props.modelValue, code])
  newBarcode.value = '' // تصفير فوري للحقل استعداداً للمسحة التالية دون تشتيت
}

/**
 * إزالة تاق باركود معين وتحديث الحالة العلوية
 */
const removeBarcodeTag = (index) => {
  const updatedBarcodes = props.modelValue.filter((_, idx) => idx !== index)
  emit('update:modelValue', updatedBarcodes)
}
</script>
