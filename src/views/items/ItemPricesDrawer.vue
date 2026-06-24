<!--src\views\items\ItemPricesDrawer.vue--->
<template>
  <Transition
    enter-active-class="transition ease-in-out duration-300 transform"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition ease-in-out duration-300 transform"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div v-if="modelValue" class="fixed inset-0 overflow-hidden z-50">
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="close"
        ></div>

        <div class="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-0 pr-10">
          <div
            class="pointer-events-auto w-screen max-w-md bg-surface-section shadow-2xl p-6 flex flex-col h-full border-r border-surface-border"
          >
            <div class="flex items-center justify-between border-b border-surface-border pb-4 mb-5">
              <div>
                <h3 class="text-base font-bold text-text-primary">ضبط التفاصيل المتقدمة للوحدة</h3>
                <p class="text-xs text-text-muted mt-0.5">
                  الباركودات المتعددة ومصفوفة فئات الأسعار
                </p>
              </div>
              <button
                @click="close"
                class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-text-secondary">
                  الباركودات المتعددة للوحدة (Tags Input)
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="newBarcode"
                    @keydown.enter.prevent="addBarcodeTag"
                    type="text"
                    placeholder="اكتب الباركود واضغط Enter للتأكيد..."
                    class="block w-full px-3 py-1.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <AppButton type="button" size="sm" @click="addBarcodeTag">إضافة</AppButton>
                </div>

                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span
                    v-for="(bc, bIdx) in localRow.barcodes"
                    :key="bIdx"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-surface-ground text-text-primary font-mono text-[11px] font-bold rounded border border-surface-border"
                  >
                    {{ bc }}
                    <button
                      type="button"
                      @click="removeBarcodeTag(bIdx)"
                      class="text-rose-500 hover:text-rose-700 text-[10px] mr-1"
                    >
                      ✕
                    </button>
                  </span>
                  <p
                    v-if="localRow.barcodes.length === 0"
                    class="text-[11px] text-text-muted italic"
                  >
                    لم يتم إدراج أي باركود مخصص لهذه الوحدة بعد.
                  </p>
                </div>
              </div>

              <hr class="border-surface-border" />

              <div class="space-y-4">
                <h4 class="text-xs font-bold text-text-secondary">
                  مصفوفة الخصومات والأسعار للفئات البيعية
                </h4>

                <div class="space-y-3">
                  <div
                    v-for="(priceRow, pIdx) in localRow.prices"
                    :key="priceRow.price_list_id"
                    class="p-3 bg-surface-ground rounded-lg border border-surface-border flex flex-col gap-2"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-bold text-text-primary">
                        {{ priceRow.price_list_name }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[10px] text-text-muted mb-0.5"
                          >نسبة الخصم المشتقة (%)</label
                        >
                        <input
                          v-model.number="priceRow.discount_percentage"
                          @input="applyDiscountToPrice(pIdx)"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          class="block w-full px-2 py-1 border border-surface-border rounded bg-surface-section text-text-primary text-xs font-mono text-center outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <!-- دمج رمز العملة المركزي هنا لبيان وحدة القياس المالي -->
                        <label class="block text-[10px] text-text-muted mb-0.5"
                          >السعر النهائي للبيع ({{ DEFAULT_CURRENCY }})</label
                        >
                        <input
                          v-model.number="priceRow.price"
                          @input="applyPriceToDiscount(pIdx)"
                          type="number"
                          step="0.01"
                          min="0"
                          class="block w-full px-2 py-1 border border-surface-border rounded bg-surface-section text-text-primary text-xs font-mono text-left outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="itemStore.validationErrors" class="p-3 bg-rose-50 rounded-lg space-y-1">
                <p class="text-rose-600 text-[11px] font-bold">
                  يرجى مراجعة الأخطاء التالية قبل التثبيت:
                </p>
                <template
                  v-for="(errorsArray, fieldKey) in itemStore.validationErrors"
                  :key="fieldKey"
                >
                  <p
                    v-for="(err, i) in errorsArray"
                    :key="i"
                    class="text-rose-500 text-xs font-medium"
                  >
                    • {{ err }}
                  </p>
                </template>
              </div>
            </div>

            <div
              class="border-t border-surface-border pt-4 mt-5 flex justify-end space-x-2 space-x-reverse"
            >
              <AppButton type="button" variant="secondary" size="sm" @click="close"
                >تراجع</AppButton
              >
              <AppButton type="button" size="sm" @click="saveAndSync">تثبيت البيانات</AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { useToast } from 'vue-toastification'
import AppButton from '@/components/ui/AppButton.vue'
// استيراد متحكم العملة المركزي لتوحيد حقول عرض أسعار الفئات المتقدمة
import { DEFAULT_CURRENCY } from '@/utils/formatters'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  unitRow: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue', 'update-row-data'])

const itemStore = useItemStore()
const toast = useToast()
const newBarcode = ref('')

// عزل كائن السطر الحالي في حالة محلية لمنع التعديل المباشر قبل تأكيد المستخدم وحفظه
const localRow = reactive({
  unit_id: null,
  conversion_factor: 1,
  cost: 0,
  price: 0,
  barcodes: [],
  prices: [],
})

onMounted(async () => {
  // [تعديل حرج]: إجبار النظام على جلب فئات الأسعار من السيرفر فوراً إذا كانت مصفوفة الستور فارغة
  if (itemStore.priceLists.length === 0) {
    await itemStore.fetchPriceLists()
  }

  // نقل خصائص السطر الحالي للحالة المحلية
  localRow.unit_id = props.unitRow.unit_id
  localRow.conversion_factor = props.unitRow.conversion_factor
  localRow.cost = props.unitRow.cost
  localRow.price = props.unitRow.price
  localRow.barcodes = [...(props.unitRow.barcodes || [])]

  // بناء مصفوفة الأسعار بناءً على فئات الأسعار المتوفرة بالستور
  const existingPrices = props.unitRow.prices || []
  localRow.prices = itemStore.priceLists.map((pl) => {
    const matchedPrice = existingPrices.find((ep) => ep.price_list_id === pl.id)
    return matchedPrice
      ? { ...matchedPrice, price_list_name: pl.name }
      : {
          price_list_id: pl.id,
          price_list_name: pl.name,
          discount_percentage: 0,
          price: localRow.price, // السعر الافتراضي هو سعر الجمهور الأساسي للسطر
        }
  })
})

const addBarcodeTag = () => {
  const code = newBarcode.value.trim()
  if (!code) return
  if (localRow.barcodes.includes(code)) {
    toast.warning('هذا الباركود مدرج مسبقاً في قائمة التاقات الحالية.')
    return
  }
  localRow.barcodes.push(code)
  newBarcode.value = ''

  // تصفير أخطاء الباك إند عند تعديل المدخلات من قبل المستخدم
  if (itemStore.validationErrors) itemStore.validationErrors = null
}

const removeBarcodeTag = (index) => {
  localRow.barcodes.splice(index, 1)
  if (itemStore.validationErrors) itemStore.validationErrors = null
}

// دالة أتمتة احتساب السعر بناءً على نسبة الخصم المشتقة من سعر الجمهور الأساسي
const applyDiscountToPrice = (index) => {
  const pr = localRow.prices[index]
  if (pr.discount_percentage >= 0 && pr.discount_percentage <= 100) {
    pr.price = Number((localRow.price * (1 - pr.discount_percentage / 100)).toFixed(4))
  }
}

// دالة أتمتة احتساب نسبة الخصم تلقائياً في حال قام العميل بكتابة السعر بيده مباشرة
const applyPriceToDiscount = (index) => {
  const pr = localRow.prices[index]
  if (localRow.price > 0 && pr.price >= 0) {
    const diff = localRow.price - pr.price
    pr.discount_percentage = Number(((diff / localRow.price) * 100).toFixed(2))
  }
}

const saveAndSync = () => {
  // ترحيل البيانات المحلية بالكامل إلى كائن النموذج الأب والموافقة
  emit('update-row-data', { ...localRow })
  toast.success('تم تثبيت بيانات الوحدات والأسعار المتقدمة في السطر.')
  close()
}

const close = () => {
  emit('update:modelValue', false)
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
