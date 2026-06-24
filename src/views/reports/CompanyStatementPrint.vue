<template>
  <div class="print-portrait-container bg-white text-black p-4 font-sans" dir="rtl">
    <div
      class="print:hidden flex justify-end gap-3 mb-4 bg-gray-50 border border-gray-200 p-3 rounded"
    >
      <button
        @click="exportToExcel"
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
      >
        تصدير إلى إكسيل
      </button>

      <button
        @click="printReport"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
      >
        طباعة التقرير
      </button>
    </div>
    <!-- 1. رأس التقرير: العنوان الرئيسي والعنوان الفرعي الديناميكي -->
    <div class="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
      <div class="flex items-center gap-4">
        <img src="/MainLogo2.png" alt="Logo" class="w-16 h-16 object-contain" />
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">نظام حصر الديون</h1>
          <p class="text-base font-bold text-gray-600">{{ reportTitle }}</p>
        </div>
      </div>
      <div class="text-left text-xs font-medium text-gray-500 border-r-2 border-gray-200 pr-4">
        <p>تاريخ التقرير: {{ currentDate }}</p>
        <p>وقت الاستخراج: {{ currentTime }}</p>
      </div>
    </div>

    <!-- 2. صندوق معلومات التقرير: يعرض بيانات الشركة، المالك، أو الفلاتر المخصصة -->
    <div v-if="reportData" class="bg-gray-50 border border-gray-200 rounded p-3 mb-6">
      <div v-if="reportType === 'company'" class="grid grid-cols-3 gap-4">
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">اسم الشركة</p>
          <p class="text-sm font-black text-gray-900 truncate">{{ reportData.company?.name }}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">الرقم الضريبي</p>
          <p class="text-sm font-bold text-gray-800 font-mono">
            {{ reportData.company?.tax_number || '-' }}
          </p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">المفوض</p>
          <p class="text-sm font-bold text-gray-800">{{ reportData.company?.owner_name || '-' }}</p>
        </div>
      </div>

      <div v-else-if="reportType === 'owner'" class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">اسم الجهة المالكة</p>
          <p class="text-sm font-black text-gray-900 truncate">{{ reportData.owner?.name }}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">نوع التقرير</p>
          <p class="text-sm font-bold text-gray-800">مجمع مشاريع</p>
        </div>
      </div>

      <div v-else-if="reportType === 'custom'" class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">فلاتر التقرير</p>
          <p class="text-sm font-black text-gray-900 truncate">
            {{ customReportFiltersText }}
          </p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">عدد المشاريع المطابقة</p>
          <p class="text-sm font-bold text-gray-800">{{ reportData.projects?.length || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- 3. الملخص المالي: يعرض الإجماليات -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      <div class="border border-gray-200 p-2 rounded flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي العقود الكلية</p>
        <p class="text-lg font-black text-gray-700">
          {{ formatCurrency(reportData?.summary?.total_contract_value || 0) }}
        </p>
      </div>
      <div class="border border-gray-200 p-2 rounded flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي القيمة المستحقة</p>
        <p class="text-lg font-black text-black">
          {{ formatCurrency(reportData?.summary?.total_due_value || 0) }}
        </p>
      </div>
      <div class="border border-gray-200 p-2 rounded flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي المقبوضات</p>
        <p class="text-lg font-black text-emerald-700">
          {{ formatCurrency(reportData?.summary?.total_payments_received || 0) }}
        </p>
      </div>
      <div class="border border-gray-200 p-2 rounded flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">الرصيد المتبقي</p>
        <p class="text-lg font-black text-rose-700">
          {{ formatCurrency(reportData?.summary?.total_remaining || 0) }}
        </p>
      </div>
      <div
        class="border border-gray-200 p-2 rounded flex flex-col justify-center col-span-2 md:col-span-1"
      >
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">عدد المشاريع</p>
        <p class="text-lg font-black text-gray-800">
          {{ reportData?.projects?.length || 0 }}
          <span class="text-xs font-normal text-gray-500">مشروع</span>
        </p>
      </div>
    </div>

    <!-- 4. جدول تفاصيل المشاريع -->
    <div class="w-full mb-8">
      <table class="w-full text-right border-collapse table-auto">
        <thead>
          <tr class="bg-gray-800 text-white print:bg-gray-200 print:text-black text-[10px]">
            <th class="p-1 border border-gray-600 w-6 text-center">#</th>
            <th class="p-1 border border-gray-600 w-auto">بيانات المشروع</th>
            <th class="p-1 border border-gray-600 w-16 font-bold text-center">م. الصرف</th>
            <th class="p-1 border border-gray-600 w-16 font-bold text-center">م. تعاقدي</th>
            <th class="p-1 border border-gray-600 w-20 font-bold">قيمة العقد</th>
            <th class="p-1 border border-gray-600 w-20 font-bold">المستحق</th>
            <th class="p-1 border border-gray-600 w-20 font-bold">المدفوع</th>
            <th class="p-1 border border-gray-600 w-20 font-bold">المتبقي</th>
          </tr>
        </thead>
        <tbody class="text-[11px]">
          <tr
            v-for="(project, index) in reportData?.projects"
            :key="project.id"
            class="border-b border-gray-300 break-inside-avoid"
          >
            <td class="p-1 border border-gray-300 text-center font-bold align-top">
              {{ index + 1 }}
            </td>
            <td class="p-1 border border-gray-300 align-top">
              <p class="font-black text-xs mb-1">{{ project.name }}</p>
              <div class="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 mt-0.5">
                <div v-if="project.contract_number" class="flex items-center gap-1">
                  <span>عقد:</span>
                  <span
                    class="font-mono font-bold text-black bg-gray-50 px-1 rounded border border-gray-100"
                  >
                    {{ project.contract_number }}
                  </span>
                </div>
                <span v-if="project.contract_number" class="text-gray-300">|</span>
                <div class="flex items-center gap-1">
                  <span>المنفذ:</span>
                  <span class="font-bold text-black">
                    {{ project.company?.name || 'غير محدد' }}
                  </span>
                </div>
                <span class="text-gray-300">|</span>
                <div class="flex items-center gap-1">
                  <span>المالك:</span>
                  <span class="font-bold text-black">
                    {{ project.owner?.name || project.project_owner || 'غير محدد' }}
                  </span>
                </div>
              </div>
            </td>

            <td class="p-1 border border-gray-300 text-center align-top whitespace-nowrap">
              <span
                v-if="project.disbursement_status === 'fulfilled'"
                class="text-emerald-700 font-bold"
                >مستوفى</span
              >
              <span
                v-else-if="project.disbursement_status === 'unfulfilled'"
                class="text-rose-700 font-bold"
                >غير مستوفى</span
              >
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="p-1 border border-gray-300 text-center align-top whitespace-nowrap">
              <span
                v-if="project.contractual_status === 'compliant'"
                class="text-emerald-700 font-bold"
                >مطابق</span
              >
              <span
                v-else-if="project.contractual_status === 'non_compliant'"
                class="text-rose-700 font-bold"
                >غير مطابق</span
              >
              <span v-else class="text-gray-400">-</span>
            </td>

            <td class="p-1 border border-gray-300 text-gray-600 whitespace-nowrap align-top">
              {{ formatNumber(project.contract_value) }}
            </td>
            <td class="p-1 border border-gray-300 whitespace-nowrap align-top">
              {{ formatNumber(project.due_value) }}
            </td>
            <td
              class="p-1 border border-gray-300 text-emerald-800 font-bold whitespace-nowrap align-top"
            >
              {{ formatNumber(project.total_paid || project.payments_sum_amount) }}
            </td>
            <td
              class="p-1 border border-gray-300 font-black text-rose-800 whitespace-nowrap align-top"
            >
              {{
                formatNumber(
                  project.due_value - (project.total_paid || project.payments_sum_amount || 0),
                )
              }}
            </td>
          </tr>
          <tr v-if="!reportData?.projects?.length">
            <td colspan="8" class="p-4 text-center text-gray-500 text-xs">
              لا توجد مشاريع مسجلة في هذا التقرير
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5. تذييل التقرير: أماكن التوقيعات -->
    <div
      class="mt-8 grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100 break-inside-avoid"
    >
      <div class="space-y-8">
        <p class="font-bold text-gray-800 text-sm">المسؤول المالى</p>
        <div class="border-b border-gray-400 w-32 mx-auto"></div>
      </div>
      <div class="space-y-8">
        <p class="font-bold text-gray-800 text-sm">المراجعة والتدقيق</p>
        <div class="border-b border-gray-400 w-32 mx-auto"></div>
      </div>
      <div class="space-y-8">
        <p class="font-bold text-gray-800 text-sm">يعتمد / رئيس اللجنة</p>
        <div class="border-b border-gray-400 w-32 mx-auto"></div>
      </div>
    </div>

    <!-- 6. تذييل الطباعة: رقم الصفحة -->
    <div
      class="print-footer fixed bottom-0 left-0 w-full text-center text-[10px] text-gray-500 border-t border-gray-200 pt-1 bg-white hidden print:block"
    >
      صفحة <span class="page-number"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { generateExcelReport } from '@/utils/excelExport'

// --- الحالة (State) ---
const reportData = ref(null)
const reportType = ref('company') // القيمة الافتراضية

// --- المتغيرات المساعدة ---
const currentDate = new Date().toLocaleDateString('ar-EG')
const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

// --- الخصائص المحسوبة (Computed Properties) ---

/**
 * يبني نصاً وصفياً من معلومات الفلاتر الممررة للتقرير المخصص.
 * مثال: "المشاريع المكتملة" أو "مشاريع البنية التحتية و المشاريع قيد التنفيذ"
 */
const customReportFiltersText = computed(() => {
  // التأكد من وجود بيانات الفلتر
  if (!reportData.value?.filterInfo) return 'لا توجد فلاتر'

  const { projectTypeName, completionStatusName } = reportData.value.filterInfo

  // تجميع أسماء الفلاتر الموجودة فقط
  const parts = [projectTypeName, completionStatusName].filter(Boolean)

  if (parts.length === 0) return 'كل المشاريع'
  return parts.join(' و ')
})

/**
 * يبني عنوان التقرير الرئيسي بشكل ديناميكي بناءً على نوع التقرير والفلاتر.
 */
const reportTitle = computed(() => {
  if (reportType.value === 'custom') {
    return `تقرير مالي لـ: ${customReportFiltersText.value}`
  }
  if (reportType.value === 'owner') {
    return 'تقرير كشف حساب جهة مالكة تفصيلي'
  }
  // القيمة الافتراضية هي تقرير الشركة
  return 'تقرير كشف حساب شركة تفصيلي'
})

// --- الدوال (Functions) ---

const printReport = () => {
  window.print()
}

const exportToExcel = async () => {
  try {
    // نقوم بتمرير البيانات من الواجهة إلى الملف المنفصل
    await generateExcelReport(
      reportData.value,
      reportTitle.value,
      reportType.value,
      customReportFiltersText.value,
    )
  } catch (error) {
    console.error('حدث خطأ أثناء تصدير الإكسيل:', error)
  }
}

/**
 * دالة لتنسيق الأرقام داخل الجدول بدون علامة العملة.
 */
const formatNumber = (value) => {
  if (value === undefined || value === null) return '0'
  // يستخدم لتنسيق الأرقام مع فواصل الآلاف فقط
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// --- دورة حياة المكون (Lifecycle Hooks) ---

/**
 * عند تحميل المكون، يتم قراءة البيانات من sessionStorage وطباعة التقرير.
 */
onMounted(() => {
  const savedData = sessionStorage.getItem('printStatementData')

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)

      // تحديث نوع التقرير بناءً على البيانات المحفوظة
      if (parsed.reportType) {
        reportType.value = parsed.reportType
      }

      // وضع كل البيانات المحفوظة في متغير الحالة
      reportData.value = parsed

      // تأخير الطباعة قليلاً للسماح للمتصفح برسم كل عناصر الصفحة
      setTimeout(() => {
        window.print()
      }, 1000)
    } catch (e) {
      console.error('خطأ في تحليل بيانات الطباعة من sessionStorage', e)
      // يمكنك هنا عرض رسالة خطأ للمستخدم إذا لزم الأمر
    }
  }
})
</script>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
  }

  .print-footer {
    display: block !important;
  }

  .page-number::after {
    content: counter(page);
  }
}

.print-portrait-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

table {
  border-spacing: 0;
  width: 100%;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
