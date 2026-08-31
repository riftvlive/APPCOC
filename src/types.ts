export type UserRole = 'admin' | 'farm_manager' | 'accountant' | 'worker';

export type Language = 'ar' | 'fr';

export type CycleStatus = 'in_rearing' | 'ready_for_sale' | 'completed';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'delayed' | 'partial';

export type TransactionType = 
  | 'income' 
  | 'expense' 
  | 'customer_payment' 
  | 'supplier_payment' 
  | 'worker_salary' 
  | 'worker_loan' 
  | 'account_transfer'
  | 'refund';

export type ExpenseCategory = 
  | 'chicks'
  | 'feed'
  | 'medication'
  | 'vaccines'
  | 'labor'
  | 'electricity'
  | 'water'
  | 'transport'
  | 'fuel'
  | 'maintenance'
  | 'cleaning_disinfection'
  | 'equipment'
  | 'rent'
  | 'telecom'
  | 'admin'
  | 'other';

export type PartnerType = 'supplier' | 'customer' | 'both';

export interface UserPermissions {
  canManageFarms: boolean;
  canManageCycles: boolean;
  canEnterDailyLogs: boolean;
  canManageSales: boolean;
  canManagePurchases: boolean;
  canManageFinance: boolean;
  canManageWorkers: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canManageFarms: true,
    canManageCycles: true,
    canEnterDailyLogs: true,
    canManageSales: true,
    canManagePurchases: true,
    canManageFinance: true,
    canManageWorkers: true,
    canViewReports: true,
    canManageUsers: true,
  },
  farm_manager: {
    canManageFarms: true,
    canManageCycles: true,
    canEnterDailyLogs: true,
    canManageSales: true,
    canManagePurchases: true,
    canManageFinance: false,
    canManageWorkers: true,
    canViewReports: true,
    canManageUsers: false,
  },
  accountant: {
    canManageFarms: false,
    canManageCycles: false,
    canEnterDailyLogs: false,
    canManageSales: true,
    canManagePurchases: true,
    canManageFinance: true,
    canManageWorkers: true,
    canViewReports: true,
    canManageUsers: false,
  },
  worker: {
    canManageFarms: false,
    canManageCycles: false,
    canEnterDailyLogs: true,
    canManageSales: false,
    canManagePurchases: false,
    canManageFinance: false,
    canManageWorkers: false,
    canViewReports: false,
    canManageUsers: false,
  },
};

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  username?: string;
  role: UserRole;
  allowedFarmIds?: string[]; // empty or undefined means all
  permissions?: Partial<UserPermissions>;
  status?: 'active' | 'inactive';
  avatar?: string;
  notes?: string;
  createdAt?: string;
}

export interface FarmHangar {
  id: string;
  name: string;
  capacity: number;
  surfaceM2?: number;
  ventilationType?: 'tunnel' | 'cross' | 'natural' | string;
  heatingType?: 'gas_canon' | 'radiant' | 'electric' | string;
  coolingPads?: boolean;
  feedLinesType?: 'automatic_pan' | 'manual' | string;
  supervisorWorkerId?: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  areaSquareMeters?: number;
  surfaceM2?: number;
  barnsCount?: number;
  hangarsCount?: number;
  hangars?: FarmHangar[];
  capacity: number;
  managerName?: string;
  managerPhone?: string;
  status?: 'active' | 'sanitizing' | 'maintenance' | 'inactive';
  notes?: string;
  createdAt?: string;
  managerId?: string;
  waterSource?: string;
  generatorBackup?: boolean;
}

export interface DailyLog {
  id: string;
  cycleId: string;
  date: string;
  dayNumber: number;
  mortalityCount: number;
  feedConsumedKg: number;
  waterConsumedLiters?: number;
  sampleAverageWeightGrams?: number;
  temperatureCelsius?: number;
  humidityPercent?: number;
  notes?: string;
}

export interface PoultryCycle {
  id: string;
  cycleNumber: string;
  farmId: string;
  barnNumber?: string;
  startDate: string;
  chickEntryDate: string;
  expectedSaleDate?: string;
  actualSaleDate?: string;
  chickBreed: string;
  initialChickCount: number;
  chickUnitPrice: number;
  chickSource?: string;
  hatcherySupplierId?: string;
  status: CycleStatus | 'active';
  notes?: string;
  targetWeightKg?: number;
  createdAt?: string;
}

export interface ChickPurchase {
  id: string;
  invoiceNumber: string;
  batchNumber?: string;
  date: string;
  supplierId: string;
  supplierName?: string;
  breed: string; // e.g. 'Ross 308' | 'Cobb 500' | 'Hubbard Classic' | 'Sasso' | 'ISA Brown' | 'بلدي محسن'
  chickType?: 'broiler' | 'layer' | 'sasso' | 'baladi' | string;
  farmId: string;
  hangarName?: string;
  cycleId?: string;
  orderedCount: number;
  bonusPercent?: number; // e.g. 2%
  bonusCount?: number; // e.g. 400
  transportMortalityCount: number; // e.g. 35
  receivedHealthyCount: number; // ordered + bonus - transportMortality
  unitPrice: number; // e.g. 5.80 DH
  chickCost: number; // orderedCount * unitPrice
  transportCost?: number;
  vaccineCostAtHatchery?: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  accountId?: string;
  truckPlate?: string;
  driverName?: string;
  driverPhone?: string;
  receptionTime?: string;
  boxTemperatureCelsius?: number;
  averageWeightGrams?: number; // e.g. 42g
  uniformityPercent?: number; // e.g. 85%
  hatcheryVaccines?: string[]; // e.g. ['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)', 'جمبورو (IBD)']
  qualityScore?: 'excellent' | 'good' | 'acceptable' | 'poor';
  notes?: string;
  createdAt?: string;
}

