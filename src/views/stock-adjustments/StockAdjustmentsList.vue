<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">إدارة التسويات الجردية</h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض، تتبع، وفلترة حركات التسوية الجردية للمستودعات ومراقبة تأثيرها المالي واللحظي على
          الكميات الدفترية والفروقات.
        </p>
      </div>
      <AppButton type="button" @click="goToCreatePage"> إضافة تسوية جديدة </AppButton>
    </div>

    <StockAdjustmentFilters
      v-model:searchQuery="searchQuery"
      v-model:storeFilter="storeFilter"
      :stores="storeStore.stores"
      @update:searchQuery="onSearch"
      @update:storeFilter="handlePageChange(1)"
    />

    <StockAdjustmentTable
      :adjustments="stockAdjustments"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-adjustment="goToEditPage"
      @delete-adjustment="openDeleteDialog"
      @row-clicked="goToEditPage"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وحذف مستند التسوية الجردية"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء مستند التسوية الجردية رقم '#${adjustmentToDelete?.adjustment_number || adjustmentToDelete?.id}'؟ سيترتب على هذا الإجراء تراجع فوري وعكس الأثر المالي المحتسب لفروقات الجرد وإعادة الأرصدة الدفترية السابقة في المستودع الحاضن.`"
      @confirmed="deleteSelectedAdjustment"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStockAdjustmentStore } from '@/stores/stockAdjustmentStore'
import { useStoreStore } from '@/stores/storeStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import StockAdjustmentFilters from './StockAdjustmentFilters.vue'
import StockAdjustmentTable from './StockAdjustmentTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const toast = useToast()

const stockAdjustmentStore = useStockAdjustmentStore()
const storeStore = useStoreStore()

// المزامنة الصارمة مع أسماء حقول الحالة (State) في الـ Store الصريح
const { stockAdjustments, loading, pagination } = storeToRefs(stockAdjustmentStore)

const searchQuery = ref('')
const storeFilter = ref('')
let searchTimeout = null

// محرك البحث الذكي المؤجل (Debounced Search) لتخفيف العبء على السيرفر
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// معالجة طلب الجلب والفلترة مع استدعاء الدالة المطابقة للستور الصريح fetchStockAdjustments
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    store_id: storeFilter.value,
  }

  stockAdjustmentStore.fetchStockAdjustments(page, filters).catch(() => {
    toast.error('فشل النظام في جلب مستندات التسوية الجردية المحدثة من الخادم.')
  })
}

onMounted(async () => {
  // تشغيل الجلب المبدئي للصفحة الأولى
  handlePageChange(1)

  // تغذية فلاتر التصفية بالمستودعات النشطة
  await storeStore.fetchStores(1, { is_active: 1 })
})

const goToCreatePage = () => {
  router.push('/app/stock-adjustments/create')
}

const goToEditPage = (adjustment) => {
  router.push(`/app/stock-adjustments/${adjustment.id}/edit`)
}

const isDeleteDialogOpen = ref(false)
const adjustmentToDelete = ref(null)

const openDeleteDialog = (adjustment) => {
  adjustmentToDelete.value = adjustment
  isDeleteDialogOpen.value = true
}

// تنفيذ الحذف الصارم وعكس الحركات المالية والمخزنية بالكامل عبر دالة deleteStockAdjustment المطابقة للستور
const deleteSelectedAdjustment = async () => {
  if (adjustmentToDelete.value) {
    try {
      await stockAdjustmentStore.deleteStockAdjustment(adjustmentToDelete.value.id)
      toast.success(
        `تم حذف وإلغاء مستند التسوية الجردية رقم '#${adjustmentToDelete.value.adjustment_number || adjustmentToDelete.value.id}' وعكس أثره بنجاح.`,
      )

      // إعادة توازن الصفحة الحالية بعد الحذف
      if (stockAdjustments.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage =
        stockAdjustmentStore.error || 'فشلت عملية إلغاء وحذف مستند التسوية الجردية من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      adjustmentToDelete.value = null
    }
  }
}
</script>
