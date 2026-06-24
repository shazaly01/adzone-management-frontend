<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="stores"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-store_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <div v-if="item.location" class="flex items-center gap-1 text-xs text-text-muted mt-0.5">
            <svg
              class="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="truncate max-w-[250px]">{{ item.location }}</span>
          </div>
        </div>
      </template>

      <template #cell-accounting_info="{ item }">
        <div class="flex flex-col justify-center">
          <span class="font-medium text-sm text-text-primary">
            {{ item.account?.name || '-' }}
          </span>
          <span v-if="item.account?.code" class="text-xs text-text-muted font-mono">
            كود الحساب: {{ item.account.code }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="flex items-center">
          <span
            :class="[
              'px-2 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1',
              item.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-gray-50 text-gray-600 border-gray-200',
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                item.is_active ? 'bg-emerald-500' : 'bg-gray-400',
              ]"
            ></span>
            {{ item.is_active ? 'نشط' : 'غير نشط' }}
          </span>
        </div>
      </template>

      <template #cell-created_at_info="{ item }">
        <span class="text-sm text-text-secondary font-mono">
          {{ item.created_at || '-' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('store.update')"
            @click.stop="$emit('edit-store', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل المخزن"
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
            v-if="authStore.can('store.delete')"
            @click.stop="$emit('delete-store', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف المخزن"
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

defineProps({
  stores: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-store', 'delete-store', 'row-clicked'])

const authStore = useAuthStore()

// ربط وبناء رؤوس الأعمدة للجدول
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'store_info', label: 'تفاصيل المخزن', class: 'min-w-[220px]' },
    { key: 'accounting_info', label: 'الحساب المالي المرتبط' },
    { key: 'status', label: 'الحالة' },
    { key: 'created_at_info', label: 'تاريخ الإنشاء' },
  ]

  if (authStore.can('store.update') || authStore.can('store.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
