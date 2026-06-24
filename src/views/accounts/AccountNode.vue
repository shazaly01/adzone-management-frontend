<template>
  <div class="relative pl-2 border-r-2 border-surface-border/60 mr-4 my-2 transition-all">
    <div
      class="flex items-center justify-between p-3 rounded-lg bg-surface-ground hover:bg-surface-border/40 transition-colors group border border-surface-border/40"
    >
      <div class="flex items-center space-x-3 space-x-reverse min-w-0">
        <button
          v-if="node.children && node.children.length > 0"
          @click="toggleExpand"
          class="p-1 rounded-md hover:bg-surface-section text-text-secondary focus:outline-none transition-transform duration-200"
          :class="{ '-rotate-90': !isExpanded }"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <span v-else class="p-1 text-text-muted">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </span>

        <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 min-w-0">
          <span
            class="font-mono text-xs text-text-muted bg-surface-section px-1.5 py-0.5 rounded border border-surface-border/60"
          >
            {{ node.code }}
          </span>
          <span class="font-bold text-text-primary text-sm truncate">
            {{ node.name }}
          </span>
          <span
            :class="[
              'px-2 py-0.5 text-[10px] font-bold rounded-full border',
              getTypeBadgeClass(node.type),
            ]"
          >
            {{ getTypeLabel(node.type) }}
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-4 space-x-reverse">
        <div
          class="hidden sm:flex flex-col text-left font-mono text-xs pl-2 border-l border-surface-border/60"
        >
          <span class="text-text-muted text-[10px]">الرصيد الحالي:</span>
          <span
            :class="node.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-600'"
            class="font-bold"
          >
            {{ formatCurrency(node.current_balance || 0) }}
          </span>
        </div>

        <div
          class="flex items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity space-x-1 space-x-reverse"
        >
          <button
            v-if="authStore.can('account.create')"
            @click.stop="$emit('add-child', node)"
            class="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
            title="إضافة حساب فرعي"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('account.update')"
            @click.stop="$emit('edit-node', node)"
            class="p-1 text-sky-500 hover:bg-sky-50 rounded transition-colors"
            title="تعديل الحساب"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('account.delete') && (!node.children || node.children.length === 0)"
            @click.stop="$emit('delete-node', node)"
            class="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
            title="حذف الحساب"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isExpanded && node.children && node.children.length > 0" class="mt-1">
      <AccountNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @add-child="$emit('add-child', $event)"
        @edit-node="$emit('edit-node', $event)"
        @delete-node="$emit('delete-node', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  node: {
    type: Object,
    required: true,
  },
})

defineEmits(['add-child', 'edit-node', 'delete-node'])

const authStore = useAuthStore()
const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// استخراج المسميات العربية لنوع الحساب بناءً على الـ Request المحدد
const getTypeLabel = (type) => {
  const types = {
    cash: 'خزينة / نقدي',
    bank: 'بنكي',
    customer: 'عملاء',
    supplier: 'موردين',
    expense: 'مصروفات',
    income: 'إيرادات',
    normal: 'عام / عادي',
  }
  return types[type] || type
}

// استخراج الألوان البصرية المتناسقة للهوية الشجرية لكل حقل مالي
const getTypeBadgeClass = (type) => {
  const classes = {
    cash: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bank: 'bg-blue-50 text-blue-700 border-blue-200',
    customer: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    supplier: 'bg-amber-50 text-amber-700 border-amber-200',
    expense: 'bg-rose-50 text-rose-700 border-rose-200',
    income: 'bg-teal-50 text-teal-700 border-teal-200',
    normal: 'bg-gray-50 text-gray-700 border-gray-200',
  }
  return classes[type] || 'bg-gray-50 text-gray-700 border-gray-200'
}
</script>
