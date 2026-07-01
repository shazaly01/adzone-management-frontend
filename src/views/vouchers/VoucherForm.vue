<template>
  <form @submit.prevent="handleSubmit" class="max-w-3xl mx-auto space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
          نوع السند المالي <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <select
            v-model="form.voucher_type"
            class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            required
          >
            <option value="payment">سند صرف</option>
            <option value="receipt">سند قبض</option>
          </select>
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs"
          >
            ▼
          </div>
        </div>
        <p v-if="validationErrors?.voucher_type" class="text-rose-500 text-xs mt-1 font-bold">
          {{ validationErrors.voucher_type[0] }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
          طريقة الدفع والنقدية <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <select
            v-model="form.payment_method"
            @change="handlePaymentMethodChange"
            class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            required
          >
            <option value="cash">نقدي (خزينة)</option>
            <option value="bank">بنكي (حساب مصرفي)</option>
          </select>
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs"
          >
            ▼
          </div>
        </div>
        <p v-if="validationErrors?.payment_method" class="text-rose-500 text-xs mt-1 font-bold">
          {{ validationErrors.payment_method[0] }}
        </p>
      </div>
    </div>

    <hr class="border-gray-100 dark:border-surface-border/50 my-2" />

    <div class="pb-2">
      <TreasuriesDropdown
        v-if="form.payment_method === 'cash'"
        id="fund-treasury-id"
        label="الحساب النقدية المتأثر (الخزينة)"
        v-model="form.fund_account_id"
        required
      />
      <BanksDropdown
        v-else-if="form.payment_method === 'bank'"
        id="fund-bank-id"
        label="الحساب البنكي المتأثر"
        v-model="form.fund_account_id"
        required
      />
      <p v-if="validationErrors?.fund_account_id" class="text-rose-500 text-xs mt-1 font-bold">
        {{ validationErrors.fund_account_id[0] }}
      </p>
    </div>

    <div class="relative pb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
        الحساب المستهدف (الجهة المستلمة / المسلمة) <span class="text-rose-500">*</span>
      </label>
      <div class="relative">
        <input
          type="text"
          readonly
          :value="selectedLedgerName"
          @click="toggleDropdown"
          placeholder="اضغط لاختيار الحساب المساعد (مورد، عميل، مصروف، بنك، خزنة)..."
          class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all sm:text-sm cursor-pointer text-right"
          required
        />
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-xs"
        >
          ▼
        </div>
      </div>

      <div
        v-if="isDropdownOpen"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-surface-ground border border-surface-border rounded-lg shadow-xl p-3 space-y-3"
      >
        <div class="flex flex-wrap gap-1 bg-gray-100 dark:bg-surface-border p-1 rounded-md">
          <button
            type="button"
            @click="activeTab = 'all'"
            :class="[
              'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
              activeTab === 'all'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ]"
          >
            الكل
          </button>
          <button
            type="button"
            @click="activeTab = 'bank_treasury'"
            :class="[
              'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
              activeTab === 'bank_treasury'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ]"
          >
            البنوك والخزائن
          </button>
          <button
            type="button"
            @click="activeTab = 'expense'"
            :class="[
              'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
              activeTab === 'expense'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ]"
          >
            المصروفات
          </button>
          <button
            type="button"
            @click="activeTab = 'supplier'"
            :class="[
              'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
              activeTab === 'supplier'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ]"
          >
            الموردين
          </button>
          <button
            type="button"
            @click="activeTab = 'customer'"
            :class="[
              'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
              activeTab === 'customer'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ]"
          >
            العملاء
          </button>
          <button
            type="button"
            @click="activeTab = 'designer'"
            :class="[
              'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
              activeTab === 'designer'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ]"
          >
            المصممون
          </button>
        </div>

        <input
          type="text"
          v-model="searchQuery"
          ref="searchInputRef"
          placeholder="اكتب اسم الحساب المساعد للبحث الفوري..."
          class="block w-full px-3 py-1.5 border border-surface-border rounded-md bg-gray-50 dark:bg-surface-border text-text-primary focus:ring-2 focus:ring-primary outline-none text-sm"
        />

        <div v-if="isDataLoading" class="text-center py-4 text-xs text-gray-400">
          جاري تحديث جلب الحسابات المساعدة...
        </div>

        <ul
          v-else
          class="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-surface-border text-sm"
        >
          <li v-for="item in filteredSubLedgers" :key="item.composite_key">
            <button
              type="button"
              @click="selectLedger(item)"
              class="w-full text-right px-3 py-2 hover:bg-gray-50 dark:hover:bg-surface-border flex justify-between items-center transition-colors rounded-none"
            >
              <span class="font-medium text-text-primary">{{ item.name }}</span>
              <span :class="['text-[10px] px-2 py-0.5 rounded-full font-bold', item.badgeClass]">
                {{ item.displayType }}
              </span>
            </button>
          </li>
          <li v-if="filteredSubLedgers.length === 0" class="text-center py-4 text-gray-400 text-xs">
            لا توجد نتائج مطابقة للبحث أو التصنيف الحالي
          </li>
        </ul>
      </div>

      <p
        v-if="validationErrors?.sub_ledger_id || validationErrors?.account_id"
        class="text-rose-500 text-xs mt-1 font-bold"
      >
        يرجى تحديد حساب مستهدف صحيح من القائمة
      </p>
    </div>

    <hr class="border-gray-100 dark:border-surface-border/50 my-2" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <AppCurrencyInput
          id="voucher-amount"
          label="المبلغ المالي *"
          v-model="form.amount"
          placeholder="0.00"
          required
        />
        <p v-if="validationErrors?.amount" class="text-rose-500 text-xs mt-1 font-bold">
          {{ validationErrors.amount[0] }}
        </p>
      </div>

      <div>
        <label
          for="voucher-date"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          تاريخ السند ووقت الاستحقاق <span class="text-rose-500">*</span>
        </label>
        <input
          id="voucher-date"
          type="date"
          v-model="form.voucher_date"
          class="block w-full px-3 py-1.5 border border-gray-300 dark:border-surface-border rounded-lg bg-surface-ground text-gray-900 dark:text-text-primary focus:ring-1 focus:ring-primary outline-none transition-all sm:text-sm font-medium"
          required
        />
        <p v-if="validationErrors?.voucher_date" class="text-rose-500 text-xs mt-1 font-bold">
          {{ validationErrors.voucher_date[0] }}
        </p>
      </div>
    </div>

    <div>
      <AppTextarea
        id="voucher-notes"
        label="البيان والشرح التفصيلي للمستند"
        v-model="form.notes"
        placeholder="اكتب هنا تفاصيل سبب الصرف، الإيراد أو التحويل الداخلي..."
        :rows="2"
      />
      <p v-if="validationErrors?.notes" class="text-rose-500 text-xs mt-1 font-bold">
        {{ validationErrors.notes[0] }}
      </p>
    </div>

    <div
      class="flex justify-end space-x-2 space-x-reverse border-t border-surface-border pt-3 mt-4"
    >
      <AppButton type="button" variant="secondary" @click="handleCancel">إلغاء</AppButton>
      <AppButton type="submit" :disabled="isSaving" variant="primary">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ واعتماد السند المالي</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useSupplierStore } from '@/stores/supplierStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useUserStore } from '@/stores/userStore'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useBankStore } from '@/stores/bankStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'

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
})

