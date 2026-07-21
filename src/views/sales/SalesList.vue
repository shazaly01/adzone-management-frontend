<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">إدارة فواتير المبيعات</h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض، تتبع، وفلترة حركة المبيعات ومردودات المبيعات ومراقبة تأثيرها اللحظي على الأرصدة.
        </p>
      </div>
      <AppButton type="button" @click="goToCreatePage"> إضافة فاتورة جديدة </AppButton>
    </div>

    <SaleFilters
      v-model:searchQuery="searchQuery"
      v-model:invoiceTypeFilter="invoiceTypeFilter"
      v-model:storeFilter="storeFilter"
      v-model:customerFilter="customerFilter"
      v-model:fromDateFilter="fromDateFilter"
      v-model:toDateFilter="toDateFilter"
      @update:searchQuery="onSearch"
      @update:invoiceTypeFilter="handlePageChange(1)"
      @update:storeFilter="handlePageChange(1)"
      @update:customerFilter="handlePageChange(1)"
      @update:fromDateFilter="handlePageChange(1)"
      @update:toDateFilter="handlePageChange(1)"
    />

    <SaleTable
      :sales="sales"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-sale="goToEditPage"
      @delete-sale="openDeleteDialog"
      @row-clicked="goToEditPage"
      @print-sale="openPrintPage"
      @return-sale="goToReturnPage"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وحذف مستند المبيعات"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء الفاتورة رقم '#${saleToDelete?.id}'؟ سيترتب على هذا الإجراء تراجع فوري وعكس الأثر المالي في حساب العميل واقتطاع الأرصدة المستردة من المستودع الحاضن.`"
      @confirmed="deleteSelectedSale"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { useStoreStore } from '@/stores/storeStore'
import { useCustomerStore } from '@/stores/customerStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import SaleFilters from './SaleFilters.vue'
import SaleTable from './SaleTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const toast = useToast()

const saleStore = useSaleStore()
const storeStore = useStoreStore()
const customerStore = useCustomerStore()

const { sales, loading, pagination, currentPage, filters } = storeToRefs(saleStore)

// تهيئة القيم المحلية من الـ Store للحفاظ على القيم المحددة سابقاً
const searchQuery = ref(filters.value.search || '')
const invoiceTypeFilter = ref(filters.value.invoice_type || '')
const storeFilter = ref(filters.value.store_id || '')
const customerFilter = ref(filters.value.customer_id || '')
const fromDateFilter = ref(filters.value.from_date || '')
const toDateFilter = ref(filters.value.to_date || '')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = currentPage.value) => {
  const currentFilters = {
    search: searchQuery.value,
    invoice_type: invoiceTypeFilter.value,
    store_id: storeFilter.value,
    customer_id: customerFilter.value,
    from_date: fromDateFilter.value,
    to_date: toDateFilter.value,
  }

  saleStore.fetchSales(page, currentFilters).catch(() => {
    toast.error('فشل النظام في جلب مستندات المبيعات المحدثة من الخادم.')
  })
}

onMounted(async () => {
  // طلب الصفحة المحفوظة في الـ Store بدلاً من فرض الصفحة الأولى
  handlePageChange(currentPage.value)

  await Promise.all([
    storeStore.fetchStores(1, { is_active: 1 }),
    customerStore.fetchCustomers(1, { is_active: 1 }),
  ])
})

const goToCreatePage = () => {
  router.push('/app/sales/create')
}

const goToEditPage = (sale) => {
  router.push(`/app/sales/${sale.id}/edit`)
}

// [التوجيه الذكي للمردود]: فتح صفحة الإنشاء مع حقن معرف الفاتورة المرجعية في الـ Query
const goToReturnPage = (sale) => {
  router.push(`/app/sales/create?return_from=${sale.id}`)
}

const openPrintPage = (sale) => {
  window.open(`/print/sales/${sale.id}`, '_blank')
}

const isDeleteDialogOpen = ref(false)
const saleToDelete = ref(null)

const openDeleteDialog = (sale) => {
  saleToDelete.value = sale
  isDeleteDialogOpen.value = true
}

const deleteSelectedSale = async () => {
  if (saleToDelete.value) {
    try {
      await saleStore.deleteSale(saleToDelete.value.id)
      toast.success(`تم حذف وإلغاء مستند المبيعات رقم '#${saleToDelete.value.id}' وعكس أثره بنجاح.`)

      if (sales.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = saleStore.error || 'فشلت عملية إلغاء وحذف مستند المبيعات من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      saleToDelete.value = null
    }
  }
}
</script>
