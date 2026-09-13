import React, { useState, useMemo } from 'react';
import {
  Wheat,
  Pill,
  Plus,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Building2,
  Warehouse,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowDownRight,
  ArrowUpRight,
  Scale,
  Coins,
  Filter,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Activity,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Package,
  Truck,
  AlertTriangle,
  ShoppingCart,
  X
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { getMoroccoDateISO } from '../../utils/date';
import { FeedPurchase, FeedStockMovement, FeedSale, PaymentMethod } from '../../types';

interface FeedMedsViewProps {
  onOpenQuickAction: (action?: string) => void;
  initialSubTab?: string;
  onNavigate?: (tab: string, id?: string) => void;
}

export const FeedMedsView: React.FC<FeedMedsViewProps> = ({ onOpenQuickAction, initialSubTab, onNavigate }) => {
  const {
    feedPurchases,
    feedMovements,
    feedSales,
    dailyLogs,
    medicationPurchases,
    medicationMovements,
    partners,
    accounts,
    cycles,
    farms,
    transactions,
    currency,
    language,
    selectedFarmId,
    addFeedPurchase,
    updateFeedPurchase,
    deleteFeedPurchase,
    addFeedSale,
    updateFeedSale,
    deleteFeedSale,
    getFarmFeedStockKg,
    addFeedMovement,
    addFeedTransfer,
    addMedicationMovement,
    addSettlementTransaction,
    canEnterDailyLogs,
    canManagePurchases,
    canManageFinance,
    isFarmAllowed,
    currentUser
  } = useFarm();

  // Primary navigation tab
  const [activeMainTab, setActiveMainTab] = useState<'unified_ledger' | 'finance' | 'purchases' | 'sales' | 'distribution' | 'inventory_audit' | 'meds'>('unified_ledger');

  // React to initialSubTab from sidebar or deep links
  React.useEffect(() => {
    if (!initialSubTab) return;
    if (initialSubTab === 'feed_finance' || initialSubTab === 'finance') {
      setActiveMainTab('finance');
    } else if (initialSubTab === 'feed_purchases' || initialSubTab === 'purchases') {
      setActiveMainTab('purchases');
    } else if (initialSubTab === 'feed_sales' || initialSubTab === 'sales') {
      setActiveMainTab('sales');
    } else if (initialSubTab === 'feed_issues' || initialSubTab === 'distribution') {
      setActiveMainTab('distribution');
    } else if (initialSubTab === 'feed_suppliers') {
      setActiveMainTab('finance');
    } else if (initialSubTab === 'feed_adjustments' || initialSubTab === 'inventory_audit') {
      setActiveMainTab('inventory_audit');
    } else if (initialSubTab === 'feed_meds_list' || initialSubTab === 'meds') {
      setActiveMainTab('meds');
    } else if (initialSubTab === 'feed_overview' || initialSubTab === 'feed-meds' || initialSubTab === 'feed_meds') {
      setActiveMainTab('unified_ledger');
    }
  }, [initialSubTab]);

  // Filters for Unified Ledger
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'consumption' | 'payment' | 'transfer' | 'waste_adjustment'>('all');
  const [filterFeedCategory, setFilterFeedCategory] = useState<'all' | 'starter' | 'grower' | 'finisher'>('all');
  const [filterFarmId, setFilterFarmId] = useState<string>('all');
  const [filterSupplierId, setFilterSupplierId] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Action / Entry Modals
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [supplierPaymentModalOpen, setSupplierPaymentModalOpen] = useState(false);
  const [customerCollectionModalOpen, setCustomerCollectionModalOpen] = useState(false);
  const [collectCustomerId, setCollectCustomerId] = useState('');
  const [collectAmount, setCollectAmount] = useState<number | ''>('');
  const [collectAccountId, setCollectAccountId] = useState(accounts[0]?.id || '');
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('cash');
  const [collectNotes, setCollectNotes] = useState('');
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<FeedPurchase | null>(null);

  // Form states: New Feed Purchase
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(`F-FEED-${Date.now().toString().slice(-4)}`);
  const [newDate, setNewDate] = useState(getMoroccoDateISO());
  const [newSupplierId, setNewSupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [newFeedType, setNewFeedType] = useState<'starter' | 'grower' | 'finisher'>('grower');
  const [newBrand, setNewBrand] = useState('علف نمو مركب 50 كغ');
  const [newQuantityKg, setNewQuantityKg] = useState<number | ''>(5000);
  const [newUnitPrice, setNewUnitPrice] = useState<number | ''>(4.5);
  const [newFarmId, setNewFarmId] = useState(selectedFarmId === 'all' ? farms.find(f => isFarmAllowed(f.id))?.id || '' : selectedFarmId);
  const [newCycleId, setNewCycleId] = useState('');
  const [newPaidAmount, setNewPaidAmount] = useState<number | ''>(0);
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('cash');
  const [newAccountId, setNewAccountId] = useState(accounts[0]?.id || '');
  const [newNotes, setNewNotes] = useState('');
  const [purchaseError, setPurchaseError] = useState('');

  // Form states: New Feed Sale (بيع علف لزبون)
  const [saleInvoiceNumber, setSaleInvoiceNumber] = useState(`F-FSALE-${Date.now().toString().slice(-4)}`);
  const [saleDate, setSaleDate] = useState(getMoroccoDateISO());
  const [saleCustomerId, setSaleCustomerId] = useState('');
  const [saleFarmId, setSaleFarmId] = useState(selectedFarmId === 'all' ? farms.find(f => isFarmAllowed(f.id))?.id || '' : selectedFarmId);
  const [saleFeedType, setSaleFeedType] = useState<'starter' | 'grower' | 'finisher'>('grower');
  const [saleBrand, setSaleBrand] = useState('علف نمو مركب 50 كغ');
  const [saleQuantityKg, setSaleQuantityKg] = useState<number | ''>(1000);
  const [saleUnitPrice, setSaleUnitPrice] = useState<number | ''>(5.2);
  const [saleCostPrice, setSaleCostPrice] = useState<number | ''>(4.5);
  const [salePaidAmount, setSalePaidAmount] = useState<number | ''>(5200);
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('cash');
  const [saleAccountId, setSaleAccountId] = useState(accounts[0]?.id || '');
  const [saleTruckPlate, setSaleTruckPlate] = useState('');
  const [saleDriverName, setSaleDriverName] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [saleError, setSaleError] = useState('');

  // Form states: Feed Movement / Consumption / Transfer
  const [mType, setMType] = useState<'issue' | 'waste' | 'transfer' | 'return' | 'opening'>('issue');
  const [mDate, setMDate] = useState(getMoroccoDateISO());
  const [mFarmId, setMFarmId] = useState(selectedFarmId === 'all' ? farms.find(f => isFarmAllowed(f.id))?.id || '' : selectedFarmId);
  const [mDestinationFarmId, setMDestinationFarmId] = useState('');
  const [mCycleId, setMCycleId] = useState('');
  const [mSourcePurchaseId, setMSourcePurchaseId] = useState('');
  const [mQuantityKg, setMQuantityKg] = useState<number | ''>('');
  const [mNotes, setMNotes] = useState('');
  const [movementError, setMovementError] = useState('');

  // Form states: Supplier Liquidity Payment
  const [paySupplierId, setPaySupplierId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Form states: Inventory Adjustment (الجرد والتسوية)
  const [adjFarmId, setAdjFarmId] = useState(selectedFarmId === 'all' ? farms.find(f => isFarmAllowed(f.id))?.id || '' : selectedFarmId);
  const [adjActualWeightKg, setAdjActualWeightKg] = useState<number | ''>('');
  const [adjFeedType, setAdjFeedType] = useState<'starter' | 'grower' | 'finisher'>('grower');
  const [adjReason, setAdjReason] = useState('جرد دوري ومطابقة فعلية للمستودع');
  const [adjError, setAdjError] = useState('');

  // Medication states
  const [medMovementOpen, setMedMovementOpen] = useState(false);
  const [medMovementType, setMedMovementType] = useState<'issue' | 'return' | 'waste'>('issue');
  const [medMovementDate, setMedMovementDate] = useState(getMoroccoDateISO());
  const [medMovementFarmId, setMedMovementFarmId] = useState(selectedFarmId === 'all' ? farms.find(f => isFarmAllowed(f.id))?.id || '' : selectedFarmId);
  const [medMovementPurchaseId, setMedMovementPurchaseId] = useState('');
  const [medMovementCycleId, setMedMovementCycleId] = useState('');
  const [medMovementQuantity, setMedMovementQuantity] = useState<number | ''>('');
  const [medMovementNotes, setMedMovementNotes] = useState('');
  const [medMovementError, setMedMovementError] = useState('');

  // Scoped farms & cycles
  const scopedFarmIds = useMemo(() => {
    const valid = selectedFarmId === 'all' ? farms.filter(f => isFarmAllowed(f.id)) : farms.filter(f => f.id === selectedFarmId && isFarmAllowed(f.id));
    return new Set(valid.map(f => f.id));
  }, [farms, selectedFarmId, isFarmAllowed]);

  // Feed Suppliers List
  const feedSupplierPartners = useMemo(() => {
    const supplierIds = new Set(feedPurchases.map(f => f.supplierId));
    return partners.filter(p => p.type === 'supplier' || supplierIds.has(p.id));
  }, [partners, feedPurchases]);

  // Comprehensive Physical & Financial Calculations
  const calculations = useMemo(() => {
    const relevantFeeds = feedPurchases.filter(f => scopedFarmIds.has(f.farmId));
    const relevantMovements = feedMovements.filter(m => scopedFarmIds.has(m.farmId));

    // 1. Physical Feed Inflow
    const movementPurchaseIds = new Set(feedMovements.map(m => m.sourcePurchaseId).filter(Boolean));
    const directPurchasedKg = relevantFeeds
      .filter(feed => !movementPurchaseIds.has(feed.id))
      .reduce((sum, feed) => sum + Math.max(0, feed.quantityKg || 0), 0);
    const movementInKg = relevantMovements
      .filter(m => ['purchase', 'opening', 'transfer_in', 'return'].includes(m.type))
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const totalPhysicalInflowKg = directPurchasedKg + movementInKg;

    // 2. Physical Feed Outflow
    const movementOutKg = relevantMovements
      .filter(m => ['issue', 'transfer_out', 'waste'].includes(m.type))
      .reduce((sum, m) => sum + Math.max(0, m.quantityKg || 0), 0);
    const movementLogIds = new Set(relevantMovements.filter(m => m.dailyLogId).map(m => m.dailyLogId));
    const directDailyLogsConsumedKg = dailyLogs
      .filter(log => !movementLogIds.has(log.id) && cycles.some(c => c.id === log.cycleId && scopedFarmIds.has(c.farmId)))
      .reduce((sum, log) => sum + Math.max(0, log.feedConsumedKg || 0), 0);
    const totalPhysicalOutflowKg = movementOutKg + directDailyLogsConsumedKg;

    // 3. Current Net Physical Stock
    const netPhysicalStockKg = Math.max(0, totalPhysicalInflowKg - totalPhysicalOutflowKg);

    // 4. Financial Feed Spend & Liquidity Flow
    const totalFeedCost = relevantFeeds.reduce((sum, f) => sum + Math.max(0, f.totalAmount || 0), 0);
    
    // Direct Cash Paid on purchase invoices
    const initialPaidOnInvoices = relevantFeeds.reduce((sum, f) => sum + Math.max(0, f.paidAmount || 0), 0);

    // Supplier settlement transactions specifically for feed suppliers
    const feedSupplierIds = new Set(feedSupplierPartners.map(p => p.id));
    const subsequentSupplierPayments = transactions
      .filter(t => t.type === 'supplier_payment' && t.partnerId && feedSupplierIds.has(t.partnerId) && !t.referenceId?.startsWith('feed-'))
      .reduce((sum, t) => sum + Math.max(0, t.amount || 0), 0);

    const totalCashPaidForFeed = initialPaidOnInvoices + subsequentSupplierPayments;
    const totalOutstandingFeedDebt = Math.max(0, totalFeedCost - totalCashPaidForFeed);

    // 5. Unit Economics
    const avgPricePerKg = totalPhysicalInflowKg > 0 ? (totalFeedCost / totalPhysicalInflowKg) : 4.5;
    const consumedValue = totalPhysicalOutflowKg * avgPricePerKg;
    const currentStockValue = netPhysicalStockKg * avgPricePerKg;

    // 6. Recent Daily Consumption Rate & Runway Estimation
    const last7DaysLogs = dailyLogs
      .filter(log => cycles.some(c => c.id === log.cycleId && scopedFarmIds.has(c.farmId)))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);
    const recentDailyAvgKg = last7DaysLogs.length > 0
      ? last7DaysLogs.reduce((sum, l) => sum + Math.max(0, l.feedConsumedKg || 0), 0) / Math.max(1, Math.min(7, last7DaysLogs.length))
      : 0;
    const stockRunwayDays = recentDailyAvgKg > 0 ? Math.floor(netPhysicalStockKg / recentDailyAvgKg) : 0;

    // 7. Breakdown by Feed Category (Starter, Grower, Finisher)
    const getStockForCategory = (type: 'starter' | 'grower' | 'finisher') => {
      const catPurchases = relevantFeeds.filter(f => f.feedType === type);
      const catMovements = relevantMovements.filter(m => m.feedType === type);
      const pIn = catPurchases.reduce((sum, f) => sum + f.quantityKg, 0)
        + catMovements.filter(m => ['opening', 'transfer_in', 'return'].includes(m.type)).reduce((s, m) => s + m.quantityKg, 0);
      const pOut = catMovements.filter(m => ['issue', 'transfer_out', 'waste'].includes(m.type)).reduce((s, m) => s + m.quantityKg, 0);
      const netKg = Math.max(0, pIn - pOut);
      const cost = catPurchases.reduce((sum, f) => sum + f.totalAmount, 0);
      const avgPrice = pIn > 0 ? cost / pIn : 4.5;
      return { inKg: pIn, outKg: pOut, netKg, avgPrice, totalValue: netKg * avgPrice };
    };

    return {
      totalPhysicalInflowKg,
      totalPhysicalOutflowKg,
      netPhysicalStockKg,
      totalFeedCost,
      totalCashPaidForFeed,
      totalOutstandingFeedDebt,
      avgPricePerKg,
      consumedValue,
      currentStockValue,
      recentDailyAvgKg,
      stockRunwayDays,
      starter: getStockForCategory('starter'),
      grower: getStockForCategory('grower'),
      finisher: getStockForCategory('finisher')
    };
  }, [feedPurchases, feedMovements, dailyLogs, cycles, transactions, scopedFarmIds, feedSupplierPartners]);

  // Unified Audit Ledger Generator (Merges Purchases, Daily Consumptions, Stock Movements, & Liquidity Settlements)
  const unifiedLedgerEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      date: string;
      timestamp: number;
      kind: 'purchase' | 'consumption' | 'payment' | 'transfer' | 'waste' | 'opening' | 'adjustment' | 'return';
      title: string;
      categoryBadge: string;
      feedType?: 'starter' | 'grower' | 'finisher' | 'other';
      brand?: string;
      // Physical metrics
      quantityChangeKg: number; // + for in, - for out, 0 for pure liquidity
      unitPricePerKg?: number;
      // Financial metrics
      totalAmount?: number;
      cashPaid?: number;
      remainingDebt?: number;
      // Entities
      farmId?: string;
      farmName?: string;
      cycleId?: string;
      cycleNumber?: string;
      partnerId?: string;
      partnerName?: string;
      accountId?: string;
      accountName?: string;
      invoiceNumber?: string;
      performedBy?: string;
      notes?: string;
      rawObject?: any;
    }> = [];

    // 1. Add Feed Purchases (Physical Inflow + Financial Invoice & Cash Downpayment)
    feedPurchases.forEach(feed => {
      if (!scopedFarmIds.has(feed.farmId)) return;
      const farm = farms.find(f => f.id === feed.farmId);
      const cycle = cycles.find(c => c.id === feed.cycleId);
      const supplier = partners.find(p => p.id === feed.supplierId);
      const account = accounts.find(a => a.id === feed.accountId);

      entries.push({
        id: `entry-feed-p-${feed.id}`,
        date: feed.date,
        timestamp: new Date(feed.date).getTime() || 0,
        kind: 'purchase',
        title: `شراء شحنة علف (${feed.brand})`,
        categoryBadge: 'شراء ودخول علف',
        feedType: feed.feedType,
        brand: feed.brand,
        quantityChangeKg: feed.quantityKg,
        unitPricePerKg: feed.unitPricePerKg,
        totalAmount: feed.totalAmount,
        cashPaid: feed.paidAmount,
        remainingDebt: feed.remainingAmount,
        farmId: feed.farmId,
        farmName: farm?.name || 'مزرعة',
        cycleId: feed.cycleId,
        cycleNumber: cycle?.cycleNumber,
        partnerId: feed.supplierId,
        partnerName: supplier?.name || 'مورد علف',
        accountId: feed.accountId,
        accountName: account?.name,
        invoiceNumber: feed.invoiceNumber || feed.id,
        notes: feed.notes,
        rawObject: feed
      });
    });

    // 2. Add Feed Stock Movements (Transfers, Direct Issues, Waste, Adjustments)
    feedMovements.forEach(m => {
      if (!scopedFarmIds.has(m.farmId)) return;
      if (m.type === 'purchase') return; // already represented by the purchase invoice above

      const farm = farms.find(f => f.id === m.farmId);
      const cycle = cycles.find(c => c.id === m.cycleId);
      const isOut = ['issue', 'transfer_out', 'waste'].includes(m.type);
      const qtyChange = isOut ? -Math.abs(m.quantityKg) : Math.abs(m.quantityKg);

      let kind: typeof entries[0]['kind'] = 'consumption';
      let catBadge = 'صرف واستهلاك';
      if (m.type === 'transfer_in' || m.type === 'transfer_out') {
        kind = 'transfer';
        catBadge = m.type === 'transfer_in' ? 'تحويل وارد' : 'تحويل صادر';
      } else if (m.type === 'waste') {
        kind = 'waste';
        catBadge = 'هدر / منسكب';
      } else if (m.type === 'adjustment') {
        kind = 'adjustment';
        catBadge = 'تسوية جردية';
      } else if (m.type === 'opening') {
        kind = 'opening';
        catBadge = 'رصيد افتتاحي';
      } else if (m.type === 'return') {
        kind = 'return';
        catBadge = 'مرتجع للمخزن';
      }

      entries.push({
        id: `entry-feed-m-${m.id}`,
        date: m.date,
        timestamp: new Date(m.date).getTime() || 0,
        kind,
        title: m.type === 'waste' ? 'تسجيل هدر أو تلف في العلف' : m.type.startsWith('transfer') ? 'تحويل علف بين المزارع' : `صرف علف ${cycle ? `للدورة ${cycle.cycleNumber}` : 'للعنابر'}`,
        categoryBadge: catBadge,
        feedType: m.feedType,
        brand: m.brand,
        quantityChangeKg: qtyChange,
        unitPricePerKg: m.unitCostPerKg || calculations.avgPricePerKg,
        totalAmount: (Math.abs(qtyChange)) * (m.unitCostPerKg || calculations.avgPricePerKg),
        farmId: m.farmId,
        farmName: farm?.name || 'مزرعة',
        cycleId: m.cycleId,
        cycleNumber: cycle?.cycleNumber,
        performedBy: m.performedBy,
        notes: m.notes,
        rawObject: m
      });
    });

    // 3. Add Unlinked Daily Logs Feed Consumptions
    const loggedMovementIds = new Set(feedMovements.filter(m => m.dailyLogId).map(m => m.dailyLogId));
    dailyLogs.forEach(log => {
      if (loggedMovementIds.has(log.id)) return;
      if (!log.feedConsumedKg || log.feedConsumedKg <= 0) return;
      const cycle = cycles.find(c => c.id === log.cycleId);
      if (!cycle || !scopedFarmIds.has(cycle.farmId)) return;
      const farm = farms.find(f => f.id === cycle.farmId);

      entries.push({
        id: `entry-daily-feed-${log.id}`,
        date: log.date,
        timestamp: new Date(log.date).getTime() || 0,
        kind: 'consumption',
        title: `استهلاك علف يومي (اليوم ${log.dayNumber})`,
        categoryBadge: 'استهلاك عنبر يومي',
        quantityChangeKg: -log.feedConsumedKg,
        unitPricePerKg: calculations.avgPricePerKg,
        totalAmount: log.feedConsumedKg * calculations.avgPricePerKg,
        farmId: cycle.farmId,
        farmName: farm?.name || 'مزرعة',
        cycleId: log.cycleId,
        cycleNumber: cycle.cycleNumber,
        notes: log.notes ? `ملاحظات السجل: ${log.notes}` : undefined
      });
    });

    // 4. Add Pure Liquidity Supplier Payments (سداد دفعات سيولة لموردي الأعلاف)
    const feedSupplierIds = new Set(feedSupplierPartners.map(p => p.id));
    transactions.forEach(tx => {
      if (tx.type !== 'supplier_payment' || !tx.partnerId || !feedSupplierIds.has(tx.partnerId)) return;
      // If it's the exact same initial payment as feed purchase, skip to avoid double counting
      if (tx.referenceId && feedPurchases.some(f => f.id === tx.referenceId)) return;

      const supplier = partners.find(p => p.id === tx.partnerId);
      const account = accounts.find(a => a.id === tx.accountId);
      const farm = tx.farmId ? farms.find(f => f.id === tx.farmId) : undefined;
      const cycle = tx.cycleId ? cycles.find(c => c.id === tx.cycleId) : undefined;

      entries.push({
        id: `entry-liq-pay-${tx.id}`,
        date: tx.date,
        timestamp: new Date(tx.date).getTime() || 0,
        kind: 'payment',
        title: `سداد سيولة لمورد العلف (${supplier?.name || 'مورد'})`,
        categoryBadge: 'سداد سيولة نقدية',
        quantityChangeKg: 0,
        totalAmount: tx.amount,
        cashPaid: tx.amount,
        partnerId: tx.partnerId,
        partnerName: supplier?.name || 'مورد علف',
        accountId: tx.accountId,
        accountName: account?.name || 'الخزينة',
        farmId: tx.farmId,
        farmName: farm?.name,
        cycleId: tx.cycleId,
        cycleNumber: cycle?.cycleNumber,
        performedBy: tx.performedBy,
        notes: tx.description
      });
    });

    return entries.sort((a, b) => b.date.localeCompare(a.date) || b.timestamp - a.timestamp);
  }, [feedPurchases, feedMovements, dailyLogs, cycles, transactions, farms, partners, accounts, scopedFarmIds, feedSupplierPartners, calculations.avgPricePerKg]);

  // Filtered Unified Entries
  const filteredLedgerEntries = useMemo(() => {
    return unifiedLedgerEntries.filter(entry => {
      // Filter by operation type
      if (filterType === 'purchase' && entry.kind !== 'purchase') return false;
      if (filterType === 'consumption' && entry.kind !== 'consumption') return false;
      if (filterType === 'payment' && entry.kind !== 'payment') return false;
      if (filterType === 'transfer' && entry.kind !== 'transfer') return false;
      if (filterType === 'waste_adjustment' && !['waste', 'adjustment', 'opening', 'return'].includes(entry.kind)) return false;

      // Filter by feed category
      if (filterFeedCategory !== 'all' && entry.feedType && entry.feedType !== filterFeedCategory) return false;

      // Filter by farm
      if (filterFarmId !== 'all' && entry.farmId !== filterFarmId) return false;

      // Filter by supplier
      if (filterSupplierId !== 'all' && entry.partnerId !== filterSupplierId) return false;

      // Filter by dates
      if (filterStartDate && entry.date < filterStartDate) return false;
      if (filterEndDate && entry.date > filterEndDate) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(query);
        const matchPartner = entry.partnerName?.toLowerCase().includes(query);
        const matchInvoice = entry.invoiceNumber?.toLowerCase().includes(query);
        const matchNotes = entry.notes?.toLowerCase().includes(query);
        const matchBrand = entry.brand?.toLowerCase().includes(query);
        if (!matchTitle && !matchPartner && !matchInvoice && !matchNotes && !matchBrand) return false;
      }

      return true;
    });
  }, [unifiedLedgerEntries, filterType, filterFeedCategory, filterFarmId, filterSupplierId, filterStartDate, filterEndDate, searchQuery]);

  // Suppliers Debt Breakdown Table
  const feedSuppliersDebtList = useMemo(() => {
    return feedSupplierPartners.map(supplier => {
      const supplierPurchases = feedPurchases.filter(f => f.supplierId === supplier.id && scopedFarmIds.has(f.farmId));
      const totalInvoiced = supplierPurchases.reduce((sum, f) => sum + Math.max(0, f.totalAmount || 0), 0);
      const totalInitialPaid = supplierPurchases.reduce((sum, f) => sum + Math.max(0, f.paidAmount || 0), 0);
      
      const subsequentPaid = transactions
        .filter(t => t.type === 'supplier_payment' && t.partnerId === supplier.id && !supplierPurchases.some(f => f.id === t.referenceId))
        .reduce((sum, t) => sum + Math.max(0, t.amount || 0), 0);
      
      const totalPaid = totalInitialPaid + subsequentPaid;
      const balanceOwed = Math.max(0, totalInvoiced - totalPaid);
      const totalTonsSupplied = supplierPurchases.reduce((sum, f) => sum + f.quantityKg, 0) / 1000;

      return {
        supplier,
        invoiced: totalInvoiced,
        paid: totalPaid,
        balanceOwed,
        totalTonsSupplied,
        invoicesCount: supplierPurchases.length
      };
    }).filter(item => item.invoiced > 0 || item.balanceOwed > 0 || item.totalTonsSupplied > 0);
  }, [feedSupplierPartners, feedPurchases, transactions, scopedFarmIds]);

  // Medication Stock Items
  const filteredMeds = selectedFarmId === 'all'
    ? medicationPurchases
    : medicationPurchases.filter(m => m.farmId === selectedFarmId);
  const totalMedCost = filteredMeds.reduce((sum, m) => sum + m.totalAmount, 0);
  const medStockItems = filteredMeds.map(purchase => {
    const movements = medicationMovements.filter(m => m.medicationPurchaseId === purchase.id);
    const received = movements.filter(m => ['purchase', 'opening', 'return'].includes(m.type)).reduce((sum, m) => sum + m.quantity, 0);
    const issued = movements.filter(m => ['issue', 'waste'].includes(m.type)).reduce((sum, m) => sum + m.quantity, 0);
    return { purchase, available: Math.max(0, (received || purchase.quantity || 1) - issued) };
  });
  const selectedMedSource = medStockItems.find(item => item.purchase.id === medMovementPurchaseId);
  const medMovementCycles = cycles.filter(c => c.farmId === medMovementFarmId && c.status !== 'completed');
  const visibleMedicationMovements = medicationMovements
    .filter(m => scopedFarmIds.has(m.farmId))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Handler: Submit New Feed Purchase (Unified Entry: Physical + Financial)
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError('');
    const quantityKg = Number(newQuantityKg || 0);
    const unitPrice = Number(newUnitPrice || 0);
    const paid = Number(newPaidAmount || 0);
    const totalAmount = quantityKg * unitPrice;

    if (!newSupplierId || !newFarmId || quantityKg <= 0 || unitPrice <= 0) {
      setPurchaseError('يرجى ملء جميع الحقول المطلوبة وإدخال كمية وسعر صحيحين.');
      return;
    }
    if (paid > totalAmount) {
      setPurchaseError('المبلغ المدفوع نقداً لا يمكن أن يتجاوز إجمالي الفاتورة.');
      return;
    }
    if (paid > 0 && !newAccountId) {
      setPurchaseError('يرجى تحديد حساب الخزينة أو البنك المسدد منه المبلغ.');
      return;
    }

    addFeedPurchase({
      invoiceNumber: newInvoiceNumber.trim() || `F-${Date.now().toString().slice(-5)}`,
      date: newDate,
      supplierId: newSupplierId,
      feedType: newFeedType,
      brand: newBrand.trim() || 'علف مركب 50 كغ',
      quantityKg,
      bagsCount: Math.ceil(quantityKg / 50),
      bagWeightKg: 50,
      unitPricePerKg: unitPrice,
      totalAmount,
      farmId: newFarmId,
      cycleId: undefined,
      paymentMethod: newPaymentMethod,
      paidAmount: paid,
      remainingAmount: totalAmount - paid,
      accountId: paid > 0 ? newAccountId : undefined,
      notes: newNotes.trim() || undefined
    });

    setPurchaseModalOpen(false);
    setNewQuantityKg(5000);
    setNewPaidAmount(0);
    setNewNotes('');
    setPurchaseError('');
  };

  // Derived Feed Sales calculations
  const customerPartners = useMemo(() => partners.filter(p => p.type === 'customer'), [partners]);

  const totalFeedSalesKg = useMemo(() => feedSales.reduce((sum, s) => sum + (s.quantityKg || 0), 0), [feedSales]);
  const totalFeedSalesRevenue = useMemo(() => feedSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0), [feedSales]);
  const totalFeedSalesPaid = useMemo(() => feedSales.reduce((sum, s) => sum + (s.paidAmount || 0), 0), [feedSales]);
  const totalFeedSalesRemainingDebt = useMemo(() => feedSales.reduce((sum, s) => sum + (s.remainingAmount || 0), 0), [feedSales]);
  const totalFeedCostOfSales = useMemo(() => feedSales.reduce((sum, s) => sum + ((s.quantityKg || 0) * (s.costPricePerKg || calculations.avgPricePerKg)), 0), [feedSales, calculations.avgPricePerKg]);
  const feedTradingProfit = totalFeedSalesRevenue - totalFeedCostOfSales;

  // Feed Customers Receivables List (كشف مستحقات وديون زبائن العلف)
  const feedCustomersDebtList = useMemo(() => {
    const map = new Map<string, { customer: any; totalSalesKg: number; invoiced: number; paid: number; balanceOwed: number; invoicesCount: number }>();
    feedSales.forEach(s => {
      const cust = customerPartners.find(p => p.id === s.customerId) || { id: s.customerId, name: s.customerName || 'زبون علف' };
      const current = map.get(s.customerId) || { customer: cust, totalSalesKg: 0, invoiced: 0, paid: 0, balanceOwed: 0, invoicesCount: 0 };
      current.totalSalesKg += s.quantityKg || 0;
      current.invoiced += s.totalAmount || 0;
      current.paid += s.paidAmount || 0;
      current.balanceOwed += s.remainingAmount || 0;
      current.invoicesCount += 1;
      map.set(s.customerId, current);
    });
    return Array.from(map.values());
  }, [feedSales, customerPartners]);

  // Handler: Submit Feed Sale (بيع علف لزبون)
  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError('');
    const quantityKg = Number(saleQuantityKg || 0);
    const unitPrice = Number(saleUnitPrice || 0);
    const costPrice = Number(saleCostPrice || calculations.avgPricePerKg || 4.5);
    const paid = Number(salePaidAmount || 0);
    const totalAmount = quantityKg * unitPrice;

    if (!saleCustomerId || !saleFarmId || quantityKg <= 0 || unitPrice <= 0) {
      setSaleError('يرجى تحديد الزبون والمزرعة المصدر والكمية وسعر البيع.');
      return;
    }
    if (paid > totalAmount) {
      setSaleError('المبلغ المحصل لا يمكن أن يتجاوز إجمالي الفاتورة.');
      return;
    }
    if (paid > 0 && !saleAccountId) {
      setSaleError('يرجى تحديد حساب الخزينة أو البنك المودع فيه المبلغ.');
      return;
    }

    const cust = customerPartners.find(p => p.id === saleCustomerId);

    addFeedSale({
      invoiceNumber: saleInvoiceNumber.trim() || `FS-${Date.now().toString().slice(-5)}`,
      date: saleDate,
      customerId: saleCustomerId,
      customerName: cust?.name || 'زبون علف',
      farmId: saleFarmId,
      feedType: saleFeedType,
      brand: saleBrand.trim() || 'علف مركب',
      quantityKg,
      bagsCount: Math.ceil(quantityKg / 50),
      unitPricePerKg: unitPrice,
      costPricePerKg: costPrice,
      totalAmount,
      paidAmount: paid,
      remainingAmount: totalAmount - paid,
      paymentMethod: salePaymentMethod,
      accountId: paid > 0 ? saleAccountId : undefined,
      truckPlate: saleTruckPlate.trim() || undefined,
      driverName: saleDriverName.trim() || undefined,
      notes: saleNotes.trim() || undefined
    });

    setSaleModalOpen(false);
    setSaleQuantityKg(1000);
    setSalePaidAmount(0);
    setSaleNotes('');
    setSaleError('');
  };

  // Handler: Submit Customer Debt Collection (تحصيل دين من زبون علف)
  const handleCustomerCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(collectAmount || 0);
    if (!collectCustomerId || amount <= 0 || !collectAccountId) {
      alert('يرجى ملء جميع بيانات التحصيل المطلوبة');
      return;
    }
    const customer = customerPartners.find(p => p.id === collectCustomerId);
    addSettlementTransaction({
      date: getMoroccoDateISO(),
      amount,
      partnerId: collectCustomerId,
      partnerName: customer?.name || 'زبون علف',
      partnerType: 'customer',
      paymentMethod: collectMethod,
      accountId: collectAccountId,
      category: 'income',
      type: 'income',
      description: `تحصيل مستحقات مبيعات علف - ${customer?.name || 'زبون'} - ${collectNotes || 'تسديد دفعة'}`
    });
    setCustomerCollectionModalOpen(false);
    setCollectAmount('');
    setCollectNotes('');
  };

  // Handler: Submit Feed Stock Movement / Consumption / Transfer
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMovementError('');
    const quantityKg = Number(mQuantityKg || 0);
    if (!mFarmId || quantityKg <= 0) {
      setMovementError('يرجى تحديد المزرعة والكمية بالكغ.');
      return;
    }

    const farmStockKg = getFarmFeedStockKg(mFarmId);
    if (['issue', 'waste', 'transfer'].includes(mType) && quantityKg > farmStockKg) {
      setMovementError(`الكمية المطلوبة (${quantityKg.toLocaleString()} كغ) تتجاوز رصيد العلف المتاح في هذه المزرعة (${farmStockKg.toLocaleString()} كغ).`);
      return;
    }

    if (mType === 'transfer') {
      if (!mDestinationFarmId || mDestinationFarmId === mFarmId) {
        setMovementError('يرجى اختيار مزرعة مستقبلة مختلفة عن المزرعة المصدر.');
        return;
      }
      addFeedTransfer({
        date: mDate,
        quantityKg,
        feedType: newFeedType,
        sourceFarmId: mFarmId,
        destinationFarmId: mDestinationFarmId,
        unitCostPerKg: calculations.avgPricePerKg,
        totalCost: quantityKg * calculations.avgPricePerKg,
        notes: mNotes || 'تحويل علف بين المزارع'
      });
    } else {
      addFeedMovement({
        date: mDate,
        type: mType,
        quantityKg,
        feedType: newFeedType,
        farmId: mFarmId,
        cycleId: mType === 'issue' ? mCycleId || undefined : undefined,
        unitCostPerKg: calculations.avgPricePerKg,
        totalCost: quantityKg * calculations.avgPricePerKg,
        notes: mNotes || undefined
      });
    }

    setMovementModalOpen(false);
    setMQuantityKg('');
    setMNotes('');
    setMCycleId('');
    setMDestinationFarmId('');
    setMovementError('');
  };

  // Handler: Settle Supplier Debt with Cash/Bank Outflow
  const handleSupplierPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');
    const amount = Number(payAmount || 0);
    if (!paySupplierId || amount <= 0 || !payAccountId) {
      setPayError('يرجى اختيار المورد وحساب الخزينة وإدخال مبلغ سداد صحيح.');
      return;
    }

    const supplierItem = feedSuppliersDebtList.find(s => s.supplier.id === paySupplierId);
    if (supplierItem && amount > supplierItem.balanceOwed + 100) {
      setPayError(`المبلغ المدخل (${amount.toLocaleString()} ${currency}) يتجاوز إجمالي مستحقات المورد (${supplierItem.balanceOwed.toLocaleString()} ${currency}).`);
      return;
    }

    addSettlementTransaction({
      partnerId: paySupplierId,
      amount,
      type: 'supplier_payment',
      accountId: payAccountId,
      paymentMethod: payMethod,
      description: payNotes.trim() || `سداد دفعة سيولة نقدية لمورد الأعلاف (${supplierItem?.supplier.name || 'مورد'})`
    });

    setSupplierPaymentModalOpen(false);
    setPayAmount('');
    setPayNotes('');
    setPayError('');
  };

  // Handler: Inventory Adjustment (جرد وتسوية فارق المخزون)
  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjError('');
    const actualKg = Number(adjActualWeightKg);
    if (isNaN(actualKg) || actualKg < 0 || !adjFarmId) {
      setAdjError('يرجى إدخال الوزن الفعلي الصحيح بالكغ.');
      return;
    }

    const currentBookStockKg = calculations.netPhysicalStockKg;
    const diffKg = actualKg - currentBookStockKg;

    if (diffKg === 0) {
      setAdjError('الرصيد الفعلي مطابق تماماً للرصيد الدفتري، لا يوجد فارق للتسوية.');
      return;
    }

    // Add adjustment movement
    addFeedMovement({
      date: getMoroccoDateISO(),
      type: 'adjustment',
      quantityKg: Math.abs(diffKg),
      feedType: adjFeedType,
      farmId: adjFarmId,
      unitCostPerKg: calculations.avgPricePerKg,
      totalCost: Math.abs(diffKg) * calculations.avgPricePerKg,
      notes: `${adjReason} • الفارق: ${diffKg > 0 ? `زيادة +${diffKg.toLocaleString()} كغ` : `عجز ${diffKg.toLocaleString()} كغ`}`
    });

    setAdjustmentModalOpen(false);
    setAdjActualWeightKg('');
    setAdjError('');
  };

  // Handler: Medication Movement
  const handleMedicationMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(medMovementQuantity || 0);
    setMedMovementError('');
    if (!medMovementFarmId || !medMovementPurchaseId || quantity <= 0) {
      return setMedMovementError('اختر المزرعة والدواء وأدخل كمية صحيحة.');
    }
    if (medMovementType === 'issue' && !medMovementCycleId) {
      return setMedMovementError('اختر الدورة المستفيدة من الدواء.');
    }
    if (selectedMedSource && quantity > selectedMedSource.available) {
      return setMedMovementError(`الكمية تتجاوز الرصيد المتاح (${selectedMedSource.available} ${selectedMedSource.purchase.unit || 'وحدة'}).`);
    }
    const purchase = selectedMedSource?.purchase;
    if (!purchase) return;

    addMedicationMovement({
      date: medMovementDate,
      type: medMovementType,
      medicationPurchaseId: purchase.id,
      medicationName: purchase.medicationName,
      quantity,
      unit: purchase.unit || 'وحدة',
      unitCost: purchase.unitPrice || purchase.totalAmount / Math.max(1, purchase.quantity || 1),
      totalCost: quantity * (purchase.unitPrice || purchase.totalAmount / Math.max(1, purchase.quantity || 1)),
      farmId: medMovementFarmId,
      cycleId: medMovementType === 'issue' ? medMovementCycleId : undefined,
      notes: medMovementNotes || undefined
    });

    setMedMovementOpen(false);
    setMedMovementQuantity('');
    setMedMovementNotes('');
    setMedMovementPurchaseId('');
    setMedMovementCycleId('');
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Unified Header & Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-stone-900 border border-yellow-500/20 rounded-2xl p-3.5 sm:p-4 shadow-sm no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-stone-100">
                  {language === 'ar' ? 'العلف' : 'Aliments'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                  {(calculations.netPhysicalStockKg / 1000).toFixed(1)} طن قائم
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Print Report */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="طباعة التقرير التدقيقي الرسمي"
          >
            <Printer className="w-3.5 h-3.5 text-yellow-400" />
          </button>

          {/* 1. زر شراء علف من مورد */}
          {canManagePurchases && (
            <button
              type="button"
              onClick={() => setPurchaseModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md shadow-yellow-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span>+ شراء علف من مورد</span>
            </button>
          )}

          {/* 2. زر بيع علف لزبون */}
          {canManageFinance && (
            <button
              type="button"
              onClick={() => setSaleModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              <span>+ بيع علف لزبون</span>
            </button>
          )}

          {/* 3. زر صرف إلى مزرعة */}
          {canEnterDailyLogs && (
            <button
              type="button"
              onClick={() => { setMType('issue'); setMovementModalOpen(true); }}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
              <span>+ صرف إلى مزرعة</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Print Header */}
      <div className="print-only border-b-2 border-stone-800 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">
              التقرير المحاسبي والتدقيقي الموحد للأعلاف والسيولة النقدية
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              مزارعنا لإدارة الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')} - {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold space-y-0.5">
            <div>إجمالي الوارد: {(calculations.totalPhysicalInflowKg / 1000).toFixed(2)} طن ({calculations.totalFeedCost.toLocaleString()} {currency})</div>
            <div>المنصرف المستهلك: {(calculations.totalPhysicalOutflowKg / 1000).toFixed(2)} طن ({calculations.consumedValue.toLocaleString()} {currency})</div>
            <div>الرصيد القائم: {(calculations.netPhysicalStockKg / 1000).toFixed(2)} طن ({calculations.currentStockValue.toLocaleString()} {currency})</div>
            <div>ديون الموردين المتبقية: {calculations.totalOutstandingFeedDebt.toLocaleString()} {currency}</div>
          </div>
        </div>
      </div>

      {/* KPI Stream Matrix (Executive 4-Card System) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Net Physical Inventory & Runway */}
        <div className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Warehouse className="w-4 h-4 text-amber-400" />
                رصيد المخزون الفعلي القائم
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 font-extrabold">
                {Math.round(calculations.netPhysicalStockKg / 50).toLocaleString()} كيس
              </span>
            </div>
            <div className="text-2xl font-black text-amber-300 tracking-tight">
              {(calculations.netPhysicalStockKg / 1000).toFixed(2)}{' '}
              <span className="text-xs font-bold text-stone-400">طن ({calculations.netPhysicalStockKg.toLocaleString()} كغ)</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
            <span className="text-stone-400">القيمة المخزنية:</span>
            <strong className="text-stone-200">{calculations.currentStockValue.toLocaleString()} {currency}</strong>
          </div>
        </div>

        {/* Card 2: Physical Flow Balance (Inflow vs Outflow) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-blue-300">
                <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                ميزان الحركة الفيزيائية
              </span>
              <span className="text-[10px] text-stone-500">وارد − منصرف</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center mt-1">
              <div className="bg-stone-950/60 rounded-xl p-1.5 border border-stone-800/60">
                <span className="block text-[10px] text-emerald-400 font-semibold">الوارد (+دخول)</span>
                <strong className="text-xs text-stone-100">{(calculations.totalPhysicalInflowKg / 1000).toFixed(1)} طن</strong>
              </div>
              <div className="bg-stone-950/60 rounded-xl p-1.5 border border-stone-800/60">
                <span className="block text-[10px] text-rose-400 font-semibold">المستهلك (-خروج)</span>
                <strong className="text-xs text-stone-100">{(calculations.totalPhysicalOutflowKg / 1000).toFixed(1)} طن</strong>
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
            <span className="text-stone-400">كفاية المخزون التقديرية:</span>
            <strong className={calculations.stockRunwayDays < 4 ? 'text-rose-400 font-black' : 'text-emerald-400 font-bold'}>
              {calculations.stockRunwayDays > 0 ? `تغطي حوالي ${calculations.stockRunwayDays} يوم` : 'غير محدد'}
            </strong>
          </div>
        </div>

        {/* Card 3: Financial & Liquidity Outflow */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Wallet className="w-4 h-4 text-emerald-400" />
                السيولة المسددة نقداً
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 font-extrabold">
                {calculations.totalFeedCost > 0 ? `${Math.round((calculations.totalCashPaidForFeed / calculations.totalFeedCost) * 100)}% مسدد` : '0%'}
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {calculations.totalCashPaidForFeed.toLocaleString()}{' '}
              <span className="text-xs font-bold text-stone-400">{currency}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
            <span className="text-stone-400">إجمالي قيمة المشتريات:</span>
            <strong className="text-stone-200">{calculations.totalFeedCost.toLocaleString()} {currency}</strong>
          </div>
        </div>

        {/* Card 4: Supplier Debts & Unit Price */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-rose-300">
                <CreditCard className="w-4 h-4 text-rose-400" />
                ديون العلف المتبقية (ذمم)
              </span>
              <span className="text-[10px] text-stone-500">
                مستحقة للموردين
              </span>
            </div>
            <div className="text-2xl font-black text-rose-400 tracking-tight">
              {calculations.totalOutstandingFeedDebt.toLocaleString()}{' '}
              <span className="text-xs font-bold text-stone-400">{currency}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
            <span className="text-stone-400">متوسط سعر كغ العلف:</span>
            <strong className="text-amber-300 font-bold">{calculations.avgPricePerKg.toFixed(2)} {currency}/كغ</strong>
          </div>
        </div>
      </div>

      {/* Feed Types Breakdown Bar (بادي / نامي / ناهي) */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 no-print">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-stone-200">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>تفصيل رصيد المخزون حسب الصنف (بادي • نامي • ناهي)</span>
          </div>
          <span className="text-[11px] text-stone-400">
            سعر الكيلو التقديري: {calculations.avgPricePerKg.toFixed(2)} {currency}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Starter */}
          <div className="rounded-xl bg-stone-950/70 border border-blue-500/20 p-3 flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300">
                بادي (Starter 1-10)
              </span>
              <div className="text-[10px] text-stone-400 mt-1">
                وارد: {(calculations.starter.inKg / 1000).toFixed(1)} طن • استهلاك: {(calculations.starter.outKg / 1000).toFixed(1)} طن
              </div>
            </div>
            <div className="text-left">
              <strong className="text-base font-black text-blue-300 block">
                {calculations.starter.netKg.toLocaleString()} <span className="text-[10px] text-stone-400 font-normal">كغ</span>
              </strong>
              <span className="text-[10px] text-stone-400 font-semibold">{Math.round(calculations.starter.netKg / 50)} كيس</span>
            </div>
          </div>

          {/* Grower */}
          <div className="rounded-xl bg-stone-950/70 border border-amber-500/20 p-3 flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300">
                نامي (Grower 11-28)
              </span>
              <div className="text-[10px] text-stone-400 mt-1">
                وارد: {(calculations.grower.inKg / 1000).toFixed(1)} طن • استهلاك: {(calculations.grower.outKg / 1000).toFixed(1)} طن
              </div>
            </div>
            <div className="text-left">
              <strong className="text-base font-black text-amber-300 block">
                {calculations.grower.netKg.toLocaleString()} <span className="text-[10px] text-stone-400 font-normal">كغ</span>
              </strong>
              <span className="text-[10px] text-stone-400 font-semibold">{Math.round(calculations.grower.netKg / 50)} كيس</span>
            </div>
          </div>

          {/* Finisher */}
          <div className="rounded-xl bg-stone-950/70 border border-emerald-500/20 p-3 flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                ناهي (Finisher 29+)
              </span>
              <div className="text-[10px] text-stone-400 mt-1">
                وارد: {(calculations.finisher.inKg / 1000).toFixed(1)} طن • استهلاك: {(calculations.finisher.outKg / 1000).toFixed(1)} طن
              </div>
            </div>
            <div className="text-left">
              <strong className="text-base font-black text-emerald-300 block">
                {calculations.finisher.netKg.toLocaleString()} <span className="text-[10px] text-stone-400 font-normal">كغ</span>
              </strong>
              <span className="text-[10px] text-stone-400 font-semibold">{Math.round(calculations.finisher.netKg / 50)} كيس</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-2 no-print">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. لوحة أموال العلف والديون والربح */}
          <button
            type="button"
            onClick={() => setActiveMainTab('finance')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'finance'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-stone-950 shadow-md shadow-yellow-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>لوحة أموال العلف والديون والربح</span>
          </button>

          {/* 2. سجل الحركات الموحد */}
          <button
            type="button"
            onClick={() => setActiveMainTab('unified_ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'unified_ledger'
                ? 'bg-yellow-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>سجل الحركات المركزي ({filteredLedgerEntries.length})</span>
          </button>

          {/* 3. مشتريات العلف */}
          <button
            type="button"
            onClick={() => setActiveMainTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'purchases'
                ? 'bg-yellow-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>شراء العلف ({feedPurchases.length})</span>
          </button>

          {/* 4. مبيعات العلف */}
          <button
            type="button"
            onClick={() => setActiveMainTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'sales'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>مبيعات العلف ({feedSales.length})</span>
          </button>

          {/* 5. صرف العلف */}
          <button
            type="button"
            onClick={() => setActiveMainTab('distribution')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'distribution'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>صرف للمزارع ({feedMovements.filter(m => m.type === 'issue').length})</span>
          </button>

          {/* 6. جرد المستودعات */}
          <button
            type="button"
            onClick={() => setActiveMainTab('inventory_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'inventory_audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>جرد المستودعات</span>
          </button>

          {/* 7. الأدوية */}
          <button
            type="button"
            onClick={() => setActiveMainTab('meds')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'meds'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>الأدوية واللقاحات ({filteredMeds.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 0: FEED FINANCE & MONEY DASHBOARD (لوحة أموال العلف والديون والربح) */}
      {activeMainTab === 'finance' && (
        <div className="space-y-4 animate-fade-in">
          {/* Executive Header Banner */}
          <div className="bg-stone-900 border border-yellow-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-100 flex items-center gap-2">
                    <span>لوحة أموال العلف والديون والأرباح</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                      محاسبة مركزية
                    </span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    متابعة سيولة شراء العلف، ديون المصانع، أرباح مبيعات العلف للزبائن، ومستحقات الذمم
                  </p>
                </div>
              </div>
            </div>

            {/* Direct 3 Options Hub */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <button
                type="button"
                onClick={() => setPurchaseModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-stone-950 text-xs font-black shadow transition flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>شراء علف</span>
              </button>
              <button
                type="button"
                onClick={() => setSaleModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow transition flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>بيع علف</span>
              </button>
              <button
                type="button"
                onClick={() => { setMType('issue'); setMovementModalOpen(true); }}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                <span>صرف لمزرعة</span>
              </button>
            </div>
          </div>

          {/* Financial KPIs Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Feed Sales Revenue & Profit */}
            <div className="bg-stone-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>مبيعات العلف للزبائن</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 font-black">
                  {feedSales.length} فاتورة
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">
                  {totalFeedSalesRevenue.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
                  <span>أرباح البيع الصافية:</span>
                  <strong className="text-emerald-300 font-black">+{feedTradingProfit.toLocaleString()} {currency}</strong>
                </div>
              </div>
            </div>

            {/* 2. Feed Purchases Cash Flow */}
            <div className="bg-stone-900 border border-yellow-500/30 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Wallet className="w-4 h-4" />
                  <span>السيولة المسددة للموردين</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/15 text-yellow-300 font-black">
                  كاش وبنك
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-yellow-400">
                  {calculations.totalPaidToSuppliers.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
                  <span>إجمالي المشتريات:</span>
                  <span className="text-stone-300">{calculations.totalPurchasedCost.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

            {/* 3. Supplier Debts (We Owe) */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <CreditCard className="w-4 h-4" />
                  <span>ديون موردي العلف (علينا)</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  calculations.totalOwedToSuppliers > 0 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {calculations.totalOwedToSuppliers > 0 ? 'متبقي' : 'خالص'}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-rose-400">
                  {calculations.totalOwedToSuppliers.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  مستحقة لمصانع وشركات الأعلاف
                </div>
              </div>
            </div>

            {/* 4. Customer Debts (Owed to Us) */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <DollarSign className="w-4 h-4" />
                  <span>ديون زبائن العلف (لنا)</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300 font-bold">
                  مستحقات
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-400">
                  {totalFeedSalesRemainingDebt.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
                  <span>المحصل فعلياً:</span>
                  <span className="text-emerald-400 font-bold">{totalFeedSalesPaid.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Debts & Accounts: Suppliers vs Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Table 1: كشف حساب موردي العلف (ديون علينا) */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-stone-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  <span>ديون موردي الأعلاف (سداد المستحقات)</span>
                </h3>
                <span className="text-[11px] text-stone-400">{feedSuppliersDebtList.length} مورد</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                      <th className="pb-2 font-bold">المورد</th>
                      <th className="pb-2 font-bold">التوريد (طن)</th>
                      <th className="pb-2 font-bold">إجمالي المستحق</th>
                      <th className="pb-2 font-bold">المسدد</th>
                      <th className="pb-2 font-bold">الرصيد المتبقي</th>
                      <th className="pb-2 font-bold text-left">سداد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {feedSuppliersDebtList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-stone-500 text-xs">
                          لا توجد ذمم أو فواتير لموردي الأعلاف
                        </td>
                      </tr>
                    ) : (
                      feedSuppliersDebtList.map(item => (
                        <tr key={item.supplier.id} className="hover:bg-stone-800/30 transition">
                          <td className="py-2.5 font-bold text-stone-200">{item.supplier.name}</td>
                          <td className="py-2.5 text-stone-300">{item.totalTonsSupplied.toFixed(1)} طن</td>
                          <td className="py-2.5 text-stone-300">{item.invoiced.toLocaleString()} {currency}</td>
                          <td className="py-2.5 text-emerald-400 font-semibold">{item.paid.toLocaleString()} {currency}</td>
                          <td className="py-2.5">
                            <span className={`font-black ${item.balanceOwed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {item.balanceOwed.toLocaleString()} {currency}
                            </span>
                          </td>
                          <td className="py-2.5 text-left">
                            {item.balanceOwed > 0 && canManageFinance ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaySupplierId(item.supplier.id);
                                  setPayAmount(item.balanceOwed);
                                  setSupplierPaymentModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow-sm transition"
                              >
                                سداد
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-bold">خالص</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: كشف حساب زبائن مبيعات العلف (ديون لنا) */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-stone-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>مستحقات زبائن العلف (تحصيل الديون)</span>
                </h3>
                <span className="text-[11px] text-stone-400">{feedCustomersDebtList.length} زبون</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                      <th className="pb-2 font-bold">الزبون</th>
                      <th className="pb-2 font-bold">المباع (كغ)</th>
                      <th className="pb-2 font-bold">إجمالي الفاتورة</th>
                      <th className="pb-2 font-bold">المحصل</th>
                      <th className="pb-2 font-bold">المتبقي لنا</th>
                      <th className="pb-2 font-bold text-left">تحصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {feedCustomersDebtList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-stone-500 text-xs">
                          لا توجد مبيعات علف مسجلة للزبائن بعد
                        </td>
                      </tr>
                    ) : (
                      feedCustomersDebtList.map(item => (
                        <tr key={item.customer.id} className="hover:bg-stone-800/30 transition">
                          <td className="py-2.5 font-bold text-stone-200">{item.customer.name}</td>
                          <td className="py-2.5 text-stone-300">{item.totalSalesKg.toLocaleString()} كغ</td>
                          <td className="py-2.5 text-stone-300">{item.invoiced.toLocaleString()} {currency}</td>
                          <td className="py-2.5 text-emerald-400 font-semibold">{item.paid.toLocaleString()} {currency}</td>
                          <td className="py-2.5">
                            <span className={`font-black ${item.balanceOwed > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {item.balanceOwed.toLocaleString()} {currency}
                            </span>
                          </td>
                          <td className="py-2.5 text-left">
                            {item.balanceOwed > 0 && canManageFinance ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCollectCustomerId(item.customer.id);
                                  setCollectAmount(item.balanceOwed);
                                  setCustomerCollectionModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-sm transition"
                              >
                                تحصيل
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-bold">مستوفى</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PURCHASES (فواتير شراء العلف) */}
      {activeMainTab === 'purchases' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-stone-900 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-black text-stone-100 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-yellow-400" />
                  فواتير شراء واستلام الأعلاف
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  سجل جميع شحنات الأعلاف الواردة من الموردين والمصانع
                </p>
              </div>
              {canManagePurchases && (
                <button
                  type="button"
                  onClick={() => setPurchaseModalOpen(true)}
                  className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ فاتورة شراء جديدة</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">التاريخ</th>
                    <th className="pb-3 font-bold">رقم الفاتورة</th>
                    <th className="pb-3 font-bold">المورد</th>
                    <th className="pb-3 font-bold">النوع / الماركة</th>
                    <th className="pb-3 font-bold">الكمية</th>
                    <th className="pb-3 font-bold">السعر للكغ</th>
                    <th className="pb-3 font-bold">الإجمالي</th>
                    <th className="pb-3 font-bold">المدفوع</th>
                    <th className="pb-3 font-bold">المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {feedPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-stone-500">
                        لا توجد فواتير شراء مسجلة بعد.
                      </td>
                    </tr>
                  ) : (
                    feedPurchases.map(p => {
                      const sup = partners.find(part => part.id === p.supplierId);
                      return (
                        <tr key={p.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3 text-stone-300 font-medium">{p.date}</td>
                          <td className="py-3 font-mono font-bold text-yellow-400">{p.invoiceNumber}</td>
                          <td className="py-3 font-bold text-stone-200">{sup?.name || 'مورد'}</td>
                          <td className="py-3 text-stone-300">
                            {p.feedType === 'starter' ? 'بادئ' : p.feedType === 'grower' ? 'نمو' : 'ناهي'} - {p.brand}
                          </td>
                          <td className="py-3 font-bold text-stone-100">
                            {(p.quantityKg / 1000).toFixed(2)} طن ({p.bagsCount || Math.round(p.quantityKg / 50)} كيس)
                          </td>
                          <td className="py-3 text-stone-300">{p.unitPricePerKg} {currency}</td>
                          <td className="py-3 font-bold text-stone-100">{p.totalAmount.toLocaleString()} {currency}</td>
                          <td className="py-3 text-emerald-400 font-bold">{p.paidAmount.toLocaleString()} {currency}</td>
                          <td className="py-3">
                            <span className={`font-bold ${p.remainingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {p.remainingAmount.toLocaleString()} {currency}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SALES (مبيعات العلف للزبائن) */}
      {activeMainTab === 'sales' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-stone-900 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-black text-stone-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  مبيعات العلف للزبائن والمزارع الخارجية
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  سجل فواتير مبيعات العلف، الكميات، الأرباح، وحالة التحصيل
                </p>
              </div>
              {canManageFinance && (
                <button
                  type="button"
                  onClick={() => setSaleModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ فاتورة بيع علف جديدة</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">التاريخ</th>
                    <th className="pb-3 font-bold">رقم الفاتورة</th>
                    <th className="pb-3 font-bold">الزبون</th>
                    <th className="pb-3 font-bold">المستودع المصدر</th>
                    <th className="pb-3 font-bold">نوع العلف</th>
                    <th className="pb-3 font-bold">الوزن (كغ)</th>
                    <th className="pb-3 font-bold">سعر البيع</th>
                    <th className="pb-3 font-bold">الإجمالي</th>
                    <th className="pb-3 font-bold">المدفوع</th>
                    <th className="pb-3 font-bold">المتبقي (ذمة)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {feedSales.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-stone-500">
                        لا توجد مبيعات علف مسجلة للزبائن بعد.
                      </td>
                    </tr>
                  ) : (
                    feedSales.map(s => {
                      const cust = partners.find(p => p.id === s.customerId);
                      const farm = farms.find(f => f.id === s.farmId);
                      return (
                        <tr key={s.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3 text-stone-300 font-medium">{s.date}</td>
                          <td className="py-3 font-mono font-bold text-emerald-400">{s.invoiceNumber}</td>
                          <td className="py-3 font-bold text-stone-200">{cust?.name || s.customerName || 'زبون'}</td>
                          <td className="py-3 text-[11px]">
                            {s.farmId === 'central' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                                🏢 المخزن العام
                              </span>
                            ) : (
                              <span className="text-stone-300 font-medium">{farm?.name || 'مستودع عام'}</span>
                            )}
                          </td>
                          <td className="py-3 text-stone-300">
                            {s.feedType === 'starter' ? 'بادئ' : s.feedType === 'grower' ? 'نمو' : 'ناهي'}
                          </td>
                          <td className="py-3 font-bold text-stone-100">{s.quantityKg.toLocaleString()} كغ</td>
                          <td className="py-3 text-stone-300">{s.unitPricePerKg} {currency}</td>
                          <td className="py-3 font-bold text-emerald-400">{s.totalAmount.toLocaleString()} {currency}</td>
                          <td className="py-3 text-stone-100">{s.paidAmount.toLocaleString()} {currency}</td>
                          <td className="py-3">
                            <span className={`font-bold ${s.remainingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {s.remainingAmount.toLocaleString()} {currency}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DISTRIBUTION (صرف العلف إلى المزارع والعنابر) */}
      {activeMainTab === 'distribution' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-black text-stone-100 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-amber-400" />
                  حركات صرف وتحويل الأعلاف بين المزارع والعنابر
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  سجل حركات الخروج والاستهلاك المباشر لقطعان التسمين
                </p>
              </div>
              {canEnterDailyLogs && (
                <button
                  type="button"
                  onClick={() => { setMType('issue'); setMovementModalOpen(true); }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ صرف علف لعنبر</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">التاريخ</th>
                    <th className="pb-3 font-bold">نوع الحركة</th>
                    <th className="pb-3 font-bold">المزرعة</th>
                    <th className="pb-3 font-bold">الكمية المصروفة</th>
                    <th className="pb-3 font-bold">الأكياس</th>
                    <th className="pb-3 font-bold">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {feedMovements.filter(m => m.type === 'issue' || m.type === 'transfer').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        لا توجد حركات صرف مسجلة.
                      </td>
                    </tr>
                  ) : (
                    feedMovements.filter(m => m.type === 'issue' || m.type === 'transfer').map(m => {
                      const farm = farms.find(f => f.id === m.farmId);
                      return (
                        <tr key={m.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3 text-stone-300 font-medium">{m.date}</td>
                          <td className="py-3 font-bold text-amber-400">
                            {m.type === 'issue' ? 'صرف استهلاك عنبر' : 'تحويل بين مزارع'}
                          </td>
                          <td className="py-3 font-bold text-stone-200">{farm?.name || 'مزرعة'}</td>
                          <td className="py-3 font-bold text-stone-100">{m.quantityKg.toLocaleString()} كغ</td>
                          <td className="py-3 text-stone-300">{Math.round(m.quantityKg / 50)} كيس</td>
                          <td className="py-3 text-stone-400">{m.notes || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: UNIFIED AUDIT LEDGER (دفتر اليومية والتدقيق الموحد) */}
      {activeMainTab === 'unified_ledger' && (
        <div className="space-y-4">
          {/* Advanced Filter Toolbar */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 no-print">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold text-stone-200">فلاتر التدقيق السريع</span>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث بالفاتورة، المورد، الدورة..."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl py-1.5 pr-8 pl-3 text-xs text-stone-100 placeholder-stone-500"
                />
              </div>
            </div>

            {/* Filter Buttons & Selects */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as typeof filterType)}
                className="bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs font-semibold"
              >
                <option value="all">كل أنواع الحركات</option>
                <option value="purchase">شحنات مشتراة (+دخول)</option>
                <option value="consumption">استهلاك العنابر (-خروج)</option>
                <option value="payment">سداد سيولة نقدية</option>
                <option value="transfer">تحويلات بين المزارع</option>
                <option value="waste_adjustment">هدر وتسويات جرد</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterFeedCategory}
                onChange={e => setFilterFeedCategory(e.target.value as typeof filterFeedCategory)}
                className="bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs font-semibold"
              >
                <option value="all">كافة الأصناف (بادي/نامي/ناهي)</option>
                <option value="starter">بادي (Starter)</option>
                <option value="grower">نامي (Grower)</option>
                <option value="finisher">ناهي (Finisher)</option>
              </select>

              {/* Farm Filter */}
              <select
                value={filterFarmId}
                onChange={e => setFilterFarmId(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs font-semibold"
              >
                <option value="all">كافة المزارع والمخازن</option>
                <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                {farms.filter(f => isFarmAllowed(f.id)).map(f => (
                  <option key={f.id} value={f.id}>📍 {f.name}</option>
                ))}
              </select>

              {/* Supplier Filter */}
              <select
                value={filterSupplierId}
                onChange={e => setFilterSupplierId(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs font-semibold"
              >
                <option value="all">كافة الموردين</option>
                {feedSupplierPartners.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Date Start */}
              <input
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs"
                placeholder="من تاريخ"
                title="من تاريخ"
              />

              {/* Date End */}
              <input
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-200 text-xs"
                placeholder="إلى تاريخ"
                title="إلى تاريخ"
              />
            </div>

            {/* Active Filters Badges */}
            {(filterType !== 'all' || filterFeedCategory !== 'all' || filterFarmId !== 'all' || filterSupplierId !== 'all' || filterStartDate || filterEndDate || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-stone-500 font-bold">الفلاتر المطبقة:</span>
                {filterType !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                    النوع: {filterType}
                    <button type="button" onClick={() => setFilterType('all')} className="hover:text-white">×</button>
                  </span>
                )}
                {filterFeedCategory !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 text-[10px] font-bold flex items-center gap-1">
                    الصنف: {filterFeedCategory}
                    <button type="button" onClick={() => setFilterFeedCategory('all')} className="hover:text-white">×</button>
                  </span>
                )}
                {filterFarmId !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 text-[10px] font-bold flex items-center gap-1">
                    مزرعة: {farms.find(f => f.id === filterFarmId)?.name}
                    <button type="button" onClick={() => setFilterFarmId('all')} className="hover:text-white">×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 text-[10px] font-bold flex items-center gap-1">
                    بحث: {searchQuery}
                    <button type="button" onClick={() => setSearchQuery('')} className="hover:text-white">×</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all');
                    setFilterFeedCategory('all');
                    setFilterFarmId('all');
                    setFilterSupplierId('all');
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setSearchQuery('');
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-extrabold underline mr-2"
                >
                  إلغاء كل الفلاتر
                </button>
              </div>
            )}
          </div>

          {/* Unified Ledger Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-black text-stone-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  سجل حركة العلف والسيولة الزمني الموحد
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  عرض تفصيلي لكل شحنة، استهلاك يومي، حركة سيولة نقدية، أو تحويل مخزني
                </p>
              </div>
              <span className="text-xs text-stone-400 font-bold">
                عرض {filteredLedgerEntries.length} عملية
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">التاريخ / المعرف</th>
                    <th className="pb-3 font-bold">نوع العملية</th>
                    <th className="pb-3 font-bold">البيان والتفاصيل</th>
                    <th className="pb-3 font-bold">حركة العلف (كغ/أكياس)</th>
                    <th className="pb-3 font-bold">سعر الكيلو</th>
                    <th className="pb-3 font-bold">حركة السيولة والمدفوعات</th>
                    <th className="pb-3 font-bold">المزرعة / الدورة</th>
                    <th className="pb-3 font-bold">المسند / الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-stone-500">
                        لا توجد حركات علف أو سيولة مطابقة للفلاتر المحددة.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerEntries.map(entry => {
                      const isPositive = entry.quantityChangeKg > 0;
                      const isNegative = entry.quantityChangeKg < 0;

                      return (
                        <tr key={entry.id} className="hover:bg-stone-800/40 transition">
                          {/* 1. Date */}
                          <td className="py-3">
                            <span className="font-bold text-stone-200 block">{entry.date}</span>
                            <span className="text-[10px] text-stone-500 block">{entry.invoiceNumber || entry.id.slice(0, 15)}</span>
                          </td>

                          {/* 2. Operation Badge */}
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-1 ${
                              entry.kind === 'purchase' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              entry.kind === 'consumption' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              entry.kind === 'payment' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              entry.kind === 'transfer' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {entry.kind === 'purchase' && <ArrowDownRight className="w-3 h-3" />}
                              {entry.kind === 'consumption' && <ArrowUpRight className="w-3 h-3" />}
                              {entry.kind === 'payment' && <DollarSign className="w-3 h-3" />}
                              {entry.categoryBadge}
                            </span>
                          </td>

                          {/* 3. Title & Brand */}
                          <td className="py-3">
                            <span className="font-bold text-stone-100 block">{entry.title}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                              {entry.feedType && (
                                <span className={`px-1.5 py-0.2 rounded font-semibold ${
                                  entry.feedType === 'starter' ? 'text-blue-400' :
                                  entry.feedType === 'grower' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  {entry.feedType === 'starter' ? 'بادي' : entry.feedType === 'grower' ? 'نامي' : 'ناهي'}
                                </span>
                              )}
                              {entry.partnerName && <span className="text-stone-300">مورد: {entry.partnerName}</span>}
                              {entry.notes && <span className="text-stone-500 truncate max-w-xs">{entry.notes}</span>}
                            </div>
                          </td>

                          {/* 4. Physical Feed Movement (+ / - kg) */}
                          <td className="py-3">
                            {entry.quantityChangeKg !== 0 ? (
                              <div>
                                <span className={`text-sm font-black block ${
                                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {isPositive ? `+${entry.quantityChangeKg.toLocaleString()}` : entry.quantityChangeKg.toLocaleString()} كغ
                                </span>
                                <span className="text-[10px] text-stone-400 block font-normal">
                                  {Math.abs(Math.round(entry.quantityChangeKg / 50))} كيس 50كغ
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-500 text-[11px]">— (حركة نقدية فقط)</span>
                            )}
                          </td>

                          {/* 5. Unit Price */}
                          <td className="py-3 text-stone-300 font-semibold">
                            {entry.unitPricePerKg ? `${entry.unitPricePerKg.toFixed(2)} ${currency}` : '—'}
                          </td>

                          {/* 6. Financial & Liquidity Details */}
                          <td className="py-3">
                            {entry.totalAmount ? (
                              <div>
                                <strong className="text-stone-100 font-black block">
                                  {entry.totalAmount.toLocaleString()} {currency}
                                </strong>
                                {entry.cashPaid !== undefined && (
                                  <div className="text-[10px] space-y-0.5 mt-0.5">
                                    <span className="text-emerald-400 font-bold block">
                                      مسدد نقداً: {entry.cashPaid.toLocaleString()} {currency}
                                      {entry.accountName && ` (${entry.accountName})`}
                                    </span>
                                    {entry.remainingDebt !== undefined && entry.remainingDebt > 0 && (
                                      <span className="text-rose-400 font-bold block">
                                        متبقي ذمة: {entry.remainingDebt.toLocaleString()} {currency}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-stone-500">—</span>
                            )}
                          </td>

                          {/* 7. Farm / Cycle */}
                          <td className="py-3 text-[11px] text-stone-400">
                            <span className="font-semibold text-stone-300 block">{entry.farmName || 'المخزن العام'}</span>
                            {entry.cycleNumber && (
                              <span className="text-amber-400 font-bold block">{entry.cycleNumber}</span>
                            )}
                          </td>

                          {/* 8. Actions / Performed By */}
                          <td className="py-3 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {entry.kind === 'purchase' && entry.rawObject && canManagePurchases && (
                                <button
                                  type="button"
                                  onClick={() => deleteFeedPurchase(entry.rawObject.id)}
                                  className="p-1 rounded-lg hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition"
                                  title="حذف فاتورة الشراء وتدقيق الحساب"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {entry.performedBy && (
                                <span className="text-[10px] text-stone-500">{entry.performedBy}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIQUIDITY AUDIT & SUPPLIERS HUB (تدقيق السيولة وموردي الأعلاف) */}
      {activeMainTab === 'liquidity_audit' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-black text-stone-100 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  كشف حساب وسيولة شركات وموردي الأعلاف
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  مطابقة إجمالي التوريدات، المبالغ المسددة فعلياً من الخزينة، والأرصدة المتبقية في الذمة لكل مورد
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupplierPaymentModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>+ سداد دفعة سيولة لمورد</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">الشركة / المورد</th>
                    <th className="pb-3 font-bold">عدد الفواتير</th>
                    <th className="pb-3 font-bold">إجمالي التوريدات (طن)</th>
                    <th className="pb-3 font-bold">إجمالي المبالغ المستحقة</th>
                    <th className="pb-3 font-bold">المسدد نقداً / بنكاً</th>
                    <th className="pb-3 font-bold">الرصيد المتبقي (ذمة)</th>
                    <th className="pb-3 font-bold text-left">إجراء سريع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {feedSuppliersDebtList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-500">
                        لا توجد فواتير أو مستحقات مسجلة لموردي الأعلاف.
                      </td>
                    </tr>
                  ) : (
                    feedSuppliersDebtList.map(item => (
                      <tr key={item.supplier.id} className="hover:bg-stone-800/40 transition">
                        <td className="py-3">
                          <span className="font-extrabold text-stone-100 block">{item.supplier.name}</span>
                          <span className="text-[10px] text-stone-500">{item.supplier.phone || 'هاتف غير مسجل'}</span>
                        </td>
                        <td className="py-3 text-stone-300 font-semibold">{item.invoicesCount} فاتورة</td>
                        <td className="py-3 font-bold text-amber-300">{item.totalTonsSupplied.toFixed(1)} طن</td>
                        <td className="py-3 font-bold text-stone-100">{item.invoiced.toLocaleString()} {currency}</td>
                        <td className="py-3 text-emerald-400 font-extrabold">{item.paid.toLocaleString()} {currency}</td>
                        <td className="py-3">
                          <span className={`font-black ${item.balanceOwed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {item.balanceOwed.toLocaleString()} {currency}
                          </span>
                        </td>
                        <td className="py-3 text-left">
                          {item.balanceOwed > 0 && canManageFinance && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaySupplierId(item.supplier.id);
                                setPayAmount(item.balanceOwed);
                                setSupplierPaymentModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-sm"
                            >
                              سداد المستحق
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INVENTORY AUDIT & BARN SILOS (جرد ومطابقة العنابر) */}
      {activeMainTab === 'inventory_audit' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-black text-stone-100 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-blue-400" />
                  مطابقة أرصدة العلف في المزارع والصوامع
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  تفصيل رصيد العلف الوارد والمستهلك والمخزون الصافي المتاح في كل مزرعة
                </p>
              </div>
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setAdjustmentModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Scale className="w-4 h-4" />
                  <span>تسجيل جرد وتصحيح رصيد</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {farms.filter(f => isFarmAllowed(f.id)).map(farm => {
                const farmPurchases = feedPurchases.filter(f => f.farmId === farm.id);
                const farmMovements = feedMovements.filter(m => m.farmId === farm.id);
                const pIn = farmPurchases.reduce((sum, f) => sum + f.quantityKg, 0)
                  + farmMovements.filter(m => ['opening', 'transfer_in', 'return'].includes(m.type)).reduce((s, m) => s + m.quantityKg, 0);
                const pOut = farmMovements.filter(m => ['issue', 'transfer_out', 'waste'].includes(m.type)).reduce((s, m) => s + m.quantityKg, 0);
                const logIds = new Set(farmMovements.filter(m => m.dailyLogId).map(m => m.dailyLogId));
                const directLogs = dailyLogs.filter(l => !logIds.has(l.id) && cycles.some(c => c.id === l.cycleId && c.farmId === farm.id)).reduce((s, l) => s + Math.max(0, l.feedConsumedKg || 0), 0);
                const netKg = Math.max(0, pIn - pOut - directLogs);

                return (
                  <div key={farm.id} className="rounded-xl bg-stone-950/70 border border-stone-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-100 font-extrabold flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        {farm.name}
                      </strong>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        سعة {farm.capacity?.toLocaleString()} طائر
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-stone-900 rounded-lg p-2 border border-stone-800">
                        <span className="block text-[10px] text-emerald-400">الوارد</span>
                        <strong className="text-stone-200">{(pIn / 1000).toFixed(1)} طن</strong>
                      </div>
                      <div className="bg-stone-900 rounded-lg p-2 border border-stone-800">
                        <span className="block text-[10px] text-rose-400">المستهلك</span>
                        <strong className="text-stone-200">{((pOut + directLogs) / 1000).toFixed(1)} طن</strong>
                      </div>
                      <div className="bg-stone-900 rounded-lg p-2 border border-amber-500/30 bg-amber-500/5">
                        <span className="block text-[10px] text-amber-400 font-bold">الرصيد</span>
                        <strong className="text-amber-300 font-black">{(netKg / 1000).toFixed(1)} طن</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/80">
                      <span>الأكياس المتوفرة (50كغ):</span>
                      <strong className="text-stone-200">{Math.round(netKg / 50).toLocaleString()} كيس</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MEDICATIONS & HEALTH (الأدوية واللقاحات البيطرية) */}
      {activeMainTab === 'meds' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-100 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-indigo-400" />
                  مخزون الأدوية واللقاحات البيطرية
                </h3>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  رصيد الأدوية والمطهرات واللقاحات المتاحة للاستهلاك في العنابر
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenQuickAction('med')}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black"
                >
                  + شراء دواء
                </button>
                <button
                  type="button"
                  onClick={() => setMedMovementOpen(true)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  + صرف دواء لدورة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {medStockItems.length === 0 ? (
                <div className="text-xs text-stone-500 py-4 col-span-3 text-center">
                  لا توجد أدوية أو تحصينات مسجلة في المخزون.
                </div>
              ) : (
                medStockItems.map(item => (
                  <div key={item.purchase.id} className="rounded-xl bg-stone-950/60 border border-stone-800 p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-200">{item.purchase.medicationName}</div>
                      <div className="text-[10px] text-stone-500">
                        {item.purchase.unit || 'وحدة'} • {item.purchase.unitPrice?.toLocaleString() || '—'} {currency}/وحدة
                      </div>
                    </div>
                    <strong className="text-indigo-300 font-black">
                      {item.available.toLocaleString()} {item.purchase.unit || 'وحدة'}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Meds Purchases Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-hidden">
            <h4 className="font-extrabold text-xs text-stone-200 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-400" />
              سجل مشتريات الأدوية والتحصينات ({filteredMeds.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">التاريخ</th>
                    <th className="pb-3 font-bold">اسم الدواء / اللقاح</th>
                    <th className="pb-3 font-bold">التصنيف</th>
                    <th className="pb-3 font-bold">المورد البيطري</th>
                    <th className="pb-3 font-bold">المبلغ الإجمالي</th>
                    <th className="pb-3 font-bold">حالة الدفع</th>
                    <th className="pb-3 font-bold">المزرعة / الدورة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredMeds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-500">
                        لا توجد مشتريات أدوية مسجلة.
                      </td>
                    </tr>
                  ) : (
                    filteredMeds.map(m => {
                      const supplier = partners.find(p => p.id === m.supplierId);
                      const farm = farms.find(fm => fm.id === m.farmId);
                      const cycle = cycles.find(c => c.id === m.cycleId);

                      return (
                        <tr key={m.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3 text-stone-400 font-semibold">{m.date}</td>
                          <td className="py-3 font-extrabold text-stone-100">{m.medicationName}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                              {m.category === 'vaccine' ? 'لقاح وتحصين' :
                               m.category === 'antibiotic' ? 'مضاد حيوي' :
                               m.category === 'vitamin' ? 'فيتامينات ومكملات' : 'مطهر ومعقم'}
                            </span>
                          </td>
                          <td className="py-3 text-stone-300 font-medium">{supplier?.name || '-'}</td>
                          <td className="py-3 font-black text-amber-300">{m.totalAmount.toLocaleString()} {currency}</td>
                          <td className="py-3">
                            <span className="text-emerald-400 font-bold block">{m.paidAmount.toLocaleString()} {currency}</span>
                            {m.remainingAmount > 0 && (
                              <span className="text-rose-400 text-[10px] font-semibold">متبقي: {m.remainingAmount.toLocaleString()} {currency}</span>
                            )}
                          </td>
                          <td className="py-3 text-[11px] text-stone-400">
                            {farm?.name || ''}
                            {cycle && <span className="block text-amber-400/80 font-bold">{cycle.cycleNumber}</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW FEED PURCHASE (شحنة علف واردة + سيولة) */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handlePurchaseSubmit} className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base text-stone-100">تسجيل شحنة علف واردة وتدقيق السيولة</h3>
              </div>
              <button type="button" onClick={() => setPurchaseModalOpen(false)} className="text-stone-400 hover:text-white text-xl">×</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">رقم الفاتورة / الوثيقة</span>
                <input
                  type="text"
                  required
                  value={newInvoiceNumber}
                  onChange={e => setNewInvoiceNumber(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-mono font-bold"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">تاريخ الاستلام والفوترة</span>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">شركة / مورد العلف</span>
                <select
                  required
                  value={newSupplierId}
                  onChange={e => setNewSupplierId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="">اختر مورد العلف</option>
                  {feedSupplierPartners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">نوع وصنف العلف</span>
                <select
                  required
                  value={newFeedType}
                  onChange={e => setNewFeedType(e.target.value as typeof newFeedType)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                >
                  <option value="starter">بادي (Starter - 1 إلى 10 أيام)</option>
                  <option value="grower">نامي (Grower - 11 إلى 28 يوماً)</option>
                  <option value="finisher">ناهي (Finisher - 29 يوماً حتى البيع)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الماركة / الوصف</span>
                <input
                  type="text"
                  required
                  value={newBrand}
                  onChange={e => setNewBrand(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">المستودع / المزرعة المستلمة</span>
                <select
                  required
                  value={newFarmId}
                  onChange={e => { setNewFarmId(e.target.value); setNewCycleId(''); }}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                  {farms.filter(f => isFarmAllowed(f.id)).map(f => (
                    <option key={f.id} value={f.id}>📍 {f.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الكمية بالكيلوغرام (كغ)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={newQuantityKg}
                  onChange={e => setNewQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black text-sm"
                  placeholder="مثال: 5000 كغ (5 طن)"
                />
                <span className="text-[10px] text-amber-400 font-bold block">
                  يعادل {Math.ceil((Number(newQuantityKg) || 0) / 50)} كيس (50 كغ)
                </span>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">سعر الكيلوغرام ({currency}/كغ)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  required
                  value={newUnitPrice}
                  onChange={e => setNewUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black text-sm"
                  placeholder="مثال: 4.50"
                />
              </label>
            </div>

            {/* Total Spend & Payment Box */}
            <div className="bg-stone-950/80 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-bold">المبلغ الإجمالي للفاتورة:</span>
                <strong className="text-base font-black text-amber-300">
                  {((Number(newQuantityKg) || 0) * (Number(newUnitPrice) || 0)).toLocaleString()} {currency}
                </strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <label className="space-y-1">
                  <span className="block text-emerald-300 font-bold">المدفوع نقداً الآن</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newPaidAmount}
                    onChange={e => setNewPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-900 border border-emerald-500/40 rounded-lg p-2 text-emerald-300 font-black"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">حساب الخزينة / البنك</span>
                  <select
                    disabled={!newPaidAmount || Number(newPaidAmount) <= 0}
                    value={newAccountId}
                    onChange={e => setNewAccountId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100 disabled:opacity-50"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} {currency})</option>
                    ))}
                  </select>
                </label>

                <div className="rounded-lg bg-stone-900 border border-stone-800 p-2 flex flex-col justify-center">
                  <span className="text-[10px] text-stone-400 font-semibold">المتبقي في الذمة (دين):</span>
                  <strong className="text-sm font-black text-rose-400">
                    {Math.max(0, ((Number(newQuantityKg) || 0) * (Number(newUnitPrice) || 0)) - (Number(newPaidAmount) || 0)).toLocaleString()} {currency}
                  </strong>
                </div>
              </div>
            </div>

            {purchaseError && (
              <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-2.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{purchaseError}</span>
              </div>
            )}

            <textarea
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="ملاحظات إضافية حول الشحنة، رقم الشاحنة، السائق..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 min-h-16"
            />

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setPurchaseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md"
              >
                تأكيد وحفظ الشحنة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: FEED MOVEMENT / CONSUMPTION / TRANSFER (صرف / استهلاك / تحويل) */}
      {movementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handleMovementSubmit} className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-stone-100">تسجيل صرف أو تحويل أو هدر علف</h3>
              </div>
              <button type="button" onClick={() => setMovementModalOpen(false)} className="text-stone-400 hover:text-white text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">نوع الحركة</span>
                <select
                  value={mType}
                  onChange={e => setMType(e.target.value as typeof mType)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                >
                  <option value="issue">صرف واستهلاك للدورة</option>
                  <option value="waste">تسجيل هدر / منسكب</option>
                  {(currentUser.role === 'admin' || currentUser.role === 'farm_manager') && (
                    <option value="transfer">تحويل بين المزارع</option>
                  )}
                  <option value="return">مرتجع للمخزن</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">التاريخ</span>
                <input
                  type="date"
                  required
                  value={mDate}
                  onChange={e => setMDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">مزرعة المصدر / المخزن</span>
                <select
                  required
                  value={mFarmId}
                  onChange={e => { setMFarmId(e.target.value); setMCycleId(''); }}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                  {farms.filter(f => isFarmAllowed(f.id)).map(f => (
                    <option key={f.id} value={f.id}>📍 {f.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الكمية بالكيلوغرام (كغ)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={mQuantityKg}
                  onChange={e => setMQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black text-sm"
                  placeholder="مثال: 500 كغ (10 أكياس)"
                />
              </label>

              {mType === 'issue' && (
                <label className="space-y-1 col-span-2">
                  <span className="block text-stone-300 font-bold">الدورة / العنبر المستفيد</span>
                  <select
                    required
                    value={mCycleId}
                    onChange={e => setMCycleId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    <option value="">اختر الدورة</option>
                    {cycles.filter(c => (mFarmId === 'central' || c.farmId === mFarmId) && c.status !== 'completed').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.cycleNumber} ({farms.find(f => f.id === c.farmId)?.name || 'مزرعة'}) {c.barnNumber ? `(${c.barnNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {mType === 'transfer' && (
                <label className="space-y-1 col-span-2">
                  <span className="block text-stone-300 font-bold">المزرعة / المستودع المستقبل</span>
                  <select
                    required
                    value={mDestinationFarmId}
                    onChange={e => setMDestinationFarmId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    <option value="">اختر المزرعة أو المخزن المستقبل</option>
                    {mFarmId !== 'central' && (
                      <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                    )}
                    {farms.filter(f => isFarmAllowed(f.id) && f.id !== mFarmId).map(f => (
                      <option key={f.id} value={f.id}>📍 {f.name}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {(() => {
              const currentSourceStockKg = getFarmFeedStockKg(mFarmId);
              const remainingAfterMove = Math.max(0, currentSourceStockKg - Number(mQuantityKg || 0));
              const isOverStock = ['issue', 'waste', 'transfer'].includes(mType) && Number(mQuantityKg || 0) > currentSourceStockKg;
              const sourceFarmName = mFarmId === 'central' ? '🏢 المخزن العام (المستودع المركزي)' : (farms.find(f => f.id === mFarmId)?.name || 'المزرعة');

              return (
                <div className="rounded-xl bg-stone-950/80 border border-amber-500/30 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300 font-bold">رصيد العلف المتاح في ({sourceFarmName}):</span>
                    <strong className="text-amber-300 font-black">
                      {currentSourceStockKg.toLocaleString()} كغ ({Math.floor(currentSourceStockKg / 50)} كيس 50كغ)
                    </strong>
                  </div>
                  {Number(mQuantityKg || 0) > 0 && ['issue', 'waste', 'transfer'].includes(mType) && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800">
                      <span className="text-stone-400">الرصيد بعد الحركة:</span>
                      <strong className={`font-black ${isOverStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {remainingAfterMove.toLocaleString()} كغ ({Math.floor(remainingAfterMove / 50)} كيس)
                      </strong>
                    </div>
                  )}
                </div>
              );
            })()}

            {movementError && (
              <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-2.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{movementError}</span>
              </div>
            )}

            <textarea
              value={mNotes}
              onChange={e => setMNotes(e.target.value)}
              placeholder="ملاحظات حول الحركة..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 min-h-16"
            />

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setMovementModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow"
              >
                حفظ الحركة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: SUPPLIER LIQUIDITY PAYMENT (سداد سيولة لمورد علف) */}
      {supplierPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handleSupplierPaymentSubmit} className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-stone-100">سداد دفعة سيولة لمورد أعلاف</h3>
              </div>
              <button type="button" onClick={() => setSupplierPaymentModalOpen(false)} className="text-stone-400 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="space-y-1 block">
                <span className="block text-stone-300 font-bold">شركة / مورد العلف</span>
                <select
                  required
                  value={paySupplierId}
                  onChange={e => {
                    const sid = e.target.value;
                    setPaySupplierId(sid);
                    const debt = feedSuppliersDebtList.find(s => s.supplier.id === sid)?.balanceOwed || 0;
                    if (debt > 0) setPayAmount(debt);
                  }}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-bold"
                >
                  <option value="">اختر مورد العلف</option>
                  {feedSupplierPartners.map(p => {
                    const debt = feedSuppliersDebtList.find(s => s.supplier.id === p.id)?.balanceOwed || 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {debt > 0 ? `(مستحق: ${debt.toLocaleString()} ${currency})` : '(لا توجد ديون)'}
                      </option>
                    );
                  })}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">المبلغ المسدد ({currency})</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-black text-base"
                    placeholder="المبلغ بالدرهم"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">حساب الخزينة / البنك</span>
                  <select
                    required
                    value={payAccountId}
                    onChange={e => setPayAccountId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} {currency})</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="block text-stone-300 font-bold">طريقة الدفع</span>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="cash">نقداً (Cash)</option>
                  <option value="bank">تحويل بنكي (Virement)</option>
                  <option value="check">شيك بنكي (Chèque)</option>
                </select>
              </label>
            </div>

            {payError && (
              <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-2.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{payError}</span>
              </div>
            )}

            <textarea
              value={payNotes}
              onChange={e => setPayNotes(e.target.value)}
              placeholder="بيان الدفعة أو رقم الشيك أو إيصال التحويل..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 min-h-16"
            />

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSupplierPaymentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow"
              >
                تأكيد سداد السيولة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: INVENTORY ADJUSTMENT (جرد ومطابقة المخزون) */}
      {adjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handleAdjustmentSubmit} className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-stone-100">جرد وتصحيح رصيد المخزون الفعلي</h3>
              </div>
              <button type="button" onClick={() => setAdjustmentModalOpen(false)} className="text-stone-400 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-stone-950/80 border border-stone-800 p-3 flex items-center justify-between">
                <span className="text-stone-400">الرصيد الدفتري المسجل حالياً:</span>
                <strong className="text-amber-300 text-sm font-black">
                  {calculations.netPhysicalStockKg.toLocaleString()} كغ ({Math.round(calculations.netPhysicalStockKg / 50)} كيس)
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">المزرعة / المستودع</span>
                  <select
                    required
                    value={adjFarmId}
                    onChange={e => setAdjFarmId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                    {farms.filter(f => isFarmAllowed(f.id)).map(f => (
                      <option key={f.id} value={f.id}>📍 {f.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">الصنف الرئيسي</span>
                  <select
                    value={adjFeedType}
                    onChange={e => setAdjFeedType(e.target.value as typeof adjFeedType)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                  >
                    <option value="starter">بادي (Starter)</option>
                    <option value="grower">نامي (Grower)</option>
                    <option value="finisher">ناهي (Finisher)</option>
                  </select>
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="block text-emerald-300 font-bold">الوزن الفعلي المحسوب في المخزن (كغ)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={adjActualWeightKg}
                  onChange={e => setAdjActualWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-black text-base"
                  placeholder="أدخل الوزن الفعلي بالكيلوغرام"
                />
              </label>

              {adjActualWeightKg !== '' && (
                <div className="rounded-xl bg-stone-950 p-2.5 border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-400">فارق التسوية المحسوب:</span>
                  <strong className={Number(adjActualWeightKg) >= calculations.netPhysicalStockKg ? 'text-emerald-400' : 'text-rose-400 font-black'}>
                    {Number(adjActualWeightKg) >= calculations.netPhysicalStockKg
                      ? `+${(Number(adjActualWeightKg) - calculations.netPhysicalStockKg).toLocaleString()} كغ (زيادة)`
                      : `${(Number(adjActualWeightKg) - calculations.netPhysicalStockKg).toLocaleString()} كغ (عجز/هدر)`}
                  </strong>
                </div>
              )}
            </div>

            {adjError && (
              <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-2.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{adjError}</span>
              </div>
            )}

            <textarea
              value={adjReason}
              onChange={e => setAdjReason(e.target.value)}
              placeholder="سبب التسوية الجردية وتفاصيل المحضر..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 min-h-16"
            />

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setAdjustmentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow"
              >
                تثبيت حركة التسوية
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: MEDICATION MOVEMENT (صرف دواء لدورة) */}
      {medMovementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handleMedicationMovementSubmit} className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-black text-stone-100">تسجيل حركة مخزون الدواء واللقاح</h3>
              <button type="button" onClick={() => setMedMovementOpen(false)} className="text-stone-400 text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">نوع الحركة</span>
                <select value={medMovementType} onChange={e => setMedMovementType(e.target.value as typeof medMovementType)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                  <option value="issue">صرف للدورة</option>
                  <option value="return">مرتجع للمخزن</option>
                  <option value="waste">هدر/تلف</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">التاريخ</span>
                <input type="date" required value={medMovementDate} onChange={e => setMedMovementDate(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">المزرعة</span>
                <select required value={medMovementFarmId} onChange={e => { setMedMovementFarmId(e.target.value); setMedMovementPurchaseId(''); setMedMovementCycleId(''); }} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                  {farms.filter(f => isFarmAllowed(f.id)).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 col-span-2">
                <span className="block text-stone-300 font-bold">مصدر الدواء / اللقاح</span>
                <select required value={medMovementPurchaseId} onChange={e => setMedMovementPurchaseId(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                  <option value="">اختر من المخزون</option>
                  {medicationPurchases.filter(p => p.farmId === medMovementFarmId).map(p => {
                    const item = medStockItems.find(i => i.purchase.id === p.id);
                    return <option key={p.id} value={p.id}>{p.medicationName} — متاح {item?.available || 0} {p.unit || 'وحدة'}</option>;
                  })}
                </select>
              </label>

              {medMovementType === 'issue' && (
                <label className="space-y-1 col-span-2">
                  <span className="block text-stone-300 font-bold">الدورة المستفيدة</span>
                  <select required value={medMovementCycleId} onChange={e => setMedMovementCycleId(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                    <option value="">اختر الدورة</option>
                    {medMovementCycles.map(c => (
                      <option key={c.id} value={c.id}>{c.cycleNumber}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الكمية ({selectedMedSource?.purchase.unit || 'الوحدة'})</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  max={selectedMedSource?.available}
                  value={medMovementQuantity}
                  onChange={e => setMedMovementQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                />
              </label>

              <div className="rounded-lg bg-stone-950/60 border border-stone-800 p-2 text-xs text-stone-400">
                القيمة المستهلكة<br />
                <strong className="text-indigo-300">
                  {selectedMedSource && medMovementQuantity ? (Number(medMovementQuantity) * (selectedMedSource.purchase.unitPrice || selectedMedSource.purchase.totalAmount / Math.max(1, selectedMedSource.purchase.quantity || 1))).toLocaleString() : '0'} {currency}
                </strong>
              </div>
            </div>

            {medMovementError && (
              <div role="alert" className="rounded-lg border border-rose-800/70 bg-rose-950/40 p-2 text-xs font-bold text-rose-300">
                {medMovementError}
              </div>
            )}

            <textarea value={medMovementNotes} onChange={e => setMedMovementNotes(e.target.value)} placeholder="ملاحظات الحركة (اختياري)" className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-100 min-h-16" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setMedMovementOpen(false)} className="flex-1 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs">إلغاء</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs">حفظ الحركة</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: FEED SALE (بيع علف لزبون) */}
      {saleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handleSaleSubmit} className="w-full max-w-lg bg-stone-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-stone-100">تسجيل فاتورة بيع علف لزبون</h3>
              </div>
              <button type="button" onClick={() => setSaleModalOpen(false)} className="text-stone-400 hover:text-white text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الزبون</span>
                <select
                  required
                  value={saleCustomerId}
                  onChange={e => setSaleCustomerId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="">اختر الزبون...</option>
                  {customerPartners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">مزرعة المصدر / المستودع</span>
                <select
                  required
                  value={saleFarmId}
                  onChange={e => setSaleFarmId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="central">🏢 المخزن العام (المستودع المركزي للأعلاف)</option>
                  {farms.filter(f => isFarmAllowed(f.id)).map(f => (
                    <option key={f.id} value={f.id}>📍 {f.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">التاريخ</span>
                <input
                  type="date"
                  required
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">نوع العلف المباع</span>
                <select
                  value={saleFeedType}
                  onChange={e => setSaleFeedType(e.target.value as typeof saleFeedType)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                >
                  <option value="starter">بادئ (Starter)</option>
                  <option value="grower">نمو (Grower)</option>
                  <option value="finisher">ناهي (Finisher)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الكمية المباعة (كغ)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={saleQuantityKg}
                  onChange={e => setSaleQuantityKg(Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">سعر البيع للكغ ({currency})</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.05"
                  required
                  value={saleUnitPrice}
                  onChange={e => setSaleUnitPrice(Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black"
                />
              </label>

              <div className="col-span-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400">إجمالي فاتورة البيع:</span>
                <strong className="text-emerald-400 text-sm font-black">
                  {(Number(saleQuantityKg || 0) * Number(saleUnitPrice || 0)).toLocaleString()} {currency}
                </strong>
              </div>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">المبلغ المحصل نقداً ({currency})</span>
                <input
                  type="number"
                  min="0"
                  max={Number(saleQuantityKg || 0) * Number(saleUnitPrice || 0)}
                  value={salePaidAmount}
                  onChange={e => setSalePaidAmount(Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black"
                />
              </label>

              <label className="space-y-1">
                <span className="block text-stone-300 font-bold">الحساب المودع فيه (الخزينة/البنك)</span>
                <select
                  value={saleAccountId}
                  onChange={e => setSaleAccountId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                >
                  <option value="">اختر الحساب...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {saleError && (
              <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-2.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{saleError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSaleModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow"
              >
                تأكيد فاتورة البيع
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: CUSTOMER DEBT COLLECTION (تحصيل مستحقات بيع علف) */}
      {customerCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm no-print">
          <form onSubmit={handleCustomerCollectionSubmit} className="w-full max-w-md bg-stone-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-stone-100">تحصيل دفعة من زبون علف</h3>
              </div>
              <button type="button" onClick={() => setCustomerCollectionModalOpen(false)} className="text-stone-400 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="space-y-1 block">
                <span className="block text-stone-300 font-bold">الزبون</span>
                <select
                  required
                  value={collectCustomerId}
                  onChange={e => setCollectCustomerId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-semibold"
                >
                  <option value="">اختر الزبون...</option>
                  {customerPartners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 block">
                <span className="block text-stone-300 font-bold">المبلغ المحصل ({currency})</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={collectAmount}
                  onChange={e => setCollectAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-black text-base"
                  placeholder="أدخل المبلغ..."
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">طريقة القبض</span>
                  <select
                    value={collectMethod}
                    onChange={e => setCollectMethod(e.target.value as typeof collectMethod)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  >
                    <option value="cash">نقداً (كاش)</option>
                    <option value="bank">تحويل بنكي</option>
                    <option value="check">شيك بنكي</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-stone-300 font-bold">الحساب المستلم</span>
                  <select
                    required
                    value={collectAccountId}
                    onChange={e => setCollectAccountId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  >
                    <option value="">اختر الخزينة...</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <textarea
                value={collectNotes}
                onChange={e => setCollectNotes(e.target.value)}
                placeholder="رقم الإيصال أو الشيك وملاحظات التحصيل..."
                className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 min-h-16"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setCustomerCollectionModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow"
              >
                تأكيد قبض المبلغ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Official Print Footer */}
      <div className="print-only pt-8 mt-6 border-t-2 border-stone-300">
        <div className="flex items-center justify-between text-xs text-stone-700">
          <div>
            <span className="font-bold block">أمين المخزن والتموين:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">المحاسب المعتمد:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">مصادقة الإدارة العامة:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
