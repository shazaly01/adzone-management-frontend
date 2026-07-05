<!--src\views\technician\TechnicianSaleForm.vue--->
<template>
  <div class="space-y-6 text-right font-sans pb-24" dir="rtl">
    <div
      v-if="technicianSaleStore.error"
      class="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ technicianSaleStore.error }}
    </div>

    <div class="bg-[#111827] rounded-xl border border-slate-800 shadow-md overflow-hidden">
      <div class="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2">
        <span class="inline-block w-1 h-2 bg-slate-500 rounded-full"></span>
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          البيانات المرجعية للفاتورة
        </h3>
      </div>
      <div
        class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-semibold text-slate-400"
      >
        <div class="flex flex-col space-y-1">
          <span class="text-[10px] text-slate-500">رقم المستند الرقمي:</span>
          <span class="font-mono font-bold text-slate-200 text-sm"
            >#{{ technicianSaleStore.currentSale?.id || route.params.id }}</span
          >
        </div>
        <div class="flex flex-col space-y-1">
          <span class="text-[10px] text-slate-500">كود الفاتورة المنسق:</span>
          <span class="font-mono font-bold text-amber-500 text-sm shadow-amber-500/10">{{
            technicianSaleStore.currentSale?.invoice_number || '-'
          }}</span>
        </div>
        <div class="flex flex-col space-y-1">
          <span class="text-[10px] text-slate-500">حساب العميل المعني:</span>
          <span class="font-bold text-slate-200 text-sm">{{
            technicianSaleStore.currentSale?.customer_name || 'عميل معتمد'
          }}</span>
        </div>
        <div class="flex flex-col space-y-1">
          <span class="text-[10px] text-slate-500">اسم العميل (نص حر):</span>
          <span class="font-bold text-[#e05e2b] text-sm">{{ customerNameText || '—' }}</span>
        </div>
        <div class="flex flex-col space-y-1">
          <span class="text-[10px] text-slate-500">نوع البيع:</span>
          <span
            class="font-bold text-sm px-2 py-0.5 rounded-full border inline-block text-center"
            :class="
              saleType === 'indoor'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
                : 'text-amber-400 border-amber-500/30 bg-amber-950/30'
            "
          >
            {{ saleType === 'indoor' ? 'indoor' : 'outdoor' }}
          </span>
        </div>
        <div class="flex flex-col space-y-1">
          <span class="text-[10px] text-slate-500">مستودع السحب الفعلي:</span>
          <span class="font-bold text-slate-200 text-sm">{{
            technicianSaleStore.currentSale?.store_name || 'المخزن الرئيسي'
          }}</span>
        </div>
      </div>
    </div>

    <div class="p-4 bg-[#1e293b]/40 rounded-xl border border-slate-700/60 space-y-4 shadow-md">
      <div class="flex items-center gap-2 border-b border-slate-700/40 pb-2">
        <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="text-xs font-black text-slate-200">
          تحديد الحالة التشغيلية الحالية للفاتورة بالورشة:
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <label
          class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-[#0f172a] select-none"
          :class="
            productionStatus === 'pending'
              ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
              : 'border-slate-800 hover:border-slate-700'
          "
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
            <span class="text-xs font-bold text-slate-200">قيد الانتظار</span>
          </div>
          <input type="radio" v-model="productionStatus" value="pending" class="sr-only" />
          <span
            class="w-4 h-4 rounded-full border flex items-center justify-center"
            :class="
              productionStatus === 'pending'
                ? 'border-amber-500 text-amber-500'
                : 'border-slate-700'
            "
          >
            <span
              v-if="productionStatus === 'pending'"
              class="w-2 h-2 rounded-full bg-amber-500"
            ></span>
          </span>
        </label>

        <label
          class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-[#0f172a] select-none"
          :class="
            productionStatus === 'processing'
              ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
              : 'border-slate-800 hover:border-slate-700'
          "
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            <span class="text-xs font-bold text-slate-200">جاري التشغيل</span>
          </div>
          <input type="radio" v-model="productionStatus" value="processing" class="sr-only" />
          <span
            class="w-4 h-4 rounded-full border flex items-center justify-center"
            :class="
              productionStatus === 'processing'
                ? 'border-blue-500 text-blue-500'
                : 'border-slate-700'
            "
          >
            <span
              v-if="productionStatus === 'processing'"
              class="w-2 h-2 rounded-full bg-blue-500"
            ></span>
          </span>
        </label>

        <label
          class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-[#0f172a] select-none"
          :class="
            productionStatus === 'on_hold'
              ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/30'
              : 'border-slate-800 hover:border-slate-700'
          "
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]"></span>
            <span class="text-xs font-bold text-slate-200">معلق / متوقف</span>
          </div>
          <input type="radio" v-model="productionStatus" value="on_hold" class="sr-only" />
          <span
            class="w-4 h-4 rounded-full border flex items-center justify-center"
            :class="
              productionStatus === 'on_hold' ? 'border-rose-500 text-rose-500' : 'border-slate-700'
            "
          >
            <span
              v-if="productionStatus === 'on_hold'"
              class="w-2 h-2 rounded-full bg-rose-500"
            ></span>
          </span>
        </label>

        <label
          class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-[#0f172a] select-none"
          :class="
            productionStatus === 'completed'
              ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
              : 'border-slate-800 hover:border-slate-700'
          "
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <span class="text-xs font-bold text-slate-200">تم التنفيذ بالكامل</span>
          </div>
          <input type="radio" v-model="productionStatus" value="completed" class="sr-only" />
          <span
            class="w-4 h-4 rounded-full border flex items-center justify-center"
            :class="
              productionStatus === 'completed'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-slate-700'
            "
          >
            <span
              v-if="productionStatus === 'completed'"
              class="w-2 h-2 rounded-full bg-emerald-500"
            ></span>
          </span>
        </label>
      </div>
    </div>

    <div class="bg-[#0f172a] rounded-xl border border-slate-800/80 overflow-hidden shadow-md">
      <div class="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h3 class="text-xs font-black text-slate-300">
          أصناف الفاتورة وخامات ومقاسات التشغيل المطلوبة
        </h3>
      </div>
      <table class="w-full text-right border-collapse text-xs">
        <thead>
          <tr class="bg-[#111827] text-slate-400 border-b border-slate-800 font-black">
            <th class="p-3 w-1/12">رقم الصنف</th>
            <th class="p-3 w-3/12">اسم الصنف المعياري / خامة التشغيل المطبقة بالورشة</th>
            <th class="p-3 w-1/12 text-center">الطول</th>
            <th class="p-3 w-1/12 text-center">العرض</th>
            <th class="p-3 w-1/12 text-center">العدد</th>
            <th class="p-3 w-2/12 text-center">سعر الوحدة الافتراضي</th>
            <th class="p-3 w-2/12 text-left">إجمالي السطر الثابت</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
            v-for="(row, index) in items"
            :key="row.id"
            class="hover:bg-slate-900/40 transition-all"
          >
            <td class="p-3 font-mono text-slate-500">PRD-{{ row.original_item_id }}</td>

            <td class="p-2">
              <div v-if="row.is_dimensional" class="w-full">
                <select
                  v-model="row.item_id"
                  style="color-scheme: dark"
                  class="w-full p-1.5 bg-[#111827] text-slate-200 border border-amber-500/30 focus:border-amber-500 rounded-md font-bold outline-none cursor-pointer text-right transition-all focus:ring-1 focus:ring-amber-500/20"
                >
                  <!-- 🌟 [التحديث الجديد]: خيار احتياطي يضمن ظهور اسم الصنف الحالي المخزن بالفاتورة فوراً -->
                  <option
                    v-if="!dimensionalItemsOnly.some((item) => item.id === row.item_id)"
                    :value="row.item_id"
                  >
                    {{ row.item_name }} (الصنف الحالي بالفاتورة)
                  </option>

                  <option
                    v-for="dimensionalItem in dimensionalItemsOnly"
                    :key="dimensionalItem.id"
                    :value="dimensionalItem.id"
                  >
                    {{ dimensionalItem.name }} (رصيد حالي: {{ dimensionalItem.current_stock ?? 0 }})
                  </option>
                </select>
                <p
                  v-if="getValidationError(`items.${index}.item_id`)"
                  class="text-rose-500 text-[10px] font-bold mt-0.5"
                >
                  {{ getValidationError(`items.${index}.item_id`) }}
                </p>
              </div>

              <div class="p-1 font-bold text-slate-300 flex items-center gap-1.5" v-else>
                <span class="inline-block w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                {{ row.item_name }}
                <span
                  class="text-[10px] font-medium text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                >
                  (صنف ثابت/خدمة مقفلة مالياً)
                </span>
              </div>
            </td>

            <td class="p-3 text-center font-mono font-bold text-slate-400">
              {{
                row.length !== null && row.length !== undefined
                  ? parseFloat(row.length).toFixed(2)
                  : '-'
              }}
            </td>

            <td class="p-3 text-center font-mono font-bold text-slate-400">
              {{
                row.width !== null && row.width !== undefined
                  ? parseFloat(row.width).toFixed(2)
                  : '-'
              }}
            </td>

            <td class="p-3 text-center font-mono font-bold text-slate-200">
              {{ row.quantity }}
            </td>

            <td class="p-3 text-center font-mono text-slate-500">
              {{ parseFloat(row.unit_price).toFixed(2) }} د.ل
            </td>

            <td class="p-3 text-left font-mono font-black text-slate-200">
              {{ parseFloat(row.grand_total).toFixed(2) }} د.ل
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="fixed bottom-0 right-0 left-0 bg-[#111827] border-t border-slate-800 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-amber-500 font-bold flex items-center gap-1">
        <span class="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
        تنبيه ورشة العمل: حفظ التعديلات سيعيد توجيه وتوازن المخازن والتكلفة فوراً بحسب الحالة
        التشغيلية، ولن يغير الفاتورة النهائية للعميل.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          تراجع وإلغاء
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          class="!bg-amber-600 hover:!bg-amber-700 text-white"
          :disabled="technicianSaleStore.loading"
          @click="handleSubmit"
        >
          <span v-if="technicianSaleStore.loading">جاري معالجة المخازن الحركية...</span>
          <span v-else>اعتماد الخامات المحدثة بالورشة</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
useRouter
import { useRoute, useRouter } from 'vue-router'
import { useTechnicianSaleStore } from '@/stores/technicianSaleStore'
import { useItemStore } from '@/stores/itemStore'
import { useToast } from 'vue-toastification'
import AppButton from '@/components/ui/AppButton.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const technicianSaleStore = useTechnicianSaleStore()
const itemStore = useItemStore()

const items = ref([])
const productionStatus = ref('pending') // تتبع القيمة المختارة لحالة الورشة
const saleType = ref('indoor')
const customerNameText = ref(null)

// تصفية وعزل الأصناف التي تعتمد على الأبعاد فقط لتغذية خيارات التبديل الهندسي للفني
const dimensionalItemsOnly = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items.filter((item) => item.is_dimensional === true || item.is_dimensional === 1)
})

const getValidationError = (path) => {
  return technicianSaleStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  try {
    // 1. جلب الفاتورة المستهدفة أولاً لقراءة رقم المخزن المحفوظ بها بشكل صريح
    await technicianSaleStore.fetchSale(route.params.id)

    if (technicianSaleStore.currentSale) {
      // استخراج معرف المخزن المربوط بالفاتورة الحالية والحالة المحفوظة مسبقاً بالسيرفر
      const currentStoreId = technicianSaleStore.currentSale.store_id
      productionStatus.value = technicianSaleStore.currentSale.production_status || 'pending'
      saleType.value = technicianSaleStore.currentSale.sale_type || 'indoor'
      customerNameText.value = technicianSaleStore.currentSale.customer_name_text || null

      // 2. شحن دليل الأصناف من النظام مع تمرير المخزن لحساب الأرصدة ومنع خطأ التحقق
      // 2. شحن دليل الأصناف من النظام مع تمرير المخزن لحساب الأرصدة ومنع خطأ التحقق
      await itemStore.fetchItems(1, {
        is_active: 1,
        store_id: currentStoreId,
        per_page: 500,
        all: 1, // 🌟 [التحديث الجديد]: جلب كمية كبيرة من خامات ومواد الورشة لضمان شحن القائمة بالكامل
      })

      // 3. بناء مصفوفة السطور التفاعلية بعد ضمان اكتمال جلب الفاتورة والأصناف
      items.value = technicianSaleStore.currentSale.items.map((it) => {
        return {
          id: it.id, // معرف السطر الأساسي في قاعدة البيانات sale_item_id
          original_item_id: it.item_id,
          item_id: it.item_id,
          item_name: it.item_name || '',
          // الاعتماد الصريح على متغير الأبعاد المحقون في الريسورس لفرز وضبط حالة التعديل بالسطر
          is_dimensional: !!it.is_dimensional,
          length: it.length,
          width: it.width,
          quantity: it.quantity,
          unit_price: it.unit_price,
          grand_total: it.grand_total,
        }
      })
    }
  } catch (err) {
    console.error('Failed to initialize technician workspace:', err)
    toast.error('فشل النظام في تحميل الفاتورة أو الأرصدة المتاحة للمخزن.')
  }
})

