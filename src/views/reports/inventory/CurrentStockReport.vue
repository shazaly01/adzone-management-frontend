<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">تقرير الأرصدة اللحظية</h1>
        <p class="text-sm text-gray-400 mt-1">جرد وتقييم الكميات الحالية المتوفرة في المستودعات</p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة التقرير
        </AppButton>

        <AppButton
          @click="handleRefresh"
          :loading="loading"
          variant="secondary"
          class="border-gray-600 text-gray-200"
        >
          <ArrowPathIcon class="w-5 h-5 ml-2" :class="{ 'animate-spin': loading }" />
          تحديث البيانات
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/20 backdrop-blur-sm p-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <ItemsDropdown id="filter-item-id" label="تصفية بحسب الصنف" v-model="filters.item_id" />

        <div class="hidden md:block"></div>

        <div class="flex gap-3 justify-end">
          <AppButton
            @click="handleRefresh"
            :loading="loading"
            class="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] flex-1 md:flex-none px-6"
          >
            تطبيق الفلترة
          </AppButton>
          <AppButton
            @click="clearFilters"
            variant="secondary"
            class="border-gray-700 text-gray-300 flex-1 md:flex-none px-6"
          >
            إعادة تعيين
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div v-if="currentStockSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-fuchsia-500 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-fuchsia-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي الأصناف المجرودة
        </div>
        <div
          class="text-2xl font-black text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]"
        >
          {{ currentStockSummary.total_items }} <span class="text-sm font-normal">صنف فريد</span>
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-cyan-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-cyan-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي كميات المخزون (بالوحدة الأساسية)
        </div>
        <div class="text-2xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          {{ formatNumber(currentStockSummary.grand_total_quantity) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-emerald-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
          القيمة المالية الإجمالية للتكلفة
        </div>
        <div
          class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
        >
          {{ formatCurrency(currentStockSummary.grand_total_cost_value) }}
        </div>
      </AppCard>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
      <AppTable :headers="tableHeaders" :items="currentStockList" :is-loading="loading">
        <template #cell-item_name="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-cyan-300 transition-all duration-300">
              {{ item.item_name }}
            </span>
            <span class="text-[10px] text-gray-500">كود: #{{ item.item_id }}</span>
          </div>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-gray-300 font-medium">{{ item.store_name ?? 'غير محدد' }}</span>
        </template>

        <template #cell-current_quantity_base="{ item }">
          <span class="text-gray-200 font-bold">
            {{ item.current_quantity_base }}
            <span class="text-xs font-normal text-gray-400">({{ item.unit1_name }})</span>
          </span>
        </template>

        <template #cell-unit2_breakdown="{ item }">
          <span v-if="item.has_unit2" class="text-fuchsia-400 font-medium text-xs">
            {{ item.qty_in_unit2 }}
            <span class="text-[10px] text-gray-500">({{ item.unit2_name }})</span>
          </span>
          <span v-else class="text-gray-600 text-xs">-</span>
        </template>

        <template #cell-unit_cost="{ item }">
          <span class="text-gray-400 font-medium">{{ formatCurrency(item.unit_cost) }}</span>
        </template>

        <template #cell-total_cost_value="{ item }">
          <span class="text-emerald-400 font-black drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
            {{ formatCurrency(item.total_cost_value) }}
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
import ItemsDropdown from '@/components/forms/ItemsDropdown.vue'

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  item_id: '',
})

const { currentStockList, currentStockSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'stock_id', label: '#' },
  { key: 'item_name', label: 'الصنف / المنتج' },
  { key: 'store_name', label: 'المستودع' },
  { key: 'current_quantity_base', label: 'الكمية الأساسية' },
  { key: 'unit2_breakdown', label: 'المكافئ الافتراضي' },
  { key: 'unit_cost', label: 'تكلفة الوحدة' },
  { key: 'total_cost_value', label: 'إجمالي قيمة التكلفة' },
]

const handleRefresh = () => {
  // تنظيف الفلاتر قبل إرسالها إلى الـ API لمنع تمرير النصوص الفارغة
  const cleanedFilters = {}
  if (filters.value.item_id) {
    cleanedFilters.item_id = filters.value.item_id
  }

  reportStore.fetchCurrentStock(cleanedFilters)
}

const clearFilters = () => {
  filters.value.item_id = ''
  handleRefresh()
}

const handlePrint = () => {
  if (!currentStockSummary.value || currentStockList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: currentStockSummary.value.grand_total_cost_value,
        grand_total_due_value: currentStockSummary.value.grand_total_quantity,
        grand_total_paid: currentStockSummary.value.total_items,
        grand_total_remaining: 0,
        total_companies: currentStockSummary.value.total_items,
        total_projects: 0,
        title_override: 'تقرير جرد الأرصدة وتقييم المخزون اللحظي',
      },
      companiesSummary: currentStockList.value.map((stock, idx) => ({
        id: stock.stock_id,
        name: stock.item_name,
        license_number: stock.store_name,
        projects_count: stock.current_quantity_base + ' ' + stock.unit1_name,
        total_contract_value: stock.unit_cost,
        total_due_value: stock.total_cost_value,
        total_paid: stock.has_unit2 ? stock.qty_in_unit2 : 0,
        total_remaining: 0,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

onMounted(() => {
  handleRefresh()
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
