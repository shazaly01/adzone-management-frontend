<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">كشف حساب الكيانات المساعدة</h1>
        <p class="text-sm text-gray-400 mt-1">
          كشف حركة تفصيلي ديناميكي لحسابات العملاء، الموردين، البنوك، الخزائن، والمصممون المساعدون
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="subLedgerList.length === 0"
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold border border-indigo-700 rounded-none disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة كشف الحساب
        </AppButton>
      </div>
    </div>

    <SubLedgerFilterCard
      :sub-ledgers-list="unifiedSubLedgers"
      :is-data-loading="isDataLoading"
      :loading="loading"
      @fetch="handleFetch"
    />

    <SubLedgerSummaryCards v-if="subLedgerList.length > 0" :summary="derivedSummary" />

    <AppCard
      v-if="subLedgerList.length > 0 || loading"
      class="border border-gray-800 bg-surface-section/40 rounded-none"
    >
      <AppTable :headers="tableHeaders" :items="subLedgerList" :is-loading="loading">
        <template #cell-entry_date="{ item }">
          <span class="text-xs text-gray-400 font-mono">{{ item.entry_date ?? '-' }}</span>
        </template>

        <template #cell-entry_number="{ item }">
          <span class="font-mono text-cyan-400 text-xs font-bold">
            {{ item.entry_number ?? '-' }}
          </span>
        </template>

        <template #cell-account_name="{ item }">
          <span class="text-xs font-bold text-gray-200">{{ item.account_name ?? '-' }}</span>
        </template>

        <template #cell-line_notes="{ item }">
          <span class="text-xs text-gray-400">{{ item.line_notes ?? '-' }}</span>
        </template>

        <template #cell-debit="{ item }">
          <span class="font-mono text-xs font-bold text-emerald-400" v-if="item.debit > 0">
            {{ formatCurrency(item.debit) }}
          </span>
          <span class="text-gray-700 text-xs" v-else>-</span>
        </template>

        <template #cell-credit="{ item }">
          <span class="font-mono text-xs font-bold text-rose-400" v-if="item.credit > 0">
            {{ formatCurrency(item.credit) }}
          </span>
          <span class="text-gray-700 text-xs" v-else>-</span>
        </template>

        <template #cell-running_total="{ item }">
          <span
            class="font-black text-xs text-white bg-surface-background/80 px-2 py-1 rounded-none border border-gray-800 font-mono"
          >
            {{ formatCurrency(item.running_total) }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon } from '@heroicons/vue/24/outline'

import { useReportStore } from '@/stores/reportStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { useBankStore } from '@/stores/bankStore'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useUserStore } from '@/stores/userStore'

import SubLedgerFilterCard from './components/SubLedgerFilterCard.vue'
import SubLedgerSummaryCards from './components/SubLedgerSummaryCards.vue'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()

const reportStore = useReportStore()
const customerStore = useCustomerStore()
const supplierStore = useSupplierStore()
const bankStore = useBankStore()
const treasuryStore = useTreasuryStore()
const userStore = useUserStore()

const { customers, loading: customersLoading } = storeToRefs(customerStore)
const { suppliers, loading: suppliersLoading } = storeToRefs(supplierStore)
const { banks, loading: banksLoading } = storeToRefs(bankStore)
const { treasuries, loading: treasuriesLoading } = storeToRefs(treasuryStore)
const { users: designers, loading: designersLoading } = storeToRefs(userStore)

const { subLedgerList, subLedgerSummary, loading } = storeToRefs(reportStore)

const currentFetchedFilters = ref(null)

const isDataLoading = computed(() => {
  return (
    customersLoading.value ||
    suppliersLoading.value ||
    banksLoading.value ||
    treasuriesLoading.value ||
    designersLoading.value
  )
})

onMounted(async () => {
  try {
    const promises = []

    if (customers.value.length === 0)
      promises.push(customerStore.fetchCustomers(1, { per_page: 1000 }))
    if (suppliers.value.length === 0)
      promises.push(supplierStore.fetchSuppliers(1, { per_page: 1000 }))
    if (banks.value.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))
    if (treasuries.value.length === 0)
      promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))

    if (designers.value.length === 0) {
      promises.push(userStore.fetchUsers(1, { type: 'designer', per_page: 1000 }))
    }

    if (promises.length > 0) {
      await Promise.all(promises)
    }
  } catch (err) {
    console.error('Failed to pre-load all sub-ledger infrastructure entries for report view:', err)
  }
})

