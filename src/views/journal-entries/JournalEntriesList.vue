<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-black text-text-primary">دفتر القيود اليومية العامة</h1>
        <p class="text-xs text-text-secondary mt-1">
          مراقبة وتتبع حركة السندات المالية وقيد اليومية العام والتأكد من اتزان الحركات في شجرة
          الحسابات.
        </p>
      </div>
      <AppButton type="button" @click="goToCreatePage"> إنشاء قيد مالي جديد </AppButton>
    </div>

    <JournalEntryFilters
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
    />

    <JournalEntryTable
      :journal-entries="journalEntries"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-journal-entry="goToEditPage"
      @delete-journal-entry="openDeleteDialog"
      @row-clicked="goToEditPage"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وعكس السند المالي"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء حركات السند المالي رقم '#${entryToDelete?.entry_number}'؟ سيترتب على هذا الإجراء تراجع فوري وعكس كامل الحركات المؤثرة على أرصدة الحسابات الفرعية المعنية في دفتر الأستاذ.`"
      @confirmed="deleteSelectedEntry"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalEntryStore } from '@/stores/journalEntryStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات الفرعية التخصصية وأدوات الـ UI المحايدة
import AppButton from '@/components/ui/AppButton.vue'
import JournalEntryFilters from './components/JournalEntryFilters.vue'
import JournalEntryTable from './components/JournalEntryTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const toast = useToast()

const journalEntryStore = useJournalEntryStore()
const { journalEntries, loading, pagination } = storeToRefs(journalEntryStore)

// متغيرات الفلترة والبحث المحلية
const searchQuery = ref('')
const typeFilter = ref('')
let searchTimeout = null

// محرك الفلترة النصية مع آلية الـ Debounce لنصف ثانية لحماية الخادم
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// دالة تجميع الفلاتر وطلب جلب البيانات المحدثة من السيرفر بالتوافق مع الستور
const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    type: typeFilter.value,
  }

  journalEntryStore.fetchJournalEntries(page, filters).catch(() => {
    toast.error('فشل النظام في جلب مستندات القيود المالية المحدثة من الخادم.')
  })
}

// تحميل الصفحة الأولى فور شحن وتغذية المكون برمجياً
onMounted(() => {
  handlePageChange(1)
})

// --- محرك التوجيه البرمجي للشاشات الكاملة ---
const goToCreatePage = () => {
  router.push('/app/journal-entries/create')
}

const goToEditPage = (entry) => {
  router.push(`/app/journal-entries/${entry.id}/edit`)
}

// --- معالجة عمليات الحذف والاستبعاد الصارم وعكس الأثر المالي ---
const isDeleteDialogOpen = ref(false)
const entryToDelete = ref(null)

const openDeleteDialog = (entry) => {
  entryToDelete.value = entry
  isDeleteDialogOpen.value = true
}

const deleteSelectedEntry = async () => {
  if (entryToDelete.value) {
    try {
      await journalEntryStore.deleteJournalEntry(entryToDelete.value.id)
      toast.success(
        `تم حذف السند المالي رقم '#${entryToDelete.value.entry_number}' وعكس حركاته الدفترية بنجاح.`,
      )

      // التحقق من سلامة مؤشر الترقيم التلقائي بعد الحذف مباشرة
      if (journalEntries.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch (error) {
      const errorMessage =
        journalEntryStore.error || 'فشلت عملية إلغاء وحذف السند المالي من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      entryToDelete.value = null
    }
  }
}
</script>
