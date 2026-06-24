<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="customers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-customer_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>

          <div v-if="item.phone" class="flex items-center gap-1 text-xs text-text-muted mt-0.5">
            <svg
              class="w-3.5 h-3.5 text-text-muted flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span class="font-mono">{{ item.phone }}</span>
          </div>

          <div v-if="item.email" class="flex items-center gap-1 text-[11px] text-text-muted">
            <svg
              class="w-3.5 h-3.5 text-text-muted flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
              />
            </svg>
            <span class="truncate max-w-[180px] font-mono">{{ item.email }}</span>
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

      <template #cell-financials="{ item }">
        <div class="flex flex-col gap-1.5 text-sm min-w-[140px]">
          <div
            class="flex justify-between items-center gap-2 border-b border-surface-border/50 pb-1"
          >
            <span class="text-[11px] text-text-muted">الحد الائتماني:</span>
            <span class="font-medium text-text-primary">
              {{ item.credit_limit ? formatCurrency(item.credit_limit) : 'غير محدد' }}
            </span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="text-[11px] text-text-muted">الرصيد الفعلي:</span>
            <span
              :class="[
                'font-bold',
                item.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
              ]"
            >
              {{ formatCurrency(item.current_balance || 0) }}
            </span>
          </div>
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

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('customer.update')"
            @click.stop="$emit('edit-customer', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل العميل"
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
            v-if="authStore.can('customer.delete')"
            @click.stop="$emit('delete-customer', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف العميل"
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
  customers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-customer', 'delete-customer', 'row-clicked'])

const authStore = useAuthStore()

// بناء وضبط رؤوس الأعمدة المتجاوبة بما يتطابق تماماً مع بيانات ريسورس العميل القادمة
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'customer_info', label: 'تفاصيل بيانات العميل', class: 'min-w-[220px]' },
    { key: 'accounting_info', label: 'الحساب المالي المرتبط بالشجرة' },
    { key: 'financials', label: 'الموقف المالي والائتماني', class: 'min-w-[160px]' },
    { key: 'status', label: 'الحالة الإدارية' },
  ]

  if (authStore.can('customer.update') || authStore.can('customer.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
