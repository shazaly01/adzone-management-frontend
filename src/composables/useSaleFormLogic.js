import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

export function useSaleFormLogic() {
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
    designer_id: '',
    designer_meter_price: 0,
    design_commission: 0,
    sale_type: 'indoor',
    customer_name_text: null,
    notes: '',
  })

  const items = ref([])

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

  // ربط useDynamicDetails بالـ ref الأصلي للحفاظ على السيطرة ومنع الـ Mutation
  const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
    uniqueKeys: ['item_id', 'item_unit_id', 'length', 'width'],
    mergeQtyKey: 'quantity',
  })

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    handleItemSelected(selectedItem)

    const lastRow = items.value[items.value.length - 1]
    if (lastRow) {
      if (!lastRow.is_dimensional) {
        lastRow.total_sqm = null
        return
      }
      let l = parseFloat(lastRow.length) || 0
      let w = parseFloat(lastRow.width) || 0
      const q = parseFloat(lastRow.quantity) || 0
      if (lastRow.dimension_unit === 'cm') {
        l = l / 100
        w = w / 100
      }
      lastRow.total_sqm = l * w * q ? parseFloat((l * w * q).toFixed(2)) : 0
    }
  }

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
          designer_id: cur.designer_id || '',
          designer_meter_price: cur.designer_meter_price || 0,
          design_commission: cur.design_commission || 0,
          sale_type: cur.sale_type || 'indoor',
          customer_name_text: cur.customer_name_text || null,
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
            dimension_unit: 'm',
            is_designed: !!it.is_designed,
            quantity: it.quantity,
            unit_price: it.unit_price,
            grand_total: it.grand_total,
            available_units: it.available_units || [],
            base_stock: parseFloat(it.current_stock) || 0,
            _flashing: false,
          }
        })

        items.value.forEach((row) => {
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
        })

        if (cur.store_id) {
          await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })
        }
      }
    } else {
      if (authStore.user) {
        form.value.store_id = authStore.user.store_id || ''
        form.value.treasury_id = authStore.user.treasury_id || ''
        form.value.bank_id = authStore.user.bank_id || ''
        form.value.sale_type = 'indoor'
        form.value.customer_name_text = null
      }
    }
  })

  const handleSubmit = async () => {
    const dynamicItemsPayload = items.value
      .filter((row) => row.item_id && row.item_unit_id)
      .map((row) => {
        let lengthValue = parseFloat(row.length) || null
        let widthValue = parseFloat(row.width) || null

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
    const cleaned = text.replace(/[^0-9.]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  return {
    isEdit,
    form,
    items,
    detailSchema,
    visibleTableSchema,
    totalDesignArea,
    headerSubtotal,
    headerGrandTotal,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    saleStore,
    itemStore,
  }
}
