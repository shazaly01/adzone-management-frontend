<!--src/views/technician/TechnicianSaleFilters.vue-->
<template>
  <div
    class="p-4 bg-surface-card rounded-lg border border-surface-border shadow-sm space-y-4 text-right"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <!-- البحث السريع -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">البحث السريع</label>
        <input
          type="text"
          v-model="search"
          placeholder="رقم الفاتورة، ملاحظات التشغيل..."
          class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-amber-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/20"
        />
      </div>

      <!-- مخزن الصرف -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">مستودع الصرف والمواد</label>
        <StoresDropdown id="technician-store-filter" v-model="storeFilter" variant="default" />
      </div>

      <!-- حساب العميل -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">حساب العميل المعني</label>
        <CustomersDropdown
          id="technician-customer-filter"
          v-model="customerFilter"
          variant="default"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <!-- من تاريخ -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">من تاريخ</label>
        <input
          type="date"
          v-model="fromDate"
          style="color-scheme: dark"
          class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-amber-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/20"
        />
      </div>

      <!-- إلى تاريخ -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">إلى تاريخ</label>
        <input
          type="date"
          v-model="toDate"
          style="color-scheme: dark"
          class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-amber-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/20"
        />
      </div>

      <div class="hidden lg:block"></div>
    </div>
  </div>
</template>

<script setup>
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import CustomersDropdown from '@/components/forms/CustomersDropdown.vue'

// ربط الفلاتر تفاعلياً ثنائية الاتجاه مع المكون الأب
const search = defineModel('searchQuery', { type: String, default: '' })
const storeFilter = defineModel('storeFilter', { type: [String, Number], default: '' })
const customerFilter = defineModel('customerFilter', { type: [String, Number], default: '' })
const fromDate = defineModel('fromDateFilter', { type: String, default: '' })
const toDate = defineModel('toDateFilter', { type: String, default: '' })
</script>

<style scoped>
select option {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
