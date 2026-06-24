<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">دليل الأصناف والمصفوفة السعرية</h1>
        <p class="text-xs text-text-muted mt-1">
          إدارة المنتجات المخزنية، الخدمات، المواد الخام، وربط الباركودات وفئات الأسعار اللانهائية
        </p>
      </div>
      <AppButton v-if="authStore.can('item.create')" @click="navigateToCreateForm">
        إضافة صنف جديد
      </AppButton>
    </div>

    <ItemsFilter
      :storeId="storeId"
      :searchQuery="searchQuery"
      :typeFilter="typeFilter"
      :statusFilter="statusFilter"
      @update:storeId="updateStoreId"
      @update:searchQuery="updateSearchQuery"
      @update:typeFilter="updateTypeFilter"
      @update:statusFilter="updateStatusFilter"
    />

    <ItemsTable
      :items="items"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-item="navigateToEditForm"
      @delete-item="openDeleteDialog"
      @row-clicked="navigateToEditForm"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف واستبعاد الصنف"
      :message="`هل أنت متأكد من رغبتك في حذف الصنف '${itemToDelete?.name}' من النظام؟ سيترتب على هذا الإجراء تعطيل مصفوفة وحداته وأسعاره، ولا يمكن إتمامه نهائياً في حال وجود حركات مخزنية أو مالية معلقة عليه بالملفات المرتبطة.`"
      @confirmed="deleteSelectedItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useStoreStore } from '@/stores/storeStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد مكونات موديول الأصناف والقطع المشتركة الموحدة للواجهة
import AppButton from '@/components/ui/AppButton.vue'
import ItemsFilter from './ItemsFilter.vue'
import ItemsTable from './ItemsTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const itemStore = useItemStore()
const storeStore = useStoreStore()
const authStore = useAuthStore()
const toast = useToast()

// استخراج الحالات الحركية والمصفوفات من الستور
const { items, loading, pagination } = storeToRefs(itemStore)

// متغيرات التصفية والبحث المحلي والمخازن
const storeId = ref('')
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

// تحديث الفلاتر المحلية وجلب البيانات الفورية بناءً على التغيير
const updateStoreId = (val) => {
  storeId.value = val
  handlePageChange(1)
}

const updateSearchQuery = (val) => {
  searchQuery.value = val
  onSearch()
}

const updateTypeFilter = (val) => {
  typeFilter.value = val
  handlePageChange(1)
}

const updateStatusFilter = (val) => {
  statusFilter.value = val
  handlePageChange(1)
}

// آلية البحث الذكي Debouncing لمنع تكرار طلبات السيرفر أثناء قراءة أو كتابة الباركود والاسم
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 400)
}

// دالة جلب البيانات من الـ API وتحديث المؤشرات الشجرية بناءً على الفلاتر النظيفة
const handlePageChange = (page = 1) => {
  // كسر التنفيذ وحماية الطلب في حال عدم تعيين معرف المخزن لتفادي استجابة الخطأ من السيرفر
  if (!storeId.value) return

  const filters = {
    store_id: storeId.value,
    search: searchQuery.value,
    item_type: typeFilter.value,
    is_active: statusFilter.value,
  }

  itemStore.fetchItems(page, filters).catch(() => {
    toast.error(itemStore.error || 'حدث خطأ غير متوقع أثناء جلب دليل الأصناف.')
  })
}

// دورة حياة المكون الحصر التزامني: جلب المخازن أولاً -> اختيار الأول تلقائياً -> البحث عن الأصناف
onMounted(async () => {
  if (storeStore.stores.length === 0) {
    try {
      await storeStore.fetchStores(1, { per_page: 1000 })
    } catch (err) {
      toast.error('حدث خطأ أثناء جلب قائمة المخازن المهيأة للنظام.')
      console.error(err)
    }
  }

  // تعيين المخزن الأول كمخزن افتراضي فوراً قبل طلب الأصناف
  if (storeStore.stores.length > 0) {
    storeId.value = storeStore.stores[0].id
  }

  // تنفيذ جلب الأصناف بناءً على الحالة الافتراضية المستقرة للمخزن
  handlePageChange()
})

// --- توجيه المسارات إلى الشاشات الكاملة (Full Page Form) ---
const navigateToCreateForm = () => {
  router.push('/app/items/create')
}

const navigateToEditForm = (item) => {
  if (!authStore.can('item.update')) {
    toast.error('ليست لديك الصلاحيات الإدارية الكافية لتعديل بيانات هذا الصنف ومصفوفته.')
    return
  }
  router.push(`/app/items/${item.id}/edit`)
}

// --- إدارة حوار نوافذ الحذف والأرشفة الآمنة للأصناف الاستراتيجية ---
const isDeleteDialogOpen = ref(false)
const itemToDelete = ref(null)

const openDeleteDialog = (item) => {
  itemToDelete.value = item
  isDeleteDialogOpen.value = true
}

const deleteSelectedItem = async () => {
  if (itemToDelete.value) {
    try {
      await itemStore.deleteItem(itemToDelete.value.id)
      toast.success(`تم استبعاد وحذف الصنف '${itemToDelete.value.name}' وكافة خلايا مصفوفته بنجاح.`)

      // معايرة رقم الصفحة التلقائي في حال تم تصفير عناصر الصفحة الحالية
      if (items.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage =
        itemStore.error || 'فشلت عملية حذف الصنف لوجود ارتباطات وثيقة وسجلات مخزنية معلقة.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      itemToDelete.value = null
    }
  }
}
</script>
