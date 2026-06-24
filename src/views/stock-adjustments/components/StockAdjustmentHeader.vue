<template>
  <div
    class="p-3 bg-surface-ground/95 rounded-lg border border-primary/40 shadow-[0_0_12px_3px_rgba(30,129,255,0.15)] grid grid-cols-1 md:grid-cols-2 gap-3 text-right items-end transition-all duration-300"
    dir="rtl"
  >
    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">مستودع الجرد والتسوية *</label>
      <select
        v-model="formData.store_id"
        :disabled="isEdit"
        style="color-scheme: dark"
        class="block w-full px-2 py-1.5 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-primary text-xs font-bold outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:ring-1 focus:ring-primary/20"
      >
        <option value="">اختر المستودع المعني بالدورة الجردية...</option>
        <option v-for="store in storeStore.stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <p v-if="getFieldError('store_id')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('store_id') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">تاريخ التقييم الجردي *</label>
      <input
        type="date"
        v-model="formData.adjustment_date"
        class="block w-full px-2 py-1 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-primary text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-primary/20"
      />
      <p v-if="getFieldError('adjustment_date')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('adjustment_date') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStoreStore } from '@/stores/storeStore'

// ارتباط البيانات التفاعلية ثنائية الاتجاه مع الشاشة الأب (StockAdjustmentForm)
const formData = defineModel({ type: Object, required: true })

// استقبال أخطاء السيرفر الممررة من طلب الـ StoreStockAdjustmentRequest
const props = defineProps({
  validationErrors: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const storeStore = useStoreStore()

// دالة استخراج رسائل الخطأ الخاصة بكل حقل
const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  // شحن وتغذية قائمة المستودعات النشطة من الـ API لبناء خيارات الجرد
  await storeStore.fetchStores(1, { is_active: 1 })
})
</script>
