<!--src\views\items\ItemForm.vue--->
<template>
  <div class="max-w-7xl mx-auto pb-12">
    <div class="mb-5">
      <h1 class="text-xl font-black text-text-primary">
        {{ isEditMode ? 'تعديل بيانات الصنف ومصفوفته السعرية' : 'إضافة صنف استراتيجي جديد' }}
      </h1>
      <p class="text-[11px] text-text-muted mt-0.5">
        نافذة الإدخال الفوري المتكامل للأصناف والباركودات المتعددة للقطاعات الكثيفة
      </p>
    </div>

    <div class="space-y-4">
      <ItemBaseInfo
        :form-state="form"
        @update:form-state="handleFormStateUpdate"
        @clear-error="clearBackendError"
      />

      <ItemUnitsSplitLayout
        :form-state="form"
        @update:form-state="handleFormStateUpdate"
        @clear-error="clearBackendError"
      />

      <div class="flex justify-end space-x-3 space-x-reverse pt-2">
        <AppButton variant="secondary" size="sm" @click="goBack">إلغاء التدوين</AppButton>
        <AppButton :disabled="loading" size="sm" @click="submitForm">
          {{ loading ? 'جاري التثبيت والتدوين الآن...' : 'حفظ الصنف والمصفوفة كاملة' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import ItemBaseInfo from './components/ItemBaseInfo.vue'
import ItemUnitsSplitLayout from './components/ItemUnitsSplitLayout.vue'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const unitStore = useUnitStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const isEditMode = computed(() => !!route.params.id)
const loading = computed(() => itemStore.loading)

const form = reactive({
  name: '',
  item_type: 'product',
  profit_margin: 0,
  category_id: null,
  category_path: '',
  base_unit_id: null,
  is_active: true,
  is_dimensional: false,
  units: [],
})

onMounted(async () => {
  itemStore.validationErrors = null

  await unitStore.fetchUnits(1, { is_active: 1 })
  await itemStore.fetchPriceLists()

  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories(1)
  }

  if (isEditMode.value) {
    await itemStore.fetchItem(route.params.id)
    if (itemStore.currentItem) {
      const rawItem = itemStore.currentItem

      form.name = rawItem.name
      form.item_type = rawItem.item_type
      form.profit_margin = rawItem.profit_margin
      form.category_id = rawItem.category_id
      form.category_path = rawItem.category_path
      form.base_unit_id = rawItem.base_unit_id
      form.is_active = !!rawItem.is_active
      form.is_dimensional = !!rawItem.is_dimensional

      form.units = (rawItem.units || []).map((unit) => {
        return {
          unit_id: unit.unit_id,
          conversion_factor: unit.conversion_factor,
          cost: unit.cost,
          price: unit.price,
          barcodes: (unit.barcodes || []).map((b) => (typeof b === 'object' ? b.barcode : b)),
          prices: (unit.prices || []).map((p) => ({
            price_list_id: p.price_list_id,
            discount_percentage: p.discount_percentage,
            price: p.price,
          })),
        }
      })
    }
  }
})

const handleFormStateUpdate = (updatedState) => {
  Object.assign(form, updatedState)
}

const clearBackendError = (field) => {
  if (itemStore.validationErrors && itemStore.validationErrors[field]) {
    delete itemStore.validationErrors[field]
  }
}

const preparePayload = () => {
  return {
    name: form.name,
    item_type: form.item_type,
    profit_margin: form.profit_margin,
    category_id: form.category_id,
    category_path: form.category_path,
    base_unit_id: form.base_unit_id,
    is_active: form.is_active ? 1 : 0,
    is_dimensional: form.is_dimensional ? 1 : 0,
    units: form.units.map((unit) => ({
      unit_id: unit.unit_id,
      conversion_factor: Number(unit.conversion_factor),
      cost: Number(unit.cost),
      price: Number(unit.price),
      barcodes: unit.barcodes.map((b) => (typeof b === 'object' ? b.barcode : String(b).trim())),
      prices: unit.prices.map((p) => ({
        price_list_id: p.price_list_id,
        discount_percentage: Number(p.discount_percentage || 0),
        price: Number(p.price),
      })),
    })),
  }
}

const submitForm = async () => {
  if (!form.name || !form.base_unit_id || form.units.length === 0) {
    toast.error('يرجى ملء كافة الحقول الإلزامية وتأمين وحدة قياس واحدة على الأقل بالجدول.')
    return
  }

  const payload = preparePayload()

  try {
    if (isEditMode.value) {
      await itemStore.updateItem(route.params.id, payload)
      toast.success('تمت مزامنة بيانات الصنف وتحديث مصفوفته السعرية التاريخية بنجاح.')
    } else {
      await itemStore.createItem(payload)
      toast.success('تم تسجيل الصنف الجديد ومصفوفة باركوداته وأسعاره بنجاح.')
    }
    goBack()
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(itemStore.error || 'فشلت معالجة الطلب بسبب خطأ داخلي غير متوقع بالبيانات.')
    }
  }
}

const goBack = () => {
  itemStore.validationErrors = null
  router.push('/app/items')
}
</script>
