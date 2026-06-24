<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة الموردين</h1>
      <AppButton v-if="authStore.can('supplier.create')" @click="openSupplierModal()">
        إضافة مورد
      </AppButton>
    </div>

    <SuppliersFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <SuppliersTable
      :suppliers="suppliers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-supplier="openSupplierModal"
      @delete-supplier="openDeleteDialog"
      @row-clicked="openSupplierModal"
    />

    <SupplierModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :supplier="selectedSupplier"
      :is-saving="loading"
      @save="handleSaveSupplier"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المورد"
      :message="`هل أنت متأكد من رغبتك في حذف المورد '${supplierToDelete?.name}'؟ سيترتب على هذا الإجراء إزالة الارتباطات المالية والمحاسبية الخاصة به في حال عدم وجود حركات معلقة.`"
      @confirmed="deleteSelectedSupplier"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupplierStore } from '@/stores/supplierStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد قطع الليغو المكونة للموديول ومكونات الواجهة الموحدة
import AppButton from '@/components/ui/AppButton.vue'
import SuppliersFilter from './SuppliersFilter.vue'
import SuppliersTable from './SuppliersTable.vue'
import SupplierModal from './SupplierModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة الستور المستنتج وإدارة الحالات المشتركة للموردين
const supplierStore = useSupplierStore()
const authStore = useAuthStore()
const { suppliers, loading, pagination } = storeToRefs(supplierStore)
const toast = useToast()

// متغيرات التصفية والبحث المحلي للموردين
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// آلية البحث الذكي Debouncing لمنع تكرار ضربات الـ API أثناء الكتابة السريعة
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة دائماً لصفحة البداية عند كتابة نص بحث جديد
  }, 500)
}

// دالة جلب البيانات من الستور بناء على الفلاتر المدخلة والترقيم
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  supplierStore.fetchSuppliers(page, filters).catch(() => {
    toast.error(supplierStore.error || 'حدث خطأ أثناء محاولة جلب بيانات الموردين.')
  })
}

// إطلاق الجلب الأولي فور تركيب الشاشة
onMounted(() => {
  handlePageChange()
})

// --- إدارة العمليات والحالات داخل مودال الإضافة والتعديل ---
const isModalOpen = ref(false)
const selectedSupplier = ref(null)

const openSupplierModal = (supplier = null) => {
  if (supplier && !authStore.can('supplier.update')) {
    toast.error('عذراً، لا تمتلك الصلاحيات الكافية لتعديل بيانات هذا المورد.')
    return
  }
  selectedSupplier.value = supplier ? { ...supplier } : null
  isModalOpen.value = true
}

const handleSaveSupplier = async (formData) => {
  try {
    if (formData.id) {
      await supplierStore.updateSupplier(formData.id, formData)
      toast.success(`تم تحديث بيانات المورد '${formData.name}' بنجاح.`)
    } else {
      await supplierStore.createSupplier(formData)
      toast.success(`تم تسجيل المورد الجديد '${formData.name}' بنجاح في النظام.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      supplierStore.error ||
      error.response?.data?.message ||
      'تعذر حفظ بيانات المورد بسبب خطأ في الخادم.'
    toast.error(errorMessage)
  }
}

// --- إدارة حوار النوافذ التفاعلية لعمليات حذف المورد الآمن ---
const isDeleteDialogOpen = ref(false)
const supplierToDelete = ref(null)

const openDeleteDialog = (supplier) => {
  supplierToDelete.value = supplier
  isDeleteDialogOpen.value = true
}

const deleteSelectedSupplier = async () => {
  if (supplierToDelete.value) {
    try {
      await supplierStore.deleteSupplier(supplierToDelete.value.id)
      toast.success(
        `تم استبعاد وحذف المورد '${supplierToDelete.value.name}' بنجاح من قاعدة البيانات.`,
      )

      // معايرة رقم الصفحة التلقائي في حال تم حذف العنصر الأخير في الصفحة الحالية
      if (suppliers.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        supplierStore.error ||
        error.response?.data?.message ||
        'فشلت عملية حذف المورد لوجود حركات مالية محاسبية مرتبطة به.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      supplierToDelete.value = null
    }
  }
}
</script>
