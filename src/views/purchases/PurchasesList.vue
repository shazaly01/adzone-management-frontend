<!--src\views\purchases\PurchasesList.vue--->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-black text-text-primary">إدارة فواتير المشتريات</h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض، تتبع، وفلترة حركة المشتريات ومرتجع المشتريات ومراقبة تأثيرها المالي والمخزني.
        </p>
      </div>
      <AppButton type="button" @click="goToCreatePage"> إضافة فاتورة جديدة </AppButton>
    </div>

    <PurchaseFilters
      v-model:searchQuery="searchQuery"
      v-model:invoiceTypeFilter="invoiceTypeFilter"
      v-model:storeFilter="storeFilter"
      v-model:supplierFilter="supplierFilter"
      :stores="storeStore.stores"
      :suppliers="supplierStore.suppliers"
      @update:searchQuery="onSearch"
      @update:invoiceTypeFilter="handlePageChange(1)"
      @update:storeFilter="handlePageChange(1)"
      @update:supplierFilter="handlePageChange(1)"
    />

    <PurchaseTable
      :purchases="purchases"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-purchase="goToEditPage"
      @delete-purchase="openDeleteDialog"
      @row-clicked="goToEditPage"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وحذف مستند المشتريات"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء الفاتورة رقم '#${purchaseToDelete?.id}'؟ سيترتب على هذا الإجراء تراجع فوري في كميات المستودع الحاضن وعكس الأثر المالي في حساب المورد وبنود الضريبة.`"
      @confirmed="deleteSelectedPurchase"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchaseStore'
import { useStoreStore } from '@/stores/storeStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات الفرعية التخصصية وأدوات الـ UI
import AppButton from '@/components/ui/AppButton.vue'
import PurchaseFilters from './PurchaseFilters.vue'
import PurchaseTable from './PurchaseTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة محركات إدارة البيانات والتوجيه للواجهة الكاملة
const router = useRouter()
const toast = useToast()

const purchaseStore = usePurchaseStore()
const storeStore = useStoreStore()
const supplierStore = useSupplierStore()

const { purchases, loading, pagination } = storeToRefs(purchaseStore)

// متغيرات الفلترة والبحث المحلية داخل الموديول
const searchQuery = ref('')
const invoiceTypeFilter = ref('')
const storeFilter = ref('')
const supplierFilter = ref('')
let searchTimeout = null

// محرك الفلترة النصية الذكي مع Debounce لنصف ثانية منعا لإرهاق الخادم
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// دالة تجميع الفلاتر وطلب جلب الفواتير المحدثة من السيرفر بالتوافق مع الستور
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    invoice_type: invoiceTypeFilter.value,
    store_id: storeFilter.value,
    supplier_id: supplierFilter.value,
  }

  purchaseStore.fetchPurchases(page, filters).catch(() => {
    toast.error('فشل النظام في جلب مستندات المشتريات المحدثة من الخادم.')
  })
}

// شحن وتغذية القوائم الاستراتيجية للفلترة والبحث فور تحميل المكون
onMounted(async () => {
  handlePageChange(1)

  // طلب المستودعات والموردين لتغذية فلاتر البحث
  await Promise.all([
    storeStore.fetchStores(1, { is_active: 1 }),
    supplierStore.fetchSuppliers(1, { is_active: 1 }),
  ])
})

// --- محرك التوجيه البرمجي للشاشات الكاملة (Full Screen Routing Leap) ---

const goToCreatePage = () => {
  router.push('/app/purchases/create')
}

const goToEditPage = (purchase) => {
  router.push(`/app/purchases/${purchase.id}/edit`)
}

// --- معالجة عمليات الحذف والاستبعاد الصارم من قاعدة البيانات النشطة ---
const isDeleteDialogOpen = ref(false)
const purchaseToDelete = ref(null)

const openDeleteDialog = (purchase) => {
  purchaseToDelete.value = purchase
  isDeleteDialogOpen.value = true
}

const deleteSelectedPurchase = async () => {
  if (purchaseToDelete.value) {
    try {
      await purchaseStore.deletePurchase(purchaseToDelete.value.id)
      toast.success(
        `تم حذف وإلغاء مستند المشتريات رقم '#${purchaseToDelete.value.id}' وعكس أثره بنجاح.`,
      )

      // التحقق من سلامة مؤشر الترقيم التلقائي بعد الحذف مباشرة لضمان تجربة مستخدم نظيفة
      if (purchases.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = purchaseStore.error || 'فشلت عملية إلغاء وحذف المستند من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      purchaseToDelete.value = null
    }
  }
}
</script>
