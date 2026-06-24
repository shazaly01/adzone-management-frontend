import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'

/**
 * Composable احترافي وموحد لإدارة عمليات الـ CRUD بدقة هندسية كاملة (Explicit Injection)
 * @param {Object} config - كائن الإعدادات الصريح الذي يحتوي على الدوال والبيانات من الستور
 */
export function useCrud(config) {
  const toast = useToast()

  const filters = ref({ ...config.initialFilters })

  // متغير لتخزين مؤقت البحث
  let searchTimeout = null

  // ربط البيانات والمؤشرات صراحة من الإعدادات الممررة
  const items = computed(() => config.data.value || [])
  const loading = computed(() => config.loading.value || false)
  const pagination = computed(
    () => config.pagination.value || { current_page: 1, last_page: 1, total: 0 },
  )

  // إدارة حالة المودالات والنوافذ المنبثقة
  const isModalOpen = ref(false)
  const isDeleteOpen = ref(false)
  const activeItem = ref(null)

  // --- 1. دالة جلب البيانات الموحدة ---
  const fetchData = async (page = 1) => {
    await nextTick()
    if (!config.fetchAction) {
      console.warn('useCrud: دالة fetchAction غير ممررة في الإعدادات.')
      return
    }

    try {
      await config.fetchAction(page, { ...filters.value })
    } catch {
      toast.error('حدث خطأ أثناء جلب البيانات من السيرفر.')
    }
  }

  // --- 2. دالة جلب البيانات مع تأخير (Debounce) موحدة ---
  // تم توحيد هذا المنطق لتجنب الـ Race Conditions بين v-model و الـ Watch
  const debouncedFetch = (page = 1) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      await fetchData(page)
    }, 500)
  }

  // تم الاحتفاظ بدالة onSearch لضمان توافقية الواجهة حتى يتم تحديثها
  const onSearch = () => {
    debouncedFetch(1)
  }

  // [الحل]: تنظيف مؤقت البحث عند تدمير المكون لمنع تسرب الذاكرة (Memory Leak)
  onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
  })

  // --- 3. دوال التحكم بموديل الإضافة والتعديل ---
  const openModal = (item = null) => {
    activeItem.value = item ? { ...item } : null
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    nextTick(() => {
      activeItem.value = null
    })
  }

  // --- 4. دالة الحفظ والتحديث الموحدة والصريحة ---
  const saveItem = async (formData) => {
    try {
      if (formData.id) {
        if (!config.updateAction) throw new Error('دالة التعديل updateAction غير معرفة.')
        await config.updateAction(formData.id, formData)
        toast.success('تم تعديل البيانات بنجاح.')
      } else {
        if (!config.createAction) throw new Error('دالة الإضافة createAction غير معرفة.')
        await config.createAction(formData)
        toast.success('تمت إضافة البيانات بنجاح.')
      }
      await fetchData(pagination.value.current_page || 1)
      closeModal()
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        config.error?.value ||
        err.message ||
        'حدث خطأ أثناء حفظ البيانات.'
      toast.error(errorMessage)
    }
  }

  // --- 5. دوال التحكم بحوار تأكيد الحذف ---
  const confirmDelete = (item) => {
    activeItem.value = item
    isDeleteOpen.value = true
  }

  const deleteItem = async () => {
    if (!activeItem.value) return
    if (!config.deleteAction) {
      toast.error('دالة الحذف deleteAction غير معرفة.')
      return
    }

    try {
      await config.deleteAction(activeItem.value.id)
      toast.success('تم حذف العنصر بنجاح.')

      if (items.value.length === 1 && pagination.value.current_page > 1) {
        await fetchData(pagination.value.current_page - 1)
      } else {
        await fetchData(pagination.value.current_page)
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        config.error?.value ||
        'فشل حذف العنصر لارتباطه ببيانات أخرى.'
      toast.error(errorMessage)
    } finally {
      isDeleteOpen.value = false
      nextTick(() => {
        activeItem.value = null
      })
    }
  }

  // [الحل]: المراقبة الآن تستخدم الـ Debounce الموحد وتعمل بسلاسة تامة مع الـ v-model
  watch(
    () => filters.value,
    () => {
      debouncedFetch(1)
    },
    { deep: true },
  )

  return {
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
  }
}
