<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة العملاء</h1>
      <AppButton v-if="authStore.can('customer.create')" @click="openCustomerModal()">
        إضافة عميل
      </AppButton>
    </div>

    <CustomersFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <CustomersTable
      :customers="customers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-customer="openCustomerModal"
      @delete-customer="openDeleteDialog"
      @row-clicked="openCustomerModal"
    />

    <CustomerModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :customer="selectedCustomer"
      :is-saving="loading"
      @save="handleSaveCustomer"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف العميل"
      :message="`هل أنت متأكد من رغبتك في حذف العميل '${customerToDelete?.name}'؟ سيترتب على هذا الإجراء إزالة القيود والارتباطات المالية الخاصة به في حال عدم وجود حركات معلقة.`"
      @confirmed="deleteSelectedCustomer"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customerStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد قطع الليغو المكونة للموديول ومكونات الواجهة الموحدة
import AppButton from '@/components/ui/AppButton.vue'
import CustomersFilter from './CustomersFilter.vue'
import CustomersTable from './CustomersTable.vue'
import CustomerModal from './CustomerModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة الستور المستنتج وإدارة الحالات المشتركة للعملاء
const customerStore = useCustomerStore()
const authStore = useAuthStore()
const { customers, loading, pagination } = storeToRefs(customerStore)
const toast = useToast()

// متغيرات التصفية والبحث المحلي للعملاء
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// آلية البحث الذكي Debouncing لمنع تكرار ضربات الـ API أثناء الكتابة السريعة
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة دائماً لصفحة البداية عند كتابة نص بحث جديد
  }, 500)
}

// دالة جلب البيانات من الستور بناء على الفلاتر المدخلة والترقيم
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  customerStore.fetchCustomers(page, filters).catch(() => {
    toast.error(customerStore.error || 'حدث خطأ أثناء محاولة جلب بيانات العملاء.')
  })
}

// إطلاق الجلب الأولي فور تركيب الشاشة
onMounted(() => {
  handlePageChange()
})

// --- إدارة العمليات والحالات داخل مودال الإضافة والتعديل ---
const isModalOpen = ref(false)
const selectedCustomer = ref(null)

const openCustomerModal = (customer = null) => {
  if (customer && !authStore.can('customer.update')) {
    toast.error('عذراً، لا تمتلك الصلاحيات الكافية لتعديل بيانات هذا العميل.')
    return
  }
  selectedCustomer.value = customer ? { ...customer } : null
  isModalOpen.value = true
}

const handleSaveCustomer = async (formData) => {
  try {
    if (formData.id) {
      await customerStore.updateCustomer(formData.id, formData)
      toast.success(`تم تحديث بيانات العميل '${formData.name}' بنجاح.`)
    } else {
      await customerStore.createCustomer(formData)
      toast.success(`تم تسجيل العميل الجديد '${formData.name}' بنجاح في النظام.`)
    }
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      customerStore.error ||
      error.response?.data?.message ||
      'تعذر حفظ بيانات العميل بسبب خطأ في الخادم.'
    toast.error(errorMessage)
  }
}

// --- إدارة حوار النوافذ التفاعلية لعمليات حذف العميل الآمن ---
const isDeleteDialogOpen = ref(false)
const customerToDelete = ref(null)

const openDeleteDialog = (customer) => {
  customerToDelete.value = customer
  isDeleteDialogOpen.value = true
}

const deleteSelectedCustomer = async () => {
  if (customerToDelete.value) {
    try {
      await customerStore.deleteCustomer(customerToDelete.value.id)
      toast.success(
        `تم استبعاد وحذف العميل '${customerToDelete.value.name}' بنجاح من قاعدة البيانات.`,
      )

      // معايرة رقم الصفحة التلقائي في حال تم حذف العنصر الأخير في الصفحة الحالية
      if (customers.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        customerStore.error ||
        error.response?.data?.message ||
        'فشلت عملية حذف العميل لوجود حركات مالية محاسبية مرتبطة به.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      customerToDelete.value = null
    }
  }
}
</script>