const handleSubmit = async () => {
  // تجهيز مصفوفة الـ Payload وتصفية السطور المترية المفتوحة للتعديل فقط حماية لمدخلات السيرفر
  const dimensionalItemsPayload = items.value
    .filter((row) => row.is_dimensional)
    .map((row) => ({
      sale_item_id: row.id,
      item_id: row.item_id,
    }))

  if (dimensionalItemsPayload.length === 0) {
    toast.info('لا توجد أصناف أو خامات مترية قابلة للتعديل في هذا المستند.')
    return
  }

  try {
    // إرسال البيانات المعتمدة لستور الفني المعزول متضمنة الحالة الحرة الجديدة المختارة براديو بوتون
    await technicianSaleStore.swapRawMaterials(route.params.id, {
      production_status: productionStatus.value,
      items: dimensionalItemsPayload,
    })
    toast.success('تمت معايرة الخامات وحفظ الحالة التشغيلية وتحديث التكلفة بنجاح.')

    // إعادة توجيه الفني إلى قائمة فواتير الورشة الخاصة به
    router.push({ name: 'TechnicianSalesList' })
  } catch {
    toast.error('فشلت ملاءمة خامات الورشة، يرجى مراجعة صلاحيات التشغيل أو جرد الأرصدة.')
  }
}

const handleCancel = () => {
  // التراجع يعيد الفني لقائمته المستقلة
  router.push({ name: 'TechnicianSalesList' })
}
</script>

<style scoped>
select option {
  background-color: #111827 !important;
  color: #f8fafc !important;
}
</style>
