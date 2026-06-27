<!--src\views\sales\SalePrint.vue--->
<template>
  <div
    class="print-container min-h-screen bg-slate-50 text-slate-800 p-6 r2l relative flex flex-col justify-between"
    dir="rtl"
  >
    <div
      class="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl no-print"
    ></div>

    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 no-print">
      <div class="relative w-16 h-16">
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"
        ></div>
        <div
          class="absolute top-1 left-1 animate-ping rounded-full h-14 w-14 border border-orange-200"
        ></div>
      </div>
      <p class="text-sm text-slate-600 mt-6 font-bold tracking-wide animate-pulse">
        جاري تحضير مستند الطباعة الإبداعي...
      </p>
    </div>

    <div
      v-else-if="error || !currentSale"
      class="p-8 text-center max-w-md mx-auto my-20 bg-white rounded-2xl shadow-lg border border-slate-200 no-print"
    >
      <div
        class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-orange-500 text-xl">⚠️</span>
      </div>
      <p class="font-bold text-base text-slate-700 mb-4">
        {{ error || 'لم يتم العثور على بيانات الفاتورة المطلوبة.' }}
      </p>
      <button
        @click="window.close()"
        class="px-5 py-2 bg-slate-800 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all duration-200"
      >
        إغلاق النافذة
      </button>
    </div>

    <div
      v-else
      class="invoice-box max-w-[21cm] mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative flex flex-col justify-between flex-1 w-full"
    >
      <div class="flex-1 flex flex-col">
        <div class="w-full flex h-3.5 overflow-hidden">
          <div class="w-8/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
          <div class="w-1/12 bg-amber-400"></div>
          <div class="w-3/12 bg-slate-700"></div>
        </div>

        <div class="p-8 flex justify-between items-center gap-6 border-b border-slate-200 relative">
          <div class="flex items-center gap-5">
            <div
              class="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner p-2 relative logo-container"
            >
              <div
                class="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner p-1 relative logo-container"
              >
                <img
                  src="/MainLogo2.png"
                  alt="شعار الشركة"
                  class="w-full h-full object-contain rounded-lg error-fallback z-10"
                  onerror="this.style.display='none'; this.nextSibling.style.display='flex';"
                />
                <div
                  class="hidden absolute text-[10px] font-black text-slate-400 items-center justify-center"
                >
                  LOGO
                </div>
              </div>
            </div>

            <div class="text-right space-y-1">
              <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                فيوتشر للدعاية والاعلان
              </h2>
              <p class="text-xs text-orange-600 font-bold tracking-widest uppercase">
                لوكالة الإبداعية للدعاية والإعلان والحلول الرقمية
              </p>
            </div>
          </div>

          <div class="text-right space-y-2 min-w-[240px]">
            <div
              class="bg-gradient-to-l from-slate-50 to-orange-50/50 text-right px-4 py-2 rounded-xl border-r-4 border-orange-500 shadow-sm"
            >
              <h1 class="text-base font-black tracking-wide text-orange-600">
                {{ currentSale.invoice_type_lbl }}
              </h1>
            </div>
            <div class="px-2 space-y-1 text-xs text-slate-600 font-medium">
              <p class="flex justify-between items-center" dir="rtl">
                <span>رقم الفاتورة:</span>
                <span
                  class="font-mono text-slate-900 font-black bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                  >{{ currentSale.invoice_number }}</span
                >
              </p>
              <p class="flex justify-between items-center" dir="rtl">
                <span>نوع البيع:</span>
                <span
                  class="font-mono font-bold px-2 py-0.5 rounded-full border text-xs"
                  :class="
                    currentSale.sale_type === 'indoor'
                      ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                      : 'text-amber-700 border-amber-300 bg-amber-50'
                  "
                >
                  {{ currentSale.sale_type === 'indoor' ? 'داخلي' : 'خارجي' }}
                </span>
              </p>
              <p class="flex justify-between items-center" dir="rtl">
                <span>تاريخ الإصدار:</span>
                <span class="font-mono font-bold text-slate-800">{{
                  formatDateOnly(currentSale.invoice_date)
                }}</span>
              </p>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-2 gap-6 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200 relative"
        >
          <div class="absolute top-0 bottom-0 right-0 w-1 bg-orange-500 rounded-r"></div>

          <!-- العمود الأيمن: معلومات العميل -->
          <div class="space-y-2 text-right border-l border-slate-200 pl-4">
            <span class="text-[10px] font-bold text-orange-600 uppercase tracking-wider block"
              >العميل والمستلم المعتمد</span
            >
            <p class="font-black text-slate-900 text-base">
              {{ currentSale.customer_name || '-' }}
            </p>
            <!-- اسم العميل النصي (إن وجد) -->
            <p v-if="currentSale.customer_name_text" class="text-[11px] text-orange-600 font-bold">
              {{ currentSale.customer_name_text }}
            </p>
          </div>

          <!-- العمود الأيسر: التفاصيل المالية -->
          <div class="space-y-2 text-right pr-4 flex flex-col justify-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block"
              >تفاصيل التدقيق والاعتماد المالي</span
            >
            <div class="space-y-1">
              <p class="font-bold text-slate-800 flex items-center gap-2">
                <span>طريقة الدفع:</span>
                <span
                  class="px-2.5 py-0.5 bg-slate-800 text-white text-[10px] rounded-md font-black shadow-sm"
                  >{{ currentSale.payment_type_lbl }}</span
                >
              </p>
              <p class="text-[11px] text-slate-500">
                الموظف المسؤول:
                <span class="text-slate-800 font-bold">{{ currentSale.user_name || '-' }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="px-8 pb-4 flex-1">
          <div class="border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                  <th class="p-3 text-center w-12 text-slate-900 border-l border-slate-200">#</th>
                  <th class="p-3 font-bold text-xs text-slate-900 border-l border-slate-200">
                    بيان اسم الصنف أو الخدمة الإعلانية المشغلة
                  </th>
                  <th class="p-3 text-center w-20 border-l border-slate-200">الوحدة</th>
                  <th class="p-3 text-center w-16 border-l border-slate-200">الطول</th>
                  <th class="p-3 text-center w-16 border-l border-slate-200">العرض</th>
                  <th class="p-3 text-center w-16 border-l border-slate-200">الكمية</th>
                  <th class="p-3 text-left w-32 text-slate-900">سعر الوحدة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr
                  v-for="(item, index) in currentSale.items"
                  :key="item.id"
                  class="hover:bg-orange-50/10 transition-colors duration-150 odd:bg-white even:bg-slate-50/50"
                >
                  <td
                    class="p-3 text-center font-mono font-bold text-slate-500 bg-slate-50 border-l border-slate-200"
                  >
                    {{ index + 1 }}
                  </td>
                  <td class="p-3 font-bold text-slate-900 text-xs py-3.5 border-l border-slate-200">
                    {{ item.item_name }}
                  </td>
                  <td class="p-3 text-center text-slate-600 border-l border-slate-200">
                    {{ item.unit_name || '-' }}
                  </td>
                  <td
                    class="p-3 text-center font-mono font-medium text-slate-600 border-l border-slate-200"
                  >
                    {{ item.length !== null ? item.length : '-' }}
                  </td>
                  <td
                    class="p-3 text-center font-mono font-medium text-slate-600 border-l border-slate-200"
                  >
                    {{ item.width !== null ? item.width : '-' }}
                  </td>
                  <td
                    class="p-3 text-center font-mono font-bold text-slate-800 border-l border-slate-200 bg-slate-50/30"
                  >
                    {{ item.quantity }}
                  </td>
                  <td class="p-3 text-left font-mono font-bold text-slate-900 text-sm">
                    {{ formatCurrency(item.unit_price) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="px-8 py-4 grid grid-cols-12 gap-6 items-stretch">
          <div class="col-span-6">
            <div
              v-if="currentSale.notes"
              class="border border-slate-200 rounded-xl p-4 text-xs text-slate-600 bg-slate-50 relative h-full flex flex-col justify-center"
            >
              <div class="absolute top-0 bottom-0 right-0 w-1 bg-orange-400 rounded-r"></div>
              <span
                class="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5 text-orange-700"
              >
                <span>📌</span> شروط وملاحظات التشغيل الفني:
              </span>
              <p class="leading-relaxed font-medium text-slate-700">{{ currentSale.notes }}</p>
            </div>
          </div>

          <div class="col-span-6 flex justify-end">
            <div
              class="w-full max-w-sm bg-white border border-slate-300 rounded-xl p-4 space-y-2.5 shadow-sm text-xs"
            >
              <div class="flex justify-between items-center text-slate-600 font-medium">
                <span>الإجمالي الفرعي المالي:</span>
                <span class="font-mono font-bold text-slate-900">{{
                  formatCurrency(currentSale.subtotal || 0)
                }}</span>
              </div>

              <div
                class="flex justify-between items-center text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-200"
              >
                <span>إجمالي الخصم الممنوح:</span>
                <span class="font-mono font-black"
                  >- {{ formatCurrency(currentSale.discount_amount || 0) }}</span
                >
              </div>

              <div class="flex justify-between items-center text-slate-600 font-medium">
                <span>ضريبة القيمة المضافة:</span>
                <span class="font-mono font-bold text-slate-900">{{
                  formatCurrency(currentSale.tax_amount || 0)
                }}</span>
              </div>

              <div class="h-px bg-slate-300 my-1"></div>

              <div
                class="flex justify-between items-center pt-2 bg-gradient-to-r from-orange-50 to-amber-50/30 p-2 rounded-lg border border-orange-200"
              >
                <span class="text-xs font-black text-slate-900">الصافي النهائي المطلوب:</span>
                <span class="font-mono text-base font-black text-orange-600">
                  {{ formatCurrency(currentSale.grand_total || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-8 pt-8 pb-4 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
          <div class="space-y-3">
            <p class="font-bold text-slate-700">توقيع المستلم التنفيذي</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-32 pt-2"></div>
          </div>
          <div class="space-y-3">
            <p class="font-bold text-slate-700">أمين المستودع والمواد</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-32 pt-2"></div>
          </div>
          <div class="space-y-3">
            <p class="font-bold text-slate-700">اعتماد الكاشير والحسابات</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-32 pt-2"></div>
          </div>
        </div>
      </div>

      <div class="relative w-full overflow-hidden mt-6 -mb-px">
        <svg
          class="w-full h-10 text-orange-500 fill-current block translate-y-1.5 scale-x-105"
          viewBox="0 0 1440 74"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,32 C240,70 480,10 720,45 C960,80 1200,20 1440,45 L1440,74 L0,74 Z"></path>
        </svg>

        <div class="bg-orange-500 text-white px-8 pt-3 pb-5 text-xs font-medium w-full">
          <div
            class="grid grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-white/20 pt-4 text-center items-center"
          >
            <div
              class="flex flex-col items-center justify-center space-y-1 border-l border-white/20 px-2 h-full"
            >
              <span class="opacity-75 text-[10px] font-bold tracking-wider"
                >📍 الموقـع الرئيسي</span
              >
              <span class="font-bold tracking-wide">السودان - امدرمان</span>
            </div>

            <div
              class="flex flex-col items-center justify-center space-y-1 border-l border-white/20 px-2 h-full"
            >
              <span class="opacity-75 text-[10px] font-bold tracking-wider">📞 قنوات الاتصال</span>
              <span class="font-mono font-black text-sm tracking-widest">0500000000</span>
            </div>

            <div class="flex flex-col items-center justify-center space-y-1 px-2 h-full">
              <span class="opacity-85 text-[10px] font-bold tracking-wider"
                >📄 الرقم الضريبي للمنشأة</span
              >
              <div
                class="bg-white/15 px-3 py-0.5 rounded-lg border border-white/10 shadow-inner mt-0.5"
              >
                <span class="font-mono font-black tracking-widest text-amber-100 text-xs"
                  >300000000000003</span
                >
              </div>
            </div>
          </div>

          <p class="text-center text-[10px] opacity-75 mt-4 font-medium tracking-wide">
            شكرًا لثقتكم بوكالتنا الإعلانية - مستند مالي معتمد تم إنشاؤه إلكترونيًا
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const saleStore = useSaleStore()

const { currentSale, loading, error } = storeToRefs(saleStore)

const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  return dateString.split(' ')[0]
}

const triggerBrowserPrint = async () => {
  await nextTick()
  if (!loading.value && currentSale.value) {
    setTimeout(() => {
      window.print()
    }, 600)
  }
}

onMounted(async () => {
  const saleId = route.params.id
  if (saleId) {
    await saleStore.fetchSale(saleId)
    await triggerBrowserPrint()
  }
})

watch(currentSale, async (newVal) => {
  if (newVal) {
    await triggerBrowserPrint()
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
    height: 100vh !important;
  }

  .invoice-box {
    max-w: 100% !important;
    width: 100% !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    height: 100vh !important;
    min-height: 100vh !important;
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
  min-width: 7rem;
  min-height: 7rem;
}
</style>
