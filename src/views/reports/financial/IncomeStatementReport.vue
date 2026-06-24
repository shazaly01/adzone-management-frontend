<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">قائمة الدخل الشاملة</h1>
        <p class="text-sm text-gray-400 mt-1">
          تحليل النشاط المالي وقياس كفاءة الأداء التشغيلي والأرباح والخسائر للشركة
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!incomeStatementSummary"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة قائمة الدخل
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">من تاريخ</label>
          <input
            type="date"
            v-model="filters.from_date"
            class="w-full bg-surface-background border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
            style="color-scheme: dark"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">إلى تاريخ</label>
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
            تحليل وقراءة المورد المالي
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div v-if="incomeStatementSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard class="p-5 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-lg">
        <div class="text-xs text-emerald-300/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي الإيرادات والمبيعات (+)
        </div>
        <div class="text-2xl font-black text-emerald-400 font-mono">
          {{ formatCurrency(incomeStatementSummary.total_revenues) }}
        </div>
      </AppCard>

      <AppCard class="p-5 border-r-4 border-r-rose-500 bg-surface-section/60 shadow-lg">
        <div class="text-xs text-rose-300/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي المصروفات والتكاليف (-)
        </div>
        <div class="text-2xl font-black text-rose-400 font-mono">
          {{ formatCurrency(incomeStatementSummary.total_expenses) }}
        </div>
      </AppCard>

      <AppCard
        class="p-5 border-r-4 transition-all duration-300 bg-surface-section/60"
        :class="
          incomeStatementSummary.outcome_type === 'profit'
            ? 'border-r-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
            : 'border-r-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
        "
      >
        <div
          class="text-xs uppercase tracking-widest mb-2 font-bold"
          :class="
            incomeStatementSummary.outcome_type === 'profit'
              ? 'text-emerald-300/60'
              : 'text-rose-300/60'
          "
        >
          {{ incomeStatementSummary.outcome_lbl }}
        </div>
        <div
          class="text-2xl font-black font-mono"
          :class="
            incomeStatementSummary.outcome_type === 'profit'
              ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]'
              : 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.6)]'
          "
        >
          {{ formatCurrency(incomeStatementSummary.net_profit) }}
        </div>
      </AppCard>
    </div>

    <div v-if="incomeStatementData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm p-4">
        <h3 class="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          بـنـود الإيــرادات (الحسابات الدائنة)
        </h3>
        <AppTable
          :headers="tableHeaders"
          :items="incomeStatementData.revenues"
          :is-loading="loading"
        >
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-gray-500">{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-medium text-gray-200 text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-emerald-400">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>
      </AppCard>

      <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm p-4">
        <h3 class="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          بـنـود الـمـصـروفـات (الحسابات المدينة)
        </h3>
        <AppTable
          :headers="tableHeaders"
          :items="incomeStatementData.expenses"
          :is-loading="loading"
        >
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-gray-500">{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-medium text-gray-200 text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-rose-400">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>
      </AppCard>
    </div>
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

const { incomeStatementData, incomeStatementSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'code', label: 'كود الحساب' },
  { key: 'name', label: 'اسم البند المالي' },
  { key: 'balance', label: 'صافي رصيد البند' },
]

const handleFetch = () => {
  // تنظيف وتجهيز الفلاتر قبل التمرير للباك إند لمنع المشاكل البرمجية
  const cleanFilters = {}
  if (filters.value.from_date) cleanFilters.from_date = filters.value.from_date
  if (filters.value.to_date) cleanFilters.to_date = filters.value.to_date

  reportStore.fetchIncomeStatement(cleanFilters)
}

const handlePrint = () => {
  if (!incomeStatementSummary.value) return

  const printItems = []

  if (incomeStatementData.value?.revenues) {
    incomeStatementData.value.revenues.forEach((rev) => {
      printItems.push({
        id: rev.code,
        name: rev.name,
        license_number: 'إيرادات مبيعات',
        projects_count: 'دائن',
        total_contract_value: rev.balance,
        total_due_value: 0,
        total_paid: rev.balance,
        total_remaining: 0,
      })
    })
  }

  if (incomeStatementData.value?.expenses) {
    incomeStatementData.value.expenses.forEach((exp) => {
      printItems.push({
        id: exp.code,
        name: exp.name,
        license_number: 'مصروفات تشغيلية',
        projects_count: 'مدين',
        total_contract_value: 0,
        total_due_value: exp.balance,
        total_paid: 0,
        total_remaining: exp.balance,
      })
    })
  }

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: incomeStatementSummary.value.total_revenues,
        grand_total_due_value: incomeStatementSummary.value.total_expenses,
        grand_total_paid: incomeStatementSummary.value.net_profit,
        grand_total_remaining: 0,
        total_companies: printItems.length,
        total_projects: 0,
        title_override: `تقرير قائمة الدخل الشاملة من تاريخ (${incomeStatementSummary.value.from_date}) إلى (${incomeStatementSummary.value.to_date})`,
      },
      companiesSummary: printItems,
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
  @apply py-3 border-b border-gray-800/40;
}
</style>
