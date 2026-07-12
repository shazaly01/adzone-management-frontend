import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '@/stores/customerStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { useBankStore } from '@/stores/bankStore'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useUserStore } from '@/stores/userStore'

export function useSubLedgerInfrastructure() {
  const customerStore = useCustomerStore()
  const supplierStore = useSupplierStore()
  const bankStore = useBankStore()
  const treasuryStore = useTreasuryStore()
  const userStore = useUserStore()

  const { customers, loading: customersLoading } = storeToRefs(customerStore)
  const { suppliers, loading: suppliersLoading } = storeToRefs(supplierStore)
  const { banks, loading: banksLoading } = storeToRefs(bankStore)
  const { treasuries, loading: treasuriesLoading } = storeToRefs(treasuryStore)
  const { users: designers, loading: designersLoading } = storeToRefs(userStore)

  // تحميل كافة الحسابات التحليلية دفعة واحدة عند بناء التقرير لمنع تكرار الطلبات
  onMounted(async () => {
    try {
      const promises = []

      if (customers.value.length === 0)
        promises.push(customerStore.fetchCustomers(1, { per_page: 1000 }))
      if (suppliers.value.length === 0)
        promises.push(supplierStore.fetchSuppliers(1, { per_page: 1000 }))
      if (banks.value.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))
      if (treasuries.value.length === 0)
        promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
      if (designers.value.length === 0) {
        promises.push(userStore.fetchUsers(1, { type: 'designer', per_page: 1000 }))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }
    } catch (err) {
      console.error('Failed to pre-load all sub-ledger infrastructure entries in composable:', err)
    }
  })

  // دمج المتاجر الخمسة ديناميكياً في قائمة موحدة لخدمة كرت التصفية والبحث
  const unifiedSubLedgers = computed(() => {
    const list = []

    customers.value.forEach((item) => {
      list.push({
        composite_key: `customer:${item.id}`,
        id: item.id,
        type: 'App\\Models\\Customer',
        name: item.name,
        displayType: 'عميل',
        badgeClass: 'bg-blue-900/40 text-blue-400 border-blue-800/60',
      })
    })

    suppliers.value.forEach((item) => {
      list.push({
        composite_key: `supplier:${item.id}`,
        id: item.id,
        type: 'App\\Models\\Supplier',
        name: item.name,
        displayType: 'مورد',
        badgeClass: 'bg-amber-900/40 text-amber-400 border-amber-800/60',
      })
    })

    banks.value.forEach((item) => {
      list.push({
        composite_key: `bank:${item.id}`,
        id: item.id,
        type: 'App\\Models\\Bank',
        name: item.name,
        displayType: 'بنك/محفظة',
        badgeClass: 'bg-indigo-900/40 text-indigo-400 border-indigo-800/60',
      })
    })

    treasuries.value.forEach((item) => {
      list.push({
        composite_key: `treasury:${item.id}`,
        id: item.id,
        type: 'App\\Models\\Treasury',
        name: item.name,
        displayType: 'خزنة مالية',
        badgeClass: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/60',
      })
    })

    designers.value.forEach((item) => {
      list.push({
        composite_key: `designer:${item.id}`,
        id: item.id,
        type: 'App\\Models\\User',
        name: item.full_name,
        displayType: 'مصمم/مساعد',
        badgeClass: 'bg-purple-900/40 text-purple-400 border-purple-800/60',
      })
    })

    return list
  })

  const isDataLoading = computed(() => {
    return (
      customersLoading.value ||
      suppliersLoading.value ||
      banksLoading.value ||
      treasuriesLoading.value ||
      designersLoading.value
    )
  })

  return {
    unifiedSubLedgers,
    isDataLoading,
  }
}
