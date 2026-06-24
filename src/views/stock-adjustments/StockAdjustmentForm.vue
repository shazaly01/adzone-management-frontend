<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند التسوية الجردية' : 'مستند تسوية جردية جديد' }}
        </h1>
      </div>
    </div>

    <div
      v-if="stockAdjustmentStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ stockAdjustmentStore.error }}
    </div>

    <StockAdjustmentHeader
      v-model="form"
      :validation-errors="stockAdjustmentStore.validationErrors"
      :is-edit="isEdit"
    />

    <AppCard>
      <div class="p-3 space-y-3">
        <div
          class="w-full text-xs bg-slate-950 p-1.5 rounded-lg border border-primary/50 shadow-[0_0_10px_rgba(30,129,255,0.15)]"
        >
          <SmartSearchGrid
            :data="searchableItems"
            :columns="[
              { key: 'id_display', label: 'رقم الصنف', class: 'text-right' },
              { key: 'name', label: 'اسم الصنف التجاري المعتمد', class: 'text-right font-bold' },
              { key: 'price_display', label: 'السعر الافتراضي', class: 'text-center' },
              { key: 'stock_display', label: 'الالكمية المتاحة حالياً', class: 'text-center' },
            ]"
            :search-keys="['id', 'name', 'code']"
            placeholder="اكتب اسم المنتج أو رقم الصنف لمزامنة تسوية المخزون اللحظية..."
            @select="handleGlobalItemSelect"
          />
        </div>

        <p
          v-if="getValidationError('items')"
          class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100"
        >
          {{ getValidationError('items') }}
        </p>

        <InvoiceDetailTable
          :items="items"
          :schema="visibleTableSchema"
          @remove-row="removeRow"
          @add-row-request="triggerAddNewEmptyLine"
        >
          <template #cell-item_unit_id="{ row, index }">
            <div class="flex flex-col w-full">
              <select
                v-model="row.item_unit_id"
                @change="syncUnitCostAndFields(row)"
                :disabled="!row.available_units || row.available_units.length === 0"
                style="color-scheme: dark"
                class="w-full p-1 bg-transparent text-text-primary border border-transparent hover:border-surface-border focus:border-primary focus:bg-surface-card rounded-md text-xs font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right appearance-none"
              >
                <option value="" class="bg-surface-card text-text-primary">اختر الوحدة...</option>
                <option
                  v-for="u in row.available_units"
                  :key="u.id"
                  :value="u.id"
                  class="bg-surface-card text-text-primary"
                >
                  {{ u.unit_name || 'وحدة مجهولة' }}
                </option>
              </select>
              <p
                v-if="getValidationError(`items.${index}.item_unit_id`)"
                class="text-rose-500 text-[9px] font-bold mt-0.5"
              >
                الوحدة مطلوبة للسطر
              </p>
            </div>
          </template>

          <template #cell-quantity_difference="{ row }">
            <div class="w-full text-center font-mono font-black text-xs">
              <span v-if="row.quantity_difference > 0" class="text-emerald-500">
                +{{ row.quantity_difference }} (فائض)
              </span>
              <span v-else-if="row.quantity_difference < 0" class="text-rose-500">
                {{ row.quantity_difference }} (عجز)
              </span>
              <span v-else class="text-text-muted">0.00</span>
            </div>
          </template>
        </InvoiceDetailTable>
      </div>
    </AppCard>

    <StockAdjustmentFooter
      v-model:notes="form.notes"
      :total-items="items.filter((r) => r.item_id).length"
      :total-shortage="totalShortageValue"
      :total-surplus="totalSurplusValue"
      :validation-errors="stockAdjustmentStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        تنبيه: حركات التسوية الجردية قيود تسوية فوارق تقييم مخزنية آلية وتؤثر مباشرة على حساب
        أرباح/خسائر الجرد.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          :disabled="stockAdjustmentStore.loading"
          @click="handleSubmit"
        >
          <span v-if="stockAdjustmentStore.loading">جاري ترحيل ومعالجة الفروقات الجردية...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة مستند التسوية' : 'ترحيل وإقفال الجرد النهائي'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStockAdjustmentStore } from '@/stores/stockAdjustmentStore'
