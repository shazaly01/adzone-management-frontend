<template>
  <div
    class="p-6 bg-surface-card rounded-xl border border-surface-border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5 text-right"
    dir="rtl"
  >
    <div class="flex flex-col space-y-1.5">
      <label class="text-sm font-semibold text-text-secondary">نوع الفاتورة *</label>
      <select
        v-model="headerData.invoice_type"
        class="block w-full px-3 py-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
      >
        <option value="purchase">فاتورة شراء نشطة</option>
        <option value="return">مرتجع مشتريات</option>
      </select>
      <p v-if="getFieldError('invoice_type')" class="text-rose-500 text-xs font-bold mt-1">
        {{ getFieldError('invoice_type') }}
      </p>
    </div>

    <div v-if="headerData.invoice_type === 'return'" class="flex flex-col space-y-1.5">
      <label class="text-sm font-semibold text-text-secondary">ترتبط بالفاتورة الأصلية رقم *</label>
      <select
        v-model="headerData.parent_id"
        class="block w-full px-3 py-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
      >
        <option :value="null">اختر الفاتورة الأم الأصلية...</option>
        <option v-for="invoice in originalInvoices" :key="invoice.id" :value="invoice.id">
          {{ invoice.invoice_number }}
        </option>
      </select>
      <p v-if="getFieldError('parent_id')" class="text-rose-500 text-xs font-bold mt-1">
        {{ getFieldError('parent_id') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1.5">
      <label class="text-sm font-semibold text-text-secondary">المستودع / المخزن الحاضن *</label>
      <select
        v-model="headerData.store_id"
        class="block w-full px-3 py-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
      >
        <option value="">اختر المستودع الاستراتيجي...</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <p v-if="getFieldError('store_id')" class="text-rose-500 text-xs font-bold mt-1">
        {{ getFieldError('store_id') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1.5">
      <label class="text-sm font-semibold text-text-secondary">المورد المعتمد *</label>
      <select
        v-model="headerData.supplier_id"
        class="block w-full px-3 py-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
      >
        <option value="">اختر المورد المرتبط...</option>
        <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
          {{ supplier.name }}
        </option>
      </select>
      <p v-if="getFieldError('supplier_id')" class="text-rose-500 text-xs font-bold mt-1">
        {{ getFieldError('supplier_id') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1.5">
      <label class="text-sm font-semibold text-text-secondary">تاريخ الاستحقاق والإصدار *</label>
      <input
        type="date"
        v-model="headerData.invoice_date"
        class="block w-full px-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
      />
      <p v-if="getFieldError('invoice_date')" class="text-rose-500 text-xs font-bold mt-1">
        {{ getFieldError('invoice_date') }}
      </p>
    </div>

    <div class="flex flex-col space-y-1.5">
      <label class="text-sm font-semibold text-text-secondary">طريقة السداد والتدفق المالي *</label>
      <select
        v-model="headerData.payment_type"
        class="block w-full px-3 py-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
      >
        <option value="cash">نقدي (Cash)</option>
        <option value="credit">آجل / ذمم (Credit)</option>
      </select>
      <p v-if="getFieldError('payment_type')" class="text-rose-500 text-xs font-bold mt-1">
        {{ getFieldError('payment_type') }}
      </p>
    </div>
  </div>
</template>

<script setup>
// استخدام defineModel لربط كائن البيانات كاملاً ثنائي الاتجاه مع المكون الأب
const headerData = defineModel({ type: Object, required: true })

// [تم الإصلاح]: تعيين الثابت props هنا ليعمل حارس التحقق بشكل سليم
const props = defineProps({
  stores: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
  originalInvoices: { type: Array, default: () => [] },
  validationErrors: { type: Object, default: () => null },
})

// دالة مساعدة داخلية لاستخراج أول رسالة خطأ للحقل من مصفوفة الأخطاء القادمة من الباك إيند
const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
