<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">كشف الحساب التفصيلي</h1>
        <p class="text-sm text-gray-400 mt-1">
          عرض حركة الحسابات التفصيلية مع احتساب الأرصدة المتوالية والافتتاحية
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!accountLedgerSummary || accountLedgerList.length === 0"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة كشف الحساب
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
            >الحساب المالي (إجباري)</label
          >
          <AppDropdown
            id="filter-account-id"
            v-model="filters.account_id"
            :options="accountsList"
            option-label="name"
            option-value="id"
            placeholder="اختر الحساب المحاسبي..."
          />
        </div>

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
          <div class="flex gap-2">
            <input
              type="date"
              v-model="filters.to_date"
              class="w-full bg-surface-background border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
              style="color-scheme: dark"
            />
            <AppButton
              @click="handleFetch"
              :loading="loading"
              :disabled="!filters.account_id"
              class="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-40"
            >
              <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
            </AppButton>
          </div>
        </div>
      </div>
    </AppCard>

    <div v-if="accountLedgerSummary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard class="p-4 border-r-4 border-r-gray-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-gray-400 font-bold uppercase mb-1">
          الرصيد الافتتاحي الساكن
        </div>
        <div class="text-xl font-black text-gray-300 font-mono">
          {{ formatCurrency(accountLedgerSummary.opening_balance) }}
          <span class="text-xs font-normal text-gray-500">
            ({{ accountLedgerSummary.nature_lbl }})
          </span>
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-emerald-300/60 font-bold uppercase mb-1">
          إجمالي مدين للفترة (+)
        </div>
        <div class="text-xl font-black text-emerald-400 font-mono">
          {{ formatCurrency(accountLedgerSummary.total_period_debit) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-rose-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-rose-300/60 font-bold uppercase mb-1">
          إجمالي دائن للفترة (-)
        </div>
        <div class="text-xl font-black text-rose-400 font-mono">
          {{ formatCurrency(accountLedgerSummary.total_period_credit) }}
        </div>
      </AppCard>

      <AppCard
        class="p-4 border-r-4 bg-surface-section/60 shadow-lg"
        :class="
          accountLedgerSummary.closing_balance >= 0 ? 'border-r-cyan-400' : 'border-r-amber-500'
        "
      >
        <div class="text-[10px] font-bold uppercase mb-1 text-gray-400">الرصيد الختامي الجاري</div>
        <div
          class="text-xl font-black font-mono"
          :class="
            accountLedgerSummary.closing_balance >= 0
              ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]'
              : 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]'
          "
        >
          {{ formatCurrency(accountLedgerSummary.closing_balance) }}
        </div>
      </AppCard>
    </div>

    <AppCard
      v-if="accountLedgerList.length > 0 || loading"
      class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm"
    >
      <AppTable :headers="tableHeaders" :items="accountLedgerList" :is-loading="loading">
        <template #cell-entry_date="{ item }">
          <span class="text-xs text-gray-400 font-mono">{{ item.entry_date ?? '-' }}</span>
        </template>

        <template #cell-entry_number="{ item }">
          <span class="font-mono text-cyan-400 text-xs font-bold">
            {{ item.entry_number ?? '-' }}
          </span>
        </template>

        <template #cell-line_notes="{ item }">
          <span class="text-xs text-gray-300 font-medium">{{ item.line_notes ?? '-' }}</span>
        </template>

        <template #cell-debit="{ item }">
          <span class="font-mono text-xs font-bold text-emerald-400" v-if="item.debit > 0">
            {{ formatCurrency(item.debit) }}
          </span>
          <span v-else class="text-gray-700 text-xs">-</span>
        </template>

        <template #cell-credit="{ item }">
          <span class="font-mono text-xs font-bold text-rose-400" v-if="item.credit > 0">
            {{ formatCurrency(item.credit) }}
          </span>
          <span v-else class="text-gray-700 text-xs">-</span>
        </template>

        <template #cell-running_balance="{ item }">
          <span
            class="font-black text-xs text-white bg-surface-background/70 px-2 py-1 rounded border border-gray-800/60 font-mono"
          >
            {{ formatCurrency(item.running_balance) }}
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
import AppDropdown from '@/components/ui/AppDropdown.vue'

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  account_id: '',
  from_date: '',
  to_date: '',
})

const { accountLedgerList, accountLedgerSummary, accountsList, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'id', label: 'المعرف الرقمي' },
  { key: 'entry_date', label: 'تاريخ القيد' },
  { key: 'entry_number', label: 'رقم السند المحاسبي' },
  { key: 'line_notes', label: 'البيان والشرح التفصيلي' },
  { key: 'debit', label: 'مدين (+)' },
  { key: 'credit', label: 'دائن (-)' },
  { key: 'running_balance', label: 'الرصيد المتوالي' },
]

const handleFetch = () => {
  if (!filters.value.account_id) return

  // تنظيف وتجهيز الفلاتر قبل التمرير للباك إند
  const cleanFilters = { account_id: filters.value.account_id }
  if (filters.value.from_date) cleanFilters.from_date = filters.value.from_date
  if (filters.value.to_date) cleanFilters.to_date = filters.value.to_date

  reportStore.fetchAccountLedger(cleanFilters)
}

const handlePrint = () => {
  if (!accountLedgerSummary.value || accountLedgerList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: accountLedgerSummary.value.opening_balance,
        grand_total_due_value: accountLedgerSummary.value.total_period_debit,
        grand_total_paid: accountLedgerSummary.value.total_period_credit,
        grand_total_remaining: accountLedgerSummary.value.closing_balance,
        total_companies: 1,
        total_projects: accountLedgerList.value.length,
        title_override: `كشف حساب تفصيلي للحساب: [ ${accountLedgerSummary.value.account_code} ] - ${accountLedgerSummary.value.account_name}`,
      },
      companiesSummary: accountLedgerList.value.map((line) => ({
        id: line.id,
        name: line.line_notes ?? 'قيد محاسبي عمومي',
        license_number: line.entry_date,
        projects_count: `سند رقم: ${line.entry_number ?? '-'}`,
        total_contract_value: line.debit,
        total_due_value: line.credit,
        total_paid: line.debit - line.credit,
        total_remaining: line.running_balance,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  if (reportStore.fetchFinancialLookups) {
    reportStore.fetchFinancialLookups()
  }
})
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}

:deep(.AppTable td) {
  @apply py-3 border-b border-gray-800/50;
}
</style>
