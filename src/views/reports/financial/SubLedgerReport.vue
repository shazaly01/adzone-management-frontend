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
          <span
            v-if="item.source_type && item.source_id"
            @click="openSourceDocument(item)"
            class="font-mono text-cyan-400 text-xs font-bold cursor-pointer hover:text-cyan-300 hover:underline flex items-center gap-1"
            title="اضغط لعرض المستند الأصلي"
          >
            {{ item.entry_number ?? '-' }}
          </span>
          <span class="font-mono text-gray-500 text-xs" v-else>
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

    <!-- نافذة التأصيل المستندي المعزولة والذكية -->
    <SourceDocumentModal
      :is-open="isModalOpen"
      :source-type="activeSourceType"
      :source-id="activeSourceId"
      :entry-number="activeEntryNumber"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon } from '@heroicons/vue/24/outline'

import { useReportStore } from '@/stores/reportStore'
// استدعاء الـ Composable والـ Component المساعدين من المجلد المخصص
import { useSubLedgerInfrastructure } from './components/useSubLedgerInfrastructure'
import SourceDocumentModal from './components/SourceDocumentModal.vue'

import SubLedgerFilterCard from './components/SubLedgerFilterCard.vue'
import SubLedgerSummaryCards from './components/SubLedgerSummaryCards.vue'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const reportStore = useReportStore()

// امتصاص منطق المتاجر الخمسة والتحميل المسبق عبر الـ Composable المعزول
const { unifiedSubLedgers, isDataLoading } = useSubLedgerInfrastructure()
const { subLedgerList, subLedgerSummary, loading } = storeToRefs(reportStore)

const currentFetchedFilters = ref(null)

// متغيرات حالة التحكم بنافذة العرض المنبثقة
const isModalOpen = ref(false)
const activeSourceType = ref('')
const activeSourceId = ref('')
const activeEntryNumber = ref('')

const derivedSummary = computed(() => {
  const lines = subLedgerList.value || []
  const opening = Number(subLedgerSummary.value?.opening_balance) || 0

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0)

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

function openSourceDocument(item) {
  if (!item.source_type || !item.source_id) return

  activeSourceType.value = item.source_type
  activeSourceId.value = item.source_id
  activeEntryNumber.value = item.entry_number ?? '-'
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  activeSourceType.value = ''
  activeSourceId.value = ''
  activeEntryNumber.value = ''
}

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
