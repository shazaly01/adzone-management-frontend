<!--src\views\reports\PrintSummary.vue--->
<template>
  <div class="print-portrait-container bg-white text-black p-4 font-sans" dir="rtl">
    <div class="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
      <div class="flex items-center gap-4">
        <img src="/MainLogo2.png" alt="Logo" class="w-16 h-16 object-contain" />
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">نظام حصر الديون</h1>
          <p class="text-base font-bold text-gray-600">تقرير ملخص الأرصدة والمديونيات الشامل</p>
        </div>
      </div>

      <div class="text-left text-xs font-medium text-gray-500 border-r-2 border-gray-200 pr-4">
        <p>تاريخ التقرير: {{ currentDate }}</p>
        <p>وقت الاستخراج: {{ currentTime }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      <div class="border border-gray-200 p-2 rounded bg-gray-50 flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي العقود الكلية</p>
        <p class="text-lg font-black text-gray-700">
          {{ formatCurrency(grandSummary?.grand_total_contract_value) }}
        </p>
      </div>

      <div class="border border-gray-200 p-2 rounded bg-gray-50 flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي القيمة المستحقة</p>
        <p class="text-lg font-black text-black">
          {{ formatCurrency(grandSummary?.grand_total_due_value) }}
        </p>
      </div>

      <div class="border border-gray-200 p-2 rounded bg-gray-50 flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي المدفوعات</p>
        <p class="text-lg font-black text-emerald-700">
          {{ formatCurrency(grandSummary?.grand_total_paid) }}
        </p>
      </div>

      <div class="border border-gray-200 p-2 rounded bg-gray-50 flex flex-col justify-center">
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إجمالي المتبقي</p>
        <p class="text-lg font-black text-rose-700">
          {{ formatCurrency(grandSummary?.grand_total_remaining) }}
        </p>
      </div>

      <div
        class="border border-gray-200 p-2 rounded bg-gray-50 flex flex-col justify-center col-span-2 md:col-span-1"
      >
        <p class="text-gray-500 text-[10px] font-bold mb-1 uppercase">إحصائيات الكيانات</p>
        <p class="text-lg font-black text-black">
          {{ grandSummary?.total_companies }} شركة / {{ grandSummary?.total_projects }} مشروع
        </p>
      </div>
    </div>

    <div class="w-full">
      <table class="w-full text-right border-collapse table-auto">
        <thead>
          <tr class="bg-gray-800 text-white print:bg-gray-200 print:text-black text-xs">
            <th class="p-1 border border-gray-600 w-8 text-center">#</th>
            <th class="p-1 border border-gray-600">اسم الشركة</th>
            <th class="p-1 border border-gray-600 w-20">الرخصة</th>
            <th class="p-1 border border-gray-600 w-12 text-center">مشاريع</th>
            <th class="p-1 border border-gray-600 w-24 font-bold">قيمة العقد</th>
            <th class="p-1 border border-gray-600 w-24 font-bold">المستحق</th>
            <th class="p-1 border border-gray-600 w-24 font-bold">المدفوع</th>
            <th class="p-1 border border-gray-600 w-24 font-bold">المتبقي</th>
          </tr>
        </thead>
        <tbody class="text-[11px]">
          <tr
            v-for="(item, index) in items"
            :key="item.id"
            class="border-b border-gray-300 break-inside-avoid"
          >
            <td class="p-1 border border-gray-300 text-center font-bold">{{ index + 1 }}</td>
            <td class="p-1 border border-gray-300 font-bold truncate max-w-[150px]">
              {{ item.name }}
            </td>
            <td class="p-1 border border-gray-300 text-[10px]">{{ item.license_number }}</td>
            <td class="p-1 border border-gray-300 text-center font-bold">
              {{ item.projects_count }}
            </td>
            <td class="p-1 border border-gray-300 text-gray-600 whitespace-nowrap">
              {{ formatNumber(item.total_contract_value) }}
            </td>
            <td class="p-1 border border-gray-300 whitespace-nowrap">
              {{ formatNumber(item.total_due_value) }}
            </td>
            <td class="p-1 border border-gray-300 text-emerald-800 font-bold whitespace-nowrap">
              {{ formatNumber(item.total_paid) }}
            </td>
            <td class="p-1 border border-gray-300 font-black text-rose-800 whitespace-nowrap">
              {{ formatNumber(item.total_remaining) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

    <div
      class="print-footer fixed bottom-0 left-0 w-full text-center text-[10px] text-gray-500 border-t border-gray-200 pt-1 bg-white hidden print:block"
    >
      صفحة <span class="page-number"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const grandSummary = ref(null)
const items = ref([])
// استخدام صيغة قصيرة للتاريخ لتوفير مساحة
const currentDate = new Date().toLocaleDateString('ar-EG')
const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  const savedData = sessionStorage.getItem('printData')
  if (savedData) {
    const parsed = JSON.parse(savedData)
    grandSummary.value = parsed.grandSummary
    items.value = parsed.companiesSummary

    setTimeout(() => {
      window.print()
    }, 1000)
  }
})

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0'
  // يقوم بتنسيق الرقم مع فواصل الآلاف ومنزلتين عشريتين
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
@media print {
  @page {
    /* تغيير إلى طولي */
    size: A4 portrait;
    /* هوامش صغيرة لاستغلال المساحة */
    margin: 10mm;
  }

  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    /* إزالة الهوامش الافتراضية للجسم */
    margin: 0;
  }

  /* إظهار التذييل المخصص للترقيم */
  .print-footer {
    display: block !important;
  }

  /* عداد الصفحات */
  .page-number::after {
    content: counter(page);
  }
}

.print-portrait-container {
  width: 100%;
  /* لا داعي للـ max-width بالسنتيمتر، نجعله 100% ليملأ الصفحة المطبوعة */
  max-width: 100%;
  margin: 0 auto;
  /* إزالة min-height لمنع ظهور صفحات فارغة */
}

/* منع انقسام الصفوف في الجدول */
tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* منع انقسام قسم التوقيعات */
.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
