<!--src\components\ui\dynamic-invoice\InvoiceMainTable.vue--->
<template>
  <div class="space-y-6">
    <AppCard>
      <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">بحث سريع</h3>
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              v-model="searchModel"
              type="text"
              placeholder="ابحث هنا..."
              class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            />
          </div>
        </div>
      </div>
    </AppCard>

    <AppCard>
      <AppTable :headers="headers" :items="items" :is-loading="loading">
        <template
          v-for="field in fields"
          :key="`main-cell-${field.key}`"
          #[`cell-${field.key}`]="{ item }"
        >
          <span v-if="field.type === 'currency'" class="font-bold text-emerald-600">
            {{ formatCurrency(item[field.key]) }}
          </span>
          <span v-else-if="field.type === 'date'" class="text-text-secondary text-sm">
            {{ formatDate(item[field.key]) }}
          </span>
          <span v-else class="text-text-primary font-medium">
            {{ item[field.key] }}
          </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-center space-x-3 space-x-reverse">
            <button
              @click.stop="emit('edit', item)"
              class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              title="تعديل"
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
              @click.stop="emit('delete', item)"
              class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="حذف"
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

      <AppPagination :meta="pagination" @page-change="emit('page-change', $event)" />
    </AppCard>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

defineProps({
  items: { type: Array, required: true },
  fields: { type: Array, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, required: true },
})

const emit = defineEmits(['search', 'edit', 'delete', 'page-change'])

// ربط تفاعلي مباشر لنص البحث مع الأب
const searchModel = defineModel('search', { type: String, default: '' })
</script>
