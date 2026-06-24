<template>
  <AppCard class="overflow-hidden">
    <div v-if="loading" class="p-12 flex flex-col items-center justify-center space-y-3">
      <div
        class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm text-text-secondary font-medium">جاري بناء وتصفيف شجرة الحسابات...</span>
    </div>

    <div v-else-if="accounts && accounts.length > 0" class="p-5 overflow-x-auto min-h-[400px]">
      <div class="min-w-[600px] border-r-2 border-dashed border-surface-border/40 pr-2">
        <AccountNode
          v-for="rootAccount in accounts"
          :key="rootAccount.id"
          :node="rootAccount"
          @add-child="$emit('add-child', $event)"
          @edit-node="$emit('edit-node', $event)"
          @delete-node="$emit('delete-node', $event)"
        />
      </div>
    </div>

    <div v-else class="p-12 text-center flex flex-col items-center justify-center space-y-4">
      <div class="p-4 bg-surface-ground rounded-full text-text-muted">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <div class="max-w-sm">
        <h3 class="text-base font-bold text-text-primary mb-1">دليل الحسابات فارغ</h3>
        <p class="text-xs text-text-muted">
          لم يتم إضافة أي حسابات رئيسية أو جذور محاسبية للنظام حتى الآن.
        </p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'
import AccountNode from './AccountNode.vue'

defineProps({
  accounts: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add-child', 'edit-node', 'delete-node'])
</script>
