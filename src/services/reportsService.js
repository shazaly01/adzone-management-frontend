import apiClient from './apiClient' // المسار النسبي الصحيح والمجرب في مشروعك

const prefix = '/reports'

export default {
  // --- تقارير المخازن والمستودعات ---
  getCurrentStock(filters = {}) {
    return apiClient.get(`${prefix}/inventory/current-stock`, { params: filters })
  },

  getStockCard(filters = {}) {
    return apiClient.get(`${prefix}/inventory/stock-card`, { params: filters })
  },

  getStockValuation(filters = {}) {
    return apiClient.get(`${prefix}/inventory/valuation`, { params: filters })
  },

  getAdjustmentsSummary(filters = {}) {
    return apiClient.get(`${prefix}/inventory/adjustments-summary`, { params: filters })
  },

  // --- التقارير المالية والمحاسبية ---
  getAccountLedger(filters = {}) {
    return apiClient.get(`${prefix}/financial/account-ledger`, { params: filters })
  },

  getSubLedger(filters = {}) {
    return apiClient.get(`${prefix}/financial/sub-ledger`, { params: filters })
  },

  getTrialBalance(filters = {}) {
    return apiClient.get(`${prefix}/financial/trial-balance`, { params: filters })
  },

  getIncomeStatement(filters = {}) {
    return apiClient.get(`${prefix}/financial/income-statement`, { params: filters })
  },

  getBalanceSheet(filters = {}) {
    return apiClient.get(`${prefix}/financial/balance-sheet`, { params: filters })
  },

  // --- قوائم المساعدة والتصفية (Lookups) لخدمة التقارير الشاملة ---
  getItems() {
    return apiClient.get('/items')
  },

  getStores() {
    return apiClient.get('/stores')
  },

  getAccounts() {
    return apiClient.get('/accounts')
  },

  getCustomers() {
    return apiClient.get('/customers')
  },

  getSuppliers() {
    return apiClient.get('/suppliers')
  },

  getBanks() {
    return apiClient.get('/banks')
  },
}
