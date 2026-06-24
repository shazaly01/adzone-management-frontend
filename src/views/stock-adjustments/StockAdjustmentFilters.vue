<template>
  <div
    class="p-3 bg-surface-card rounded-lg border border-surface-border shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-right"
    dir="rtl"
  >
    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">البحث السريع الجردي</label>
      <input
        type="text"
        v-model="search"
        placeholder="رقم مستند التسوية، ملاحظات الدورة..."
        class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/20"
      />
    </div>

    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">مستودع الفحص</label>
      <select
        v-model="storeFilter"
        style="color-scheme: dark"
        class="block w-full px-2 py-1.5 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-primary text-xs font-bold outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-primary/20"
      >
        <option value="">كل المستودعات المعتمدة</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
// ارتباطات الفلاتر تفاعلياً ثنائية الاتجاه مع المكون الأب الرئيسي للحركات الجردية
const search = defineModel('searchQuery', { type: String, default: '' })
const storeFilter = defineModel('storeFilter', { type: [String, Number], default: '' })

// استقبال مصفوفة المستودعات لتغذية قائمة الخيارات
defineProps({
  stores: { type: Array, required: true },
})
</script>

<style scoped>
select option {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
