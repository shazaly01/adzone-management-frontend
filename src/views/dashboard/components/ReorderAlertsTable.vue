<template>
  <AppCard class="flex flex-col h-full">
    <!-- رأس الكرت: العنوان وشارات التنبيه الضوئية للمخازن -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <!-- أيقونة تنبيهية تعبر عن النواقص وضرورة إعادة الطلب والتوريد الخارجي -->
        <div
          class="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/5 animate-pulse"
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-black text-text-primary tracking-tight">رادار نواقص الخامات</h3>
          <p class="text-xs text-text-muted mt-0.5">الأصناف التي بلغت أو تجاوزت حد الطلب الآمن</p>
        </div>
      </div>

      <!-- شارة رقمية ذكية توضح حجم العجز الحالي بالمخازن -->
      <div
        class="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20"
      >
        {{ items?.length || 0 }} أصناف حرجة
      </div>
    </div>

    <!-- حاوية الجدول اللوجستي: متجاوبة مع الجوال عبر التمرير الأفقي المخفي وعزل البيانات -->
    <div
      class="flex-1 overflow-x-auto rounded-xl border border-surface-border/60 bg-surface-section/30 mb-2 scrollbar-thin scrollbar-thumb-surface-border scrollbar-track-transparent"
    >
      <table class="w-full text-right whitespace-nowrap">
        <thead class="bg-surface-section/50 text-xs text-text-muted sticky top-0 z-10">
          <tr>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border/50">الخامة / الصنف</th>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border/50">المخزن المعني</th>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border/50 text-center">
              الرصيد الحالي
            </th>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border/50 text-center">
              حد الطلب
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/40 text-sm">
          <!-- حالة الأمان الكامل (Empty State): تظهر فقط عندما تكون كافة الخامات في النطاق الآمن -->
          <tr v-if="!items || items.length === 0">
            <td colspan="4" class="px-4 py-12 text-center text-text-muted">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-lg shadow-emerald-500/5"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-emerald-400/90"
                  >المخزون آمن ومستقر تماماً</span
                >
                <span class="text-xs text-text-muted max-w-xs leading-relaxed"
                  >كافة مستويات الخامات والأصناف التشغيلية في المطبعة أعلى من حدود الخطر.</span
                >
              </div>
            </td>
          </tr>

          <!-- تكرار الأصناف التي تعاني من نقص بياني بالمخازن مرسمة تنازلياً حسب الخطورة -->
          <tr
            v-for="stock in items"
            :key="stock.item_id"
            class="hover:bg-surface-section/40 transition-colors duration-200 group text-text-secondary"
          >
            <!-- اسم الخامة المتأثرة -->
            <td class="px-4 py-3.5 text-text-primary font-bold flex items-center gap-2">
              <span
                class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]"
              ></span>
              {{ stock.item_name }}
            </td>

            <!-- المخزن الموجود به العجز -->
            <td class="px-4 py-3.5 text-xs font-semibold text-text-muted">
              {{ stock.store_name }}
            </td>

            <!-- الرصيد الحالي الفعلي متباين بلون تحذيري نيون هادئ -->
            <td class="px-4 py-3.5 text-center font-bold text-orange-400 font-mono">
              {{ formatNumber(stock.current_quantity) }}
            </td>

            <!-- حد الطلب المضبوط محاسبيّاً ولوجستيّاً -->
            <td class="px-4 py-3.5 text-center font-bold text-text-muted font-mono opacity-80">
              {{ formatNumber(stock.reorder_level) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppCard>
</template>

<script setup>
import { defineProps } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

// استقبال مصفوفة الأصناف الحرجة المفلترة هندسياً في الـ Backend
defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

/**
 * تنسيق وعرض كميات الأصناف والموازين الرياضية بالشكل القياسي للمطبعة
 */
const formatNumber = (value) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
