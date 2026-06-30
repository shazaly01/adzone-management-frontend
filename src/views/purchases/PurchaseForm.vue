<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند المشتريات' : 'فاتورة مشتريات جديدة' }}
        </h1>
      </div>
    </div>

    <div
      v-if="purchaseStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ purchaseStore.error }}
    </div>

    <PurchaseHeader v-model="form" :validation-errors="purchaseStore.validationErrors" />

    <AppCard>
      <div class="p-3 space-y-3">
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
            placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية..."
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
                @change="syncUnitCostPrice(row)"
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
        </InvoiceDetailTable>
      </div>
    </AppCard>

    <PurchaseFooter
      v-model:notes="form.notes"
      v-model:discountAmount="form.discount_amount"
      v-model:taxAmount="form.tax_amount"
      :subtotal="headerSubtotal"
      :grand-total="headerGrandTotal"
      :validation-errors="purchaseStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        مستند المشتريات والمدخلات المالية الحالية تخضع للمراقبة الجردية والتدقيق اللحظي للأرصدة.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" :disabled="purchaseStore.loading" @click="handleSubmit">
          <span v-if="purchaseStore.loading">جاري حفظ المستند الحالي...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة الفاتورة' : 'ترحيل وحفظ الفاتورة النهائية'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchaseStore'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'

import PurchaseHeader from './components/PurchaseHeader.vue'
import PurchaseFooter from './components/PurchaseFooter.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const purchaseStore = usePurchaseStore()
const itemStore = useItemStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const isHydrating = ref(false)

// كائن البيانات مع إضافة الحسابات المالية المفقودة (treasury_id و bank_id)
const form = ref({
  invoice_type: 'purchase',
  parent_id: null,
  store_id: '',
  treasury_id: '',
  bank_id: '',
  supplier_id: '',
  invoice_date: new Date().toISOString().substr(0, 10),
  payment_type: 'cash',
  discount_amount: 0,
  tax_amount: 0,
  notes: '',
})

const items = ref([])

// مصفوفة التكوين الحسابي لجدول الأصناف مدمجة بالكامل بدون تقسيم
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
    widthClass: 'w-1/3',
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
    label: 'وحدة التعبئة',
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
    key: 'available_stock',
    label: 'المخزون الحالي',
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
    key: 'quantity',
    label: 'الكمية',
    type: 'number',
    defaultValue: 1,
    widthClass: 'w-1/12',
  },
  {
    key: 'unit_cost',
    label: 'تكلفة الوحدة',
    type: 'number',
    defaultValue: 0,
    widthClass: 'w-1/8',
    extractFromItem: (item) => item.units?.[0]?.cost || 0,
  },
  {
    key: 'grand_total',
    label: 'الاجمالى',
    type: 'calculated',
    readonly: true,
    summary: true,
    formula: (row) => {
      const q = parseFloat(row.quantity) || 0
      const c = parseFloat(row.unit_cost) || 0
      return parseFloat((q * c).toFixed(4))
    },
  },
]

// محرك مراقبة طريقة الدفع الديناميكي لمنع اختفاء أو تصفير بيانات الحسابات النقدية والبنكية
watch(
  () => form.value.payment_type,
  (newType) => {
    if (newType === 'cash') {
      form.value.bank_id = ''
      form.value.treasury_id =
        isEdit.value && purchaseStore.currentPurchase?.treasury_id
          ? purchaseStore.currentPurchase.treasury_id
          : authStore.user?.treasury_id || ''
    } else if (newType === 'card') {
      form.value.treasury_id = ''
      form.value.bank_id =
        isEdit.value && purchaseStore.currentPurchase?.bank_id
          ? purchaseStore.currentPurchase.bank_id
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

const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
  uniqueKeys: ['item_id', 'item_unit_id'],
  mergeQtyKey: 'quantity',
})

// مراقب تغيير مستودع الاستلام لتحديث جرد لوحة البحث والأسطر الحالية فوراً
watch(
  () => form.value.store_id,
  async (newStoreId) => {
    if (isHydrating.value) return
    if (!newStoreId) {
      itemStore.items = []
      return
    }

    // [التعديل]: تم دمج معامل "all: true" لضمان جلب كافة الـ 100 صنف دفعة واحدة عند تغيير المخزن
    await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId, all: true })

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
        console.error('فشل في مزامنة أرصدة الأسطر مع المستودع الجديد:', err)
      }
    }
  },
)