const unifiedSubLedgers = computed(() => {
  const list = []

  customers.value.forEach((item) => {
    list.push({
      composite_key: `customer:${item.id}`,
      id: item.id,
      type: 'App\\Models\\Customer',
      name: item.name,
      displayType: 'عميل',
      badgeClass: 'bg-blue-900/40 text-blue-400 border-blue-800/60',
    })
  })

  suppliers.value.forEach((item) => {
    list.push({
      composite_key: `supplier:${item.id}`,
      id: item.id,
      type: 'App\\Models\\Supplier',
      name: item.name,
      displayType: 'مورد',
      badgeClass: 'bg-amber-900/40 text-amber-400 border-amber-800/60',
    })
  })

  banks.value.forEach((item) => {
    list.push({
      composite_key: `bank:${item.id}`,
      id: item.id,
      type: 'App\\Models\\Bank',
      name: item.name,
      displayType: 'بنك/محفظة',
      badgeClass: 'bg-indigo-900/40 text-indigo-400 border-indigo-800/60',
    })
  })

  treasuries.value.forEach((item) => {
    list.push({
      composite_key: `treasury:${item.id}`,
      id: item.id,
      type: 'App\\Models\\Treasury',
      name: item.name,
      displayType: 'خزنة مالية',
      badgeClass: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/60',
    })
  })

  designers.value.forEach((item) => {
    list.push({
      composite_key: `designer:${item.id}`,
      id: item.id,
      type: 'App\\Models\\User',
      name: item.full_name,
      displayType: 'مصمم/مساعد',
      badgeClass: 'bg-purple-900/40 text-purple-400 border-purple-800/60',
    })
  })

  return list
})

// [حقن هندسي راديكالي]: دالة احتساب الإجماليات تلقائياً وبأعلى دقة من واقع أسطر الجدول لحل مشكلة قصور كائن الـ API
const derivedSummary = computed(() => {
  const lines = subLedgerList.value || []
  const opening = Number(subLedgerSummary.value?.opening_balance) || 0

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0)

  // الرصيد الختامي هو الرصيد التراكمي لآخر سطر في الجدول، وإذا كان الجدول فارغاً يساوي الافتتاحي
  const closing = lines.length > 0 ? Number(lines[lines.length - 1].running_total) || 0 : opening

  return {
    opening_balance: opening,
    total_period_debit: totalDebit,
    total_period_credit: totalCredit,
    closing_balance: closing,
  }
})

const tableHeaders = [
  { key: 'id', label: 'المعرف القياسي' },
  { key: 'entry_date', label: 'تاريخ الحركة' },
  { key: 'entry_number', label: 'رقم السند' },
  { key: 'account_name', label: 'الحساب المقابل' },
  { key: 'line_notes', label: 'شرح الحساب والبيان الجاري' },
  { key: 'debit', label: 'مدين (+)' },
  { key: 'credit', label: 'دائن (-)' },
  { key: 'running_total', label: 'الرصيد التراكمي' },
]

const handleFetch = (cleanFilters) => {
  currentFetchedFilters.value = cleanFilters
  reportStore.fetchSubLedgerStatement(cleanFilters)
}

const handlePrint = () => {
  if (subLedgerList.value.length === 0) return

  let entityLabel = 'حساب مساعد مورفي فرعي'

  const targetType =
    currentFetchedFilters.value?.sub_ledger_type || subLedgerList.value[0]?.sub_ledger_type
  const targetId =
    currentFetchedFilters.value?.sub_ledger_id || subLedgerList.value[0]?.sub_ledger_id

  const currentEntity = unifiedSubLedgers.value.find(
    (e) => e.type === targetType && e.id === Number(targetId),
  )
  if (currentEntity) entityLabel = `${currentEntity.name} (${currentEntity.displayType})`

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        // ترحيل البيانات المحسوبة ديناميكياً بدقة متناهية إلى شاشة الطباعة الصافية
        grand_total_contract_value: derivedSummary.value.opening_balance,
        grand_total_due_value: derivedSummary.value.total_period_debit,
        grand_total_paid: derivedSummary.value.total_period_credit,
        grand_total_remaining: derivedSummary.value.closing_balance,
        total_companies: 1,
        total_projects: subLedgerList.value.length,
        title_override: `تقرير كافة الحركات التفصيلية لحساب: ${entityLabel}`,
      },
      companiesSummary: subLedgerList.value.map((line) => ({
        id: line.id,
        name: line.line_notes ?? 'حركة مالية تحليلية قيود',
        license_number: line.entry_date,
        projects_count: line.account_name ?? '-',
        total_contract_value: line.debit,
        total_due_value: line.credit,
        total_paid: line.debit - line.credit,
        total_remaining: line.running_total,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'SubLedgerPrint' })
  window.open(routeData.href, '_blank')
}
</script>

<script>
// تعيين اتجاه الخطوط الافتراضية للجداول
export default {
  name: 'SubLedgerReport',
}
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}

:deep(.AppTable td) {
  @apply py-3 border-b border-gray-800/50;
}
</style>
