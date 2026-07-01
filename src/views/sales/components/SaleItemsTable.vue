<script setup>
import { computed, watch } from 'vue'
import { useItemStore } from '@/stores/itemStore'

import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  visibleTableSchema: { type: Array, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  // استقبال دالات التحكم المركزية من الأب لمنع خطأ الـ Mutation نهائياً
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
})

const itemStore = useItemStore()

const searchableItems = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items.map((item) => ({
    ...item,
    id_display: `PRD-${item.id}`,
    name: item.name || '',
    price_display: item.units?.[0]
      ? `${parseFloat(item.units[0].price).toFixed(2)} د.ل`
      : '0.00 د.ل',
    stock_display:
      item.current_stock !== undefined
        ? `${item.current_stock}`
        : item.stock !== undefined
          ? `${item.stock}`
          : '0',
  }))
})

// مراقبة مستودع الفاتورة لجلب وتحديث المخزون بشكل لحظي لأسطر الجدول
watch(
  () => props.form.store_id,
  async (newStoreId) => {
    if (!newStoreId) {
      itemStore.items = []
      return
    }

    await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId, all: true })

    const activeItemIds = props.items.map((row) => row.item_id).filter((id) => id)

    if (activeItemIds.length > 0) {
      try {
        const stockMap = await itemStore.refreshItemsStock({
          store_id: newStoreId,
          item_ids: activeItemIds,
        })

        props.items.forEach((row) => {
          if (row.item_id && stockMap[row.item_id] !== undefined) {
            row.base_stock = parseFloat(stockMap[row.item_id]) || 0
          } else if (row.item_id) {
            row.base_stock = 0
          }
        })
      } catch (err) {
        console.error('فشل في مزامنة الأسطر الحالية مع جرد المستودع الجديد:', err)
      }
    }
  },
)

const updateSqmFromDimensions = (row) => {
  if (!row.is_dimensional) {
    row.total_sqm = null
    return
  }
  let l = parseFloat(row.length) || 0
  let w = parseFloat(row.width) || 0
  const q = parseFloat(row.quantity) || 0
  if (row.dimension_unit === 'cm') {
    l = l / 100
    w = w / 100
  }
  row.total_sqm = l * w * q ? parseFloat((l * w * q).toFixed(2)) : 0
}

const handleSqmInput = (row) => {
  if (typeof row.total_sqm === 'string' && row.total_sqm.endsWith('.')) {
    return
  }

  const sqm = parseFloat(row.total_sqm) || 0
  if (sqm <= 0) {
    row.quantity = 0
    return
  }

  let l = parseFloat(row.length) || 0
  let w = parseFloat(row.width) || 0
  if (l <= 0 || w <= 0) return

  if (row.dimension_unit === 'cm') {
    l = l / 100
    w = w / 100
  }

  const singleItemArea = l * w
  if (singleItemArea > 0) {
    const rawQty = sqm / singleItemArea
    row.quantity = parseFloat(rawQty.toFixed(1))
  }
}

const snapSqmToActual = (row) => {
  const userTypedSqm = parseFloat(row.total_sqm) || 0
  updateSqmFromDimensions(row)

  if (Math.abs((parseFloat(row.total_sqm) || 0) - userTypedSqm) < 0.05) {
    row.total_sqm = userTypedSqm
  }
}

const syncUnitSalePrice = (row) => {
  const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)
  if (matchedUnit) {
    row.unit_price = matchedUnit.price || 0
  }
}
</script>

