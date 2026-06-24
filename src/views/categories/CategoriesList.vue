<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة التصنيفات المجموعية</h1>
      <AppButton v-if="authStore.can('category.create')" @click="openCategoryModal()">
        إضافة تصنيف جديد
      </AppButton>
    </div>

    <CategoriesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <CategoriesTable
      :categories="categories"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-category="openCategoryModal"
      @delete-category="openDeleteDialog"
      @row-clicked="openCategoryModal"
    />

    <CategoryModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :category="selectedCategory"
      :is-saving="loading"
      @save="handleSaveCategory"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف التصنيف"
      :message="`هل أنت متأكد من رغبتك في حذف تصنيف '${categoryToDelete?.name}'؟ سيترتب على هذا الإجراء إخفاء البيانات المرتبطة به.`"
      @confirmed="deleteSelectedCategory"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات الفرعية والمشتركة للنظام
import AppButton from '@/components/ui/AppButton.vue'
import CategoriesFilter from './CategoriesFilter.vue'
import CategoriesTable from './CategoriesTable.vue'
import CategoryModal from './CategoryModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة الستورز والتنبيهات
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const { categories, loading, pagination } = storeToRefs(categoryStore)
const toast = useToast()

// متغيرات الفلترة المحلية والـ Debounce
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// دالة البحث المؤجل لتقليل الضغط على السيرفر (نصف ثانية)
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// دالة جلب البيانات مع تطبيق المرشحات النظيفة وتحديث الصفحة
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  categoryStore.fetchCategories(page, filters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات التصنيفات من الخادم.')
  })
}

// جلب البيانات الأولية فور تحميل الشاشة في المتصفح
onMounted(() => {
  handlePageChange()
})

// --- معالجة عمليات الإضافة والتعديل عبر المودال ---
const isModalOpen = ref(false)
const selectedCategory = ref(null)

const openCategoryModal = (category = null) => {
  // التحقق من صلاحية التعديل إذا تم تمرير سجل موجود
  if (category && !authStore.can('category.update')) {
    toast.error('ليس لديك الصلاحية الكافية لتعديل بيانات هذا التصنيف.')
    return
  }

  selectedCategory.value = category ? { ...category } : null
  isModalOpen.value = true
}

const handleSaveCategory = async (formData) => {
  try {
    if (formData.id) {
      await categoryStore.updateCategory(formData.id, formData)
      toast.success(`تم تعديل بيانات التصنيف '${formData.name}' بنجاح.`)
    } else {
      await categoryStore.createCategory(formData)
      toast.success(`تمت إضافة التصنيف '${formData.name}' بنجاح إلى النظام.`)
    }

    // إعادة جلب البيانات في الصفحة الحالية وإغلاق المودال
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    // إذا كان الخطأ ليس 422 (أي خطأ عام في السيرفر أو الشبكة) تعرض رسالة عامة
    if (error.response?.status !== 422) {
      const errorMessage = categoryStore.error || 'حدث خطأ غير متوقع أثناء حفظ البيانات.'
      toast.error(errorMessage)
    }
  }
}

// --- معالجة عمليات الحذف الناعم ---
const isDeleteDialogOpen = ref(false)
const categoryToDelete = ref(null)

const openDeleteDialog = (category) => {
  categoryToDelete.value = category
  isDeleteDialogOpen.value = true
}

const deleteSelectedCategory = async () => {
  if (categoryToDelete.value) {
    try {
      await categoryStore.deleteCategory(categoryToDelete.value.id)
      toast.success(`تم حذف التصنيف '${categoryToDelete.value.name}' من النظام بنجاح.`)

      // التحقق لمعالجة مؤشر الترقيم التلقائي في حال تفريغ الصفحة الأخيرة بالكامل
      if (categories.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = categoryStore.error || 'فشلت عملية حذف التصنيف من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      categoryToDelete.value = null
    }
  }
}
</script>
