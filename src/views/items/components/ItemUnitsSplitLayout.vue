<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <div class="lg:col-span-7">
      <ItemUnitsMasterTable
        :form-state="props.formState"
        :active-index="activeUnitIndex"
        @update:active-index="(val) => (activeUnitIndex = val)"
        @update:form-state="(payload) => emit('update:formState', payload)"
        @clear-error="(field) => emit('clear-error', field)"
      />
    </div>

    <div class="lg:col-span-5">
      <AppCard class="min-h-[380px]">
        <div v-if="activeUnitRow" class="p-5 space-y-6">
          <div class="border-b border-surface-border pb-3">
            <h3 class="text-sm font-bold text-primary">
              التفاصيل المتقدمة لوحدة:
              <span class="text-text-primary font-black">[{{ activeUnitName }}]</span>
            </h3>
            <p class="text-[11px] text-text-muted mt-0.5">
              إدارة الباركودات المتعددة ومصفوفة فئات الأسعار والخصومات المشتقة
            </p>
          </div>

          <ItemUnitBarcodes
            :model-value="activeUnitRow.barcodes"
            @update:model-value="
              (updatedBarcodes) => updateActiveUnitSubArray('barcodes', updatedBarcodes)
            "
          />

          <hr class="border-surface-border/60" />

          <ItemUnitPricesGrid
            :prices="activeUnitRow.prices"
            :base-price="activeUnitRow.price"
            @update:prices="(updatedPrices) => updateActiveUnitSubArray('prices', updatedPrices)"
          />
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center text-center p-12 min-h-[380px] text-text-muted"
        >
          <span class="text-2xl mb-2">📐</span>
          <p class="text-xs">
            يرجى تحديد أو النقر على أحد أسطر الوحدات من الجانب الأيمن لعرض تفاصيلها المتقدمة.
          </p>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUnitStore } from '@/stores/unitStore'
import AppCard from '@/components/ui/AppCard.vue'
import ItemUnitsMasterTable from './ItemUnitsMasterTable.vue'
import ItemUnitBarcodes from './ItemUnitBarcodes.vue'
import ItemUnitPricesGrid from './ItemUnitPricesGrid.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const unitStore = useUnitStore()
const activeUnitIndex = ref(0) // الوحدة الصغرى تكون نشطة افتراضياً

// جلب بيانات السطر النشط حالياً من الماستر يميناً بأمان
const activeUnitRow = computed(() => {
  if (props.formState.units && props.formState.units[activeUnitIndex.value]) {
    return props.formState.units[activeUnitIndex.value]
  }
  return null
})

// جلب اسم الوحدة النشطة حالياً للرندر البصري في ترويسة التفاصيل
const activeUnitName = computed(() => {
  if (!activeUnitRow.value) return ''
  const unitObj = unitStore.units.find((u) => u.id === activeUnitRow.value.unit_id)
  return unitObj ? unitObj.name : 'غير محددة'
})

/**
 * تحديث المصفوفات الفرعية للوحدة النشطة (الباركود أو فئات الأسعار)
 * وتمرير كائن النموذج الكامل للأب مع حماية روابط التفاعلية بالذاكرة
 */
const updateActiveUnitSubArray = (key, updatedArray) => {
  const clonedUnits = props.formState.units.map((unit, idx) => {
    if (idx === activeUnitIndex.value) {
      return {
        ...unit,
        [key]: [...updatedArray],
      }
    }
    return unit
  })

  emit('update:formState', {
    ...props.formState,
    units: clonedUnits,
  })
}
</script>
