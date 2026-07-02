<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="items"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. عمود اسم الصنف والقسم التابع له -->
      <template #cell-item_info="{ item }">
        <div class="flex flex-col gap-0.5 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <span v-if="item.category_name" class="text-xs text-text-muted">
            قسم: {{ item.category_name }}
          </span>
        </div>
      </template>

      <!-- 2. عمود نوع الصنف (نص ملون أنيق بدون أي مربعات) -->
      <template #cell-item_type="{ item }">
        <span :class="getTypeTextClass(item.item_type)" class="text-sm font-semibold tracking-wide">
          {{ getTypeLabel(item.item_type) }}
        </span>
      </template>

      <!-- 3. عمود الوحدة الصغرى (نص صريح ومباشر) -->
      <template #cell-base_unit_info="{ item }">
        <span class="text-sm font-medium text-text-secondary">
          {{ item.base_unit_name || '-' }}
        </span>
      </template>

      <!-- 4. عمود الرصيد المتاح بالمخزن (تنبيه ذكي بدون ضوضاء) -->
      <template #cell-current_stock_info="{ item }">
        <div class="flex items-center gap-1.5" @click.stop>
          <span :class="getStockClass(item)">
            {{ item.current_stock }}
          </span>
          <span class="text-xs text-text-muted font-medium">
            {{ item.base_unit_name }}
          </span>
        </div>
      </template>

      <!-- 5. عمود حد الطلب المخصص (رقم مونو سبيس نظيف) -->
      <template #cell-reorder_level_info="{ item }">
        <span class="text-sm font-bold text-text-secondary font-mono tracking-wider">
          {{ item.reorder_level ?? 0 }}
        </span>
      </template>

      <!-- 6. عمود مصفوفة الوحدات (منسقة بنقاط تفصل بينها بروعة) -->
      <template #cell-matrix_units="{ item }">
        <div
          class="flex flex-wrap items-center gap-x-2 gap-y-1 max-w-md text-xs font-medium text-text-secondary"
        >
          <span
            v-for="(u, index) in item.units"
            :key="u.id"
            :title="`تكلفة: ${formatCurrency(u.cost || 0)} | بيع: ${formatCurrency(u.price || 0)}`"
            class="inline-flex items-center"
          >
            <span>{{ u.unit_name }}</span>
            <span class="text-text-muted text-[10px] font-mono mr-0.5"
              >({{ u.conversion_factor }})</span
            >
            <!-- فاصل نقطي يظهر بين العناصر فقط -->
            <span
              v-if="index < item.units.length - 1"
              class="text-text-muted/40 font-bold mr-2 select-none"
              >•</span
            >
          </span>
          <span v-if="!item.units || item.units.length === 0" class="text-text-muted text-xs"
            >-</span
          >
        </div>
      </template>

      <!-- 7. عمود الحالة الإدارية -->
      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2 py-0.5 text-[11px] font-bold rounded-full border inline-flex items-center gap-1',
            item.is_active
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          ]"
        >
          <span
            :class="['w-1.5 h-1.5 rounded-full', item.is_active ? 'bg-emerald-400' : 'bg-gray-400']"
          ></span>
          {{ item.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </template>

      <!-- 8. عمود الإجراءات والتحكم -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('item.update')"
            @click.stop="$emit('edit-reorder-level', item)"
            class="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
            title="تعيين حد الطلب للمخزن الحالي"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('item.update')"
            @click.stop="$emit('edit-item', item)"
            class="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-all duration-200"
            title="تعديل ومزامنة الصنف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('item.delete')"
            @click.stop="$emit('delete-item', item)"
            class="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
            title="استبعاد وحذف الصنف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  items: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-item', 'delete-item', 'row-clicked', 'edit-reorder-level'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'item_info', label: 'اسم الصنف الاستراتيجي', class: 'min-w-[180px]' },
    { key: 'item_type', label: 'نوع الصنف' },
    { key: 'base_unit_info', label: 'الوحدة الصغرى' },
    { key: 'current_stock_info', label: 'الرصيد المتاح', class: 'font-bold' },
    { key: 'reorder_level_info', label: 'حد الطلب', class: 'font-bold' },
    { key: 'matrix_units', label: 'مصفوفة الوحدات', class: 'max-w-md' },
    { key: 'status', label: 'الحالة' },
  ]

  if (authStore.can('item.update') || authStore.can('item.delete')) {
    headers.push({
      key: 'actions',
      label: 'الإجراءات',
      class: 'text-left min-w-[120px]',
    })
  }
  return headers
})

// محرك تلوين رصيد المخزون: نص عادي ونظيف، ويتحول إلى Badge تحذيري نابض فقط عند الخطر وحالة حد الطلب الحرج
const getStockClass = (item) => {
  if (item.current_stock <= 0) {
    return 'px-2 py-0.5 text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md'
  }
  if (item.current_stock <= (item.reorder_level ?? 0)) {
    return 'px-2 py-0.5 text-sm font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md animate-pulse shadow-sm'
  }
  // الوضع المستقر الطبيعي: نص رقمي منسق بدون أي خلفيات أو ضوضاء
  return 'text-sm font-bold text-emerald-400 font-mono'
}

const getTypeLabel = (type) => {
  const labels = {
    product: 'صنف مخزني',
    service: 'خدمة / صيانة',
    raw_material: 'مادة خام',
  }
  return labels[type] || type
}

// ألوان نصوص حركية مخصصة للثيم الداكن بدون حاويات تملأ الفراغ اللوجستي للجدول
const getTypeTextClass = (type) => {
  const classes = {
    product: 'text-blue-400',
    service: 'text-purple-400',
    raw_material: 'text-amber-400',
  }
  return classes[type] || 'text-text-secondary'
}
</script>
