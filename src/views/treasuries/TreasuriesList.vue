<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة الخزائن المالية</h1>
      <AppButton v-if="authStore.can('treasury.create')" @click="openTreasuryModal()">
        إضافة خزنة
      </AppButton>
    </div>

    <TreasuriesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <TreasuriesTable
      :treasuries="treasuries"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-treasury="openTreasuryModal"
      @delete-treasury="openDeleteDialog"
      @row-clicked="openTreasuryModal"
    />

    <TreasuryModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :treasury="selectedTreasury"
      :is-saving="loading"
      @save="handleSaveTreasury"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الخزنة"
      :message="`هل أنت متأكد من رغبتك في حذف خزنة '${treasuryToDelete?.name}'؟ سيترتب على هذا الإجراء إزالة كافة الحركات المالية والارتباطات المحاسبية الخاصة بها.`"
      @confirmed="deleteSelectedTreasury"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات الفرعية والـ UI المشتركة الخاصة بموديول الخزائن
import AppButton from '@/components/ui/AppButton.vue'
import TreasuriesFilter from './TreasuriesFilter.vue'
import TreasuriesTable from './TreasuriesTable.vue'
import TreasuryModal from './TreasuryModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// إدارة الحالات والربط مع الستور القياسي لخزائن النظام
const treasuryStore = useTreasuryStore()
const authStore = useAuthStore()
const { treasuries, loading, pagination } = storeToRefs(treasuryStore)
const toast = useToast()

// متغيرات الفلترة والبحث المحلية
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// دالة البحث مع Debounce بمقدار 500 ملي ثانية لتقليل الضغط على السيرفر وضمان تجربة مستخدم سلسلة
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة للصفحة الأولى دائماً عند تغيير نص البحث
  }, 500)
}

// دالة جلب البيانات من السيرفس وتحديث الحالة بناء على الفلاتر والصفحة الحالية
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  treasuryStore.fetchTreasuries(page, filters).catch(() => {
    toast.error(treasuryStore.error || 'حدث خطأ غير متوقع أثناء جلب بيانات الخزائن المالية.')
  })
}

// جلب البيانات الأساسية فور رندر المكون في المتصفح
onMounted(() => {
  handlePageChange()
})

// --- معالجة الحالات والعمليات داخل مودال الإضافة والتعديل ---
const isModalOpen = ref(false)
const selectedTreasury = ref(null)

const openTreasuryModal = (treasury = null) => {
  if (treasury && !authStore.can('treasury.update')) {
    toast.error('عذراً، لا تمتلك الصلاحيات المطلوبة لتعديل بيانات هذه الخزنة.')
    return
  }
  selectedTreasury.value = treasury ? { ...treasury } : null
  isModalOpen.value = true
}

const handleSaveTreasury = async (formData) => {
  try {
    if (formData.id) {
      await treasuryStore.updateTreasury(formData.id, formData)
      toast.success(`تم تحديث بيانات الخزنة المادية '${formData.name}' بنجاح.`)
    } else {
      await treasuryStore.createTreasury(formData)
      toast.success(`تمت إضافة الخزنة الجديدة '${formData.name}' بنجاح إلى النظام.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      treasuryStore.error || error.response?.data?.message || 'فشلت عملية حفظ بيانات الخزنة.'
    toast.error(errorMessage)
  }
}

// --- معالجة العمليات والرسائل التفاعلية للحذف ---
const isDeleteDialogOpen = ref(false)
const treasuryToDelete = ref(null)

const openDeleteDialog = (treasury) => {
  treasuryToDelete.value = treasury
  isDeleteDialogOpen.value = true
}

const deleteSelectedTreasury = async () => {
  if (treasuryToDelete.value) {
    try {
      await treasuryStore.deleteTreasury(treasuryToDelete.value.id)
      toast.success(`تم حذف الخزنة '${treasuryToDelete.value.name}' بالكامل من النظام.`)

      // التحقق لمعالجة مؤشر التنقل في حال كان العنصر المحذوف هو الأخير في الصفحة
      if (treasuries.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        treasuryStore.error ||
        error.response?.data?.message ||
        'تعذر حذف الخزنة المالية من النظام لوجود ارتباطات مفتاحية.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      treasuryToDelete.value = null
    }
  }
}
</script>
