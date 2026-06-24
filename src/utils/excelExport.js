import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * دالة لتوليد ملف إكسيل للتقرير
 * نمرر لها المتغيرات لأنها لم تعد داخل المكون الذي يحتوي على البيانات
 */
export const generateExcelReport = async (
  reportData,
  reportTitle,
  reportType,
  customFiltersText,
) => {
  console.log('جاري إنشاء ملف الإكسيل من الملف المنفصل...')

  // 1. إنشاء ملف إكسيل جديد وورقة عمل
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('تقرير الديون', {
    views: [{ rightToLeft: true }],
  })

  // 2. تحديد عرض الأعمدة
  worksheet.columns = [
    { width: 5 }, // A
    { width: 40 }, // B
    { width: 15 }, // C
    { width: 15 }, // D
    { width: 20 }, // E
    { width: 20 }, // F
    { width: 20 }, // G
    { width: 20 }, // H
  ]

  // 3. إضافة العنوان الرئيسي للتقرير
  worksheet.mergeCells('A1:H1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = 'نظام حصر الديون - ' + reportTitle
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 40

  worksheet.addRow([]) // مسافة فارغة

  // 4. إضافة معلومات التقرير
  let infoLabelRow = []
  let infoValueRow = []

  if (reportType === 'company') {
    infoLabelRow = ['اسم الشركة', '', 'الرقم الضريبي', '', 'المفوض']
    infoValueRow = [
      reportData?.company?.name || '-',
      '',
      reportData?.company?.tax_number || '-',
      '',
      reportData?.company?.owner_name || '-',
    ]
  } else if (reportType === 'owner') {
    infoLabelRow = ['اسم الجهة المالكة', '', 'نوع التقرير', '', '']
    infoValueRow = [reportData?.owner?.name || '-', '', 'مجمع مشاريع', '', '']
  } else if (reportType === 'custom') {
    infoLabelRow = ['فلاتر التقرير', '', 'عدد المشاريع المطابقة', '', '']
    infoValueRow = [customFiltersText, '', reportData?.projects?.length || 0, '', '']
  }

  const headerInfo = worksheet.addRow(infoLabelRow)
  headerInfo.font = { bold: true, color: { argb: 'FF6B7280' } }

  const valInfo = worksheet.addRow(infoValueRow)
  valInfo.font = { bold: true, size: 12 }

  worksheet.addRow([]) // مسافة فارغة

  // 5. إضافة الملخص المالي
  const summaryHeaderRow = worksheet.addRow([
    'إجمالي العقود الكلية',
    'إجمالي القيمة المستحقة',
    'إجمالي المقبوضات',
    'الرصيد المتبقي',
    'عدد المشاريع',
  ])
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } }
  summaryHeaderRow.alignment = { horizontal: 'center' }

  const summaryValuesRow = worksheet.addRow([
    reportData?.summary?.total_contract_value || 0,
    reportData?.summary?.total_due_value || 0,
    reportData?.summary?.total_payments_received || 0,
    reportData?.summary?.total_remaining || 0,
    reportData?.projects?.length || 0,
  ])
  summaryValuesRow.font = { bold: true, size: 12 }
  summaryValuesRow.alignment = { horizontal: 'center' }

  summaryValuesRow.eachCell((cell, colNumber) => {
    if (colNumber <= 4) cell.numFmt = '#,##0'
  })

  worksheet.addRow([]) // مسافة فارغة قبل جدول المشاريع

  // --- بداية إضافة جدول المشاريع ---

  // أ. عناوين أعمدة الجدول
  const tableHeaderRow = worksheet.addRow([
    '#',
    'بيانات المشروع',
    'م. الصرف',
    'م. تعاقدي',
    'قيمة العقد',
    'المستحق',
    'المدفوع',
    'المتبقي',
  ])

  // تنسيق عناوين الجدول (خلفية داكنة ونص أبيض عريض)
  tableHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  tableHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
  tableHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' }

  // ب. إدراج بيانات المشاريع صفا صفا
  if (reportData?.projects && reportData.projects.length > 0) {
    reportData.projects.forEach((project, index) => {
      // 1. ترجمة حالات المشروع إلى نصوص عربية
      let disbursementStatus = '-'
      if (project.disbursement_status === 'fulfilled') disbursementStatus = 'مستوفى'
      else if (project.disbursement_status === 'unfulfilled') disbursementStatus = 'غير مستوفى'

      let contractualStatus = '-'
      if (project.contractual_status === 'compliant') contractualStatus = 'مطابق'
      else if (project.contractual_status === 'non_compliant') contractualStatus = 'غير مطابق'

      // 2. تجهيز القيم المالية
      const contractValue = project.contract_value || 0
      const dueValue = project.due_value || 0
      const paidValue = project.total_paid || project.payments_sum_amount || 0
      const remainingValue = dueValue - paidValue

      // 3. إضافة صف البيانات
      const row = worksheet.addRow([
        index + 1,
        project.name || 'بدون اسم',
        disbursementStatus,
        contractualStatus,
        contractValue,
        dueValue,
        paidValue,
        remainingValue,
      ])

      // 4. تنسيق الصف (توسيط وتنسيق الأرقام)
      row.alignment = { vertical: 'middle' }
      row.getCell(1).alignment = { horizontal: 'center' } // توسيط الرقم
      row.getCell(3).alignment = { horizontal: 'center' } // توسيط م. الصرف
      row.getCell(4).alignment = { horizontal: 'center' } // توسيط م. تعاقدي

      // تنسيق المبالغ المالية (الأعمدة من 5 إلى 8) بوضع فواصل الآلاف
      for (let i = 5; i <= 8; i++) {
        row.getCell(i).numFmt = '#,##0'
      }

      // 5. تلوين الحالات (أخضر للمستوفى/المطابق، أحمر لغير المستوفى/غير المطابق) لتشبه الواجهة
      if (disbursementStatus === 'مستوفى')
        row.getCell(3).font = { color: { argb: 'FF047857' }, bold: true }
      if (disbursementStatus === 'غير مستوفى')
        row.getCell(3).font = { color: { argb: 'FFBE123C' }, bold: true }

      if (contractualStatus === 'مطابق')
        row.getCell(4).font = { color: { argb: 'FF047857' }, bold: true }
      if (contractualStatus === 'غير مطابق')
        row.getCell(4).font = { color: { argb: 'FFBE123C' }, bold: true }
    })
  } else {
    // في حال كان التقرير فارغاً ولا توجد مشاريع
    const emptyRow = worksheet.addRow(['لا توجد مشاريع مسجلة في هذا التقرير'])
    worksheet.mergeCells(`A${emptyRow.number}:H${emptyRow.number}`)
    emptyRow.alignment = { horizontal: 'center' }
  }

  worksheet.addRow([]) // مسافة فارغة بعد الجدول
  // --- نهاية إضافة جدول المشاريع ---

  // 6. حفظ الملف
  // 7. تذييل التقرير (أماكن التوقيعات)
  worksheet.addRow([]) // مسافة فارغة
  worksheet.addRow([]) // مسافة فارغة

  // توزيع التوقيعات على الأعمدة لتبدو متباعدة ومنسقة
  const signatureRow = worksheet.addRow([
    '',
    'المسؤول المالي',
    '',
    'المراجعة والتدقيق',
    '',
    '',
    'يعتمد / رئيس اللجنة',
    '',
  ])
  signatureRow.font = { bold: true, size: 12, color: { argb: 'FF374151' } }

  worksheet.addRow([]) // مسافة فارغة أخيرة

  // 8. تجهيز اسم الملف الديناميكي وتنزيله
  // نحصل على تاريخ اليوم ونستبدل علامات / بـ - لكي يقبلها الويندوز في اسم الملف
  const currentDate = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')
  const fileName = `${reportTitle} - ${currentDate}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, fileName)

  console.log('تم إنجاز وتنزيل التقرير النهائي بنجاح!')
}
