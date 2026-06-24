///src\composables\useDynamicDetails.js
import { computed, watch } from 'vue'

/**
 * Composable احترافي ومحايد تماماً لإدارة أسطر العمليات (المخزنية والمالية) ديناميكياً
 * @param {Ref} itemsModel - الـ Model التفاعلي المربوط بأسطر الجدول (defineModel)
 * @param {Array} detailSchema - مصفوفة السكيما لتحديد هيكل الحقول والعمليات الرياضية
 * @param {Object} options - خيارات التحكم بالدمج والتكرار ممررة من الشاشة الأب
 * مثال للمشتريات: { uniqueKeys: ['item_id', 'item_unit_id'], mergeQtyKey: 'quantity' }
 * مثال للقيود: { uniqueKeys: [], mergeQtyKey: null }
 */
export function useDynamicDetails(itemsModel, detailSchema, options = {}) {
  // ضبط الإعدادات الافتراضية في حال عدم تمريرها منعاً لخطأ القراءة
  const config = {
    uniqueKeys: options.uniqueKeys || [],
    mergeQtyKey: options.mergeQtyKey || null,
  }

  // كاش للحقول الحسابية التي تمتلك دالة معادلة (formula) لتسريع الأداء أثناء الفحص
  const calculatedFields = computed(() => {
    return detailSchema.filter(
      (field) => field.type === 'calculated' && typeof field.formula === 'function',
    )
  })

  /**
   * توليد سطر فارغ نظيف ونقي بناءً على هيكل السكيما الممررة
   * @param {Object|null} extractedSource - الكائن المختار (صنف أو حساب) لاستخراج البيانات منه
   */
  const createEmptyRow = (extractedSource = null) => {
    const row = {}

    detailSchema.forEach((field) => {
      // 1. الأولوية المطلقة: استخراج البيانات عبر الدالة المخصصة في السكيما إن وجدت
      if (extractedSource && typeof field.extractFromItem === 'function') {
        row[field.key] = field.extractFromItem(extractedSource)
      }
      // 2. تعيين القيم الافتراضية الذكية حسب نوع الحقل المعرف
      else {
        const isNumeric = ['number', 'currency', 'calculated'].includes(field.type)
        row[field.key] =
          field.defaultValue !== undefined ? field.defaultValue : isNumeric ? null : ''
      }
    })

    // حقل داخلي خاص بالتحكم في وميض السطر عند حدوث دمج (Visual Feedback)
    row._flashing = false

    // تطبيق المعادلات الرياضية فوراً على السطر الجديد لتهيئة القيم الابتدائية
    calculatedFields.value.forEach((field) => {
      row[field.key] = field.formula(row)
    })

    return row
  }

  /**
   * فحص حيادي صارم لفرغ السطر (يستثني حقول التحكم الداخلية)
   */
  const isRowEmpty = (row) => {
    if (!row) return true

    return !Object.keys(row).some((key) => {
      if (key === '_flashing' || key === 'available_units') return false

      const value = row[key]

      // جلب السكيما الخاصة بالحقل الحالي للتحقق من وجود قيمة افتراضية ممررة
      const fieldConfig = detailSchema.find((f) => f.key === key)
      if (
        fieldConfig &&
        fieldConfig.defaultValue !== undefined &&
        value === fieldConfig.defaultValue
      ) {
        return false
      }

      return value !== null && value !== '' && value !== 0 && value !== false
    })
  }

  /**
   * معالجة إدراج العنصر المختار في الجدول مع تطبيق سياسة دمج الكميات المتكررة
   */
  const handleItemSelected = (selectedItem) => {
    if (!selectedItem) return

    const newRowCandidate = createEmptyRow(selectedItem)

    if (config.uniqueKeys.length > 0 && config.mergeQtyKey) {
      const existingRowIndex = itemsModel.value.findIndex((row) => {
        return config.uniqueKeys.every(
          (key) => row[key] !== undefined && row[key] === newRowCandidate[key],
        )
      })

      if (existingRowIndex !== -1) {
        const currentQty = parseFloat(itemsModel.value[existingRowIndex][config.mergeQtyKey]) || 0
        const addedQty = parseFloat(newRowCandidate[config.mergeQtyKey]) || 1

        itemsModel.value[existingRowIndex][config.mergeQtyKey] = currentQty + addedQty
        itemsModel.value[existingRowIndex]._flashing = true

        const targetRow = itemsModel.value[existingRowIndex]
        setTimeout(() => {
          if (targetRow) targetRow._flashing = false
        }, 1000)

        // 👇 الجزء الجديد: تنظيف وإزالة أي سطر فارغ زائد في نهاية الجدول تم إنشاؤه عبر الـ Enter قبل عملية الدمج
        const lastIndex = itemsModel.value.length - 1
        if (lastIndex >= 0 && isRowEmpty(itemsModel.value[lastIndex])) {
          itemsModel.value.splice(lastIndex, 1)
        }

        return
      }
    }

    // 👇 الجزء الجديد: استبدال السطر الأخير إذا كان فارغاً (بسبب ضغط Enter مثلاً)، وإلا إضافة سجل جديد
    const lastRowIndex = itemsModel.value.length - 1
    if (lastRowIndex >= 0 && isRowEmpty(itemsModel.value[lastRowIndex])) {
      itemsModel.value[lastRowIndex] = newRowCandidate
    } else {
      itemsModel.value.push(newRowCandidate)
    }
  }

  /**
   * حذف سطر معين من الجدول مع حماية البنية من الفراغ التام (Fallback)
   */
  const removeRow = (index) => {
    if (itemsModel.value.length > 0) {
      itemsModel.value.splice(index, 1)
    }
  }

  /**
   * حساب إجمالي عمود رقمي معين في الجدول بشكل حيادي وديناميكي كاملاً
   */
  const calculateColumnTotal = (columnKey) => {
    return itemsModel.value.reduce((sum, row) => {
      const value = parseFloat(row[columnKey]) || 0
      return sum + value
    }, 0)
  }

  /**
   * مراقب عميق (Deep Watcher) صارم ومباشر لكائن الـ Ref لتأمين التقاط أي تعديل فرعي فوراً
   */
  watch(
    itemsModel,
    (newItems) => {
      if (!newItems || !Array.isArray(newItems)) return

      newItems.forEach((row) => {
        calculatedFields.value.forEach((field) => {
          const result = field.formula(row)
          const finalValue =
            result !== null && !isNaN(result) ? parseFloat(result.toFixed(4)) : null

          // تحديث القيمة في السطر فقط في حال تباينت فعلياً لمنع الـ Infinite Loop
          if (row[field.key] !== finalValue) {
            row[field.key] = finalValue
          }
        })
      })
    },
    { deep: true, immediate: true },
  )

  return {
    createEmptyRow,
    handleItemSelected,
    removeRow,
    calculateColumnTotal,
    isRowEmpty,
  }
}
