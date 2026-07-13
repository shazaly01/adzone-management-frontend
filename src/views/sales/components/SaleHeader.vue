<template>
  <div
    class="p-5 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-4 text-right font-sans"
    dir="rtl"
  >
    <!-- الصف الأول: 4 أعمدة (نوع الفاتورة + المخزن + التاريخ + الخزنة/البنك) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- invoice_type -->
      <div class="relative w-full">
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

          <!-- [تأمين حركي]: قفل حقل نوع المستند لمنع تغييره أثناء معالجة المردود المباشر -->
          <select
            v-model="formData.invoice_type"
            :disabled="!!formData.parent_id"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="sale" class="bg-[#16171b]">فاتورة مبيعات نشطة</option>
            <option value="return" class="bg-[#16171b]">مردودات مبيعات</option>
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

      <!-- store_id -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b]"
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
          <!-- [تأمين حركي]: تعطيل المخزن لضمان عودة البضاعة المسترجعة لنفس المخزن الأصلي -->
          <div
            class="w-full h-full pr-10 pl-2 flex items-center"
            :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
          >
            <StoresDropdown
              id="sale-store-id"
              v-model="formData.store_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p v-if="getFieldError('store_id')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('store_id') }}
        </p>
      </div>

      <!-- invoice_date -->
      <div class="relative w-full">
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

      <!-- treasury_id / bank_id (حسب payment_type) -->
      <div class="relative w-full">
        <div
          v-if="formData.payment_type === 'cash'"
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center animate-fade-in shadow-[0_0_10px_rgba(224,94,43,0.15)]"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <TreasuriesDropdown
              id="sale-treasury-id"
              v-model="formData.treasury_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>

        <div
          v-if="formData.payment_type === 'card'"
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center animate-fade-in shadow-[0_0_10px_rgba(224,94,43,0.15)]"
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
              id="sale-bank-id"
              v-model="formData.bank_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>

        <div
          v-if="formData.payment_type === 'credit'"
          class="relative w-full h-11 bg-[#16171b] border border-dashed border-[#3e414c] rounded-lg flex items-center justify-center text-gray-500 text-xs font-medium"
        >
          <span>دين آجل - لا يوجد خزنة أو بنك</span>
        </div>

        <p
          v-if="getFieldError('treasury_id') || getFieldError('bank_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('treasury_id') || getFieldError('bank_id') }}
        </p>
      </div>
    </div>

    <!-- الصف الثاني: 4 أعمدة (طريقة الدفع + العميل + نوع البيع (راديو) + اسم العميل النصي) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- payment_type -->
      <div class="relative w-full">
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

          <!-- [تأمين حركي]: قفل طريقة الدفع لضمان رد الأموال عبر نفس القناة المالية الأصلية وعكس القيد المساعد بدقة -->
          <select
            v-model="formData.payment_type"
            :disabled="!!formData.parent_id"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

      <!-- customer_id -->
      <div class="relative w-full">
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

          <!-- [تأمين حركي]: قفل حساب العميل لمنع ترحيل مبالغ المردود لحساب عميل آخر بالخطأ -->
          <div
            class="w-full h-full pr-10 pl-2 flex items-center"
            :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
          >
            <CustomersDropdown
              id="sale-customer-id"
              v-model="formData.customer_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('customer_id')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('customer_id') }}
        </p>
      </div>

      <!-- sale_type (أزرار راديو) -->
      <div class="relative w-full">
        <!-- [تأمين حركي]: قفل خيارات نوع حركة البيع لوجستياً -->
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center px-3 gap-2 transition-all duration-200 hover:border-[#e05e2b]"
          :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </span>

          <div class="flex items-center gap-2 w-full pr-10">
            <label
              class="flex items-center gap-1 cursor-pointer text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              <input
                type="radio"
                v-model="formData.sale_type"
                value="indoor"
                class="w-3.5 h-3.5 accent-[#e05e2b]"
              />
              indoor
            </label>
            <label
              class="flex items-center gap-1 cursor-pointer text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              <input
                type="radio"
                v-model="formData.sale_type"
                value="outdoor"
                class="w-3.5 h-3.5 accent-[#e05e2b]"
              />
              outdoor
            </label>
          </div>
        </div>
        <p v-if="getFieldError('sale_type')" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('sale_type') }}
        </p>
      </div>

      <!-- customer_name_text -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]"
        >
          <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>

          <!-- [تأمين حركي]: تحويل حقل العميل الحر لوضع القراءة فقط في المردود المباشر -->
          <input
            type="text"
            v-model="formData.customer_name_text"
            :readonly="!!formData.parent_id"
            placeholder="اسم العميل (نص حر - اختياري)"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-white focus:outline-none text-xs font-medium placeholder-gray-500 readonly:opacity-70"
          />
        </div>
        <p
          v-if="getFieldError('customer_name_text')"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('customer_name_text') }}
        </p>
      </div>
    </div>

    <!-- حالة المرتجع: اختيار الفاتورة الأم (في صف منفصل أسفل الصفين) -->
    <!-- [تحديث بصري]: لافتة مردود مبيعات مدمجة ونظيفة بجانب الأيقونة مباشرة -->
    <div
      v-if="formData.invoice_type === 'return'"
      class="grid grid-cols-1 gap-4 mt-2 animate-fade-in"
    >
      <div
        class="w-full bg-orange-950/20 border border-dashed border-[#e05e2b] rounded-lg p-3 flex items-center gap-3"
      >
        <span
          class="text-[#e05e2b] bg-[#e05e2b]/10 p-2 rounded-md flex items-center justify-center shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </span>
        <div class="flex items-center gap-2 text-right">
          <span class="text-xs font-black text-[#e05e2b]"
            >مستند مردود مبيعات للفاتورة الأصلية المربوطة:</span
          >
          <span
            class="font-mono font-black text-xs text-white bg-[#e05e2b] px-2 py-0.5 rounded shadow-sm"
          >
            #{{ formData.parent_id }}
          </span>
        </div>
      </div>
      <p v-if="getFieldError('parent_id')" class="text-rose-500 text-[10px] font-bold mt-0.5 pr-1">
        {{ getFieldError('parent_id') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useCustomerStore } from '@/stores/customerStore'
import { useSaleStore } from '@/stores/saleStore'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import CustomersDropdown from '@/components/forms/CustomersDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const customerStore = useCustomerStore()
const saleStore = useSaleStore()

const originalSales = ref([])

const loadOriginalSales = async () => {
  if (formData.value.invoice_type === 'return' && formData.value.customer_id) {
    try {
      await saleStore.fetchSales(1, {
        customer_id: formData.value.customer_id,
        invoice_type: 'sale',
      })
      originalSales.value = saleStore.sales
    } catch (error) {
      console.error('فشل جلب فواتير المبيعات المتاحة للمردود:', error)
      originalSales.value = []
    }
  } else {
    originalSales.value = []
    if (!formData.value.parent_id) {
      formData.value.parent_id = null
    }
  }
}

watch(
  () => [formData.value.invoice_type, formData.value.customer_id],
  async () => {
    await loadOriginalSales()
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  await customerStore.fetchCustomers(1, { is_active: 1 })

  if (formData.value.sale_type === undefined) {
    formData.value.sale_type = 'indoor'
  }
  if (formData.value.customer_name_text === undefined) {
    formData.value.customer_name_text = null
  }

  if (formData.value.invoice_type === 'return' && formData.value.customer_id) {
    await loadOriginalSales()
  }
})
</script>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}

input[type='radio'] {
  appearance: none;
  width: 14px;
  height: 14px;
  border: 2px solid #5d6170;
  border-radius: 50%;
  background: transparent;
  transition: 0.2s;
  position: relative;
  cursor: pointer;
}
input[type='radio']:checked {
  border-color: #e05e2b;
  background: #e05e2b;
}
input[type='radio']:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
}
input[type='radio']:hover {
  border-color: #e05e2b;
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
