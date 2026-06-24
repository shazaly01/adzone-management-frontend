<!--src\views\projects\ProjectsTable.vue--->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="projects"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-project_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">{{ item.name }}</span>

          <div class="flex items-center gap-1 text-xs text-text-muted">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span class="truncate max-w-[150px]">{{ item.company?.name || 'غير محدد' }}</span>
          </div>

          <div v-if="item.contract_number" class="flex items-center mt-0.5">
            <span
              class="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded-r-md rounded-l-none border-l-0"
            >
              رقم العقد
            </span>
            <span
              class="text-[11px] font-mono font-bold bg-white text-gray-800 border border-gray-200 px-2 py-0.5 rounded-l-md min-w-[40px] text-center"
            >
              {{ item.contract_number }}
            </span>
          </div>
        </div>
      </template>

      <!-- ▼▼▼ استبدل القالب القديم بهذا القالب المحدّث ▼▼▼ -->
      <template #cell-status="{ item }">
        <div class="flex flex-col gap-2 min-w-[150px]">
          <!-- شريط نسبة الإنجاز -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-text-muted">نسبة الإنجاز</span>
              <!-- تغيير لون النسبة أيضاً -->
              <span
                :class="[
                  'text-xs font-bold',
                  {
                    'text-emerald-500': item.completion_percentage === 100,
                    'text-sky-500':
                      item.completion_percentage > 0 && item.completion_percentage < 100,
                    'text-gray-500': item.completion_percentage === 0,
                  },
                ]"
              >
                {{ item.completion_percentage }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <!-- التعديل الدقيق هنا: استخدام :class لتلوين الشريط -->
              <div
                :class="[
                  'h-1.5 rounded-full',
                  {
                    'bg-emerald-500': item.completion_percentage === 100, // أخضر للمكتمل
                    'bg-sky-500':
                      item.completion_percentage > 0 && item.completion_percentage < 100, // أزرق للمشروع قيد التنفيذ
                    'bg-gray-400': item.completion_percentage === 0, // رمادي للمشروع الذي لم يبدأ
                  },
                ]"
                :style="{ width: item.completion_percentage + '%' }"
              ></div>
            </div>
          </div>

          <!-- نوع المشروع (يبقى كما هو) -->
          <div v-if="item.project_type" class="flex items-center">
            <span class="text-xs font-medium text-text-muted">النوع:</span>
            <span class="text-xs font-bold text-text-primary mr-1">{{
              item.project_type.name
            }}</span>
          </div>
        </div>
      </template>
      <!-- ▲▲▲ نهاية التحديث ▲▲▲ -->

      <template #cell-owner_info="{ item }">
        <div class="flex flex-col gap-1">
          <span class="font-medium text-sm text-text-primary">
            {{ item.owner?.name || item.project_owner || '-' }}
          </span>

          <div v-if="item.region" class="flex items-center gap-1 text-xs text-text-muted">
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
            <span>{{ item.region }}</span>
          </div>
        </div>
      </template>

      <template #cell-financials="{ item }">
        <div class="flex flex-col gap-1.5 text-sm min-w-[140px]">
          <div
            class="flex justify-between items-center gap-2 border-b border-surface-border/50 pb-1"
          >
            <span class="text-[11px] text-text-muted">العقد:</span>
            <span class="font-medium text-text-primary">{{
              formatCurrency(item.contract_value)
            }}</span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="text-[11px] text-text-muted">المستحق:</span>
            <span class="font-bold text-emerald-600">{{ formatCurrency(item.due_value) }}</span>
          </div>
        </div>
      </template>

      <template #cell-meta_info="{ item }">
        <div class="flex flex-col items-start gap-2">
          <span
            :class="[
              'px-2 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1',
              item.has_contract_permission
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-orange-50 text-orange-700 border-orange-100',
            ]"
          >
            <svg
              v-if="item.has_contract_permission"
              class="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>

            {{ item.has_contract_permission ? 'يوجد إذن تعاقد' : 'لا يوجد إذن تعاقد' }}
          </span>

          <span
            v-if="item.calculation_option"
            class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100"
          >
            {{ item.calculation_option.name }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('payment.view')"
            @click.stop="$emit('manage-payments', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="إدارة الدفعات"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('document.view')"
            @click.stop="$emit('manage-documents', item)"
            class="p-1.5 text-teal-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="إدارة المستندات"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('project.update')"
            @click.stop="$emit('edit-project', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل المشروع"
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
            v-if="authStore.can('project.delete')"
            @click.stop="$emit('delete-project', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف المشروع"
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
import { formatCurrency, formatDate } from '@/utils/formatters'

// تعريف المدخلات
const props = defineProps({
  projects: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

// تعريف الأحداث
const emit = defineEmits([
  'page-change',
  'edit-project',
  'delete-project',
  'manage-payments',
  'manage-documents',
  'row-clicked',
])

const authStore = useAuthStore()

// تعريف رؤوس الجدول (الأعمدة المدمجة)
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    // دمجنا الاسم + الشركة + رقم العقد
    { key: 'project_info', label: 'تفاصيل المشروع', class: 'min-w-[200px]' },
    // دمجنا المالك + المنطقة
    { key: 'owner_info', label: 'المالك والموقع' },
    // دمجنا البيانات المالية
    { key: 'financials', label: 'البيانات المالية' },

    { key: 'status', label: 'حالة المشروع', class: 'min-w-[170px]' },
    // دمجنا الترسية + خيار الاحتساب
    { key: 'meta_info', label: 'الاذن والاحتساب' },
  ]

  // عمود الإجراءات (يظهر فقط إذا كان للمستخدم صلاحية واحدة على الأقل)
  if (
    authStore.can('project.update') ||
    authStore.can('project.delete') ||
    authStore.can('payment.view') ||
    authStore.can('document.view')
  ) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[140px]' })
  }
  return headers
})
</script>
