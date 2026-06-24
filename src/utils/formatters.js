// src/utils/formatters.js

/**
 * ملف أدوات التنسيق (Formatters)
 * يحتوي على متحكم مركزي للعملة وإعدادات تنسيق الأرقام والتواريخ.
 */

// المتحكم المركزي للعملة - يمكنك تغيير القيمة هنا لتنعكس في كامل النظام فوراً (مثال: 'جنيه' أو 'ج.م')
export const DEFAULT_CURRENCY = 'جنيه'

/**
 * يقوم بتنسيق القيمة الرقمية وإضافة العملة المركزية ديناميكياً.
 * @param {number | string | null | undefined} value - القيمة الرقمية.
 * @returns {string} - السلسلة المنسقة، مثال: "1,500 جنيه" أو "1,250.50 جنيه"
 */
export function formatCurrency(value) {
  // التحقق من القيم الفارغة أو غير المعرفة
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  // تحويل القيمة إلى رقم لضمان عمل الدالة حتى لو جاءت القيمة كنص من السيرفر
  const numValue = Number(value)

  // إذا لم يكن رقماً صحيحاً (NaN)، نعيد صفر متبوعاً بالعملة المركزية
  if (isNaN(numValue)) {
    return `0 ${DEFAULT_CURRENCY}`
  }

  // إعدادات التنسيق الافتراضية (أرقام إنجليزية، فواصل آلاف، ومع إظهار رقمين عشريين لوجود كسور)
  const options = {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }

  // التحقق التلقائي: إذا كان الرقم صحيحاً تماماً (بدون فكة / بدون كسور)
  // يتم تصفير خانات الكسور تماماً ليظهر العدد صحيحاً مع الحفاظ على فواصل الآلاف
  if (numValue % 1 === 0) {
    options.maximumFractionDigits = 0
    options.minimumFractionDigits = 0
  }

  // التنسيق باستخدام مكتبة المتصفح القياسية Intl بالاعتماد على الإعدادات المرنة أعلاه
  const formattedNumber = new Intl.NumberFormat('en-US', options).format(numValue)

  // إرجاع الرقم المنسق متبوعاً بالعملة المركزية التي تم تحديدها في الأعلى
  return `${formattedNumber} ${DEFAULT_CURRENCY}`
}

/**
 * يقوم بتنسيق سلسلة التاريخ إلى صيغة ميلادية رقمية (يوم/شهر/سنة).
 * @param {string | null | undefined} dateString - سلسلة التاريخ.
 * @returns {string} - السلسلة المنسقة.
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  return date.toLocaleDateString('en-GB', options)
}
