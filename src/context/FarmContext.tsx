import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  UserRole,
  UserPermissions,
  DEFAULT_ROLE_PERMISSIONS,
  Language,
  CycleFinancialSummary,
  BackupSnapshot,
  AutoBackupSettings,
} from '../types';
import { StorageService } from '../services/storageService';
import { getCycleDayNumber, getMoroccoDateISO } from '../utils/date';

interface FarmContextType {
  // State
  currentUser: User;
  setCurrentUser: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedFarmId: string; // 'all' or specific farmId
  setSelectedFarmId: (farmId: string) => void;
  currency: string;

  // Entities
  users: User[];
  farms: Farm[];
  cycles: PoultryCycle[];
  dailyLogs: DailyLog[];
  partners: Partner[];
  accounts: CashAccount[];
  workers: Worker[];
  workerTransactions: WorkerTransaction[];
  chickPurchases: ChickPurchase[];
  feedPurchases: FeedPurchase[];
  feedMovements: FeedStockMovement[];
  medicationPurchases: MedicationPurchase[];
  medicationMovements: MedicationStockMovement[];
  expenses: Expense[];
  sales: WholesaleSale[];
  feedSales: FeedSale[];
  chickSales: ChickSale[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
  auditLogs: AuditLogEntry[];
  isOnline: boolean;
  dataSource: 'loading' | 'server' | 'offline';

  // Computed Financials
  accountBalances: Record<string, number>;
  partnerBalances: {
    customerReceivables: Record<string, { totalSales: number; totalPaid: number; remainingDue: number }>;
    supplierPayables: Record<string, { totalPurchases: number; totalPaid: number; remainingDebt: number }>;
    totalReceivables: number;
    totalPayables: number;
  };
  totalLiquidity: number;
  totalActiveBirds: number;
  todaySales: number;
  todayExpenses: number;
  todayCollections: number;
  todayPayments: number;
  allCycleSummaries: CycleFinancialSummary[];

  // Mutators & Creators - Users
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  // Mutators & Creators - Farms
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt'>) => void;
  updateFarm: (id: string, farm: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;

  addCycle: (cycle: Omit<PoultryCycle, 'id' | 'createdAt'>) => void;
  updateCycle: (id: string, cycle: Partial<PoultryCycle>) => void;
  deleteCycle: (id: string) => void;
  completeCycle: (id: string, actualSaleDate: string) => void;

  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;

  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => boolean;

  addAccount: (account: Omit<CashAccount, 'id'>) => void;
  updateAccount: (id: string, account: Partial<CashAccount>) => void;

  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  addWorkerTransaction: (tx: Omit<WorkerTransaction, 'id'>) => void;

  // Quick Action Financial Creators & Purchases
  addChickPurchase: (purchase: Omit<ChickPurchase, 'id' | 'createdAt'>, createCycleAutomatically?: boolean) => void;
  updateChickPurchase: (id: string, purchase: Partial<ChickPurchase>) => void;
  deleteChickPurchase: (id: string) => void;
  addFeedPurchase: (purchase: Omit<FeedPurchase, 'id'>) => void;
  updateFeedPurchase: (id: string, purchase: Partial<FeedPurchase>) => void;
  deleteFeedPurchase: (id: string) => void;
  addFeedMovement: (movement: Omit<FeedStockMovement, 'id'>) => void;
  addMedicationMovement: (movement: Omit<MedicationStockMovement, 'id'>) => void;
  addFeedTransfer: (movement: Omit<FeedStockMovement, 'id' | 'type' | 'farmId' | 'sourceFarmId' | 'destinationFarmId'> & { sourceFarmId: string; destinationFarmId: string }) => void;
  addMedicationPurchase: (purchase: Omit<MedicationPurchase, 'id'>) => void;
  getFarmFeedStockKg: (farmId: string) => number;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addSale: (sale: Omit<WholesaleSale, 'id'>) => void;
  addFeedSale: (sale: Omit<FeedSale, 'id' | 'createdAt'>) => void;
  updateFeedSale: (id: string, sale: Partial<FeedSale>) => void;
  deleteFeedSale: (id: string) => void;
  addChickSale: (sale: Omit<ChickSale, 'id' | 'createdAt'>) => void;
  updateChickSale: (id: string, sale: Partial<ChickSale>) => void;
  deleteChickSale: (id: string) => void;
  addSettlementTransaction: (tx: {
    partnerId: string;
    amount: number;
    type: 'customer_payment' | 'supplier_payment';
    accountId: string;
    description: string;
    paymentMethod: any;
  }) => void;
  addAccountTransfer: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => void;

  // Notifications & Audits
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetAllData: () => void;
  importBackup: (jsonStr: string) => boolean;
  exportBackup: () => string;
  refreshAll: () => void;
  syncData: () => void;
  syncStatus: { isSyncing: boolean; lastSyncTime: string };

  // Auto-Backup & Snapshots
  backupSnapshots: BackupSnapshot[];
  autoBackupSettings: AutoBackupSettings;
  updateAutoBackupSettings: (settings: Partial<AutoBackupSettings>) => void;
  createManualBackupSnapshot: (description?: string) => BackupSnapshot;
  restoreBackupSnapshot: (snapshotId: string) => boolean;
  deleteBackupSnapshot: (snapshotId: string) => void;
  downloadManualBackup: (format?: 'json' | 'csv_financial' | 'csv_production') => void;

  // Role permissions helpers
  canManageFarms: boolean;
  canManageFinance: boolean;
  canViewReports: boolean;
  canManageCycles: boolean;
  canEnterDailyLogs: boolean;
  canManageSales: boolean;
  canManageUsers: boolean;
  canCancelOperations: boolean;
  hasPermission: (permissionKey: keyof UserPermissions) => boolean;
  cancelAuditOperation: (auditId: string, reason: string) => boolean;
  isFarmAllowed: (farmId: string) => boolean;
  isHangarAllowed: (farmId: string, barnNumber?: string) => boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUsers = StorageService.getUsers();
    try {
      const sessionUser = sessionStorage.getItem('poultry_current_user');
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser) as User;
        const matchingUser = savedUsers.find(user => user.id === parsed.id);
        if (matchingUser) return { ...matchingUser, ...parsed };
      }
    } catch (_) {}
    return savedUsers[0] || { id: 'usr-admin', name: 'المدير العام', phone: '', role: 'admin' };
  });
  const [language, setLanguageState] = useState<Language>('ar');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [currency] = useState<string>('DH');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [dataSource, setDataSource] = useState<'loading' | 'server' | 'offline'>(navigator.onLine ? 'loading' : 'offline');

  // Entities
  const [farms, setFarms] = useState<Farm[]>(StorageService.getFarms());
  const [cycles, setCycles] = useState<PoultryCycle[]>(StorageService.getCycles());
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(StorageService.getDailyLogs());
  const [partners, setPartners] = useState<Partner[]>(StorageService.getPartners());
  const [accounts, setAccounts] = useState<CashAccount[]>(StorageService.getAccounts());
  const [workers, setWorkers] = useState<Worker[]>(StorageService.getWorkers());
  const [workerTransactions, setWorkerTransactions] = useState<WorkerTransaction[]>(StorageService.getWorkerTransactions());
  const [chickPurchases, setChickPurchases] = useState<ChickPurchase[]>(StorageService.getChickPurchases());
  const [feedPurchases, setFeedPurchases] = useState<FeedPurchase[]>(StorageService.getFeedPurchases());
  const [feedMovements, setFeedMovements] = useState<FeedStockMovement[]>(StorageService.getFeedMovements());
  const [medicationPurchases, setMedicationPurchases] = useState<MedicationPurchase[]>(StorageService.getMedicationPurchases());
  const [medicationMovements, setMedicationMovements] = useState<MedicationStockMovement[]>(StorageService.getMedicationMovements());
  const [expenses, setExpenses] = useState<Expense[]>(StorageService.getExpenses());
  const [sales, setSales] = useState<WholesaleSale[]>(StorageService.getSales());
  const [feedSales, setFeedSales] = useState<FeedSale[]>(StorageService.getFeedSales());
  const [chickSales, setChickSales] = useState<ChickSale[]>(StorageService.getChickSales());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(StorageService.getTransactions());
  const [notifications, setNotifications] = useState<AppNotification[]>(StorageService.getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(StorageService.getAuditLogs());
  const [backupSnapshots, setBackupSnapshots] = useState<BackupSnapshot[]>(() => StorageService.getBackupSnapshots());
  const [autoBackupSettings, setAutoBackupSettingsState] = useState<AutoBackupSettings>(() => StorageService.getAutoBackupSettings());
  const [syncStatus, setSyncStatus] = useState<{ isSyncing: boolean; lastSyncTime: string }>({
    isSyncing: false,
    lastSyncTime: 'متصل ومحفوظ'
  });

  // Background auto-backup scheduler
  useEffect(() => {
    const loadDataSource = async () => {
      if (!navigator.onLine) {
        setDataSource('offline');
        return;
      }
      setDataSource('loading');
      const hydrated = await StorageService.hydrateFromRemote();
      if (hydrated) {
        refreshAll();
        setDataSource('server');
      } else {
        setDataSource('offline');
      }
    };
    void loadDataSource();

    // Initial check
    const initialSnap = StorageService.checkAndRunAutoBackup();
    if (initialSnap) {
      setBackupSnapshots(StorageService.getBackupSnapshots());
    }

    const interval = setInterval(() => {
      const snap = StorageService.checkAndRunAutoBackup();
      if (snap) {
        setBackupSnapshots(StorageService.getBackupSnapshots());
        setAutoBackupSettingsState(StorageService.getAutoBackupSettings());
      }
    }, 45000); // Periodic check every 45s

    return () => clearInterval(interval);
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void StorageService.hydrateFromRemote().then((hydrated) => {
        if (hydrated) {
          refreshAll();
          setDataSource('server');
        }
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDataSource('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Computations
  const accountBalances = useMemo(() => {
    return StorageService.calculateAccountBalances();
  }, [accounts, transactions]);

  const totalLiquidity = useMemo(() => {
    return Object.values(accountBalances).reduce<number>((sum, val) => sum + Number(val || 0), 0);
  }, [accountBalances]);

  const partnerBalances = useMemo(() => {
    return StorageService.calculatePartnerBalances();
  }, [partners, sales, feedSales, chickSales, chickPurchases, feedPurchases, medicationPurchases, expenses, transactions]);

  const allCycleSummaries = useMemo(() => {
    return cycles.map(c => StorageService.calculateCycleSummary(c.id));
  }, [cycles, chickPurchases, feedPurchases, feedMovements, medicationPurchases, medicationMovements, expenses, sales, dailyLogs, workerTransactions]);

  const totalActiveBirds = useMemo(() => {
    return allCycleSummaries
      .filter(c => c.status !== 'completed')
      .reduce((sum, c) => sum + c.remainingLiveChicks, 0);
  }, [allCycleSummaries]);

  // Today metrics
  const todayStr = getMoroccoDateISO();

  const todaySales = useMemo(() => {
    const wholesaleSum = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.netTotal, 0);
    const feedSalesSum = feedSales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.totalAmount, 0);
    const chickSalesSum = chickSales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.totalAmount, 0);
    return wholesaleSum + feedSalesSum + chickSalesSum;
  }, [sales, feedSales, chickSales, todayStr]);

  const todayExpenses = useMemo(() => {
    const directExp = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
    const chickExp = chickPurchases.filter(c => c.date === todayStr).reduce((sum, c) => sum + c.totalAmount, 0);
    const feedExp = feedPurchases.filter(f => f.date === todayStr).reduce((sum, f) => sum + f.totalAmount, 0);
    const medExp = medicationPurchases.filter(m => m.date === todayStr).reduce((sum, m) => sum + m.totalAmount, 0);
    return directExp + chickExp + feedExp + medExp;
  }, [expenses, chickPurchases, feedPurchases, medicationPurchases, todayStr]);

  const todayCollections = useMemo(() => {
    return transactions
      .filter(t => t.date === todayStr && t.type === 'customer_payment')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayStr]);

  const todayPayments = useMemo(() => {
    return transactions
      .filter(t => t.date === todayStr && (t.type === 'supplier_payment' || t.type === 'expense' || t.type === 'worker_salary'))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayStr]);

  // Dynamic permission helper
  const hasPermission = (permissionKey: keyof UserPermissions, user: User = currentUser): boolean => {
    if (user.permissions && user.permissions[permissionKey] !== undefined) {
      return !!user.permissions[permissionKey];
    }
    if (user.role === 'admin') return true;
    return DEFAULT_ROLE_PERMISSIONS[user.role]?.[permissionKey] ?? false;
  };

  const isFarmAllowed = (farmId: string, user: User = currentUser): boolean => {
    if (user.role === 'admin') return true;
    if (!user.allowedFarmIds || user.allowedFarmIds.length === 0) return true;
    return user.allowedFarmIds.includes(farmId);
  };
  const isHangarAllowed = (farmId: string, barnNumber?: string, user: User = currentUser): boolean => {
    if (!isFarmAllowed(farmId, user)) return false;
    if (user.role === 'admin' || !user.allowedHangarIds || user.allowedHangarIds.length === 0) return true;
    const barnNumbers = (barnNumber || '').match(/\d+/g) || [];
    return barnNumbers.some(number => user.allowedHangarIds?.includes(`${farmId}:barn-${number}`));
  };

  // Role permissions shortcuts
  const canManageFarms = hasPermission('canManageFarms');
  const canManageFinance = hasPermission('canManageFinance');
  const canViewReports = hasPermission('canViewReports');
  const canManageCycles = hasPermission('canManageCycles');
  const canEnterDailyLogs = hasPermission('canEnterDailyLogs');
  const canManageSales = hasPermission('canManageSales');
  const canManageUsers = hasPermission('canManageUsers');
  const canCancelOperations = hasPermission('canCancelOperations');

  // User management methods
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: userData.status || 'active',
      createdAt: getMoroccoDateISO(),
      permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userData.role]
    };
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);

    // Field users are also personnel records. Create the linked worker card
    // automatically so registration happens only from Users & Permissions.
    if (newUser.role === 'admin' || newUser.role === 'worker' || newUser.role === 'farm_manager') {
      const assignedFarmId = newUser.allowedFarmIds?.[0] || farms[0]?.id;
      if (assignedFarmId && !workers.some(worker => worker.userId === newUser.id)) {
        const linkedWorker: Worker = {
          id: `wrk-${Date.now()}`,
          userId: newUser.id,
          name: newUser.name,
          jobTitle: newUser.jobTitle || (newUser.role === 'worker' ? 'مشرف / عامل' : newUser.role === 'admin' ? 'مدير عام' : 'مدير مزرعة'),
          phone: newUser.phone,
          monthlySalary: 0,
          farmId: assignedFarmId,
          hireDate: getMoroccoDateISO(),
          isActive: newUser.status !== 'inactive',
          currentBalance: 0,
          notes: 'تم إنشاؤه تلقائيًا من حساب المستخدم'
        };
        const updatedWorkers = [...workers, linkedWorker];
        setWorkers(updatedWorkers);
        StorageService.saveWorkers(updatedWorkers);
      }
    }
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'user',
      entityId: newUser.id,
      details: `إضافة مستخدم جديد: ${newUser.name} بدور ${newUser.role}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const merged = { ...u, ...userData };
        if (currentUser.id === id) {
          setCurrentUser(merged);
        }
        return merged;
      }
      return u;
    });
    setUsers(updated);
    StorageService.saveUsers(updated);
    const editedUser = updated.find(user => user.id === id);
    if (editedUser) {
      const isFieldUser = editedUser.role === 'admin' || editedUser.role === 'worker' || editedUser.role === 'farm_manager';
      const linkedWorker = workers.find(worker => worker.userId === editedUser.id);
      if (isFieldUser && !linkedWorker) {
        const assignedFarmId = editedUser.allowedFarmIds?.[0] || farms[0]?.id;
        if (assignedFarmId) {
          const newWorker: Worker = {
            id: `wrk-${Date.now()}`,
            userId: editedUser.id,
            name: editedUser.name,
            jobTitle: editedUser.jobTitle || (editedUser.role === 'worker' ? 'مشرف / عامل' : editedUser.role === 'admin' ? 'مدير عام' : 'مدير مزرعة'),
            phone: editedUser.phone,
            monthlySalary: 0,
            farmId: assignedFarmId,
            hireDate: getMoroccoDateISO(),
            isActive: editedUser.status !== 'inactive',
            currentBalance: 0,
            notes: 'تم إنشاؤه تلقائيًا من حساب المستخدم'
          };
          const updatedWorkers = [...workers, newWorker];
          setWorkers(updatedWorkers);
          StorageService.saveWorkers(updatedWorkers);
        }
      } else if (linkedWorker && isFieldUser) {
        const assignedFarmId = editedUser.allowedFarmIds?.[0] || linkedWorker.farmId;
        const updatedWorkers = workers.map(worker => worker.userId === editedUser.id
          ? { ...worker, name: editedUser.name, phone: editedUser.phone, jobTitle: editedUser.jobTitle || worker.jobTitle, farmId: assignedFarmId, isActive: editedUser.status !== 'inactive' }
          : worker);
        setWorkers(updatedWorkers);
        StorageService.saveWorkers(updatedWorkers);
      } else if (linkedWorker && !isFieldUser) {
        const updatedWorkers = workers.map(worker => worker.userId === editedUser.id ? { ...worker, isActive: false } : worker);
        setWorkers(updatedWorkers);
        StorageService.saveWorkers(updatedWorkers);
      }
    }
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'user',
      entityId: id,
      details: `تحديث بيانات المستخدم: ${userData.name || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert('لا يمكنك حذف الحساب النشط حالياً!');
      return;
    }
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    StorageService.saveUsers(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'user',
      entityId: id,
      details: `حذف مستخدم: ${id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const toggleUserStatus = (id: string) => {
    const userToToggle = users.find(u => u.id === id);
    if (!userToToggle) return;
    const newStatus = userToToggle.status === 'inactive' ? 'active' : 'inactive';
    updateUser(id, { status: newStatus });
  };

  const cancelAuditOperation = (auditId: string, reason: string): boolean => {
    if (!canCancelOperations || !reason.trim()) return false;
    const target = auditLogs.find(log => log.id === auditId);
    if (!target || target.cancelledAt || target.entityType === 'audit_cancel') return false;

    const entityType = target.entityType || target.entity || '';
    const entityId = target.entityId;
    if (!entityId) return false;
    StorageService.createBackupSnapshot('auto_action', `نسخة أمان قبل إلغاء العملية ${auditId}`);

    let nextFarms = farms;
    let nextCycles = cycles;
    let nextDailyLogs = dailyLogs;
    let nextChicks = chickPurchases;
    let nextFeeds = feedPurchases;
    let nextFeedMovements = feedMovements;
    let nextMeds = medicationPurchases;
    let nextMedicationMovements = medicationMovements;
    let nextExpenses = expenses;
    let nextSales = sales;
    let nextWorkerTxs = workerTransactions;
    let nextTransactions = transactions;
    let nextUsers = users;
    let nextNotifications = notifications;

    if (entityType === 'cycle') {
      const cycleIds = new Set([entityId]);
      const linkedChickIds = new Set(chickPurchases.filter(p => p.cycleId && cycleIds.has(p.cycleId)).map(p => p.id));
      nextCycles = cycles.filter(c => !cycleIds.has(c.id));
      nextDailyLogs = dailyLogs.filter(l => !cycleIds.has(l.cycleId));
      nextChicks = chickPurchases.filter(p => !cycleIds.has(p.cycleId || ''));
      nextFeeds = feedPurchases.filter(p => !cycleIds.has(p.cycleId || ''));
      nextFeedMovements = feedMovements.filter(m => !cycleIds.has(m.cycleId || '') && !linkedChickIds.has(m.sourcePurchaseId || ''));
      nextMeds = medicationPurchases.filter(p => !cycleIds.has(p.cycleId || ''));
      nextMedicationMovements = medicationMovements.filter(m => !cycleIds.has(m.cycleId || ''));
      nextExpenses = expenses.filter(e => !cycleIds.has(e.cycleId || ''));
      nextSales = sales.filter(s => !cycleIds.has(s.cycleId));
      nextWorkerTxs = workerTransactions.filter(t => !cycleIds.has(t.cycleId || ''));
      nextTransactions = transactions.filter(t => !cycleIds.has(t.cycleId || '') && !linkedChickIds.has(t.referenceId || ''));
      nextNotifications = notifications.filter(n => n.linkId !== entityId);
    } else if (entityType === 'farm') {
      nextFarms = farms.filter(f => f.id !== entityId);
      const farmCycleIds = new Set(cycles.filter(c => c.farmId === entityId).map(c => c.id));
      const farmChickIds = new Set(chickPurchases.filter(p => p.farmId === entityId).map(p => p.id));
      nextCycles = cycles.filter(c => c.farmId !== entityId);
      nextDailyLogs = dailyLogs.filter(l => !farmCycleIds.has(l.cycleId));
      nextChicks = chickPurchases.filter(p => p.farmId !== entityId);
      nextFeeds = feedPurchases.filter(p => p.farmId !== entityId);
      nextFeedMovements = feedMovements.filter(m => m.farmId !== entityId && m.sourceFarmId !== entityId && m.destinationFarmId !== entityId);
      nextMeds = medicationPurchases.filter(p => p.farmId !== entityId);
      nextMedicationMovements = medicationMovements.filter(m => m.farmId !== entityId);
      nextExpenses = expenses.filter(e => e.farmId !== entityId);
      nextSales = sales.filter(s => s.farmId !== entityId);
      nextWorkerTxs = workerTransactions.filter(t => t.farmId !== entityId);
      nextTransactions = transactions.filter(t => t.farmId !== entityId && !farmCycleIds.has(t.cycleId || '') && !farmChickIds.has(t.referenceId || ''));
      nextNotifications = notifications.filter(n => !farmCycleIds.has(n.linkId || ''));
    } else if (entityType === 'daily_log') {
      nextDailyLogs = dailyLogs.filter(l => l.id !== entityId);
      nextFeedMovements = feedMovements.filter(m => m.dailyLogId !== entityId);
      nextMedicationMovements = medicationMovements.filter(m => m.dailyLogId !== entityId);
    } else if (entityType === 'chick_purchase') {
      nextChicks = chickPurchases.filter(p => p.id !== entityId);
      nextTransactions = transactions.filter(t => !(t.referenceType === 'expense' && t.referenceId === entityId));
    } else if (entityType === 'feed_purchase') {
      const purchase = feedPurchases.find(p => p.id === entityId);
      const usedFromSource = feedMovements.some(m => m.sourcePurchaseId === entityId && ['issue', 'transfer_out', 'waste'].includes(m.type));
      const usedByLinkedCycle = purchase?.cycleId ? dailyLogs.some(log => log.cycleId === purchase.cycleId && log.feedConsumedKg > 0) : false;
      if (usedFromSource || usedByLinkedCycle) return false;
      nextFeeds = feedPurchases.filter(p => p.id !== entityId);
      nextFeedMovements = feedMovements.filter(m => m.sourcePurchaseId !== entityId);
      nextTransactions = transactions.filter(t => !(t.referenceType === 'feed' && t.referenceId === entityId));
    } else if (entityType === 'medication_purchase' || entityType === 'med_purchase') {
      const used = medicationMovements.some(m => m.medicationPurchaseId === entityId && ['issue', 'waste'].includes(m.type));
      if (used) return false;
      nextMeds = medicationPurchases.filter(p => p.id !== entityId);
      nextMedicationMovements = medicationMovements.filter(m => m.medicationPurchaseId !== entityId);
      nextTransactions = transactions.filter(t => !(t.referenceType === 'medication' && t.referenceId === entityId));
    } else if (entityType === 'expense') {
      nextExpenses = expenses.filter(e => e.id !== entityId);
      nextTransactions = transactions.filter(t => !(t.referenceType === 'expense' && t.referenceId === entityId));
    } else if (entityType === 'sale') {
      nextSales = sales.filter(s => s.id !== entityId);
      nextTransactions = transactions.filter(t => !(t.referenceType === 'sale' && t.referenceId === entityId));
    } else if (entityType === 'worker_transaction') {
      nextWorkerTxs = workerTransactions.filter(t => t.id !== entityId);
      nextTransactions = transactions.filter(t => !(t.referenceType === 'worker' && t.referenceId === entityId));
    } else if (entityType === 'transaction' || entityType === 'account_transfer' || entityType === 'debt_payment') {
      nextTransactions = transactions.filter(t => t.id !== entityId);
    } else if (entityType === 'feed_movement') {
      const movement = feedMovements.find(m => m.id === entityId);
      nextFeedMovements = feedMovements.filter(m => m.id !== entityId);
      if (movement?.type === 'purchase' && movement.sourcePurchaseId) {
        nextFeeds = feedPurchases.filter(p => p.id !== movement.sourcePurchaseId);
        nextFeedMovements = nextFeedMovements.filter(m => m.sourcePurchaseId !== movement.sourcePurchaseId);
        nextTransactions = transactions.filter(t => !(t.referenceType === 'feed' && t.referenceId === movement.sourcePurchaseId));
      }
    } else if (entityType === 'feed_transfer') {
      nextFeedMovements = feedMovements.filter(m => !m.id.startsWith(`${entityId}-`));
    } else if (entityType === 'user' && entityId !== currentUser.id) {
      nextUsers = users.filter(u => u.id !== entityId);
    } else {
      return false;
    }

    setFarms(nextFarms); setCycles(nextCycles); setDailyLogs(nextDailyLogs); setChickPurchases(nextChicks);
    setFeedPurchases(nextFeeds); setFeedMovements(nextFeedMovements); setMedicationPurchases(nextMeds);
    setMedicationMovements(nextMedicationMovements);
    setExpenses(nextExpenses); setSales(nextSales); setWorkerTransactions(nextWorkerTxs);
    setTransactions(nextTransactions); setUsers(nextUsers); setNotifications(nextNotifications);
    if (nextFarms !== farms) StorageService.saveFarms(nextFarms);
    if (nextCycles !== cycles) StorageService.saveCycles(nextCycles);
    if (nextDailyLogs !== dailyLogs) StorageService.saveDailyLogs(nextDailyLogs);
    if (nextChicks !== chickPurchases) StorageService.saveChickPurchases(nextChicks);
    if (nextFeeds !== feedPurchases) StorageService.saveFeedPurchases(nextFeeds);
    if (nextFeedMovements !== feedMovements) StorageService.saveFeedMovements(nextFeedMovements);
    if (nextMeds !== medicationPurchases) StorageService.saveMedicationPurchases(nextMeds);
    if (nextMedicationMovements !== medicationMovements) StorageService.saveMedicationMovements(nextMedicationMovements);
    if (nextExpenses !== expenses) StorageService.saveExpenses(nextExpenses);
    if (nextSales !== sales) StorageService.saveSales(nextSales);
    if (nextWorkerTxs !== workerTransactions) StorageService.saveWorkerTransactions(nextWorkerTxs);
    if (nextTransactions !== transactions) StorageService.saveTransactions(nextTransactions);
    if (nextUsers !== users) StorageService.saveUsers(nextUsers);
    if (nextNotifications !== notifications) StorageService.saveNotifications(nextNotifications);

    const cancelledAt = new Date().toISOString();
    const updated = auditLogs.map(log => log.id === auditId
      ? { ...log, cancelledAt, cancelledBy: currentUser.name, cancellationReason: reason.trim() }
      : log
    );
    StorageService.saveAuditLogs(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'audit_cancel',
      entityId: auditId,
      details: `إلغاء العملية ${auditId} باعتبارها تمت بالخطأ. السبب: ${reason.trim()}`,
      previousValue: { action: target.action, entityType: target.entityType, entityId: target.entityId },
      newValue: { cancelled: true, cancelledBy: currentUser.name, reason: reason.trim() }
    });
    setAuditLogs(StorageService.getAuditLogs());
    void StorageService.syncAllToRemote().then(() => refreshAll()).catch(error => console.warn('Retroactive cancellation sync failed:', error));
    return true;
  };

  // State mutators with auto-sync, storage persistence & audit logging
  const addFarm = (farmData: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      createdAt: getMoroccoDateISO()
    };
    const updated = [...farms, newFarm];
    setFarms(updated);
    StorageService.saveFarms(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'farm',
      entityId: newFarm.id,
      details: `إضافة مزرعة جديدة: ${newFarm.name} بطاقة استيعابية ${newFarm.capacity} طائر`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateFarm = (id: string, farmData: Partial<Farm>) => {
    const updated = farms.map(f => f.id === id ? { ...f, ...farmData } : f);
    setFarms(updated);
    StorageService.saveFarms(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'farm',
      entityId: id,
      details: `تحديث بيانات المزرعة: ${farmData.name || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteFarm = (id: string) => {
    const updated = farms.filter(f => f.id !== id);
    setFarms(updated);
    StorageService.saveFarms(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'farm',
      entityId: id,
      details: `حذف مزرعة: ${id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addCycle = (cycleData: Omit<PoultryCycle, 'id' | 'createdAt'>) => {
    const newCycle: PoultryCycle = {
      ...cycleData,
      id: `cycle-${Date.now()}`,
      createdAt: getMoroccoDateISO()
    };
    const updated = [...cycles, newCycle];
    setCycles(updated);
    StorageService.saveCycles(updated);

    // A new cycle creates one linked chick invoice. The invoice is the source
    // of truth for chick cost, payment, and supplier debt.
    if (newCycle.initialChickCount > 0 && newCycle.chickUnitPrice > 0) {
      const chickCost = newCycle.initialChickCount * newCycle.chickUnitPrice;
      const totalChickCost = chickCost + (newCycle.chickTransportCost || 0) + (newCycle.chickVaccineCost || 0);
      const paidAmount = Math.min(totalChickCost, Math.max(0, newCycle.chickPaidAmount || 0));
      const chickPurchase: ChickPurchase = {
        id: `chk-${newCycle.id}`,
        invoiceNumber: `CHK-${newCycle.cycleNumber}`,
        date: newCycle.chickEntryDate,
        supplierId: newCycle.hatcherySupplierId || 'supplier-unknown',
        breed: newCycle.chickBreed,
        farmId: newCycle.farmId,
        cycleId: newCycle.id,
        orderedCount: newCycle.initialChickCount,
        transportMortalityCount: 0,
        receivedHealthyCount: newCycle.initialChickCount,
        unitPrice: newCycle.chickUnitPrice,
        chickCost,
        transportCost: newCycle.chickTransportCost || 0,
        vaccineCostAtHatchery: newCycle.chickVaccineCost || 0,
        totalAmount: totalChickCost,
        paidAmount,
        remainingAmount: totalChickCost - paidAmount,
        paymentMethod: newCycle.chickPaymentMethod || (paidAmount === totalChickCost ? 'cash' : paidAmount > 0 ? 'partial' : 'delayed'),
        accountId: newCycle.chickAccountId,
        supplierName: newCycle.chickSource,
        notes: `شراء مرتبط بالدورة ${newCycle.cycleNumber}`,
        createdAt: new Date().toISOString()
      };
      const updatedChicks = [chickPurchase, ...chickPurchases];
      setChickPurchases(updatedChicks);
      StorageService.saveChickPurchases(updatedChicks);

      if (paidAmount > 0 && newCycle.chickAccountId) {
        const supplier = partners.find(p => p.id === chickPurchase.supplierId);
        const finTx: FinancialTransaction = {
          id: `tx-${chickPurchase.id}`,
          date: chickPurchase.date,
          type: 'supplier_payment',
          amount: paidAmount,
          accountId: newCycle.chickAccountId,
          farmId: newCycle.farmId,
          cycleId: newCycle.id,
          partnerId: chickPurchase.supplierId,
          referenceType: 'expense',
          referenceId: chickPurchase.id,
          paymentMethod: chickPurchase.paymentMethod,
          description: `دفعة شراء كتاكيت للدورة ${newCycle.cycleNumber} - ${supplier?.name || chickPurchase.supplierName || 'مورد'}`,
          performedBy: currentUser.name,
          createdAt: new Date().toISOString()
        };
        const updatedTxs = [...transactions, finTx];
        setTransactions(updatedTxs);
        StorageService.saveTransactions(updatedTxs);
      }
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'cycle',
      entityId: newCycle.id,
      details: `إنشاء دورة تربية جديدة ${newCycle.cycleNumber} بعدد ${newCycle.initialChickCount} كتكوت`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateCycle = (id: string, cycleData: Partial<PoultryCycle>) => {
    const updated = cycles.map(c => c.id === id ? { ...c, ...cycleData } : c);
    setCycles(updated);
    StorageService.saveCycles(updated);

    const current = cycles.find(c => c.id === id);
    const linkedPurchase = chickPurchases.find(p => p.cycleId === id);
    const merged = { ...current, ...cycleData };
    if (linkedPurchase && merged.initialChickCount && merged.chickUnitPrice) {
      const chickCost = merged.initialChickCount * merged.chickUnitPrice;
      const totalAmount = chickCost + (merged.chickTransportCost || 0) + (merged.chickVaccineCost || 0);
      const paidAmount = Math.min(totalAmount, Math.max(0, merged.chickPaidAmount || 0));
      const updatedChicks = chickPurchases.map(p => p.id === linkedPurchase.id ? {
        ...p,
        date: merged.chickEntryDate || p.date,
        supplierId: merged.hatcherySupplierId || p.supplierId,
        breed: merged.chickBreed || p.breed,
        farmId: merged.farmId || p.farmId,
        orderedCount: merged.initialChickCount || p.orderedCount,
        receivedHealthyCount: merged.initialChickCount || p.receivedHealthyCount,
        unitPrice: merged.chickUnitPrice || p.unitPrice,
        chickCost,
        transportCost: merged.chickTransportCost || 0,
        vaccineCostAtHatchery: merged.chickVaccineCost || 0,
        totalAmount,
        paidAmount,
        remainingAmount: totalAmount - paidAmount,
        paymentMethod: merged.chickPaymentMethod || p.paymentMethod,
        accountId: merged.chickAccountId
      } : p);
      setChickPurchases(updatedChicks);
      StorageService.saveChickPurchases(updatedChicks);
    }
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'cycle',
      entityId: id,
      details: `تعديل الدورة: ${cycleData.cycleNumber || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteCycle = (id: string) => {
    const target = cycles.find(c => c.id === id);
    if (!target) return;
    const linkedPurchases = chickPurchases.filter(c => c.cycleId === id);
    const linkedIds = new Set(linkedPurchases.map(c => c.id));
    const updatedCycles = cycles.filter(c => c.id !== id);
    const updatedChicks = chickPurchases.filter(c => c.cycleId !== id);
    const updatedTxs = transactions.filter(t => t.cycleId !== id && !linkedIds.has(t.referenceId || ''));
    setCycles(updatedCycles);
    setChickPurchases(updatedChicks);
    setTransactions(updatedTxs);
    StorageService.saveCycles(updatedCycles);
    StorageService.saveChickPurchases(updatedChicks);
    StorageService.saveTransactions(updatedTxs);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'cycle',
      entityId: id,
      details: `إلغاء الدورة ${target.cycleNumber} وحذف مشتريات الكتاكيت المرتبطة بها`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const completeCycle = (id: string, actualSaleDate: string) => {
    updateCycle(id, {
      status: 'completed',
      actualSaleDate
    });
  };

  const addDailyLog = (logData: Omit<DailyLog, 'id'>) => {
    const cycle = cycles.find(c => c.id === logData.cycleId);
    const medicationPurchase = logData.medicationPurchaseId ? medicationPurchases.find(p => p.id === logData.medicationPurchaseId) : undefined;
    const medicationUsed = Number(logData.medicationQuantity || 0);
    if (medicationPurchase && medicationUsed > 0) {
      const used = medicationMovements.filter(m => m.medicationPurchaseId === medicationPurchase.id && ['issue', 'waste'].includes(m.type)).reduce((sum, m) => sum + m.quantity, 0);
      const returned = medicationMovements.filter(m => m.medicationPurchaseId === medicationPurchase.id && m.type === 'return').reduce((sum, m) => sum + m.quantity, 0);
      const available = Math.max(0, (medicationPurchase.quantity ?? 1) - used + returned);
      if (medicationUsed > available) return;
    }
    const newLog: DailyLog = {
      ...logData,
      dayNumber: getCycleDayNumber(cycle?.startDate || '', logData.date) || logData.dayNumber,
      id: `log-${Date.now()}`
    };
    const updated = [...dailyLogs, newLog];
    setDailyLogs(updated);
    StorageService.saveDailyLogs(updated);

    if (medicationPurchase && medicationUsed > 0) {
      const movement: MedicationStockMovement = {
        id: `med-movement-${newLog.id}`,
        date: newLog.date,
        type: 'issue',
        medicationPurchaseId: medicationPurchase.id,
        medicationName: medicationPurchase.medicationName,
        quantity: medicationUsed,
        unit: medicationPurchase.unit || newLog.medicationUnit || 'وحدة',
        unitCost: medicationPurchase.unitPrice || medicationPurchase.totalAmount / Math.max(1, medicationPurchase.quantity || 1),
        totalCost: medicationUsed * (medicationPurchase.unitPrice || medicationPurchase.totalAmount / Math.max(1, medicationPurchase.quantity || 1)),
        farmId: cycle?.farmId || 'farm-unknown',
        cycleId: newLog.cycleId,
        dailyLogId: newLog.id,
        performedBy: currentUser.name,
        notes: `استهلاك ${medicationPurchase.medicationName} للدورة ${cycle?.cycleNumber || newLog.cycleId}`
      };
      const updatedMedicationMovements = [...medicationMovements, movement];
      setMedicationMovements(updatedMedicationMovements);
      StorageService.saveMedicationMovements(updatedMedicationMovements);
    }

    if (newLog.feedConsumedKg > 0) {
      const cycle = cycles.find(c => c.id === newLog.cycleId);
      const updatedFeedMovements = [...feedMovements, {
        id: `feed-movement-${newLog.id}`,
        date: newLog.date,
        type: 'issue' as const,
        quantityKg: newLog.feedConsumedKg,
        farmId: cycle?.farmId || 'farm-unknown',
        cycleId: newLog.cycleId,
        barnNumber: cycle?.barnNumber,
        dailyLogId: newLog.id,
        performedBy: currentUser.name,
        notes: `صرف يومي للدورة ${cycle?.cycleNumber || newLog.cycleId}`
      }];
      setFeedMovements(updatedFeedMovements);
      StorageService.saveFeedMovements(updatedFeedMovements);
    }

    // If mortality is unusually high (> 25 in a day), trigger notification
    if (newLog.mortalityCount >= 25) {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'تنبيه: ارتفاع في معدل النفوق اليومي',
        message: `تم تسجيل ${newLog.mortalityCount} طائر نافق بتاريخ ${newLog.date}. يرجى مراجعة التهوية والأعلاف.`,
        type: 'danger',
        date: newLog.date,
        isRead: false,
        linkTab: 'cycles',
        linkId: newLog.cycleId
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      StorageService.saveNotifications(updatedNotifs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'daily_log',
      entityId: newLog.id,
      details: `تسجيل يومي لدورة: نافق ${newLog.mortalityCount}، علف ${newLog.feedConsumedKg} كغ`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addPartner = (partnerData: Omit<Partner, 'id' | 'createdAt'>) => {
    const newPartner: Partner = {
      ...partnerData,
      id: `part-${Date.now()}`,
      createdAt: getMoroccoDateISO()
    };
    const updated = [...partners, newPartner];
    setPartners(updated);
    StorageService.savePartners(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'partner',
      entityId: newPartner.id,
      details: `إضافة طرف جديد (${newPartner.type === 'supplier' ? 'مورد' : 'زبون'}): ${newPartner.name}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updatePartner = (id: string, partnerData: Partial<Partner>) => {
    const updated = partners.map(p => p.id === id ? { ...p, ...partnerData } : p);
    setPartners(updated);
    StorageService.savePartners(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'partner',
      entityId: id,
      details: `تحديث بيانات الطرف: ${partnerData.name || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deletePartner = (id: string): boolean => {
    const hasSales = sales.some(s => s.customerId === id);
    const hasFeedSales = feedSales.some(s => s.customerId === id);
    const hasChickSales = chickSales.some(s => s.customerId === id);
    const hasChickPurchases = chickPurchases.some(c => c.supplierId === id);
    const hasFeedPurchases = feedPurchases.some(f => f.supplierId === id);
    const hasMeds = medicationPurchases.some(m => m.supplierId === id);
    const hasExpenses = expenses.some(e => e.supplierId === id);
    const hasTx = transactions.some(t => t.partnerId === id);

    if (hasSales || hasFeedSales || hasChickSales || hasChickPurchases || hasFeedPurchases || hasMeds || hasExpenses || hasTx) {
      pushNotification(
        'تعذر حذف الشريك',
        'لا يمكن حذف هذا الشريك لوجود فواتير أو معاملات مالية مسجلة باسمه. يمكنك تعديل بياناته بدلاً من ذلك.',
        'warning'
      );
      return false;
    }

    const target = partners.find(p => p.id === id);
    const updated = partners.filter(p => p.id !== id);
    setPartners(updated);
    StorageService.savePartners(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'partner',
      entityId: id,
      details: `حذف الشريك: ${target?.name || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم الحذف', `تم حذف الشريك ${target?.name || ''} بنجاح`, 'success');
    return true;
  };

  const addAccount = (accountData: Omit<CashAccount, 'id'>) => {
    const newAcc: CashAccount = {
      ...accountData,
      id: `acc-${Date.now()}`
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    StorageService.saveAccounts(updated);
  };

  const updateAccount = (id: string, accountData: Partial<CashAccount>) => {
    const updated = accounts.map(a => a.id === id ? { ...a, ...accountData } : a);
    setAccounts(updated);
    StorageService.saveAccounts(updated);
  };

  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...workerData,
      id: `wrk-${Date.now()}`
    };
    const updated = [...workers, newWorker];
    setWorkers(updated);
    StorageService.saveWorkers(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'worker',
      entityId: newWorker.id,
      details: `تسجيل عامل جديد: ${newWorker.name} - ${newWorker.jobTitle}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateWorker = (id: string, workerData: Partial<Worker>) => {
    const updated = workers.map(w => w.id === id ? { ...w, ...workerData } : w);
    setWorkers(updated);
    StorageService.saveWorkers(updated);
  };

  const addWorkerTransaction = (txData: Omit<WorkerTransaction, 'id'>) => {
    const newTx: WorkerTransaction = {
      ...txData,
      id: `wtx-${Date.now()}`
    };
    const updatedWTx = [...workerTransactions, newTx];
    setWorkerTransactions(updatedWTx);
    StorageService.saveWorkerTransactions(updatedWTx);

    // If money was paid out from an account, record in main financial transactions
    if (newTx.accountId && newTx.amount > 0 && (newTx.type === 'salary' || newTx.type === 'advance_loan' || newTx.type === 'bonus')) {
      const worker = workers.find(w => w.id === newTx.workerId);
      const finTx: FinancialTransaction = {
        id: `tx-w-${newTx.id}`,
        date: newTx.date,
        type: newTx.type === 'advance_loan' ? 'worker_loan' : 'worker_salary',
        amount: newTx.amount,
        accountId: newTx.accountId,
        farmId: newTx.farmId,
        cycleId: newTx.cycleId,
        workerId: newTx.workerId,
        referenceType: 'worker',
        referenceId: newTx.id,
        paymentMethod: 'cash',
        description: `${newTx.description} (${worker?.name || ''})`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'worker_transaction',
      entityId: newTx.id,
      details: `حركة أجور/سلف: ${newTx.type} بمبلغ ${newTx.amount} درهم`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل حركة أجور', `${newTx.description} — ${newTx.amount.toLocaleString()} DH`, 'success', 'workers', newTx.workerId);
  };

  const pushNotification = (title: string, message: string, type: AppNotification['type'] = 'success', linkTab?: string, linkId?: string) => {
    const notification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      message,
      type,
      date: `${getMoroccoDateISO()} ${new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}`,
      isRead: false,
      linkTab,
      linkId
    };
    setNotifications(previous => {
      const updated = [notification, ...previous].slice(0, 100);
      StorageService.saveNotifications(updated);
      return updated;
    });
  };

  // Quick Action Financial Creators & Purchases
  const addChickPurchase = (purchaseData: Omit<ChickPurchase, 'id' | 'createdAt'>, createCycleAutomatically: boolean = false) => {
    const newChickId = `chk-${Date.now()}`;
    let linkedCycleId = purchaseData.cycleId;

    // If auto create cycle requested
    if (createCycleAutomatically && !linkedCycleId) {
      const newCycleId = `cycle-${Date.now()}`;
      linkedCycleId = newCycleId;
      const supplier = partners.find(p => p.id === purchaseData.supplierId);
      const farm = farms.find(f => f.id === purchaseData.farmId);
      const [year, month, day] = purchaseData.date.split('-').map(Number);
      const expectedSaleDate = new Date(Date.UTC(year, month - 1, day + 42)).toISOString().substring(0, 10);
      
      const newCycle: PoultryCycle = {
        id: newCycleId,
        cycleNumber: `دورة ${purchaseData.breed} (${farm?.name?.split(' ')[0] || 'مزرعة'} - ${purchaseData.date})`,
        farmId: purchaseData.farmId,
        barnNumber: purchaseData.hangarName || 'عنبر 1',
        startDate: purchaseData.date,
        chickEntryDate: purchaseData.date,
        expectedSaleDate: expectedSaleDate,
        chickBreed: purchaseData.breed as any,
        initialChickCount: purchaseData.receivedHealthyCount,
        chickUnitPrice: purchaseData.unitPrice,
        chickSource: supplier?.name || purchaseData.supplierName || 'مفرخات معتمدة',
        hatcherySupplierId: purchaseData.supplierId,
        status: 'in_rearing',
        targetWeightKg: 2.25,
        notes: `تم إنشاء الدورة تلقائياً من فاتورة شراء الكتاكيت (${purchaseData.invoiceNumber})، استلام ${purchaseData.receivedHealthyCount.toLocaleString('ar-MA')} كتكوت.`,
        createdAt: new Date().toISOString()
      };
      const updatedCycles = [...cycles, newCycle];
      setCycles(updatedCycles);
      StorageService.saveCycles(updatedCycles);
    }

    const newChick: ChickPurchase = {
      ...purchaseData,
      id: newChickId,
      cycleId: linkedCycleId,
      createdAt: new Date().toISOString()
    };
    const updatedChicks = [newChick, ...chickPurchases];
    setChickPurchases(updatedChicks);
    StorageService.saveChickPurchases(updatedChicks);

    // If any amount paid immediately, record transaction
    if (newChick.paidAmount > 0 && newChick.accountId) {
      const supplier = partners.find(p => p.id === newChick.supplierId);
      const finTx: FinancialTransaction = {
        id: `tx-chk-${newChick.id}`,
        date: newChick.date,
        type: 'supplier_payment',
        amount: newChick.paidAmount,
        accountId: newChick.accountId,
        farmId: newChick.farmId,
        cycleId: linkedCycleId,
        partnerId: newChick.supplierId,
        referenceType: 'expense',
        referenceId: newChick.id,
        paymentMethod: newChick.paymentMethod,
        description: `دفعة لشراء كتاكيت (${newChick.invoiceNumber}) - المفرخة: ${supplier?.name || newChick.supplierName || 'مفرخات'}`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    pushNotification('استلام دفعة كتاكيت جديدة', `تم تسجيل استلام ${newChick.receivedHealthyCount.toLocaleString('ar-MA')} كتكوت (${newChick.breed}) بنجاح.`, 'success', 'cycles', linkedCycleId);

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'chick_purchase',
      entityId: newChick.id,
      details: `شراء واستلام كتاكيت: ${newChick.orderedCount} كتكوت (${newChick.breed})، صافي المستلم ${newChick.receivedHealthyCount} بمبلغ ${newChick.totalAmount} درهم (مدفوع: ${newChick.paidAmount}، مؤجل: ${newChick.remainingAmount})`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateChickPurchase = (id: string, purchaseData: Partial<ChickPurchase>) => {
    const updated = chickPurchases.map(c => c.id === id ? { ...c, ...purchaseData } : c);
    setChickPurchases(updated);
    StorageService.saveChickPurchases(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'chick_purchase',
      entityId: id,
      details: `تعديل بيانات شراء الكتاكيت رقم ${purchaseData.invoiceNumber || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteChickPurchase = (id: string) => {
    const target = chickPurchases.find(c => c.id === id);
    const updated = chickPurchases.filter(c => c.id !== id);
    setChickPurchases(updated);
    StorageService.saveChickPurchases(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'chick_purchase',
      entityId: id,
      details: `حذف سجل شراء الكتاكيت رقم ${target?.invoiceNumber || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Quick Action Financial Creators
  const addFeedPurchase = (purchaseData: Omit<FeedPurchase, 'id'>) => {
    const newFeed: FeedPurchase = {
      ...purchaseData,
      id: `feed-${Date.now()}`
    };
    const updatedFeeds = [...feedPurchases, newFeed];
    setFeedPurchases(updatedFeeds);
    StorageService.saveFeedPurchases(updatedFeeds);

    const stockMovement: FeedStockMovement = {
      id: `feed-movement-${newFeed.id}`,
      date: newFeed.date,
      type: 'purchase',
      quantityKg: newFeed.quantityKg,
      feedType: newFeed.feedType,
      brand: newFeed.brand,
      farmId: newFeed.farmId,
      cycleId: newFeed.cycleId,
      sourcePurchaseId: newFeed.id,
      unitCostPerKg: newFeed.unitPricePerKg,
      totalCost: newFeed.totalAmount,
      performedBy: currentUser.name,
      notes: `إدخال شراء علف ${newFeed.invoiceNumber || newFeed.id} إلى مخزن المزرعة`
    };
    const updatedMovements = [...feedMovements, stockMovement];
    setFeedMovements(updatedMovements);
    StorageService.saveFeedMovements(updatedMovements);

    // If any amount paid immediately, record transaction
    if (newFeed.paidAmount > 0 && newFeed.accountId) {
      const supplier = partners.find(p => p.id === newFeed.supplierId);
      const finTx: FinancialTransaction = {
        id: `tx-f-${newFeed.id}`,
        date: newFeed.date,
        type: 'supplier_payment',
        amount: newFeed.paidAmount,
        accountId: newFeed.accountId,
        farmId: newFeed.farmId,
        cycleId: newFeed.cycleId,
        partnerId: newFeed.supplierId,
        referenceType: 'feed',
        referenceId: newFeed.id,
        paymentMethod: newFeed.paymentMethod,
        description: `دفعة لشراء علف (${newFeed.brand}) من ${supplier?.name || 'مورد'}`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'feed_purchase',
      entityId: newFeed.id,
      details: `شراء علف: ${newFeed.quantityKg} كغ بمبلغ ${newFeed.totalAmount} درهم (مدفوع: ${newFeed.paidAmount}، مؤجل: ${newFeed.remainingAmount})`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل شراء العلف', `تم إدخال ${newFeed.quantityKg.toLocaleString()} كغ إلى مخزون المزرعة.`, 'success', 'feed_meds', newFeed.farmId);
  };

  const updateFeedPurchase = (id: string, purchaseData: Partial<FeedPurchase>) => {
    const updated = feedPurchases.map(f => f.id === id ? { ...f, ...purchaseData } : f);
    setFeedPurchases(updated);
    StorageService.saveFeedPurchases(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'feed_purchase',
      entityId: id,
      details: `تعديل فاتورة شراء علف: ${purchaseData.invoiceNumber || id} (الكمية: ${purchaseData.quantityKg || '—'} كغ، المبلغ: ${purchaseData.totalAmount || '—'} درهم)`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteFeedPurchase = (id: string) => {
    const target = feedPurchases.find(f => f.id === id);
    const updatedFeeds = feedPurchases.filter(f => f.id !== id);
    const updatedMovements = feedMovements.filter(m => m.sourcePurchaseId !== id);
    const updatedTxs = transactions.filter(t => t.referenceId !== id);
    setFeedPurchases(updatedFeeds);
    setFeedMovements(updatedMovements);
    setTransactions(updatedTxs);
    StorageService.saveFeedPurchases(updatedFeeds);
    StorageService.saveFeedMovements(updatedMovements);
    StorageService.saveTransactions(updatedTxs);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'feed_purchase',
      entityId: id,
      details: `حذف فاتورة شراء علف: ${target?.invoiceNumber || id} بكمية ${target?.quantityKg || 0} كغ وإلغاء حركات المخزون والسيولة المرتبطة بها`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const getFarmFeedStockKg = (farmId: string) => {
    const movementPurchaseIds = new Set(feedMovements.map(m => m.sourcePurchaseId).filter(Boolean));
    const purchasedKg = feedPurchases
      .filter(p => p.farmId === farmId && !movementPurchaseIds.has(p.id))
      .reduce((sum, p) => sum + Math.max(0, p.quantityKg || 0), 0);
    const movementInKg = feedMovements
      .filter(m => m.farmId === farmId && ['purchase', 'opening', 'transfer_in', 'return'].includes(m.type))
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const movementOutKg = feedMovements
      .filter(m => m.farmId === farmId && ['issue', 'transfer_out', 'waste'].includes(m.type))
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const movementLogIds = new Set(feedMovements.filter(m => m.dailyLogId).map(m => m.dailyLogId));
    const legacyConsumedKg = dailyLogs
      .filter(log => !movementLogIds.has(log.id) && cycles.some(c => c.id === log.cycleId && c.farmId === farmId))
      .reduce((sum, log) => sum + Math.max(0, log.feedConsumedKg || 0), 0);
    return Math.max(0, purchasedKg + movementInKg - movementOutKg - legacyConsumedKg);
  };

  const addFeedMovement = (movementData: Omit<FeedStockMovement, 'id'>) => {
    if (['opening', 'adjustment'].includes(movementData.type) && currentUser.role !== 'admin') return;
    if (!['opening', 'adjustment'].includes(movementData.type) && !canEnterDailyLogs && currentUser.role !== 'farm_manager') return;
    if (['issue', 'waste'].includes(movementData.type) && movementData.quantityKg > getFarmFeedStockKg(movementData.farmId)) return;
    const movement: FeedStockMovement = {
      ...movementData,
      id: `feed-movement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      quantityKg: Math.max(0, Number(movementData.quantityKg || 0)),
      performedBy: movementData.performedBy || currentUser.name
    };
    const updated = [...feedMovements, movement];
    setFeedMovements(updated);
    StorageService.saveFeedMovements(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'feed_movement',
      entityId: movement.id,
      details: `حركة علف ${movement.type}: ${movement.quantityKg} كغ للمزرعة ${movement.farmId}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addFeedTransfer = (movementData: Omit<FeedStockMovement, 'id' | 'type' | 'farmId' | 'sourceFarmId' | 'destinationFarmId'> & { sourceFarmId: string; destinationFarmId: string }) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'farm_manager') return;
    if (movementData.sourceFarmId === movementData.destinationFarmId || movementData.quantityKg <= 0) return;
    if (movementData.quantityKg > getFarmFeedStockKg(movementData.sourceFarmId)) return;
    const transferId = `feed-transfer-${Date.now()}`;
    const base = { ...movementData, date: movementData.date, quantityKg: Math.max(0, Number(movementData.quantityKg || 0)), performedBy: currentUser.name };
    const movements: FeedStockMovement[] = [
      { ...base, id: `${transferId}-out`, type: 'transfer_out', farmId: movementData.sourceFarmId, sourceFarmId: movementData.sourceFarmId, destinationFarmId: movementData.destinationFarmId, notes: movementData.notes || 'تحويل علف إلى مزرعة أخرى' },
      { ...base, id: `${transferId}-in`, type: 'transfer_in', farmId: movementData.destinationFarmId, sourceFarmId: movementData.sourceFarmId, destinationFarmId: movementData.destinationFarmId, notes: movementData.notes || 'استلام تحويل علف من مزرعة أخرى' }
    ];
    const updated = [...feedMovements, ...movements];
    setFeedMovements(updated);
    StorageService.saveFeedMovements(updated);
    StorageService.logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'create', entityType: 'feed_transfer', entityId: transferId, details: `تحويل ${base.quantityKg} كغ من ${movementData.sourceFarmId} إلى ${movementData.destinationFarmId}` });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addMedicationPurchase = (purchaseData: Omit<MedicationPurchase, 'id'>) => {
    const newMed: MedicationPurchase = {
      ...purchaseData,
      id: `med-${Date.now()}`
    };
    const updatedMeds = [...medicationPurchases, newMed];
    setMedicationPurchases(updatedMeds);
    StorageService.saveMedicationPurchases(updatedMeds);

    if (newMed.paidAmount > 0 && newMed.accountId) {
      const supplier = partners.find(p => p.id === newMed.supplierId);
      const finTx: FinancialTransaction = {
        id: `tx-m-${newMed.id}`,
        date: newMed.date,
        type: 'supplier_payment',
        amount: newMed.paidAmount,
        accountId: newMed.accountId,
        farmId: newMed.farmId,
        cycleId: newMed.cycleId,
        partnerId: newMed.supplierId,
        referenceType: 'medication',
        referenceId: newMed.id,
        paymentMethod: newMed.paymentMethod,
        description: `شراء أدوية (${newMed.medicationName}) من ${supplier?.name || 'مورد'}`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'medication_purchase',
      entityId: newMed.id,
      details: `شراء أدوية: ${newMed.medicationName} بمبلغ ${newMed.totalAmount} درهم`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل شراء الدواء', `تم إدخال ${newMed.medicationName} بكمية ${newMed.quantity} ${newMed.unit || 'وحدة'} إلى المخزون.`, 'success', 'feed_meds', newMed.farmId);
  };

  const getFarmMedicationStock = (farmId: string, purchaseId?: string) => {
    const purchases = medicationPurchases.filter(p => p.farmId === farmId && (!purchaseId || p.id === purchaseId));
    return purchases.reduce((sum, purchase) => {
      const movements = medicationMovements.filter(m => m.medicationPurchaseId === purchase.id);
      const received = movements.filter(m => ['purchase', 'opening', 'return'].includes(m.type)).reduce((s, m) => s + m.quantity, 0);
      const used = movements.filter(m => ['issue', 'waste'].includes(m.type)).reduce((s, m) => s + m.quantity, 0);
      return sum + Math.max(0, (received || purchase.quantity || 1) - used);
    }, 0);
  };

  const addMedicationMovement = (movementData: Omit<MedicationStockMovement, 'id'>) => {
    if (['opening', 'adjustment'].includes(movementData.type) && currentUser.role !== 'admin') return;
    const purchase = medicationPurchases.find(p => p.id === movementData.medicationPurchaseId);
    if (!purchase || movementData.quantity <= 0) return;
    if (['issue', 'waste'].includes(movementData.type) && movementData.quantity > getFarmMedicationStock(movementData.farmId, purchase.id)) return;
    const movement: MedicationStockMovement = { ...movementData, id: `med-movement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, quantity: Math.max(0, Number(movementData.quantity || 0)), performedBy: currentUser.name };
    const updated = [...medicationMovements, movement];
    setMedicationMovements(updated);
    StorageService.saveMedicationMovements(updated);
    StorageService.logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'create', entityType: 'medication_movement', entityId: movement.id, details: `حركة دواء ${movement.type}: ${movement.quantity} ${movement.unit} — ${movement.medicationName || purchase.medicationName}` });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    const updatedExp = [...expenses, newExp];
    setExpenses(updatedExp);
    StorageService.saveExpenses(updatedExp);

    if (newExp.paidAmount > 0 && newExp.accountId) {
      const finTx: FinancialTransaction = {
        id: `tx-e-${newExp.id}`,
        date: newExp.date,
        type: newExp.supplierId ? 'supplier_payment' : 'expense',
        amount: newExp.paidAmount,
        accountId: newExp.accountId,
        farmId: newExp.farmId,
        cycleId: newExp.cycleId,
        partnerId: newExp.supplierId,
        referenceType: 'expense',
        referenceId: newExp.id,
        paymentMethod: newExp.paymentMethod,
        description: newExp.description,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'expense',
      entityId: newExp.id,
      details: `تسجيل مصروف: ${newExp.description} بمبلغ ${newExp.amount} درهم`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل المصروف', `${newExp.description} — ${newExp.amount.toLocaleString()} DH`, 'success', 'finance', newExp.id);
  };

  const addSale = (saleData: Omit<WholesaleSale, 'id'>) => {
    const newSale: WholesaleSale = {
      ...saleData,
      id: `sale-${Date.now()}`
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    StorageService.saveSales(updatedSales);

    // If paid amount > 0, record financial collection transaction
    if (newSale.paidAmount > 0 && newSale.accountId) {
      const customer = partners.find(p => p.id === newSale.customerId);
      const finTx: FinancialTransaction = {
        id: `tx-s-${newSale.id}`,
        date: newSale.date,
        type: 'customer_payment',
        amount: newSale.paidAmount,
        accountId: newSale.accountId,
        farmId: newSale.farmId,
        cycleId: newSale.cycleId,
        partnerId: newSale.customerId,
        referenceType: 'sale',
        referenceId: newSale.id,
        paymentMethod: newSale.paymentMethod,
        description: `تحصيل مبيعات (${newSale.chickenCount} طائر، ${newSale.totalWeightKg} كغ) من ${customer?.name || 'الزبون'}`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'sale',
      entityId: newSale.id,
      details: `تسجيل فاتورة بيع ${newSale.invoiceNumber}: ${newSale.chickenCount} طائر بوزن ${newSale.totalWeightKg} كغ وإجمالي ${newSale.netTotal} درهم (متبقي: ${newSale.remainingAmount})`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل عملية البيع', `${newSale.invoiceNumber} — ${newSale.netTotal.toLocaleString()} DH`, 'success', 'sales', newSale.id);
  };

  const addFeedSale = (saleData: Omit<FeedSale, 'id' | 'createdAt'>) => {
    const newSale: FeedSale = {
      ...saleData,
      id: `fsale-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedSales = [...feedSales, newSale];
    setFeedSales(updatedSales);
    StorageService.saveFeedSales(updatedSales);

    const targetFarmId = newSale.farmId || newSale.sourceFarmId || (farms.length > 0 ? farms[0].id : 'farm-1');
    // Record feed stock movement of type 'sale' to deduct from farm stock
    const movement: FeedStockMovement = {
      id: `feed-movement-sale-${newSale.id}`,
      date: newSale.date,
      type: 'sale',
      quantityKg: newSale.quantityKg,
      farmId: targetFarmId,
      performedBy: currentUser.name,
      notes: `بيع علف للزبون (فاتورة: ${newSale.invoiceNumber || newSale.id}) - نوع: ${newSale.feedType || 'علف'}`
    };
    const updatedMovements = [...feedMovements, movement];
    setFeedMovements(updatedMovements);
    StorageService.saveFeedMovements(updatedMovements);

    // If paid amount > 0, record financial collection transaction
    if (newSale.paidAmount > 0 && newSale.accountId) {
      const customer = partners.find(p => p.id === newSale.customerId);
      const finTx: FinancialTransaction = {
        id: `tx-fs-${newSale.id}`,
        date: newSale.date,
        type: 'customer_payment',
        amount: newSale.paidAmount,
        accountId: newSale.accountId,
        farmId: targetFarmId,
        partnerId: newSale.customerId,
        referenceType: 'sale',
        referenceId: newSale.id,
        paymentMethod: newSale.paymentMethod,
        description: `تحصيل بيع علف (${newSale.quantityKg.toLocaleString()} كغ) من ${customer?.name || 'الزبون'}`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'feed_sale',
      entityId: newSale.id,
      details: `تسجيل بيع علف ${newSale.invoiceNumber || newSale.id}: ${newSale.quantityKg} كغ بمبلغ ${newSale.totalAmount} درهم (مدفوع: ${newSale.paidAmount}، متبقي: ${newSale.remainingAmount})`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل بيع العلف', `${newSale.invoiceNumber || 'فاتورة بيع'} — ${newSale.totalAmount.toLocaleString()} DH (${newSale.quantityKg.toLocaleString()} كغ)`, 'success', 'feed_meds', newSale.id);
  };

  const updateFeedSale = (id: string, saleData: Partial<FeedSale>) => {
    const updated = feedSales.map(s => s.id === id ? { ...s, ...saleData } : s);
    setFeedSales(updated);
    StorageService.saveFeedSales(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'feed_sale',
      entityId: id,
      details: `تعديل فاتورة بيع علف: ${saleData.invoiceNumber || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteFeedSale = (id: string) => {
    const target = feedSales.find(s => s.id === id);
    const updatedSales = feedSales.filter(s => s.id !== id);
    const updatedMovements = feedMovements.filter(m => m.id !== `feed-movement-sale-${id}`);
    const updatedTxs = transactions.filter(t => t.referenceId !== id);
    setFeedSales(updatedSales);
    setFeedMovements(updatedMovements);
    setTransactions(updatedTxs);
    StorageService.saveFeedSales(updatedSales);
    StorageService.saveFeedMovements(updatedMovements);
    StorageService.saveTransactions(updatedTxs);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'feed_sale',
      entityId: id,
      details: `حذف فاتورة بيع علف: ${target?.invoiceNumber || id} واسترجاع المخزون والسيولة المرتبطة`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addChickSale = (saleData: Omit<ChickSale, 'id' | 'createdAt'>) => {
    const newSale: ChickSale = {
      ...saleData,
      id: `csale-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedSales = [...chickSales, newSale];
    setChickSales(updatedSales);
    StorageService.saveChickSales(updatedSales);

    const targetFarmId = newSale.farmId || newSale.sourceFarmId || (farms.length > 0 ? farms[0].id : 'farm-1');
    // If paid amount > 0, record financial collection transaction
    if (newSale.paidAmount > 0 && newSale.accountId) {
      const customer = partners.find(p => p.id === newSale.customerId);
      const finTx: FinancialTransaction = {
        id: `tx-cs-${newSale.id}`,
        date: newSale.date,
        type: 'customer_payment',
        amount: newSale.paidAmount,
        accountId: newSale.accountId,
        farmId: targetFarmId,
        partnerId: newSale.customerId,
        referenceType: 'sale',
        referenceId: newSale.id,
        paymentMethod: newSale.paymentMethod,
        description: `تحصيل بيع كتاكيت (${newSale.quantity.toLocaleString()} كتكوت) من ${customer?.name || 'الزبون'}`,
        performedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const updatedTxs = [...transactions, finTx];
      setTransactions(updatedTxs);
      StorageService.saveTransactions(updatedTxs);
    }

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'chick_sale',
      entityId: newSale.id,
      details: `تسجيل بيع كتاكيت ${newSale.invoiceNumber || newSale.id}: ${newSale.quantity} كتكوت بمبلغ ${newSale.totalAmount} درهم (سعر الوحدة: ${newSale.unitPrice} DH)`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل بيع الكتاكيت', `${newSale.invoiceNumber || 'فاتورة بيع'} — ${newSale.totalAmount.toLocaleString()} DH (${newSale.quantity.toLocaleString()} كتكوت)`, 'success', 'chicks', newSale.id);
  };

  const updateChickSale = (id: string, saleData: Partial<ChickSale>) => {
    const updated = chickSales.map(s => s.id === id ? { ...s, ...saleData } : s);
    setChickSales(updated);
    StorageService.saveChickSales(updated);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entityType: 'chick_sale',
      entityId: id,
      details: `تعديل فاتورة بيع كتاكيت: ${saleData.invoiceNumber || id}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteChickSale = (id: string) => {
    const target = chickSales.find(s => s.id === id);
    const updatedSales = chickSales.filter(s => s.id !== id);
    const updatedTxs = transactions.filter(t => t.referenceId !== id);
    setChickSales(updatedSales);
    setTransactions(updatedTxs);
    StorageService.saveChickSales(updatedSales);
    StorageService.saveTransactions(updatedTxs);
    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entityType: 'chick_sale',
      entityId: id,
      details: `حذف فاتورة بيع كتاكيت: ${target?.invoiceNumber || id} بكمية ${target?.quantity || 0} وإلغاء السيولة المرتبطة`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const addSettlementTransaction = (tx: {
    partnerId: string;
    amount: number;
    type: 'customer_payment' | 'supplier_payment';
    accountId: string;
    description: string;
    paymentMethod: any;
  }) => {
    const partner = partners.find(p => p.id === tx.partnerId);
    const finTx: FinancialTransaction = {
      id: `tx-settle-${Date.now()}`,
      date: getMoroccoDateISO(),
      type: tx.type,
      amount: tx.amount,
      accountId: tx.accountId,
      partnerId: tx.partnerId,
      referenceType: 'debt_payment',
      paymentMethod: tx.paymentMethod,
      description: tx.description || `${tx.type === 'customer_payment' ? 'تحصيل دين من' : 'سداد دين إلى'} ${partner?.name || ''}`,
      performedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [...transactions, finTx];
    setTransactions(updatedTxs);
    StorageService.saveTransactions(updatedTxs);

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'debt_payment',
      entityId: finTx.id,
      details: `تسوية ذمم مالية: ${finTx.description} بمبلغ ${tx.amount} درهم`
    });
    setAuditLogs(StorageService.getAuditLogs());
    pushNotification('تم تسجيل التسوية المالية', `${finTx.description} — ${finTx.amount.toLocaleString()} DH`, 'success', 'finance', finTx.id);
  };

  const addAccountTransfer = (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    const finTx: FinancialTransaction = {
      id: `tx-xfer-${Date.now()}`,
      date: getMoroccoDateISO(),
      type: 'account_transfer',
      amount,
      accountId: fromAccountId,
      targetAccountId: toAccountId,
      paymentMethod: 'cash',
      description: `تحويل سيولة من ${fromAcc?.name || 'حساب'} إلى ${toAcc?.name || 'حساب'}${notes ? ` (${notes})` : ''}`,
      performedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };
    const updatedTxs = [...transactions, finTx];
    setTransactions(updatedTxs);
    StorageService.saveTransactions(updatedTxs);

    StorageService.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entityType: 'account_transfer',
      entityId: finTx.id,
      details: finTx.description
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  const refreshAll = () => {
    setUsers(StorageService.getUsers());
    setFarms(StorageService.getFarms());
    setCycles(StorageService.getCycles());
    setDailyLogs(StorageService.getDailyLogs());
    setPartners(StorageService.getPartners());
    setAccounts(StorageService.getAccounts());
    setWorkers(StorageService.getWorkers());
    setWorkerTransactions(StorageService.getWorkerTransactions());
    setChickPurchases(StorageService.getChickPurchases());
    setFeedPurchases(StorageService.getFeedPurchases());
    setFeedMovements(StorageService.getFeedMovements());
    setMedicationPurchases(StorageService.getMedicationPurchases());
    setMedicationMovements(StorageService.getMedicationMovements());
    setExpenses(StorageService.getExpenses());
    setSales(StorageService.getSales());
    setFeedSales(StorageService.getFeedSales());
    setChickSales(StorageService.getChickSales());
    setTransactions(StorageService.getTransactions());
    setNotifications(StorageService.getNotifications());
    setAuditLogs(StorageService.getAuditLogs());
    setBackupSnapshots(StorageService.getBackupSnapshots());
    setAutoBackupSettingsState(StorageService.getAutoBackupSettings());
  };

  const resetAllData = () => {
    StorageService.resetToDemoData();
    refreshAll();
  };

  const syncData = () => {
    if (currentUser.role !== 'admin') return;
    setSyncStatus({ isSyncing: true, lastSyncTime: 'جاري الحفظ والمزامنة...' });
    void StorageService.syncAllToRemote().then(() => {
      StorageService.createBackupSnapshot('auto_interval', 'نسخة مزامنة سحابية وقاعدة بيانات فورية');
      refreshAll();
      setSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
      });
    }).catch(() => setSyncStatus({ isSyncing: false, lastSyncTime: 'فشلت المزامنة - تحقق من الاتصال' }));
  };

  const updateAutoBackupSettings = (newSettings: Partial<AutoBackupSettings>) => {
    if (currentUser.role !== 'admin') return;
    const current = StorageService.getAutoBackupSettings();
    const updated = { ...current, ...newSettings };
    StorageService.saveAutoBackupSettings(updated);
    setAutoBackupSettingsState(updated);
  };

  const createManualBackupSnapshot = (description?: string): BackupSnapshot => {
    if (currentUser.role !== 'admin') return StorageService.getBackupSnapshots()[0];
    const snap = StorageService.createBackupSnapshot('manual', description);
    refreshAll();
    return snap;
  };

  const restoreBackupSnapshot = (snapshotId: string): boolean => {
    if (currentUser.role !== 'admin') return false;
    const success = StorageService.restoreFromSnapshot(snapshotId);
    if (success) {
      refreshAll();
    }
    return success;
  };

  const deleteBackupSnapshot = (snapshotId: string) => {
    if (currentUser.role !== 'admin') return;
    StorageService.deleteSnapshot(snapshotId);
    setBackupSnapshots(StorageService.getBackupSnapshots());
  };

  const downloadManualBackup = (format: 'json' | 'csv_financial' | 'csv_production' = 'json') => {
    if (format === 'json') {
      const jsonStr = StorageService.exportFullBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mazariina_full_backup_${getMoroccoDateISO()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const importBackup = (jsonStr: string): boolean => {
    const success = StorageService.importFullBackup(jsonStr);
    if (success) {
      refreshAll();
    }
    return success;
  };

  const exportBackup = (): string => {
    return StorageService.exportFullBackup();
  };

  return (
    <FarmContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        language,
        setLanguage,
        selectedFarmId,
        setSelectedFarmId,
        currency,
        users,
        farms,
        cycles,
        dailyLogs,
        partners,
        accounts,
        workers,
        workerTransactions,
        chickPurchases,
        feedPurchases,
        feedMovements,
        medicationPurchases,
        medicationMovements,
        expenses,
        sales,
        feedSales,
        chickSales,
        transactions,
        notifications,
        auditLogs,
        backupSnapshots,
        autoBackupSettings,
        updateAutoBackupSettings,
        createManualBackupSnapshot,
        restoreBackupSnapshot,
        deleteBackupSnapshot,
        downloadManualBackup,
        syncStatus,
        syncData,
        refreshAll,
        isOnline,
        dataSource,
        accountBalances,
        partnerBalances,
        totalLiquidity,
        totalActiveBirds,
        todaySales,
        todayExpenses,
        todayCollections,
        todayPayments,
        allCycleSummaries,
        addFarm,
        updateFarm,
        deleteFarm,
        addCycle,
        updateCycle,
        deleteCycle,
        completeCycle,
        addDailyLog,
        addPartner,
        updatePartner,
        deletePartner,
        addAccount,
        updateAccount,
        addWorker,
        updateWorker,
        addWorkerTransaction,
        addChickPurchase,
        updateChickPurchase,
        deleteChickPurchase,
        addFeedPurchase,
        updateFeedPurchase,
        deleteFeedPurchase,
        getFarmFeedStockKg,
        addFeedMovement,
        addFeedTransfer,
        addMedicationPurchase,
        addMedicationMovement,
        addExpense,
        addSale,
        addFeedSale,
        updateFeedSale,
        deleteFeedSale,
        addChickSale,
        updateChickSale,
        deleteChickSale,
        addSettlementTransaction,
        addAccountTransfer,
        markNotificationAsRead,
        clearAllNotifications,
        resetAllData,
        importBackup,
        exportBackup,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        cancelAuditOperation,
        canManageFarms,
        canManageFinance,
        canViewReports,
        canManageCycles,
        canEnterDailyLogs,
        canManageSales,
        canManageUsers,
        canCancelOperations,
        hasPermission,
        isFarmAllowed
        ,isHangarAllowed
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
