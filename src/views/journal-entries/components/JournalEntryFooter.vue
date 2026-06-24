<template>
  <div
    class="p-3 bg-surface-ground/95 rounded-lg border border-amber-500/40 shadow-[0_0_12px_3px_rgba(245,158,11,0.15)] grid grid-cols-1 md:grid-cols-3 gap-3 items-start text-right transition-all duration-300"
    dir="rtl"
  >
    <div class="flex flex-col space-y-1 md:col-span-1">
      <label class="text-[11px] font-black text-text-secondary">البيان / الملاحظات العامة</label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="اكتب بياناً شاملاً يوضح طبيعة وأسباب هذا القيد المالي..."
        class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-amber-500/60 outline-none transition-all resize-none focus:ring-1 focus:ring-amber-500/10"
      ></textarea>
      <p v-if="getFieldError('notes')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('notes') }}
      </p>
    </div>

    <div
      class="p-2 bg-surface-ground rounded-md border border-surface-border/60 grid grid-cols-2 gap-2 md:col-span-1 font-semibold text-xs"
    >
      <div
        class="flex flex-col space-y-1 bg-surface-card p-2 rounded border border-surface-border/40 text-center"
      >
        <span class="text-[10px] font-black text-text-secondary">إجمالي المدين</span>
        <span class="font-mono text-sm font-black text-primary mt-1">
          {{ formatCurrency(totalDebit) }}
        </span>
      </div>

      <div
        class="flex flex-col space-y-1 bg-surface-card p-2 rounded border border-surface-border/40 text-center"
      >
        <span class="text-[10px] font-black text-text-secondary">إجمالي الدائن</span>
        <span class="font-mono text-sm font-black text-emerald-500 mt-1">
          {{ formatCurrency(totalCredit) }}
        </span>
      </div>

      <p
        v-if="getFieldError('lines')"
        class="text-rose-500 text-[10px] font-bold text-center col-span-2 mt-0.5"
      >
        {{ getFieldError('lines') }}
      </p>
    </div>

    <div
      class="p-2 bg-surface-ground rounded-md border border-surface-border/60 space-y-1.5 md:col-span-1 font-semibold text-xs h-full flex flex-col justify-between"
    >
      <div
        class="flex justify-between items-center text-text-secondary pb-1 border-b border-surface-border/40"
      >
        <span>فارق الاتزان الحسابي:</span>
        <span
          class="font-mono font-bold text-sm"
          :class="isBalanced ? 'text-emerald-500' : 'text-rose-500'"
        >
          {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}
        </span>
      </div>

      <div
        v-if="isBalanced"
        class="flex justify-between items-center bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-md text-emerald-400"
      >
        <span class="font-black text-[11px]">حالة موازنة السند:</span>
        <span
          class="text-xs font-black tracking-wide drop-shadow-[0_0_6px_rgba(16,185,129,0.25)] flex items-center gap-1"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          قيد متزن محاسبياً
        </span>
      </div>

      <div
        v-else
        class="flex justify-between items-center bg-rose-950/40 border border-rose-500/30 p-2 rounded-md text-rose-400"
      >
        <span class="font-black text-[11px]">حالة موازنة Sند:</span>
        <span
          class="text-xs font-black tracking-wide drop-shadow-[0_0_6px_rgba(244,63,94,0.25)] flex items-center gap-1"
        >
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-bounce"></span>
          غير متزن (يوجد فارق)
        </span>
      </div>

      <p
        v-if="getFieldError('balance')"
        class="text-rose-500 text-[10px] text-center font-bold mt-1"
      >
        {{ getFieldError('balance') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })

const props = defineProps({
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

const isBalanced = computed(() => {
  return Math.abs(props.totalDebit - props.totalCredit) < 0.01
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