import { useStoreStore } from '@/stores/storeStore'
import { useItemStore } from '@/stores/itemStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import StockAdjustmentHeader from './components/StockAdjustmentHeader.vue'
import StockAdjustmentFooter from './components/StockAdjustmentFooter.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const stockAdjustmentStore = useStockAdjustmentStore()
const storeStore = useStoreStore()
const itemStore = useItemStore()

const isEdit = computed(() => !!route.params.id)
const isHydrating = ref(false)

const form = ref({
  store_id: '',
  adjustment_date: new Date().toISOString().substr(0, 10),
  notes: '',
})

const items = ref([])

const searchableItems = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items.map((item) => ({
    ...item,
    id_display: `PRD-${item.id}`,
    name: item.name || '',
    price_display: item.units?.[0]
      ? `${parseFloat(item.units[0].price).toFixed(2)} د.ل`
      : '0.00 د.ل',
    stock_display: item.current_stock !== undefined ? `${item.current_stock}` : '0',
  }))
})

const detailSchema = [
  {
    key: 'item_id_display',
    label: 'رقم الصنف',
    widthClass: 'w-1/12',
    readonly: true,
    type: 'text',
    extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
  },
  {
    key: 'item_name',
    label: 'اسم الصنف التجاري المعتمد',
    widthClass: 'w-1/4',
    readonly: true,
    type: 'text',
    extractFromItem: (item) => item.name || '',
  },
  {
    key: 'item_id',
    extractFromItem: (item) => item.id,
  },
  {
    key: 'available_units',
    defaultValue: [],
    extractFromItem: (item) => item.units || [],
  },
  {
    key: 'item_unit_id',
    label: 'وحدة الجرد',
    slot: 'cell-item_unit_id',
    widthClass: 'w-1/6',
    type: 'text',
    extractFromItem: (item) => item.units?.[0]?.id || '',
  },
  {
    key: 'base_stock',
    extractFromItem: (item) => parseFloat(item.current_stock) || 0,
  },
  {
    key: 'book_quantity',
    label: 'الكمية الدفترية',
    type: 'calculated',
    readonly: true,
    widthClass: 'w-1/12',
    formula: (row) => {
      if (row.base_stock === null || row.base_stock === undefined) return 0
      const matchedUnit = row.available_units?.find(
        (u) => String(u.id) === String(row.item_unit_id),
      )
      const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
      return parseFloat((row.base_stock / factor).toFixed(2))
    },
  },
  {
    key: 'physical_quantity',
    label: 'الكمية الفعلية الجردية',
    type: 'number',
    defaultValue: 0,
    widthClass: 'w-1/12',
  },
  {
    key: 'quantity_difference',
    label: 'الفارق الجردي الكمي',
    type: 'calculated',
    readonly: true,
    summary: false,
    slot: 'cell-quantity_difference',
    widthClass: 'w-1/6',
    formula: (row) => {
      const physical = parseFloat(row.physical_quantity) || 0
      const book = parseFloat(row.book_quantity) || 0
      return parseFloat((physical - book).toFixed(2))
    },
  },
  {
    key: 'unit_cost',
    label: 'تكلفة الوحدة',
    type: 'number',
    readonly: true,
    widthClass: 'w-1/12',
    extractFromItem: (item) => item.units?.[0]?.cost || 0,
  },
]

const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
  uniqueKeys: ['item_id', 'item_unit_id'],
  mergeQtyKey: null,
})

// حساب قيمة العجز التراكمي لأسطر الجدول لتغذية الـ Footer
const totalShortageValue = computed(() => {
  return items.value.reduce((sum, row) => {
    const diff = parseFloat(row.quantity_difference) || 0
    const cost = parseFloat(row.unit_cost) || 0
    return diff < 0 ? sum + Math.abs(diff * cost) : sum
  }, 0)
})

// حساب قيمة الفائض التراكمي لأسطر الجدول لتغذية الـ Footer
const totalSurplusValue = computed(() => {
  return items.value.reduce((sum, row) => {
    const diff = parseFloat(row.quantity_difference) || 0
    const cost = parseFloat(row.unit_cost) || 0
    return diff > 0 ? sum + diff * cost : sum
  }, 0)
})

