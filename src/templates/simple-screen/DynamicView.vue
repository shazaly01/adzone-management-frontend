<template>
  <DynamicCrudPage
    title="إدارة البنوك"
    entity-name="بنك"
    :store="useBankStore()"
    data-key="banks"
    permission-prefix="banks"
    :schema="formSchema"
  />
</template>

<script setup>
import DynamicCrudPage from '@/components/ui/DynamicCrudPage.vue'
// قم باستيراد الستور الخاص بالشاشة هنا
// import { useTargetStore } from '@/stores/targetStore'

/**
 * مصفوفة الإعدادات (Schema): تصف حقول الشاشة بالكامل للجدول والفورم تلقائياً.
 * * الخيارات المتاحة لكل حقل (Field Configuration Options):
 * - key: (String) اسم الحقل القادم من الـ API والـ Store (مطابق تماماً).
 * - label: (String) اسم العمود أو الحقل الذي سيظهر للمستخدم بالعربية.
 * - type: (String) نوع الحقل لتركيب المكون الصحيح. الخيارات: ('text', 'number', 'textarea', 'currency', 'select').
 * - required: (Boolean) هل الحقل إجباري في الفورم؟ (اختياري).
 * - readonly: (Boolean) هل الحقل للقراءة فقط؟ (اختياري).
 * - placeholder: (String) النص التوضيحي داخل الحقل (اختياري).
 * - showInTable: (Boolean) هل تريد عرض هذا الحقل كعمود في الجدول؟ الافتراضي true (اختياري).
 * - showInForm: (Boolean) هل تريد عرض هذا الحقل داخل موديل الإدخال؟ الافتراضي true (اختياري).
 * - searchable: (Boolean) نضع true لحقل واحد فقط لتفعيل البحث السريع به (اختياري).
 * - filterable: (Boolean) نضع true إذا كان الحقل من نوع 'select' وتريد ظهوره كفلتر رئيسي في الأعلى (اختياري).
 * - options: (Array) مصفوفة الخيارات [{id: 1, name: 'مفعّل'}] في حال كان النوع 'select' (اختياري).
 * - class: (String) كلاسات تيلويند مخصصة لعمود الجدول مثل تحديد العرض 'min-w-[150px]' (اختياري).
 */
const formSchema = [
  {
    key: 'id',
    label: '#',
    type: 'text',
    readonly: true,
    showInTable: true,
    showInForm: false,
    class: 'w-16',
  },
  {
    key: 'name',
    label: 'الاسم',
    type: 'text',
    required: true,
    searchable: true,
    showInTable: true,
    showInForm: true,
  },
  {
    key: 'status',
    label: 'الحالة',
    type: 'select',
    required: true,
    filterable: true,
    showInTable: true,
    showInForm: true,
    options: [
      { id: 'active', name: 'نشط' },
      { id: 'inactive', name: 'غير نشط' },
    ],
  },
  {
    key: 'notes',
    label: 'ملاحظات وتفاصيل',
    type: 'textarea',
    showInTable: false,
    showInForm: true,
  },
]
</script>
