<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">بند المصروفات الإدارية</h1>
      <AppButton v-if="authStore.can('expense.create')" @click="openExpenseModal()">
        إضافة بند مصروف
      </AppButton>
    </div>

    <ExpensesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <ExpensesTable
      :expenses="expenses"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-expense="openExpenseModal"
      @delete-expense="openDeleteDialog"
      @row-clicked="openExpenseModal"
    />

    <ExpenseModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :expense="selectedExpense"
      :is-saving="loading"
      @save="handleSaveExpense"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف بند المصروف"
      :message="`هل أنت متأكد من رغبتك في حذف بند المصروف '${expenseToDelete?.name}'؟ سيترتب على هذا الإجراء إزالة الارتباط الهيكلي بالدليل المحاسبي ولا يمكن إتمامه في حال وجود حركات مالية مسجلة عليه.`"
      @confirmed="deleteSelectedExpense"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد قطع موديول بنود المصروفات ومكونات الواجهة الموحدة
import AppButton from '@/components/ui/AppButton.vue'
import ExpensesFilter from './ExpensesFilter.vue'
import ExpensesTable from './ExpensesTable.vue'
import ExpenseModal from './ExpenseModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة الستور وإدارة الحالات المشتركة للمصروفات
const expenseStore = useExpenseStore()
const authStore = useAuthStore()
const { expenses, loading, pagination } = storeToRefs(expenseStore)
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

  expenseStore.fetchExpenses(page, filters).catch(() => {
    toast.error(expenseStore.error || 'حدث خطأ أثناء محاولة جلب بنود المصروفات.')
  })
}

// جلب البيانات الأولية فور تحميل ورندر المكون
onMounted(() => {
  handlePageChange()
})

// --- إدارة العمليات والحالات داخل مودال الإضافة والتعديل ---
const isModalOpen = ref(false)
const selectedExpense = ref(null)

const openExpenseModal = (expense = null) => {
  if (expense && !authStore.can('expense.update')) {
    toast.error('ليست لديك الصلاحيات الكافية لتعديل بيانات هذا البند.')
    return
  }
  selectedExpense.value = expense ? { ...expense } : null
  isModalOpen.value = true
}

const handleSaveExpense = async (formData) => {
  try {
    if (formData.id) {
      await expenseStore.updateExpense(formData.id, formData)
      toast.success(`تم تحديث بند المصروف '${formData.name}' بنجاح.`)
    } else {
      await expenseStore.createExpense(formData)
      toast.success(`تمت إضافة بند المصروف الجديد '${formData.name}' بنجاح.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      expenseStore.error ||
      error.response?.data?.message ||
      'تعذر حفظ بيانات البند بسبب خطأ غير متوقع.'
    toast.error(errorMessage)
  }
}

// --- إدارة حوار النوافذ لعمليات الحذف والاستبعاد الآمن ---
const isDeleteDialogOpen = ref(false)
const expenseToDelete = ref(null)

const openDeleteDialog = (expense) => {
  expenseToDelete.value = expense
  isDeleteDialogOpen.value = true
}

const deleteSelectedExpense = async () => {
  if (expenseToDelete.value) {
    try {
      await expenseStore.deleteExpense(expenseToDelete.value.id)
      toast.success(`تم حذف بند المصروف '${expenseToDelete.value.name}' بنجاح من النظام.`)

      // معايرة رقم الصفحة التلقائي في حال تم حذف العنصر الأخير في الصفحة الحالية
      if (expenses.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        expenseStore.error ||
        error.response?.data?.message ||
        'فشلت عملية حذف بند المصروف لوجود حركات مالية معلقة.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      expenseToDelete.value = null
    }
  }
}
</script>