const handleGlobalItemSelect = (selectedItem) => {
  if (!selectedItem) return
  handleItemSelected(selectedItem)
}

const triggerAddNewEmptyLine = () => {
  items.value.push(createEmptyRow())
}

const syncUnitCostPrice = (row) => {
  const matchedUnit = row.available_units?.find((u) => String(u.id) === String(row.item_unit_id))
  if (matchedUnit) {
    row.unit_cost = matchedUnit.cost || 0
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
  return purchaseStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  if (isEdit.value) {
    isHydrating.value = true
    await purchaseStore.fetchPurchase(route.params.id)
    if (purchaseStore.currentPurchase) {
      const cur = purchaseStore.currentPurchase

      // 1. شحن سطور مستند المشتريات المسترجع من السيرفر
      items.value = cur.items.map((it) => {
        return {
          item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
          item_name: it.item_name || '',
          item_id: it.item_id,
          item_unit_id: it.item_unit_id,
          quantity: it.quantity,
          unit_cost: it.unit_cost,
          grand_total: it.grand_total,
          available_units: it.available_units || [],
          base_stock: parseFloat(it.current_stock) || 0,
          available_stock: 0,
          _flashing: false,
        }
      })

      // 2. ترطيب وشحن بيانات رأس الفاتورة بالكامل
      form.value = {
        invoice_type: cur.invoice_type,
        parent_id: cur.parent_id,
        store_id: cur.store_id || '',
        treasury_id: cur.treasury_id || '',
        bank_id: cur.bank_id || '',
        supplier_id: cur.supplier_id,
        invoice_date: cur.invoice_date.substr(0, 10),
        payment_type: cur.payment_type,
        discount_amount: cur.discount_amount || 0,
        tax_amount: cur.tax_amount || 0,
        notes: cur.notes || '',
      }

      // 3. شحن لوحة البحث بناءً على مستودع الفاتورة المعدلة
      if (cur.store_id) {
        // [التعديل]: إضافة معامل الجلب الشامل "all: true" لضمان تحميل الـ 100 صنف كاملة عند تعديل الفاتورة
        await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })
      }
    }
    isHydrating.value = false
  } else {
    // التعبئة التلقائية الذكية للمستند الجديد بناءً على صلاحيات المستخدم الحالية
    if (authStore.user) {
      form.value.store_id = authStore.user.store_id || ''
      form.value.treasury_id = authStore.user.treasury_id || ''
      form.value.bank_id = authStore.user.bank_id || ''
    }
  }
})

const handleSubmit = async () => {
  const dynamicItemsPayload = items.value
    .filter((row) => row.item_id && row.item_unit_id)
    .map((row) => ({
      item_id: row.item_id,
      item_unit_id: row.item_unit_id,
      quantity: parseFloat(row.quantity) || 0,
      unit_cost: parseFloat(row.unit_cost) || 0,
      subtotal: parseFloat(row.grand_total) || 0,
      discount_amount: 0,
      grand_total: parseFloat(row.grand_total) || 0,
    }))

  const finalPayload = {
    ...form.value,
    subtotal: headerSubtotal.value,
    grand_total: headerGrandTotal.value,
    items: dynamicItemsPayload,
  }

  try {
    if (isEdit.value) {
      await purchaseStore.updatePurchase(route.params.id, finalPayload)
      toast.success('تم تحديث ومزامنة مستند المشتريات بنجاح.')
    } else {
      await purchaseStore.createPurchase(finalPayload)
      toast.success('تم ترحيل الفاتورة وضخ الأرصدة بالمستودعات بنجاح.')
    }
    router.push('/app/purchases')
  } catch {
    toast.error('فشلت عملية الحفظ، يرجى التحقق من أخطاء بنود الإدخال.')
  }
}

const handleCancel = () => {
  router.push('/app/purchases')
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
