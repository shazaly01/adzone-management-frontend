<!-- src/views/dashboard/DashboardView.vue -->
<template>
  <div
    class="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-text-primary relative overflow-hidden min-h-screen selection:bg-primary/30"
  >
    <!-- هالات توهج خلفية فخمة ومصقولة لتعزيز جمالية الواجهة الداكنة -->
    <div
      class="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"
    ></div>
    <div
      class="absolute top-1/3 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"
    ></div>

    <!-- شريط القيادة العلوي: العنوان وفلاتر التحكم اللحظية -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6 relative z-10"
    >
      <div>
        <h1
          class="text-2xl md:text-3xl font-black text-text-primary tracking-tight flex items-center gap-3"
        >
          <span
            class="w-2.5 h-7 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.6)]"
          ></span>
          لوحة الإشراف والمؤشرات الإدارية
        </h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة حية ودقيقة للأداء اللوجستي، خامات الطباعة، التدفقات الماليّة، وذمم المصممين
          المستحقة.
        </p>
      </div>

      <!-- مكون شريط التصفية الزمني الفرعي -->
      <DashboardFilters :loading="loading" @filter="handleFilterChange" />
    </div>

    <!-- حالة التحميل الفخمة (Premium Dark Skeleton Loader Grid) لحماية تجربة المستخدم -->
    <div v-if="loading" class="space-y-6 animate-pulse relative z-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="h-32 bg-surface-section rounded-xl border border-surface-border/60"
        ></div>
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div
          class="xl:col-span-7 h-[500px] bg-surface-section rounded-xl border border-surface-border/60"
        ></div>
        <div
          class="xl:col-span-5 h-[500px] bg-surface-section rounded-xl border border-surface-border/60"
        ></div>
      </div>
    </div>

    <!-- الفضاء التشغيلي الفعلي: يعرض فور اكتمال جلب البيانات ويشترط صلاحية المدير -->
    <div v-else-if="authStore.can('dashboard.manager')" class="space-y-6 relative z-10">
      <!-- أولاً: كروت المؤشرات اللوجستية والمالية الكبرى (KPIs) -->
      <LogisticKpiCards :stats="stats" />

      <!-- ثانياً: التوزيع الهيكلي الذكي وغير النمطي للجداول والتقارير التفصيلية -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <!-- الجناح الأيمن (العريض): المصروفات التشغيلية ومديونيات العملاء اللحظية -->
        <div class="xl:col-span-7 space-y-6 flex flex-col">
          <!-- جدول كشف المصروفات المفصل للشهر الحالي أو النطاق المختار -->
          <ExpensesSummaryTable :expenses="stats.expenses_summary" />

          <!-- جدول مديونيات العملاء الفعليين المحدث كاشيرياً بلحظته -->
          <CustomerDebtsTable :customers="stats.customers_summary" />
        </div>

        <!-- الجناح الأيسر: ذمم المصممين، مراقبة النواقص، وتقرير استهلاك الخامات الشامل -->
        <div class="xl:col-span-5 space-y-6 flex flex-col">
          <!-- جدول كشف عمولات ومستحقات المصممين الصافية -->
          <DesignerLedgerTable :designers="stats.designers_summary" />

          <!-- جدول رادار تنبيهات الخامات والأصناف التي بلغت حد الطلب بأمان -->
          <ReorderAlertsTable :items="stats.reorder_level_items" />

          <!-- جدول تقرير معدلات استهلاك خامات ومواد الطباعة الكلي المحدث -->
          <MaterialConsumptionTable :items="stats.top_items_by_meters" />
        </div>
      </div>
    </div>

    <!-- واجهة حجب وحماية فخمة ومصقولة تظهر للمستخدم العادي بدلاً من الأرقام الحساسة -->
    <div
      v-else
      class="text-center py-24 relative z-10 border border-surface-border/40 rounded-2xl bg-surface-section/30 backdrop-blur-md"
    >
      <div class="max-w-md mx-auto space-y-3 p-6">
        <h2 class="text-xl font-bold text-text-primary">مرحباً بك في النظام</h2>
        <p class="text-sm text-text-muted leading-relaxed">
          تمت المصادقة على دخولك بنجاح. لوحة المؤشرات الإحصائية والمالية الشاملة مخصصة حصراً للإدارة
          العليا والمدير العام.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dashboardService from '@/services/dashboardService'
import { useAuthStore } from '@/stores/authStore'

// استيراد مكونات الشاشة الفرعية المفككة لضمان النظافة المعمارية وسهولة الصيانة
import DashboardFilters from './components/DashboardFilters.vue'
import LogisticKpiCards from './components/LogisticKpiCards.vue'
import ReorderAlertsTable from './components/ReorderAlertsTable.vue'
import ExpensesSummaryTable from './components/ExpensesSummaryTable.vue'
import CustomerDebtsTable from './components/CustomerDebtsTable.vue'
import DesignerLedgerTable from './components/DesignerLedgerTable.vue'
import MaterialConsumptionTable from './components/MaterialConsumptionTable.vue'

// تهيئة متجر المصادقة لإدارة الصلاحيات محلياً
const authStore = useAuthStore()

// إدارة الحالة والتحميل للتقرير المالي واللوجستي اللحظي
const loading = ref(true)
const currentFilters = ref({
  from_date: '',
  to_date: '',
})

// الهيكل البياني الافتراضي المتوافق والمطابق تماماً لمخرجات الـ Backend المحصنة
const stats = ref({
  date_range: { from: '', to: '' },
  net_square_meters: 0,
  net_sales_amount: 0,
  top_items_by_meters: [],
  reorder_level_items: [],
  operational_volume: {
    total_sales_invoices: 0,
    total_return_invoices: 0,
    production_statuses: { pending: 0, processing: 0, on_hold: 0, completed: 0 },
  },
  expenses_summary: { list: [], grand_total: 0 },
  customers_summary: { list: [], grand_total: 0 },
  designers_summary: { list: [], grand_total: 0 },
})

/**
 * المحرك المركزي الذكي لجلب مؤشرات لوحة التحكم الموحدة من الـ API
 */
const fetchDashboardData = async (filters = {}) => {
  loading.value = true
  try {
    const response = await dashboardService.getStats(filters)
    if (response && response.data) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('خطأ حرجي أثناء جلب مؤشرات الإشراف المركزي للوحة التحكم:', error)
  } finally {
    loading.value = false
  }
}

/**
 * استقبال الأحداث الزمنية فور تعديل الفلتر من المكون الفرعي وإعادة البناء لحظياً
 */
const handleFilterChange = (newFilters) => {
  currentFilters.value = { ...newFilters }
  fetchDashboardData(currentFilters.value)
}

// التحفيز اللحظي والأوتوماتيكي عند فتح الشاشة مباشرة بناءً على جودة الصلاحية
onMounted(() => {
  if (authStore.can('dashboard.manager')) {
    fetchDashboardData()
  } else {
    loading.value = false
  }
})
</script>
