<!--src\views\sales\SaleForm.vue--->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند المبيعات' : 'فاتورة مبيعات جديدة' }}
        </h1>
      </div>
    </div>

    <div
      v-if="saleStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ saleStore.error }}
    </div>

    <SaleHeader v-model="form" :validation-errors="saleStore.validationErrors" />

    <AppCard>
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
    </AppCard>

    <SaleFooter
      v-model:notes="form.notes"
      v-model:discountAmount="form.discount_amount"
      v-model:taxAmount="form.tax_amount"
      v-model:designerId="form.designer_id"
      v-model:designerMeterPrice="form.designer_meter_price"
      :subtotal="headerSubtotal"
      :grand-total="headerGrandTotal"
      :total-design-area="totalDesignArea"
      :design-commission="form.design_commission"
      :validation-errors="saleStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        مستند المبيعات والمدخلات المالية الحالية تخضع للمراقبة الجردية والتدقيق اللحظي للأرصدة.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" :disabled="saleStore.loading" @click="handleSubmit">
          <span v-if="saleStore.loading">جاري ترحيل حركة المبيعات...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة الفاتورة' : 'ترحيل وإصدار الفاتورة النهائية'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<!--src\views\sales\SaleForm.vue--->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'

import SaleHeader from './components/SaleHeader.vue'
import SaleFooter from './components/SaleFooter.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const saleStore = useSaleStore()
const itemStore = useItemStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  invoice_type: 'sale',
  parent_id: null,
  store_id: '',
  treasury_id: '',
  bank_id: '',
  customer_id: '',
  invoice_date: new Date().toISOString().substr(0, 10),
  payment_type: 'cash',
  discount_amount: 0,
  tax_amount: 0,
  designer_id: '', // [إضافة ماليّة]: معرف المصمم المختار في الفوتر
  designer_meter_price: 0, // [إضافة ماليّة]: سعر المتر المعتمد للتصميم
  design_commission: 0, // [إضافة ماليّة]: إجمالي عمولة المصمم المحسوبة
  sale_type: 'indoor', // [إضافة]
  customer_name_text: null, // [إضافة]
  notes: '',
})

const items = ref([])

// مراقبة طريقة الدفع وإعادة شحن القيم للمستند الجديد أو المستند المعدل دون فقدان الحالة
// مراقبة طريقة الدفع وإعادة شحن القيم للمستند الجديد أو المستند المعدل دون فقدان الحالة
watch(
  () => form.value.payment_type,
  (newType) => {
    if (newType === 'cash') {
      form.value.bank_id = ''
      form.value.treasury_id =
        isEdit.value && saleStore.currentSale?.treasury_id
          ? saleStore.currentSale.treasury_id
          : authStore.user?.treasury_id || ''
    } else if (newType === 'card') {
      form.value.treasury_id = ''
      form.value.bank_id =
        isEdit.value && saleStore.currentSale?.bank_id
          ? saleStore.currentSale.bank_id
          : authStore.user?.bank_id || ''
    } else if (newType === 'credit') {
      form.value.treasury_id = ''
      form.value.bank_id = ''
    }
  },
)

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

const detailSchema = [
  // أعمدة مخفية (بدون label)
  {
    key: 'dimension_unit',
    defaultValue: 'm',
    extractFromItem: () => 'm',
  },
  {
    key: 'item_id',
    extractFromItem: (item) => item.id,
  },
  {
    key: 'is_dimensional',
    extractFromItem: (item) => !!item.is_dimensional,
  },
  {
    key: 'available_units',
    defaultValue: [],
    extractFromItem: (item) => item.units || [],
  },
  {
    key: 'base_stock',
    extractFromItem: (item) => parseFloat(item.current_stock) || 0,
  },

  // أعمدة مرئية بالترتيب الجديد
  {
    key: 'item_id_display',
    label: 'رقم الصنف',
    widthClass: 'w-[6%]',
    readonly: true,
    type: 'text',
    extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
  },
  {
    key: 'item_name',
    label: 'اسم الصنف التجاري المعتمد',
    widthClass: 'w-[20%]',
    readonly: true,
    type: 'text',
    extractFromItem: (item) => item.name || '',
  },
  {
    key: 'length',
    label: 'الطول',
    slot: 'cell-length',
    type: 'number',
    defaultValue: null,
    widthClass: 'w-[12%]',
  },
  {
    key: 'width',
    label: 'العرض',
    slot: 'cell-width',
    type: 'number',
    defaultValue: null,
    widthClass: 'w-[12%]',
  },
  {
    key: 'total_sqm',
    label: 'إجمالي متر مربع',
    type: 'number',
    widthClass: 'w-[6%]',
    slot: 'cell-total_sqm',
  },
  {
    key: 'quantity',
    label: 'العدد',
    type: 'number',
    defaultValue: 1,
    widthClass: 'w-[6%]',
  },
  {
    key: 'unit_price',
    label: 'سعر الوحدة',
    type: 'number',
    defaultValue: 0,
    widthClass: 'w-[8%]',
    extractFromItem: (item) => item.units?.[0]?.price || 0,
    slot: 'cell-unit_price',
  },
  {
    key: 'grand_total',
    label: 'الاجمالى',
    type: 'calculated',
    readonly: true,
    summary: true,
    widthClass: 'w-[13%]',
    formula: (row) => {
      const q = parseFloat(row.quantity) || 0
      const p = parseFloat(row.unit_price) || 0
      if (row.is_dimensional) {
        let l = parseFloat(row.length) || 0
        let w = parseFloat(row.width) || 0
        if (row.dimension_unit === 'cm') {
          l = parseFloat((l / 100).toFixed(6))
          w = parseFloat((w / 100).toFixed(6))
        }
        return parseFloat((l * w * q * p).toFixed(4))
      }
      return parseFloat((q * p).toFixed(4))
    },
    slot: 'cell-grand_total',
  },
  {
    key: 'item_unit_id',
    label: 'وحدة البيع',
    slot: 'cell-item_unit_id',
    widthClass: 'w-[6%]',
    type: 'text',
    extractFromItem: (item) => item.units?.[0]?.id || '',
  },
  {
    key: 'available_stock',
    label: 'المخزون المتاح',
    type: 'calculated',
    readonly: true,
    widthClass: 'w-[6%]',
    formula: (row) => {
      if (row.base_stock === null || row.base_stock === undefined) return 0
      const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)
      const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
      return parseFloat((row.base_stock / factor).toFixed(2))
    },
  },
  {
    key: 'is_designed',
    label: 'تصميم [✓]',
    slot: 'cell-is_designed',
    type: 'boolean',
    defaultValue: false,
    widthClass: 'w-[6%]',
  },
]

