<template>
  <div
    class="p-3 bg-surface-ground/95 rounded-lg border border-primary/40 shadow-[0_0_12px_3px_rgba(30,129,255,0.15)] grid grid-cols-1 md:grid-cols-3 gap-3 text-right items-end transition-all duration-300"
    dir="rtl"
  >
    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">رقم السند / القيد *</label>
      <input
        type="text"
        v-model="formData.entry_number"
        placeholder="أدخل رقم القيد المالي..."
        class="block w-full px-2 py-1.5 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-primary text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-primary/20"
      />
      <p v-if="getFieldError('entry_number')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('entry_number') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">نوع المعاملة *</label>
      <select
        v-model="formData.type"
        class="block w-full px-2 py-1.5 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-primary text-xs font-bold outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-primary/20"
      >
        <option value="journal">قيد يومية عام (Journal)</option>
        <option value="receipt">سند قبض (Receipt)</option>
        <option value="payment">سند صرف (Payment)</option>
      </select>
      <p v-if="getFieldError('type')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('type') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1">
      <label class="text-[11px] font-black text-text-secondary">تاريخ الحركة المالية *</label>
      <input
        type="date"
        v-model="formData.entry_date"
        class="block w-full px-2 py-1 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-primary text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-primary/20"
      />
      <p v-if="getFieldError('entry_date')" class="text-rose-500 text-[10px] font-bold mt-0.5">
        {{ getFieldError('entry_date') }}
      </p>
    </div>
  </div>
</template>

<script setup>
const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