const emit = defineEmits(['submit', 'cancel'])

const supplierStore = useSupplierStore()
const customerStore = useCustomerStore()
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const treasuryStore = useTreasuryStore()
const bankStore = useBankStore()

const { suppliers, loading: suppliersLoading } = storeToRefs(supplierStore)
const { customers, loading: customersLoading } = storeToRefs(customerStore)
const { expenses, loading: expensesLoading } = storeToRefs(expenseStore)
const { users: designers, loading: designersLoading } = storeToRefs(userStore)
const { banks, loading: banksLoading } = storeToRefs(bankStore)
const { treasuries, loading: treasuriesLoading } = storeToRefs(treasuryStore)

const isDropdownOpen = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')
const selectedLedgerName = ref('')
const searchInputRef = ref(null)

const isDataLoading = computed(() => {
  return (
    suppliersLoading.value ||
    customersLoading.value ||
    expensesLoading.value ||
    designersLoading.value ||
    banksLoading.value ||
    treasuriesLoading.value
  )
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

const designersAccount = computed(() => {
  return props.accounts.find((acc) => acc.code === '2103') || null
})

onMounted(async () => {
  try {
    const promises = []
    if (expenses.value.length === 0)
      promises.push(expenseStore.fetchExpenses(1, { per_page: 1000 }))
    if (suppliers.value.length === 0)
      promises.push(supplierStore.fetchSuppliers(1, { per_page: 1000 }))
    if (customers.value.length === 0)
      promises.push(customerStore.fetchCustomers(1, { per_page: 1000 }))
    if (designers.value.length === 0)
      promises.push(userStore.fetchUsers(1, { type: 'designer', per_page: 1000 }))

    if (treasuries.value.length === 0)
      promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
    if (banks.value.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))

    if (promises.length > 0) {
      await Promise.all(promises)
    }
    syncSelectedLedgerName()
  } catch (err) {
    console.error('Failed to load sub-ledger data for voucher search field:', err)
  }
})

const unifiedSubLedgers = computed(() => {
  const list = []

  expenses.value.forEach((item) => {
    list.push({
      composite_key: `expense:${item.id}`,
      id: item.id,
      type: 'expense',
      account_id: item.account_id,
      name: item.name,
      displayType: 'مصروف',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400',
    })
  })

  suppliers.value.forEach((item) => {
    list.push({
      composite_key: `supplier:${item.id}`,
      id: item.id,
      type: 'supplier',
      account_id: item.account_id,
      name: item.name,
      displayType: 'مورد',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    })
  })

  customers.value.forEach((item) => {
    list.push({
      composite_key: `customer:${item.id}`,
      id: item.id,
      type: 'customer',
      account_id: item.account_id,
      name: item.name,
      displayType: 'عميل',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    })
  })

  designers.value.forEach((item) => {
    list.push({
      composite_key: `designer:${item.id}`,
      id: item.id,
      type: 'designer',
      account_id: designersAccount.value?.id || '',
      name: item.full_name,
      displayType: 'مصمم',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
    })
  })

  banks.value.forEach((item) => {
    list.push({
      composite_key: `bank:${item.id}`,
      id: item.id,
      type: 'bank',
      account_id: item.account_id,
      name: item.name,
      displayType: 'بنك',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
    })
  })

  treasuries.value.forEach((item) => {
    list.push({
      composite_key: `treasury:${item.id}`,
      id: item.id,
      type: 'treasury',
      account_id: item.account_id,
      name: item.name,
      displayType: 'خزنة',
      badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400',
    })
  })

  return list
})

const filteredSubLedgers = computed(() => {
  return unifiedSubLedgers.value.filter((item) => {
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'bank_treasury'
        ? item.type === 'bank' || item.type === 'treasury'
        : item.type === activeTab.value)
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const selectLedger = (item) => {
  if (item.type === 'designer') {
    const dynamicAcc = props.accounts.find((a) => a.code === '2103')
    form.value.account_id = dynamicAcc ? dynamicAcc.id : item.account_id
  } else if (item.type === 'bank') {
    const dynamicAcc = props.accounts.find((a) => a.code === '1102')
    form.value.account_id = dynamicAcc ? dynamicAcc.id : item.account_id
  } else if (item.type === 'treasury') {
    const dynamicAcc = props.accounts.find((a) => a.code === '1101')
    form.value.account_id = dynamicAcc ? dynamicAcc.id : item.account_id
  } else {
    form.value.account_id = item.account_id
  }

  form.value.sub_ledger_type = item.type
  form.value.sub_ledger_id = item.id
  selectedLedgerName.value = `${item.name} (${item.displayType})`
  isDropdownOpen.value = false
  searchQuery.value = ''
}

const syncSelectedLedgerName = () => {
  if (form.value.sub_ledger_type && form.value.sub_ledger_id) {
    const target = unifiedSubLedgers.value.find(
      (item) => item.type === form.value.sub_ledger_type && item.id == form.value.sub_ledger_id,
    )
    if (target) {
      selectedLedgerName.value = `${target.name} (${target.displayType})`
    } else {
      selectedLedgerName.value = 'حساب مساعد تم تحديده مسبقاً'
    }
  } else {
    selectedLedgerName.value = ''
  }
}

// [حماية استراتيجية ثنائية المسار]: ربط الـ v-model بمعرّف الـ ID الفرعي لثبات الاختيار داخل الكومبوننت وعدم تفريغه
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
        // لضمان استقرار الـ Dropdown ومنع اختفاء النص؛ نحتفظ بـ id الفرعي في الواجهة
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

      // مطابقة بيانات التعديل وتحويل الـ account_id إلى المعرف الفرعي المقابل لتأمين العرض عند التعديل
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
      syncSelectedLedgerName()
    } else {
      form.value = createFreshForm()
      selectedLedgerName.value = ''
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => unifiedSubLedgers.value,
  () => {
    syncSelectedLedgerName()
  },
  { deep: true },
)

const handlePaymentMethodChange = () => {
  form.value.fund_account_id = ''
  form.value.treasury_id = null
  form.value.bank_id = null
}

// [حماية لحظة الإرسال]: نقوم بتحويل المعرّف الفرعي إلى الـ account_id المطلوب في شجرة الحسابات بالباك إند آلياً هنا
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
