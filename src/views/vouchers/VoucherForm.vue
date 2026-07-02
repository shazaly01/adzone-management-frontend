<template>
  <form
    @submit.prevent="handleSubmit"
    class="p-6 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-5 text-right font-sans"
    dir="rtl"
  >
    <!-- الصف الأول: طريقة الدفع + تاريخ الاستحقاق -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- طريقة الدفع والنقدية -->
      <div class="relative w-full">
        <label class="block text-xs font-bold text-gray-300 mb-1.5 pr-1">
          طريقة الدفع والنقدية <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center shadow-[0_0_10px_rgba(224,94,43,0.15)]"
        >
          <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
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
            v-model="form.payment_method"
            @change="handlePaymentMethodChange"
            style="color-scheme: dark"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            required
          >
            <option value="cash" class="bg-[#16171b]">نقدي (خزينة)</option>
            <option value="bank" class="bg-[#16171b]">بنكي (حساب مصرفي)</option>
          </select>

          <span class="absolute left-4 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
        <p
          v-if="validationErrors?.payment_method"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ validationErrors.payment_method[0] }}
        </p>
      </div>

      <!-- تاريخ السند ووقت الاستحقاق -->
      <div class="relative w-full">
        <label class="block text-xs font-bold text-gray-300 mb-1.5 pr-1">
          تاريخ السند ووقت الاستحقاق <span class="text-rose-500">*</span>
        </label>
        <div
          class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:shadow-[0_0_10px_rgba(224,94,43,0.15)]"
        >
          <input
            type="date"
            v-model="form.voucher_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
            required
          />

          <span
            class="absolute left-3 text-gray-400 pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="text-gray-400 font-medium text-[11px]">تاريخ القيد</span>
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
          v-if="validationErrors?.voucher_date"
          class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
        >
          {{ validationErrors.voucher_date[0] }}
        </p>
      </div>
    </div>

    <hr class="border-gray-100 dark:border-surface-border/50 my-2" />

    <!-- الطرف الأول لقناة النقدية: (صرف من / إيراد لـ) -->
    <div class="relative w-full">
      <label class="block text-xs font-bold text-gray-300 mb-1.5 pr-1">
        {{ fundAccountLabel }}
      </label>
      <div
        class="relative w-full h-11 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center shadow-[0_0_10px_rgba(224,94,43,0.15)]"
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
            v-if="form.payment_method === 'cash'"
            id="fund-treasury-id"
            v-model="form.fund_account_id"
            variant="sales"
            class="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
          />
          <BanksDropdown
            v-else-if="form.payment_method === 'bank'"
            id="fund-bank-id"
            v-model="form.fund_account_id"
            variant="sales"
            class="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
          />
        </div>
      </div>
      <p
        v-if="validationErrors?.fund_account_id"
        class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
      >
        {{ validationErrors.fund_account_id[0] }}
      </p>
    </div>

    <!-- الطرف الثاني للشجرة والحسابات المساعدة -->
    <VoucherSubLedgerDropdown
      v-model:subLedgerType="form.sub_ledger_type"
      v-model:subLedgerId="form.sub_ledger_id"
      v-model:accountId="form.account_id"
      :label="targetAccountLabel"
      :accounts="accounts"
      :validationErrors="validationErrors"
    />

    <hr class="border-gray-100 dark:border-surface-border/50 my-2" />

    <!-- صف القيمة المالية المطور: استخدام مكون المنشأة الرسمي مع تحجيمه بـ max-w-xs ليصبح قصيراً ومنظماً -->
    <div class="w-full max-w-xs">
      <AppCurrencyInput
        id="voucher-amount"
        label="المبلغ المالي المعتمد *"
        v-model="form.amount"
        variant="sales"
        placeholder="0.00"
        required
      />
      <p v-if="validationErrors?.amount" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
        {{ validationErrors.amount[0] }}
      </p>
    </div>

    <!-- البيان والشرح التفصيلي -->
    <div class="relative w-full">
      <label class="block text-xs font-bold text-gray-300 mb-1.5 pr-1">
        البيان والشرح التفصيلي للمستند
      </label>
      <div
        class="relative w-full bg-[#16171b] border border-[#3e414c] rounded-lg p-2 transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:shadow-[0_0_10px_rgba(224,94,43,0.15)]"
      >
        <textarea
          id="voucher-notes"
          v-model="form.notes"
          placeholder="اكتب هنا تفاصيل سبب الصرف أو القبض بشكل دقيق لدعم التقرير المالي المحاسبي..."
          rows="2"
          class="block w-full bg-transparent text-white focus:outline-none text-xs font-medium placeholder-gray-500 resize-none text-right"
        ></textarea>
      </div>
      <p v-if="validationErrors?.notes" class="text-rose-500 text-[10px] font-bold mt-1 pr-1">
        {{ validationErrors.notes[0] }}
      </p>
    </div>

    <!-- أزرار التحكم والمفاتيح التشغيلية -->
    <div class="flex justify-end space-x-2 space-x-reverse border-t border-[#3e414c] pt-4 mt-2">
      <button
        type="button"
        @click="handleCancel"
        class="px-5 h-9 bg-[#3e414c] hover:bg-[#4e5261] text-white rounded-lg text-xs font-bold transition-all"
      >
        إلغاء المعاملة
      </button>
      <button
        type="submit"
        :disabled="isSaving"
        class="px-5 h-9 bg-[#e05e2b] hover:bg-[#f06e3b] text-white rounded-lg text-xs font-bold shadow-lg shadow-[#e05e2b]/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSaving">جاري ترحيل السند...</span>
        <span v-else>حفظ واعتماد المستند المالي</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useTreasuryStore } from '@/stores/treasuryStore'
