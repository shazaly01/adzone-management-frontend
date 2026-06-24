<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <template v-if="isLoading">
      <SkeletonCard v-for="i in 4" :key="`skeleton-${i}`" />
    </template>

    <template v-else-if="stats">
      <StatCard
        title="إجمالي الشركات"
        :value="stats.companies_count || 0"
        :icon="BuildingOffice2Icon"
        icon-bg-color="bg-sky-500/20"
        icon-color="text-sky-400"
      />
      <StatCard
        title="إجمالي المشاريع"
        :value="stats.projects_count || 0"
        :icon="ClipboardDocumentListIcon"
        icon-bg-color="bg-amber-500/20"
        icon-color="text-amber-400"
      />
      <StatCard
        title="قيمة العقود الإجمالية"
        :value="formatCurrency(stats.total_due_value || 0)"
        :icon="BanknotesIcon"
        icon-bg-color="bg-green-500/20"
        icon-color="text-green-400"
      />
      <StatCard
        title="إجمالي المدفوعات"
        :value="formatCurrency(stats.total_payments_value || 0)"
        :icon="ReceiptPercentIcon"
        icon-bg-color="bg-indigo-500/20"
        icon-color="text-indigo-400"
      />
    </template>
  </div>
</template>

<script setup>
import StatCard from '@/components/ui/StatCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  stats: {
    type: Object,
    default: () => ({}), // جعل القيمة الافتراضية كائن فارغ لتجنب الأخطاء
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
})

function formatCurrency(value) {
  // إرجاع 0 د.ل بدلاً من N/A ليكون الشكل متناسقاً عند تمرير بيانات فارغة
  if (value === null || value === undefined) return '0 د.ل'

  const numberPart = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

  return `${numberPart} د.ل`
}
</script>
