<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">كارت حركة الصنف</h1>
        <p class="text-sm text-gray-400 mt-1">
          تتبع المسار التاريخي لحركات الوارد والصادر والرصيد التراكمي
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!stockCardSummary || stockCardList.length === 0"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة الكارت
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">
            الصنف المستهدف (إجباري)
          </label>
          <AppDropdown
            id="filter-item-id"
            v-model="filters.item_id"
            :options="itemsList"
            option-label="name"
            option-value="id"
            placeholder="اختر الصنف..."
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">المستودع</label>
          <AppDropdown
            id="filter-store-id"
            v-model="filters.store_id"
            :options="storesList"
            option-label="name"
            option-value="id"
            placeholder="كل المستودعات"
            :show-clear="true"
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
              :disabled="!filters.item_id"
              class="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-40"
            >
              <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
            </AppButton>
          </div>
        </div>
      </div>
    </AppCard>

    <div v-if="stockCardSummary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard class="p-4 border-r-4 border-r-gray-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-gray-400 font-bold uppercase mb-1">
          الرصيد الافتتاحي السابق
        </div>
        <div class="text-xl font-black text-gray-300">{{ stockCardSummary.opening_balance }}</div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-emerald-300/60 font-bold uppercase mb-1">
          إجمالي حركات الوارد (+)
        </div>
        <div class="text-xl font-black text-emerald-400">{{ stockCardSummary.total_incoming }}</div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-rose-500 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-rose-300/60 font-bold uppercase mb-1">
          إجمالي حركات الصادر (-)
        </div>
        <div class="text-xl font-black text-rose-400">{{ stockCardSummary.total_outgoing }}</div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-cyan-400 bg-surface-section/60 shadow-lg">
        <div class="text-[10px] text-cyan-300/60 font-bold uppercase mb-1">
          الرصيد الختامي الصافي
        </div>
        <div class="text-xl font-black text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
          {{ stockCardSummary.closing_balance }}
        </div>
      </AppCard>
    </div>

    <AppCard
      v-if="stockCardList.length > 0 || loading"
      class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm"
    >
      <AppTable :headers="tableHeaders" :items="stockCardList" :is-loading="loading">
        <template #cell-date="{ item }">
          <span class="text-xs text-gray-400 font-mono">{{ item.date }}</span>
        </template>

        <template #cell-movement_type="{ item }">
          <span
            class="text-xs px-2 py-0.5 rounded font-bold bg-gray-800 text-gray-300 border border-gray-700"
          >
            {{ item.movement_type }}
          </span>
        </template>

        <template #cell-document_no="{ item }">
          <span class="font-mono text-cyan-400 text-xs font-bold">
            {{ item.document_no ?? '-' }}
          </span>
        </template>

        <template #cell-quantity="{ item }">
          <span
            class="font-bold text-sm"
            :class="item.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ item.direction === 'in' ? '+' : '-' }} {{ item.quantity }}
            <span class="text-[10px] font-normal text-gray-500">({{ item.unit_name_used }})</span>
          </span>
        </template>

        <template #cell-direction_lbl="{ item }">
          <span
            class="text-xs font-medium"
            :class="item.direction === 'in' ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ item.direction_lbl }}
          </span>
        </template>

        <template #cell-cost_price="{ item }">
          <span class="text-gray-400 text-xs">{{ formatCurrency(item.cost_price) }}</span>
        </template>

        <template #cell-running_balance="{ item }">
          <span
            class="font-black text-white bg-surface-background/80 px-2 py-1 rounded border border-gray-800/60"
          >
            {{ item.running_balance }}
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

const { stockCardList, stockCardSummary, itemsList, storesList, loading } = storeToRefs(reportStore)

const filters = ref({
  item_id: '',
  store_id: '',
  from_date: '',
  to_date: '',
})

const tableHeaders = [
  { key: 'id', label: 'المعرف' },
  { key: 'date', label: 'التاريخ والوقت' },
  { key: 'movement_type', label: 'نوع الحركة' },
  { key: 'document_no', label: 'رقم السند' },
  { key: 'store_name', label: 'المستودع' },
  { key: 'quantity', label: 'الكمية الحركة' },
  { key: 'direction_lbl', label: 'طبيعة الحركة' },
  { key: 'cost_price', label: 'تكلفة الحركة' },
  { key: 'running_balance', label: 'الرصيد الجاري' },
]

const handleFetch = () => {
  if (!filters.value.item_id) return
  reportStore.fetchStockCard(filters.value)
}

const handlePrint = () => {
  if (!stockCardSummary.value || stockCardList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: stockCardSummary.value.opening_balance,
        grand_total_due_value: stockCardSummary.value.total_incoming,
        grand_total_paid: stockCardSummary.value.total_outgoing,
        grand_total_remaining: stockCardSummary.value.closing_balance,
        total_companies: 1,
        total_projects: stockCardList.value.length,
        title_override: `تقرير كارت الحركة التفصيلي للصنف: ${stockCardSummary.value.item_name}`,
      },
      companiesSummary: stockCardList.value.map((move) => ({
        id: move.id,
        name: `${move.movement_type} [سند: ${move.document_no ?? '-'}]`,
        license_number: move.date,
        projects_count: move.store_name ?? 'الرئيسي',
        total_contract_value: move.quantity,
        total_due_value: move.cost_price,
        total_paid: move.base_quantity,
        total_remaining: move.running_balance,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  if (reportStore.fetchLookups) {
    reportStore.fetchLookups()
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
