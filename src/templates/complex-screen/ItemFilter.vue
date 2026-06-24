<!--src\templates\complex-screen\ItemFilter.vue--->
<template>
  <AppCard class="mb-6">
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
              @input="handleSearchInput"
              type="text"
              placeholder="اكتب للبحث السريع..."
              class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            />
          </div>
        </div>

        <slot></slot>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'

// استقبال قيمة البحث من المكون الأب
defineProps({
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['update:searchQuery'])

/**
 * معالجة مدخلات البحث بشكل منضبط هندسياً
 * نقوم بتحديث القيمة في الأب فوراً عبر الالتزام بـ v-model لتظل الواجهة متزامنة
 */
const handleSearchInput = (event) => {
  emit('update:searchQuery', event.target.value)
}
</script>