<template>
  <div class="p-0 bg-transparent space-y-4">
    <div
      class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
    >
      <SmartSearchGrid
        :data="searchableItems"
        :columns="[
          { key: 'id_display', label: 'رقم الصنف', class: 'text-right' },
          { key: 'name', label: 'اسم الصنف التجاري المعتمد', class: 'text-right font-bold' },
          { key: 'price_display', label: 'السعر الافتراضي', class: 'text-center' },
          { key: 'stock_display', label: 'الكمية المتاحة حالياً', class: 'text-center' },
        ]"
        :search-keys="['id', 'name', 'code']"
        placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية للمبيعات..."
        @select="handleGlobalItemSelect"
      />
    </div>

    <p
      v-if="getValidationError('items')"
      class="p-2 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/50"
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
            @change="syncUnitSalePrice(row)"
            :disabled="!row.available_units || row.available_units.length === 0"
            style="color-scheme: dark"
            class="w-full p-1 bg-transparent text-white border border-transparent hover:border-gray-500 focus:border-[#e05e2b] rounded-md text-xs font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right appearance-none"
          >
            <option value="" class="bg-[#16171b] text-gray-400">اختر الوحدة...</option>
            <option
              v-for="u in row.available_units"
              :key="u.id"
              :value="u.id"
              class="bg-[#16171b] text-white"
            >
              {{ u.unit_name || 'وحدة مجهولة' }}
            </option>
          </select>
          <p
            v-if="getValidationError(`items.${index}.item_unit_id`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5"
          >
            الوحدة مطلوبة أو مكررة للسطر
          </p>
        </div>
      </template>

      <template #cell-length="{ row }">
        <div class="w-full flex justify-center items-center">
          <div v-if="row.is_dimensional" class="flex items-center gap-1 w-full">
            <input
              type="text"
              step="0.01"
              min="0"
              v-model.number="row.length"
              @input="updateSqmFromDimensions(row)"
              class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
              placeholder="0.00"
            />
            <select
              v-model="row.dimension_unit"
              @change="updateSqmFromDimensions(row)"
              class="bg-[#16171b] text-white border border-[#3e414c] rounded text-xs p-1 flex-shrink-0"
              style="width: 45px"
            >
              <option value="m">م</option>
              <option value="cm">سم</option>
            </select>
            <span
              v-if="row.length > 50 && row.dimension_unit === 'm'"
              class="text-amber-400 text-[9px] font-bold flex-shrink-0"
            >
              تأكد من الوحدة!
            </span>
          </div>
          <span v-else class="text-gray-500 font-bold text-center block w-full">-</span>
        </div>
      </template>

      <template #cell-width="{ row }">
        <div class="w-full flex justify-center items-center">
          <div v-if="row.is_dimensional" class="flex items-center gap-1 w-full">
            <input
              type="text"
              step="0.01"
              min="0"
              v-model.number="row.width"
              @input="updateSqmFromDimensions(row)"
              class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
              placeholder="0.00"
            />
            <select
              v-model="row.dimension_unit"
              @change="updateSqmFromDimensions(row)"
              class="bg-[#16171b] text-white border border-[#3e414c] rounded text-xs p-1 flex-shrink-0"
              style="width: 45px"
            >
              <option value="m">م</option>
              <option value="cm">سم</option>
            </select>
            <span
              v-if="row.width > 50 && row.dimension_unit === 'm'"
              class="text-amber-400 text-[9px] font-bold flex-shrink-0"
            >
              تأكد من الوحدة!
            </span>
          </div>
          <span v-else class="text-gray-500 font-bold text-center block w-full">-</span>
        </div>
      </template>

      <template #cell-quantity="{ row, index, col }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            v-model="row.quantity"
            @input="updateSqmFromDimensions(row)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-transparent border-none text-white font-bold text-xs focus:outline-none text-center font-mono transition-all focus:bg-[#16171b]/40 focus:rounded"
            placeholder="0"
          />
        </div>
      </template>

      <template #cell-total_sqm="{ row, index, col }">
        <div class="w-full flex justify-center items-center">
          <input
            v-if="row.is_dimensional"
            type="text"
            v-model="row.total_sqm"
            @input="handleSqmInput(row)"
            @blur="snapSqmToActual(row)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="0.00"
          />
          <span v-else class="text-gray-500 font-bold text-center block w-full">-</span>
        </div>
      </template>

      <template #cell-is_designed="{ row }">
        <div class="w-full flex justify-center items-center">
          <input
            type="checkbox"
            v-model="row.is_designed"
            :disabled="!row.is_dimensional"
            class="w-4 h-4 rounded text-[#e05e2b] bg-[#16171b] border-[#3e414c] focus:ring-[#e05e2b] focus:ring-opacity-25 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>
      </template>

      <template #cell-unit_price="{ row }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.unit_price)"
            @input="row.unit_price = unformatNumber($event.target.value)"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="0"
          />
        </div>
      </template>

      <template #cell-grand_total="{ row }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            readonly
            :value="formatNumber(row.grand_total)"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] rounded text-xs text-center font-mono text-white font-bold opacity-90 cursor-default"
            placeholder="0"
          />
        </div>
      </template>
    </InvoiceDetailTable>
  </div>
</template>
