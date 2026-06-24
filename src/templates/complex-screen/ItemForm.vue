<!--src\templates\complex-screen\ItemForm.vue--->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <slot name="fields" :form="form" :errors="errors"></slot>
      </div>
    </div>

    <div
      class="mt-8 flex justify-end space-x-3 space-x-reverse border-t border-surface-border pt-4"
    >
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ البيانات</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, nextTick } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null }, // السجل الممرر عند التعديل
  isSaving: { type: Boolean, default: false }, // مؤشر حالة التحميل من الستور
})

const emit = defineEmits(['submit', 'cancel'])

// كائن تفاعلي معزول لإدارة الأخطاء المحلية للشاشة
const errors = reactive({})

// دالة توليد كائن فورم أساسي مفرغ ومستقر (يمكن توسيعه تلقائياً من الشاشة الأم)
const createFreshForm = () => ({
  id: null,
  name: '',
})

const form = ref(createFreshForm())

// مراقبة ذكية وعميقة لمزامنة البيانات وتطهير الكاش فوراً عند فتح أو إغلاق الاستمارة
watch(
  () => props.initialData,
  async (newData) => {
    // تصفير الأخطاء السابقة تماماً لمنع ظهور خطوط حمراء قديمة للمستخدم
    Object.keys(errors).forEach((key) => delete errors[key])

    await nextTick()
    if (newData) {
      // حالة التعديل: أخذ نسخة صافية ومستقلة منعاً للتعديل المباشر في مرجع الستور الرئيسي
      form.value = { ...newData }
    } else {
      // حالة الإضافة الجديدة: تصفير الفورم بالكامل لحقول برمجية نظيفة
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة إلغاء العملية وتطهير الفورم
const handleCancel = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
  form.value = createFreshForm()
  emit('cancel')
}

// دالة التحقق البرمجي وتسليم البيانات الصافية للأب
const handleSubmit = () => {
  // تصفير مصفوفة الأخطاء قبل بدء الفحص الجديد
  Object.keys(errors).forEach((key) => delete errors[key])

  // فحص أمان أولي: التحقق من وجود الحقول الأساسية المشتركة كـ الاسم
  if (!form.value.name || !form.value.name.trim()) {
    errors.name = 'هذا الحقل مطلوب ولا يمكن تركه فارغاً'
    return
  }

  // تسليم الكائن النظيف والصريح لمحرك الـuseCrud عبر الشاشة الرئيسية
  emit('submit', { ...form.value })
}
</script>
