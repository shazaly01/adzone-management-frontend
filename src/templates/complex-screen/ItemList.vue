<!--src\templates\complex-screen\ItemList.vue--->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة [اسم الشاشة المعقدة]</h1>
      <AppButton v-if="authStore.can('[permission].create')" @click="openModal(null)">
        إضافة جديد
      </AppButton>
    </div>

    <ItemFilter v-model:searchQuery="filters.search" @update:searchQuery="onSearch"> </ItemFilter>

    <ItemTable
      :items="items"
      :pagination="pagination"
      :loading="loading"
      :can-update="authStore.can('[permission].update')"
      :can-delete="authStore.can('[permission].delete')"
      @page-change="fetchData"
      @edit-item="openModal"
      @delete-item="confirmDelete"
    />

    <AppDialog v-if="isModalOpen" v-model="isModalOpen" :title="modalTitle">
      <ItemForm
        :initial-data="activeItem"
        :is-saving="loading"
        @submit="saveItem"
        @cancel="closeModal"
      />
    </AppDialog>

    <AppConfirmDialog
      v-model="isDeleteOpen"
      title="تأكيد حذف السجل"
      message="هل أنت متأكد من رغبتك في حذف هذا السجل بشكل نهائي؟"
      @confirmed="deleteItem"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCrud } from '@/composables/useCrud'

// [تعديل مهم]: استورد الستور الخاص بالشاشة المعقدة المستهدفة هنا (كمثال سنستخدم ستور المشاريع)
import { useProjectStore } from '@/stores/projectStore'

// استيراد المكونات الفرعية التابعة للشاشة المعقدة
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import ItemFilter from './ItemFilter.vue'
import ItemTable from './ItemTable.vue'
import ItemForm from './ItemForm.vue'

const authStore = useAuthStore()
const projectStore = useProjectStore()

/**
 * استدعاء محرك الـ CRUD المطور بالحقن الهندسي الصريح (Explicit Injection)
 * نمرر المراجع المباشرة للدوال والمصفوفات لمنع التخمين وحماية استقرار الأداء
 */
const {
  items,
  loading,
  pagination,
  filters,
  isModalOpen,
  isDeleteOpen,
  activeItem,
  fetchData,
  onSearch,
  openModal,
  closeModal,
  saveItem,
  confirmDelete,
  deleteItem,
} = useCrud({
  // الفلاتر الابتدائية الخاصة بالشاشة (يمكنك إضافة حقول فلترة إضافية هنا مثل company_id)
  initialFilters: {
    search: '',
  },
  // ربط الحالات والمصفوفات صراحة عبر computed للحفاظ على التزامنية (Reactivity)
  data: computed(() => projectStore.projects),
  loading: computed(() => projectStore.loading),
  pagination: computed(() => projectStore.pagination),
  error: computed(() => projectStore.error),

  // تمرير مراجع الدوال الفعلية مباشرة من الستور
  fetchAction: projectStore.fetchProjects,
  createAction: projectStore.createProject,
  updateAction: projectStore.updateProject,
  deleteAction: projectStore.deleteProject,
})

// حساب عنوان النافذة المنبثقة ديناميكياً بناءً على حالة السجل النشط
const modalTitle = computed(() => {
  return activeItem.value ? 'تعديل البيانات الحالية' : 'إضافة سجل معقد جديد'
})

// جلب البيانات الأساسية من السيرفر فور تحميل الصفحة
onMounted(() => {
  fetchData(1)
})
</script>
