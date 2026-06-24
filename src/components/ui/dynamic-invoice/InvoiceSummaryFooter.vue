<template>
  <div
    class="p-6 bg-surface-card rounded-xl border border-surface-border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-right"
    dir="rtl"
  >
    <div class="flex flex-col space-y-2 md:col-span-1">
      <label class="text-sm font-semibold text-text-secondary">ملاحظات وشروط التوريد</label>
      <textarea
        v-model="notesModel"
        rows="4"
        placeholder="سجل أي اعتبارات أو شروط خاصة بهذه الفاتورة..."
        class="block w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm resize-none"
      ></textarea>
    </div>

    <div
      class="p-4 bg-surface-ground rounded-xl border border-surface-border grid grid-cols-2 gap-4 md:col-span-1"
    >
      <div class="flex flex-col space-y-1.5">
        <label class="text-xs font-bold text-text-secondary">قيمة الخصم التجاري العام</label>
        <input
          type="number"
          step="0.01"
          min="0"
          v-model.number="discountModel"
          class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm font-mono text-left font-bold text-rose-500"
        />
        <p v-if="getFieldError('discount_amount')" class="text-rose-500 text-[11px] font-bold mt-1">
          {{ getFieldError('discount_amount') }}
        </p>
      </div>

      <div class="flex flex-col space-y-1.5">
        <label class="text-xs font-bold text-text-secondary">إجمالي الضريبة المضافة</label>
        <input
          type="number"
          step="0.01"
          min="0"
          v-model.number="taxModel"
          class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm font-mono text-left font-bold text-primary"
        />
        <p v-if="getFieldError('tax_amount')" class="text-rose-500 text-[11px] font-bold mt-1">
          {{ getFieldError('tax_amount') }}
        </p>
      </div>
    </div>

    <div
      class="p-4 bg-surface-ground rounded-xl border border-surface-border space-y-3 md:col-span-1 font-semibold text-sm"
    >
      <div class="flex justify-between border-b border-surface-border pb-2 text-text-secondary">
        <span>إجمالي السطور (قبل الخصم والضريبة):</span>
        <span class="font-mono font-bold text-text-primary">{{ formatCurrency(subtotal) }}</span>
      </div>

      <div class="flex justify-between border-b border-surface-border pb-2 text-rose-500">
        <span>خصم الفاتورة الإجمالي (-):</span>
        <span class="font-mono font-bold">{{ formatCurrency(discountModel || 0) }}</span>
      </div>

      <div class="flex justify-between border-b border-surface-border pb-2 text-primary">
        <span>ضريبة الفاتورة الإجمالية (+):</span>
        <span class="font-mono font-bold">{{ formatCurrency(taxModel || 0) }}</span>
      </div>

      <div class="flex justify-between pt-1 text-text-primary text-lg font-black">
        <span>الصافي النهائي الفعلي (Grand Total):</span>
        <span class="text-2xl text-emerald-600 font-mono font-black">
          {{ formatCurrency(grandTotal) }}
        </span>
      </div>

      <p
        v-if="getFieldError('grand_total')"
        class="text-rose-500 text-xs text-center font-bold mt-2"
      >
        {{ getFieldError('grand_total') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

// تعريف الروابط التفاعلية ثنائية الاتجاه للمدخلات الخاصة بالتذييل
const notesModel = defineModel('notes', { type: String, default: '' })
const discountModel = defineModel('discountAmount', { type: Number, default: 0 })
const taxModel = defineModel('taxAmount', { type: Number, default: 0 })

// تعريف الـ Props للمجاميع المحسوبة القادمة من الأب وأخطاء الباك إيند
const props = defineProps({
  subtotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

// دالة داخلية لاستخراج أخطاء التحقق للحقول المالية
const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
