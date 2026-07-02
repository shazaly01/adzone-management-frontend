<template>
  <AppCard class="flex flex-col h-full">
    <!-- رأس الكرت: العنوان وشارات الإحصاء الرقمية -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <!-- أيقونة برمجية تعبر عن المصممين والعمل الإبداعي وعمولاتهم المستحقة -->
        <div
          class="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5"
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
              stroke-width="1.5"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-black text-text-primary tracking-tight">مستحقات المصممين</h3>
          <p class="text-xs text-text-muted mt-0.5">العمولات الصافية والذمم التراكمية المستحقة</p>
        </div>
      </div>

      <!-- شارة توضح إجمالي عدد المصممين المقيدين بالنظام -->
      <div
        class="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
      >
        {{ designers.list?.length || 0 }} مصممين
      </div>
    </div>

    <!-- حاوية الجدول: مرنة ومتجاوبة بالكامل مع شاشات اللمس عبر التمرير الأفقي الآمن -->
    <div
      class="flex-1 overflow-x-auto rounded-xl border border-surface-border/60 bg-surface-section/30 mb-5 scrollbar-thin scrollbar-thumb-surface-border scrollbar-track-transparent"
    >
      <table class="w-full text-right whitespace-nowrap">
        <thead class="bg-surface-section/50 text-xs text-text-muted sticky top-0 z-10">
          <tr>
            <th class="px-5 py-3.5 font-bold border-b border-surface-border/50">اسم المصمم</th>
            <th class="px-5 py-3.5 font-bold border-b border-surface-border/50 w-32">
              الرصيد المستحق لهم
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/40 text-sm">
          <!-- حالة عدم وجود حركات أو مصممين (Empty State) -->
          <tr v-if="!designers.list || designers.list.length === 0">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm">لا يوجد مصممون مسجلون أو لم يتم احتساب عمولات بعد.</span>
              </div>
            </td>
          </tr>

          <!-- طباعة أسطر كشف الحساب التراكمي للمصممين المحصن برمجياً -->
          <tr
            v-for="designer in designers.list"
            :key="designer.designer_id"
            class="hover:bg-surface-section/40 transition-colors duration-200 group"
          >
            <td class="px-5 py-3.5 text-text-primary font-medium flex items-center gap-2.5">
              <span
                class="w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-500 duration-200 shadow-[0_0_5px_rgba(99,102,241,0.4)]"
              ></span>
              {{ designer.designer_name }}
            </td>
            <td class="px-5 py-3.5 font-bold text-indigo-400 font-mono tracking-tight">
              {{ formatCurrency(designer.total_due) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- التذييل: الإجمالي الكلي لكافة ذمم المصممين دائنة الطبيعة -->
    <div
      class="mt-auto pt-4 border-t border-surface-border/60 flex items-center justify-between bg-gradient-to-r from-transparent to-indigo-500/5 rounded-lg px-2"
    >
      <span class="text-sm font-bold text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          ></path>
        </svg>
        إجمالي مستحقات المصممين:
      </span>
      <span class="text-xl md:text-2xl font-black text-indigo-400 tracking-tight drop-shadow-md">
        {{ formatCurrency(designers.grand_total) }}
      </span>
    </div>
  </AppCard>
</template>

<script setup>
import { defineProps } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

// استقبال كائن مستحقات وعمولات المصممين من الشاشة الأم الموحدة
defineProps({
  designers: {
    type: Object,
    required: true,
    default: () => ({ list: [], grand_total: 0 }),
  },
})

/**
 * تنسيق وعرض المبالغ الماليّة بالفواصل والكسور المحاسبية المعتمدة
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
