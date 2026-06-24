<!--src\components\ui\DynamicCrudPage.vue--->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">{{ title }}</h1>
      <AppButton
        v-if="canCreate && (formMode === 'modal' || !isModalOpen)"
        @click="openModal(null)"
      >
        إضافة {{ entityName }}
      </AppButton>
    </div>

    <AppCard v-if="hasFilterableFields && (formMode === 'modal' || !isModalOpen)" class="mb-6">
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div v-if="searchableField" class="w-full">
            <h3 class="font-semibold text-sm mb-2 text-text-secondary">بحث سريع</h3>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                v-model="filters.search"
                type="text"
                :placeholder="`ابحث بـ ${searchableField.label}...`"
                class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
              />
            </div>
          </div>

          <div
            v-for="field in dropdownFilterableFields"
            :key="`filter-${field.key}`"
            class="w-full"
          >
            <h3 class="font-semibold text-sm mb-2 text-text-secondary">{{ field.label }}</h3>
            <AppDropdown
              :id="`filter-input-${field.key}`"
              label=""
              v-model="filters[field.key]"
              :options="field.options || []"
              placeholder="الكل"
            />
          </div>
        </div>
      </div>
    </AppCard>

    <AppCard v-if="formMode === 'modal' || !isModalOpen">
      <AppTable :headers="tableHeaders" :items="items" :is-loading="loading">
        <template
          v-for="field in tableFields"
          :key="`cell-${field.key}`"
          #[`cell-${field.key}`]="{ item }"
        >
          <span v-if="field.type === 'currency'" class="font-bold text-emerald-600">
            {{ formatCurrency(item[field.key]) }}
          </span>

          <span v-else-if="field.type === 'date'" class="text-text-secondary text-sm">
            {{ formatDate(item[field.key]) }}
          </span>

          <span v-else class="text-text-primary font-medium">
            {{ item[field.key] }}
          </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-center space-x-3 space-x-reverse">
            <button
              v-if="canUpdate"
              @click.stop="openModal(item)"
              class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              title="تعديل"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              v-if="canDelete"
              @click.stop="confirmDelete(item)"
              class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="حذف"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="fetchData" />
    </AppCard>

    <AppDialog
      v-if="formMode === 'modal' && isModalOpen"
      v-model="isModalOpen"
      :title="modalTitle"
      :size-class="modalSize"
    >
      <form @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <div
            v-for="section in formSections"
            :key="`section-${section.name}`"
            class="border border-surface-border rounded-xl p-4 bg-surface-overlay/40 space-y-4"
          >
            <h3
              v-if="section.name !== 'default'"
              class="text-sm font-bold text-text-primary border-b border-surface-border pb-2"
            >
              {{ section.name }}
            </h3>
            <div class="grid grid-cols-12 gap-4">
              <div
                v-for="field in section.fields"
                :key="`form-group-${field.key}`"
                :class="field.gridClass || 'col-span-12'"
              >
                <AppInput
                  v-if="field.type === 'text' || field.type === 'number'"
                  :id="`modal-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  :type="field.type"
                  :placeholder="field.placeholder || `ادخل ${field.label}`"
                  :required="field.required"
                />

                <AppTextarea
                  v-else-if="field.type === 'textarea'"
                  :id="`modal-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  :placeholder="field.placeholder || `ادخل ${field.label}`"
                  rows="3"
                />

                <AppCurrencyInput
                  v-else-if="field.type === 'currency'"
                  :id="`modal-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  placeholder="0.00"
                  :required="field.required"
                />

                <AppDropdown
                  v-else-if="field.type === 'select'"
                  :id="`modal-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  :options="field.options || []"
                  :placeholder="field.placeholder || 'اختر من القائمة'"
                  :required="field.required"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          class="mt-8 flex justify-end space-x-3 space-x-reverse border-t border-surface-border pt-4"
        >
          <AppButton type="button" variant="secondary" @click="closeModal">إلغاء</AppButton>
          <AppButton type="submit">حفظ البيانات</AppButton>
        </div>
      </form>
    </AppDialog>

    <div
      v-else-if="formMode === 'page' && isModalOpen"
      class="w-full space-y-6 transition-all duration-300 animate-fade-in pb-16"
    >
      <div class="flex justify-between items-center mb-6 border-b border-surface-border pb-4">
        <h2 class="text-xl font-bold text-text-primary">{{ modalTitle }}</h2>
      </div>

      <AppCard class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div
            v-for="section in formSections"
            :key="`page-section-${section.name}`"
            class="border border-surface-border rounded-xl p-5 bg-surface-overlay/20 space-y-4"
          >
            <h3
              v-if="section.name !== 'default'"
              class="text-sm font-bold text-text-primary border-b border-surface-border pb-2"
            >
              {{ section.name }}
            </h3>
            <div class="grid grid-cols-12 gap-4">
              <div
                v-for="field in section.fields"
                :key="`page-group-${field.key}`"
                :class="field.gridClass || 'col-span-12'"
              >
                <AppInput
                  v-if="field.type === 'text' || field.type === 'number'"
                  :id="`page-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  :type="field.type"
                  :placeholder="field.placeholder || `ادخل ${field.label}`"
                  :required="field.required"
                />

                <AppTextarea
                  v-else-if="field.type === 'textarea'"
                  :id="`page-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  :placeholder="field.placeholder || `ادخل ${field.label}`"
                  rows="3"
                />

                <AppCurrencyInput
                  v-else-if="field.type === 'currency'"
                  :id="`page-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  placeholder="0.00"
                  :required="field.required"
                />

                <AppDropdown
                  v-else-if="field.type === 'select'"
                  :id="`page-input-${field.key}`"
                  :label="field.label"
                  v-model="localForm[field.key]"
                  :options="field.options || []"
                  :placeholder="field.placeholder || 'اختر من القائمة'"
                  :required="field.required"
                />
              </div>
            </div>
          </div>

          <div
            class="mt-8 flex justify-end space-x-3 space-x-reverse border-t border-surface-border pt-6 sticky bottom-0 bg-surface-overlay z-10 pb-2"
          >
            <AppButton type="button" variant="secondary" @click="closeModal"
              >تراجع وعودة للقائمة</AppButton
            >
            <AppButton type="submit">حفظ وتأكيد البيانات</AppButton>
          </div>
        </form>
      </AppCard>
    </div>

    <AppConfirmDialog
      v-model="isDeleteOpen"
      title="تأكيد حذف السجل"
      :message="`هل أنت متأكد من رغبتك في حذف هذا السجل بشكل نهائي؟`"
      @confirmed="deleteItem"
    />
  </div>
