<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold text-text-primary">دليل شجرة الحسابات</h1>
        <p class="text-xs text-text-muted">إدارة وتصفيف الهيكل المحاسبي والمالي العام للنظام</p>
      </div>

      <AppButton
        v-if="authStore.can('account.create')"
        @click="openAccountModal(null, true)"
        variant="primary"
      >
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          إضافة حساب جذر رئيسي
        </span>
      </AppButton>
    </div>

    <AccountsTree
      :accounts="accounts"
      :loading="loading"
      @add-child="handleOpenAddChild"
      @edit-node="handleOpenEditNode"
      @delete-node="openDeleteDialog"
    />

    <AccountModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :account="selectedAccount"
      :is-saving="loading"
      @save="handleSaveAccount"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الحساب المالي"
      :message="`هل أنت متأكد من رغبتك في حذف الحساب '${accountToDelete?.name}' ذو الكود (${accountToDelete?.code})؟ سيترتب على هذا الإجراء إزالته نهائياً من الدليل المحاسبي ولا يمكن التراجع.`"
      @confirmed="deleteSelectedAccount"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAccountStore } from '@/stores/accountStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد مكونات الشجرة والـ UI القياسية للنظام
import AppButton from '@/components/ui/AppButton.vue'
import AccountsTree from './AccountsTree.vue'
import AccountModal from './AccountModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// تهيئة الستور المحاسبي وصلاحيات الأمان للحسابات
const accountStore = useAccountStore()
const authStore = useAuthStore()
const { accounts, loading } = storeToRefs(accountStore)
const toast = useToast()

// متغيرات التحكم في النوافذ والحالات المحلية
const isModalOpen = ref(false)
const selectedAccount = ref(null)
const isDeleteDialogOpen = ref(false)
const accountToDelete = ref(null)

// دالة جلب وإعادة بناء شجرة الحسابات الكاملة من الخادم
const refreshTreeStructure = () => {
  accountStore.fetchAccounts(1).catch(() => {
    toast.error(accountStore.error || 'حدث خطأ أثناء تحميل شجرة الحسابات المعتمدة.')
  })
}

// تحميل الدليل فور تركيب المكون
onMounted(() => {
  refreshTreeStructure()
})

// فتح مودال إنشاء حساب مالي (سواء جذر أو فرعي)
const openAccountModal = (initialData = null, isRoot = false) => {
  // تصفير أخطاء التحقق السابقة لمنع وميض الأخطاء القديمة عند فتح النافذة
  accountStore.validationErrors = null

  if (isRoot) {
    selectedAccount.value = {
      id: null,
      name: '',
      parent_id: null,
      type: 'normal',
      opening_balance: 0,
    }
  } else {
    selectedAccount.value = initialData
  }
  isModalOpen.value = true
}

// معالجة حدث إضافة حساب ابن تابع لعقدة محددة
const handleOpenAddChild = (parentNode) => {
  if (!authStore.can('account.create')) {
    toast.error('عذراً، لا تمتلك صلاحية إضافة حسابات مالية فرعية.')
    return
  }
  // تمرير معرف الحساب الحالي ليكون هو الـ parent_id الافتراضي للفرع الجديد
  const childBlueprint = {
    id: null,
    name: '',
    parent_id: parentNode.id,
    type: parentNode.type, // توريث نفس نوع حساب الأب تلقائياً لتسهيل العمل
    opening_balance: 0,
  }
  openAccountModal(childBlueprint, false)
}

// معالجة حدث تعديل حساب مالي موجود مسبقاً
const handleOpenEditNode = (node) => {
  if (!authStore.can('account.update')) {
    toast.error('عذراً، لا تمتلك صلاحية التعديل على الدليل المحاسبي.')
    return
  }
  openAccountModal({ ...node }, false)
}

// معالجة الحفظ والإرسال الفعلي للباك إند
const handleSaveAccount = async (formData) => {
  try {
    if (formData.id) {
      await accountStore.updateAccount(formData.id, formData)
      toast.success(`تم تحديث بيانات الحساب المحاسبي '${formData.name}' بنجاح.`)
    } else {
      await accountStore.createAccount(formData)
      toast.success(`تم إدراج الحساب الجديد '${formData.name}' داخل الشجرة بنجاح.`)
    }
    refreshTreeStructure()
    isModalOpen.value = false
  } catch (error) {
    const errorMessage =
      accountStore.error || error.response?.data?.message || 'فشلت عملية حفظ الحساب المالي.'
    toast.error(errorMessage)
  }
}

// --- معالجة حذف الحسابات الطرفية من الشجرة ---
const openDeleteDialog = (node) => {
  accountToDelete.value = node
  isDeleteDialogOpen.value = true
}

const deleteSelectedAccount = async () => {
  if (accountToDelete.value) {
    try {
      await accountStore.deleteAccount(accountToDelete.value.id)
      toast.success(
        `تم حذف واستبعاد الحساب '${accountToDelete.value.name}' من شجرة الحسابات بنجاح.`,
      )
      refreshTreeStructure()
    } catch (error) {
      const errorMessage =
        accountStore.error ||
        error.response?.data?.message ||
        'تعذر حذف الحساب المالي لوجود ارتباطات مالية أو أبناء تابعين له.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      accountToDelete.value = null
    }
  }
}
</script>