const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
  uniqueKeys: ['item_id', 'item_unit_id', 'length', 'width'],
  mergeQtyKey: 'quantity',
})

// [إضافة ماليّة]: حساب إجمالي أمتار التصميم للمقاسات التي تم تعليمها بعلامة الصح فقط
const totalDesignArea = computed(() => {
  return items.value.reduce((sum, row) => {
    if (row.is_dimensional && row.is_designed) {
      const l = parseFloat(row.length) || 0
      const w = parseFloat(row.width) || 0
      const q = parseFloat(row.quantity) || 0
      return sum + l * w * q
    }
    return sum
  }, 0)
})

// [إضافة ماليّة]: مراقبة المساحة وسعر المتر لتوليد قيمة عمولة المصمم لحظياً وبدون ترقيع
watch(
  () => [totalDesignArea.value, form.value.designer_meter_price],
  ([area, price]) => {
    const a = parseFloat(area) || 0
    const p = parseFloat(price) || 0
    form.value.design_commission = parseFloat((a * p).toFixed(2))
  },
)

watch(
  () => form.value.store_id,
  async (newStoreId) => {
    if (!newStoreId) {
      itemStore.items = []
      return
    }

    // [التعديل]: تم حقن معامل الجلب الشامل "all: true" لكسر الترقيم وجلب الـ 100 صنف كاملة دفعة واحدة للمكون المحلي
    await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId, all: true })

    const activeItemIds = items.value.map((row) => row.item_id).filter((id) => id)

    if (activeItemIds.length > 0) {
      try {
        const stockMap = await itemStore.refreshItemsStock({
          store_id: newStoreId,
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
        console.error('فشل في مزامنة الأسطر الحالية مع جرد المستودع الجديد:', err)
      }
    }
  },
)
// 1. حساب المتر المربع بناءً على الأبعاد والقطع (التي قد تحتوي على خانة عشرية واحدة)
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
  // 👇 التعديل هنا: تحويل التقريب إلى خانتين فقط لإخفاء الفروق العشرية المجهرية
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

// 3. مطابقة وتأمين ثبات الرقم عند الخروج من الحقل لضمان المزامنة المطلقة مع الباك إند
const snapSqmToActual = (row) => {
  const userTypedSqm = parseFloat(row.total_sqm) || 0
  updateSqmFromDimensions(row)

  // إذا كان الفرق بين ما كتبته وبين المحسوب مجهرياً، احتفظ برقمك الصحيح كما هو
  if (Math.abs((parseFloat(row.total_sqm) || 0) - userTypedSqm) < 0.05) {
    row.total_sqm = userTypedSqm
  }
}

const handleGlobalItemSelect = (selectedItem) => {
  if (!selectedItem) return
  handleItemSelected(selectedItem)

  // حساب المساحة الابتدائية للسطر المضاف حديثاً
  const lastRow = items.value[items.value.length - 1]
  if (lastRow) {
    updateSqmFromDimensions(lastRow)
  }
}

const triggerAddNewEmptyLine = () => {
  items.value.push(createEmptyRow())
}

const syncUnitSalePrice = (row) => {
  const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)
  if (matchedUnit) {
    row.unit_price = matchedUnit.price || 0
  }
}

const headerSubtotal = computed(() => {
  return items.value.reduce((sum, row) => sum + (parseFloat(row.grand_total) || 0), 0)
})

