<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <AppCard
      class="p-4 border border-gray-800 border-r-4 border-r-gray-500 bg-surface-section/60 rounded-none"
    >
      <div class="text-[10px] text-gray-400 font-bold uppercase mb-1">الرصيد الافتتاحي السابق</div>
      <div class="text-xl font-black text-gray-300 font-mono">
        {{ formatCurrency(summary.opening_balance) }}
      </div>
    </AppCard>

    <AppCard
      class="p-4 border border-gray-800 border-r-4 border-r-emerald-500 bg-surface-section/60 rounded-none"
    >
      <div class="text-[10px] text-emerald-300/60 font-bold uppercase mb-1">
        إجمالي الحركات المدينة (+)
      </div>
      <div class="text-xl font-black text-emerald-400 font-mono">
        {{ formatCurrency(summary.total_period_debit || 0) }}
      </div>
    </AppCard>

    <AppCard
      class="p-4 border border-gray-800 border-r-4 border-r-rose-500 bg-surface-section/60 rounded-none"
    >
      <div class="text-[10px] text-rose-300/60 font-bold uppercase mb-1">
        إجمالي الحركات الدائنة (-)
      </div>
      <div class="text-xl font-black text-rose-400 font-mono">
        {{ formatCurrency(summary.total_period_credit || 0) }}
      </div>
    </AppCard>

    <AppCard
      class="p-4 border border-gray-800 border-r-4 border-r-cyan-500 bg-surface-section/60 rounded-none"
    >
      <div class="text-[10px] text-cyan-300/60 font-bold uppercase mb-1">صافي رصيد كشف الحساب</div>
      <div class="text-xl font-black text-cyan-300 font-mono">
        {{ formatCurrency(summary.closing_balance) }}
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  summary: {
    type: Object,
    required: true,
    default: () => ({
      opening_balance: 0,
      total_period_debit: 0,
      total_period_credit: 0,
      closing_balance: 0,
    }),
  },
})
</script>
