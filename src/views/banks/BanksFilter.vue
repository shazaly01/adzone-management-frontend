<!--src\views\banks\BanksFilter.vue-->
<template>
  <AppCard class="mb-6">
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="اسم البنك، رقم الحساب..."
              class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            />
          </div>
        </div>

        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">حالة البنك</h3>
          <div class="relative">
            <select
              :value="statusFilter"
              @change="$emit('update:statusFilter', $event.target.value)"
              class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="1">نشط</option>
              <option value="0">غير نشط</option>
            </select>
            <div class="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
              <svg
                class="w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: '',
  },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
