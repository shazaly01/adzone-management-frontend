<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">
          الميزانية العمومية / المركز المالي
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          عرض الموقف المالي للمنشأة وتقييم الأصول مقابل الخصوم وحقوق الملكية
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!balanceSheetSummary"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة المركز المالي
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">
            الميزانية موقوفة حتى تاريخ
          </label>
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
            توليد الميزانية العمومية
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div v-if="balanceSheetSummary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard class="p-4 border-r-4 border-r-cyan-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-cyan-300/60 font-bold uppercase mb-1">
          إجمالي الأصول والجرود (+)
        </div>
        <div class="text-xl font-black text-cyan-400 font-mono">
          {{ formatCurrency(balanceSheetSummary.total_assets) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-indigo-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-indigo-300/60 font-bold uppercase mb-1">
          أرباح النشاط للفترة الحالية
        </div>
        <div class="text-xl font-black text-indigo-400 font-mono">
          {{ formatCurrency(balanceSheetSummary.current_period_net_profit) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-fuchsia-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-fuchsia-300/60 font-bold uppercase mb-1">
          إجمالي الخصوم وحقوق الملكية
        </div>
        <div class="text-xl font-black text-fuchsia-400 font-mono">
          {{ formatCurrency(balanceSheetSummary.total_liabilities_and_equity) }}
        </div>
      </AppCard>

      <AppCard
        class="p-4 border-r-4 bg-surface-section/60 transition-all duration-300 shadow-lg"
        :class="
          balanceSheetSummary.is_perfectly_balanced
            ? 'border-r-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
            : 'border-r-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
        "
      >
        <div
          class="text-[10px] font-bold uppercase mb-1"
          :class="
            balanceSheetSummary.is_perfectly_balanced ? 'text-emerald-300/60' : 'text-rose-300/60'
          "
        >
          حالة توازن المركز المالي
        </div>
        <div
          class="text-lg font-black"
          :class="
            balanceSheetSummary.is_perfectly_balanced
              ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]'
              : 'text-rose-400 drop-shadow-[0_0_4px_rgba(251,113,133,0.5)]'
          "
        >
          {{ balanceSheetSummary.is_perfectly_balanced ? 'ميزانية متزنة ✓' : 'يوجد فارق غير متزن' }}
        </div>
      </AppCard>
    </div>

    <div v-if="balanceSheetData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm p-4">
        <div class="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
          <h3 class="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            الأصــــول / الـمـوجــودات (1)
          </h3>
          <span class="text-xs font-mono font-bold text-gray-400" v-if="balanceSheetSummary">
            الكامل: {{ formatCurrency(balanceSheetSummary.total_assets) }}
          </span>
        </div>
        <AppTable :headers="tableHeaders" :items="balanceSheetData.assets" :is-loading="loading">
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-gray-500">{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-medium text-gray-200 text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-cyan-300">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>
      </AppCard>

      <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm p-4">
        <div class="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
          <h3 class="text-sm font-bold text-fuchsia-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            الخصوم والالتزامات ورأس المال (2)
          </h3>
          <span class="text-xs font-mono font-bold text-gray-400" v-if="balanceSheetSummary">
            الكامل: {{ formatCurrency(balanceSheetSummary.total_liabilities_and_equity) }}
          </span>
        </div>
        <AppTable
          :headers="tableHeaders"
          :items="balanceSheetData.liabilities_and_equity"
          :is-loading="loading"
        >
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-gray-500">{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-medium text-gray-200 text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-fuchsia-300">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>

        <div
          v-if="balanceSheetSummary"
          class="mt-2 p-2 bg-indigo-950/20 border border-indigo-900/40 rounded flex justify-between items-center text-xs"
        >
          <span class="text-indigo-300 font-bold">
            (+) صافي أرباح النشاط الدورية المحتجزة للخصوم:
          </span>
          <span class="font-mono font-bold text-indigo-400">
            {{ formatCurrency(balanceSheetSummary.current_period_net_profit) }}
          </span>
        </div>
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
  to_date: '',
})

// ربط متجر استدعاء الميزانية العمومية
const { balanceSheetData, balanceSheetSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'code', label: 'كود الحساب' },
  { key: 'name', label: 'بند المركز المالي' },
  { key: 'balance', label: 'صافي الرصيد الدفتري' },
]

const handleFetch = () => {
  reportStore.fetchBalanceSheet(filters.value)
}

const handlePrint = () => {
  if (!balanceSheetSummary.value) return

  const printItems = []

  if (balanceSheetData.value?.assets) {
    balanceSheetData.value.assets.forEach((asset) => {
      printItems.push({
        id: asset.code,
        name: asset.name,
        license_number: 'أصول وموجودات تداولية/ثابتة',
        projects_count: 'جانب (1)',
        total_contract_value: asset.balance,
        total_due_value: 0,
        total_paid: asset.balance,
        total_remaining: 0,
      })
    })
  }

  if (balanceSheetData.value?.liabilities_and_equity) {
    balanceSheetData.value.liabilities_and_equity.forEach((liab) => {
      printItems.push({
        id: liab.code,
        name: liab.name,
        license_number: 'التزامات وحقوق ملكية دائنة',
        projects_count: 'جانب (2)',
        total_contract_value: 0,
        total_due_value: liab.balance,
        total_paid: 0,
        total_remaining: liab.balance,
      })
    })
  }

  // إضافة سطر الأرباح الدورية المحتجزة في كشف الطباعة
  printItems.push({
    id: '3999',
    name: 'صافي أرباح النشاط المالية للفترة الجارية',
    license_number: 'حقوق ملكية محتجزة',
    projects_count: 'جانب (2)',
    total_contract_value: 0,
    total_due_value: balanceSheetSummary.value.current_period_net_profit,
    total_paid: 0,
    total_remaining: balanceSheetSummary.value.current_period_net_profit,
  })

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: balanceSheetSummary.value.total_assets,
        grand_total_due_value: balanceSheetSummary.value.total_liabilities_and_equity,
        grand_total_paid: balanceSheetSummary.value.is_perfectly_balanced ? 1 : 0,
        grand_total_remaining: balanceSheetSummary.value.current_period_net_profit,
        total_companies: printItems.length,
        total_projects: 0,
        title_override: `تقرير الميزانية العمومية والمركز المالي موقوفاً حتى تاريخ: (${balanceSheetSummary.value.as_of_date})`,
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
