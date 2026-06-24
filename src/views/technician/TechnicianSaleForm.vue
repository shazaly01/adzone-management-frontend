<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-amber-500 rounded-full"></span>
          ورشة التنفيذ: ملاءمة وتعديل خامات التشغيل للفاتورة
        </h1>
        <p class="text-[11px] text-text-muted mt-0.5">
          يمكنك تبديل الخامات الفعلية المستخدمة في الماكينات مع قفل المقاسات والأسعار المعتمدة
          للعميل تلقائياً.
        </p>
      </div>
    </div>

    <div
      v-if="technicianSaleStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ technicianSaleStore.error }}
    </div>

    <div
      class="p-3 bg-surface-ground/50 rounded-lg border border-surface-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-text-secondary"
    >
      <div>
        رقم المستند الرقمي:
        <span class="font-mono font-bold text-text-primary"
          >#{{ technicianSaleStore.currentSale?.id || route.params.id }}</span
        >
      </div>
      <div>
        كود الفاتورة المنسق:
        <span class="font-mono font-bold text-amber-500">{{
          technicianSaleStore.currentSale?.invoice_number || '-'
        }}</span>
      </div>
      <div>
        حساب العميل المعني:
        <span class="font-bold text-text-primary">{{
          technicianSaleStore.currentSale?.customer_name || 'عميل معتمد'
        }}</span>
      </div>
      <div>
        مستودع السحب الفعلي:
        <span class="font-bold text-text-primary">{{
          technicianSaleStore.currentSale?.store_name || 'المخزن الرئيسي'
        }}</span>
      </div>
    </div>

    <div class="bg-surface-card rounded-lg border border-surface-border overflow-hidden shadow-sm">
      <table class="w-full text-right border-collapse text-xs">
        <thead>
          <tr
            class="bg-surface-ground text-text-secondary border-b border-surface-border font-black"
          >
            <th class="p-3 w-1/12">رقم الصنف</th>
            <th class="p-3 w-3/12">اسم الصنف المعياري / خامة التشغيل المطبقة بالورشة</th>
            <th class="p-3 w-1/12 text-center">الطول</th>
            <th class="p-3 w-1/12 text-center">العرض</th>
            <th class="p-3 w-1/12 text-center">العدد</th>
            <th class="p-3 w-2/12 text-center">سعر الوحدة الافتراضي</th>
            <th class="p-3 w-2/12 text-left">إجمالي السطر الثابت</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60">
          <tr
            v-for="(row, index) in items"
            :key="row.id"
            class="hover:bg-surface-ground/30 transition-all"
          >
            <td class="p-3 font-mono text-text-muted">PRD-{{ row.original_item_id }}</td>

            <td class="p-2">
              <div v-if="row.is_dimensional" class="w-full">
                <select
                  v-model="row.item_id"
                  style="color-scheme: dark"
                  class="w-full p-1.5 bg-surface-ground text-text-primary border border-amber-500/40 focus:border-amber-500 rounded-md font-bold outline-none cursor-pointer text-right transition-all focus:ring-1 focus:ring-amber-500/20"
                >
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

              <div v-else class="p-1 font-bold text-text-primary flex items-center gap-1.5">
                <span class="inline-block w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                {{ row.item_name }}
                <span
                  class="text-[10px] font-medium text-text-muted bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border/40"
                >
                  (صنف ثابت/خدمة مقفلة مالياً)
                </span>
              </div>
            </td>

            <td class="p-3 text-center font-mono font-bold text-text-muted">
              {{
                row.length !== null && row.length !== undefined
                  ? parseFloat(row.length).toFixed(2)
                  : '-'
              }}
            </td>

            <td class="p-3 text-center font-mono font-bold text-text-muted">
              {{
                row.width !== null && row.width !== undefined
                  ? parseFloat(row.width).toFixed(2)
                  : '-'
              }}
            </td>

            <td class="p-3 text-center font-mono font-bold text-text-primary">
              {{ row.quantity }}
            </td>

            <td class="p-3 text-center font-mono text-text-muted">
              {{ parseFloat(row.unit_price).toFixed(2) }} د.ل
            </td>

            <td class="p-3 text-left font-mono font-black text-text-primary">
              {{ parseFloat(row.grand_total).toFixed(2) }} د.ل
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-amber-500 font-bold flex items-center gap-1">
        <span class="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
        تنبيه ورشة العمل: حفظ التعديلات سيعيد توجيه وتوازن المخازن والتكلفة فوراً، ولن يغير الفاتورة
        النهائية المعتمدة للعميل.
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
      // استخراج معرف المخزن المربوط بالفاتورة الحالية
      const currentStoreId = technicianSaleStore.currentSale.store_id

      // 2. شحن دليل الأصناف من النظام مع تمرير المخزن لحساب الأرصدة ومنع خطأ التحقق
      await itemStore.fetchItems(1, { is_active: 1, store_id: currentStoreId })

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
    // إرسال البيانات المعتمدة لستور الفني المعزول
    await technicianSaleStore.swapRawMaterials(route.params.id, { items: dimensionalItemsPayload })
    toast.success('تمت معايرة الخامات وإعادة صياغة حركات المخزن والتكلفة بنجاح.')

    // إعادة توجيه الفني إلى قائمة فواتير الورشة الخاصة به
    router.push({ name: 'TechnicianSalesList' })
  } catch (err) {
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
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
