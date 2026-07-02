<!-- src/views/dashboard/components/DashboardFilters.vue -->
<template>
  <div
    class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-auto bg-surface-section/50 p-3 rounded-xl border border-surface-border/80 backdrop-blur-md shadow-inner"
  >
    <!-- مدخل التاريخ: من تاريخ -->
    <div class="w-full sm:w-40 md:w-44">
      <label class="block text-xs font-bold text-text-muted mb-1.5 pr-1 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        من تاريخ
      </label>
      <AppInput
        id="from_date"
        type="date"
        v-model="filters.from_date"
        :disabled="loading"
        class="w-full text-sm text-text-primary focus:border-primary/50 transition-colors"
      />
    </div>

    <!-- مدخل التاريخ: إلى تاريخ -->
    <div class="w-full sm:w-40 md:w-44">
      <label class="block text-xs font-bold text-text-muted mb-1.5 pr-1 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        إلى تاريخ
      </label>
      <AppInput
        id="to_date"
        type="date"
        v-model="filters.to_date"
        :disabled="loading"
        class="w-full text-sm text-text-primary focus:border-primary/50 transition-colors"
      />
    </div>

    <!-- زر تحديث وفلترة البيانات اللحظية -->
    <button
      @click="emitFilter"
      :disabled="loading"
      class="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-primary/30 border border-primary/20 mt-2 sm:mt-0"
    >
      <!-- مؤشر التحميل الدوار اللطيف -->
      <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <!-- أيقونة التصفية عند استقرار الحالة -->
      <svg
        v-else
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        ></path>
      </svg>

      <span class="whitespace-nowrap">تحديث البيانات</span>
    </button>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'

// استقبال حالة التحميل من الشاشة الأم لحظر المدخلات أثناء الطلب النشط
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

// إعلان الحدث المخصص لرفع قيم التصفية للأم
const emit = defineEmits(['filter'])

// المتغيرات المحلية لمراقبة مدخلات التواريخ
const filters = ref({
  from_date: '',
  to_date: '',
})

/**
 * تمرير الفلاتر المختارة ديناميكياً للـ Orchestrator لإعادة جلب البيانات
 */
const emitFilter = () => {
  emit('filter', { ...filters.value })
}
</script>
