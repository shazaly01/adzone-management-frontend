<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="purchases"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-id="{ item }">
        <span class="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">
          #{{ item.id }}
        </span>
      </template>

      <template #cell-invoice_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded border',
                item.invoice_type === 'purchase'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200',
              ]"
            >
              {{ item.invoice_type === 'purchase' ? 'فاتورة شراء' : 'مرتجع مشتريات' }}
            </span>
            <span class="text-xs text-text-muted font-mono">{{ item.invoice_date }}</span>
          </div>
          <span v-if="item.notes" class="text-xs text-text-muted max-w-[200px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <template #cell-entities="{ item }">
        <div class="flex flex-col justify-center">
          <span class="font-bold text-sm text-text-primary">
            المورد: {{ item.supplier?.name || '-' }}
          </span>
          <span class="text-xs text-text-secondary"> المستودع: {{ item.store?.name || '-' }} </span>
        </div>
      </template>

      <template #cell-payment_type="{ item }">
        <span
          :class="[
            'px-2 py-0.5 text-[11px] font-bold rounded-full',
            item.payment_type === 'cash'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100',
          ]"
        >
          {{ item.payment_type === 'cash' ? 'نقدي' : 'آجل / ذمم' }}
        </span>
      </template>

      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[130px]">
          <div class="flex justify-between text-[11px] text-text-muted">
            <span>الصافي:</span>
            <span class="font-mono font-bold text-text-primary">
              {{ formatCurrency(item.grand_total || 0) }}
            </span>
          </div>
          <div
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border/50 pt-0.5"
          >
            <span>الخصم العام:</span>
            <span class="font-mono text-rose-600">{{
              formatCurrency(item.discount_amount || 0)
            }}</span>
          </div>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            @click.stop="$emit('edit-purchase', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل الفاتورة بالكامل"
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
            @click.stop="$emit('delete-purchase', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف وإلغاء المستند ماليًا ومخزنيًا"
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
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  purchases: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-purchase', 'delete-purchase', 'row-clicked'])

// بناء وترتيب رؤوس الجدول لتبسيط الهيكل البصري لفاتورة المشتريات
const tableHeaders = computed(() => [
  { key: 'id', label: 'المعرف المالي' },
  { key: 'invoice_info', label: 'طبيعة وتاريخ السند' },
  { key: 'entities', label: 'الجهات ذات الصلة' },
  { key: 'payment_type', label: 'طريقة السداد' },
  { key: 'financials', label: 'الحساب المالي والتدقيق' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[90px]' },
])
</script>
