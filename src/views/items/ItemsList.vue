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
      @edit-reorder-level="openReorderLevelModal"
      @row-clicked="navigateToEditForm"
    />

    <!-- [إضافة]: نافذة حوارية منبثقة معزولة لإدخال وتعديل حد الطلب مخصصة بالمكونات المعتمدة ونظام الباندا UI -->
    <div
      v-if="isReorderModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-md animate-fade-in">
        <AppCard>
          <div class="mb-4">
            <h3 class="text-lg font-bold text-text-primary">ضبط حد الطلب اللوجستي</h3>
            <p class="text-xs text-text-muted mt-1">
              تحديد الحد الأدنى المسموح به للصنف
              <span class="font-bold text-primary">"{{ selectedItemForReorder?.name }}"</span> داخل
              المخزن الحالي.
            </p>
          </div>

          <div class="space-y-4 my-2">
            <div>
              <label class="block text-xs font-bold text-text-secondary mb-1.5"
                >حد الطلب المقترح (بالوحدة الصغرى:
                {{ selectedItemForReorder?.base_unit_name }})</label
              >
              <AppInput
                type="number"
                v-model.number="reorderLevelForm.reorder_level"
                placeholder="مثال: 10"
                min="0"
                :error="itemStore.validationErrors?.reorder_level?.[0]"
              />
            </div>
          </div>

          <div class="flex justify-end items-center gap-2 mt-5 pt-3 border-t border-surface-border">
            <AppButton
              type="secondary"
              size="sm"
              @click="closeReorderLevelModal"
              :disabled="modalSubmitting"
            >
              إلغاء الأمر
            </AppButton>
            <AppButton
              type="primary"
              size="sm"
              @click="submitReorderLevel"
              :loading="modalSubmitting"
            >
              حفظ وتثبيت الحد
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف واستبعاد الصنف"
      :message="`هل أنت متأكد من رغبتك في حذف الصنف '${itemToDelete?.name}' من النظام؟ سيترتب على هذا الإجراء تعطيل مصفوفة وحداته وأسعاره، ولا يمكن إتمامه نهائياً في حال وجود حركات مخزنية أو مالية معلقة عليه بالملفات المرتبطة.`"
      @confirmed="deleteSelectedItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useStoreStore } from '@/stores/storeStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد مكونات موديول الأصناف والقطع المشتركة الموحدة للواجهة
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppCard from '@/components/ui/AppCard.vue'
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

// متغيرات حالة نافذة حد الطلب المنبثقة اللحظية
const isReorderModalOpen = ref(false)
const selectedItemForReorder = ref(null)
const modalSubmitting = ref(false)
const reorderLevelForm = reactive({
  reorder_level: 0,
})

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

// --- معالجات إدارة وحفظ نافذة حد الطلب المنبثقة اللحظية ---
const openReorderLevelModal = (item) => {
  selectedItemForReorder.value = item
  reorderLevelForm.reorder_level = item.reorder_level ?? 0
  isReorderModalOpen.value = true
}

const closeReorderLevelModal = () => {
  isReorderModalOpen.value = false
  selectedItemForReorder.value = null
  itemStore.validationErrors = null
}

const submitReorderLevel = async () => {
  if (!selectedItemForReorder.value) return

  modalSubmitting.value = true
  try {
    await itemStore.updateItemReorderLevel(selectedItemForReorder.value.id, {
      store_id: Number(storeId.value),
      reorder_level: Number(reorderLevelForm.reorder_level),
    })

    toast.success(`تم تثبيت حد الطلب بنجاح للصنف "${selectedItemForReorder.value.name}".`)

    // مزامنة القيمة داخل مصفوفة الجدول فوراً بالواجهة دون الحاجة لإعادة شحن الشبكة بالكامل بالـ API
    const targetItem = items.value.find((i) => i.id === selectedItemForReorder.value.id)
    if (targetItem) {
      targetItem.reorder_level = reorderLevelForm.reorder_level
    }

    closeReorderLevelModal()
  } catch {
    toast.error(itemStore.error || 'عفواً، فشل تحديث حد الطلب، يرجى مراجعة قيم المدخلات.')
  } finally {
    modalSubmitting.value = false
  }
}

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
