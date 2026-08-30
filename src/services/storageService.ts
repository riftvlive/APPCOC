import {
  Farm,
  PoultryCycle,
  FeedPurchase,
  MedicationPurchase,
  Expense,
  WholesaleSale,
  Partner,
  Worker,
  WorkerTransaction,
  CashAccount,
  FinancialTransaction,
  DailyLog,
  AuditLogEntry,
  AppNotification,
  User,
  CycleFinancialSummary
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FARMS,
  INITIAL_CYCLES,
  INITIAL_DAILY_LOGS,
  INITIAL_PARTNERS,
  INITIAL_ACCOUNTS,
  INITIAL_WORKERS,
  INITIAL_WORKER_TRANSACTIONS,
  INITIAL_FEED_PURCHASES,
  INITIAL_MEDICATION_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_SALES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'poultry_erp_users_v1',
  FARMS: 'poultry_erp_farms_v1',
  CYCLES: 'poultry_erp_cycles_v1',
  DAILY_LOGS: 'poultry_erp_daily_logs_v1',
  PARTNERS: 'poultry_erp_partners_v1',
  ACCOUNTS: 'poultry_erp_accounts_v1',
  WORKERS: 'poultry_erp_workers_v1',
  WORKER_TRANSACTIONS: 'poultry_erp_worker_txs_v1',
  FEED_PURCHASES: 'poultry_erp_feed_purchases_v1',
  MED_PURCHASES: 'poultry_erp_med_purchases_v1',
  EXPENSES: 'poultry_erp_expenses_v1',
  SALES: 'poultry_erp_sales_v1',
  TRANSACTIONS: 'poultry_erp_transactions_v1',
  NOTIFICATIONS: 'poultry_erp_notifications_v1',
  AUDIT_LOGS: 'poultry_erp_audit_logs_v1',
  SYNC_QUEUE: 'poultry_erp_sync_queue_v1',
  CURRENT_USER: 'poultry_erp_current_user_v1',
  LANGUAGE: 'poultry_erp_language_v1',
  THEME: 'poultry_erp_theme_v1'
};

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // Loaders with default initialization
  static getUsers(): User[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  static saveUsers(data: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, data);
  }

  static getFarms(): Farm[] {
    return this.getItem(STORAGE_KEYS.FARMS, INITIAL_FARMS);
  }
  static saveFarms(data: Farm[]): void {
    this.setItem(STORAGE_KEYS.FARMS, data);
  }

  static getCycles(): PoultryCycle[] {
    return this.getItem(STORAGE_KEYS.CYCLES, INITIAL_CYCLES);
  }
  static saveCycles(data: PoultryCycle[]): void {
    this.setItem(STORAGE_KEYS.CYCLES, data);
  }

  static getDailyLogs(): DailyLog[] {
    return this.getItem(STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
  }
  static saveDailyLogs(data: DailyLog[]): void {
    this.setItem(STORAGE_KEYS.DAILY_LOGS, data);
  }

  static getPartners(): Partner[] {
    return this.getItem(STORAGE_KEYS.PARTNERS, INITIAL_PARTNERS);
  }
  static savePartners(data: Partner[]): void {
    this.setItem(STORAGE_KEYS.PARTNERS, data);
  }

  static getAccounts(): CashAccount[] {
    return this.getItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  }
  static saveAccounts(data: CashAccount[]): void {
    this.setItem(STORAGE_KEYS.ACCOUNTS, data);
  }

  static getWorkers(): Worker[] {
    return this.getItem(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
  }
  static saveWorkers(data: Worker[]): void {
    this.setItem(STORAGE_KEYS.WORKERS, data);
  }

  static getWorkerTransactions(): WorkerTransaction[] {
    return this.getItem(STORAGE_KEYS.WORKER_TRANSACTIONS, INITIAL_WORKER_TRANSACTIONS);
  }
  static saveWorkerTransactions(data: WorkerTransaction[]): void {
    this.setItem(STORAGE_KEYS.WORKER_TRANSACTIONS, data);
  }

  static getFeedPurchases(): FeedPurchase[] {
    return this.getItem(STORAGE_KEYS.FEED_PURCHASES, INITIAL_FEED_PURCHASES);
  }
  static saveFeedPurchases(data: FeedPurchase[]): void {
    this.setItem(STORAGE_KEYS.FEED_PURCHASES, data);
  }

  static getMedicationPurchases(): MedicationPurchase[] {
    return this.getItem(STORAGE_KEYS.MED_PURCHASES, INITIAL_MEDICATION_PURCHASES);
  }
  static saveMedicationPurchases(data: MedicationPurchase[]): void {
    this.setItem(STORAGE_KEYS.MED_PURCHASES, data);
  }

  static getExpenses(): Expense[] {
    return this.getItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }
  static saveExpenses(data: Expense[]): void {
    this.setItem(STORAGE_KEYS.EXPENSES, data);
  }

  static getSales(): WholesaleSale[] {
    return this.getItem(STORAGE_KEYS.SALES, INITIAL_SALES);
  }
  static saveSales(data: WholesaleSale[]): void {
    this.setItem(STORAGE_KEYS.SALES, data);
  }

  static getTransactions(): FinancialTransaction[] {
    return this.getItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  static saveTransactions(data: FinancialTransaction[]): void {
    this.setItem(STORAGE_KEYS.TRANSACTIONS, data);
  }

  static getNotifications(): AppNotification[] {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  static saveNotifications(data: AppNotification[]): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, data);
  }

  static getAuditLogs(): AuditLogEntry[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  static saveAuditLogs(data: AuditLogEntry[]): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, data);
  }

  static logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.saveAuditLogs([newEntry, ...logs].slice(0, 500)); // keep last 500
  }

  // Backup & Restore
  static exportFullBackup(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      farms: this.getFarms(),
      cycles: this.getCycles(),
      dailyLogs: this.getDailyLogs(),
      partners: this.getPartners(),
      accounts: this.getAccounts(),
      workers: this.getWorkers(),
      workerTransactions: this.getWorkerTransactions(),
      feedPurchases: this.getFeedPurchases(),
      medicationPurchases: this.getMedicationPurchases(),
      expenses: this.getExpenses(),
      sales: this.getSales(),
      transactions: this.getTransactions(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(data, null, 2);
  }

  static importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.farms) this.saveFarms(data.farms);
      if (data.cycles) this.saveCycles(data.cycles);
      if (data.dailyLogs) this.saveDailyLogs(data.dailyLogs);
      if (data.partners) this.savePartners(data.partners);
      if (data.accounts) this.saveAccounts(data.accounts);
      if (data.workers) this.saveWorkers(data.workers);
      if (data.workerTransactions) this.saveWorkerTransactions(data.workerTransactions);
      if (data.feedPurchases) this.saveFeedPurchases(data.feedPurchases);
      if (data.medicationPurchases) this.saveMedicationPurchases(data.medicationPurchases);
      if (data.expenses) this.saveExpenses(data.expenses);
      if (data.sales) this.saveSales(data.sales);
      if (data.transactions) this.saveTransactions(data.transactions);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  static resetToDemoData(): void {
    localStorage.clear();
    this.saveUsers(INITIAL_USERS);
    this.saveFarms(INITIAL_FARMS);
    this.saveCycles(INITIAL_CYCLES);
    this.saveDailyLogs(INITIAL_DAILY_LOGS);
    this.savePartners(INITIAL_PARTNERS);
    this.saveAccounts(INITIAL_ACCOUNTS);
    this.saveWorkers(INITIAL_WORKERS);
    this.saveWorkerTransactions(INITIAL_WORKER_TRANSACTIONS);
    this.saveFeedPurchases(INITIAL_FEED_PURCHASES);
    this.saveMedicationPurchases(INITIAL_MEDICATION_PURCHASES);
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveSales(INITIAL_SALES);
    this.saveTransactions(INITIAL_TRANSACTIONS);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
  }

  // Real Dynamic Calculations
  static calculateAccountBalances(): Record<string, number> {
    const accounts = this.getAccounts();
    const txs = this.getTransactions();
    const balances: Record<string, number> = {};

    accounts.forEach(acc => {
      balances[acc.id] = acc.openingBalance || 0;
    });

    txs.forEach(tx => {
      if (balances[tx.accountId] !== undefined) {
        if (tx.type === 'income' || tx.type === 'customer_payment' || tx.type === 'refund') {
          balances[tx.accountId] += tx.amount;
        } else if (tx.type === 'expense' || tx.type === 'supplier_payment' || tx.type === 'worker_salary' || tx.type === 'worker_loan') {
          balances[tx.accountId] -= tx.amount;
        } else if (tx.type === 'account_transfer') {
          balances[tx.accountId] -= tx.amount;
          if (tx.targetAccountId && balances[tx.targetAccountId] !== undefined) {
            balances[tx.targetAccountId] += tx.amount;
          }
        }
      }
    });

    return balances;
  }

  static calculatePartnerBalances(): {
    customerReceivables: Record<string, { totalSales: number; totalPaid: number; remainingDue: number }>;
    supplierPayables: Record<string, { totalPurchases: number; totalPaid: number; remainingDebt: number }>;
    totalReceivables: number;
    totalPayables: number;
  } {
    const partners = this.getPartners();
    const sales = this.getSales();
    const feeds = this.getFeedPurchases();
    const meds = this.getMedicationPurchases();
    const expenses = this.getExpenses();
    const txs = this.getTransactions();

    const customerMap: Record<string, { totalSales: number; totalPaid: number; remainingDue: number }> = {};
    const supplierMap: Record<string, { totalPurchases: number; totalPaid: number; remainingDebt: number }> = {};

    partners.forEach(p => {
      if (p.type === 'customer' || p.type === 'both') {
        customerMap[p.id] = { totalSales: 0, totalPaid: 0, remainingDue: p.openingBalance > 0 ? p.openingBalance : 0 };
      }
      if (p.type === 'supplier' || p.type === 'both') {
        supplierMap[p.id] = { totalPurchases: 0, totalPaid: 0, remainingDebt: p.openingBalance < 0 ? Math.abs(p.openingBalance) : 0 };
      }
    });

    // Sales to customers
    sales.forEach(s => {
      if (!customerMap[s.customerId]) {
        customerMap[s.customerId] = { totalSales: 0, totalPaid: 0, remainingDue: 0 };
      }
      customerMap[s.customerId].totalSales += s.netTotal;
      customerMap[s.customerId].totalPaid += s.paidAmount;
      customerMap[s.customerId].remainingDue += s.remainingAmount;
    });

    // Extra customer payments from transactions (debt settlement)
    txs.filter(t => t.type === 'customer_payment' && t.referenceType === 'debt_payment' && t.partnerId).forEach(t => {
      if (customerMap[t.partnerId!]) {
        customerMap[t.partnerId!].totalPaid += t.amount;
        customerMap[t.partnerId!].remainingDue -= t.amount;
      }
    });

    // Feed purchases from suppliers
    feeds.forEach(f => {
      if (!supplierMap[f.supplierId]) {
        supplierMap[f.supplierId] = { totalPurchases: 0, totalPaid: 0, remainingDebt: 0 };
      }
      supplierMap[f.supplierId].totalPurchases += f.totalAmount;
      supplierMap[f.supplierId].totalPaid += f.paidAmount;
      supplierMap[f.supplierId].remainingDebt += f.remainingAmount;
    });

    // Med purchases
    meds.forEach(m => {
      if (!supplierMap[m.supplierId]) {
        supplierMap[m.supplierId] = { totalPurchases: 0, totalPaid: 0, remainingDebt: 0 };
      }
      supplierMap[m.supplierId].totalPurchases += m.totalAmount;
      supplierMap[m.supplierId].totalPaid += m.paidAmount;
      supplierMap[m.supplierId].remainingDebt += m.remainingAmount;
    });

    // Other expenses from suppliers
    expenses.filter(e => e.supplierId).forEach(e => {
      const sId = e.supplierId!;
      if (!supplierMap[sId]) {
        supplierMap[sId] = { totalPurchases: 0, totalPaid: 0, remainingDebt: 0 };
      }
      supplierMap[sId].totalPurchases += e.amount;
      supplierMap[sId].totalPaid += e.paidAmount;
      supplierMap[sId].remainingDebt += e.remainingAmount;
    });

    // Extra supplier payments from transactions
    txs.filter(t => t.type === 'supplier_payment' && t.referenceType === 'debt_payment' && t.partnerId).forEach(t => {
      if (supplierMap[t.partnerId!]) {
        supplierMap[t.partnerId!].totalPaid += t.amount;
        supplierMap[t.partnerId!].remainingDebt -= t.amount;
      }
    });

    let totalReceivables = 0;
    Object.values(customerMap).forEach(c => {
      if (c.remainingDue > 0) totalReceivables += c.remainingDue;
    });

    let totalPayables = 0;
    Object.values(supplierMap).forEach(s => {
      if (s.remainingDebt > 0) totalPayables += s.remainingDebt;
    });

    return {
      customerReceivables: customerMap,
      supplierPayables: supplierMap,
      totalReceivables,
      totalPayables
    };
  }

  // Calculate detailed financial breakdown for any poultry cycle
  static calculateCycleSummary(cycleId: string): CycleFinancialSummary {
    const cycles = this.getCycles();
    const farms = this.getFarms();
    const cycle = cycles.find(c => c.id === cycleId);
    const farm = farms.find(f => f.id === (cycle?.farmId || ''));

    if (!cycle) {
      throw new Error(`Cycle not found: ${cycleId}`);
    }

    const feeds = this.getFeedPurchases().filter(f => f.cycleId === cycleId);
    const meds = this.getMedicationPurchases().filter(m => m.cycleId === cycleId);
    const expenses = this.getExpenses().filter(e => e.cycleId === cycleId);
    const sales = this.getSales().filter(s => s.cycleId === cycleId);
    const dailyLogs = this.getDailyLogs().filter(l => l.cycleId === cycleId);
    const workerTxs = this.getWorkerTransactions().filter(w => w.cycleId === cycleId);

    // Duration
    const start = new Date(cycle.startDate);
    const end = cycle.actualSaleDate ? new Date(cycle.actualSaleDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Mortality
    const loggedMortality = dailyLogs.reduce((sum, l) => sum + (l.mortalityCount || 0), 0);
    const totalMortality = loggedMortality;
    const mortalityRatePercent = cycle.initialChickCount > 0 ? (totalMortality / cycle.initialChickCount) * 100 : 0;

    // Sales stats
    const totalSoldChicks = sales.reduce((sum, s) => sum + s.chickenCount, 0);
    const totalWeightSoldKg = sales.reduce((sum, s) => sum + s.totalWeightKg, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.netTotal, 0);
    const collectedRevenue = sales.reduce((sum, s) => sum + s.paidAmount, 0);
    const uncollectedReceivables = sales.reduce((sum, s) => sum + s.remainingAmount, 0);
    const averageBirdWeightKg = totalSoldChicks > 0 ? totalWeightSoldKg / totalSoldChicks : (cycle.targetWeightKg || 2.2);
    const averageSellingPricePerKg = totalWeightSoldKg > 0 ? totalRevenue / totalWeightSoldKg : 0;

    const remainingLiveChicks = Math.max(0, cycle.initialChickCount - totalMortality - totalSoldChicks);

    // Chicks Cost
    const chicksExp = expenses.filter(e => e.category === 'chicks');
    const chicksCost = chicksExp.reduce((sum, e) => sum + e.amount, 0) || (cycle.initialChickCount * cycle.chickUnitPrice);

    // Feed stats
    const totalFeedKg = feeds.reduce((sum, f) => sum + f.quantityKg, 0);
    const totalFeedCost = feeds.reduce((sum, f) => sum + f.totalAmount, 0);
    const feedCostPerBird = cycle.initialChickCount > 0 ? totalFeedCost / cycle.initialChickCount : 0;
    const fcr = totalWeightSoldKg > 0 ? totalFeedKg / totalWeightSoldKg : 0;

    // Meds stats
    const totalMedicationCost = meds.reduce((sum, m) => sum + m.totalAmount, 0);
    const medicationCostPerBird = cycle.initialChickCount > 0 ? totalMedicationCost / cycle.initialChickCount : 0;

    // Labor & Utilities
    const totalLaborCost = workerTxs.filter(w => w.type === 'salary' || w.type === 'bonus').reduce((sum, w) => sum + w.amount, 0)
      + expenses.filter(e => e.category === 'labor').reduce((sum, e) => sum + e.amount, 0);

    const totalUtilitiesCost = expenses
      .filter(e => ['electricity', 'water', 'fuel', 'gas'].includes(e.category as string))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalOtherExpenses = expenses
      .filter(e => !['chicks', 'labor', 'electricity', 'water', 'fuel', 'gas'].includes(e.category as string))
      .reduce((sum, e) => sum + e.amount, 0);

    // Total Cost
    const totalCycleCost = chicksCost + totalFeedCost + totalMedicationCost + totalLaborCost + totalUtilitiesCost + totalOtherExpenses;

    const effectiveBirdsCount = totalSoldChicks > 0 ? totalSoldChicks : (cycle.initialChickCount - totalMortality);
    const costPerLiveBird = effectiveBirdsCount > 0 ? totalCycleCost / effectiveBirdsCount : 0;
    const effectiveWeightKg = totalWeightSoldKg > 0 ? totalWeightSoldKg : (effectiveBirdsCount * (cycle.targetWeightKg || 2.2));
    const costPerKg = effectiveWeightKg > 0 ? totalCycleCost / effectiveWeightKg : 0;

    // Net Profit
    const netProfit = totalRevenue - totalCycleCost;
    const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const profitPerBird = totalSoldChicks > 0 ? netProfit / totalSoldChicks : 0;
    const profitPerKg = totalWeightSoldKg > 0 ? netProfit / totalWeightSoldKg : 0;

    return {
      cycleId,
      cycleNumber: cycle.cycleNumber,
      farmName: farm?.name || 'مزرعة غير محددة',
      startDate: cycle.startDate,
      endDate: cycle.actualSaleDate || cycle.expectedSaleDate,
      durationDays,
      status: cycle.status,
      initialChicks: cycle.initialChickCount,
      chicksCost,
      totalMortality,
      mortalityRatePercent,
      totalSoldChicks,
      remainingLiveChicks,
      totalWeightSoldKg,
      averageBirdWeightKg,
      totalFeedKg,
      totalFeedCost,
      feedCostPerBird,
      fcr,
      totalMedicationCost,
      medicationCostPerBird,
      totalLaborCost,
      totalUtilitiesCost,
      totalOtherExpenses,
      totalCycleCost,
      costPerLiveBird,
      costPerKg,
      totalRevenue,
      averageSellingPricePerKg,
      netProfit,
      profitMarginPercent,
      profitPerBird,
      profitPerKg,
      collectedRevenue,
      uncollectedReceivables
    };
  }
}
