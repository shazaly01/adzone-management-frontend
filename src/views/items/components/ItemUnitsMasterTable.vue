<template>
  <AppCard>
    <div class="p-5">
      <div class="flex justify-between items-center border-b border-surface-border pb-2 mb-4">
        <div>
          <h3 class="text-sm font-bold text-text-primary">وحدات القياس المتعددة</h3>
          <p class="text-[11px] text-text-muted mt-0.5">
            اضبط أسطر الوحدات، التكلفة، وسعر الجمهور الأساسي
          </p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!props.formState.base_unit_id"
          @click="addUnitRow"
        >
          + وحدة إضافية
        </AppButton>
      </div>

      <div
        v-if="props.formState.units.length === 0"
        class="text-center py-8 text-text-muted text-xs italic"
      >
        يرجى تحديد الوحدة الأساسية الصغرى أولاً لتأسيس مصفوفة تلقائياً.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(row, index) in props.formState.units"
          :key="index"
          @click="emit('update:activeIndex', index)"
          :class="[
            'p-3 rounded-xl border transition-all cursor-pointer relative group',
            props.activeIndex === index
              ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20'
              : 'bg-surface-ground border-surface-border/60 hover:border-text-muted',
          ]"
        >
          <div
            v-if="props.activeIndex === index"
            class="absolute left-2 top-1/2 -translate-y-1/2 text-primary font-bold text-xs"
          >
            ◀
          </div>

          <div class="grid grid-cols-12 gap-2 items-end pr-1">
            <div class="col-span-3">
              <label class="block text-[10px] font-bold text-text-secondary mb-1">الوحدة</label>
              <AppDropdown
                :id="'unit-dropdown-' + index"
                :model-value="row.unit_id"
                :options="unitStore.units"
                option-label="name"
                option-value="id"
                :disabled="index === 0"
                placeholder="اختر..."
                :show-clear="false"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'unit_id', val !== null ? Number(val) : null)
                "
                @click.stop
              />
            </div>

            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-text-secondary mb-1 text-center"
                >المعامل</label
              >
              <AppInput
                :id="'unit-factor-' + index"
                type="number"
                step="0.0001"
                :model-value="row.conversion_factor"
                :disabled="index === 0"
                input-class="text-center font-bold"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'conversion_factor', Number(val))
                "
                @click.stop
              />
            </div>

            <div class="col-span-3">
              <label class="block text-[10px] font-bold text-text-secondary mb-1 text-right"
                >التكلفة</label
              >
              <AppCurrencyInput
                :id="'unit-cost-' + index"
                :model-value="row.cost"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'cost', val !== null ? Number(val) : 0)
                "
                placeholder="0"
                @click.stop
              />
            </div>

            <div class="col-span-3">
              <label class="block text-[10px] font-bold text-text-secondary mb-1 text-right"
                >سعر الجمهور</label
              >
              <AppCurrencyInput
                :id="'unit-price-' + index"
                :model-value="row.price"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'price', val !== null ? Number(val) : 0)
                "
                placeholder="0"
                @click.stop
              />
            </div>

            <div class="col-span-1 flex justify-center items-center">
              <button
                v-if="index > 0"
                type="button"
                @click.stop="removeUnitRow(index)"
                class="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors mb-2 opacity-0 group-hover:opacity-100 shrink-0"
                title="حذف هذه الوحدة"
              >
                ✕
              </button>
              <div v-else class="h-8 w-1"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="itemStore.validationErrors && itemStore.validationErrors.units"
        class="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-lg"
      >
        <p
          v-for="(err, i) in itemStore.validationErrors.units"
          :key="i"
          class="text-rose-600 dark:text-rose-400 text-xs font-bold"
        >
          {{ err }}
        </p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  formState: { type: Object, required: true },
  activeIndex: { type: Number, required: true },
})

const emit = defineEmits(['update:formState', 'update:activeIndex', 'clear-error'])

const itemStore = useItemStore()
const unitStore = useUnitStore()

/**
 * تعديل الحقول محلياً مع تفعيل المعايرة الحسابية المتقاطعة وتمرير البيانات للأب (Immutability Pattern)
 */
const modifyUnitRowField = (index, field, value) => {
  emit('clear-error', 'units')

  const clonedUnits = props.formState.units.map((unit, idx) => {
    if (idx !== index) return unit

    // إنشاء نسخة جديدة بالكامل للسطر المعدل لحماية التفاعلية
    const updatedUnit = { ...unit, [field]: value }

    // أ) إذا قام العميل بتغيير "التكلفة"
    if (field === 'cost') {
      const margin = props.formState.profit_margin || 0
      const calculatedPrice = Number((value * (1 + margin / 100)).toFixed(4))
      updatedUnit.price = calculatedPrice

      if (updatedUnit.prices && updatedUnit.prices.length > 0) {
        updatedUnit.prices = updatedUnit.prices.map((pr) => ({
          ...pr,
          price: Number((calculatedPrice * (1 - (pr.discount_percentage || 0) / 100)).toFixed(4)),
        }))
      }
    }

    // ب) إذا قام العميل بتعديل "سعر الجمهور" يدوياً
    if (field === 'price') {
      if (updatedUnit.prices && updatedUnit.prices.length > 0) {
        updatedUnit.prices = updatedUnit.prices.map((pr) => ({
          ...pr,
          price: Number((value * (1 - (pr.discount_percentage || 0) / 100)).toFixed(4)),
        }))
      }
    }

    return updatedUnit
  })

  emit('update:formState', { ...props.formState, units: clonedUnits })
}

/**
 * إضافة سطر وحدة إضافية جديد مع تأسيس فئات الأسعار الافتراضية المجلوبة من الستور
 */
const addUnitRow = () => {
  const defaultPrices = itemStore.priceLists.map((pl) => ({
    price_list_id: pl.id,
    price_list_name: pl.name,
    discount_percentage: 0,
    price: 0,
  }))

  const updatedUnits = [
    ...props.formState.units,
    {
      unit_id: null,
      conversion_factor: 1,
      cost: 0,
      price: 0,
      barcodes: [],
      prices: defaultPrices,
    },
  ]

  emit('update:formState', { ...props.formState, units: updatedUnits })
  emit('update:activeIndex', updatedUnits.length - 1)
}

/**
 * حذف سطر وحدة إضافية بأمان مراجع تام وحماية مؤشر التحديد
 */
const removeUnitRow = (index) => {
  const updatedUnits = props.formState.units.filter((_, idx) => idx !== index)

  emit('update:formState', { ...props.formState, units: updatedUnits })

  if (props.activeIndex >= updatedUnits.length) {
    emit('update:activeIndex', updatedUnits.length - 1)
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