</template>

<script setup>
// [التعديل هنا]: استيراد toRaw لفك كائن Vue قبل استنساخه
import { ref, computed, watch, onMounted, nextTick, toRaw } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCrud } from '@/composables/useCrud'
import { formatCurrency, formatDate } from '@/utils/formatters'

import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  title: { type: String, required: true },
  entityName: { type: String, required: true },
  store: { type: Object, required: true },
  dataKey: { type: String, required: true },
  entityKey: { type: String, default: null },
  schema: { type: Array, required: true },
  permissionPrefix: { type: String, default: '' },
  modalSize: { type: String, default: 'max-w-lg' },
  formMode: { type: String, default: 'modal' },
})

const authStore = useAuthStore()

const capitalizedEntity = computed(() => {
  if (props.entityKey) {
    return props.entityKey.charAt(0).toUpperCase() + props.entityKey.slice(1)
  }
  const entity = props.dataKey.endsWith('s') ? props.dataKey.slice(0, -1) : props.dataKey
  return entity.charAt(0).toUpperCase() + entity.slice(1)
})

const capitalizedPlural = computed(() => {
  return props.dataKey.charAt(0).toUpperCase() + props.dataKey.slice(1)
})

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
  initialFilters: { search: '' },
  data: computed(() => props.store[props.dataKey]),
  loading: computed(() => props.store.loading),
  pagination: computed(() => props.store.pagination),
  error: computed(() => props.store.error),

  fetchAction: props.store[`fetch${capitalizedPlural.value}`],
  createAction: props.store[`create${capitalizedEntity.value}`],
  updateAction: props.store[`update${capitalizedEntity.value}`],
  deleteAction: props.store[`delete${capitalizedEntity.value}`],
})

const canCreate = computed(
  () => !props.permissionPrefix || authStore.can(`${props.permissionPrefix}.create`),
)
const canUpdate = computed(
  () => !props.permissionPrefix || authStore.can(`${props.permissionPrefix}.update`),
)
const canDelete = computed(
  () => !props.permissionPrefix || authStore.can(`${props.permissionPrefix}.delete`),
)

const tableFields = computed(() => props.schema.filter((f) => f.showInTable !== false))
const formFields = computed(() => props.schema.filter((f) => f.showInForm !== false))

const formSections = computed(() => {
  const sectionsMap = new Map()

  formFields.value.forEach((field) => {
    const sectionName = field.section || 'default'
    if (!sectionsMap.has(sectionName)) {
      sectionsMap.set(sectionName, [])
    }
    sectionsMap.get(sectionName).push(field)
  })

  const sectionsArray = []
  sectionsMap.forEach((fields, name) => {
    sectionsArray.push({ name, fields })
  })
  return sectionsArray
})

const searchableField = computed(() => props.schema.find((f) => f.searchable === true))
const dropdownFilterableFields = computed(() =>
  props.schema.filter((f) => f.filterable === true && f.type === 'select'),
)
const hasFilterableFields = computed(
  () => !!searchableField.value || dropdownFilterableFields.value.length > 0,
)

const tableHeaders = computed(() => {
  const headers = tableFields.value.map((f) => ({
    key: f.key,
    label: f.label,
    class: f.class || '',
  }))
  if (canUpdate.value || canDelete.value) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-center min-w-[120px]' })
  }
  return headers
})

const modalTitle = computed(() => {
  return activeItem.value
    ? `تعديل البيانات لـ ${props.entityName}`
    : `إضافة ${props.entityName} جديد`
})

const localForm = ref({})

const createFreshForm = () => {
  const freshForm = {}
  formFields.value.forEach((f) => {
    freshForm[f.key] = f.type === 'number' || f.type === 'currency' ? null : ''
  })
  return freshForm
}

watch(
  () => isModalOpen.value,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      if (activeItem.value && Object.keys(activeItem.value).length > 0) {
        // [التعديل هنا]: استخدام structuredClone مع toRaw لنسخ عميق وآمن للبيانات
        localForm.value = structuredClone(toRaw(activeItem.value))
      } else {
        localForm.value = createFreshForm()
      }
    } else {
      localForm.value = {}
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  const sanitizedForm = { ...localForm.value }

  formFields.value.forEach((field) => {
    if (field.type === 'number' || field.type === 'currency') {
      const value = sanitizedForm[field.key]
      if (value === '' || value === undefined || String(value).trim() === '') {
        sanitizedForm[field.key] = null
      }
    }
  })

  saveItem(sanitizedForm)
}

onMounted(() => {
  fetchData(1)
})
</script>
