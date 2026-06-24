<!--src\views\banks\BanksList.vue--->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة البنوك</h1>
      <AppButton v-if="authStore.can('bank.create')" @click="openBankModal()">
        إضافة بنك
      </AppButton>
    </div>

    <BanksFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <BanksTable
      :banks="banks"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-bank="openBankModal"
      @delete-bank="openDeleteDialog"
      @row-clicked="openBankModal"
    />

    <BankModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :bank="selectedBank"
      :is-saving="loading"
      @save="handleSaveBank"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف البنك"
      :message="`هل أنت متأكد من رغبتك في حذف بنك '${bankToDelete?.name}'؟ سيترتب على هذا الإجراء إزالة البيانات المرتبطة به.`"
      @confirmed="deleteSelectedBank"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات الفرعية والـ UI المشتركة
import AppButton from '@/components/ui/AppButton.vue'
import BanksFilter from './BanksFilter.vue'
import BanksTable from './BanksTable.vue'
import BankModal from './BankModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// إدارة الحالات والربط مع الستور المشترك
const bankStore = useBankStore()
const authStore = useAuthStore()
const { banks, loading, pagination } = storeToRefs(bankStore)
const toast = useToast()

// متغيرات التصفية والبحث المحلية
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// دالة البحث مع Debounce بمقدار نصف ثانية لتقليل الضغط على السيرفر
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// دالة جلب البيانات من السيرفس وتحديث الحالة
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  bankStore.fetchBanks(page, filters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات البنوك من الخادم.')
  })
}

// جلب البيانات الأولية عند تحميل المكون
onMounted(() => {
  handlePageChange()
})

// --- معالجة عمليات الإضافة والتعديل عبر المودال ---
const isModalOpen = ref(false)
const selectedBank = ref(null)

const openBankModal = (bank = null) => {
  if (bank && !authStore.can('bank.update')) {
    toast.error('ليس لديك الصلاحية الكافية لتعديل بيانات هذا البنك.')
    return
  }
  selectedBank.value = bank ? { ...bank } : null
  isModalOpen.value = true
}

const handleSaveBank = async (formData) => {
  try {
    if (formData.id) {
      await bankStore.updateBank(formData.id, formData)
      toast.success(`تم تعديل بيانات بنك '${formData.name}' بنجاح.`)
    } else {
      await bankStore.createBank(formData)
      toast.success(`تمت إضافة بنك '${formData.name}' بنجاح إلى النظام.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      bankStore.error || error.response?.data?.message || 'حدث خطأ غير متوقع أثناء حفظ البيانات.'
    toast.error(errorMessage)
  }
}

// --- معالجة عمليات الحذف ---
const isDeleteDialogOpen = ref(false)
const bankToDelete = ref(null)

const openDeleteDialog = (bank) => {
  bankToDelete.value = bank
  isDeleteDialogOpen.value = true
}

const deleteSelectedBank = async () => {
  if (bankToDelete.value) {
    try {
      await bankStore.deleteBank(bankToDelete.value.id)
      toast.success(`تم حذف بنك '${bankToDelete.value.name}' من النظام بنجاح.`)

      // التحقق من الصفحة الحالية وتحديث المؤشر التلقائي لضمان عدم بقاء الصفحة فارغة
      if (banks.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        bankStore.error || error.response?.data?.message || 'فشلت عملية حذف البنك من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      bankToDelete.value = null
    }
  }
}
</script>
