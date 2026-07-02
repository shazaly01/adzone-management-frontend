<template>
  <AppCard class="flex flex-col h-full">
    <!-- رأس الكرت: العنوان والمؤشرات العليا للعملاء -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <!-- أيقونة تعبر عن حسابات المقبوضات والديون الخارجية للتحصيل -->
        <div
          class="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-lg shadow-amber-500/5"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-black text-text-primary tracking-tight">مديونيات العملاء</h3>
          <p class="text-xs text-text-muted mt-0.5">الأرصدة اللحظية المستحقة للتحصيل الفوري</p>
        </div>
      </div>

      <!-- شارة توضح عدد العملاء الذين لديهم أرصدة مكشوفة -->
      <div
        class="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
      >
        {{ customers.list?.length || 0 }} عملاء مدينين
      </div>
    </div>

    <!-- حاوية الجدول: متجاوبة مع الجوال عبر التمرير الأفقي المخفي -->
    <div
      class="flex-1 overflow-x-auto rounded-xl border border-surface-border/60 bg-surface-section/30 mb-5 scrollbar-thin scrollbar-thumb-surface-border scrollbar-track-transparent"
    >
      <table class="w-full text-right whitespace-nowrap">
        <thead class="bg-surface-section/50 text-xs text-text-muted sticky top-0 z-10">
          <tr>
            <th class="px-5 py-3.5 font-bold border-b border-surface-border/50">اسم العميل</th>
            <th class="px-5 py-3.5 font-bold border-b border-surface-border/50 w-32">
              المديونية الحالية
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/40 text-sm">
          <!-- حالة عدم وجود بيانات (Empty State) -->
          <tr v-if="!customers.list || customers.list.length === 0">
            <td colspan="2" class="px-5 py-10 text-center text-text-muted">
              <div class="flex flex-col items-center gap-3">
                <div class="p-3 rounded-full bg-surface-section/50">
                  <svg
                    class="w-6 h-6 opacity-40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm"
                  >لا توجد مديونيات مستحقة على العملاء حالياً، الحسابات مقفلة.</span
                >
              </div>
            </td>
          </tr>

          <!-- تكرار حركات العملاء مرتبة تنازلياً من الأعلى مديونية -->
          <tr
            v-for="customer in customers.list"
            :key="customer.customer_id"
            class="hover:bg-surface-section/40 transition-colors duration-200 group"
          >
            <td class="px-5 py-3.5 text-text-primary font-medium flex items-center gap-2.5">
              <span
                class="w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 duration-200 shadow-[0_0_5px_rgba(245,158,11,0.4)]"
              ></span>
              {{ customer.customer_name }}
            </td>
            <td class="px-5 py-3.5 font-bold text-amber-400 font-mono tracking-tight">
              {{ formatCurrency(customer.current_balance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- التذييل: إجمالي مديونيات كل العملاء في نهاية الجدول -->
    <div
      class="mt-auto pt-4 border-t border-surface-border/60 flex items-center justify-between bg-gradient-to-r from-transparent to-amber-500/5 rounded-lg px-2"
    >
      <span class="text-sm font-bold text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          ></path>
        </svg>
        إجمالي مستحقات العملاء:
      </span>
      <span class="text-xl md:text-2xl font-black text-amber-500 tracking-tight drop-shadow-md">
        {{ formatCurrency(customers.grand_total) }}
      </span>
    </div>
  </AppCard>
</template>

<script setup>
import { defineProps } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

// استقبال كائن مديونيات العملاء المفصلة
defineProps({
  customers: {
    type: Object,
    required: true,
    default: () => ({ list: [], grand_total: 0 }),
  },
})

/**
 * تنسيق المبالغ المالية بالفواصل العشرية الثابتة للمنظومة المحاسبية
 */
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
