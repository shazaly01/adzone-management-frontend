<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة سندات الصرف والقبض</h1>
      <AppButton v-if="authStore.can('voucher.create')" @click="openVoucherModal()">
        إنشاء سند مالي جديد
      </AppButton>
    </div>

    <VoucherFilters
      v-model:searchQuery="searchQuery"
      v-model:voucherTypeFilter="voucherTypeFilter"
      v-model:paymentMethodFilter="paymentMethodFilter"
      @update:searchQuery="onSearch"
      @update:voucherTypeFilter="handlePageChange(1)"
      @update:paymentMethodFilter="handlePageChange(1)"
    />

    <VoucherTable
      :vouchers="vouchers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-voucher="openVoucherModal"
      @delete-voucher="openDeleteDialog"
      @row-clicked="openVoucherModal"
      @print-voucher="openVoucherPrintPage"
    />

    <VoucherModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :voucher="selectedVoucher"
      :is-saving="loading"
      :accounts="accounts"
      :validation-errors="validationErrors"
      @save="handleSaveVoucher"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف وإلغاء السند المالي"
      :message="`هل أنت متأكد من رغبتك في حذف السند رقم '${voucherToDelete?.voucher_number}'؟ سيترتب على هذا الإجراء إلغاء التأثير المالي وحذف القيود اليومية المرتبطة به تماماً.`"
      @confirmed="deleteSelectedVoucher"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVoucherStore } from '@/stores/voucherStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

import VoucherFilters from './VoucherFilters.vue'
import VoucherTable from './VoucherTable.vue'
import VoucherModal from './VoucherModal.vue'

const voucherStore = useVoucherStore()
const authStore = useAuthStore()
const { vouchers, loading, pagination, validationErrors } = storeToRefs(voucherStore)
const toast = useToast()

const searchQuery = ref('')
const voucherTypeFilter = ref('')
const paymentMethodFilter = ref('')
let searchTimeout = null

const accounts = ref([])

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    voucher_type: voucherTypeFilter.value,
    payment_method: paymentMethodFilter.value,
  }

  voucherStore.fetchVouchers(page, filters).catch(() => {
    toast.error('حدث خطأ أثناء جلب السندات المالية من الخادم.')
  })
}

onMounted(() => {
  handlePageChange()

  accounts.value = [
    { id: 1, name: 'حساب مصاريف عمومية وإدارية', code: '5101' },
    { id: 2, name: 'حساب إيرادات مبيعات وتوزيع', code: '4101' },
    { id: 3, name: 'حساب نفقات صيانة وتشغيل', code: '5102' },
    { id: 4, name: 'حساب إيرادات أخرى متنوعة', code: '4102' },
  ]
})

const isModalOpen = ref(false)
const selectedVoucher = ref(null)

const openVoucherModal = (voucher = null) => {
  if (voucher && !authStore.can('voucher.update')) {
    toast.error('ليس لديك الصلاحية الأمنية الكافية لتعديل هذا السند المالي.')
    return
  }

  if (validationErrors.value) validationErrors.value = null

  selectedVoucher.value = voucher ? { ...voucher } : null
  isModalOpen.value = true
}

const handleSaveVoucher = async (formData) => {
  try {
    if (formData.id) {
      await voucherStore.updateVoucher(formData.id, formData)
      toast.success(`تم تحديث السند المالي رقم '${formData.voucher_number || formData.id}' بنجاح.`)
    } else {
      await voucherStore.createVoucher(formData)
      toast.success('تم إنشاء السند المالي الموحد واعتماده في النظام بنجاح.')
    }

    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    if (error.response?.status !== 422) {
      const errorMessage = voucherStore.error || 'حدث خطأ أثناء معالجة القيود اليومية للسند.'
      toast.error(errorMessage)
    }
  }
}

// [الدالة الجديدة]: فتح مسار طباعة السندات المعزول في علامة تبويب جديدة مستقلة مقاس A5
const openVoucherPrintPage = (voucher) => {
  window.open(`/print/vouchers/${voucher.id}`, '_blank')
}

const isDeleteDialogOpen = ref(false)
const voucherToDelete = ref(null)

const openDeleteDialog = (voucher) => {
  voucherToDelete.value = voucher
  isDeleteDialogOpen.value = true
}

const deleteSelectedVoucher = async () => {
  if (voucherToDelete.value) {
    try {
      await voucherStore.deleteVoucher(voucherToDelete.value.id)
      toast.success(`تم إلغاء وحذف السند المالي '${voucherToDelete.value.voucher_number}' بنجاح.`)

      if (vouchers.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = voucherStore.error || 'فشلت عملية حذف وإلغاء السند من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      voucherToDelete.value = null
    }
  }
}
</script>
