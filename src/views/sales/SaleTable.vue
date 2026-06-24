<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="sales"
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
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded border',
                item.invoice_type === 'sale'
                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-950/50 text-rose-400 border-rose-500/30',
              ]"
            >
              {{ item.invoice_type === 'sale' ? 'فاتورة مبيعات' : 'مردودات مبيعات' }}
            </span>
            <span class="text-xs text-text-muted font-mono">{{
              item.invoice_date.substr(0, 10)
            }}</span>
          </div>
          <span v-if="item.notes" class="text-xs text-text-muted max-w-[200px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <template #cell-entities="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            العميل: {{ item.customer_name || item.customer?.name || '-' }}
          </span>
          <span class="text-[11px] text-text-secondary mt-0.5">
            المستودع: {{ item.store_name || item.store?.name || '-' }}
          </span>
        </div>
      </template>

      <template #cell-payment_type="{ item }">
        <span
          :class="[
            'px-2 py-0.5 text-[10px] font-black rounded-full border',
            item.payment_type === 'cash'
              ? 'bg-blue-950/40 text-blue-400 border-blue-500/20'
              : item.payment_type === 'card'
                ? 'bg-purple-950/40 text-purple-400 border-purple-500/20'
                : 'bg-amber-950/40 text-amber-400 border-amber-500/20',
          ]"
        >
          {{
            item.payment_type === 'cash'
              ? 'نقدي'
              : item.payment_type === 'card'
                ? 'بنكى'
                : 'آجل / ذمم'
          }}
        </span>
      </template>

      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[130px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-muted">
            <span>الصافي الفعلي:</span>
            <span class="font-mono font-bold text-emerald-400">
              {{ formatCurrency(item.grand_total || 0) }}
            </span>
          </div>
          <div
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border/50 pt-0.5"
          >
            <span>الخصم الممنوح:</span>
            <span class="font-mono text-rose-500 font-bold">
              {{ formatCurrency(item.discount_amount || 0) }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            @click="$emit('print-sale', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="طباعة الفاتورة للعميل A4"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <button
            @click="$emit('edit-sale', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
            title="تعديل الفاتورة بالكامل"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            @click="$emit('delete-sale', item)"
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="إلغاء وحذف المستند ماليًا ومخزنيًا"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  sales: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

// تم حقن 'print-sale' رسمياً داخل قائمة الـ Emits
defineEmits(['page-change', 'edit-sale', 'delete-sale', 'row-clicked', 'print-sale'])

const tableHeaders = computed(() => [
  { key: 'id', label: 'المعرف المالي' },
  { key: 'invoice_info', label: 'طبيعة وتاريخ السند' },
  { key: 'entities', label: 'الجهات ذات الصلة' },
  { key: 'payment_type', label: 'طريقة الدفع' },
  { key: 'financials', label: 'الحساب المالي والتدقيق' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[90px]' },
])
</script>
