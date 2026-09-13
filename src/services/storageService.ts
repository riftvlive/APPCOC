import {
  Farm,
  PoultryCycle,
  ChickPurchase,
  ChickSale,
  FeedPurchase,
  FeedSale,
  FeedStockMovement,
  MedicationPurchase,
  MedicationStockMovement,
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
  CycleFinancialSummary,
  BackupSnapshot,
  AutoBackupSettings,
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
  INITIAL_CHICK_PURCHASES,
  INITIAL_FEED_PURCHASES,
  INITIAL_MEDICATION_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_SALES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { generateComprehensiveData } from '../data/demoDataGenerator';

const STORAGE_KEYS = {
  USERS: 'poultry_erp_users_v1',
  FARMS: 'poultry_erp_farms_v1',
  CYCLES: 'poultry_erp_cycles_v1',
  DAILY_LOGS: 'poultry_erp_daily_logs_v1',
  PARTNERS: 'poultry_erp_partners_v1',
  ACCOUNTS: 'poultry_erp_accounts_v1',
  WORKERS: 'poultry_erp_workers_v1',
  WORKER_TRANSACTIONS: 'poultry_erp_worker_txs_v1',
  CHICK_PURCHASES: 'poultry_erp_chick_purchases_v1',
  FEED_PURCHASES: 'poultry_erp_feed_purchases_v1',
  FEED_MOVEMENTS: 'poultry_erp_feed_movements_v1',
  MED_PURCHASES: 'poultry_erp_med_purchases_v1',
  MED_MOVEMENTS: 'poultry_erp_med_movements_v1',
  EXPENSES: 'poultry_erp_expenses_v1',
  SALES: 'poultry_erp_sales_v1',
  FEED_SALES: 'poultry_erp_feed_sales_v1',
  CHICK_SALES: 'poultry_erp_chick_sales_v1',
  TRANSACTIONS: 'poultry_erp_transactions_v1',
  NOTIFICATIONS: 'poultry_erp_notifications_v1',
  AUDIT_LOGS: 'poultry_erp_audit_logs_v1',
  SYNC_QUEUE: 'poultry_erp_sync_queue_v1',
  CURRENT_USER: 'poultry_erp_current_user_v1',
  LANGUAGE: 'poultry_erp_language_v1',
  THEME: 'poultry_erp_theme_v1',
  AUTO_BACKUP_SETTINGS: 'poultry_erp_auto_backup_settings_v1',
  BACKUP_SNAPSHOTS: 'poultry_erp_backup_snapshots_v1'
};

const REMOTE_TO_STORAGE: Record<string, string> = {
  users: STORAGE_KEYS.USERS,
  farms: STORAGE_KEYS.FARMS,
  cycles: STORAGE_KEYS.CYCLES,
  dailyLogs: STORAGE_KEYS.DAILY_LOGS,
  partners: STORAGE_KEYS.PARTNERS,
  accounts: STORAGE_KEYS.ACCOUNTS,
  workers: STORAGE_KEYS.WORKERS,
  workerTransactions: STORAGE_KEYS.WORKER_TRANSACTIONS,
  chickPurchases: STORAGE_KEYS.CHICK_PURCHASES,
  feedPurchases: STORAGE_KEYS.FEED_PURCHASES,
  feedMovements: STORAGE_KEYS.FEED_MOVEMENTS,
  medicationPurchases: STORAGE_KEYS.MED_PURCHASES,
  medicationMovements: STORAGE_KEYS.MED_MOVEMENTS,
  expenses: STORAGE_KEYS.EXPENSES,
  sales: STORAGE_KEYS.SALES,
  feedSales: STORAGE_KEYS.FEED_SALES,
  chickSales: STORAGE_KEYS.CHICK_SALES,
  transactions: STORAGE_KEYS.TRANSACTIONS,
  notifications: STORAGE_KEYS.NOTIFICATIONS,
  auditLogs: STORAGE_KEYS.AUDIT_LOGS,
  backupSnapshots: STORAGE_KEYS.BACKUP_SNAPSHOTS,
  autoBackupSettings: STORAGE_KEYS.AUTO_BACKUP_SETTINGS,
};

const DEFAULT_AUTO_BACKUP_SETTINGS: AutoBackupSettings = {
  enabled: true,
  intervalMinutes: 60,
  backupOnCriticalAction: true,
  maxSnapshotsToKeep: 10,
  lastBackupTimestamp: new Date().toISOString()
};

export class StorageService {
  private static emitSaveStatus(status: 'success' | 'error', key: string, remote = false): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('poultry:save-status', { detail: { status, key, remote } }));
    }
  }

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
      this.emitSaveStatus('success', key);
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
      this.emitSaveStatus('error', key);
      return;
    }

    const remoteKey = Object.entries(REMOTE_TO_STORAGE).find(([, storageKey]) => storageKey === key)?.[0];
    if (remoteKey && navigator.onLine) {
      fetch(`/api/state/${remoteKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: value }),
      }).then(response => {
        if (!response.ok) {
          console.error(`Remote save rejected for ${remoteKey}: ${response.status}`);
          this.emitSaveStatus('error', remoteKey, true);
          return;
        }
        this.emitSaveStatus('success', remoteKey, true);
      }).catch(error => {
        console.error(`Remote save failed for ${remoteKey}:`, error);
        this.emitSaveStatus('error', remoteKey, true);
      });
    }
  }

  static async hydrateFromRemote(): Promise<boolean> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/api/state', { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) return false;
      const remote = await response.json() as Record<string, unknown>;
      for (const [remoteKey, storageKey] of Object.entries(REMOTE_TO_STORAGE)) {
        if (remote[remoteKey] !== undefined) localStorage.setItem(storageKey, JSON.stringify(remote[remoteKey]));
      }
      return true;
    } catch (error) {
      console.warn('Remote database unavailable; using local cache.', error);
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  static async syncAllToRemote(): Promise<number> {
    const changes = Object.entries(REMOTE_TO_STORAGE).map(([key, storageKey]) => ({
      key,
      data: JSON.parse(localStorage.getItem(storageKey) || (key === 'autoBackupSettings' ? JSON.stringify(DEFAULT_AUTO_BACKUP_SETTINGS) : '[]'))
    }));
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localChanges: changes })
    });
    if (!response.ok) throw new Error('تعذر حفظ المزامنة');
    const result = await response.json() as { appliedRecords?: number };
    return result.appliedRecords || 0;
  }

  // Loaders with default initialization
  static getUsers(): User[] {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const updated = users.map(u => {
      const init = INITIAL_USERS.find(iu => iu.phone === u.phone || iu.id === u.id);
      if (init) {
        return {
          ...u,
          pin: u.pin || init.pin,
          role: u.role || init.role,
          status: u.status || init.status || 'active'
        };
      }
      return u;
    });
    for (const initUser of INITIAL_USERS) {
      if (!updated.some(u => u.phone === initUser.phone || u.id === initUser.id)) {
        updated.push(initUser);
      }
    }
    return updated;
  }
  static saveUsers(data: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, data);
  }

  static getFarms(): Farm[] {
    const data = this.getItem<Farm[]>(STORAGE_KEYS.FARMS, []);
    return data && data.length > 0 ? data : INITIAL_FARMS;
  }
  static saveFarms(data: Farm[]): void {
    this.setItem(STORAGE_KEYS.FARMS, data);
  }

  static getCycles(): PoultryCycle[] {
    const data = this.getItem<PoultryCycle[]>(STORAGE_KEYS.CYCLES, []);
    return data && data.length > 0 ? data : INITIAL_CYCLES;
  }
  static saveCycles(data: PoultryCycle[]): void {
    this.setItem(STORAGE_KEYS.CYCLES, data);
  }

  static getDailyLogs(): DailyLog[] {
    const data = this.getItem<DailyLog[]>(STORAGE_KEYS.DAILY_LOGS, []);
    return data && data.length > 0 ? data : INITIAL_DAILY_LOGS;
  }
  static saveDailyLogs(data: DailyLog[]): void {
    this.setItem(STORAGE_KEYS.DAILY_LOGS, data);
  }

  static getPartners(): Partner[] {
    const data = this.getItem<Partner[]>(STORAGE_KEYS.PARTNERS, []);
    return data && data.length > 0 ? data : INITIAL_PARTNERS;
  }
  static savePartners(data: Partner[]): void {
    this.setItem(STORAGE_KEYS.PARTNERS, data);
  }

  static getAccounts(): CashAccount[] {
    const data = this.getItem<CashAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
    return data && data.length > 0 ? data : INITIAL_ACCOUNTS;
  }
  static saveAccounts(data: CashAccount[]): void {
    this.setItem(STORAGE_KEYS.ACCOUNTS, data);
  }

  static getWorkers(): Worker[] {
    const data = this.getItem<Worker[]>(STORAGE_KEYS.WORKERS, []);
    return data && data.length > 0 ? data : INITIAL_WORKERS;
  }
  static saveWorkers(data: Worker[]): void {
    this.setItem(STORAGE_KEYS.WORKERS, data);
  }

  static getWorkerTransactions(): WorkerTransaction[] {
    const data = this.getItem<WorkerTransaction[]>(STORAGE_KEYS.WORKER_TRANSACTIONS, []);
    return data && data.length > 0 ? data : INITIAL_WORKER_TRANSACTIONS;
  }
  static saveWorkerTransactions(data: WorkerTransaction[]): void {
    this.setItem(STORAGE_KEYS.WORKER_TRANSACTIONS, data);
  }

  static getChickPurchases(): ChickPurchase[] {
    const data = this.getItem<ChickPurchase[]>(STORAGE_KEYS.CHICK_PURCHASES, []);
    return data && data.length > 0 ? data : INITIAL_CHICK_PURCHASES;
  }
  static saveChickPurchases(data: ChickPurchase[]): void {
    this.setItem(STORAGE_KEYS.CHICK_PURCHASES, data);
  }

  static getFeedPurchases(): FeedPurchase[] {
    const data = this.getItem<FeedPurchase[]>(STORAGE_KEYS.FEED_PURCHASES, []);
    return data && data.length > 0 ? data : INITIAL_FEED_PURCHASES;
  }
  static saveFeedPurchases(data: FeedPurchase[]): void {
    this.setItem(STORAGE_KEYS.FEED_PURCHASES, data);
  }

  static getFeedMovements(): FeedStockMovement[] {
    return this.getItem(STORAGE_KEYS.FEED_MOVEMENTS, []);
  }
  static saveFeedMovements(data: FeedStockMovement[]): void {
    this.setItem(STORAGE_KEYS.FEED_MOVEMENTS, data);
  }

  static getMedicationPurchases(): MedicationPurchase[] {
    const data = this.getItem<MedicationPurchase[]>(STORAGE_KEYS.MED_PURCHASES, []);
    return data && data.length > 0 ? data : INITIAL_MEDICATION_PURCHASES;
  }
  static saveMedicationPurchases(data: MedicationPurchase[]): void {
    this.setItem(STORAGE_KEYS.MED_PURCHASES, data);
  }

  static getMedicationMovements(): MedicationStockMovement[] {
    return this.getItem(STORAGE_KEYS.MED_MOVEMENTS, []);
  }
  static saveMedicationMovements(data: MedicationStockMovement[]): void {
    this.setItem(STORAGE_KEYS.MED_MOVEMENTS, data);
  }


  static getExpenses(): Expense[] {
    const data = this.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    return data && data.length > 0 ? data : INITIAL_EXPENSES;
  }
  static saveExpenses(data: Expense[]): void {
    this.setItem(STORAGE_KEYS.EXPENSES, data);
  }

  static getSales(): WholesaleSale[] {
    const data = this.getItem<WholesaleSale[]>(STORAGE_KEYS.SALES, []);
    return data && data.length > 0 ? data : INITIAL_SALES;
  }
  static saveSales(data: WholesaleSale[]): void {
    this.setItem(STORAGE_KEYS.SALES, data);
  }

  static getFeedSales(): FeedSale[] {
    return this.getItem(STORAGE_KEYS.FEED_SALES, []);
  }
  static saveFeedSales(data: FeedSale[]): void {
    this.setItem(STORAGE_KEYS.FEED_SALES, data);
  }

  static getChickSales(): ChickSale[] {
    return this.getItem(STORAGE_KEYS.CHICK_SALES, []);
  }
  static saveChickSales(data: ChickSale[]): void {
    this.setItem(STORAGE_KEYS.CHICK_SALES, data);
  }

  static getTransactions(): FinancialTransaction[] {
    const data = this.getItem<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return data && data.length > 0 ? data : INITIAL_TRANSACTIONS;
  }
  static saveTransactions(data: FinancialTransaction[]): void {
    this.setItem(STORAGE_KEYS.TRANSACTIONS, data);
  }

  static getNotifications(): AppNotification[] {
    const data = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return data && data.length > 0 ? data : INITIAL_NOTIFICATIONS;
  }
  static saveNotifications(data: AppNotification[]): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, data);
  }

  static getAuditLogs(): AuditLogEntry[] {
    const data = this.getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    return data && data.length > 0 ? data : INITIAL_AUDIT_LOGS;
  }
  static saveAuditLogs(data: AuditLogEntry[]): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, data);
  }

  // Auto-Backup Settings & Snapshots
  static getAutoBackupSettings(): AutoBackupSettings {
    return this.getItem(STORAGE_KEYS.AUTO_BACKUP_SETTINGS, DEFAULT_AUTO_BACKUP_SETTINGS);
  }
  static saveAutoBackupSettings(settings: AutoBackupSettings): void {
    this.setItem(STORAGE_KEYS.AUTO_BACKUP_SETTINGS, settings);
  }

  static getBackupSnapshots(): BackupSnapshot[] {
    return this.getItem<BackupSnapshot[]>(STORAGE_KEYS.BACKUP_SNAPSHOTS, []);
  }
  static saveBackupSnapshots(snapshots: BackupSnapshot[]): void {
    this.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, snapshots);
  }

  static createBackupSnapshot(
    trigger: 'auto_interval' | 'auto_action' | 'manual' | 'pre_restore' = 'manual',
    customDescription?: string
  ): BackupSnapshot {
    const rawJson = this.exportFullBackup();
    const farms = this.getFarms();
    const cycles = this.getCycles();
    const dailyLogs = this.getDailyLogs();
    const transactions = this.getTransactions();
    const sales = this.getSales();
    const feeds = this.getFeedPurchases();
    const auditLogs = this.getAuditLogs();

    let desc = customDescription;
    if (!desc) {
      if (trigger === 'manual') desc = 'نسخة احتياطية يدوية كاملة';
      else if (trigger === 'auto_interval') desc = 'نسخة احتياطية تلقائية دورية';
      else if (trigger === 'auto_action') desc = 'نسخة احتياطية تلقائية بعد تعديل مالي/إنتاجي مهم';
      else if (trigger === 'pre_restore') desc = 'نسخة أمان تم إنشاؤها تلقائياً قبل الاسترجاع';
    }

    const newSnapshot: BackupSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      trigger,
      description: desc || 'نسخة احتياطية',
      recordStats: {
        farms: farms.length,
        cycles: cycles.length,
        dailyLogs: dailyLogs.length,
        transactions: transactions.length,
        sales: sales.length,
        feeds: feeds.length,
        auditLogs: auditLogs.length
      },
      sizeBytes: new Blob([rawJson]).size,
      dataJson: rawJson
    };

    const settings = this.getAutoBackupSettings();
    const existing = this.getBackupSnapshots();
    const maxKeep = settings.maxSnapshotsToKeep || 10;
    const updated = [newSnapshot, ...existing].slice(0, maxKeep);
    this.saveBackupSnapshots(updated);

    // Update last backup timestamp
    this.saveAutoBackupSettings({
      ...settings,
      lastBackupTimestamp: newSnapshot.timestamp
    });

    return newSnapshot;
  }

  static restoreFromSnapshot(snapshotId: string): boolean {
    try {
      const snapshots = this.getBackupSnapshots();
      const target = snapshots.find(s => s.id === snapshotId);
      if (!target || !target.dataJson) return false;

      // Save a pre-restore backup first just in case
      this.createBackupSnapshot('pre_restore', `نسخة أمان قبل استرجاع النسخة المؤرخة في (${new Date(target.timestamp).toLocaleString('ar-MA')})`);

      return this.importFullBackup(target.dataJson);
    } catch (e) {
      console.error('Failed to restore snapshot:', e);
      return false;
    }
  }

  static deleteSnapshot(snapshotId: string): void {
    const snapshots = this.getBackupSnapshots();
    this.saveBackupSnapshots(snapshots.filter(s => s.id !== snapshotId));
  }

  static checkAndRunAutoBackup(): BackupSnapshot | null {
    const settings = this.getAutoBackupSettings();
    if (!settings.enabled) return null;

    const lastTime = settings.lastBackupTimestamp ? new Date(settings.lastBackupTimestamp).getTime() : 0;
    const now = Date.now();
    const intervalMs = (settings.intervalMinutes || 60) * 60 * 1000;

    if (now - lastTime >= intervalMs) {
      return this.createBackupSnapshot('auto_interval');
    }
    return null;
  }

  static logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    try { localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newEntry, ...logs].slice(0, 500))); } catch (error) { console.error('Local audit save failed:', error); }
    if (navigator.onLine) {
      fetch('/api/audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      }).then(response => {
        if (!response.ok) console.error(`Audit append rejected: ${response.status}`);
      }).catch(error => console.error('Audit append failed:', error));
    }

    // Auto-backup on critical actions if enabled
    const settings = this.getAutoBackupSettings();
    if (settings.enabled && settings.backupOnCriticalAction) {
      const isCritical = ['sale', 'transaction', 'daily_log', 'cycle', 'worker_transaction'].includes(entry.entityType || entry.entity || '');
      if (isCritical) {
        // Trigger auto backup snapshot in background
        setTimeout(() => {
          this.createBackupSnapshot('auto_action', `حفظ تلقائي عند ${entry.action} في ${entry.entityType || entry.entity}`);
        }, 100);
      }
    }
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
      chickPurchases: this.getChickPurchases(),
      feedPurchases: this.getFeedPurchases(),
      feedMovements: this.getFeedMovements(),
      medicationPurchases: this.getMedicationPurchases(),
      medicationMovements: this.getMedicationMovements(),
      expenses: this.getExpenses(),
      sales: this.getSales(),
      transactions: this.getTransactions(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(data, null, 2);
  }

  static exportChickPurchasesCSV(): string {
    const chicks = this.getChickPurchases();
    const farms = this.getFarms();
    const partners = this.getPartners();
    const cycles = this.getCycles();

    const farmMap = new Map(farms.map(f => [f.id, f.name]));
    const partMap = new Map(partners.map(p => [p.id, p.name]));
    const cycleMap = new Map(cycles.map(c => [c.id, c.cycleNumber]));

    const headers = [
      'المعرف',
      'رقم الفاتورة',
      'رقم الشحنة/اللوط',
      'تاريخ الاستلام',
      'المفرخة/المورد',
      'المزرعة',
      'الدورة',
      'السلالة',
      'العدد المطلوب',
      'نسبة الزيادة %',
      'عدد الزيادة',
      'نفوق النقل',
      'العدد الصافي المسلم حياً',
      'سعر الكتكوت (DH)',
      'تكلفة الكتاكيت',
      'تكلفة النقل',
      'المبلغ الإجمالي (DH)',
      'المدفوع (DH)',
      'المتبقي (DH)',
      'طريقة الدفع',
      'متوسط الوزن (غ)',
      'حرارة الصناديق (°م)',
      'مؤشر الجودة',
      'ملاحظات'
    ];

    const rows = chicks.map(c => [
      c.id,
      `"${c.invoiceNumber}"`,
      `"${c.batchNumber || '-'}"`,
      c.date,
      `"${partMap.get(c.supplierId) || c.supplierName || c.supplierId}"`,
      `"${farmMap.get(c.farmId) || c.farmId}"`,
      `"${cycleMap.get(c.cycleId || '') || '-'}"`,
      `"${c.breed}"`,
      c.orderedCount,
      c.bonusPercent || 0,
      c.bonusCount || 0,
      c.transportMortalityCount || 0,
      c.receivedHealthyCount,
      c.unitPrice,
      c.chickCost,
      c.transportCost || 0,
      c.totalAmount,
      c.paidAmount,
      c.remainingAmount,
      c.paymentMethod,
      c.averageWeightGrams || '-',
      c.boxTemperatureCelsius || '-',
      `"${c.qualityScore || 'excellent'}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static exportFinancialCSV(): string {
    const txs = this.getTransactions();
    const accounts = this.getAccounts();
    const partners = this.getPartners();

    const accMap = new Map(accounts.map(a => [a.id, a.name]));
    const partMap = new Map(partners.map(p => [p.id, p.name]));

    const headers = ['المعرف', 'التاريخ', 'النوع', 'الوصف', 'الحساب المالي', 'المبلغ (DH)', 'الطرف/الشريك', 'طريقة الدفع'];
    const rows = txs.map(t => [
      t.id,
      t.date,
      t.type,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${accMap.get(t.accountId) || t.accountId}"`,
      t.amount,
      `"${(t.partnerId ? partMap.get(t.partnerId) || t.partnerId : '-')}"`,
      t.paymentMethod || 'cash'
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static exportProductionCSV(): string {
    const logs = this.getDailyLogs();
    const cycles = this.getCycles();
    const farms = this.getFarms();

    const cycleMap = new Map(cycles.map(c => [c.id, c]));
    const farmMap = new Map(farms.map(f => [f.id, f.name]));

    const headers = ['المعرف', 'التاريخ', 'المزرعة', 'رقم الدورة', 'عمر الطائر (يوم)', 'النفوق (طائر)', 'العلف المستهلك (كغ)', 'الماء المستهلك (لتر)', 'متوسط الوزن (غ)', 'الحرارة (°م)', 'ملاحظات'];
    const rows = logs.map(l => {
      const cycle = cycleMap.get(l.cycleId);
      const farmName = cycle ? farmMap.get(cycle.farmId) || cycle.farmId : '-';
      return [
        l.id,
        l.date,
        `"${farmName}"`,
        cycle?.cycleNumber || '-',
        l.dayNumber || '-',
        l.mortalityCount || 0,
        l.feedConsumedKg || 0,
        l.waterConsumedLiters || 0,
        l.sampleAverageWeightGrams || 0,
        l.temperatureCelsius || '-',
        `"${(l.notes || '').replace(/"/g, '""')}"`
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
      if (data.chickPurchases) this.saveChickPurchases(data.chickPurchases);
      if (data.feedPurchases) this.saveFeedPurchases(data.feedPurchases);
      if (data.feedMovements) this.saveFeedMovements(data.feedMovements);
      if (data.medicationPurchases) this.saveMedicationPurchases(data.medicationPurchases);
      if (data.medicationMovements) this.saveMedicationMovements(data.medicationMovements);
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
    const data = generateComprehensiveData();
    this.saveUsers(data.users);
    this.saveFarms(data.farms);
    this.saveCycles(data.cycles);
    this.saveDailyLogs(data.dailyLogs);
    this.savePartners(data.partners);
    this.saveAccounts(data.accounts);
    this.saveWorkers(data.workers);
    this.saveWorkerTransactions(data.workerTransactions);
    this.saveChickPurchases(data.chickPurchases);
    this.saveFeedPurchases(data.feedPurchases);
    this.saveFeedMovements(data.feedMovements || []);
    this.saveMedicationPurchases(data.medicationPurchases);
    this.saveMedicationMovements(data.medicationMovements || []);
    this.saveExpenses(data.expenses);
    this.saveSales(data.sales);
    this.saveFeedSales(data.feedSales || []);
    this.saveChickSales(data.chickSales || []);
    this.saveTransactions(data.transactions);
    this.saveNotifications(data.notifications);
    this.saveAuditLogs(data.auditLogs);
    this.saveAutoBackupSettings(data.autoBackupSettings);
    this.saveBackupSnapshots(data.backupSnapshots);
    void this.syncAllToRemote();
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
    const feedSales = this.getFeedSales();
    const chickSales = this.getChickSales();
    const chicks = this.getChickPurchases();
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

    // Sales to customers (Wholesale chickens)
    sales.forEach(s => {
      if (!customerMap[s.customerId]) {
        customerMap[s.customerId] = { totalSales: 0, totalPaid: 0, remainingDue: 0 };
      }
      customerMap[s.customerId].totalSales += s.netTotal;
      customerMap[s.customerId].totalPaid += s.paidAmount;
      customerMap[s.customerId].remainingDue += s.remainingAmount;
    });

    // Feed sales to customers
    feedSales.forEach(fs => {
      if (!customerMap[fs.customerId]) {
        customerMap[fs.customerId] = { totalSales: 0, totalPaid: 0, remainingDue: 0 };
      }
      customerMap[fs.customerId].totalSales += fs.totalAmount;
      customerMap[fs.customerId].totalPaid += fs.paidAmount;
      customerMap[fs.customerId].remainingDue += fs.remainingAmount;
    });

    // Chick sales to customers
    chickSales.forEach(cs => {
      if (!customerMap[cs.customerId]) {
        customerMap[cs.customerId] = { totalSales: 0, totalPaid: 0, remainingDue: 0 };
      }
      customerMap[cs.customerId].totalSales += cs.totalAmount;
      customerMap[cs.customerId].totalPaid += cs.paidAmount;
      customerMap[cs.customerId].remainingDue += cs.remainingAmount;
    });

    // Extra customer payments from transactions (debt settlement)
    txs.filter(t => t.type === 'customer_payment' && t.referenceType === 'debt_payment' && t.partnerId).forEach(t => {
      if (customerMap[t.partnerId!]) {
        customerMap[t.partnerId!].totalPaid += t.amount;
        customerMap[t.partnerId!].remainingDue -= t.amount;
      }
    });

    // Chick purchases from hatcheries/suppliers
    chicks.forEach(c => {
      if (!supplierMap[c.supplierId]) {
        supplierMap[c.supplierId] = { totalPurchases: 0, totalPaid: 0, remainingDebt: 0 };
      }
      supplierMap[c.supplierId].totalPurchases += c.totalAmount;
      supplierMap[c.supplierId].totalPaid += c.paidAmount;
      supplierMap[c.supplierId].remainingDebt += c.remainingAmount;
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

    // Other expenses from suppliers. Chick/feed/medication invoices are already
    // represented by their dedicated purchase ledgers and must not be counted twice.
    expenses.filter(e => e.supplierId && !['chicks', 'feed', 'medication', 'vaccines'].includes(e.category)).forEach(e => {
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
    const chickPurchases = this.getChickPurchases().filter(c => c.cycleId === cycleId);
    const meds = this.getMedicationPurchases().filter(m => m.cycleId === cycleId);
    const medicationMovements = this.getMedicationMovements().filter(m => m.cycleId === cycleId);
    const expenses = this.getExpenses().filter(e => e.cycleId === cycleId);
    const sales = this.getSales().filter(s => s.cycleId === cycleId);
    const dailyLogs = this.getDailyLogs().filter(l => l.cycleId === cycleId);
    const feedMovements = this.getFeedMovements().filter(m => m.cycleId === cycleId);
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
    const chicksInvoiceCost = chickPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    const chicksCost = chicksInvoiceCost || chicksExp.reduce((sum, e) => sum + e.amount, 0) || (
      cycle.initialChickCount * cycle.chickUnitPrice
      + (cycle.chickTransportCost || 0)
      + (cycle.chickVaccineCost || 0)
    );

    // Feed stats: purchases are used for stock/cost, while daily logs are the
    // source of truth for actual consumption and FCR.
    const totalFeedPurchasedKg = feeds.reduce((sum, f) => sum + f.quantityKg, 0);
    // Feed is bought into the farm warehouse, so a purchase may intentionally
    // have no cycleId. Value a cycle by the feed actually issued to it.
    const farmFeeds = this.getFeedPurchases().filter(f => f.farmId === cycle.farmId);
    const farmPurchasedKg = farmFeeds.reduce((sum, f) => sum + Math.max(0, f.quantityKg || 0), 0);
    const farmPurchasedCost = farmFeeds.reduce((sum, f) => sum + Math.max(0, f.totalAmount || 0), 0);
    const weightedFarmFeedCost = farmPurchasedKg > 0 ? farmPurchasedCost / farmPurchasedKg : 0;
    const movementLogIds = new Set(feedMovements.filter(m => m.dailyLogId).map(m => m.dailyLogId));
    const legacyDailyConsumptionKg = dailyLogs
      .filter(log => !movementLogIds.has(log.id))
      .reduce((sum, l) => sum + Math.max(0, l.feedConsumedKg || 0), 0);
    const issuedFeedKg = feedMovements
      .filter(m => m.type === 'issue')
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const returnedFeedKg = feedMovements
      .filter(m => m.type === 'return')
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const wastedFeedKg = feedMovements
      .filter(m => m.type === 'waste')
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const netIssuedFeedKg = Math.max(0, issuedFeedKg - returnedFeedKg - wastedFeedKg);
    const totalFeedConsumedKg = netIssuedFeedKg + legacyDailyConsumptionKg;
    const totalFeedKg = totalFeedConsumedKg;
    const issuedFeedCost = feedMovements
      .filter(m => m.type === 'issue' && m.cycleId === cycleId)
      .reduce((sum, movement) => {
        const source = movement.sourcePurchaseId
          ? this.getFeedPurchases().find(p => p.id === movement.sourcePurchaseId)
          : undefined;
        const unitCost = movement.unitCostPerKg || source?.unitPricePerKg || weightedFarmFeedCost;
        return sum + Math.max(0, movement.quantityKg || 0) * unitCost;
      }, 0);
    const totalFeedCost = issuedFeedCost + (legacyDailyConsumptionKg * weightedFarmFeedCost)
      || feeds.reduce((sum, f) => sum + f.totalAmount, 0);
    const feedCostPerBird = cycle.initialChickCount > 0 ? totalFeedCost / cycle.initialChickCount : 0;
    const fcr = totalWeightSoldKg > 0 ? totalFeedConsumedKg / totalWeightSoldKg : 0;

    // Meds stats
    const issuedMedicationCost = medicationMovements
      .filter(m => m.type === 'issue')
      .reduce((sum, movement) => sum + (movement.totalCost || movement.quantity * (movement.unitCost || 0)), 0);
    const totalMedicationCost = issuedMedicationCost || meds.reduce((sum, m) => sum + m.totalAmount, 0);
    const medicationCostPerBird = cycle.initialChickCount > 0 ? totalMedicationCost / cycle.initialChickCount : 0;

    // Labor & Utilities
    const totalLaborCost = workerTxs.filter(w => w.type === 'salary' || w.type === 'bonus').reduce((sum, w) => sum + w.amount, 0)
      + expenses.filter(e => e.category === 'labor').reduce((sum, e) => sum + e.amount, 0);

    const totalUtilitiesCost = expenses
      .filter(e => ['electricity', 'water', 'fuel', 'gas'].includes(e.category as string))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalOtherExpenses = expenses
      .filter(e => !['chicks', 'feed', 'medication', 'vaccines', 'labor', 'electricity', 'water', 'fuel', 'gas'].includes(e.category as string))
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
      totalFeedPurchasedKg,
      totalFeedConsumedKg,
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