export interface FeedPurchase {
  id: string;
  invoiceNumber?: string;
  date: string;
  supplierId: string;
  feedType: 'starter' | 'grower' | 'finisher' | 'other';
  brand: string;
  quantityKg: number;
  bagsCount?: number;
  bagWeightKg?: number;
  unitPricePerKg: number;
  totalAmount: number;
  farmId: string;
  cycleId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  remainingAmount: number;
  accountId?: string;
  notes?: string;
}

export interface MedicationPurchase {
  id: string;
  date: string;
  supplierId: string;
  medicationName: string;
  category: 'vaccine' | 'antibiotic' | 'vitamin' | 'disinfectant' | 'supplement';
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalAmount: number;
  farmId: string;
  cycleId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  remainingAmount: number;
  accountId?: string;
  dosageInstructions?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory | string;
  customCategoryName?: string;
  description: string;
  amount: number;
  farmId?: string;
  cycleId?: string;
  supplierId?: string;
  workerId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  remainingAmount: number;
  accountId?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface WholesaleSale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  farmId: string;
  cycleId: string;
  chickenCount: number;
  totalWeightKg: number;
  averageWeightKg: number;
  pricePerKg: number;
  grossTotal: number;
  discount?: number;
  netTotal: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  accountId?: string;
  truckPlate?: string;
  truckNumber?: string;
  driverName?: string;
  notes?: string;
}

export interface Partner {
  id: string;
  name: string;
  company?: string;
  companyName?: string;
  phone: string;
  address?: string;
  type: PartnerType;
  category?: string;
  activityType?: string;
  openingBalance: number;
  notes?: string;
  createdAt?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  nationalId?: string;
  jobTitle: string;
  farmId: string;
  startDate?: string;
  hireDate?: string;
  monthlySalary: number;
  paymentFrequency?: 'monthly' | 'weekly' | 'daily';
  status?: 'active' | 'on_leave' | 'terminated';
  isActive?: boolean;
  currentBalance?: number;
  notes?: string;
}

export interface WorkerTransaction {
  id: string;
  workerId: string;
  farmId: string;
  cycleId?: string;
  date: string;
  type: 'salary' | 'advance_loan' | 'bonus' | 'deduction';
  amount: number;
  accountId?: string;
  description: string;
}

export interface CashAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'cash_box' | 'bank_account' | 'other';
  bankName?: string;
  accountNumber?: string;
  openingBalance: number;
  currentBalance?: number;
  isDefault?: boolean;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  targetAccountId?: string;
  farmId?: string;
  cycleId?: string;
  partnerId?: string;
  workerId?: string;
  referenceType?: 'sale' | 'expense' | 'feed' | 'medication' | 'worker' | 'debt_payment' | 'transfer' | 'opening';
  referenceId?: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptNumber?: string;
  performedBy: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'sync' | 'backup' | 'CREATE' | 'UPDATE' | 'DELETE' | string;
  entityType?: string;
  entity?: string;
  entityId?: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  date: string;
  isRead: boolean;
  linkTab?: string;
  linkId?: string;
}

export interface CycleFinancialSummary {
  cycleId: string;
  cycleNumber: string;
  farmName: string;
  startDate: string;
  endDate?: string;
  durationDays: number;
  status: CycleStatus | 'active' | 'completed';
  
  // Birds stats
  initialChicks: number;
  chicksCost: number;
  totalMortality: number;
  mortalityRatePercent: number;
  totalSoldChicks: number;
  remainingLiveChicks: number;
  totalWeightSoldKg: number;
  averageBirdWeightKg: number;

  // Feeds stats
  totalFeedKg: number;
  totalFeedCost: number;
  feedCostPerBird: number;
  fcr: number;

  // Medications stats
  totalMedicationCost: number;
  medicationCostPerBird: number;

  // Labor and other expenses
  totalLaborCost: number;
  totalUtilitiesCost: number;
  totalOtherExpenses: number;

  // Total Costs
  totalCycleCost: number;
  costPerLiveBird: number;
  costPerKg: number;

  // Revenue & Profit
  totalRevenue: number;
  averageSellingPricePerKg: number;
  netProfit: number;
  profitMarginPercent: number;
  profitPerBird: number;
  profitPerKg: number;

  // Collection
  collectedRevenue: number;
  uncollectedReceivables: number;
}

export interface PartnerBalancesOverview {
  customerReceivables: Record<string, { totalReceivable: number; paidAmount: number; remainingDue: number }>;
  supplierPayables: Record<string, { totalPayable: number; paidAmount: number; remainingDebt: number }>;
  totalReceivables: number;
  totalPayables: number;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  trigger: 'auto_interval' | 'auto_action' | 'manual' | 'pre_restore';
  description: string;
  recordStats: {
    farms: number;
    cycles: number;
    dailyLogs: number;
    transactions: number;
    sales: number;
    feeds: number;
    auditLogs: number;
  };
  sizeBytes: number;
  dataJson: string;
}

export interface AutoBackupSettings {
  enabled: boolean;
  intervalMinutes: number; // e.g., 30, 60, 360, 1440
  backupOnCriticalAction: boolean;
  maxSnapshotsToKeep: number;
  lastBackupTimestamp?: string;
}
