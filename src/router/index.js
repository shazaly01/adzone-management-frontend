import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيطات الرئيسية (Layouts) ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// --- استيراد الصفحات الأساسية الثابتة ---
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// --- 1. مسارات البيانات الأساسية والتهيئة (Lazy Loading) ---
const CategoriesList = () => import('@/views/categories/CategoriesList.vue')
const UnitsList = () => import('@/views/units/UnitsList.vue')
const StoresList = () => import('@/views/stores/StoresList.vue')
const ItemsList = () => import('@/views/items/ItemsList.vue')
const CustomersList = () => import('@/views/customers/CustomersList.vue')
const SuppliersList = () => import('@/views/suppliers/SuppliersList.vue')

// --- 2. مسارات موديول المحاسبة والمالية ---
const AccountsList = () => import('@/views/accounts/AccountsList.vue')
const TreasuriesList = () => import('@/views/treasuries/TreasuriesList.vue')
const BanksList = () => import('@/views/banks/BanksList.vue')
const ExpensesList = () => import('@/views/expenses/ExpensesList.vue')
const JournalEntriesList = () => import('@/views/journal-entries/JournalEntriesList.vue')
const JournalEntryForm = () => import('@/views/journal-entries/JournalEntryForm.vue')
const VouchersList = () => import('@/views/vouchers/VouchersList.vue')
const ItemForm = () => import('@/views/items/ItemForm.vue')

// --- 3. مسارات موديول الحركات والعمليات التجارية ---
const OpeningStocksList = () => import('@/views/opening-stocks/OpeningStocksList.vue')
const PurchasesList = () => import('@/views/purchases/PurchasesList.vue')
const PurchaseForm = () => import('@/views/purchases/PurchaseForm.vue')
const SalesList = () => import('@/views/sales/SalesList.vue')
const SaleForm = () => import('@/views/sales/SaleForm.vue')
const TechnicianSalesList = () => import('@/views/technician/TechnicianSalesList.vue')
const TechnicianSaleForm = () => import('@/views/technician/TechnicianSaleForm.vue')

const StockAdjustmentsList = () => import('@/views/stock-adjustments/StockAdjustmentsList.vue')
const StockAdjustmentForm = () => import('@/views/stock-adjustments/StockAdjustmentForm.vue')

// --- 4. مسارات قسم التقارير الموحد والمعزول (تم التعديل هنا للمجلدات الجديدة) ---
const CurrentStockReport = () => import('@/views/reports/inventory/CurrentStockReport.vue')
const StockCardReport = () => import('@/views/reports/inventory/StockCardReport.vue')
const StockValuationReport = () => import('@/views/reports/inventory/StockValuationReport.vue')
const AdjustmentsSummaryReport = () =>
  import('@/views/reports/inventory/StockAdjustmentsReport.vue')
const AccountLedgerReport = () => import('@/views/reports/financial/AccountLedgerReport.vue')
const SubLedgerReport = () => import('@/views/reports/financial/SubLedgerReport.vue')
const TrialBalanceReport = () => import('@/views/reports/financial/TrialBalanceReport.vue')
const IncomeStatementReport = () => import('@/views/reports/financial/IncomeStatementReport.vue')
const BalanceSheetReport = () => import('@/views/reports/financial/BalanceSheetReport.vue')

// --- 5. مسارات إدارة النظام والنسخ الاحتياطي ---
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')
const BackupsList = () => import('@/views/settings/BackupsList.vue')
const PrintSummary = () => import('@/views/reports/PrintSummary.vue')

