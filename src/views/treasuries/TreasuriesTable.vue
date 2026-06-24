<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="treasuries"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- تفاصيل الخزنة -->
      <template #cell-treasury_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <span class="text-xs text-text-muted font-mono"> ID: #{{ item.id }} </span>
        </div>
      </template>

      <!-- الحساب المالي المرتبط بالشجرة -->
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

      <!-- الرصيد الحالي للخزنة -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[120px]">
          <span class="text-xs text-text-muted mb-0.5">الرصيد الحالي:</span>
          <span
            :class="[
              'font-bold text-sm',
              item.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
            ]"
          >
            {{ formatCurrency(item.current_balance || 0) }}
          </span>
        </div>
      </template>

      <!-- حالة التنشيط -->
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
            {{ item.is_active ? 'نشطة' : 'غير نشطة' }}
          </span>
        </div>
      </template>

      <!-- الإجراءات المتاحة -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <!-- تعديل الخزنة -->
          <button
            v-if="authStore.can('treasury.update')"
            @click.stop="$emit('edit-treasury', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل الخزنة"
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

          <!-- حذف الخزنة -->
          <button
            v-if="authStore.can('treasury.delete')"
            @click.stop="$emit('delete-treasury', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف الخزنة"
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

    <!-- مركب التنقل الرقمي -->
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
  treasuries: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-treasury', 'delete-treasury', 'row-clicked'])

const authStore = useAuthStore()

// بناء وضبط رؤوس الأعمدة للجدول بما يتوافق مع هيكلة ريسورس الخزائن
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'treasury_info', label: 'تفاصيل الخزنة المادية', class: 'min-w-[200px]' },
    { key: 'accounting_info', label: 'الحساب المالي المرتبط بالشجرة' },
    { key: 'financials', label: 'الموقف المالي' },
    { key: 'status', label: 'الحالة' },
  ]

  if (authStore.can('treasury.update') || authStore.can('treasury.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
