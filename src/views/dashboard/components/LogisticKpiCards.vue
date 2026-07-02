<template>
  <!-- توزيع شبكي غير نمطي ومبهر (5 أعمدة في الشاشات الكبيرة) لإعطاء عمق بصري فخم -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- 1. كرت صافي الإيرادات المالية - تصميم طولي فخم وعميق -->
    <AppCard
      class="lg:col-span-5 group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1.5 border border-emerald-500/20 bg-gradient-to-br from-surface-card via-surface-card to-emerald-950/10 shadow-[0_20px_50px_rgba(16,185,129,0.05)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]"
    >
      <!-- تأثير النيون المتوهج المخصص في الخلفية -->
      <div
        class="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 duration-700"
      ></div>
      <div
        class="absolute -right-10 -bottom-10 w-36 h-36 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl"
      ></div>

      <div class="flex flex-col h-full justify-between relative z-10 min-h-[160px]">
        <div class="flex items-center justify-between">
          <div class="space-y-1.5">
            <span
              class="text-xs font-black text-emerald-400/80 uppercase tracking-widest block bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-md w-max"
            >
              التقرير المالي الحي
            </span>
            <h4 class="text-sm font-bold text-text-muted/90 pt-1">صافي إيرادات الفترة الحالية</h4>
          </div>

          <div
            class="p-3.5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 text-emerald-400 rounded-2xl border border-emerald-500/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div class="mt-6 space-y-2">
          <div
            class="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight font-mono drop-shadow-[0_2px_10px_rgba(52,211,153,0.2)]"
          >
            {{ formatCurrency(stats.net_sales_amount) }}
          </div>
          <p class="text-[11px] text-text-muted/60 font-medium flex items-center gap-1.5 pt-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            محتسب تلقائياً بعد استبعاد كافة مرتجعات المبيعات
          </p>
        </div>
      </div>
    </AppCard>

    <!-- 2. كرت مراقبة وجدولة حالات خط إنتاج الورشة - لوحة عريضة ومفصلة -->
    <AppCard
      class="lg:col-span-7 group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1.5 border border-amber-500/20 bg-gradient-to-br from-surface-card via-surface-card to-amber-950/10 shadow-[0_20px_50px_rgba(245,158,11,0.03)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)]"
    >
      <!-- تأثير نيون خلفي بلون أمبر زاهي -->
      <div
        class="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/15 duration-700"
      ></div>

      <div class="flex flex-col h-full justify-between gap-6 relative z-10">
        <div class="flex items-start justify-between">
          <div class="space-y-1.5">
            <span
              class="text-xs font-black text-amber-400/80 uppercase tracking-widest block bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-md w-max"
            >
              مراقبة الورشة والتشغيل
            </span>
            <div class="flex items-baseline gap-2 pt-1">
              <span
                class="text-3xl font-black text-amber-400 tracking-tight font-mono drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]"
              >
                {{
                  stats.operational_volume.production_statuses.processing +
                  stats.operational_volume.production_statuses.pending
                }}
              </span>
              <span class="text-xs text-text-muted/80 font-bold"
                >أمر تشغيل قيد المعالجة النشطة</span
              >
            </div>
          </div>

          <div
            class="p-3.5 bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-amber-400 rounded-2xl border border-amber-500/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              ></path>
            </svg>
          </div>
        </div>

        <!-- تفكيك مجهري مبتكر بهيكل عريض ومستقر وثابت بصرياً -->
        <div
          class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-border/40 text-center font-black"
        >
          <div
            class="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 transition-all duration-300 text-blue-400 shadow-inner"
          >
            <div class="font-mono text-xl">
              {{ stats.operational_volume.production_statuses.pending }}
            </div>
            <div class="text-text-muted/60 font-bold text-[10px] uppercase tracking-wider mt-1">
              في الانتظار
            </div>
          </div>

          <div
            class="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 transition-all duration-300 text-amber-400 shadow-inner"
          >
            <div class="font-mono text-xl">
              {{ stats.operational_volume.production_statuses.processing }}
            </div>
            <div class="text-text-muted/60 font-bold text-[10px] uppercase tracking-wider mt-1">
              قيد التنفيذ
            </div>
          </div>

          <div
            class="bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 transition-all duration-300 text-rose-400 shadow-inner"
          >
            <div class="font-mono text-xl">
              {{ stats.operational_volume.production_statuses.on_hold }}
            </div>
            <div class="text-text-muted/60 font-bold text-[10px] uppercase tracking-wider mt-1">
              معلق مؤقتاً
            </div>
          </div>

          <div
            class="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 transition-all duration-300 text-emerald-400 shadow-inner"
          >
            <div class="font-mono text-xl">
              {{ stats.operational_volume.production_statuses.completed }}
            </div>
            <div class="text-text-muted/60 font-bold text-[10px] uppercase tracking-wider mt-1">
              جاهز للتسليم
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