const routes = [
  // --- المسارات العامة (لا تتطلب مصادقة) ---
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: '', redirect: '/login' },
    ],
  },

  // --- المسارات المحمية داخل النظام (تتطلب مصادقة وصلاحيات) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // لوحة التحكم الأساسية
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
      },

      // ==========================================
      // أ. مجموعة مسارات البيانات الأساسية (Simple Screens)
      // ==========================================
      {
        path: 'categories',
        name: 'CategoriesList',
        component: CategoriesList,
        meta: { permission: 'category.view' },
      },
      {
        path: 'units',
        name: 'UnitsList',
        component: UnitsList,
        meta: { permission: 'unit.view' },
      },
      {
        path: 'stores',
        name: 'StoresList',
        component: StoresList,
        meta: { permission: 'store.view' },
      },
      {
        path: 'items',
        name: 'ItemsList',
        component: ItemsList,
        meta: { permission: 'item.view' },
      },
      {
        path: 'items/create',
        name: 'ItemCreate',
        component: ItemForm,
        meta: { permission: 'item.create' },
      },
      {
        path: 'items/:id/edit',
        name: 'ItemEdit',
        component: ItemForm,
        meta: { permission: 'item.update' },
      },
      {
        path: 'customers',
        name: 'CustomersList',
        component: CustomersList,
        meta: { permission: 'customer.view' },
      },
      {
        path: 'suppliers',
        name: 'SuppliersList',
        component: SuppliersList,
        meta: { permission: 'supplier.view' },
      },

      // ==========================================
      // ب. مجموعة مسارات موديول الحسابات والمالية
      // ==========================================
      {
        path: 'accounts',
        name: 'AccountsList',
        component: AccountsList,
        meta: { permission: 'account.view' },
      },
      {
        path: 'treasuries',
        name: 'TreasuriesList',
        component: TreasuriesList,
        meta: { permission: 'treasury.view' },
      },
      {
        path: 'banks',
        name: 'BanksList',
        component: BanksList,
        meta: { permission: 'bank.view' },
      },
      {
        path: 'expenses',
        name: 'ExpensesList',
        component: ExpensesList,
        meta: { permission: 'expense.view' },
      },
      {
        path: 'journal-entries',
        name: 'JournalEntriesList',
        component: JournalEntriesList,
        meta: { permission: 'journal_entry.view' },
      },
      {
        path: 'journal-entries/create',
        name: 'JournalEntryCreate',
        component: JournalEntryForm,
        meta: { permission: 'journal_entry.create' },
      },
      {
        path: 'journal-entries/:id/edit',
        name: 'JournalEntryEdit',
        component: JournalEntryForm,
        meta: { permission: 'journal_entry.update' },
      },
      {
        path: 'vouchers/payment',
        name: 'PaymentVouchersList',
        component: VouchersList,
        meta: { permission: 'voucher.view' },
        props: { forcedType: 'payment' },
      },
      {
        path: 'vouchers/receipt',
        name: 'ReceiptVouchersList',
        component: VouchersList,
        meta: { permission: 'voucher.view' },
        props: { forcedType: 'receipt' },
      },

      // ==========================================
      // جـ. مجموعة مسارات موديول الحركات والعمليات التجارية
      // ==========================================
      {
        path: 'opening-stocks',
        name: 'OpeningStocksList',
        component: OpeningStocksList,
        meta: { permission: 'opening_stock.view' },
      },
      {
        path: 'purchases',
        name: 'PurchasesList',
        component: PurchasesList,
        meta: { permission: 'purchase.view' },
      },
      {
        path: 'purchases/create',
        name: 'PurchaseCreate',
        component: PurchaseForm,
        meta: { permission: 'purchase.create' },
      },
      {
        path: 'purchases/:id/edit',
        name: 'PurchaseEdit',
        component: PurchaseForm,
        meta: { permission: 'purchase.update' },
      },
      {
        path: 'sales',
        name: 'SalesList',
        component: SalesList,
        meta: { permission: 'sale.view' },
      },
      {
        path: 'sales/create',
        name: 'SaleCreate',
        component: SaleForm,
        meta: { permission: 'sale.create' },
      },
      {
        path: 'sales/:id/edit',
        name: 'SaleEdit',
        component: SaleForm,
        meta: { permission: 'sale.update' },
      },
      {
        path: 'technician/sales',
        name: 'TechnicianSalesList',
        component: TechnicianSalesList,
        meta: { permission: 'sale.swap_raw_materials' },
      },
      {
        path: 'technician/sales/:id/edit',
        name: 'TechnicianSaleEdit',
        component: TechnicianSaleForm,
        meta: { permission: 'sale.swap_raw_materials' },
      },
      {
        path: 'stock-adjustments',
        name: 'StockAdjustmentsList',
        component: StockAdjustmentsList,
        meta: { permission: 'stock_adjustment.view' },
      },
      {
        path: 'stock-adjustments/create',
        name: 'StockAdjustmentCreate',
        component: StockAdjustmentForm,
        meta: { permission: 'stock_adjustment.create' },
      },
      {
        path: 'stock-adjustments/:id/edit',
        name: 'StockAdjustmentEdit',
        component: StockAdjustmentForm,
        meta: { permission: 'stock_adjustment.update' },
      },

      // ==========================================
      // د. مجموعة مسارات قسم التقارير الموحد
      // ==========================================
      {
        path: 'reports/current-stock',
        name: 'CurrentStockReport',
        component: CurrentStockReport,
        meta: { permission: 'report.inventory' },
      },
      {
        path: 'reports/stock-card',
        name: 'StockCardReport',
        component: StockCardReport,
        meta: { permission: 'report.inventory' },
      },
      {
        path: 'reports/stock-valuation',
        name: 'StockValuationReport',
        component: StockValuationReport,
        meta: { permission: 'report.inventory' },
      },
      {
        path: 'reports/adjustments-summary',
        name: 'AdjustmentsSummaryReport',
        component: AdjustmentsSummaryReport,
        meta: { permission: 'report.inventory' },
      },
      {
        path: 'reports/account-ledger',
        name: 'AccountLedgerReport',
        component: AccountLedgerReport,
        meta: { permission: 'report.financial' },
      },
      {
        path: 'reports/sub-ledger',
        name: 'SubLedgerReport',
        component: SubLedgerReport,
        meta: { permission: 'report.financial' },
      },
      {
        path: 'reports/trial-balance',
        name: 'TrialBalanceReport',
        component: TrialBalanceReport,
        meta: { permission: 'report.financial' },
      },
      {
        path: 'reports/income-statement',
        name: 'IncomeStatementReport',
        component: IncomeStatementReport,
        meta: { permission: 'report.financial' },
      },
      {
        path: 'reports/balance-sheet',
        name: 'BalanceSheetReport',
        component: BalanceSheetReport,
        meta: { permission: 'report.financial' },
      },

      // ==========================================
      // هـ. مسارات إدارة النظام وحسابات المستخدمين
      // ==========================================
      {
        path: 'users',
        name: 'UsersList',
        component: UsersList,
        meta: { permission: 'user.view' },
      },
      {
        path: 'roles',
        name: 'RolesList',
        component: RolesList,
        meta: { permission: 'role.view' },
      },
      {
        path: 'settings/backups',
        name: 'BackupsList',
        component: BackupsList,
        meta: { permission: 'backup.view' },
      },

      // التوجيه التلقائي للمسار الفارغ داخل التطبيق
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  // --- مسارات نوافذ الطباعة الكاملة المعزولة ---
  {
    path: '/print/companies-summary',
    name: 'PrintSummary',
    component: PrintSummary,
    meta: { requiresAuth: true },
  },
  {
    path: '/print/company-statement',
    name: 'PrintCompanyStatement',
    component: () => import('@/views/reports/CompanyStatementPrint.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/print/sales/:id',
    name: 'PrintSale',
    component: () => import('@/views/sales/SalePrint.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/print/vouchers/:id',
    name: 'PrintVoucher',
    component: () => import('@/views/vouchers/VoucherPrint.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/reports/financial/sub-ledger/print',
    name: 'SubLedgerPrint', // يمكنك تعديله إلى PrintSummary إذا كنت توحد اسم شاشات الطباعة
    component: () => import('@/views/reports/financial/SubLedgerPrint.vue'),
    meta: {
      requiresAuth: true,
      title: 'طباعة كشف الحساب المساعد',
    },
  },

  // جدار الحماية ضد أي مسارات عشوائية أو غير معرفة
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- حارس التنقل العام والمحمي (Global Navigation Guard) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // التحقق الفوري ما إذا كانت الصفحة تتطلب تسجيل دخول
  if (to.meta.requiresAuth) {
    if (!authStore.token) {
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      // فحص الصلاحيات من خلال الدالة المعرفة بـ Spatie في الـ store
      if (
        requiredPermission &&
        typeof authStore.can === 'function' &&
        !authStore.can(requiredPermission)
      ) {
        console.warn(
          `Access denied: route "${String(to.name)}" requires permission "${requiredPermission}"`,
        )
        // إعادة التوجيه التلقائي الآمن إلى لوحة التحكم عند محاولة تخطي جدار الحماية
        next({ name: 'Dashboard' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
