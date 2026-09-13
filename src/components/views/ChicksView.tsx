import React, { useState, useMemo, useEffect } from 'react';
import {
  Baby,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  TrendingDown,
  Truck,
  ShieldCheck,
  Thermometer,
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Eye,
  X,
  Sparkles,
  Layers,
  ArrowUpDown,
  ShoppingCart,
  TrendingUp,
  Users2,
  Warehouse,
  Coins,
  ArrowRightLeft
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { ChickPurchase, ChickSale, PaymentMethod } from '../../types';
import { StorageService } from '../../services/storageService';
import { ChicksFinanceTab } from './chicks/ChicksFinanceTab';
import { ChicksSalesTab } from './chicks/ChicksSalesTab';
import { ChicksDistributionTab } from './chicks/ChicksDistributionTab';
import { ChicksHatcheriesTab } from './chicks/ChicksHatcheriesTab';
import { ChickSaleModal } from './chicks/ChickSaleModal';
import { ChickSaleReceiptModal } from './chicks/ChickSaleReceiptModal';

interface ChicksViewProps {
  onNavigate?: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
  initialSubTab?: 'finance' | 'purchases' | 'sales' | 'distribution' | 'hatcheries';
}

export const ChicksView: React.FC<ChicksViewProps> = ({ onOpenQuickAction, onNavigate, initialSubTab }) => {
  const {
    chickPurchases,
    chickSales,
    farms,
    cycles,
    partners,
    accounts,
    currency,
    language,
    selectedFarmId,
    deleteChickPurchase,
    addChickPurchase,
    updateChickPurchase,
    addChickSale,
    updateChickSale,
    deleteChickSale
  } = useFarm();

  // Sub-tabs inside Chicks Hub
  const [activeTab, setActiveTab] = useState<'finance' | 'purchases' | 'sales' | 'distribution' | 'hatcheries'>(initialSubTab || 'purchases');

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Search & Filter States for Purchases
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedCycleId, setSelectedCycleId] = useState<string>('all');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'count_desc' | 'cost_desc'>('date_desc');

  // Search & Filter States for Sales
  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('all');

  // Modal States
  const [selectedReceipt, setSelectedReceipt] = useState<ChickPurchase | null>(null);
  const [selectedSaleReceipt, setSelectedSaleReceipt] = useState<ChickSale | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [editingChick, setEditingChick] = useState<ChickPurchase | null>(null);
  const [editingSale, setEditingSale] = useState<ChickSale | null>(null);

  // Form State for Chick Sale
  const [saleInvoiceNumber, setSaleInvoiceNumber] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().substring(0, 10));
  const [saleCustomerId, setSaleCustomerId] = useState('');
  const [saleFarmId, setSaleFarmId] = useState('');
  const [saleBreed, setSaleBreed] = useState('Cobb 500');
  const [saleQuantity, setSaleQuantity] = useState<number | ''>(5000);
  const [saleBonusCount, setSaleBonusCount] = useState<number | ''>(100);
  const [saleUnitPrice, setSaleUnitPrice] = useState<number | ''>(6.5);
  const [saleCostUnitPrice, setSaleCostUnitPrice] = useState<number | ''>(5.6);
  const [salePaidAmount, setSalePaidAmount] = useState<number | ''>(32500);
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('cash');
  const [saleAccountId, setSaleAccountId] = useState('');
  const [saleTruckPlate, setSaleTruckPlate] = useState('');
  const [saleDriverName, setSaleDriverName] = useState('');
  const [saleDriverPhone, setSaleDriverPhone] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  // Form State for Add / Edit
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formBreed, setFormBreed] = useState('Cobb 500');
  const [formChickType, setFormChickType] = useState('broiler');
  const [formFarmId, setFormFarmId] = useState('');
  const [formHangarName, setFormHangarName] = useState('عنبر 1');
  const [formCycleId, setFormCycleId] = useState('');
  const [formAutoCreateCycle, setFormAutoCreateCycle] = useState(false);
  const [formOrderedCount, setFormOrderedCount] = useState<number | ''>(20000);
  const [formBonusPercent, setFormBonusPercent] = useState<number | ''>(2);
  const [formTransportMortality, setFormTransportMortality] = useState<number | ''>(30);
  const [formUnitPrice, setFormUnitPrice] = useState<number | ''>(5.6);
  const [formTransportCost, setFormTransportCost] = useState<number | ''>(2000);
  const [formVaccineCost, setFormVaccineCost] = useState<number | ''>(1000);
  const [formPaidAmount, setFormPaidAmount] = useState<number | ''>(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [formAccountId, setFormAccountId] = useState('');
  const [formTruckPlate, setFormTruckPlate] = useState('');
  const [formDriverName, setFormDriverName] = useState('');
  const [formDriverPhone, setFormDriverPhone] = useState('');
  const [formReceptionTime, setFormReceptionTime] = useState('06:00 ص');
  const [formBoxTemp, setFormBoxTemp] = useState<number | ''>(31.5);
  const [formAvgWeight, setFormAvgWeight] = useState<number | ''>(42);
  const [formUniformity, setFormUniformity] = useState<number | ''>(88);
  const [formVaccines, setFormVaccines] = useState<string[]>(['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)']);
  const [formQualityScore, setFormQualityScore] = useState<'excellent' | 'good' | 'acceptable' | 'poor'>('excellent');
  const [formNotes, setFormNotes] = useState('');

  // Suppliers who are hatcheries
  const hatcheries = useMemo(() => {
    return partners.filter(p => p.type === 'supplier');
  }, [partners]);

  // Derived Calculations for Add Form
  const numOrdered = Number(formOrderedCount) || 0;
  const numBonusPercent = Number(formBonusPercent) || 0;
  const calculatedBonus = Math.round((numOrdered * numBonusPercent) / 100);
  const numMortality = Number(formTransportMortality) || 0;
  const calculatedHealthyReceived = Math.max(0, numOrdered + calculatedBonus - numMortality);
  const numUnitPrice = Number(formUnitPrice) || 0;
  const calculatedChickCost = numOrdered * numUnitPrice;
  const numTransportCost = Number(formTransportCost) || 0;
  const numVaccineCost = Number(formVaccineCost) || 0;
  const calculatedTotalAmount = calculatedChickCost + numTransportCost + numVaccineCost;
  const numPaid = formPaidAmount === '' ? calculatedTotalAmount : Number(formPaidAmount);
  const calculatedRemaining = Math.max(0, calculatedTotalAmount - numPaid);

  // Filtered List
  const filteredChicks = useMemo(() => {
    return chickPurchases.filter(c => {
      // Farm filter
      if (selectedFarmId !== 'all' && c.farmId !== selectedFarmId) return false;
      // Breed filter
      if (selectedBreed !== 'all' && c.breed !== selectedBreed) return false;
      // Cycle filter
      if (selectedCycleId !== 'all' && c.cycleId !== selectedCycleId) return false;
      // Supplier filter
      if (selectedSupplierId !== 'all' && c.supplierId !== selectedSupplierId) return false;
      // Payment status
      if (selectedPaymentStatus === 'paid' && c.remainingAmount > 0) return false;
      if (selectedPaymentStatus === 'partial' && (c.paidAmount === 0 || c.remainingAmount === 0)) return false;
      if (selectedPaymentStatus === 'unpaid' && c.paidAmount > 0) return false;

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sup = partners.find(p => p.id === c.supplierId)?.name?.toLowerCase() || '';
        const farm = farms.find(f => f.id === c.farmId)?.name?.toLowerCase() || '';
        const matchInvoice = c.invoiceNumber.toLowerCase().includes(q);
        const matchBatch = (c.batchNumber || '').toLowerCase().includes(q);
        const matchSupplier = sup.includes(q) || (c.supplierName || '').toLowerCase().includes(q);
        const matchBreed = c.breed.toLowerCase().includes(q);
        const matchFarm = farm.includes(q);
        const matchTruck = (c.truckPlate || '').toLowerCase().includes(q);
        const matchDriver = (c.driverName || '').toLowerCase().includes(q);
        if (!matchInvoice && !matchBatch && !matchSupplier && !matchBreed && !matchFarm && !matchTruck && !matchDriver) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'count_desc') return b.receivedHealthyCount - a.receivedHealthyCount;
      if (sortBy === 'cost_desc') return b.totalAmount - a.totalAmount;
      return 0;
    });
  }, [chickPurchases, selectedFarmId, selectedBreed, selectedCycleId, selectedSupplierId, selectedPaymentStatus, searchQuery, sortBy, partners, farms]);

  // Overall Totals
  const totalChicksOrdered = filteredChicks.reduce((s, c) => s + c.orderedCount, 0);
  const totalChicksReceived = filteredChicks.reduce((s, c) => s + c.receivedHealthyCount, 0);
  const totalBonusGiven = filteredChicks.reduce((s, c) => s + (c.bonusCount || 0), 0);
  const totalTransportMortality = filteredChicks.reduce((s, c) => s + c.transportMortalityCount, 0);
  const overallMortalityRate = totalChicksOrdered > 0 ? ((totalTransportMortality / (totalChicksOrdered + totalBonusGiven)) * 100).toFixed(2) : '0';
  const totalPurchasesCost = filteredChicks.reduce((s, c) => s + c.totalAmount, 0);
  const totalPaid = filteredChicks.reduce((s, c) => s + c.paidAmount, 0);
  const totalRemainingDebt = filteredChicks.reduce((s, c) => s + c.remainingAmount, 0);
  const avgChickPrice = totalChicksOrdered > 0 ? (filteredChicks.reduce((s, c) => s + c.chickCost, 0) / totalChicksOrdered).toFixed(2) : '0';

  // Handle Export CSV
  const handleExportCSV = () => {
    const csvContent = StorageService.exportChickPurchasesCSV();
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chick_purchases_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    setEditingChick(null);
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormInvoiceNumber(`FAC-CHK-${new Date().getFullYear()}-${String(chickPurchases.length + 1).padStart(3, '0')}`);
    setFormBatchNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setFormSupplierId(hatcheries[0]?.id || '');
    setFormBreed('Cobb 500');
    setFormChickType('broiler');
    setFormFarmId(selectedFarmId !== 'all' ? selectedFarmId : (farms[0]?.id || ''));
    setFormHangarName('عنبر 1');
    setFormCycleId('');
    setFormAutoCreateCycle(true);
    setFormOrderedCount(20000);
    setFormBonusPercent(2);
    setFormTransportMortality(30);
    setFormUnitPrice(5.6);
    setFormTransportCost(2000);
    setFormVaccineCost(1000);
    setFormPaidAmount(115000);
    setFormPaymentMethod('bank_transfer');
    setFormAccountId(accounts[0]?.id || '');
    setFormTruckPlate('45-A-12345');
    setFormDriverName('سعيد التازي');
    setFormDriverPhone('0661998877');
    setFormReceptionTime('06:00 ص');
    setFormBoxTemp(31.5);
    setFormAvgWeight(42);
    setFormUniformity(88);
    setFormVaccines(['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)']);
    setFormQualityScore('excellent');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (chick: ChickPurchase) => {
    setEditingChick(chick);
    setFormDate(chick.date);
    setFormInvoiceNumber(chick.invoiceNumber);
    setFormBatchNumber(chick.batchNumber || '');
    setFormSupplierId(chick.supplierId);
    setFormBreed(chick.breed);
    setFormChickType(chick.chickType || 'broiler');
    setFormFarmId(chick.farmId);
    setFormHangarName(chick.hangarName || 'عنبر 1');
    setFormCycleId(chick.cycleId || '');
    setFormAutoCreateCycle(false);
    setFormOrderedCount(chick.orderedCount);
    setFormBonusPercent(chick.bonusPercent || 2);
    setFormTransportMortality(chick.transportMortalityCount);
    setFormUnitPrice(chick.unitPrice);
    setFormTransportCost(chick.transportCost || 0);
    setFormVaccineCost(chick.vaccineCostAtHatchery || 0);
    setFormPaidAmount(chick.paidAmount);
    setFormPaymentMethod(chick.paymentMethod);
    setFormAccountId(chick.accountId || accounts[0]?.id || '');
    setFormTruckPlate(chick.truckPlate || '');
    setFormDriverName(chick.driverName || '');
    setFormDriverPhone(chick.driverPhone || '');
    setFormReceptionTime(chick.receptionTime || '06:00 ص');
    setFormBoxTemp(chick.boxTemperatureCelsius || 31.5);
    setFormAvgWeight(chick.averageWeightGrams || 42);
    setFormUniformity(chick.uniformityPercent || 88);
    setFormVaccines(chick.hatcheryVaccines || ['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)']);
    setFormQualityScore(chick.qualityScore || 'excellent');
    setFormNotes(chick.notes || '');
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInvoiceNumber || !formSupplierId || !formFarmId || numOrdered <= 0) {
      alert('يرجى ملء جميع الحقول الإلزامية (رقم الفاتورة، المفرخة، المزرعة، العدد المطلوب)');
      return;
    }

    const supplier = partners.find(p => p.id === formSupplierId);

    const chickData: Omit<ChickPurchase, 'id' | 'createdAt'> = {
      invoiceNumber: formInvoiceNumber.trim(),
      batchNumber: formBatchNumber.trim(),
      date: formDate,
      supplierId: formSupplierId,
      supplierName: supplier?.name || 'مفرخة',
      breed: formBreed,
      chickType: formChickType,
      farmId: formFarmId,
      hangarName: formHangarName,
      cycleId: formCycleId || undefined,
      orderedCount: numOrdered,
      bonusPercent: numBonusPercent,
      bonusCount: calculatedBonus,
      transportMortalityCount: numMortality,
      receivedHealthyCount: calculatedHealthyReceived,
      unitPrice: numUnitPrice,
      chickCost: calculatedChickCost,
      transportCost: numTransportCost,
      vaccineCostAtHatchery: numVaccineCost,
      totalAmount: calculatedTotalAmount,
      paidAmount: numPaid,
      remainingAmount: calculatedRemaining,
      paymentMethod: formPaymentMethod,
      accountId: formAccountId || undefined,
      truckPlate: formTruckPlate.trim(),
      driverName: formDriverName.trim(),
      driverPhone: formDriverPhone.trim(),
      receptionTime: formReceptionTime.trim(),
      boxTemperatureCelsius: Number(formBoxTemp) || undefined,
      averageWeightGrams: Number(formAvgWeight) || undefined,
      uniformityPercent: Number(formUniformity) || undefined,
      hatcheryVaccines: formVaccines,
      qualityScore: formQualityScore,
      notes: formNotes.trim()
    };

    if (editingChick) {
      updateChickPurchase(editingChick.id, chickData);
    } else {
      addChickPurchase(chickData, formAutoCreateCycle && !formCycleId);
    }

    setIsAddModalOpen(false);
  };

  const toggleVaccine = (vaccine: string) => {
    if (formVaccines.includes(vaccine)) {
      setFormVaccines(formVaccines.filter(v => v !== vaccine));
    } else {
      setFormVaccines([...formVaccines, vaccine]);
    }
  };

  // Customers list
  const customers = useMemo(() => partners.filter(p => p.type === 'customer'), [partners]);

  // Derived Calculations for Chick Sale Form
  const numSaleQty = Number(saleQuantity) || 0;
  const numSalePrice = Number(saleUnitPrice) || 0;
  const numSaleCostPrice = Number(saleCostUnitPrice) || 0;
  const numSaleBonus = Number(saleBonusCount) || 0;
  const calculatedSaleTotal = numSaleQty * numSalePrice;
  const numSalePaid = salePaidAmount === '' ? calculatedSaleTotal : Number(salePaidAmount);
  const calculatedSaleRemaining = Math.max(0, calculatedSaleTotal - numSalePaid);
  const calculatedSaleProfit = (numSalePrice - numSaleCostPrice) * numSaleQty;

  // Filtered Chick Sales
  const filteredChickSales = useMemo(() => {
    return (chickSales || []).filter(s => {
      if (selectedFarmId !== 'all' && s.farmId && s.farmId !== selectedFarmId) return false;
      if (selectedCustomerFilter !== 'all' && s.customerId !== selectedCustomerFilter) return false;
      if (salesSearchQuery.trim()) {
        const q = salesSearchQuery.toLowerCase();
        const custName = (s.customerName || partners.find(p => p.id === s.customerId)?.name || '').toLowerCase();
        const inv = s.invoiceNumber.toLowerCase();
        const brd = s.breed.toLowerCase();
        const trk = (s.truckPlate || '').toLowerCase();
        const drv = (s.driverName || '').toLowerCase();
        if (!custName.includes(q) && !inv.includes(q) && !brd.includes(q) && !trk.includes(q) && !drv.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [chickSales, selectedFarmId, selectedCustomerFilter, salesSearchQuery, partners]);

  // Chick Sales Totals
  const totalSalesChicksCount = filteredChickSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalSalesRevenue = filteredChickSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesPaid = filteredChickSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalSalesRemaining = filteredChickSales.reduce((sum, s) => sum + s.remainingAmount, 0);
  const avgSellingPrice = totalSalesChicksCount > 0 ? (totalSalesRevenue / totalSalesChicksCount).toFixed(2) : '0';

  // Handlers for Chick Sale Modal
  const handleOpenAddSaleModal = () => {
    setEditingSale(null);
    setSaleDate(new Date().toISOString().substring(0, 10));
    setSaleInvoiceNumber(`FAC-CSALE-${new Date().getFullYear()}-${String((chickSales || []).length + 1).padStart(3, '0')}`);
    setSaleCustomerId(customers[0]?.id || '');
    setSaleFarmId(selectedFarmId !== 'all' ? selectedFarmId : (farms[0]?.id || ''));
    setSaleBreed('Cobb 500');
    setSaleQuantity(5000);
    setSaleBonusCount(100);
    setSaleUnitPrice(6.5);
    setSaleCostUnitPrice(5.6);
    setSalePaidAmount(32500);
    setSalePaymentMethod('cash');
    setSaleAccountId(accounts[0]?.id || '');
    setSaleTruckPlate('12-B-9988');
    setSaleDriverName('');
    setSaleDriverPhone('');
    setSaleNotes('');
    setIsAddSaleModalOpen(true);
  };

  const handleOpenEditSaleModal = (sale: ChickSale) => {
    setEditingSale(sale);
    setSaleDate(sale.date);
    setSaleInvoiceNumber(sale.invoiceNumber);
    setSaleCustomerId(sale.customerId);
    setSaleFarmId(sale.farmId || sale.sourceFarmId || (farms[0]?.id || ''));
    setSaleBreed(sale.breed);
    setSaleQuantity(sale.quantity);
    setSaleBonusCount(sale.bonusCount || 0);
    setSaleUnitPrice(sale.unitPrice);
    setSaleCostUnitPrice(sale.costUnitPrice || 5.6);
    setSalePaidAmount(sale.paidAmount);
    setSalePaymentMethod(sale.paymentMethod);
    setSaleAccountId(sale.accountId || accounts[0]?.id || '');
    setSaleTruckPlate(sale.truckPlate || '');
    setSaleDriverName(sale.driverName || '');
    setSaleDriverPhone(sale.driverPhone || '');
    setSaleNotes(sale.notes || '');
    setIsAddSaleModalOpen(true);
  };

  const handleSubmitSaleForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleInvoiceNumber || !saleCustomerId || numSaleQty <= 0 || numSalePrice <= 0) {
      alert('يرجى ملء جميع الحقول الإلزامية (رقم الفاتورة، الزبون، الكمية، سعر البيع)');
      return;
    }

    const customer = partners.find(p => p.id === saleCustomerId);
    const saleData: Omit<ChickSale, 'id' | 'createdAt'> = {
      invoiceNumber: saleInvoiceNumber.trim(),
      date: saleDate,
      customerId: saleCustomerId,
      customerName: customer?.name || 'زبون',
      farmId: saleFarmId,
      sourceFarmId: saleFarmId,
      breed: saleBreed,
      quantity: numSaleQty,
      bonusCount: numSaleBonus,
      unitPrice: numSalePrice,
      costUnitPrice: numSaleCostPrice,
      totalAmount: calculatedSaleTotal,
      paidAmount: numSalePaid,
      remainingAmount: calculatedSaleRemaining,
      paymentMethod: salePaymentMethod,
      accountId: saleAccountId || undefined,
      truckPlate: saleTruckPlate.trim(),
      driverName: saleDriverName.trim(),
      driverPhone: saleDriverPhone.trim(),
      notes: saleNotes.trim()
    };

    if (editingSale) {
      updateChickSale(editingSale.id, saleData);
    } else {
      addChickSale(saleData);
    }
    setIsAddSaleModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 no-print shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-100 flex items-center gap-2">
                <span>{language === 'ar' ? 'الكتاكيت' : 'Poussins'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {filteredChicks.length} {language === 'ar' ? 'شحنة' : 'lots'}
                </span>
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
            title="تصدير بيانات الكتاكيت إلى ملف CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>طباعة</span>
          </button>
          <button
            onClick={handleOpenAddSaleModal}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span>بيع كتاكيت</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>شراء كتاكيت</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-2xl overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'finance'
              ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>لوحة الأموال والديون</span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>المشتريات والاستلام</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-stone-950/40 text-current">
            {filteredChicks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>مبيعات الكتاكيت للزبائن</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-stone-950/40 text-current">
            {(chickSales || []).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('distribution')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'distribution'
              ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>التسكين والعنابر</span>
        </button>

        <button
          onClick={() => setActiveTab('hatcheries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'hatcheries'
              ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>دليل المفارخ</span>
        </button>
      </div>

      {activeTab === 'finance' && (
        <ChicksFinanceTab
          filteredChicks={filteredChicks}
          filteredSales={filteredChickSales}
          onOpenAddPurchase={handleOpenAddModal}
          onOpenAddSale={handleOpenAddSaleModal}
        />
      )}

      {activeTab === 'sales' && (
        <ChicksSalesTab
          sales={chickSales || []}
          onOpenAddSale={handleOpenAddSaleModal}
          onEditSale={handleOpenEditSaleModal}
          onPrintSaleReceipt={(sale) => setSelectedSaleReceipt(sale)}
        />
      )}

      {activeTab === 'distribution' && (
        <ChicksDistributionTab
          purchases={chickPurchases}
          onNavigate={(tab, id) => onNavigate?.(tab, id)}
          onOpenAddPurchase={handleOpenAddModal}
        />
      )}

      {activeTab === 'hatcheries' && (
        <ChicksHatcheriesTab
          purchases={chickPurchases}
          onSelectSupplierFilter={(supplierId) => {
            setSelectedSupplierId(supplierId);
            setActiveTab('purchases');
          }}
          onOpenAddPurchase={handleOpenAddModal}
        />
      )}

      {activeTab === 'purchases' && (
        <>

      {/* Official Print Header */}
      <div className="print-only border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">
              سجل استلام وفواتير كتاكيت التسمين (Poussins d'un jour)
            </h1>
            <p className="text-xs text-stone-600">
              نظام إدارة مزارع الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold">
            <div>إجمالي الكتاكيت المستلمة: {totalChicksReceived.toLocaleString()} رأس</div>
            <div>إجمالي التكلفة: {totalPurchasesCost.toLocaleString()} {currency}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Received */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-amber-400" />
              <span>إجمالي الكتاكيت المستلمة حية</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              صافي
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              {totalChicksReceived.toLocaleString()} <span className="text-xs text-stone-400 font-normal">كتكوت</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
              <span>المطلوب: {totalChicksOrdered.toLocaleString()}</span>
              <span className="text-emerald-400">+{totalBonusGiven.toLocaleString()} مجاني</span>
            </div>
          </div>
        </div>

        {/* Card 2: Transport Mortality */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>نفوق النقل والوصول</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
              Number(overallMortalityRate) <= 0.5
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {overallMortalityRate}%
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400">
              {totalTransportMortality.toLocaleString()} <span className="text-xs text-stone-400 font-normal">رأس نافق</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              معدل ممتاز أقل من نسبة الزيادة الممنوحة (2%)
            </div>
          </div>
        </div>

        {/* Card 3: Total Cost & Average Price */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>إجمالي قيمة المشتريات</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              ~{avgChickPrice} {currency}/رأس
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">
              {totalPurchasesCost.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              تشمل ثمن الفلاكل + النقل + التحصين
            </div>
          </div>
        </div>

        {/* Card 4: Payments & Debt */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>حالة السداد للمفرخات</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              totalRemainingDebt > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {totalRemainingDebt > 0 ? 'متبقي مؤجل' : 'مسدد بالكامل'}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {totalPaid.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency} مدفوع</span>
            </div>
            <div className="text-[11px] text-rose-400 mt-1 font-semibold">
              المتبقي للمفرخات: {totalRemainingDebt.toLocaleString()} {currency}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="بحث برقم الفاتورة، المفرخة، اللوط، السلالة، الشاحنة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Breed Filter */}
          <div>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع السلالات</option>
              <option value="Cobb 500">Cobb 500 (كوب)</option>
              <option value="Ross 308">Ross 308 (روس)</option>
              <option value="Hubbard Classic">Hubbard Classic (هابرد)</option>
              <option value="Sasso">Sasso (ساسو كروازي)</option>
              <option value="ISA Brown">ISA Brown (بياض)</option>
              <option value="بلدي محسن">بلدي محسن</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع المفرخات والموردين</option>
              {hatcheries.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">حالة السداد (الكل)</option>
              <option value="paid">مسدد بالكامل</option>
              <option value="partial">مسدد جزئياً</option>
              <option value="unpaid">غير مدفوع (مؤجل)</option>
            </select>
          </div>
        </div>

        {/* Quick Tabs & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>عرض:</span>
            <span className="font-bold text-stone-200">{filteredChicks.length} شحنة كتاكيت</span>
            {selectedFarmId !== 'all' && (
              <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                {farms.find(f => f.id === selectedFarmId)?.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 text-[11px]">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-300 focus:outline-none"
            >
              <option value="date_desc">الأحدث تاريخاً</option>
              <option value="date_asc">الأقدم تاريخاً</option>
              <option value="count_desc">الأعلى عدداً</option>
              <option value="cost_desc">الأعلى تكلفة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 text-[11px] font-bold">
              <tr>
                <th className="p-3.5">تاريخ الاستلام</th>
                <th className="p-3.5">رقم الفاتورة / اللوط</th>
                <th className="p-3.5">المفرخة / المورد</th>
                <th className="p-3.5">المزرعة والعنبر</th>
                <th className="p-3.5">السلالة والجودة</th>
                <th className="p-3.5 text-center">المطلوب والزيادة</th>
                <th className="p-3.5 text-center">النافق والنقي الحي</th>
                <th className="p-3.5">السعر والمبلغ</th>
                <th className="p-3.5">حالة الأداء</th>
                <th className="p-3.5 text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredChicks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Baby className="w-10 h-10 text-stone-600 stroke-1" />
                      <p className="text-sm font-semibold">لا توجد شحنات كتاكيت مسجلة مطابقة للبحث</p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-2 px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition"
                      >
                        + تسجيل أول شحنة كتاكيت
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChicks.map((chick) => {
                  const farm = farms.find(f => f.id === chick.farmId);
                  const supplier = partners.find(p => p.id === chick.supplierId);
                  const linkedCycle = cycles.find(c => c.id === chick.cycleId);

                  return (
                    <tr key={chick.id} className="hover:bg-stone-800/40 transition group">
                      {/* Date */}
                      <td className="p-3.5 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-stone-200">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{chick.date}</span>
                        </div>
                        {chick.receptionTime && (
                          <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{chick.receptionTime}</span>
                          </div>
                        )}
                      </td>

                      {/* Invoice & Batch */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-amber-400 font-mono text-[12px]">
                          {chick.invoiceNumber}
                        </div>
                        {chick.batchNumber && (
                          <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                            لوط: {chick.batchNumber}
                          </div>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="p-3.5">
                        <div className="font-bold text-stone-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{supplier?.name || chick.supplierName || 'مفرخة معتمدة'}</span>
                        </div>
                        {chick.driverName && (
                          <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-stone-500" />
                            <span>{chick.driverName} ({chick.truckPlate || 'شاحنة مبردة'})</span>
                          </div>
                        )}
                      </td>

                      {/* Farm / Hangar / Cycle */}
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-200">
                          {farm?.name || 'مزرعة'}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <span className="bg-stone-800 px-1.5 py-0.2 rounded text-[10px]">
                            {chick.hangarName || 'عنبر 1'}
                          </span>
                          {linkedCycle && (
                            <span className="text-amber-400/90 text-[10px] underline cursor-pointer" onClick={() => onNavigate && onNavigate('cycles')}>
                              {linkedCycle.cycleNumber.substring(0, 16)}...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Breed & Quality */}
                      <td className="p-3.5">
                        <div className="font-bold text-stone-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                          <span>{chick.breed}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                          {chick.averageWeightGrams && (
                            <span className="text-stone-400 flex items-center gap-0.5">
                              <Scale className="w-2.5 h-2.5 text-blue-400" />
                              {chick.averageWeightGrams} غ
                            </span>
                          )}
                          {chick.boxTemperatureCelsius && (
                            <span className="text-stone-400 flex items-center gap-0.5">
                              <Thermometer className="w-2.5 h-2.5 text-amber-400" />
                              {chick.boxTemperatureCelsius}°م
                            </span>
                          )}
                          {chick.qualityScore && (
                            <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                              chick.qualityScore === 'excellent' ? 'bg-emerald-500/20 text-emerald-300' :
                              chick.qualityScore === 'good' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {chick.qualityScore === 'excellent' ? 'ممتاز' : chick.qualityScore === 'good' ? 'جيد' : 'مقبول'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ordered & Bonus */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="font-bold text-stone-200">
                          {chick.orderedCount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                          +{chick.bonusCount || Math.round((chick.orderedCount * (chick.bonusPercent || 2)) / 100)} ({chick.bonusPercent || 2}% مجاني)
                        </div>
                      </td>

                      {/* Mortality & Healthy Received */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="font-black text-amber-300 text-[13px]">
                          {chick.receivedHealthyCount.toLocaleString()} <span className="text-[10px] text-stone-400 font-normal">حي</span>
                        </div>
                        <div className="text-[10px] text-rose-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
                          <span>نافق: {chick.transportMortalityCount}</span>
                          <span className="text-[9px] text-stone-500">
                            ({((chick.transportMortalityCount / (chick.orderedCount + (chick.bonusCount || 0))) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </td>

                      {/* Unit Price & Total */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-black text-stone-100">
                          {chick.totalAmount.toLocaleString()} <span className="text-[10px] text-stone-400">{currency}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          سعر الرأس: <span className="text-amber-400 font-semibold">{chick.unitPrice} {currency}</span>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {chick.remainingAmount === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مسدد بالكامل</span>
                          </span>
                        ) : chick.paidAmount > 0 ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              <span>جزئي (مدفوع: {chick.paidAmount.toLocaleString()})</span>
                            </span>
                            <div className="text-[10px] text-rose-400 font-bold mt-0.5">
                              متبقي: {chick.remainingAmount.toLocaleString()} {currency}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" />
                            <span>مؤجل غير مدفوع</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedReceipt(chick)}
                            className="p-1.5 bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 text-stone-300 rounded-lg transition"
                            title="عرض وطباعة وصل استلام شحنة كتاكيت"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(chick)}
                            className="p-1.5 bg-stone-800 hover:bg-blue-500/20 hover:text-blue-300 text-stone-300 rounded-lg transition"
                            title="تعديل الشحنة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف فاتورة كتاكيت رقم ${chick.invoiceNumber}؟`)) {
                                deleteChickPurchase(chick.id);
                              }
                            }}
                            className="p-1.5 bg-stone-800 hover:bg-rose-500/20 hover:text-rose-400 text-stone-400 rounded-lg transition"
                            title="حذف الشحنة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
      </>
      )}

      {/* Official Delivery Receipt Voucher Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full p-5 sm:p-6 text-stone-100 space-y-4 shadow-2xl animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 no-print">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  وصل استلام شحنة كتاكيت (Bon de Réception Poussins)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الوصل</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Printable Content */}
            <div className="p-4 bg-white text-stone-900 rounded-xl border border-stone-200 text-xs font-sans space-y-4 printable-voucher">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-stone-800 pb-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-wide">
                    وصل استلام شحنة كتاكيت يوم واحد
                  </h2>
                  <p className="text-[11px] text-stone-600 font-medium">
                    Bon de Livraison & Réception Poussins d'un Jour
                  </p>
                  <div className="text-[10px] text-stone-500 mt-1">
                    التاريخ: <span className="font-bold text-stone-800">{selectedReceipt.date}</span> | وقت الوصول: <span className="font-bold text-stone-800">{selectedReceipt.receptionTime || 'صباحاً'}</span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="font-black text-amber-700 text-sm">{selectedReceipt.invoiceNumber}</div>
                  <div className="text-[10px] text-stone-500">لوط: {selectedReceipt.batchNumber || '-'}</div>
                </div>
              </div>

              {/* Partners & Farm Details */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-[11px]">
                <div>
                  <span className="font-bold text-stone-700 block">المفرخة والمصدر:</span>
                  <div className="font-bold text-stone-900 mt-0.5">
                    {partners.find(p => p.id === selectedReceipt.supplierId)?.name || selectedReceipt.supplierName}
                  </div>
                  <div className="text-stone-600 text-[10px]">سائق الشاحنة: {selectedReceipt.driverName || 'سائق معتمد'} ({selectedReceipt.truckPlate || '-'})</div>
                  {selectedReceipt.driverPhone && <div className="text-stone-600 text-[10px]">هاتف السائق: {selectedReceipt.driverPhone}</div>}
                </div>
                <div>
                  <span className="font-bold text-stone-700 block">المزرعة والعنبر المستلم:</span>
                  <div className="font-bold text-stone-900 mt-0.5">
                    {farms.find(f => f.id === selectedReceipt.farmId)?.name}
                  </div>
                  <div className="text-stone-600 text-[10px]">العنبر: {selectedReceipt.hangarName || 'عنبر 1'}</div>
                  <div className="text-stone-600 text-[10px]">السلالة: <strong className="text-amber-800">{selectedReceipt.breed}</strong></div>
                </div>
              </div>

              {/* Counts & Statistics Table */}
              <table className="w-full border-collapse border border-stone-300 text-center text-[11px]">
                <thead className="bg-stone-100 font-bold">
                  <tr>
                    <th className="border border-stone-300 p-1.5">العدد المطلوب</th>
                    <th className="border border-stone-300 p-1.5">الزيادة المجانية ({selectedReceipt.bonusPercent || 2}%)</th>
                    <th className="border border-stone-300 p-1.5">نفوق النقل والوصول</th>
                    <th className="border border-stone-300 p-1.5 bg-amber-50 font-black text-amber-900">الصافي المسلم حياً</th>
                    <th className="border border-stone-300 p-1.5">سعر الكتكوت</th>
                    <th className="border border-stone-300 p-1.5">إجمالي المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold">
                    <td className="border border-stone-300 p-2">{selectedReceipt.orderedCount.toLocaleString()}</td>
                    <td className="border border-stone-300 p-2 text-emerald-700">+{selectedReceipt.bonusCount || Math.round((selectedReceipt.orderedCount * (selectedReceipt.bonusPercent || 2)) / 100)}</td>
                    <td className="border border-stone-300 p-2 text-rose-700">{selectedReceipt.transportMortalityCount}</td>
                    <td className="border border-stone-300 p-2 bg-amber-50 font-black text-base text-amber-800">{selectedReceipt.receivedHealthyCount.toLocaleString()}</td>
                    <td className="border border-stone-300 p-2">{selectedReceipt.unitPrice} {currency}</td>
                    <td className="border border-stone-300 p-2 font-black">{selectedReceipt.totalAmount.toLocaleString()} {currency}</td>
                  </tr>
                </tbody>
              </table>

              {/* Quality & Veterinary Checklist */}
              <div className="border border-stone-200 rounded-lg p-2.5 bg-stone-50 space-y-1.5 text-[10px]">
                <div className="font-bold text-stone-800 flex items-center justify-between">
                  <span>المواصفات البيطرية وفحص الجودة عند الاستلام:</span>
                  <span className="font-bold text-emerald-800">
                    مؤشر الجودة: {selectedReceipt.qualityScore === 'excellent' ? 'ممتاز' : 'جيد'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-stone-700">
                  <div>حرارة الصناديق: <strong>{selectedReceipt.boxTemperatureCelsius || 31.5}°م</strong></div>
                  <div>متوسط وزن الكتكوت: <strong>{selectedReceipt.averageWeightGrams || 42} غرام</strong></div>
                  <div>نسبة التجانس: <strong>{selectedReceipt.uniformityPercent || 88}%</strong></div>
                </div>
                {selectedReceipt.hatcheryVaccines && selectedReceipt.hatcheryVaccines.length > 0 && (
                  <div className="pt-1 text-stone-600">
                    <span className="font-bold text-stone-700">التحصينات المنفذة بالمفرخة: </span>
                    <span>{selectedReceipt.hatcheryVaccines.join(' • ')}</span>
                  </div>
                )}
                {selectedReceipt.notes && (
                  <div className="pt-1 text-stone-600 italic">
                    ملاحظات: {selectedReceipt.notes}
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="flex justify-between items-center bg-stone-100 p-2 rounded text-[11px]">
                <div>
                  طريقة الأداء: <strong className="text-stone-800">{selectedReceipt.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : selectedReceipt.paymentMethod === 'check' ? 'شيك بنكي' : selectedReceipt.paymentMethod === 'cash' ? 'نقداً (كاش)' : 'دفع جزئي / مؤجل'}</strong>
                </div>
                <div className="space-x-3 rtl:space-x-reverse font-bold">
                  <span>المدفوع: {selectedReceipt.paidAmount.toLocaleString()} {currency}</span>
                  {selectedReceipt.remainingAmount > 0 && (
                    <span className="text-rose-700">المتبقي: {selectedReceipt.remainingAmount.toLocaleString()} {currency}</span>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-[10px] text-stone-700">
                <div className="text-center border-t border-stone-400 pt-1">
                  توقيع وختم المفرخة / السائق الناقل
                </div>
                <div className="text-center border-t border-stone-400 pt-1">
                  توقيع وخاتم مدير المزرعة المستلم
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-3xl w-full p-5 sm:p-6 text-stone-100 space-y-4 shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  {editingChick ? 'تعديل بيانات شحنة الكتاكيت' : 'تسجيل واستلام شحنة كتاكيت جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Row 1: Invoice & Date & Hatchery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    رقم الفاتورة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono font-bold focus:border-amber-500"
                    placeholder="FAC-CHK-2026-005"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    رقم اللوط / الشحنة (Lot)
                  </label>
                  <input
                    type="text"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono focus:border-amber-500"
                    placeholder="LOT-ATL-905"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    تاريخ الاستلام <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Supplier, Farm, Hangar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    المفرخة / المورد <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                  >
                    <option value="">اختر المفرخة...</option>
                    {hatcheries.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    المزرعة / المخزن المستلم <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formFarmId}
                    onChange={(e) => setFormFarmId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                  >
                    <option value="">اختر المزرعة أو المخزن...</option>
                    <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>📍 {f.name} ({f.location})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    العنبر المستلم
                  </label>
                  <input
                    type="text"
                    value={formHangarName}
                    onChange={(e) => setFormHangarName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                    placeholder="عنبر 1 + 2"
                  />
                </div>
              </div>

              {/* Row 3: Breed, Type, Cycle Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    السلالة (Souche) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                  >
                    <option value="Cobb 500">Cobb 500 (كوب 500)</option>
                    <option value="Ross 308">Ross 308 (روس 308)</option>
                    <option value="Hubbard Classic">Hubbard Classic (هابرد)</option>
                    <option value="Sasso">Sasso (ساسو كروازي)</option>
                    <option value="ISA Brown">ISA Brown (بياض)</option>
                    <option value="بلدي محسن">بلدي محسن</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    الدورة المستفيدة (اختياري)
                  </label>
                  <select
                    value={formCycleId}
                    onChange={(e) => setFormCycleId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                  >
                    <option value="">(اختياري) استلام بالمخزن / بدون دورة...</option>
                    {cycles.map(c => (
                      <option key={c.id} value={c.id}>{c.cycleNumber} ({c.chickBreed})</option>
                    ))}
                  </select>
                </div>

                {!formCycleId && !editingChick && (
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-amber-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={formAutoCreateCycle}
                        onChange={(e) => setFormAutoCreateCycle(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-stone-950 border-stone-800"
                      />
                      <span>إنشاء دورة تربية جديدة تلقائياً بهذه الدفعة</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Section: Quantity & Calculation */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 space-y-3">
                <div className="font-bold text-amber-400 text-xs flex items-center justify-between">
                  <span>الأعداد والحسابات (الطلب، الزيادة المجانية، نفوق النقل):</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    الصافي المستلم حياً: {calculatedHealthyReceived.toLocaleString()} كتكوت
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      العدد المطلوب بالفاتورة <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formOrderedCount}
                      onChange={(e) => setFormOrderedCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 font-bold focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      نسبة الزيادة المجانية %
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      value={formBonusPercent}
                      onChange={(e) => setFormBonusPercent(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-emerald-400 font-bold focus:border-amber-500"
                      placeholder="2%"
                    />
                    <div className="text-[10px] text-emerald-500 mt-0.5">+{calculatedBonus} كتكوت مجاني</div>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      نفوق النقل والوصول
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formTransportMortality}
                      onChange={(e) => setFormTransportMortality(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-rose-400 font-bold focus:border-amber-500"
                    />
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {numOrdered > 0 ? ((numMortality / (numOrdered + calculatedBonus)) * 100).toFixed(2) : 0}% معدل
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      سعر الكتكوت الواحد (DH) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      min={0.1}
                      required
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-amber-300 font-bold focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Costs & Payments */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 space-y-3">
                <div className="font-bold text-stone-200 text-xs flex items-center justify-between">
                  <span>التكاليف والمبالغ والأداء:</span>
                  <span className="text-amber-400 font-mono text-sm font-black">
                    الإجمالي: {calculatedTotalAmount.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      تكلفة النقل للشاحنة (DH)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formTransportCost}
                      onChange={(e) => setFormTransportCost(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      تكلفة اللقاحات بالمفرخة (DH)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formVaccineCost}
                      onChange={(e) => setFormVaccineCost(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      المبلغ المدفوع فوراً (DH)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formPaidAmount}
                      onChange={(e) => setFormPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-emerald-400 font-bold focus:border-amber-500"
                    />
                    <div className="text-[10px] text-rose-400 mt-0.5 font-bold">
                      المتبقي مؤجل: {calculatedRemaining.toLocaleString()} {currency}
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      طريقة الدفع
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e: any) => setFormPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                    >
                      <option value="bank_transfer">تحويل بنكي (Virement)</option>
                      <option value="check">شيك بنكي (Chèque)</option>
                      <option value="cash">نقداً (Espèces)</option>
                      <option value="partial">دفع جزئي / آجل (Crédit)</option>
                    </select>
                  </div>
                </div>

                {numPaid > 0 && (
                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      الخزينة أو الحساب البنكي المسدد منه
                    </label>
                    <select
                      value={formAccountId}
                      onChange={(e) => setFormAccountId(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName || 'صندوق كاش'}) - الرصيد: {acc.currentBalance.toLocaleString()} {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Section: Transport & Veterinary Quality Checklist */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 space-y-3">
                <div className="font-bold text-stone-200 text-xs flex items-center justify-between">
                  <span>بيانات النقل، الشاحنة، وفحص الجودة البيطري:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400">تقييم الجودة:</span>
                    <select
                      value={formQualityScore}
                      onChange={(e: any) => setFormQualityScore(e.target.value)}
                      className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-xs text-amber-400 font-bold"
                    >
                      <option value="excellent">ممتاز (Excellent)</option>
                      <option value="good">جيد (Bon)</option>
                      <option value="acceptable">مقبول (Acceptable)</option>
                      <option value="poor">ضعيف (Faible)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      رقم لوحة الشاحنة
                    </label>
                    <input
                      type="text"
                      value={formTruckPlate}
                      onChange={(e) => setFormTruckPlate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-mono focus:border-amber-500"
                      placeholder="45-A-12345"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      اسم السائق
                    </label>
                    <input
                      type="text"
                      value={formDriverName}
                      onChange={(e) => setFormDriverName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                      placeholder="سعيد التازي"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      متوسط الوزن (غرام)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={formAvgWeight}
                      onChange={(e) => setFormAvgWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                      placeholder="42 g"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-medium mb-1">
                      حرارة الصناديق (°م)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={formBoxTemp}
                      onChange={(e) => setFormBoxTemp(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:border-amber-500"
                      placeholder="31.5 °C"
                    />
                  </div>
                </div>

                {/* Vaccines Checklist */}
                <div>
                  <label className="block text-stone-400 font-medium mb-1.5">
                    التحصينات واللقاحات المنجزة بالمفرخة (Hatchery Vaccines):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)', 'جمبورو (IBD)', 'كوكيديا (Coccidiose)'].map((vac) => {
                      const isSelected = formVaccines.includes(vac);
                      return (
                        <button
                          key={vac}
                          type="button"
                          onClick={() => toggleVaccine(vac)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {vac}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-medium mb-1">
                    ملاحظات وحالة الشحنة
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500 text-xs"
                    placeholder="ملاحظات حول حيوية الكتاكيت، التدفئة، جودة الصناديق..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold rounded-xl text-xs shadow flex items-center gap-1.5 transition active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingChick ? 'حفظ التعديلات' : 'تأكيد وحفظ شحنة الكتاكيت'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chick Sale Add/Edit Modal */}
      <ChickSaleModal
        isOpen={isAddSaleModalOpen}
        onClose={() => setIsAddSaleModalOpen(false)}
        editingSale={editingSale}
        onSave={(saleData) => {
          if (editingSale) {
            updateChickSale(editingSale.id, saleData);
          } else {
            addChickSale(saleData);
          }
          setIsAddSaleModalOpen(false);
        }}
      />

      {/* Chick Sale Receipt Voucher Modal */}
      <ChickSaleReceiptModal
        sale={selectedSaleReceipt}
        onClose={() => setSelectedSaleReceipt(null)}
      />
    </div>
  );
};
