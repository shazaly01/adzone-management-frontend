<template>
  <div>
    <FullScreenLoader :show="loading" message="جاري تحميل التقرير..." />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">{{ reportTitle }}</h1>
      <AppButton
        v-if="reportData"
        @click="handlePrint"
        class="bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        <PrinterIcon class="w-5 h-5 ml-2" />
        طباعة احترافية
      </AppButton>
    </div>

    <AppCard class="mb-8">
      <h3 class="font-semibold text-lg mb-4">خيارات التقرير</h3>

      <div class="space-y-4 max-w-4xl">
        <div class="flex items-center gap-6 border-b border-gray-100 pb-4">
          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="reportType"
              value="company"
              class="form-radio text-primary h-5 w-5"
              @change="resetData"
            />
            <span class="mr-2 text-text-primary">كشف حساب شركة</span>
          </label>

          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="reportType"
              value="owner"
              class="form-radio text-sky-500 h-5 w-5"
              @change="resetData"
            />
            <span class="mr-2 text-text-primary">كشف حساب جهة مالكة</span>
          </label>

          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="reportType"
              value="custom"
              class="form-radio text-teal-500 h-5 w-5"
              @change="resetData"
            />
            <span class="mr-2 text-text-primary">تقرير مخصص</span>
          </label>
        </div>

        <div>
          <CompaniesDropdown
            v-if="reportType === 'company'"
            id="report-company-select"
            label="اختر الشركة"
            v-model="selectedId"
            @update:modelValue="fetchReport"
          />

          <OwnersDropdown
            v-else-if="reportType === 'owner'"
            id="report-owner-select"
            label="اختر الجهة المالكة"
            v-model="selectedId"
            @update:modelValue="fetchReport"
          />

          <div v-else-if="reportType === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ProjectTypesDropdown
                id="report-project-type-filter"
                label="اختر نوع المشروع"
                v-model="projectTypeFilter"
                @update:modelValue="
                  (val, item) => {
                    // هنا نفترض أن المكون يرسل الكائن المختار كمعامل ثاني
                    // إذا كان يرسل الـ ID فقط، سنحتاج لتعديل آخر
                    projectTypeName = item?.name || ''
                    fetchReport()
                  }
                "
                placeholder="الكل"
              />
            </div>
            <div>
              <AppDropdown
                id="report-completion-status-filter"
                label="اختر حالة الإنجاز"
                v-model="completionStatusFilter"
                @update:modelValue="fetchReport"
                :options="completionOptions"
                placeholder="الكل"
              />
            </div>
          </div>
        </div>
      </div>
    </AppCard>

    <div v-if="error" class="text-center p-10 text-danger">
      <p>{{ error }}</p>
    </div>

    <AppCard v-else-if="reportData" class="p-6">
      <div class="border-b border-surface-border pb-4 mb-6">
        <div v-if="reportType === 'company'">
          <h2 class="text-xl font-bold text-primary mb-2">{{ reportData.company?.name }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
            <p><strong>الرقم الضريبي:</strong> {{ reportData.company?.tax_number || 'N/A' }}</p>
            <p><strong>المفوض:</strong> {{ reportData.company?.owner_name || 'N/A' }}</p>
            <p><strong>العنوان:</strong> {{ reportData.company?.address || 'غير محدد' }}</p>
          </div>
        </div>

        <div v-else-if="reportType === 'owner'">
          <h2 class="text-xl font-bold text-sky-600 mb-2">{{ reportData.owner?.name }}</h2>
          <div class="text-sm text-text-secondary">
            <p>
              تقرير مجمع للمشاريع التابعة لـ <strong>{{ reportData.owner?.name }}</strong>
            </p>
          </div>
        </div>

        <div v-else-if="reportType === 'custom'">
          <h2 class="text-xl font-bold text-teal-600 mb-2">
            {{ reportData.report_info?.title || 'تقرير مشاريع مخصص' }}
          </h2>
          <div class="text-sm text-text-secondary">
            <p>تقرير مالي مجمع للمشاريع التي تطابق الفلاتر المحددة.</p>
          </div>
        </div>
      </div>

      <div class="bg-surface-ground p-4 rounded-lg mb-8">
        <h3 class="text-lg font-semibold mb-4">ملخص مالي</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-sm text-text-muted">إجمالي العقود الكلية</p>
            <p class="text-2xl font-bold text-gray-500">
              {{ formatCurrency(reportData.summary?.total_contract_value || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي القيمة المستحقة</p>
            <p class="text-2xl font-bold text-primary">
              {{ formatCurrency(reportData.summary?.total_due_value || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي المبالغ المدفوعة</p>
            <p class="text-2xl font-bold text-success">
              {{ formatCurrency(reportData.summary?.total_payments_received || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">الرصيد المتبقي</p>
            <p class="text-2xl font-bold text-warning">
              {{ formatCurrency(reportData.summary?.total_remaining || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">عدد المشاريع</p>
            <p class="text-2xl font-bold">{{ reportData.projects?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-semibold mb-4">تفاصيل المشاريع</h3>

        <div
          v-for="project in reportData.projects"
          :key="project.id"
          class="border border-surface-border rounded-lg p-4 grid grid-cols-7 gap-4 items-center"
        >
          <div class="col-span-2">
            <h4 class="font-semibold text-base text-text-primary truncate" :title="project.name">
              مشروع: {{ project.name }}
            </h4>

            <div class="flex flex-col gap-0.5 mt-1 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="text-gray-500">الشركة المنفذة:</span>
                <span class="text-indigo-500 font-bold">{{
                  project.company?.name || 'غير محدد'
                }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-gray-500">المالك:</span>
                <span class="text-sky-500">{{
                  project.owner?.name || project.project_owner || 'غير محدد'
                }}</span>
              </div>
            </div>
          </div>
          <div>
            <p class="text-sm text-text-muted">قيمة العقد</p>
            <p class="font-bold text-text-secondary">
              {{ formatCurrency(project.contract_value) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">القيمة المستحقة</p>
            <p class="font-bold text-text-primary">{{ formatCurrency(project.due_value) }}</p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي المدفوع</p>
            <p class="font-bold text-success">
              {{ formatCurrency(project.total_paid || project.payments_sum_amount || 0) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-text-muted">مؤيدات الصرف</p>
            <p :class="getDisbursementStatusClass(project.disbursement_status)" class="font-bold">
              {{ getDisbursementStatusLabel(project.disbursement_status) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-text-muted">الموقف التعاقدي</p>
            <p :class="getContractualStatusClass(project.contractual_status)" class="font-bold">
              {{ getContractualStatusLabel(project.contractual_status) }}
            </p>
          </div>
        </div>

        <div v-if="reportData.projects?.length === 0" class="text-center py-8 text-text-muted">
          لا توجد مشاريع تطابق الفلاتر المحددة.
        </div>
      </div>
    </AppCard>

    <div v-else class="text-center text-text-muted py-10">
      <p v-if="reportType === 'company'">الرجاء اختيار شركة من القائمة لعرض كشف حسابها.</p>
      <p v-else-if="reportType === 'owner'">الرجاء اختيار جهة مالكة من القائمة لعرض كشف حسابها.</p>
      <p v-else-if="reportType === 'custom'">الرجاء اختيار فلتر واحد على الأقل لعرض التقرير.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import AppButton from '@/components/ui/AppButton.vue'
import reportService from '@/services/reportsService'
import { useToast } from 'vue-toastification'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'
import AppCard from '@/components/ui/AppCard.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import OwnersDropdown from '@/components/forms/OwnersDropdown.vue'
import { formatCurrency } from '@/utils/formatters'
import { useProjectTypeStore } from '@/stores/projectTypeStore' // أضف هذا السطر

// استيراد المكونات الجديدة للفلترة
import ProjectTypesDropdown from '@/components/forms/ProjectTypesDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const toast = useToast()
const router = useRouter()
const projectTypeStore = useProjectTypeStore()
// --- الحالة الرئيسية (State) ---

// نوع التقرير: 'company', 'owner', أو 'custom'
const reportType = ref('company')

// المعرف المختار (لشركة أو مالك)
const selectedId = ref(null)

// متغيرات الفلاتر الجديدة للتقرير المخصص
const projectTypeFilter = ref(null)
const completionStatusFilter = ref('')

// بيانات التقرير والحالة
const reportData = ref(null)
const loading = ref(false)
const error = ref(null)
const projectTypeName = ref('') // سنخزن فيه الاسم المختار

// خيارات قائمة حالة الإنجاز
const completionOptions = [
  { id: '', name: 'الكل' },
  { id: 'completed', name: 'مكتملة (100%)' },
  { id: 'in_progress', name: 'قيد التنفيذ (1% - 99%)' },
  { id: 'not_started', name: 'لم تبدأ (0%)' },
  { id: 'almost_done', name: 'على وشك الانتهاء (> 80%)' },
  { id: 'just_started', name: 'في البداية (< 20%)' },
]

// --- الدوال (Functions) ---

/**
 * دالة لتصفير كل البيانات عند تغيير نوع التقرير الرئيسي.
 */
const resetData = () => {
  selectedId.value = null
  projectTypeFilter.value = null
  completionStatusFilter.value = ''
  reportData.value = null
  error.value = null
}

/**
 * الدالة الأساسية لجلب بيانات التقرير من الواجهة الخلفية.
 * تتعامل بذكاء مع الأنواع الثلاثة للتقارير.
 */
async function fetchReport() {
  // الشرط 1: لا تفعل شيئاً إذا كان النوع شركة/مالك ولم يتم اختيار ID
  if ((reportType.value === 'company' || reportType.value === 'owner') && !selectedId.value) {
    reportData.value = null
    return
  }

  // الشرط 2: لا تفعل شيئاً إذا كان النوع مخصص ولم يتم اختيار أي فلتر
  if (reportType.value === 'custom' && !projectTypeFilter.value && !completionStatusFilter.value) {
    reportData.value = null
    return
  }

  loading.value = true
  error.value = null
  reportData.value = null

  try {
    let response
    let params = {}

    if (reportType.value === 'custom') {
      // بناء بارامترات الفلترة للتقرير المخصص
      if (projectTypeFilter.value) params.project_type_id = projectTypeFilter.value
      if (completionStatusFilter.value) params.completion_status = completionStatusFilter.value

      // استدعاء الدالة الجديدة في الخدمة (يجب إضافتها في reportService.js)
      response = await reportService.getProjectsReportByFilter(params)
    } else if (reportType.value === 'company') {
      response = await reportService.getCompanyStatement(selectedId.value)
    } else {
      // owner
      response = await reportService.getOwnerStatement(selectedId.value)
    }

    reportData.value = response.data.data
  } catch (err) {
    error.value = 'فشل في تحميل بيانات التقرير. الرجاء المحاولة مرة أخرى.'
    toast.error(error.value)
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * ترجمة حالة مؤيدات الصرف
 */
const getDisbursementStatusLabel = (status) => {
  if (status === 'fulfilled') return 'مستوفى'
  if (status === 'unfulfilled') return 'غير مستوفى'
  return 'غير محدد'
}

/**
 * تحديد لون حالة مؤيدات الصرف
 */
const getDisbursementStatusClass = (status) => {
  if (status === 'fulfilled') return 'text-emerald-500' // أخضر
  if (status === 'unfulfilled') return 'text-rose-500' // أحمر
  return 'text-gray-400'
}

/**
 * ترجمة حالة الموقف التعاقدي
 */
const getContractualStatusLabel = (status) => {
  if (status === 'compliant') return 'مطابق'
  if (status === 'non_compliant') return 'غير مطابق'
  return 'غير محدد'
}

/**
 * تحديد لون حالة الموقف التعاقدي
 */
const getContractualStatusClass = (status) => {
  if (status === 'compliant') return 'text-emerald-500' // أخضر
  if (status === 'non_compliant') return 'text-rose-500' // أحمر
  return 'text-gray-400'
}

/**
 * دالة لفتح صفحة الطباعة مع تمرير البيانات.
 */
const handlePrint = () => {
  if (!reportData.value) return

  // 1. جلب اسم "نوع المشروع" من الستور باستخدام الـ ID المختار
  const selectedType = projectTypeStore.projectTypes.find((t) => t.id === projectTypeFilter.value)
  const projectTypeNameLabel = selectedType ? selectedType.name : ''

  // 2. جلب نص "حالة الإنجاز" من القائمة المحلية
  const selectedStatus = completionOptions.find((opt) => opt.id === completionStatusFilter.value)
  const statusLabel = selectedStatus && selectedStatus.id !== '' ? selectedStatus.name : ''

  // 3. تجهيز كائن معلومات الفلتر
  const filterInfo = {
    projectTypeName: projectTypeNameLabel, // الآن سيظهر الاسم الحقيقي (مثل: معماري)
    completionStatusName: statusLabel,
  }

  const printPayload = {
    ...reportData.value,
    reportType: reportType.value,
    filterInfo: filterInfo,
  }

  // حفظ البيانات وفتح صفحة الطباعة
  sessionStorage.setItem('printStatementData', JSON.stringify(printPayload))
  const routeData = router.resolve({ name: 'PrintCompanyStatement' })
  window.open(routeData.href, '_blank')
}
// --- الخصائص المحسوبة (Computed Properties) ---

/**
 * يحدد عنوان الصفحة ديناميكياً بناءً على نوع التقرير.
 */
const reportTitle = computed(() => {
  if (reportType.value === 'custom') {
    // إذا كان هناك بيانات، نعرض عنواناً أكثر تفصيلاً
    return reportData.value ? 'تقرير مالي حسب الفلتر' : 'تقرير مشاريع مخصص'
  }
  if (!reportData.value) return 'تقرير كشف الحساب'
  return reportType.value === 'company' ? `كشف حساب شركة` : `كشف حساب جهة مالكة`
})

// --- المراقبون (Watchers) ---

/**
 * مراقبة تغيير نوع التقرير الرئيسي لتصفير البيانات.
 */
watch(reportType, () => {
  resetData()
})
</script>
