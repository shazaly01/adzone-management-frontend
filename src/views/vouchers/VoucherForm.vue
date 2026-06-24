<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- نوع السند المالي -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            نوع السند المالي <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="form.voucher_type"
            class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            required
          >
            <option value="payment">سند صرف</option>
            <option value="receipt">سند قبض</option>
          </select>
          <p v-if="validationErrors?.voucher_type" class="text-rose-500 text-xs mt-1 font-bold">
            {{ validationErrors.voucher_type[0] }}
          </p>
        </div>

        <!-- طريقة الدفع والنقدية -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            طريقة الدفع والنقدية <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="form.payment_method"
            @change="handlePaymentMethodChange"
            class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            required
          >
            <option value="cash">نقدي</option>
            <option value="bank">بنكي</option>
          </select>
          <p v-if="validationErrors?.payment_method" class="text-rose-500 text-xs mt-1 font-bold">
            {{ validationErrors.payment_method[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- حساب النقدية المتأثر (خزينة أو بنك) -->
        <div>
          <TreasuriesDropdown
            v-if="form.payment_method === 'cash'"
            id="fund-treasury-id"
            label="الخزينة المالية المتأثرة"
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

        <!-- الحساب المستهدف (الجهة المورفية المساعدة) -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            الحساب المستهدف (الجهة المستلمة/المسلمة) <span class="text-rose-500">*</span>
          </label>

          <div class="relative">
            <input
              type="text"
              readonly
              :value="selectedLedgerName"
              @click="toggleDropdown"
              placeholder="اضغط هنا للبحث واختيار الجهة أو الحساب المساعد..."
              class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm cursor-pointer text-right"
              required
            />
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span class="text-gray-400 text-xs">▼</span>
            </div>
          </div>

          <!-- القائمة المنسدلة التحليلية الموحدة -->
          <div
            v-if="isDropdownOpen"
            class="absolute z-50 mt-1 w-full bg-white dark:bg-surface-ground border border-surface-border rounded-lg shadow-xl p-3 space-y-3"
          >
            <!-- أشرطة التبويب للتصفية السريعة (مضافاً إليها المصممون) -->
            <div class="flex flex-wrap gap-1 bg-gray-50 dark:bg-surface-border p-1 rounded-md">
              <button
                type="button"
                @click="activeTab = 'all'"
                :class="[
                  'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
                  activeTab === 'all'
                    ? 'bg-white dark:bg-surface-ground text-primary shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
                ]"
              >
                الكل
              </button>
              <button
                type="button"
                @click="activeTab = 'expense'"
                :class="[
                  'flex-1 text-xs py-1.5 px-2 rounded font-medium transition-all text-center',
                  activeTab === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400',
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
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400',
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
                    ? 'bg-blue-500 text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400',
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
                    ? 'bg-purple-500 text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400',
                ]"
              >
                المصممون
              </button>
            </div>

            <!-- حقل البحث الفوري المحصن -->
            <input
              type="text"
              v-model="searchQuery"
              ref="searchInputRef"
              placeholder="اكتب اسم الحساب أو المصروف أو المصمم للبحث الفوري..."
              class="block w-full px-3 py-1.5 border border-surface-border rounded-md bg-gray-50 dark:bg-surface-border text-text-primary focus:ring-2 focus:ring-primary outline-none text-sm"
            />

            <!-- مؤشر جاري جلب الحسابات -->
            <div v-if="isDataLoading" class="text-center py-4 text-xs text-gray-400">
              جاري تحديث جلب الحسابات المساعدة...
            </div>

            <!-- قائمة عرض العناصر الممررة والمدمجة -->
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
                  <span
                    :class="['text-[10px] px-2 py-0.5 rounded-full font-bold', item.badgeClass]"
                  >
                    {{ item.displayType }}
                  </span>
                </button>
              </li>
              <li
                v-if="filteredSubLedgers.length === 0"
                class="text-center py-4 text-gray-400 text-xs"
              >
                لا توجد نتائج مطابقة للبحث أو التصنيف الحالي
              </li>
            </ul>
          </div>

          <p
            v-if="validationErrors?.sub_ledger_id || validationErrors?.account_id"
            class="text-rose-500 text-xs mt-1 font-bold"
          >
            يرجى تحديد حساب مستهدف صحيح من القائمة المنسدلة
          </p>
        </div>
      </div>

      <!-- حقول المبالغ المالية والتاريخ للقيود التلقائية -->
      <div class="border-t border-surface-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppCurrencyInput
            id="voucher-amount"
            label="المبلغ المالي"
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
            class="block w-full px-3 py-2 border border-gray-300 dark:border-surface-border rounded-lg bg-gray-50 dark:bg-surface-ground text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            required
          />
          <p v-if="validationErrors?.voucher_date" class="text-rose-500 text-xs mt-1 font-bold">
            {{ validationErrors.voucher_date[0] }}
          </p>
        </div>
      </div>

      <!-- البيان والشرح المالي التفصيلي -->
      <div>
        <AppTextarea
          id="voucher-notes"
          label="البيان والشرح التفصيلي للمستند"
          v-model="form.notes"
          placeholder="اكتب هنا تفاصيل سبب الصرف أو الإيراد بالتفصيل للقيود اليومية..."
          :rows="3"
        />
        <p v-if="validationErrors?.notes" class="text-rose-500 text-xs mt-1 font-bold">
          {{ validationErrors.notes[0] }}
        </p>
      </div>
    </div>

    <!-- أزرار الإجراءات والاعتماد المالي المباشر -->
    <div
      class="mt-8 flex justify-end space-x-3 space-x-reverse border-t border-surface-border pt-4"
    >
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving" variant="primary">
        <span v-if="isSaving">جاري معالجة وحفظ السند...</span>
        <span v-else>حفظ واعتماد السند المالي</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد مخازن الحالة الخمسة لضمان التوافق التام والربط التحليلي المزدوج للأرصدة
import { useSupplierStore } from '@/stores/supplierStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useUserStore } from '@/stores/userStore'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useBankStore } from '@/stores/bankStore'

// استيراد مكونات الـ UI والـ Dropdowns المشغلة للنموذج
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

// استهلاك وتفعيل الـ Stores بالكامل
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

// الحالات المحلية لإدارة التحكم بالواجهة والبحث والقوائم المنسدلة
const isDropdownOpen = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')
const selectedLedgerName = ref('')
const searchInputRef = ref(null)

// حالة التحميل المشتركة للقوائم المساعدة من السيرفر
const isDataLoading = computed(() => {
  return (
    suppliersLoading.value ||
    customersLoading.value ||
    expensesLoading.value ||
    designersLoading.value ||
    treasuryStore.loading ||
    bankStore.loading
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
    treasury_id: null, // [تحصين مالي]: حقن الحقل لحل مشكلة السندات النقدية
    bank_id: null, // [تحصين مالي]: حقن الحقل لحل مشكلة السندات البنكية
    amount: '',
    voucher_date: today,
    notes: '',
  }
}

const form = ref(createFreshForm())

// البحث التلقائي والدقيق عن معرف الحساب التجميعي لذمم المصممين (كود 2103)
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

    // شحن بيانات الخزائن والبنوك في الذاكرة لتأمين المطابقة الجارية للأرقام المورفية
    if (treasuryStore.treasuries.length === 0)
      promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
    if (bankStore.banks.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))

    if (promises.length > 0) {
      await Promise.all(promises)
    }
    syncSelectedLedgerName()
  } catch (err) {
    console.error('Failed to load sub-ledger data for voucher search field:', err)
  }
})

