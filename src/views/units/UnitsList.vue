<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة وحدات القياس</h1>
      <AppButton v-if="authStore.can('unit.create')" @click="openUnitModal()">
        إضافة وحدة
      </AppButton>
    </div>

    <UnitsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <UnitsTable
      :units="units"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-unit="openUnitModal"
      @delete-unit="openDeleteDialog"
      @row-clicked="openUnitModal"
    />

    <UnitModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :unit="selectedUnit"
      :is-saving="loading"
      @save="handleSaveUnit"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف وحدة القياس"
      :message="`هل أنت متأكد من رغبتك في حذف وحدة القياس '${unitToDelete?.name}'؟ سيترتب على هذا الإجراء إزالتها من دليل الوحدات وفصل ارتباطها بالسلع والمنتجات الحالية.`"
      @confirmed="deleteSelectedUnit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUnitStore } from '@/stores/unitStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// fill الحاضنة بقطع المكونات الفرعية والـ UI القياسية للنظام
import AppButton from '@/components/ui/AppButton.vue'
import UnitsFilter from './UnitsFilter.vue'
import UnitsTable from './UnitsTable.vue'
import UnitModal from './UnitModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// ربط الستور المعتمد وإدارة صلاحيات المستخدم
const unitStore = useUnitStore()
const authStore = useAuthStore()
const { units, loading, pagination } = storeToRefs(unitStore)
const toast = useToast()

// متغيرات الفلترة والبحث السريع المحلية
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// آلية البحث الذكي Debouncing لمنع استهلاك موارد الخادم أثناء الكتابة السريعة
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة دائماً لصفحة البداية عند كتابة نص بحث جديد
  }, 500)
}

// دالة جلب البيانات من الستور بناء على معاملات التصفية والترقيم الحالي
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  unitStore.fetchUnits(page, filters).catch(() => {
    toast.error(unitStore.error || 'حدث خطأ غير متوقع أثناء جلب دليل وحدات القياس.')
  })
}

// إطلاق عملية الجلب الأولى فور تركيب المكون وعرضه في الشاشة
onMounted(() => {
  handlePageChange()
})

// --- إدارة العمليات والحالات داخل مودال الإضافة والتعديل التفاعلي ---
const isModalOpen = ref(false)
const selectedUnit = ref(null)

const openUnitModal = (unit = null) => {
  if (unit && !authStore.can('unit.update')) {
    toast.error('عذراً، لا تمتلك الامتيازات الكافية للتعديل على وحدة القياس هذه.')
    return
  }
  selectedUnit.value = unit ? { ...unit } : null
  isModalOpen.value = true
}

const handleSaveUnit = async (formData) => {
  try {
    if (formData.id) {
      await unitStore.updateUnit(formData.id, formData)
      toast.success(`تم تحديث وحدة القياس '${formData.name}' بنجاح.`)
    } else {
      await unitStore.createUnit(formData)
      toast.success(`تم إدراج وحدة القياس الجديدة '${formData.name}' بنجاح في الدليل.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      unitStore.error ||
      error.response?.data?.message ||
      'تعذر حفظ بيانات وحدة القياس بسبب خطأ في الخادم.'
    toast.error(errorMessage)
  }
}

// --- إدارة حوار النوافذ لعمليات حذف واستبعاد الوحدات بأمان ---
const isDeleteDialogOpen = ref(false)
const unitToDelete = ref(null)

const openDeleteDialog = (unit) => {
  unitToDelete.value = unit
  isDeleteDialogOpen.value = true
}

const deleteSelectedUnit = async () => {
  if (unitToDelete.value) {
    try {
      await unitStore.deleteUnit(unitToDelete.value.id)
      toast.success(`تم استبعاد وحذف وحدة القياس '${unitToDelete.value.name}' بنجاح من الدليل.`)

      // معايرة مؤشر الترقيم التلقائي في حال تم حذف العنصر الأخير في الصفحة الحالية
      if (units.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        unitStore.error ||
        error.response?.data?.message ||
        'فشلت عملية حذف الوحدة لوجود ارتباطات سلعية قائمة معها.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      unitToDelete.value = null
    }
  }
}
</script>
