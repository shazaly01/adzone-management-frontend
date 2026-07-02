<!-- src/views/dashboard/components/MaterialConsumptionTable.vue -->
<template>
  <div
    class="bg-surface-section border border-surface-border/60 rounded-xl p-5 shadow-sm relative overflow-hidden"
  >
    <!-- عنوان الجدول والمؤشر البصري المتوهج لخامات الورشة -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/40">
      <div class="flex items-center gap-2.5">
        <span
          class="w-2 h-5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.4)]"
        ></span>
        <h3 class="text-base font-bold text-text-primary">تقرير استهلاك خامات ومواد الطباعة</h3>
      </div>
      <span
        class="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20"
      >
        {{ items.length }} خامة مستخدمة
      </span>
    </div>

    <!-- جدول العرض الانسيابي لكافة الخامات المستهلكة -->
    <div class="overflow-x-auto">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="border-b border-surface-border/40 text-xs font-bold text-text-muted">
            <th class="pb-3 pr-2 font-black">اسم المادة الخام / الصنف</th>
            <th class="pb-3 pl-2 text-left font-black">معدل الاستهلاك الكلي (م²)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/30">
          <tr
            v-for="item in items"
            :key="item.item_id"
            class="text-sm hover:bg-surface-ground/30 transition-colors group"
          >
            <!-- اسم الخامة اللوجستية -->
            <td
              class="py-3.5 pr-2 font-medium text-text-primary group-hover:text-primary transition-colors"
            >
              {{ item.item_name }}
            </td>
            <!-- صافي الأمتار المربعة المستهلكة من الفواتير الفعلية -->
            <td class="py-3.5 pl-2 text-left font-mono font-bold text-emerald-400">
              {{ formatMeters(item.consumed_meters) }} م²
            </td>
          </tr>

          <!-- واجهة الحاوية الفارغة في حال عدم وجود حركات -->
          <tr v-if="items.length === 0">
            <td colspan="2" class="text-center py-10 text-sm text-text-muted">
              لا توجد خامات مستهلكة مسجلة في النظام خلال النطاق الزمني المحدد.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// استقبال مصفوفة الخامات كاملة من الشاشة الأم بدون قيود سقف عددي
defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

/**
 * تنسيق أرقام مساحات الأمتار المربعة بشكل معزز محاسبياً
 */
const formatMeters = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
