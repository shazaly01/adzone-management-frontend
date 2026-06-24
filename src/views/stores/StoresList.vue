<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة المخازن</h1>
      <AppButton v-if="authStore.can('store.create')" @click="openStoreModal()">
        إضافة مخزن
      </AppButton>
    </div>

    <StoresFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <StoresTable
      :stores="stores"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-store="openStoreModal"
      @delete-store="openDeleteDialog"
      @row-clicked="openStoreModal"
    />

    <StoreModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :store="selectedStore"
      :is-saving="loading"
      @save="handleSaveStore"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المخزن"
      :message="`هل أنت متأكد من رغبتك في حذف المخزن '${storeToDelete?.name}'؟ سيترتب على هذا الإجراء إزالة كافة الارتباطات والسلع المسجلة داخله.`"
      @confirmed="deleteSelectedStore"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/storeStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد قطع الليغو المكونة للموديول ومكونات الواجهة القياسية
import AppButton from '@/components/ui/AppButton.vue'
import StoresFilter from './StoresFilter.vue'
import StoresTable from './StoresTable.vue'
import StoreModal from './StoreModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة الستور وإدارة الحالات المشتركة بمخازن النظام
const storeStore = useStoreStore()
const authStore = useAuthStore()
const { stores, loading, pagination } = storeToRefs(storeStore)
const toast = useToast()

// متغيرات التصفية والبحث السريع المحلية
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// آلية البحث الذكي Debouncing لمنع تكرار طلبات الـ API أثناء الكتابة المتسلسلة
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة دائماً للصفحة الأولى عند بدء عملية بحث جديدة
  }, 500)
}

// دالة جلب البيانات من السيرفس وتحديث الحالات بناء على الفلاتر المختارة
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  storeStore.fetchStores(page, filters).catch(() => {
    toast.error(storeStore.error || 'حدث خطأ أثناء محاولة جلب بيانات المخازن.')
  })
}

// جلب البيانات الأولية فور تحميل ورندر المكون
onMounted(() => {
  handlePageChange()
})

// --- إدارة العمليات والحالات داخل مودال الإضافة والتعديل ---
const isModalOpen = ref(false)
const selectedStore = ref(null)

const openStoreModal = (store = null) => {
  if (store && !authStore.can('store.update')) {
    toast.error('ليست لديك الصلاحيات الكافية لتعديل بيانات هذا المخزن.')
    return
  }
  selectedStore.value = store ? { ...store } : null
  isModalOpen.value = true
}

const handleSaveStore = async (formData) => {
  try {
    if (formData.id) {
      await storeStore.updateStore(formData.id, formData)
      toast.success(`تم تحديث بيانات المخزن '${formData.name}' بنجاح.`)
    } else {
      await storeStore.createStore(formData)
      toast.success(`تمت إضافة المخزن الجديد '${formData.name}' بنجاح إلى النظام.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      storeStore.error ||
      error.response?.data?.message ||
      'تعذر حفظ بيانات المخزن بسبب خطأ غير متوقع.'
    toast.error(errorMessage)
  }
}

// --- إدارة حوار النوافذ لعمليات الحذف والاستبعاد الآمن ---
const isDeleteDialogOpen = ref(false)
const storeToDelete = ref(null)

const openDeleteDialog = (store) => {
  storeToDelete.value = store
  isDeleteDialogOpen.value = true
}

const deleteSelectedStore = async () => {
  if (storeToDelete.value) {
    try {
      await storeStore.deleteStore(storeToDelete.value.id)
      toast.success(`تم استبعاد وحذف المخزن '${storeToDelete.value.name}' بنجاح من النظام.`)

      // معايرة رقم الصفحة التلقائي في حال تم حذف العنصر الأخير في الصفحة الحالية
      if (stores.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        storeStore.error ||
        error.response?.data?.message ||
        'فشلت عملية حذف المخزن لوجود ارتباطات مخزنية معلقة.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      storeToDelete.value = null
    }
  }
}
</script>
