<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="items"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-item_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <div class="flex items-center gap-2 mt-0.5">
            <span
              :class="getTypeBadgeClass(item.item_type)"
              class="px-1.5 py-0.5 text-[10px] font-bold rounded border"
            >
              {{ getTypeLabel(item.item_type) }}
            </span>
            <span v-if="item.category_name" class="text-xs text-text-muted">
              قسم: {{ item.category_name }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-base_unit_info="{ item }">
        <span
          v-if="item.base_unit_name"
          class="text-sm font-semibold text-text-secondary bg-surface-ground px-2 py-1 rounded border border-surface-border"
        >
          {{ item.base_unit_name }}
        </span>
        <span v-else class="text-xs text-text-muted">-</span>
      </template>

      <template #cell-current_stock_info="{ item }">
        <div class="flex items-center gap-1.5">
          <span
            :class="[
              'px-2.5 py-1 text-sm font-bold rounded-lg border inline-flex items-center',
              item.current_stock > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200',
            ]"
          >
            {{ item.current_stock }}
          </span>
          <span class="text-xs text-text-muted font-medium">
            {{ item.base_unit_name }}
          </span>
        </div>
      </template>

      <template #cell-matrix_units="{ item }">
        <div class="flex flex-wrap gap-1 max-w-md">
          <span
            v-for="u in item.units"
            :key="u.id"
            class="text-[11px] bg-surface-section border border-surface-border/80 px-2 py-0.5 rounded text-text-primary font-medium"
            :title="`تكلفة: ${formatCurrency(u.cost || 0)} | بيع: ${formatCurrency(u.price || 0)}`"
          >
            {{ u.unit_name }}
            <span class="text-text-muted text-[10px] font-mono">({{ u.conversion_factor }})</span>
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2 py-0.5 text-[11px] font-bold rounded-full border inline-flex items-center gap-1',
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-gray-50 text-gray-600 border-gray-200',
          ]"
        >
          <span
            :class="['w-1.5 h-1.5 rounded-full', item.is_active ? 'bg-emerald-500' : 'bg-gray-400']"
          ></span>
          {{ item.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('item.update')"
            @click.stop="$emit('edit-item', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
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
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

defineEmits(['page-change', 'edit-item', 'delete-item', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'item_info', label: 'تفاصيل الصنف / الخدمة الاستراتيجية', class: 'min-w-[220px]' },
    { key: 'base_unit_info', label: 'الوحدة الصغرى' },
    { key: 'current_stock_info', label: 'الرصيد المتاح بالمخزن', class: 'font-bold text-primary' },
    { key: 'matrix_units', label: 'المصفوفة الهيكلية للوحدات المتاحة والمعامل', class: 'max-w-md' },
    { key: 'status', label: 'الحالة الإدارية' },
  ]

  if (authStore.can('item.update') || authStore.can('item.delete')) {
    headers.push({
      key: 'actions',
      label: 'إجراءات ونطاق التحكم',
      class: 'text-left min-w-[100px]',
    })
  }
  return headers
})

const getTypeLabel = (type) => {
  const labels = {
    product: 'صنف مخزني',
    service: 'خدمة / صيانة',
    raw_material: 'مادة خام',
  }
  return labels[type] || type
}

const getTypeBadgeClass = (type) => {
  const classes = {
    product:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    service:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    raw_material:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  }
  return classes[type] || 'bg-gray-50 text-gray-700 border-gray-200'
}
</script>
