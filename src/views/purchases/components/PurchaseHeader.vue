<template>
  <div
    class="p-5 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="relative w-full" key="purchase-invoice-type-container">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center shadow-[0_0_10px_rgba(224,94,43,0.15)]"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>

          <select
            v-model="formData.invoice_type"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="purchase" class="bg-[#16171b]">فاتورة مشتريات نشطة</option>
            <option value="return" class="bg-[#16171b]">مرتجع مشتريات</option>
          </select>

          <span class="absolute left-4 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p
          v-if="getFieldError('invoice_type')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('invoice_type') }}
        </p>
      </div>

      <div class="relative w-full" key="purchase-store-container">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <StoresDropdown
              id="purchase-store-id"
              v-model="formData.store_id"
              variant="sales"
              label=""
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p v-if="getFieldError('store_id')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('store_id') }}
        </p>
      </div>

      <div class="w-full" key="purchase-dynamic-account-container">
        <div
          v-if="formData.payment_type === 'cash'"
          key="cash-treasury-active"
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center animate-fade-in shadow-[0_0_10px_rgba(224,94,43,0.15)] transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <TreasuriesDropdown
              id="purchase-treasury-id"
              v-model="formData.treasury_id"
              variant="sales"
              label=""
              class="w-full bg-transparent"
            />
          </div>
        </div>

        <div
          v-if="formData.payment_type === 'card'"
          key="card-bank-active"
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center animate-fade-in shadow-[0_0_10px_rgba(224,94,43,0.15)] transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <BanksDropdown
              id="purchase-bank-id"
              v-model="formData.bank_id"
              variant="sales"
              label=""
              class="w-full bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="relative w-full" key="purchase-payment-type-container">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </span>

          <select
            v-model="formData.payment_type"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="cash" class="bg-[#16171b]">نقدي (Cash)</option>
            <option value="card" class="bg-[#16171b]">شبكة / دفع إلكتروني (Card)</option>
            <option value="credit" class="bg-[#16171b]">آجل / ذمم (Credit)</option>
          </select>

          <span class="absolute left-4 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p
          v-if="getFieldError('payment_type')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('payment_type') }}
        </p>
      </div>

      <div class="relative w-full" key="purchase-supplier-container">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center transition-all duration-200 focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b] shadow-[0_0_10px_rgba(224,94,43,0.15)]"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <SuppliersDropdown
              id="purchase-supplier-id"
              v-model="formData.supplier_id"
              variant="sales"
              label=""
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('supplier_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('supplier_id') }}
        </p>
      </div>

      <div class="relative w-full" key="purchase-invoice-date-container">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
        >
          <input
            type="date"
            v-model="formData.invoice_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">تاريخ</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
        <p
          v-if="getFieldError('invoice_date')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('invoice_date') }}
        </p>
      </div>

      <div
        v-if="formData.invoice_type === 'return'"
        key="purchase-parent-invoice-container"
        class="relative w-full md:col-span-3 animate-fade-in mt-1"
      >
        <div
          class="relative w-full h-11 bg-[#16171b] border border-dashed border-[#e05e2b]/40 rounded-lg flex items-center"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg
              class="w-5 h-5 text-[#e05e2b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </span>

          <select
            v-model="formData.parent_id"
            :disabled="!formData.supplier_id"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option :value="null" class="bg-[#16171b]">
              {{ formData.supplier_id ? 'اختر مستند الشراء الأم...' : 'حدد المورد أولاً...' }}
            </option>
            <option
              v-for="invoice in originalInvoices"
              :key="invoice.id"
              :value="invoice.id"
              class="bg-[#16171b]"
            >
              #{{ invoice.id }} - {{ invoice.invoice_date }}
            </option>
          </select>

          <span class="absolute left-4 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p v-if="getFieldError('parent_id')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('parent_id') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useStoreStore } from '@/stores/storeStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { usePurchaseStore } from '@/stores/purchaseStore'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const storeStore = useStoreStore()
const supplierStore = useSupplierStore()
const purchaseStore = usePurchaseStore()

const originalInvoices = ref([])

const loadOriginalInvoices = async () => {
  if (formData.value.invoice_type === 'return' && formData.value.supplier_id) {
    try {
      await purchaseStore.fetchPurchases(1, {
        supplier_id: formData.value.supplier_id,
        invoice_type: 'purchase',
      })
      originalInvoices.value = purchaseStore.purchases
    } catch (error) {
      console.error('فشل جلب الفواتير المتاحة للإرجاع:', error)
      originalInvoices.value = []
    }
  } else {
    originalInvoices.value = []
    formData.value.parent_id = null
  }
}

watch(
  () => [formData.value.invoice_type, formData.value.supplier_id],
  async () => {
    await loadOriginalInvoices()
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  await Promise.all([
    storeStore.fetchStores(1, { is_active: 1 }),
    supplierStore.fetchSuppliers(1, { is_active: 1 }),
  ])

  if (formData.value.invoice_type === 'return' && formData.value.supplier_id) {
    await loadOriginalInvoices()
  }
})
</script>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
