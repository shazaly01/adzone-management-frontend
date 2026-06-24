<template>
  <div
    class="print-container min-h-screen bg-slate-50 text-slate-800 p-6 relative flex flex-col justify-between"
    dir="rtl"
  >
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 no-print">
      <div class="relative w-16 h-16">
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"
        ></div>
      </div>
      <p class="text-sm text-slate-600 mt-6 font-bold tracking-wide animate-pulse">
        جاري تحضير مستند كشف الحساب للطباعة الصافية...
      </p>
    </div>

    <div
      v-else-if="error || !printData"
      class="p-8 text-center max-w-md mx-auto my-20 bg-white border border-slate-200 shadow-sm no-print"
    >
      <div
        class="w-12 h-12 bg-rose-50 border border-rose-200 rounded-none flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-rose-500 text-xl">⚠️</span>
      </div>
      <p class="font-bold text-base text-slate-700 mb-4">
        {{ error || 'لم يتم العثور على بيانات كشف الحساب المطلوبة للطباعة.' }}
      </p>
      <button
        @click="closeWindow"
        class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all duration-200"
      >
        إغلاق النافذة
      </button>
    </div>

    <div
      v-else
      class="invoice-box max-w-[21cm] mx-auto bg-white border border-slate-300 overflow-hidden relative flex flex-col justify-between flex-1 w-full"
    >
      <div class="flex-1 flex flex-col">
        <div class="w-full flex h-3.5 overflow-hidden no-print">
          <div class="w-8/12 bg-indigo-600"></div>
          <div class="w-1/12 bg-amber-400"></div>
          <div class="w-3/12 bg-slate-700"></div>
        </div>

        <div class="p-8 flex justify-between items-center gap-6 border-b border-slate-200 relative">
          <div class="flex items-center gap-5">
            <div
              class="w-24 h-24 bg-white flex items-center justify-center border border-slate-200 p-1 relative logo-container"
            >
              <img
                src="/MainLogo2.png"
                alt="شعار الشركة"
                class="w-full h-full object-contain error-fallback z-10"
                onerror="this.style.display='none'; this.nextSibling.style.display='flex';"
              />
              <div
                class="hidden absolute text-[10px] font-black text-slate-400 items-center justify-center"
              >
                LOGO
              </div>
            </div>

            <div class="text-right space-y-1">
              <h2 class="text-2xl font-black text-slate-900 tracking-tight">
                فيوتشر للدعاية والاعلان
              </h2>
              <p class="text-xs text-indigo-600 font-bold tracking-wider uppercase">
                الوكالة الإبداعية للدعاية والإعلان والحلول الرقمية
              </p>
            </div>
          </div>

          <div class="text-right space-y-2 min-w-[280px]">
            <div class="bg-slate-50 text-right px-4 py-2 border-r-4 border-indigo-600">
              <h1 class="text-sm font-black tracking-wide text-slate-900">
                كشف حساب الكيانات المساعدة
              </h1>
            </div>
            <div class="px-2 space-y-1 text-xs text-slate-600 font-medium">
              <p class="flex justify-between items-center">
                <span>تاريخ الطباعة:</span>
                <span class="font-mono font-bold text-slate-900">{{ currentTimestamp }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="px-8 py-6">
          <div class="grid grid-cols-1 text-xs bg-slate-50 p-4 border border-slate-200 relative">
            <div class="absolute top-0 bottom-0 right-0 w-1 bg-indigo-600"></div>
            <div class="space-y-1 text-right">
              <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block"
                >الحساب المساعد الجاري تدقيقه</span
              >
              <p class="font-black text-slate-900 text-base">
                {{ printData.grandSummary.title_override || 'حساب مساعد مورفي فرعي' }}
              </p>
            </div>
          </div>
        </div>

        <div class="px-8 pb-6 grid grid-cols-4 gap-4 text-right">
          <div class="p-3 border border-slate-200 bg-slate-50/50">
            <div class="text-[10px] text-slate-500 font-bold mb-1">الرصيد الافتتاحي السابق</div>
            <div class="text-sm font-black font-mono text-slate-900">
              {{ formatCurrency(printData.grandSummary.grand_total_contract_value) }}
            </div>
          </div>
          <div class="p-3 border border-slate-200 bg-slate-50/50">
            <div class="text-[10px] text-emerald-600 font-bold mb-1">
              إجمالي الحركات المدينة (+)
            </div>
            <div class="text-sm font-black font-mono text-emerald-600">
              {{ formatCurrency(printData.grandSummary.grand_total_due_value) }}
            </div>
          </div>
          <div class="p-3 border border-slate-200 bg-slate-50/50">
            <div class="text-[10px] text-rose-600 font-bold mb-1">إجمالي الحركات الدائنة (-)</div>
            <div class="text-sm font-black font-mono text-rose-600">
              {{ formatCurrency(printData.grandSummary.grand_total_paid) }}
            </div>
          </div>
          <div class="p-3 border border-indigo-200 bg-indigo-50/20">
            <div class="text-[10px] text-indigo-600 font-bold mb-1">صافي رصيد الحساب الجاري</div>
            <div class="text-sm font-black font-mono text-indigo-600">
              {{ formatCurrency(printData.grandSummary.grand_total_remaining) }}
            </div>
          </div>
        </div>

        <div class="px-8 pb-4 flex-1">
          <div class="border border-slate-300 overflow-hidden bg-white">
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                  <th class="p-2.5 text-center w-12 text-slate-900 border-l border-slate-200">#</th>
                  <th class="p-2.5 text-center w-24 border-l border-slate-200">تاريخ الحركة</th>
                  <th class="p-2.5 border-l border-slate-200">الحساب المقابل</th>
                  <th class="p-2.5 border-l border-slate-200">
                    شرح الحركة والبيان الجاري التفصيلي
                  </th>
                  <th class="p-2.5 text-center w-28 border-l border-slate-200">مدين (+)</th>
                  <th class="p-2.5 text-center w-28 border-l border-slate-200">دائن (-)</th>
                  <th class="p-2.5 text-left w-32 text-slate-900">الرصيد التراكمي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr
                  v-for="(line, index) in printData.companiesSummary"
                  :key="line.id || index"
                  class="odd:bg-white even:bg-slate-50/40"
                >
                  <td
                    class="p-2.5 text-center font-mono font-bold text-slate-500 bg-slate-50 border-l border-slate-200"
                  >
                    {{ index + 1 }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-slate-700 border-l border-slate-200">
                    {{ line.license_number ?? '-' }}
                  </td>
                  <td class="p-2.5 font-bold text-slate-800 border-l border-slate-200">
                    {{ line.projects_count ?? '-' }}
                  </td>
                  <td class="p-2.5 text-slate-600 text-[11px] border-l border-slate-200">
                    {{ line.name }}
                  </td>
                  <td
                    class="p-2.5 text-center font-mono font-bold text-emerald-600 border-l border-slate-200 bg-slate-50/10"
                  >
                    {{
                      line.total_contract_value > 0
                        ? formatCurrency(line.total_contract_value)
                        : '-'
                    }}
                  </td>
                  <td
                    class="p-2.5 text-center font-mono font-bold text-rose-600 border-l border-slate-200"
                  >
                    {{ line.total_due_value > 0 ? formatCurrency(line.total_due_value) : '-' }}
                  </td>
                  <td class="p-2.5 text-left font-mono font-black text-slate-900 bg-slate-50/30">
                    {{ formatCurrency(line.total_remaining) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="px-8 pt-8 pb-4 grid grid-cols-2 gap-6 text-center text-xs text-slate-500">
          <div class="space-y-3">
            <p class="font-bold text-slate-700">المراجع المالي المدقق</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-36 pt-2"></div>
          </div>
          <div class="space-y-3">
            <p class="font-bold text-slate-700">اعتماد الإدارة الماليّة والحسابات</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-36 pt-2"></div>
          </div>
        </div>
      </div>

      <div class="relative w-full overflow-hidden mt-6 -mb-px">
        <div
          class="bg-slate-900 text-white px-8 pt-4 pb-5 text-xs font-medium w-full border-t border-slate-800"
        >
          <div class="grid grid-cols-3 gap-6 max-w-4xl mx-auto text-center items-center">
            <div
              class="flex flex-col items-center justify-center space-y-1 border-l border-white/10 px-2 h-full"
            >
              <span class="opacity-75 text-[10px] font-bold tracking-wider"
                >📍 الموقـع الرئيسي</span
              >
              <span class="font-bold tracking-wide">السودان - امدرمان</span>
            </div>

            <div
              class="flex flex-col items-center justify-center space-y-1 border-l border-white/10 px-2 h-full"
            >
              <span class="opacity-75 text-[10px] font-bold tracking-wider">📞 قنوات الاتصال</span>
              <span class="font-mono font-black text-sm tracking-widest">0500000000</span>
            </div>

            <div class="flex flex-col items-center justify-center space-y-1 px-2 h-full">
              <span class="opacity-85 text-[10px] font-bold tracking-wider"
                >📄 الرقم الضريبي للمنشأة</span
              >
              <div class="bg-white/5 px-3 py-0.5 border border-white/10 shadow-inner mt-0.5">
                <span class="font-mono font-black tracking-widest text-amber-100 text-xs"
                  >300000000000003</span
                >
              </div>
            </div>
          </div>

          <p class="text-center text-[10px] opacity-65 mt-4 font-medium tracking-wide">
            مستند كشف حساب مالي تفصيلي معتمد تم إنشاؤه إلكترونياً وصالح للمراجعة القانونية
            والتشغيلية
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const printData = ref(null)
const loading = ref(true)
const error = ref(null)
const currentTimestamp = ref('')

const closeWindow = () => {
  window.close()
}

const triggerBrowserPrint = () => {
  setTimeout(() => {
    window.print()
  }, 800)
}

onMounted(() => {
  // توليد الطابع الزمني والوقت الحالي للطباعة
  const now = new Date()
  currentTimestamp.value = now.toLocaleString('ar-EG', { hour12: true })

  try {
    // جلب وحل حزمة البيانات المخزنة من شاشة كشف الحساب
    const rawData = sessionStorage.getItem('printData')
    if (rawData) {
      printData.value = JSON.parse(rawData)
    } else {
      error.value = 'لم يتم العثور على أية تجميعات مالية صالحة لكشف الحساب الجاري.'
    }
  } catch (err) {
    console.error('Failed to parse print data for account ledger statement:', err)
    error.value = 'حدث خطأ بنيوي أثناء قراءة حزم البيانات الممررة للطباعة.'
  } finally {
    loading.value = false
    if (!error.value && printData.value) {
      triggerBrowserPrint()
    }
  }
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  body,
  .print-container {
    background-color: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
  }

  .invoice-box {
    max-w: 100% !important;
    width: 100% !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  tr {
    page-break-inside: avoid !important;
    page-break-after: auto !important;
  }

  thead {
    display: table-header-group !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

.invoice-box {
  font-family: inherit;
}

.logo-container {
  min-width: 6rem;
  min-height: 6rem;
}
</style>
