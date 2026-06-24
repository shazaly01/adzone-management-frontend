<template>
  <div
    class="p-3 bg-surface-ground/95 rounded-lg border border-primary/40 shadow-[0_0_12px_3px_rgba(30,129,255,0.15)] grid grid-cols-1 md:grid-cols-3 gap-3 items-start text-right transition-all duration-300"
    dir="rtl"
  >
    <div class="flex flex-col space-y-1 md:col-span-1">
      <label class="text-[11px] font-black text-text-secondary"
        >ملاحظات وبيان التسوية الجردية</label
      >
      <textarea
        v-model="notesModel"
        rows="2"
        placeholder="سجل أسباب الفروقات الجردية أو تفاصيل تسوية المستودع الحالية..."
        class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-primary/60 outline-none transition-all resize-none focus:ring-1 focus:ring-primary/10"
      ></textarea>
    </div>

    <div
      class="p-2 bg-surface-ground rounded-md border border-surface-border/60 grid grid-cols-2 gap-2 md:col-span-1"
    >
      <div class="flex flex-col space-y-1 col-span-2">
        <div class="flex justify-between items-center text-xs font-semibold text-text-secondary">
          <span>إجمالي بنود الفحص الجردي:</span>
          <span
            class="font-mono font-bold text-text-primary bg-surface-card px-2 py-0.5 rounded border border-surface-border"
          >
            {{ totalItems }} أصناف
          </span>
        </div>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-rose-500">إجمالي قيمة العجز (-)</label>
        <div
          class="block w-full px-2 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground font-mono text-left font-bold text-xs text-rose-500 bg-rose-950/10 border-rose-500/20"
        >
          {{ formatCurrency(totalShortage) }}
        </div>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-emerald-500">إجمالي قيمة الفائض (+)</label>
        <div
          class="block w-full px-2 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground font-mono text-left font-bold text-xs text-emerald-500 bg-emerald-950/10 border-emerald-500/20"
        >
          {{ formatCurrency(totalSurplus) }}
        </div>
      </div>
    </div>

    <div
      class="p-2 bg-surface-ground rounded-md border border-surface-border/60 space-y-1.5 md:col-span-1 font-semibold text-xs"
    >
      <div class="flex justify-between border-b border-surface-border/40 pb-1 text-rose-500/90">
        <span>خسائر عجز المخزون الحالية:</span>
        <span class="font-mono font-bold">{{ formatCurrency(totalShortage) }}</span>
      </div>

      <div class="flex justify-between border-b border-surface-border/40 pb-1 text-emerald-500/90">
        <span>أرباح فائض المخزون الحالية:</span>
        <span class="font-mono font-bold">{{ formatCurrency(totalSurplus) }}</span>
      </div>

      <div
        class="flex justify-between items-center p-1.5 rounded-md border transition-all duration-300"
        :class="netImpactClass"
      >
        <span class="font-black text-[11px]">صافي تأثير التسوية المالي:</span>
        <span class="text-base font-mono font-black tracking-wide">
          {{ formatCurrency(netImpact) }}
        </span>
      </div>

      <p v-if="getFieldError('items')" class="text-rose-500 text-[10px] text-center font-bold mt-1">
        {{ getFieldError('items') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

// ارتباط الملاحظات ثنائي الاتجاه مع شاشة التسوية الجردية الأب
const notesModel = defineModel('notes', { type: String, default: '' })

// استقبال قيم الجرد والتسوية الممررة من الشاشة الأب (StockAdjustmentForm)
const props = defineProps({
  totalItems: { type: Number, default: 0 },
  totalShortage: { type: Number, default: 0 }, // قيمة العجز المالي التراكمي لأسطر الجدول
  totalSurplus: { type: Number, default: 0 }, // قيمة الفائض المالي التراكمي لأسطر الجدول
  validationErrors: { type: Object, default: () => null },
})

// احتساب صافي التأثير المالي النهائي لتوجيه الحسابات
const netImpact = computed(() => {
  return props.totalSurplus - props.totalShortage
})

// ديناميكية تلوين الإطار والصافي بناءً على حالة الجرد الفعلي (فائض أم عجز) لإبهار الإدارة
const netImpactClass = computed(() => {
  if (netImpact.value > 0) {
    return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.25)]'
  } else if (netImpact.value < 0) {
    return 'bg-rose-950/40 border-rose-500/30 text-rose-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.25)]'
  }
  return 'bg-slate-900 border-surface-border text-text-primary'
})

// استخراج وفك رسائل الأخطاء الواردة من السيرفر
const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
