<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="journalEntries"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-id="{ item }">
        <span
          class="font-mono font-bold text-text-muted bg-surface-ground px-2 py-1 rounded border border-surface-border/50"
        >
          #{{ item.id }}
        </span>
      </template>

      <template #cell-entry_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded border',
                item.type === 'journal'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : item.type === 'receipt'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200',
              ]"
            >
              {{
                item.type === 'journal'
                  ? 'قيد يومية'
                  : item.type === 'receipt'
                    ? 'سند قبض'
                    : 'سند صرف'
              }}
            </span>
            <span class="text-xs text-text-primary font-mono font-black">{{
              item.entry_number
            }}</span>
          </div>
          <span class="text-[11px] text-text-muted font-mono">{{ item.entry_date }}</span>
        </div>
      </template>

      <template #cell-notes="{ item }">
        <span v-if="item.notes" class="text-xs text-text-secondary max-w-[300px] truncate block">
          {{ item.notes }}
        </span>
        <span v-else class="text-xs text-text-muted/60 font-medium italic"
          >لا يوجد بيان عام...</span
        >
      </template>

      <template #cell-user="{ item }">
        <div class="flex flex-col justify-center">
          <span class="font-bold text-xs text-text-primary">
            {{ item.user?.name || 'النظام التلقائي' }}
          </span>
          <span class="text-[10px] text-text-muted">المسؤول عن المستند</span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            @click.stop="$emit('edit-journal-entry', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل السند المالي"
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
            @click.stop="$emit('delete-journal-entry', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="إلغاء وحذف السند المالي"
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

defineProps({
  journalEntries: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-journal-entry', 'delete-journal-entry', 'row-clicked'])

// بناء وترتيب أعمدة القيود المالية لتتوافق مع هيكل المحاسبة العام
const tableHeaders = computed(() => [
  { key: 'id', label: 'المعرف الرقمي' },
  { key: 'entry_info', label: 'تفاصيل وطبيعة السند المالي' },
  { key: 'notes', label: 'البيان التوضيحي العام' },
  { key: 'user', label: 'المدقق المالي' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[90px]' },
])
</script>