// تجميع الكيانات المساعدة في مصفوفة موحدة ذكية ومورفية للبحث والاختيار السريع
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
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
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
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
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
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
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
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    })
  })

  return list
})

const filteredSubLedgers = computed(() => {
  return unifiedSubLedgers.value.filter((item) => {
    const matchesTab = activeTab.value === 'all' || item.type === activeTab.value
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

// دالة الاختيار الفوري للجهة المستهدفة
const selectLedger = (item) => {
  // حماية استراتيجية: إعادة التحقق اللحظي من شجرة الحسابات لمنع ثغرة الـLatency والـ undefined للمصممين
  if (item.type === 'designer') {
    const dynamicAcc = props.accounts.find((a) => a.code === '2103')
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

// [رقابة دفاعية صارمة]: مراقبة صندوق النقدية المتأثر ومطابقته فورياً لحل مشكلة غياب الـ treasury_id نهائياً
watch(
  () => form.value.fund_account_id,
  (newVal) => {
    if (!newVal) {
      form.value.treasury_id = null
      form.value.bank_id = null
      return
    }

    if (form.value.payment_method === 'cash') {
      // البحث بالـ account_id أو الـ id لتأمين التوافق مع أي قيمة ترجعها القائمة المنسدلة
      const target = treasuryStore.treasuries.find((t) => t.account_id == newVal || t.id == newVal)
      if (target) {
        form.value.treasury_id = target.id
        // إذا أرجعت القائمة معرف الـ id الفرعي، نقوم بتصحيح حقل fund_account_id ليرسل كود الحساب المالي المعتمد للباك إند
        if (form.value.fund_account_id == target.id && target.id !== target.account_id) {
          form.value.fund_account_id = target.account_id
        }
      }
    } else if (form.value.payment_method === 'bank') {
      const target = bankStore.banks.find((b) => b.account_id == newVal || b.id == newVal)
      if (target) {
        form.value.bank_id = target.id
        if (form.value.fund_account_id == target.id && target.id !== target.account_id) {
          form.value.fund_account_id = target.account_id
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
      form.value = {
        id: newData.id,
        voucher_type: newData.voucher_type || 'payment',
        account_id: newData.account_id || '',
        sub_ledger_type: newData.sub_ledger_type || '',
        sub_ledger_id: newData.sub_ledger_id || null,
        payment_method: newData.payment_method || 'cash',
        fund_account_id: newData.fund_account_id || '',
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

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
