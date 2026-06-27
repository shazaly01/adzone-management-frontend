<!--src\views\technician\TechnicianSalesList.vue--->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6 text-right" dir="rtl">
      <div>
        <h1 class="text-2xl font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-2 h-4 bg-amber-500 rounded-full"></span>
          ورشة التنفيذ وفنيي الطباعة
        </h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض ومتابعة الفواتير النهائية الجاهزة للتنفيذ ومعايرة خامات التشغيل والمقاسات المطبعية
          فوراً مع تحديث تلقائي لحظي.
        </p>
      </div>
    </div>

    <!-- شريط الفلاتر والبحث السريع -->
    <div
      class="p-3 bg-surface-card rounded-lg border border-surface-border shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-right"
      dir="rtl"
    >
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">البحث السريع</label>
        <input
          type="text"
          v-model="searchQuery"
          @input="onSearch"
          placeholder="رقم الفاتورة، ملاحظات التشغيل..."
          class="block w-full px-3 py-1.5 border border-surface-border/70 rounded-md bg-surface-ground text-text-primary text-xs font-semibold focus:border-amber-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/20"
        />
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">مستودع الصرف والمواد</label>
        <select
          v-model="storeFilter"
          @change="handlePageChange(1)"
          style="color-scheme: dark"
          class="block w-full px-2 py-1.5 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-amber-500 text-xs font-bold outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-amber-500/20"
        >
          <option value="">كل المخازن المتاحة</option>
          <option v-for="store in storeStore.stores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-text-secondary">حساب العميل المعني</label>
        <select
          v-model="customerFilter"
          @change="handlePageChange(1)"
          style="color-scheme: dark"
          class="block w-full px-2 py-1.5 border border-surface-border/80 rounded-md bg-surface-ground text-text-primary focus:border-amber-500 text-xs font-bold outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-amber-500/20"
        >
          <option value="">كل العملاء</option>
          <option
            v-for="customer in customerStore.customers"
            :key="customer.id"
            :value="customer.id"
          >
            {{ customer.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- جدول البيانات المطور -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="sales"
        :is-loading="loading"
        :row-clickable="true"
        @row-click="goToTechnicianForm"
      >
        <!-- خلايا مخصصة: تلوين كود المعرف الرقمي تبعاً للون الحالة للحصول على مظهر متناسق ومشع -->
        <template #cell-id="{ item }">
          <span
            class="font-mono font-bold px-2 py-1 rounded border transition-all"
            :style="{
              color: item.production_status_color,
              backgroundColor: item.production_status_color + '0A',
              borderColor: item.production_status_color + '20',
            }"
          >
            #{{ item.id }}
          </span>
        </template>

        <!-- خلايا مخصصة: حقن شارة الحالة الملونة القادمة ديناميكياً من السيرفر مع التوهج الضوئي اللحظي -->
        <template #cell-invoice_info="{ item }">
          <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 text-[10px] font-black rounded border transition-all"
                :style="{
                  backgroundColor: item.production_status_color + '15',
                  color: item.production_status_color,
                  borderColor: item.production_status_color + '35',
                  boxShadow: '0 0 8px ' + item.production_status_color + '18',
                }"
              >
                {{ item.production_status_lbl }}
              </span>
              <span class="text-xs text-text-muted font-mono">{{
                item.invoice_date.substr(0, 10)
              }}</span>
            </div>
            <span v-if="item.notes" class="text-xs text-text-muted max-w-[300px] truncate">
              {{ item.notes }}
            </span>
          </div>
        </template>

        <template #cell-entities="{ item }">
          <div class="flex flex-col justify-center text-right" dir="rtl">
            <span class="font-bold text-xs text-text-primary">
              العميل: {{ item.customer_name || item.customer?.name || '-' }}
            </span>
            <span v-if="item.customer_name_text" class="font-bold text-xs text-[#e05e2b] mt-0.5">
              {{ item.customer_name_text }}
            </span>
          </div>
        </template>

        <template #cell-sale_type="{ item }">
          <div class="flex justify-center items-center" dir="rtl">
            <span
              :class="[
                'px-3 py-1 text-xs font-black rounded-full border transition-all',
                item.sale_type === 'indoor'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-950/40 text-amber-400 border-amber-500/30',
              ]"
            >
              {{ item.sale_type === 'indoor' ? 'indoor' : 'outdoor' }}
            </span>
          </div>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end" @click.stop>
            <button
              @click="goToTechnicianForm(item)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold hover:brightness-110 border rounded-lg transition-all"
              :style="{
                color: item.production_status_color,
                backgroundColor: item.production_status_color + '0D',
                borderColor: item.production_status_color + '30',
              }"
              title="معايرة وتحديث خامات التشغيل وتغيير الحالة"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              ملاءمة خامات الورشة
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTechnicianSaleStore } from '@/stores/technicianSaleStore'
import { useStoreStore } from '@/stores/storeStore'
import { useCustomerStore } from '@/stores/customerStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const router = useRouter()
const toast = useToast()

