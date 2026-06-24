<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">ملخص التسويات وفروقات الجرد</h1>
        <p class="text-sm text-gray-400 mt-1">
          مراجعة دورية لمستندات تسوية المخزون وحجم العجز والفائض المكتشف بالفترات
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!adjustmentsSummary || adjustmentsList.length === 0"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة ملخص الجرد
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2"
            >المستودع المحتسب</label
          >
          <AppDropdown
            id="filter-store-id"
            v-model="filters.store_id"
            :options="storesList"
            option-label="name"
            option-value="id"
            placeholder="كل المستودعات والفروع"
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
            فلترة وتحليل
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div v-if="adjustmentsSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard class="p-5 border-r-4 border-r-gray-500 bg-surface-section/60 shadow-lg">
        <div class="text-xs text-gray-400/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي مستندات التسوية
        </div>
        <div class="text-2xl font-black text-gray-300">
          {{ adjustmentsSummary.total_adjustments_count }}
          <span class="text-sm font-normal">عملية جردية</span>
        </div>
      </AppCard>

      <AppCard
        class="p-5 border-r-4 border-r-rose-500 bg-surface-section/60 shadow-[0_4_15px_rgba(244,63,94,0.15)]"
      >
        <div class="text-xs text-rose-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي قيمة الفقد والعجز (-)
        </div>
        <div class="text-2xl font-black text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]">
          {{ formatCurrency(adjustmentsSummary.grand_total_shortage) }}
        </div>
      </AppCard>

      <AppCard
        class="p-5 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-[0_4_15px_rgba(16,185,129,0.15)]"
      >
        <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي قيمة الفائض المكتشف (+)
        </div>
        <div
          class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]"
        >
          {{ formatCurrency(adjustmentsSummary.grand_total_surplus) }}
        </div>
      </AppCard>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
      <AppTable :headers="tableHeaders" :items="adjustmentsList" :is-loading="loading">
        <template #cell-adjustment_number="{ item }">
          <span
            class="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/30"
          >
            {{ item.adjustment_number }}
          </span>
        </template>

        <template #cell-date="{ item }">
          <span class="text-xs text-gray-400 font-mono">{{ item.date }}</span>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-xs font-bold text-gray-300">
            {{ item.store_name ?? 'المركز العام' }}
          </span>
        </template>

        <template #cell-created_by="{ item }">
          <span class="text-xs text-gray-400">{{ item.created_by ?? 'نظام آلي' }}</span>
        </template>

        <template #cell-shortage_value="{ item }">
          <span
            class="font-mono font-medium text-xs"
            :class="item.shortage_value > 0 ? 'text-rose-400' : 'text-gray-600'"
          >
            {{ item.shortage_value > 0 ? formatCurrency(item.shortage_value) : '-' }}
          </span>
        </template>

        <template #cell-surplus_value="{ item }">
          <span
            class="font-mono font-medium text-xs"
            :class="item.surplus_value > 0 ? 'text-emerald-400' : 'text-gray-600'"
          >
            {{ item.surplus_value > 0 ? formatCurrency(item.surplus_value) : '-' }}
          </span>
        </template>

        <template #cell-items_count="{ item }">
          <span class="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-bold">
            {{ item.items_count }} أصناف
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
import AppDropdown from '@/components/ui/AppDropdown.vue' // استيراد المكون الموحد

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  store_id: '',
  from_date: '',
  to_date: '',
})

const { adjustmentsList, adjustmentsSummary, storesList, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'adjustment_number', label: 'رقم مستند التسوية' },
  { key: 'date', label: 'تاريخ المستند' },
  { key: 'store_name', label: 'المستودع المتأثر' },
  { key: 'created_by', label: 'منظم الحركة' },
  { key: 'shortage_value', label: 'قيمة العجز (-)' },
  { key: 'surplus_value', label: 'قيمة الفائض (+)' },
  { key: 'items_count', label: 'الأصناف المجرودة' },
]

const handleFetch = () => {
  reportStore.fetchAdjustmentsSummary(filters.value)
}

const handlePrint = () => {
  if (!adjustmentsSummary.value || adjustmentsList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: adjustmentsSummary.value.grand_total_shortage,
        grand_total_due_value: adjustmentsSummary.value.grand_total_surplus,
        grand_total_paid: adjustmentsSummary.value.total_adjustments_count,
        grand_total_remaining: 0,
        total_companies: adjustmentsSummary.value.total_adjustments_count,
        total_projects: adjustmentsList.value.length,
        title_override: 'تقرير ملخص تسويات المخازن وفروقات الجرد الدورية البنيوية',
      },
      companiesSummary: adjustmentsList.value.map((adj) => ({
        id: adj.id,
        name: `مستند تسوية رقم [ ${adj.adjustment_number} ]`,
        license_number: adj.date,
        projects_count: adj.store_name ?? 'المخزن العام',
        total_contract_value: adj.shortage_value,
        total_due_value: adj.surplus_value,
        total_paid: adj.items_count,
        total_remaining: adj.notes ?? '',
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
  @apply py-4 border-b border-gray-800/50;
}
</style>
