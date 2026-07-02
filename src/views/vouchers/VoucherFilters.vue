<template>
  <AppCard class="mb-6">
    <div class="p-4">
      <div
        class="grid grid-cols-1 gap-4 items-end"
        :class="hideTypeFilter ? 'md:grid-cols-2' : 'md:grid-cols-3'"
      >
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
              placeholder="رقم السند، البيان والشرح..."
              class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            />
          </div>
        </div>

        <div v-if="!hideTypeFilter" class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">نوع السند</h3>
          <div class="relative">
            <select
              :value="voucherTypeFilter"
              @change="$emit('update:voucherTypeFilter', $event.target.value)"
              class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            >
              <option value="">الكل (صرف وقبض)</option>
              <option value="payment">سندات صرف فقط</option>
              <option value="receipt">سندات قبض فقط</option>
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

        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">طريقة الدفع</h3>
          <div class="relative">
            <select
              :value="paymentMethodFilter"
              @change="$emit('update:paymentMethodFilter', $event.target.value)"
              class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            >
              <option value="">الكل (نقدي وبنكي)</option>
              <option value="cash">نقدي (خزينة)</option>
              <option value="bank">بنكي (بنك)</option>
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
  voucherTypeFilter: {
    type: String,
    default: '',
  },
  paymentMethodFilter: {
    type: String,
    default: '',
  },
  // الخاصية البنائية الجديدة لإخفاء قائمة تحديد النوع تلقائياً خلف الكواليس
  hideTypeFilter: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:searchQuery', 'update:voucherTypeFilter', 'update:paymentMethodFilter'])
</script>
