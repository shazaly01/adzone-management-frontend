<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">ميزان المراجعة الشامل</h1>
        <p class="text-sm text-gray-400 mt-1">
          تجميع الحركات والأرصدة الافتتاحية والختامية لكافة مستويات دليل الحسابات
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!trialBalanceSummary || trialBalanceList.length === 0"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة الميزان الدفتري
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
            >من تاريخ الحركة</label
          >
          <input
            type="date"
            v-model="filters.from_date"
            class="w-full bg-surface-background border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
            style="color-scheme: dark"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
            >إلى تاريخ الحركة</label
          >
          <input
            type="date"
            v-model="filters.to_date"
            class="w-full bg-surface-background border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
            style="color-scheme: dark"
          />
        </div>

        <div>
          <AppButton
            @click="handleFetch"
            :loading="loading"
            class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            <ArrowPathIcon class="w-5 h-5 ml-2" :class="{ 'animate-spin': loading }" />
            توليد ومطابقة الميزان
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div v-if="trialBalanceSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard class="p-5 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-lg">
        <div class="text-xs text-emerald-300/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي الحركات المدینة
        </div>
        <div class="text-2xl font-black text-emerald-400 font-mono">
          {{ formatCurrency(trialBalanceSummary.total_period_debit) }}
        </div>
      </AppCard>

      <AppCard class="p-5 border-r-4 border-r-rose-500 bg-surface-section/60 shadow-lg">
        <div class="text-xs text-rose-300/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي الحركات الدائنة
        </div>
        <div class="text-2xl font-black text-rose-400 font-mono">
          {{ formatCurrency(trialBalanceSummary.total_period_credit) }}
        </div>
      </AppCard>

      <AppCard
        class="p-5 border-r-4 bg-surface-section/60 transition-all duration-300"
        :class="
          trialBalanceSummary.is_balanced
            ? 'border-r-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
            : 'border-r-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        "
      >
        <div
          class="text-xs uppercase tracking-widest mb-2 font-bold"
          :class="trialBalanceSummary.is_balanced ? 'text-emerald-300/60' : 'text-rose-300/60'"
        >
          حالة اتزان الدفتري العام
        </div>
        <div
          class="text-2xl font-black"
          :class="
            trialBalanceSummary.is_balanced
              ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]'
              : 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.6)]'
          "
        >
          {{ trialBalanceSummary.is_balanced ? 'متزن تماماً' : 'غير متزن دفترياً' }}
        </div>
      </AppCard>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
      <AppTable :headers="tableHeaders" :items="trialBalanceList" :is-loading="loading">
        <template #cell-code="{ item }">
          <span
            class="font-mono text-xs"
            :class="item.is_parent ? 'text-indigo-300 font-black tracking-wider' : 'text-gray-400'"
          >
            {{ item.code }}
          </span>
        </template>

        <template #cell-name="{ item }">
          <span
            :class="
              item.is_parent
                ? 'text-white font-extrabold pr-0 text-sm'
                : 'text-cyan-300/80 font-medium pr-4 text-xs border-r border-gray-800'
            "
          >
            {{ item.name }}
          </span>
        </template>

        <template #cell-nature="{ item }">
          <span
            class="text-xs font-semibold"
            :class="item.nature === 'مدين' ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ item.nature }}
          </span>
        </template>

        <template #cell-opening_balance="{ item }">
          <span
            class="font-mono text-xs font-bold"
            :class="[
              item.is_parent ? 'text-gray-300' : 'text-gray-400',
              item.opening_balance < 0 ? 'text-amber-400' : '',
            ]"
          >
            {{ formatCurrency(item.opening_balance) }}
          </span>
        </template>

        <template #cell-period_debit="{ item }">
          <span
            class="font-mono text-xs font-bold"
            :class="item.is_parent ? 'text-emerald-300 font-extrabold' : 'text-emerald-400/80'"
          >
            {{ item.period_debit > 0 ? formatCurrency(item.period_debit) : '-' }}
          </span>
        </template>

        <template #cell-period_credit="{ item }">
          <span
            class="font-mono text-xs font-bold"
            :class="item.is_parent ? 'text-rose-300 font-extrabold' : 'text-rose-400/80'"
          >
            {{ item.period_credit > 0 ? formatCurrency(item.period_credit) : '-' }}
          </span>
        </template>

        <template #cell-closing_balance="{ item }">
          <span
            class="font-mono text-xs font-black rounded px-1.5 py-0.5"
            :class="
              item.is_parent
                ? 'text-white bg-surface-background/60 border border-gray-800'
                : 'text-cyan-300 bg-cyan-950/20'
            "
          >
            {{ formatCurrency(item.closing_balance) }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  from_date: '',
  to_date: '',
})

const { trialBalanceList, trialBalanceSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'code', label: 'كود الحساب دليلي' },
  { key: 'name', label: 'الحساب المالي والبيان الدفتري' },
  { key: 'nature', label: 'طبيعة الحساب' },
  { key: 'opening_balance', label: 'الرصيد الافتتاحي' },
  { key: 'period_debit', label: 'حركة مدين فترة' },
  { key: 'period_credit', label: 'حركة دائن فترة' },
  { key: 'closing_balance', label: 'الرصيد الختامي الصافي' },
]

const handleFetch = () => {
  // تنظيف وتأمين كائن الفلاتر لتفادي إرسال نصوص فارغة تسبب مشاكل بالباك إند
  const cleanFilters = {}
  if (filters.value.from_date) cleanFilters.from_date = filters.value.from_date
  if (filters.value.to_date) cleanFilters.to_date = filters.value.to_date

  reportStore.fetchTrialBalance(cleanFilters)
}

const handlePrint = () => {
  if (!trialBalanceSummary.value || trialBalanceList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: trialBalanceSummary.value.total_period_debit,
        grand_total_due_value: trialBalanceSummary.value.total_period_credit,
        grand_total_paid: trialBalanceSummary.value.is_balanced ? 1 : 0,
        grand_total_remaining: 0,
        total_companies: trialBalanceList.value.filter((a) => !a.is_parent).length,
        total_projects: trialBalanceList.value.filter((a) => a.is_parent).length,
        title_override: 'تقرير ميزان المراجعة المحاسبي العام للأرصدة والحركات',
      },
      companiesSummary: trialBalanceList.value.map((acc) => ({
        id: acc.id,
        name: acc.is_parent ? `[رئيسي] ${acc.name}` : `    ${acc.name}`,
        license_number: acc.code,
        projects_count: acc.nature,
        total_contract_value: acc.opening_balance,
        total_due_value: acc.period_debit,
        total_paid: acc.period_credit,
        total_remaining: acc.closing_balance,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  handleFetch()
})
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}

:deep(.AppTable td) {
  @apply py-3.5 border-b border-gray-800/40;
}
</style>