import { useBankStore } from '@/stores/bankStore'

import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import VoucherSubLedgerDropdown from '@/components/forms/VoucherSubLedgerDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  accounts: {
    type: Array,
    required: true,
  },
  validationErrors: {
    type: Object,
    default: null,
  },
  isTypeDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const treasuryStore = useTreasuryStore()
const bankStore = useBankStore()

const { banks } = storeToRefs(bankStore)
const { treasuries } = storeToRefs(treasuryStore)

const fundAccountLabel = computed(() => {
  const isCash = form.value.payment_method === 'cash'
  if (form.value.voucher_type === 'payment') {
    return isCash ? 'صرف من الخزنة *' : 'صرف من البنك *'
  } else {
    return isCash ? 'إيراد للخزنة *' : 'إيراد للبنك *'
  }
})

const targetAccountLabel = computed(() => {
  return form.value.voucher_type === 'payment' ? 'إلى حساب *' : 'من حساب *'
})

const createFreshForm = () => {
  const today = new Date().toISOString().split('T')[0]
  return {
    id: null,
    voucher_type: 'payment',
    account_id: '',
    sub_ledger_type: '',
    sub_ledger_id: null,
    payment_method: 'cash',
    fund_account_id: '',
    treasury_id: null,
    bank_id: null,
    amount: '',
    voucher_date: today,
    notes: '',
  }
}

const form = ref(createFreshForm())

onMounted(async () => {
  try {
    const promises = []
    if (treasuries.value.length === 0)
      promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
    if (banks.value.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))

    if (promises.length > 0) {
      await Promise.all(promises)
    }
  } catch (err) {
    console.error('Failed to load fund account data for voucher form:', err)
  }
})

watch(
  () => form.value.fund_account_id,
  (newVal) => {
    if (!newVal) {
      form.value.treasury_id = null
      form.value.bank_id = null
      return
    }

    if (form.value.payment_method === 'cash') {
      const target = treasuries.value.find((t) => t.account_id == newVal || t.id == newVal)
      if (target) {
        form.value.treasury_id = target.id
        if (form.value.fund_account_id == target.account_id && target.id !== target.account_id) {
          form.value.fund_account_id = target.id
        }
      }
    } else if (form.value.payment_method === 'bank') {
      const target = banks.value.find((b) => b.account_id == newVal || b.id == newVal)
      if (target) {
        form.value.bank_id = target.id
        if (form.value.fund_account_id == target.account_id && target.id !== target.account_id) {
          form.value.fund_account_id = target.id
        }
      }
    }
  },
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      let formattedDate = ''
      if (newData.voucher_date) {
        formattedDate = newData.voucher_date.split(' ')[0]
      }

      let fundAccountId = newData.fund_account_id || ''
      if (newData.payment_method === 'cash' && newData.treasury_id) {
        fundAccountId = newData.treasury_id
      } else if (newData.payment_method === 'bank' && newData.bank_id) {
        fundAccountId = newData.bank_id
      }

      form.value = {
        id: newData.id,
        voucher_type: newData.voucher_type || 'payment',
        account_id: newData.account_id || '',
        sub_ledger_type: newData.sub_ledger_type || '',
        sub_ledger_id: newData.sub_ledger_id || null,
        payment_method: newData.payment_method || 'cash',
        fund_account_id: fundAccountId,
        treasury_id: newData.treasury_id || null,
        bank_id: newData.bank_id || null,
        amount: newData.amount !== undefined ? newData.amount : '',
        voucher_date: formattedDate || createFreshForm().voucher_date,
        notes: newData.notes || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handlePaymentMethodChange = () => {
  form.value.fund_account_id = ''
  form.value.treasury_id = null
  form.value.bank_id = null
}

const handleSubmit = () => {
  const submissionData = { ...form.value }

  if (form.value.payment_method === 'cash') {
    const target = treasuries.value.find(
      (t) => t.id == form.value.fund_account_id || t.account_id == form.value.fund_account_id,
    )
    if (target) submissionData.fund_account_id = target.account_id
  } else if (form.value.payment_method === 'bank') {
    const target = banks.value.find(
      (b) => b.id == form.value.fund_account_id || b.account_id == form.value.fund_account_id,
    )
    if (target) submissionData.fund_account_id = target.account_id
  }

  emit('submit', submissionData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}
</style>
