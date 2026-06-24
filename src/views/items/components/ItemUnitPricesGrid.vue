<template>
  <div class="space-y-3">
    <h4 class="text-xs font-bold text-text-secondary">مصفوفة أسعار فئات البيع والخصومات المشتقة</h4>

    <div class="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
      <div
        v-for="(priceRow, pIdx) in props.prices"
        :key="priceRow.price_list_id"
        class="p-3 bg-surface-ground rounded-lg border border-surface-border flex items-center justify-between gap-4"
      >
        <span class="text-xs font-bold text-text-primary w-28 shrink-0">
          {{ priceRow.price_list_name || 'فئة غير معرّفة' }}
        </span>

        <div class="flex items-center gap-3 flex-1 justify-end">
          <div class="w-24">
            <label class="block text-[9px] text-text-muted mb-0.5 text-center">الخصم (%)</label>
            <input
              :value="priceRow.discount_percentage"
              @input="(e) => handleDiscountInput(pIdx, Number(e.target.value))"
              type="number"
              min="0"
              max="100"
              step="0.01"
              class="block w-full px-2 py-1 border border-surface-border rounded bg-surface-section text-text-primary text-xs font-mono text-center outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div class="w-32">
            <label class="block text-[9px] text-text-muted mb-0.5 text-left">
              السعر النهائي ({{ DEFAULT_CURRENCY }})
            </label>
            <input
              :value="priceRow.price"
              @input="(e) => handlePriceInput(pIdx, Number(e.target.value))"
              type="number"
              step="0.01"
              min="0"
              class="block w-full px-2 py-1 border border-surface-border rounded bg-surface-section text-text-primary text-xs font-mono text-left outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// استيراد العملة المركزية لتوحيد مصفوفة الأسعار مع باقي أجزاء النظام
import { DEFAULT_CURRENCY } from '@/utils/formatters'

const props = defineProps({
  prices: { type: Array, required: true, default: () => [] },
  basePrice: { type: Number, required: true, default: 0 },
})

const emit = defineEmits(['update:prices'])

/**
 * أتمتة احتساب السعر النهائي للفئة بناءً على قيمة الخصم المدخلة حديثاً بالواجهة
 */
const handleDiscountInput = (index, discountValue) => {
  const currentBasePrice = props.basePrice || 0
  const calculatedPrice = Number((currentBasePrice * (1 - discountValue / 100)).toFixed(4))

  const updatedPrices = props.prices.map((priceObj, idx) => {
    if (idx !== index) return priceObj
    return {
      ...priceObj,
      discount_percentage: discountValue,
      price: calculatedPrice,
    }
  })

  emit('update:prices', updatedPrices)
}

/**
 * أتمتة احتساب نسبة الخصم المترتبة تلقائياً في حال قام العميل بتغيير السعر النهائي يدوياً
 */
const handlePriceInput = (index, priceValue) => {
  const currentBasePrice = props.basePrice || 0

  let calculatedDiscount = 0
  if (currentBasePrice > 0) {
    const difference = currentBasePrice - priceValue
    calculatedDiscount = Number(((difference / currentBasePrice) * 100).toFixed(2))
  }

  const updatedPrices = props.prices.map((priceObj, idx) => {
    if (idx !== index) return priceObj
    return {
      ...priceObj,
      discount_percentage: calculatedDiscount,
      price: priceValue,
    }
  })

  emit('update:prices', updatedPrices)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
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