const technicianSaleStore = useTechnicianSaleStore()
const storeStore = useStoreStore()
const customerStore = useCustomerStore()

const { sales, loading, pagination } = storeToRefs(technicianSaleStore)

const searchQuery = ref('')
const storeFilter = ref('')
const customerFilter = ref('')
let searchTimeout = null
let autoRefreshInterval = null // [إضافة برمجية]: متغير لحفظ مؤشر التحديث التلقائي الدوري

// العناوين المعزولة والمجرّدة تماماً من الحسابات المالية الحساسة لصالح الفني
const tableHeaders = computed(() => [
  { key: 'id', label: 'المعرف الرقمي' },
  { key: 'invoice_info', label: 'حالة وتاريخ السند' },
  { key: 'entities', label: 'الجهات المعنية' },
  { key: 'sale_type', label: 'نوع البيع', class: 'text-center' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[120px]' },
])

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    store_id: storeFilter.value,
    customer_id: customerFilter.value,
  }

  technicianSaleStore.fetchSales(page, filters).catch(() => {
    toast.error('فشل النظام في جلب فواتير ورشة التنفيذ المحدثة من الخادم.')
  })
}

// [إضافة برمجية]: دالة التحديث الدوري الصامتة مع إطلاق إشعار ذكي فور رصد فاتورة جديدة تماماً في الورشة
const runSilentAutoRefresh = async () => {
  const filters = {
    search: searchQuery.value,
    store_id: storeFilter.value,
    customer_id: customerFilter.value,
  }

  try {
    // 1. التقاط معرف الفاتورة الأعلى الحالية قبل التحديث للمقارنة الرقمية العادلة
    const previousTopInvoiceId = sales.value && sales.value.length > 0 ? sales.value[0].id : null

    // 2. طلب جلب البيانات صامتاً من مخزن البيانات
    await technicianSaleStore.fetchSales(pagination.value.current_page || 1, filters)

    // 3. التقاط معرف الفاتورة الأعلى الحالية بعد التحديث
    const currentTopInvoiceId = sales.value && sales.value.length > 0 ? sales.value[0].id : null

    // 4. إذا كانت هناك فاتورة جديدة دخلت ورشة التنفيذ برقم معرف أكبر، أطلق تنبيهاً فورياً للعامل
    if (previousTopInvoiceId && currentTopInvoiceId && currentTopInvoiceId > previousTopInvoiceId) {
      toast.info('🔔 تنبيه: تم استقبال فاتورة إنتاج جديدة قيد الانتظار بالورشة!', {
        timeout: 6000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  } catch (err) {
    console.error('Auto-refresh background process failed:', err)
  }
}

onMounted(async () => {
  // شحن البيانات لأول مرة عند تشغيل الشاشة
  handlePageChange(1)

  // شحن قوائم التصفية المساعدة
  await Promise.all([
    storeStore.fetchStores(1, { is_active: 1 }),
    customerStore.fetchCustomers(1, { is_active: 1 }),
  ])

  // [إضافة برمجية]: تشغيل آلية الـ Polling الدوري لتحديث الشاشة تلقائياً كل 15 ثانية (15000 ملي ثانية)
  autoRefreshInterval = setInterval(runSilentAutoRefresh, 15000)
})

onUnmounted(() => {
  // [إضافة برمجية]: تدمير وتنظيف المؤقت الدوري نهائياً عند مغادرة الصفحة حماية لأداء المتصفح وسرعته
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})

const goToTechnicianForm = (sale) => {
  router.push({ name: 'TechnicianSaleEdit', params: { id: sale.id } })
}
</script>

<style scoped>
select option {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
