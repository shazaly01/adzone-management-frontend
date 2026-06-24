<!--src\views\sales\TechnicianSaleForm.vue--->
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
      v-if="saleStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ saleStore.error }}
    </div>

    <div
      class="p-3 bg-surface-ground/50 rounded-lg border border-surface-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-text-secondary"
    >
      <div>
        رقم المستند:
        <span class="font-bold text-text-primary"
          >#{{ saleStore.currentSale?.invoice_number || route.params.id }}</span
        >
      </div>
      <div>
        تاريخ الإنشاء:
        <span class="font-bold text-text-primary">{{
          saleStore.currentSale?.invoice_date?.substr(0, 10)
        }}</span>
      </div>
      <div>
        حساب العميل:
        <span class="font-bold text-text-primary">{{
          saleStore.currentSale?.customer_name || 'عميل معتمد'
        }}</span>
      </div>
      <div>
        مستودع الصرف:
        <span class="font-bold text-text-primary">{{
          saleStore.currentSale?.store_name || 'المخزن الرئيسي'
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
            <th class="p-3 w-3/12">اسم الصنف المعياري / خامة التشغيل المطبقة</th>
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
            <td class="p-3 font-mono text-text-muted">PRD-{{ row.item_id }}</td>

            <td class="p-2">
              <div v-if="row.is_raw_material" class="w-full">
                <select
                  v-model="row.item_id"
                  style="color-scheme: dark"
                  class="w-full p-1.5 bg-surface-ground text-text-primary border border-amber-500/40 focus:border-amber-500 rounded-md font-bold outline-none cursor-pointer text-right transition-all focus:ring-1 focus:ring-amber-500/20"
                >
                  <option v-for="rawItem in rawMaterialsOnly" :key="rawItem.id" :value="rawItem.id">
                    {{ rawItem.name }} (رصيد حالي: {{ rawItem.current_stock ?? 0 }})
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
                <span class="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                {{ row.item_name }}
                <span
                  class="text-[10px] font-medium text-text-muted bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border/40"
                  >(منتج/خدمة مقفل)</span
                >
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
        تنبيه: حفظ التعديلات سيعيد توازن المخازن فورا بناء على المواد البديلة، ولن يغير السعر
        النهائي المعتمد للعميل.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          تراجع وإلغاء
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          class="!bg-amber-600 hover:!bg-amber-700 text-white"
          :disabled="saleStore.loading"
          @click="handleSubmit"
        >
          <span v-if="saleStore.loading">جاري الملاءمة ومعايرة المخزن...</span>
          <span v-else>اعتماد الخامات المحدثة بالورشة</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { useItemStore } from '@/stores/itemStore'
import { useToast } from 'vue-toastification'
import AppButton from '@/components/ui/AppButton.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const saleStore = useSaleStore()
const itemStore = useItemStore()

const items = ref([])

// تصفية وعزل المواد الخام فقط المتاحة بالنظام لتغذية القوائم المنسدلة للفني
const rawMaterialsOnly = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items.filter((item) => item.item_type === 'raw_material')
})

const getValidationError = (path) => {
  return saleStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  // شحن دليل الأصناف والخامات من النظام أولاً
  await itemStore.fetchItems(1, { is_active: 1 })

  // جلب الفاتورة المستهدفة لقراءة السطور الحالية
  await saleStore.fetchSale(route.params.id)
  if (saleStore.currentSale) {
    items.value = saleStore.currentSale.items.map((it) => {
      return {
        id: it.id, // معرف السطر في جدول sale_items (sale_item_id)
        item_id: it.item_id,
        item_name: it.item_name || '',
        is_raw_material:
          it.item_type === 'raw_material' || (it.length !== null && it.length !== undefined),
        length: it.length,
        width: it.width,
        quantity: it.quantity,
        unit_price: it.unit_price,
        grand_total: it.grand_total,
      }
    })
  }
})

const handleSubmit = async () => {
  // تجهيز الحمولة وتصفية الحقول لتمرير السطور التي تملك خامات فقط حماية لمدخلات السيرفر
  const rawItemsPayload = items.value
    .filter((row) => row.is_raw_material)
    .map((row) => ({
      sale_item_id: row.id,
      item_id: row.item_id,
    }))

  if (rawItemsPayload.length === 0) {
    toast.info('لا توجد خامات قابلة للتعديل أو الملاءمة في هذا المستند.')
    return
  }

  try {
    await saleStore.swapRawMaterials(route.params.id, { items: rawItemsPayload })
    toast.success('تمت معايرة الخامات وإعادة صياغة حركات المخزن والتكلفة بنجاح.')
    router.push('/app/sales')
  } catch (err) {
    toast.error('فشلت ملاءمة الخامات، يرجى مراجعة صلاحيات التشغيل أو جرد الأرصدة.')
  }
}

const handleCancel = () => {
  router.push('/app/sales')
}
</script>

<style scoped>
select option {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
</style>
