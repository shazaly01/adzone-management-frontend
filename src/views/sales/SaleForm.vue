<!--src\views\sales\SaleForm.vue--->
<script setup>
import { useSaleFormLogic } from '@/composables/useSaleFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

import SaleHeader from './components/SaleHeader.vue'
import SaleFooter from './components/SaleFooter.vue'
import SaleItemsTable from './components/SaleItemsTable.vue'

const {
  isEdit,
  form,
  items,
  detailSchema,
  visibleTableSchema,
  totalDesignArea,
  headerSubtotal,
  headerGrandTotal,
  getValidationError,
  handleSubmit,
  handleCancel,
  formatNumber,
  unformatNumber,
  // استدعاء دالات التحكم المركزية الجديدة لتمريرها للأسفل بنجاح
  removeRow,
  triggerAddNewEmptyLine,
  handleGlobalItemSelect,
  saleStore,
} = useSaleFormLogic()
</script>

<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند المبيعات' : 'فاتورة مبيعات جديدة' }}
        </h1>
      </div>
    </div>

    <div
      v-if="saleStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ saleStore.error }}
    </div>

    <SaleHeader v-model="form" :validation-errors="saleStore.validationErrors" />

    <AppCard>
      <SaleItemsTable
        :items="items"
        :form="form"
        :detail-schema="detailSchema"
        :visible-table-schema="visibleTableSchema"
        :get-validation-error="getValidationError"
        :format-number="formatNumber"
        :unformat-number="unformatNumber"
        :remove-row="removeRow"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :handle-global-item-select="handleGlobalItemSelect"
      />
    </AppCard>

    <SaleFooter
      v-model:notes="form.notes"
      v-model:discountAmount="form.discount_amount"
      v-model:taxAmount="form.tax_amount"
      v-model:designerId="form.designer_id"
      v-model:designerMeterPrice="form.designer_meter_price"
      :subtotal="headerSubtotal"
      :grand-total="headerGrandTotal"
      :total-design-area="totalDesignArea"
      :design-commission="form.design_commission"
      :validation-errors="saleStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        مستند المبيعات والمدخلات المالية الحالية تخضع للمراقبة الجردية والتدقيق اللحظي للأرصدة.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" :disabled="saleStore.loading" @click="handleSubmit">
          <span v-if="saleStore.loading">جاري ترحيل حركة المبيعات...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة الفاتورة' : 'ترحيل وإصدار الفاتورة النهائية'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