watch(
  () => form.value.store_id,
  async (newStoreId) => {
    if (isHydrating.value) return
    if (!newStoreId) {
      itemStore.items = []
      return
    }

    await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId })

    const activeItemIds = items.value.map((row) => row.item_id).filter((id) => id)

    if (activeItemIds.length > 0) {
      try {
        const stockMap = await itemStore.refreshItemsStock({
          store_id: parseInt(newStoreId, 10),
          item_ids: activeItemIds,
        })

        items.value.forEach((row) => {
          if (row.item_id && stockMap[row.item_id] !== undefined) {
            row.base_stock = parseFloat(stockMap[row.item_id]) || 0
          } else if (row.item_id) {
            row.base_stock = 0
          }
        })
      } catch (err) {
        console.error('فشل في إعادة توازن الأرصدة الدفترية اللحظية للمستودع الجديد:', err)
      }
    }
  },
)

const handleGlobalItemSelect = (selectedItem) => {
  if (!selectedItem) return
  if (!form.value.store_id) {
    toast.warning('عفواً، يجب تحديد مستودع الجرد والتسوية أولاً لشحن الأرصدة الدفترية.')
    return
  }
  handleItemSelected(selectedItem)
}

const triggerAddNewEmptyLine = () => {
  items.value.push(createEmptyRow())
}

const syncUnitCostAndFields = (row) => {
  const matchedUnit = row.available_units?.find((u) => String(u.id) === String(row.item_unit_id))
  if (matchedUnit) {
    row.unit_cost = matchedUnit.cost || 0
  }
}

const getValidationError = (path) => {
  return stockAdjustmentStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  if (isEdit.value) {
    isHydrating.value = true
    await stockAdjustmentStore.fetchStockAdjustment(route.params.id)
    if (stockAdjustmentStore.currentStockAdjustment) {
      const cur = stockAdjustmentStore.currentStockAdjustment

      items.value = cur.items.map((it) => {
        return {
          item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
          item_name: it.item_name || '',
          item_id: it.item_id,
          item_unit_id: it.item_unit_id,
          book_quantity: parseFloat(it.book_quantity) || 0,
          physical_quantity: parseFloat(it.physical_quantity) || 0,
          quantity_difference: parseFloat(it.quantity_difference) || 0,
          unit_cost: parseFloat(it.unit_cost) || 0,
          available_units: it.available_units || [],
          base_stock: parseFloat(it.current_stock) || 0,
          available_stock: 0,
          _flashing: false,
        }
      })

      form.value = {
        store_id: cur.store_id,
        adjustment_date: cur.adjustment_date.substr(0, 10),
        notes: cur.notes || '',
      }

      if (cur.store_id) {
        await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id })
      }
    }
    isHydrating.value = false
  } else {
    triggerAddNewEmptyLine()
  }
})

const handleSubmit = async () => {
  const dynamicItemsPayload = items.value
    .filter((row) => row.item_id && row.item_unit_id)
    .map((row) => ({
      item_id: row.item_id,
      item_unit_id: row.item_unit_id,
      book_quantity: parseFloat(row.book_quantity) || 0,
      physical_quantity: parseFloat(row.physical_quantity) || 0,
      quantity_difference: parseFloat(row.quantity_difference) || 0,
      unit_cost: parseFloat(row.unit_cost) || 0,
    }))

  const finalPayload = {
    ...form.value,
    items: dynamicItemsPayload,
  }

  try {
    if (isEdit.value) {
      await stockAdjustmentStore.updateStockAdjustment(route.params.id, finalPayload)
      toast.success('تم تحديث ومزامنة الفروقات والمستند الجردي بنجاح.')
    } else {
      await stockAdjustmentStore.createStockAdjustment(finalPayload)
      toast.success('تم ترحيل مستند التسوية الجردية وتحديث أرصدة الحسابات بنجاح.')
    }
    router.push('/app/stock-adjustments')
  } catch {
    toast.error('فشلت عملية ترحيل التسوية، يرجى مراجعة قيم بنود الفحص.')
  }
}

const handleCancel = () => {
  router.push('/app/stock-adjustments')
}
</script>

<style scoped>
:deep(.smart-search-grid th.text-right),
:deep(.smart-search-grid td.text-right),
:deep(.smart-search-dropdown .text-right),
:deep(table td:nth-child(2)) {
  text-align: right !important;
}

select option {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
