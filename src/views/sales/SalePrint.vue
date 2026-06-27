<!--src\views\sales\SalePrint.vue--->
<template>
  <div
    class="print-container min-h-screen bg-slate-50 text-slate-800 p-2 r2l relative flex flex-col justify-between"
    dir="rtl"
  >
    <!-- خلفية زخرفية خفيفة (تظهر فقط على الشاشة) -->
    <div
      class="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl no-print"
    ></div>

    <!-- حالة التحميل -->
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
        جاري تحضير مستند الطباعة...
      </p>
    </div>

    <!-- حالة الخطأ -->
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

    <!-- الفاتورة -->
    <div
      v-else
      class="invoice-box max-w-[21cm] mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative flex flex-col justify-between flex-1 w-full"
    >
      <!-- ============================================================ -->
      <!--                     نسخة العميل (النصف العلوي)                 -->
      <!-- ============================================================ -->
      <div class="customer-copy flex-1 flex flex-col" style="height: 50%; min-height: 50%">
        <!-- الشريط العلوي الملون -->
        <div class="w-full flex h-2 overflow-hidden">
          <div class="w-8/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
          <div class="w-1/12 bg-amber-400"></div>
          <div class="w-3/12 bg-slate-700"></div>
        </div>

        <!-- رأس الفاتورة -->
        <div class="px-3 py-2 flex justify-between items-center gap-3 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 p-1"
            >
              <img
                src="/MainLogo2.png"
                alt="شعار الشركة"
                class="w-full h-full object-contain rounded"
                onerror="this.style.display='none'"
              />
            </div>
            <div class="text-right">
              <h2 class="text-sm font-black text-slate-900">فيوتشر للدعاية للدعاية والاعلان</h2>
              <p class="text-[8px] text-orange-600 font-bold">انظم الينا واكتشف</p>
            </div>
          </div>

          <div class="text-right space-y-0.5">
            <div
              class="bg-gradient-to-l from-slate-50 to-orange-50/50 px-2 py-0.5 rounded border-r-2 border-orange-500"
            >
              <span class="text-[10px] font-black text-orange-600">{{
                currentSale.invoice_type_lbl
              }}</span>
            </div>
            <div class="flex items-center gap-3 text-[9px]">
              <span class="font-bold text-slate-500">رقم:</span>
              <span class="font-mono font-black bg-slate-100 px-1.5 py-0.5 rounded">{{
                currentSale.invoice_number
              }}</span>
              <span class="font-bold text-slate-500">التاريخ:</span>
              <span class="font-mono font-bold">{{
                formatDateOnly(currentSale.invoice_date)
              }}</span>
            </div>
            <div class="flex items-center gap-3 text-[9px]">
              <span class="font-bold text-slate-500">نوع البيع:</span>
              <span
                class="font-mono font-bold px-2 py-0.5 rounded-full border text-[8px]"
                :class="
                  currentSale.sale_type === 'indoor'
                    ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                    : 'text-amber-700 border-amber-300 bg-amber-50'
                "
              >
                {{ currentSale.sale_type === 'indoor' ? 'indoor' : 'outdoor' }}
              </span>
              <span class="font-bold text-slate-500">طريقة الدفع:</span>
              <span class="font-bold text-slate-800">{{ currentSale.payment_type_lbl }}</span>
            </div>
          </div>
        </div>

        <!-- معلومات العميل -->
        <div class="px-3 py-1.5">
          <div
            class="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 rounded-lg p-2 border border-slate-200"
          >
            <div class="text-right">
              <span class="text-[8px] font-bold text-orange-600">العميل:</span>
              <p class="font-black text-slate-900 text-xs">
                {{ currentSale.customer_name || '-' }}
              </p>
              <p v-if="currentSale.customer_name_text" class="text-orange-600 font-bold text-[9px]">
                {{ currentSale.customer_name_text }}
              </p>
              <p class="text-slate-500 text-[8px]">الموظف: {{ currentSale.user_name || '-' }}</p>
            </div>
            <div class="text-left">
              <span class="text-[8px] font-bold text-slate-400">ملاحظات:</span>
              <p class="text-[9px] text-slate-600 truncate" v-if="currentSale.notes">
                {{ currentSale.notes }}
              </p>
              <p class="text-[9px] text-slate-400 italic" v-else>لا توجد ملاحظات</p>
            </div>
          </div>
        </div>

        <!-- جدول الأصناف -->
        <div class="px-3 flex-1">
          <div class="border border-slate-300 rounded-lg overflow-hidden">
            <table class="w-full text-right border-collapse text-[8px]">
              <thead>
                <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                  <th class="p-1 text-center w-8">#</th>
                  <th class="p-1 text-right">الصنف</th>
                  <th class="p-1 text-center">الوحدة</th>
                  <th class="p-1 text-center">الطول</th>
                  <th class="p-1 text-center">العرض</th>
                  <th class="p-1 text-center">متر مربع</th>
                  <th class="p-1 text-center">العدد</th>
                  <th class="p-1 text-left">سعر الوحدة</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in currentSale.items"
                  :key="item.id"
                  class="border-b border-slate-200"
                >
                  <td class="p-1 text-center font-mono text-slate-500">{{ index + 1 }}</td>
                  <td class="p-1 font-bold text-slate-900">{{ item.item_name }}</td>
                  <td class="p-1 text-center">{{ item.unit_name || '-' }}</td>
                  <td class="p-1 text-center font-mono">{{ item.length ?? '-' }}</td>
                  <td class="p-1 text-center font-mono">{{ item.width ?? '-' }}</td>
                  <td class="p-1 text-center font-mono">
                    {{
                      item.length && item.width
                        ? (item.length * item.width * item.quantity).toFixed(4)
                        : '-'
                    }}
                  </td>
                  <td class="p-1 text-center font-bold">{{ item.quantity }}</td>
                  <td class="p-1 text-left font-mono">{{ formatCurrency(item.unit_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- الإجماليات -->
        <div class="px-3 py-1">
          <div
            class="flex justify-end items-center gap-4 bg-slate-50 rounded-lg p-1.5 border border-slate-200 text-[9px]"
          >
            <div class="flex items-center gap-1">
              <span class="text-slate-600">الفرعي:</span>
              <span class="font-mono font-bold">{{
                formatCurrency(currentSale.subtotal || 0)
              }}</span>
            </div>
            <div class="flex items-center gap-1 text-rose-600">
              <span>الخصم:</span>
              <span class="font-mono font-bold"
                >-{{ formatCurrency(currentSale.discount_amount || 0) }}</span
              >
            </div>
            <div class="flex items-center gap-1">
              <span>الضريبة:</span>
              <span class="font-mono font-bold">{{
                formatCurrency(currentSale.tax_amount || 0)
              }}</span>
            </div>
            <div
              class="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded border border-orange-300"
            >
              <span class="font-black text-slate-900 text-[9px]">الصافي:</span>
              <span class="font-mono font-black text-orange-600 text-[11px]">{{
                formatCurrency(currentSale.grand_total || 0)
              }}</span>
            </div>
          </div>
        </div>

        <!-- التوقيعات -->
        <div class="px-3 py-1 grid grid-cols-3 gap-2 text-center text-[8px] text-slate-500">
          <div>
            <p class="font-bold text-slate-700">توقيع المصمم</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-1"></div>
          </div>
          <div>
            <p class="font-bold text-slate-700">توقيع المحاسب</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-1"></div>
          </div>
          <div>
            <p class="font-bold text-slate-700">توقيع الطابع</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-1"></div>
          </div>
        </div>

        <!-- تسمية نسخة العميل -->
        <div class="text-center text-[7px] text-orange-600 font-bold pb-0.5">نسخة العميل</div>
      </div>
      <!-- ========== نهاية نسخة العميل ========== -->

      <!-- ========== شريط الفصل بين النسختين ========== -->
      <div class="print-splitter flex items-center gap-2 text-slate-400 px-3 py-1 no-print">
        <hr class="flex-1 border-t-2 border-dashed border-slate-400" />
        <span class="text-[8px] font-bold uppercase tracking-wider bg-white px-2">✂️ خط القطع</span>
        <hr class="flex-1 border-t-2 border-dashed border-slate-400" />
      </div>

      <!-- ============================================================ -->
      <!--                     نسخة الفني (النصف السفلي) - مطابقة تماماً -->
      <!-- ============================================================ -->
      <div
        class="technician-copy border-t-2 border-dashed border-slate-400 pt-2"
        style="height: 50%; min-height: 50%"
      >
        <!-- الشريط العلوي الملون (نفسه) -->
        <div class="w-full flex h-2 overflow-hidden">
          <div class="w-8/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
          <div class="w-1/12 bg-amber-400"></div>
          <div class="w-3/12 bg-slate-700"></div>
        </div>

        <!-- رأس الفاتورة (نفسه) -->
        <div class="px-3 py-2 flex justify-between items-center gap-3 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 p-1"
            >
              <img
                src="/MainLogo2.png"
                alt="شعار الشركة"
                class="w-full h-full object-contain rounded"
                onerror="this.style.display='none'"
              />
            </div>
            <div class="text-right">
              <h2 class="text-sm font-black text-slate-900">فيوتشر للدعاية والاعلان</h2>
              <p class="text-[8px] text-orange-600 font-bold">انضم الينا واكتشف</p>
            </div>
          </div>

          <div class="text-right space-y-0.5">
            <div
              class="bg-gradient-to-l from-slate-50 to-orange-50/50 px-2 py-0.5 rounded border-r-2 border-orange-500"
            >
              <span class="text-[10px] font-black text-orange-600">{{
                currentSale.invoice_type_lbl
              }}</span>
            </div>
            <div class="flex items-center gap-3 text-[9px]">
              <span class="font-bold text-slate-500">رقم:</span>
              <span class="font-mono font-black bg-slate-100 px-1.5 py-0.5 rounded">{{
                currentSale.invoice_number
              }}</span>
              <span class="font-bold text-slate-500">التاريخ:</span>
              <span class="font-mono font-bold">{{
                formatDateOnly(currentSale.invoice_date)
              }}</span>
            </div>
            <div class="flex items-center gap-3 text-[9px]">
              <span class="font-bold text-slate-500">نوع البيع:</span>
              <span
                class="font-mono font-bold px-2 py-0.5 rounded-full border text-[8px]"
                :class="
                  currentSale.sale_type === 'indoor'
                    ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                    : 'text-amber-700 border-amber-300 bg-amber-50'
                "
              >
                {{ currentSale.sale_type === 'indoor' ? 'داخلي' : 'خارجي' }}
              </span>
              <span class="font-bold text-slate-500">طريقة الدفع:</span>
              <span class="font-bold text-slate-800">{{ currentSale.payment_type_lbl }}</span>
            </div>
          </div>
        </div>

        <!-- معلومات العميل (نفسها) -->
        <div class="px-3 py-1.5">
          <div
            class="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 rounded-lg p-2 border border-slate-200"
          >
            <div class="text-right">
              <span class="text-[8px] font-bold text-orange-600">العميل:</span>
              <p class="font-black text-slate-900 text-xs">
                {{ currentSale.customer_name || '-' }}
              </p>
              <p v-if="currentSale.customer_name_text" class="text-orange-600 font-bold text-[9px]">
                {{ currentSale.customer_name_text }}
              </p>
              <p class="text-slate-500 text-[8px]">الموظف: {{ currentSale.user_name || '-' }}</p>
            </div>
            <div class="text-left">
              <span class="text-[8px] font-bold text-slate-400">ملاحظات:</span>
              <p class="text-[9px] text-slate-600 truncate" v-if="currentSale.notes">
                {{ currentSale.notes }}
              </p>
              <p class="text-[9px] text-slate-400 italic" v-else>لا توجد ملاحظات</p>
            </div>
          </div>
        </div>

        <!-- جدول الأصناف (نفسه) -->
        <table class="w-full text-right border-collapse text-[8px]">
          <thead>
            <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
              <th class="p-1 text-center w-8">#</th>
              <th class="p-1 text-right">الصنف</th>
              <th class="p-1 text-center">الوحدة</th>
              <th class="p-1 text-center">الطول</th>
              <th class="p-1 text-center">العرض</th>
              <th class="p-1 text-center">متر مربع</th>
              <th class="p-1 text-center">العدد</th>
              <th class="p-1 text-left">سعر الوحدة</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in currentSale.items"
              :key="item.id"
              class="border-b border-slate-200"
            >
              <td class="p-1 text-center font-mono text-slate-500">{{ index + 1 }}</td>
              <td class="p-1 font-bold text-slate-900">{{ item.item_name }}</td>
              <td class="p-1 text-center">{{ item.unit_name || '-' }}</td>
              <td class="p-1 text-center font-mono">{{ item.length ?? '-' }}</td>
              <td class="p-1 text-center font-mono">{{ item.width ?? '-' }}</td>
              <td class="p-1 text-center font-mono">
                {{
                  item.length && item.width
                    ? (item.length * item.width * item.quantity).toFixed(4)
                    : '-'
                }}
              </td>
              <td class="p-1 text-center font-bold">{{ item.quantity }}</td>
              <td class="p-1 text-left font-mono">{{ formatCurrency(item.unit_price) }}</td>
            </tr>
          </tbody>
        </table>
        <!-- الإجماليات (نفسها) -->
        <div class="px-3 py-1">
          <div
            class="flex justify-end items-center gap-4 bg-slate-50 rounded-lg p-1.5 border border-slate-200 text-[9px]"
          >
            <div class="flex items-center gap-1">
              <span class="text-slate-600">الفرعي:</span>
              <span class="font-mono font-bold">{{
                formatCurrency(currentSale.subtotal || 0)
              }}</span>
            </div>
            <div class="flex items-center gap-1 text-rose-600">
              <span>الخصم:</span>
              <span class="font-mono font-bold"
                >-{{ formatCurrency(currentSale.discount_amount || 0) }}</span
              >
            </div>
            <div class="flex items-center gap-1">
              <span>الضريبة:</span>
              <span class="font-mono font-bold">{{
                formatCurrency(currentSale.tax_amount || 0)
              }}</span>
            </div>
            <div
              class="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded border border-orange-300"
            >
              <span class="font-black text-slate-900 text-[9px]">الصافي:</span>
              <span class="font-mono font-black text-orange-600 text-[11px]">{{
                formatCurrency(currentSale.grand_total || 0)
              }}</span>
            </div>
          </div>
        </div>

        <!-- التوقيعات (نفسها) -->
        <div class="px-3 py-1 grid grid-cols-3 gap-2 text-center text-[8px] text-slate-500">
          <div>
            <p class="font-bold text-slate-700">توقيع المصمم</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-1"></div>
          </div>
          <div>
            <p class="font-bold text-slate-700">توقيع المحاسب</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-1"></div>
          </div>
          <div>
            <p class="font-bold text-slate-700">توقيع الطابع</p>
            <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-1"></div>
          </div>
        </div>

        <!-- تسمية نسخة الفني -->
        <div class="text-center text-[7px] text-amber-600 font-bold pb-0.5">
          نسخة الفني - للاستخدام الداخلي
        </div>
      </div>
      <!-- ========== نهاية نسخة الفني ========== -->
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
    max-width: 100% !important;
    width: 100% !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    height: 100vh !important;
    min-height: 100vh !important;
  }

  /* إظهار شريط القطع عند الطباعة */
  .print-splitter {
    display: flex !important;
    border-top: 2px dashed #94a3b8 !important;
    padding-top: 4px !important;
    margin-top: 2px !important;
  }

  /* جعل كل جزء يأخذ 50% من الصفحة */
  .customer-copy,
  .technician-copy {
    height: 50% !important;
    min-height: 50% !important;
    max-height: 50% !important;
    overflow: hidden !important;
  }

  /* ضمان عدم انقطاع الجداول بين الصفحات */
  table {
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  thead {
    display: table-header-group;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

.invoice-box {
  font-family: inherit;
}

/* تقليل الهوامش العامة */
.invoice-box > * {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
