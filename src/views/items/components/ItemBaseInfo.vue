<template>
  <AppCard>
    <div class="p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-8">
          <AppInput
            id="item-name"
            label="اسم الصنف / الخدمة التجاري"
            :model-value="props.formState.name"
            @update:model-value="(val) => updateField('name', val)"
            placeholder="ادخل الاسم التجاري بالكامل..."
            required
          />
          <div v-if="validationErrors && validationErrors.name" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.name"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div class="md:col-span-4">
          <label class="block text-xs font-bold text-text-secondary mb-1.5">طبيعة ونوع الصنف</label>
          <div
            class="grid grid-cols-2 gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border"
          >
            <button
              type="button"
              v-for="type in itemTypes"
              :key="type.value"
              @click="updateField('item_type', type.value)"
              :class="[
                'py-1 text-[11px] font-bold rounded transition-all',
                props.formState.item_type === type.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              ]"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <AppInput
            id="profit-margin"
            label="نسبة هامش الربح المستهدف (%)"
            :model-value="props.formState.profit_margin"
            @update:model-value="(val) => updateField('profit_margin', val ? Number(val) : 0)"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
          <div v-if="validationErrors && validationErrors.profit_margin" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.profit_margin"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1">التصنيف الشجري</label>
          <AppDropdown
            id="item-category"
            :model-value="props.formState.category_id"
            @update:model-value="(val) => updateField('category_id', val)"
            :options="categoryOptions"
            placeholder="اختر فئة التصنيف..."
          />
          <div v-if="validationErrors && validationErrors.category_id" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.category_id"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1">
            الوحدة الأساسية الصغرى (قاعدة الجرد)
          </label>
          <AppDropdown
            id="item-base-unit"
            :model-value="props.formState.base_unit_id"
            @update:model-value="(val) => handleBaseUnitChange(val !== null ? Number(val) : null)"
            :options="unitStore.units"
            option-label="name"
            option-value="id"
            placeholder="اختر الوحدة الصغرى..."
            :disabled="isEditMode"
            :show-clear="false"
          />
          <div v-if="validationErrors && validationErrors.base_unit_id" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.base_unit_id"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 pb-2">
          <input
            id="is-dimensional"
            type="checkbox"
            :checked="props.formState.is_dimensional"
            @change="(e) => updateField('is_dimensional', e.target.checked)"
            class="w-4 h-4 rounded bg-surface-ground border-surface-border text-primary focus:ring-primary cursor-pointer"
          />
          <div class="flex flex-col">
            <label for="is-dimensional" class="text-xs font-black text-text-primary cursor-pointer">
              صنف متري (أبعاد ومقاسات)
            </label>
            <span class="text-[10px] text-text-secondary">تفعيل حقول الطول والعرض بالكاشير</span>
          </div>

          <div v-if="validationErrors && validationErrors.is_dimensional" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.is_dimensional"
              :key="i"
              class="text-rose-500 text-[10px] font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { storeToRefs } from 'pinia'

import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const route = useRoute()
const itemStore = useItemStore()
const unitStore = useUnitStore()
const categoryStore = useCategoryStore()

const { validationErrors } = storeToRefs(itemStore)
const isEditMode = computed(() => !!route.params.id)

// تم حذف نوع "خامة" بناءً على طلبك ليبقى المخزني والخدمي فقط
const itemTypes = [
  { value: 'product', label: 'مخزني' },
  { value: 'service', label: 'خدمة' },
]

const categoryOptions = computed(() => {
  return categoryStore.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }))
})

const updateField = (field, value) => {
  emit('clear-error', field)
  emit('update:formState', {
    ...props.formState,
    [field]: value,
  })
}

/**
 * دالة معالجة تغيير الوحدة الأساسية مع تأسيس فئات الأسعار فوراً لمنع الأخطاء الحسابية
 */
const handleBaseUnitChange = (unitId) => {
  emit('clear-error', 'base_unit_id')

  let updatedUnits = []
  if (unitId) {
    // جلب وبناء مصفوفة فئات الأسعار الافتراضية بناءً على القوائم المسجلة بالنظام
    const defaultPrices = itemStore.priceLists.map((pl) => ({
      price_list_id: pl.id,
      price_list_name: pl.name,
      discount_percentage: 0,
      price: 0,
    }))

    updatedUnits = [
      {
        unit_id: unitId,
        conversion_factor: 1,
        cost: 0,
        price: 0,
        barcodes: [],
        prices: defaultPrices,
      },
    ]
  }

  emit('update:formState', {
    ...props.formState,
    base_unit_id: unitId,
    units: updatedUnits,
  })
}
</script>