const headerGrandTotal = computed(() => {
  const sub = headerSubtotal.value
  const disc = parseFloat(form.value.discount_amount) || 0
  const tax = parseFloat(form.value.tax_amount) || 0
  return parseFloat(Math.max(0, sub - disc + tax).toFixed(4))
})

const getValidationError = (path) => {
  return saleStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  if (isEdit.value) {
    await saleStore.fetchSale(route.params.id)
    if (saleStore.currentSale) {
      const cur = saleStore.currentSale

      form.value = {
        invoice_type: cur.invoice_type,
        parent_id: cur.parent_id,
        store_id: cur.store_id || '',
        treasury_id: cur.treasury_id || '',
        bank_id: cur.bank_id || '',
        customer_id: cur.customer_id,
        invoice_date: cur.invoice_date.substr(0, 10),
        payment_type: cur.payment_type,
        discount_amount: cur.discount_amount || 0,
        tax_amount: cur.tax_amount || 0,
        designer_id: cur.designer_id || '', // [إعادة شحن]: جلب معرف المصمم عند التعديل
        designer_meter_price: cur.designer_meter_price || 0, // [إعادة شحن]: جلب سعر المتر عند التعديل
        design_commission: cur.design_commission || 0, // [إعادة شحن]: جلب إجمالي العمولة القديمة عند التعديل
        sale_type: cur.sale_type || 'indoor', // [إضافة]: جلب نوع البيع من الفاتورة
        customer_name_text: cur.customer_name_text || null, // [إضافة]: جلب اسم العميل النصي
        notes: cur.notes || '',
      }

      items.value = cur.items.map((it) => {
        return {
          item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
          item_name: it.item_name || '',
          item_id: it.item_id,
          item_unit_id: it.item_unit_id,
          is_dimensional: !!it.is_dimensional,
          length: it.length,
          width: it.width,
          dimension_unit: 'm', // [إضافة]: ضبط وحدة الأبعاد الافتراضية عند التعديل
          is_designed: !!it.is_designed,
          quantity: it.quantity,
          unit_price: it.unit_price,
          grand_total: it.grand_total,
          available_units: it.available_units || [],
          base_stock: parseFloat(it.current_stock) || 0,
          _flashing: false,
        }
      })

      // أضف هذا السطر مباشرة بعد نهاية تعبئة مصفوفة items.value في التعديل
      items.value.forEach((row) => {
        updateSqmFromDimensions(row)
      })

      if (cur.store_id) {
        await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id })
      }
    }
  } else {
    if (authStore.user) {
      form.value.store_id = authStore.user.store_id || ''
      form.value.treasury_id = authStore.user.treasury_id || ''
      form.value.bank_id = authStore.user.bank_id || ''
      form.value.sale_type = 'indoor' // [إضافة]
      form.value.customer_name_text = null // [إضافة]
    }
  }
})

const handleSubmit = async () => {
  const dynamicItemsPayload = items.value
    .filter((row) => row.item_id && row.item_unit_id)
    .map((row) => {
      let lengthValue = parseFloat(row.length) || null
      let widthValue = parseFloat(row.width) || null

      // تحويل الأبعاد إلى متر إذا كانت الوحدة المختارة هي السنتيمتر
      if (row.is_dimensional && row.dimension_unit === 'cm') {
        if (lengthValue !== null) lengthValue = parseFloat((lengthValue / 100).toFixed(6))
        if (widthValue !== null) widthValue = parseFloat((widthValue / 100).toFixed(6))
      }

      return {
        item_id: row.item_id,
        item_unit_id: row.item_unit_id,
        length: row.is_dimensional ? lengthValue : null,
        width: row.is_dimensional ? widthValue : null,
        is_designed: !!row.is_designed,
        quantity: parseFloat(row.quantity) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        subtotal: parseFloat(row.grand_total) || 0,
        discount_amount: 0,
        grand_total: parseFloat(row.grand_total) || 0,
      }
    })

  const finalPayload = {
    ...form.value,
    subtotal: headerSubtotal.value,
    grand_total: headerGrandTotal.value,
    items: dynamicItemsPayload,
  }

  try {
    if (isEdit.value) {
      await saleStore.updateSale(route.params.id, finalPayload)
      toast.success('تم تحديث ومزامنة مستند المبيعات بنجاح.')
    } else {
      await saleStore.createSale(finalPayload)
      toast.success('تم ترحيل فاتورة المبيعات واقتطاع الأرصدة بنجاح.')
    }
    router.push('/app/sales')
  } catch {
    toast.error('فشلت عملية الحفظ، يرجى التحقق من نواقص الكميات والأخطاء.')
  }
}

const handleCancel = () => {
  router.push('/app/sales')
}

// دوال تنسيق الأرقام بفواصل الآلاف (بدون رمز العملة)
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  const options = {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }
  return new Intl.NumberFormat('en-US', options).format(num)
}

const unformatNumber = (text) => {
  if (!text) return 0
  // إزالة كل شيء ما عدا الأرقام والنقطة
  const cleaned = text.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}
</script>
