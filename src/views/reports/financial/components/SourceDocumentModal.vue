<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      class="bg-zinc-950 border border-zinc-800 w-full max-w-4xl shadow-2xl p-6 relative rounded-none flex flex-col max-h-[90vh]"
    >
      <!-- رأس النافذة -->
      <div class="flex justify-between items-start border-b border-zinc-800 pb-4 mb-4">
        <div>
          <span
            class="text-xs font-bold px-2 py-0.5 border font-mono tracking-wide rounded-none uppercase"
            :class="modalBadgeClass"
          >
            {{ modalTypeLabel }}
          </span>
          <h3 class="text-xl font-black text-white mt-2 flex items-center gap-2">
            <span>رقم المستند:</span>
            <span class="text-cyan-400 font-mono tracking-wider">{{ entryNumber }}</span>
          </h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-zinc-500 hover:text-white transition-colors text-2xl font-light"
        >
          &times;
        </button>
      </div>

      <!-- مؤشر التحميل الداخلي المعزول -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div
          class="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-sm text-zinc-400 animate-pulse">جاري جلب تفاصيل المستند الأصلي ذرياً...</p>
      </div>

      <!-- محتوى المستند الفعلي بعد التحميل -->
      <div v-else class="overflow-y-auto flex-1 space-y-6 pr-1 text-right">
        <!-- أولاً: تفاصيل فاتورة المبيعات (Sale Layout) -->
        <div v-if="sourceType === 'sale' && currentSale" class="space-y-4">
          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900/40 border border-zinc-800/60 p-4"
          >
            <div>
              <span class="block text-xs text-zinc-500">تاريخ الفاتورة</span>
              <span class="text-sm font-bold text-zinc-300 font-mono">{{
                currentSale.invoice_date
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">طريقة الدفع</span>
              <span class="text-sm font-bold text-zinc-300">{{
                currentSale.payment_type === 'cash'
                  ? 'نقدي'
                  : currentSale.payment_type === 'card'
                    ? 'بنك/شبكة'
                    : 'آجل'
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">المستودع / المخزن</span>
              <span class="text-sm font-bold text-zinc-300">{{
                currentSale.store?.name ?? '-'
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">إجمالي الفاتورة صافي</span>
              <span class="text-sm font-black text-emerald-400 font-mono">{{
                formatCurrency(currentSale.grand_total)
              }}</span>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-bold text-zinc-400 mb-2">
              جدول الأصناف والمواصفات التشغيلية للمبيعات
            </h4>
            <div class="border border-zinc-800 overflow-x-auto">
              <table class="w-full text-sm text-right">
                <thead class="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-xs font-bold">
                  <tr>
                    <th class="p-3">الصنف</th>
                    <th class="p-3">الكمية</th>
                    <th class="p-3">الوحدة</th>
                    <th class="p-3">الطول (متر)</th>
                    <th class="p-3">العرض (متر)</th>
                    <th class="p-3">سعر الوحدة</th>
                    <th class="p-3 text-left">الإجمالي الصافي</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800 text-zinc-300">
                  <tr v-for="row in currentSale.items" :key="row.id" class="hover:bg-zinc-900/30">
                    <td class="p-3 font-bold text-zinc-200">
                      {{ row.item_name ?? '-' }}
                      <span
                        v-if="row.item_code"
                        class="block text-[10px] text-zinc-500 font-mono mt-0.5"
                        >{{ row.item_code }}</span
                      >
                    </td>
                    <td class="p-3 font-mono text-white font-bold">{{ row.quantity }}</td>
                    <td class="p-3 text-zinc-400 text-xs">{{ row.unit_name ?? '-' }}</td>
                    <td
                      class="p-3 font-mono"
                      :class="row.length ? 'text-cyan-400 font-bold' : 'text-zinc-600'"
                    >
                      {{ row.length !== null ? row.length : '-' }}
                    </td>
                    <td
                      class="p-3 font-mono"
                      :class="row.width ? 'text-cyan-400 font-bold' : 'text-zinc-600'"
                    >
                      {{ row.width !== null ? row.width : '-' }}
                    </td>
                    <td class="p-3 font-mono">{{ formatCurrency(row.unit_price) }}</td>
                    <td class="p-3 font-mono text-left font-bold text-white">
                      {{ formatCurrency(row.grand_total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ثانياً: تفاصيل فاتورة المشتريات (Purchase Layout) -->
        <div v-if="sourceType === 'purchase' && currentPurchase" class="space-y-4">
          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900/40 border border-zinc-800/60 p-4"
          >
            <div>
              <span class="block text-xs text-zinc-500">تاريخ حركة الشراء</span>
              <span class="text-sm font-bold text-zinc-300 font-mono">{{
                currentPurchase.purchase_date ?? '-'
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">المورد</span>
              <span class="text-sm font-bold text-zinc-300">{{
                currentPurchase.supplier?.name ?? '-'
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">المستودع المستلم</span>
              <span class="text-sm font-bold text-zinc-300">{{
                currentPurchase.store?.name ?? '-'
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">إجمالي المشتريات</span>
              <span class="text-sm font-black text-rose-400 font-mono">{{
                formatCurrency(currentPurchase.grand_total)
              }}</span>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-bold text-zinc-400 mb-2">المواد المخزنية الموردة</h4>
            <div class="border border-zinc-800 overflow-x-auto">
              <table class="w-full text-sm text-right">
                <thead class="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-xs font-bold">
                  <tr>
                    <th class="p-3">الصنف</th>
                    <th class="p-3">الكمية</th>
                    <th class="p-3">الوحدة</th>
                    <th class="p-3">تكلفة الشراء</th>
                    <th class="p-3 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800 text-zinc-300">
                  <tr
                    v-for="row in currentPurchase.items"
                    :key="row.id"
                    class="hover:bg-zinc-900/30"
                  >
                    <td class="p-3 font-bold text-zinc-200">
                      {{ row.item_name ?? '-' }}
                      <span
                        v-if="row.item_code"
                        class="block text-[10px] text-zinc-500 font-mono mt-0.5"
                        >{{ row.item_code }}</span
                      >
                    </td>
                    <td class="p-3 font-mono text-white font-bold">{{ row.quantity }}</td>
                    <td class="p-3 text-zinc-400 text-xs">{{ row.unit_name ?? '-' }}</td>
                    <td class="p-3 font-mono">{{ formatCurrency(row.unit_cost) }}</td>
                    <td class="p-3 font-mono text-left font-bold text-white">
                      {{ formatCurrency(row.grand_total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ثالثاً: تفاصيل السندات المالية الموحدة (Voucher Layout - القبض والصرف) -->
        <div v-if="['receipt', 'payment'].includes(sourceType) && currentVoucher" class="space-y-4">
          <div
            class="grid grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-900/40 border border-zinc-800/60 p-4"
          >
            <div>
              <span class="block text-xs text-zinc-500">تاريخ إصدار السند</span>
              <span class="text-sm font-bold text-zinc-300 font-mono">
                {{
                  currentVoucher.voucher_date
                    ? new Date(currentVoucher.voucher_date).toLocaleDateString('zh-Hans-CN')
                    : '-'
                }}
              </span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">طريقة المعاملة</span>
              <span class="text-sm font-bold text-zinc-300">{{
                currentVoucher.payment_method === 'cash' ? 'نقدي / خزنة' : 'حساب بنكي / شبكة'
              }}</span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">المبلغ المدفوع / المقبوض</span>
              <span class="text-sm font-black text-cyan-400 font-mono">{{
                formatCurrency(currentVoucher.amount)
              }}</span>
            </div>
          </div>

          <div class="bg-zinc-900/20 border border-zinc-800/80 p-4 space-y-3">
            <div>
              <span class="block text-xs text-zinc-500">الحساب المالي المرتبط</span>
              <span class="text-sm font-bold text-white">{{
                currentVoucher.account?.name ?? '-'
              }}</span>
            </div>
            <div v-if="currentVoucher.treasury?.name || currentVoucher.bank?.name">
              <span class="block text-xs text-zinc-500">حساب النقدية التفصيلي المساعد</span>
              <span class="text-sm font-bold text-zinc-300">
                {{ currentVoucher.treasury?.name ?? currentVoucher.bank?.name }}
              </span>
            </div>
            <div>
              <span class="block text-xs text-zinc-500">الشرح والبيان المقيد بالسند</span>
              <p class="text-sm text-zinc-400 mt-1 bg-zinc-950 p-3 border border-zinc-900">
                {{ currentVoucher.notes ?? 'لا يوجد بيان إضافي' }}
              </p>
            </div>
          </div>
        </div>

        <!-- بيان الملاحظات الإجمالي للمستند -->
        <div v-if="documentNotes" class="mt-4 border-t border-zinc-900 pt-3">
          <span class="text-xs text-zinc-500 block mb-1">ملاحظات المستند الإجمالية:</span>
          <p class="text-xs text-zinc-400 bg-zinc-900/30 p-2 border border-zinc-800/40">
            {{ documentNotes }}
          </p>
        </div>
      </div>

      <!-- أسفل النافذة -->
      <div class="border-t border-zinc-800 pt-4 mt-4 flex justify-end">
        <button
          @click="$emit('close')"
          class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold border border-zinc-700 rounded-none text-xs px-4 py-2 transition-colors"
        >
          إغلاق النافذة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { useSaleStore } from '@/stores/saleStore'
import { usePurchaseStore } from '@/stores/purchaseStore'
import { useVoucherStore } from '@/stores/voucherStore'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  sourceType: { type: String, required: true },
  sourceId: { type: [Number, String], required: true },
  entryNumber: { type: String, default: '-' },
})

defineEmits(['close'])

const saleStore = useSaleStore()
const purchaseStore = usePurchaseStore()
const voucherStore = useVoucherStore()

const { currentSale } = storeToRefs(saleStore)
const { currentPurchase } = storeToRefs(purchaseStore)
const { currentVoucher } = storeToRefs(voucherStore)

const loading = ref(false)

const modalTypeLabel = computed(() => {
  switch (props.sourceType) {
    case 'sale':
      return 'فاتورة مبيعات نقدية'
    case 'purchase':
      return 'فاتورة مشتريات بضائع'
    case 'receipt':
      return 'سند قبض مالي'
    case 'payment':
      return 'سند صرف نقدي'
    default:
      return 'مستند مالي تشغيلي'
  }
})

const modalBadgeClass = computed(() => {
  switch (props.sourceType) {
    case 'sale':
      return 'border-emerald-800 text-emerald-400 bg-emerald-950/40'
    case 'purchase':
      return 'border-rose-800 text-rose-400 bg-rose-950/40'
    case 'receipt':
      return 'border-cyan-800 text-cyan-400 bg-cyan-950/40'
    case 'payment':
      return 'border-amber-800 text-amber-400 bg-amber-950/40'
    default:
      return 'border-zinc-800 text-zinc-400 bg-zinc-900'
  }
})

const documentNotes = computed(() => {
  if (props.sourceType === 'sale') return currentSale.value?.notes
  if (props.sourceType === 'purchase') return currentPurchase.value?.notes
  if (['receipt', 'payment'].includes(props.sourceType)) return currentVoucher.value?.notes
  return null
})

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && props.sourceId && props.sourceType) {
      loading.value = true
      try {
        if (props.sourceType === 'sale') {
          await saleStore.fetchSale(props.sourceId)
        } else if (props.sourceType === 'purchase') {
          await purchaseStore.fetchPurchase(props.sourceId)
        } else if (['receipt', 'payment'].includes(props.sourceType)) {
          await voucherStore.fetchVoucher(props.sourceId)
        }
      } catch (err) {
        console.error('Failed to auto-resolve drill-down document details inside component:', err)
      } finally {
        loading.value = false
      }
    }
  },
)
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
