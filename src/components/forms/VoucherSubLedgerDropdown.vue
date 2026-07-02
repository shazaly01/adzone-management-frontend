<!--src\components\forms\VoucherSubLedgerDropdown.vue--->
<template>
  <div class="relative w-full">
    <!-- دعم رندرة العنوان الموجه محاسبياً بشكل متناسق مع النمط الجديد -->
    <label v-if="label" class="block text-xs font-bold text-gray-300 mb-1.5 pr-1">
      {{ label }}
    </label>

    <!-- الإطار الرئيسي للمنسدلة - مطابق تماماً لهيكل حقول شاشات المبيعات والـ AppDropdown -->
    <div
      class="relative w-full h-11 bg-[#16171b] border border-[#3e414c] rounded-lg flex items-center transition-all duration-200 hover:border-[#e05e2b] focus-within:border-[#e05e2b] focus-within:shadow-[0_0_10px_rgba(224,94,43,0.15)] cursor-pointer"
      @click="toggleDropdown"
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

      <input
        type="text"
        readonly
        :value="selectedLedgerName"
        placeholder="اضغط لاختيار الحساب المساعد (مورد، عميل، مصروف)..."
        class="block w-full h-full pr-10 pl-10 bg-transparent text-white focus:outline-none text-xs font-bold placeholder-gray-500 cursor-pointer text-right"
        required
      />

      <span class="absolute left-4 text-gray-500 pointer-events-none text-[10px]">▼</span>
    </div>

    <!-- لوحة الخيارات المنسدلة (Dropdown Panel) الموحدة داكناً بنسبة 100% -->
    <div
      v-if="isDropdownOpen"
      class="absolute right-0 z-50 mt-1 w-full bg-[#1a1b20] border border-[#383b45] rounded-lg shadow-2xl p-3 space-y-3 animate-fade-in"
    >
      <!-- شريط تصنيفات التبويب المطور بألوان الهيدر العازل -->
      <div class="flex flex-wrap gap-1 bg-[#25272e] border border-[#383b45] p-1 rounded-md">
        <button
          type="button"
          @click="activeTab = 'all'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded font-medium transition-all text-center',
            activeTab === 'all'
              ? 'bg-[#e05e2b] text-white shadow-sm font-bold'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          الكل
        </button>
        <button
          type="button"
          @click="activeTab = 'bank_treasury'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded font-medium transition-all text-center',
            activeTab === 'bank_treasury'
              ? 'bg-[#e05e2b] text-white shadow-sm font-bold'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          الخزائن والبنوك
        </button>
        <button
          type="button"
          @click="activeTab = 'expense'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded font-medium transition-all text-center',
            activeTab === 'expense'
              ? 'bg-[#e05e2b] text-white shadow-sm font-bold'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          المصروفات
        </button>
        <button
          type="button"
          @click="activeTab = 'supplier'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded font-medium transition-all text-center',
            activeTab === 'supplier'
              ? 'bg-[#e05e2b] text-white shadow-sm font-bold'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          الموردين
        </button>
        <button
          type="button"
          @click="activeTab = 'customer'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded font-medium transition-all text-center',
            activeTab === 'customer'
              ? 'bg-[#e05e2b] text-white shadow-sm font-bold'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          العملاء
        </button>
        <button
          type="button"
          @click="activeTab = 'designer'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded font-medium transition-all text-center',
            activeTab === 'designer'
              ? 'bg-[#e05e2b] text-white shadow-sm font-bold'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          المصممون
        </button>
      </div>

      <!-- مربع البحث الداخلي الموحد -->
      <input
        type="text"
        v-model="searchQuery"
        ref="searchInputRef"
        placeholder="اكتب اسم الحساب المساعد للبحث الفوري..."
        class="block w-full p-2 border rounded-md bg-[#25272e] border-[#383b45] text-white focus:outline-none focus:border-[#e05e2b] text-xs font-medium placeholder-gray-500"
      />

      <!-- مؤشر جلب البيانات الاستراتيجي -->
      <div v-if="isDataLoading" class="text-center py-4 text-xs text-gray-400 font-bold">
        جاري تحديث جلب الحسابات المساعدة...
      </div>

      <!-- قائمة الحسابات المنسابة بالـ Custom Scrollbar الموحد للمنشأة -->
      <ul
        v-else
        class="max-h-48 overflow-y-auto divide-y divide-[#383b45] text-xs custom-scrollbar"
      >
        <li v-for="item in filteredSubLedgers" :key="item.composite_key">
          <button
            type="button"
            @click="selectLedger(item)"
            :class="[
              'w-full text-right px-3 py-2.5 flex justify-between items-center transition-colors rounded-md text-xs font-bold',
              props.subLedgerType === item.type && props.subLedgerId == item.id
                ? 'bg-[#e05e2b]/20 text-[#e05e2b] font-black'
                : 'text-gray-300 hover:bg-[#25272e] hover:text-white',
            ]"
          >
            <span>{{ item.name }}</span>
            <span :class="['text-[10px] px-2 py-0.5 rounded-full font-bold', item.badgeClass]">
              {{ item.displayType }}
            </span>
          </button>
        </li>
        <li
          v-if="filteredSubLedgers.length === 0"
          class="text-center py-4 text-gray-500 text-xs font-medium"
        >
          لا توجد نتائج مطابقة للبحث أو التصنيف الحالي
        </li>
      </ul>
    </div>

    <!-- رسائل التحقق ومطابقة القيود -->
    <p
      v-if="validationErrors?.sub_ledger_id || validationErrors?.account_id"
      class="text-rose-500 text-[10px] font-bold mt-1 pr-1"
    >
      يرجى تحديد حساب مستهدف صحيح من القائمة
    </p>
  </div>
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

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  subLedgerType: {
    type: String,
    default: '',
  },
  subLedgerId: {
    type: [String, Number],
    default: null,
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

const emit = defineEmits(['update:subLedgerType', 'update:subLedgerId', 'update:accountId'])

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
      badgeClass: 'bg-rose-950/40 text-rose-400 border border-rose-900/50',
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
      badgeClass: 'bg-amber-950/40 text-amber-400 border border-amber-900/50',
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
      badgeClass: 'bg-blue-950/40 text-blue-400 border border-blue-900/50',
    })
  })

  designers.value.forEach((item) => {
    if (item.type === 'designer') {
      list.push({
        composite_key: `designer:${item.id}`,
        id: item.id,
        type: 'designer',
        account_id: designersAccount.value?.id || '',
        name: item.full_name,
        displayType: 'مصمم',
        badgeClass: 'bg-purple-950/40 text-purple-400 border border-purple-900/50',
      })
    }
  })

  banks.value.forEach((item) => {
    list.push({
      composite_key: `bank:${item.id}`,
      id: item.id,
      type: 'bank',
      account_id: item.account_id,
      name: item.name,
      displayType: 'بنك',
      badgeClass: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50',
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
      badgeClass: 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/50',
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
  let resolvedAccountId = ''

  if (item.type === 'designer') {
    const dynamicAcc = props.accounts.find((a) => a.code === '2103')
    resolvedAccountId = dynamicAcc ? dynamicAcc.id : item.account_id
  } else if (item.type === 'bank') {
    const dynamicAcc = props.accounts.find((a) => a.code === '1102')
    resolvedAccountId = dynamicAcc ? dynamicAcc.id : item.account_id
  } else if (item.type === 'treasury') {
    const dynamicAcc = props.accounts.find((a) => a.code === '1101')
    resolvedAccountId = dynamicAcc ? dynamicAcc.id : item.account_id
  } else {
    resolvedAccountId = item.account_id
  }

  emit('update:subLedgerType', item.type)
  emit('update:subLedgerId', item.id)
  emit('update:accountId', resolvedAccountId)

  selectedLedgerName.value = `${item.name} (${item.displayType})`
  isDropdownOpen.value = false
  searchQuery.value = ''
}

const syncSelectedLedgerName = () => {
  if (props.subLedgerType && props.subLedgerId) {
    const target = unifiedSubLedgers.value.find(
      (item) => item.type === props.subLedgerType && item.id == props.subLedgerId,
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

watch(
  () => [props.subLedgerType, props.subLedgerId],
  () => {
    syncSelectedLedgerName()
  },
)

watch(
  () => unifiedSubLedgers.value,
  () => {
    syncSelectedLedgerName()
  },
  { deep: true },
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #e05e2b;
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
