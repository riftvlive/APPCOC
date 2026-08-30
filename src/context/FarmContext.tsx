import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  UserRole,
  UserPermissions,
  DEFAULT_ROLE_PERMISSIONS,
  Language,
  CycleFinancialSummary
} from '../types';
import { StorageService } from '../services/storageService';

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
  feedPurchases: FeedPurchase[];
  medicationPurchases: MedicationPurchase[];
  expenses: Expense[];
  sales: WholesaleSale[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
  auditLogs: AuditLogEntry[];
  isOnline: boolean;

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
  completeCycle: (id: string, actualSaleDate: string) => void;

  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;

  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;

  addAccount: (account: Omit<CashAccount, 'id'>) => void;
  updateAccount: (id: string, account: Partial<CashAccount>) => void;

  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  addWorkerTransaction: (tx: Omit<WorkerTransaction, 'id'>) => void;

  // Quick Action Financial Creators
  addFeedPurchase: (purchase: Omit<FeedPurchase, 'id'>) => void;
  addMedicationPurchase: (purchase: Omit<MedicationPurchase, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addSale: (sale: Omit<WholesaleSale, 'id'>) => void;
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

  // Role permissions helpers
  canManageFarms: boolean;
  canManageFinance: boolean;
  canViewReports: boolean;
  canManageCycles: boolean;
  canManageUsers: boolean;
  hasPermission: (permissionKey: keyof UserPermissions) => boolean;
  isFarmAllowed: (farmId: string) => boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUsers = StorageService.getUsers();
    return savedUsers[0] || { id: 'usr-admin', name: 'المدير العام', phone: '', role: 'admin' };
  });
  const [language, setLanguageState] = useState<Language>('ar');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [currency] = useState<string>('DH');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Entities
  const [farms, setFarms] = useState<Farm[]>(StorageService.getFarms());
  const [cycles, setCycles] = useState<PoultryCycle[]>(StorageService.getCycles());
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(StorageService.getDailyLogs());
  const [partners, setPartners] = useState<Partner[]>(StorageService.getPartners());
  const [accounts, setAccounts] = useState<CashAccount[]>(StorageService.getAccounts());
  const [workers, setWorkers] = useState<Worker[]>(StorageService.getWorkers());
  const [workerTransactions, setWorkerTransactions] = useState<WorkerTransaction[]>(StorageService.getWorkerTransactions());
  const [feedPurchases, setFeedPurchases] = useState<FeedPurchase[]>(StorageService.getFeedPurchases());
  const [medicationPurchases, setMedicationPurchases] = useState<MedicationPurchase[]>(StorageService.getMedicationPurchases());
  const [expenses, setExpenses] = useState<Expense[]>(StorageService.getExpenses());
  const [sales, setSales] = useState<WholesaleSale[]>(StorageService.getSales());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(StorageService.getTransactions());
  const [notifications, setNotifications] = useState<AppNotification[]>(StorageService.getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(StorageService.getAuditLogs());

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
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
  }, [partners, sales, feedPurchases, medicationPurchases, expenses, transactions]);

  const allCycleSummaries = useMemo(() => {
    return cycles.map(c => StorageService.calculateCycleSummary(c.id));
  }, [cycles, feedPurchases, medicationPurchases, expenses, sales, dailyLogs, workerTransactions]);

  const totalActiveBirds = useMemo(() => {
    return allCycleSummaries
      .filter(c => c.status !== 'completed')
      .reduce((sum, c) => sum + c.remainingLiveChicks, 0);
  }, [allCycleSummaries]);

  // Today metrics
  const todayStr = new Date().toISOString().substring(0, 10);

  const todaySales = useMemo(() => {
    return sales
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.netTotal, 0);
  }, [sales, todayStr]);

  const todayExpenses = useMemo(() => {
    const directExp = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
    const feedExp = feedPurchases.filter(f => f.date === todayStr).reduce((sum, f) => sum + f.totalAmount, 0);
    const medExp = medicationPurchases.filter(m => m.date === todayStr).reduce((sum, m) => sum + m.totalAmount, 0);
    return directExp + feedExp + medExp;
  }, [expenses, feedPurchases, medicationPurchases, todayStr]);

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
    if (user.role === 'admin') return true;
    if (user.permissions && user.permissions[permissionKey] !== undefined) {
      return !!user.permissions[permissionKey];
    }
    return DEFAULT_ROLE_PERMISSIONS[user.role]?.[permissionKey] ?? false;
  };

  const isFarmAllowed = (farmId: string, user: User = currentUser): boolean => {
    if (user.role === 'admin') return true;
    if (!user.allowedFarmIds || user.allowedFarmIds.length === 0) return true;
    return user.allowedFarmIds.includes(farmId);
  };

  // Role permissions shortcuts
  const canManageFarms = hasPermission('canManageFarms');
  const canManageFinance = hasPermission('canManageFinance');
  const canViewReports = hasPermission('canViewReports');
  const canManageCycles = hasPermission('canManageCycles');
  const canManageUsers = hasPermission('canManageUsers');

  // User management methods
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: userData.status || 'active',
      createdAt: new Date().toISOString().substring(0, 10),
      permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userData.role]
    };
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);
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

  // State mutators with auto-sync, storage persistence & audit logging
  const addFarm = (farmData: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10)
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
      createdAt: new Date().toISOString().substring(0, 10)
    };
    const updated = [...cycles, newCycle];
    setCycles(updated);
    StorageService.saveCycles(updated);

    // Also record chick purchase expense automatically if chick cost exists
    if (newCycle.initialChickCount > 0 && newCycle.chickUnitPrice > 0) {
      const totalChickCost = newCycle.initialChickCount * newCycle.chickUnitPrice;
      const chickExp: Expense = {
        id: `exp-chicks-${newCycle.id}`,
        date: newCycle.chickEntryDate,
        category: 'chicks',
        description: `شراء ${newCycle.initialChickCount.toLocaleString()} كتكوت (${newCycle.chickBreed}) لدورة ${newCycle.cycleNumber}`,
        amount: totalChickCost,
        farmId: newCycle.farmId,
        cycleId: newCycle.id,
        paymentMethod: 'partial',
        paidAmount: totalChickCost,
        remainingAmount: 0,
        accountId: accounts[0]?.id || 'acc-caisse-main'
      };
      const updatedExp = [...expenses, chickExp];
      setExpenses(updatedExp);
      StorageService.saveExpenses(updatedExp);
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

  const completeCycle = (id: string, actualSaleDate: string) => {
    updateCycle(id, {
      status: 'completed',
      actualSaleDate
    });
  };

  const addDailyLog = (logData: Omit<DailyLog, 'id'>) => {
    const newLog: DailyLog = {
      ...logData,
      id: `log-${Date.now()}`
    };
    const updated = [...dailyLogs, newLog];
    setDailyLogs(updated);
    StorageService.saveDailyLogs(updated);

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
      createdAt: new Date().toISOString().substring(0, 10)
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
      date: new Date().toISOString().substring(0, 10),
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
  };

  const addAccountTransfer = (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    const finTx: FinancialTransaction = {
      id: `tx-xfer-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
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

  const resetAllData = () => {
    StorageService.resetToDemoData();
    setUsers(StorageService.getUsers());
    setFarms(StorageService.getFarms());
    setCycles(StorageService.getCycles());
    setDailyLogs(StorageService.getDailyLogs());
    setPartners(StorageService.getPartners());
    setAccounts(StorageService.getAccounts());
    setWorkers(StorageService.getWorkers());
    setWorkerTransactions(StorageService.getWorkerTransactions());
    setFeedPurchases(StorageService.getFeedPurchases());
    setMedicationPurchases(StorageService.getMedicationPurchases());
    setExpenses(StorageService.getExpenses());
    setSales(StorageService.getSales());
    setTransactions(StorageService.getTransactions());
    setNotifications(StorageService.getNotifications());
    setAuditLogs(StorageService.getAuditLogs());
  };

  const importBackup = (jsonStr: string): boolean => {
    const success = StorageService.importFullBackup(jsonStr);
    if (success) {
      setFarms(StorageService.getFarms());
      setCycles(StorageService.getCycles());
      setDailyLogs(StorageService.getDailyLogs());
      setPartners(StorageService.getPartners());
      setAccounts(StorageService.getAccounts());
      setWorkers(StorageService.getWorkers());
      setWorkerTransactions(StorageService.getWorkerTransactions());
      setFeedPurchases(StorageService.getFeedPurchases());
      setMedicationPurchases(StorageService.getMedicationPurchases());
      setExpenses(StorageService.getExpenses());
      setSales(StorageService.getSales());
      setTransactions(StorageService.getTransactions());
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
        feedPurchases,
        medicationPurchases,
        expenses,
        sales,
        transactions,
        notifications,
        auditLogs,
        isOnline,
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
        completeCycle,
        addDailyLog,
        addPartner,
        updatePartner,
        addAccount,
        updateAccount,
        addWorker,
        updateWorker,
        addWorkerTransaction,
        addFeedPurchase,
        addMedicationPurchase,
        addExpense,
        addSale,
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
        canManageFarms,
        canManageFinance,
        canViewReports,
        canManageCycles,
        canManageUsers,
        hasPermission,
        isFarmAllowed
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
