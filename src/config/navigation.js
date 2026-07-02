import {
  HomeIcon,
  Squares2X2Icon,
  BanknotesIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon, // أيقونة كشف الحساب المساعد
  ShoppingCartIcon, // أيقونة فواتير المبيعات
  ShoppingBagIcon, // أيقونة فواتير المشتريات
  ReceiptRefundIcon, // أيقونة سندات القبض والصرف
  AdjustmentsHorizontalIcon, // [إضافة]: أيقونة مخصصة للتسويات الجردية المباشرة
} from '@heroicons/vue/24/outline'

/**
 * إعدادات القائمة الجانبية للتطبيق (مجرّدة وقابلة لإعادة الاستخدام)
 * الهيكل الحالي مصمم لتقديم العمليات اليومية أولاً، وتأخير القوائم المنسدلة لأسفل الواجهة.
 */
export const navigationConfig = [
  // ==========================================================================
  // الكتلة الأولى: الشاشات والعمليات المباشرة والسريعة (Top - Flat Root Items)
  // ==========================================================================

  {
    name: 'لوحة التحكم',
    routeName: 'Dashboard',
    icon: HomeIcon,
    permission: 'dashboard.view',
  },
  {
    name: 'فواتير المبيعات',
    routeName: 'SalesList',
    icon: ShoppingCartIcon,
    permission: 'sale.view',
  },
  {
    name: 'فواتير المشتريات',
    routeName: 'PurchasesList',
    icon: ShoppingBagIcon,
    permission: 'purchase.view',
  },
  {
    name: 'سندات الصرف',
    routeName: 'PaymentVouchersList',
    icon: ReceiptRefundIcon,
    permission: 'voucher.view',
  },
  {
    name: 'سندات القبض',
    routeName: 'ReceiptVouchersList',
    icon: ReceiptRefundIcon,
    permission: 'voucher.view',
  },
  {
    name: 'التسويات الجردية',
    routeName: 'StockAdjustmentsList',
    icon: AdjustmentsHorizontalIcon,
    permission: 'stock_adjustment.view',
  },
  {
    name: 'كشف الحساب المساعد',
    routeName: 'SubLedgerReport',
    icon: DocumentTextIcon,
    permission: 'report.financial',
  },
  {
    name: 'ورشة التنفيذ',
    routeName: 'TechnicianSalesList',
    icon: WrenchScrewdriverIcon,
    permission: 'sale.swap_raw_materials',
  },

  // [الأسطر المعلقة للعمليات المباشرة المستقبيلية]
  // {
  //   name: 'بضاعة أول المدة',
  //   routeName: 'OpeningStocksList',
  //   icon: ArrowPathIcon,
  //   permission: 'opening_stock.view',
  // },

  // ==========================================================================
  // الكتلة الثانية: المجموعات المنسدلة للتهيئة والتقارير (Bottom - Dropdown Menus)
  // ==========================================================================

  // 1. موديول البيانات الأساسية والتهيئة
  {
    name: 'البيانات الأساسية',
    icon: Squares2X2Icon,
    permission: 'item.view',
    children: [
      {
        name: 'مجموعات الأصناف',
        routeName: 'CategoriesList',
        permission: 'category.view',
      },
      {
        name: 'وحدات القياس',
        routeName: 'UnitsList',
        permission: 'unit.view',
      },
      {
        name: 'المخازن والمستودعات',
        routeName: 'StoresList',
        permission: 'store.view',
      },
      {
        name: 'دليل الأصناف والخدمات',
        routeName: 'ItemsList',
        permission: 'item.view',
      },
      {
        name: 'إدارة العملاء',
        routeName: 'CustomersList',
        permission: 'customer.view',
      },
      {
        name: 'إدارة الموردين',
        routeName: 'SuppliersList',
        permission: 'supplier.view',
      },
    ],
  },

  // 2. موديول الحسابات والمالية
  {
    name: 'المالية والمحاسبة',
    icon: BanknotesIcon,
    permission: 'account.view',
    children: [
      // {
      //   name: 'شجرة الحسابات',
      //   routeName: 'AccountsList',
      //   permission: 'account.view',
      // },
      {
        name: 'الخزائن المالية',
        routeName: 'TreasuriesList',
        permission: 'treasury.view',
      },
      {
        name: 'الحسابات البنكية',
        routeName: 'BanksList',
        permission: 'bank.view',
      },
      {
        name: 'بنود المصروفات',
        routeName: 'ExpensesList',
        permission: 'expense.view',
      },
      // {
      //   name: 'القيود اليومية المركبة',
      //   routeName: 'JournalEntriesList',
      //   permission: 'journal_entry.view',
      // },
    ],
  },

  // 3. قسم التقارير الموحد والمبوب داخلياً بفواصل صلبة
  {
    name: 'قسم التقارير',
    icon: DocumentChartBarIcon,
    permission: 'report.view',
    children: [
      // عنوان فرعي صلب للمجموعة الأولى
      {
        type: 'header',
        name: 'تقارير المخازن والمستودعات',
      },
      {
        name: 'تقرير المخزون الحالي',
        routeName: 'CurrentStockReport',
        permission: 'report.inventory',
      },
      {
        name: 'تقرير كارت الصنف',
        routeName: 'StockCardReport',
        permission: 'report.inventory',
      },
      {
        name: 'تقرير تقييم المخزون',
        routeName: 'StockValuationReport',
        permission: 'report.inventory',
      },
      {
        name: 'ملخص التسويات الجردية',
        routeName: 'AdjustmentsSummaryReport',
        permission: 'report.inventory',
      },

      // عنوان فرعي صلب ومستقل للمجموعة الثانية
      {
        type: 'header',
        name: 'التقارير المالية والختامية',
      },
      {
        name: 'دفتر الأستاذ العام',
        routeName: 'AccountLedgerReport',
        permission: 'report.financial',
      },
      {
        name: 'ميزان المراجعة',
        routeName: 'TrialBalanceReport',
        permission: 'report.financial',
      },
      {
        name: 'قائمة الدخل الختامية',
        routeName: 'IncomeStatementReport',
        permission: 'report.financial',
      },
      {
        name: 'الميزانية العمومية',
        routeName: 'BalanceSheetReport',
        permission: 'report.financial',
      },
    ],
  },

  // 4. موديول الإدارة العامة والنظام
  {
    name: 'الإدارة العامة',
    icon: Cog6ToothIcon,
    permission: 'user.view',
    children: [
      {
        name: 'إدارة المستخدمين',
        routeName: 'UsersList',
        permission: 'user.view',
      },
      {
        name: 'الأدوار والصلاحيات',
        routeName: 'RolesList',
        permission: 'role.view',
      },
      {
        name: 'النسخ الاحتياطي للبيانات',
        routeName: 'BackupsList',
        permission: 'backup.view',
      },
    ],
  },
]
