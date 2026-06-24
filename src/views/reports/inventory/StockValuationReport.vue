<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">تقرير تقييم المخزون المالي</h1>
        <p class="text-sm text-gray-400 mt-1">
          احتساب القيمة الرأسمالية الحالية للبضاعة المخزنة بناءً على التكلفة
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!stockValuationSummary || stockValuationList.length === 0"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة التقييم المالي
        </AppButton>
      </div>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/60 p-5 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">
            تصفية حسب المستودع
          </label>
          <AppDropdown
            id="filter-store-id"
            v-model="storeId"
            :options="storesList"
            option-label="name"
            option-value="id"
            placeholder="كل المستودعات والفروع التخزينية"
            :show-clear="true"
          />
        </div>

        <div>
          <AppButton
            @click="handleFetch"
            :loading="loading"
            class="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          >
            <ArrowPathIcon class="w-5 h-5 ml-2" :class="{ 'animate-spin': loading }" />
            تحديث وتوليد القيمة
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div v-if="stockValuationSummary" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-gray-600 bg-surface-section/60 shadow-lg"
      >
        <div class="text-xs text-gray-400/60 uppercase tracking-widest mb-2 font-bold">
          عدد الأصناف المقيّمة مخزنياً
        </div>
        <div class="text-2xl font-black text-gray-300">
          {{ stockValuationSummary.total_items }} <span class="text-sm font-normal">صنف مسجل</span>
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي القيمة الرأسمالية النقدية (تكلفة)
        </div>
        <div
          class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
        >
          {{ formatCurrency(stockValuationSummary.grand_total_inventory_value) }}
        </div>
      </AppCard>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
      <AppTable :headers="tableHeaders" :items="stockValuationList" :is-loading="loading">
        <template #cell-item_id="{ item }">
          <span class="font-mono text-xs text-gray-500">#{{ item.item_id }}</span>
        </template>

        <template #cell-item_name="{ item }">
          <span class="font-bold text-gray-200 hover:text-cyan-300 transition-colors duration-200">
            {{ item.item_name }}
          </span>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-xs text-gray-400 font-medium">
            {{ item.store_name ?? 'المركز الرئيسي' }}
          </span>
        </template>

        <template #cell-current_quantity="{ item }">
          <span class="font-bold text-gray-300">
            {{ item.current_quantity }}
            <span class="text-xs text-gray-500 font-normal"> {{ item.unit_name }}</span>
          </span>
        </template>

        <template #cell-unit_cost="{ item }">
          <span class="text-gray-400 font-medium font-mono">
            {{ formatCurrency(item.unit_cost) }}
          </span>
        </template>

        <template #cell-total_value="{ item }">
          <span
            class="font-black text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.2)] font-mono"
          >
            {{ formatCurrency(item.total_value) }}
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

const storeId = ref('')

const { stockValuationList, stockValuationSummary, storesList, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'item_id', label: 'كود الصنف' },
  { key: 'item_name', label: 'الاسم والبيان المخزني' },
  { key: 'store_name', label: 'المستودع الجاري' },
  { key: 'current_quantity', label: 'الكمية المتوفرة' },
  { key: 'unit_cost', label: 'تكلفة الوحدة 単' },
  { key: 'total_value', label: 'القيمة الرأسمالية الكلية' },
]

const handleFetch = () => {
  reportStore.fetchStockValuation({ store_id: storeId.value })
}

const handlePrint = () => {
  if (!stockValuationSummary.value || stockValuationList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: stockValuationSummary.value.grand_total_inventory_value,
        grand_total_due_value: stockValuationSummary.value.total_items,
        grand_total_paid: stockValuationSummary.value.grand_total_inventory_value,
        grand_total_remaining: 0,
        total_companies: stockValuationSummary.value.total_items,
        total_projects: 0,
        title_override: 'تقرير تقييم رأس المال المخزني والقيمة النقدية للبضاعة الشاملة',
      },
      companiesSummary: stockValuationList.value.map((stock) => ({
        id: stock.item_id,
        name: stock.item_name,
        license_number: stock.store_name ?? 'كل المخازن',
        projects_count: stock.current_quantity + ' ' + stock.unit_name,
        total_contract_value: stock.unit_cost,
        total_due_value: stock.total_value,
        total_paid: stock.total_value,
        total_remaining: 0,
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
