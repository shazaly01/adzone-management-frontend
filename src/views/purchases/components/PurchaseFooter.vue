<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans" dir="rtl">
    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-gray-400">
        <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
          الإجماليات النهائية
        </h3>

        <div class="flex justify-between border-b border-gray-700/30 pb-1.5">
          <span>الإجمالي قبل المشتريات:</span>
          <span class="font-mono font-bold text-white">{{ formatCurrency(subtotal) }}</span>
        </div>

        <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-rose-400">
          <span>إجمالي الخصم المكتسب (-):</span>
          <span class="font-mono font-bold">{{ formatCurrency(discountModel || 0) }}</span>
        </div>

        <div class="flex justify-between border-b border-gray-700/30 pb-1.5 text-blue-400">
          <span>إجمالي الضريبة المضافة (+):</span>
          <span class="font-mono font-bold">{{ formatCurrency(taxModel || 0) }}</span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-[#16171b] border border-gray-700/50 p-2.5 rounded-lg text-[#e05e2b] shadow-[inner_0_0_10px_rgba(0,0,0,0.5)]"
        >
          <span class="font-black text-[11px]">الصافي النهائي الفعلي:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(grandTotal) }}
          </span>
        </div>

        <p
          v-if="getFieldError('grand_total')"
          class="text-rose-500 text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('grand_total') }}
        </p>
      </div>
    </div>

    <div class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4">
      <h3 class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5">
        إضافات مالية
      </h3>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col space-y-1.5">
          <label class="text-[11px] font-bold text-gray-400">الخصم العام (مبلغ)</label>
          <div
            class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="discountModel"
              class="block w-full h-full px-3 bg-transparent text-rose-500 font-mono text-left font-bold text-xs focus:outline-none"
            />
          </div>
          <p
            v-if="getFieldError('discount_amount')"
            class="text-rose-500 text-[10px] font-bold mt-0.5"
          >
            {{ getFieldError('discount_amount') }}
          </p>
        </div>

        <div class="flex flex-col space-y-1.5">
          <label class="text-[11px] font-bold text-gray-400">إجمالي الضريبة المضافة</label>
          <div
            class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="taxModel"
              class="block w-full h-full px-3 bg-transparent text-blue-400 font-mono text-left font-bold text-xs focus:outline-none"
            />
          </div>
          <p v-if="getFieldError('tax_amount')" class="text-rose-500 text-[10px] font-bold mt-0.5">
            {{ getFieldError('tax_amount') }}
          </p>
        </div>
      </div>
    </div>

    <div
      class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl flex flex-col space-y-1.5"
    >
      <label class="text-[11px] font-black text-gray-300 border-b border-gray-700/40 pb-1.5 mb-1">
        ملاحظات وشروط التوريد
      </label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="سجل أي اعتبارات، أو شروط تسليم خاصة بحركة المشتريات الحالية..."
        class="block w-full h-full min-h-[96px] p-3 border border-[#3e414c] rounded-lg bg-[#16171b] text-white placeholder:text-gray-500 text-xs font-semibold focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] outline-none transition-all resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

// ربط الموديلات التفاعلية ثنائية الاتجاه مع المكون الأب
const notesModel = defineModel('notes', { type: String, default: '' })
const discountModel = defineModel('discountAmount', { type: Number, default: 0 })
const taxModel = defineModel('taxAmount', { type: Number, default: 0 })

// استقبال البيانات الواردة والأخطاء التحققية من الخادم
const props = defineProps({
  subtotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

// دالة استرجاع وعرض رسائل الخطأ لكل حقل مالي على حدة
const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
