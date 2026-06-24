export const detailSchema = [
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
