<!--src\views\projects\ProjectsList.vue--->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة المشاريع</h1>
      <AppButton v-if="authStore.can('project.create')" @click="openProjectModal()">
        إضافة مشروع
      </AppButton>
    </div>

    <!-- قطعة الليغو 1: الفلتر -->
    <ProjectsFilter
      v-model="selectedCompanyId"
      v-model:searchQuery="searchQuery"
      v-model:permissionFilter="permissionFilter"
      v-model:projectTypeFilter="projectTypeFilter"
      v-model:completionStatusFilter="completionStatusFilter"
      @update:modelValue="handlePageChange(1)"
      @update:searchQuery="onSearch"
      @update:permissionFilter="handlePageChange(1)"
      @update:projectTypeFilter="handlePageChange(1)"
      @update:completionStatusFilter="handlePageChange(1)"
    />

    <!-- قطعة الليغو 2: الجدول -->
    <ProjectsTable
      :projects="projects"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-project="openProjectModal"
      @delete-project="openDeleteDialog"
      @manage-payments="openPaymentsManager"
      @row-clicked="openPaymentsManager"
      @manage-documents="openDocumentsManager"
    />

    <!-- المودالات (تبقى هنا لأنها تدار بواسطة هذا المكون) -->
    <ProjectModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :project="selectedProject"
      @save="handleSaveProject"
    />
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المشروع"
      :message="`هل أنت متأكد من رغبتك في حذف مشروع '${projectToDelete?.name}'؟`"
      @confirmed="deleteSelectedProject"
    />
    <PaymentsManagerModal
      v-if="isPaymentsModalOpen"
      v-model="isPaymentsModalOpen"
      :project="projectForPayments"
    />

    <DocumentsManagerModal
      v-if="isDocumentsModalOpen"
      v-model="isDocumentsModalOpen"
      :owner="projectForDocuments"
      target-type="project"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات (قطع الليغو والمودالات)
import AppButton from '@/components/ui/AppButton.vue'
import ProjectsFilter from './ProjectsFilter.vue' // <-- قطعة الليغو 1
import ProjectsTable from './ProjectsTable.vue' // <-- قطعة الليغو 2
import ProjectModal from './ProjectModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import PaymentsManagerModal from '@/views/payments/PaymentsManagerModal.vue'
import DocumentsManagerModal from '@/views/documents/DocumentsManagerModal.vue'

// --- إدارة الحالة (هنا يعيش "العقل") ---
const projectStore = useProjectStore()
const authStore = useAuthStore()
const { projects, loading, pagination } = storeToRefs(projectStore)
const toast = useToast()

const selectedCompanyId = ref(null) // حالة الفلتر
const permissionFilter = ref('')
const isDocumentsModalOpen = ref(false)
const projectForDocuments = ref(null)

const searchQuery = ref('') // حالة نص البحث الجديدة
const projectTypeFilter = ref(null) // لتخزين ID نوع المشروع
const completionStatusFilter = ref('') // لتخزين قيمة حالة الإنجاز
let searchTimeout = null // مؤقت البحث

// دالة البحث مع Debounce (نصف ثانية)
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة للصفحة الأولى عند البحث
  }, 500)
}

const openDocumentsManager = (project) => {
  projectForDocuments.value = project
  isDocumentsModalOpen.value = true
}

// --- دوال جلب البيانات ---
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    company_id: selectedCompanyId.value,
    has_contract_permission: permissionFilter.value, // <--- 2. تمت الإضافة هنا
    project_type_id: projectTypeFilter.value,
    completion_status: completionStatusFilter.value,
  }

  projectStore.fetchProjects(page, filters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات المشاريع.')
  })
}

onMounted(() => {
  handlePageChange()
})

// --- دوال معالجة الأحداث (التي تستمع للأحداث من قطع الليغو) ---
const isModalOpen = ref(false)
const selectedProject = ref(null)
const openProjectModal = (project = null) => {
  if (project && !authStore.can('project.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذا المشروع.')
    return
  }
  selectedProject.value = project ? { ...project } : null
  isModalOpen.value = true
}

const handleSaveProject = async (formData) => {
  try {
    if (formData.id) {
      await projectStore.updateProject(formData.id, formData)
      toast.success(`تم تعديل مشروع '${formData.name}' بنجاح.`)
    } else {
      await projectStore.createProject(formData)
      toast.success(`تمت إضافة مشروع '${formData.name}' بنجاح.`)
    }
    await handlePageChange(pagination.value.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    toast.error(errorMessage)
  }
}

const isDeleteDialogOpen = ref(false)
const projectToDelete = ref(null)
const openDeleteDialog = (project) => {
  projectToDelete.value = project
  isDeleteDialogOpen.value = true
}

const deleteSelectedProject = async () => {
  if (projectToDelete.value) {
    try {
      await projectStore.deleteProject(projectToDelete.value.id)
      toast.success(`تم حذف مشروع '${projectToDelete.value.name}' بنجاح.`)

      if (projects.value.length === 1 && pagination.value.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value.current_page)
      }
    } catch (error) {
      // --- التعديل هنا (الحل السحري) ---
      // عرض رسالة الخطأ القادمة من الباك-إند (مثل: وجود دفعات أو مستندات)
      const errorMessage = projectStore.error || error.response?.data?.message || 'فشل حذف المشروع.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      projectToDelete.value = null
    }
  }
}

const isPaymentsModalOpen = ref(false)
const projectForPayments = ref(null)
const openPaymentsManager = (project) => {
  projectForPayments.value = project
  isPaymentsModalOpen.value = true
}
</script>
