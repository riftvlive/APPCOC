import React, { useState, useMemo } from 'react';
import {
  Users2,
  Plus,
  Phone,
  Building,
  FileSpreadsheet,
  DollarSign,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Edit2,
  Trash2,
  MessageSquare,
  Printer,
  Calendar,
  AlertCircle,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Layers,
  MapPin,
  TrendingUp,
  TrendingDown,
  Scale,
  Send,
  Eye
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Partner, PartnerType, PaymentMethod } from '../../types';

interface PartnersViewProps {
  onOpenQuickAction: (action?: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ onOpenQuickAction }) => {
  const {
    partners,
    sales,
    chickSales,
    feedSales,
    chickPurchases,
    feedPurchases,
    medicationPurchases,
    expenses,
    transactions,
    partnerBalances,
    addPartner,
    updatePartner,
    deletePartner,
    addSettlementTransaction,
    accounts,
    currency,
    language
  } = useFarm();

  // Filters and View State
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'customer' | 'supplier' | 'debtors' | 'creditors'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'receivables' | 'payables' | 'recent'>('receivables');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<Partner | null>(null);
  const [isAddPartnerModal, setIsAddPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteConfirmPartner, setDeleteConfirmPartner] = useState<Partner | null>(null);

  // Settlement modal state
  const [settlementPartner, setSettlementPartner] = useState<Partner | null>(null);
  const [settleAmount, setSettleAmount] = useState<number | ''>('');
  const [settleAccountId, setSettleAccountId] = useState(accounts[0]?.id || '');
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('cash');
  const [settleCheckNumber, setSettleCheckNumber] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  // Statement date filters
  const [statementStartDate, setStatementStartDate] = useState('');
  const [statementEndDate, setStatementEndDate] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    type: PartnerType;
    phone: string;
    company: string;
    category: string;
    address: string;
    openingBalance: number | '';
    notes: string;
  }>({
    name: '',
    type: 'customer',
    phone: '',
    company: '',
    category: 'wholesale_buyer',
    address: '',
    openingBalance: 0,
    notes: ''
  });

  // Category presets
  const partnerCategories = [
    { id: 'all', label: 'كافة التصنيفات' },
    { id: 'wholesale_buyer', label: 'مشتري دجاج (شناق / تاجر)' },
    { id: 'chick_buyer', label: 'مشتري كتاكيت' },
    { id: 'feed_buyer', label: 'مشتري أعلاف' },
    { id: 'hatchery', label: 'مفرخ كتاكيت' },
    { id: 'feed_mill', label: 'شركة / مطحنة أعلاف' },
    { id: 'vet_pharma', label: 'صيدلية بيطرية وأدوية' },
    { id: 'equipment_supplies', label: 'تجهيزات ونشارة وغاز' },
    { id: 'general', label: 'عام / خدمات أخرى' }
  ];

  // Open Edit Modal
  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      type: partner.type,
      phone: partner.phone,
      company: partner.company || '',
      category: partner.category || 'general',
      address: partner.address || '',
      openingBalance: partner.openingBalance,
      notes: partner.notes || ''
    });
  };

  // Submit Add
  const handleSaveAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    addPartner({
      name: formData.name.trim(),
      type: formData.type,
      phone: formData.phone.trim(),
      company: formData.company.trim() || undefined,
      category: formData.category,
      address: formData.address.trim() || undefined,
      openingBalance: Number(formData.openingBalance || 0),
      notes: formData.notes.trim() || undefined
    });

    setIsAddPartnerModal(false);
    resetForm();
  };

  // Submit Edit
  const handleSaveEditPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner || !formData.name.trim() || !formData.phone.trim()) return;

    updatePartner(editingPartner.id, {
      name: formData.name.trim(),
      type: formData.type,
      phone: formData.phone.trim(),
      company: formData.company.trim() || undefined,
      category: formData.category,
      address: formData.address.trim() || undefined,
      openingBalance: Number(formData.openingBalance || 0),
      notes: formData.notes.trim() || undefined
    });

    // If currently viewing statement for this partner, update local state too
    if (selectedPartnerDetail?.id === editingPartner.id) {
      setSelectedPartnerDetail({
        ...selectedPartnerDetail,
        name: formData.name.trim(),
        type: formData.type,
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        category: formData.category,
        address: formData.address.trim() || undefined,
        openingBalance: Number(formData.openingBalance || 0),
        notes: formData.notes.trim() || undefined
      });
    }

    setEditingPartner(null);
    resetForm();
  };

  // Submit Delete
  const handleDeletePartner = () => {
    if (!deleteConfirmPartner) return;
    deletePartner(deleteConfirmPartner.id);
    setDeleteConfirmPartner(null);
    if (selectedPartnerDetail?.id === deleteConfirmPartner.id) {
      setSelectedPartnerDetail(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'customer',
      phone: '',
      company: '',
      category: 'wholesale_buyer',
      address: '',
      openingBalance: 0,
      notes: ''
    });
  };

  // Submit Settlement
  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementPartner || !settleAmount || Number(settleAmount) <= 0) return;

    const isCustomer = settlementPartner.type === 'customer' || settlementPartner.type === 'both';
    const amountNum = Number(settleAmount);

    let desc = settleNotes.trim();
    if (!desc) {
      desc = isCustomer
        ? `تحصيل دفعة مالية من الزبون ${settlementPartner.name}`
        : `سداد دفعة للمورد ${settlementPartner.name}`;
      if (settleCheckNumber) {
        desc += ` (شيك/حوالة: ${settleCheckNumber})`;
      }
    }

    addSettlementTransaction({
      partnerId: settlementPartner.id,
      amount: amountNum,
      type: isCustomer ? 'customer_payment' : 'supplier_payment',
      accountId: settleAccountId,
      description: desc,
      paymentMethod: settleMethod
    });

    setSettlementPartner(null);
    setSettleAmount('');
    setSettleCheckNumber('');
    setSettleNotes('');
  };

  // Quick WhatsApp link generator
  const getWhatsAppLink = (phone: string, partnerName: string, remainingDue: number, remainingDebt: number) => {
    // Format Moroccan phone number to international format
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '212' + cleanPhone.substring(1);
    }
    let message = `السلام عليكم سيدي ${partnerName}،\nتحية طيبة من إدارة المزرعة.\n`;
    if (remainingDue > 0) {
      message += `نود تذكيركم بأن رصيدكم المستحق بذمتكم الحالي هو: ${remainingDue.toLocaleString()} ${currency}.\nشاكرين لكم حسن تعاونكم.`;
    } else if (remainingDebt > 0) {
      message += `بخصوص مستحقاتكم لدينا بقيمة: ${remainingDebt.toLocaleString()} ${currency}، يرجى تزويدنا بتفاصيل التسوية.\nشكراً جزيلاً.`;
    } else {
      message += `نحيطكم علماً بأن حسابكم لدينا متوازن (0 ${currency}). شكراً لتعاملكم الراقي.`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Filter and Sort Partners
  const filteredAndSortedPartners = useMemo(() => {
    return partners
      .filter(p => {
        // Tab Filter
        if (activeTabFilter === 'customer') {
          return p.type === 'customer' || p.type === 'both';
        }
        if (activeTabFilter === 'supplier') {
          return p.type === 'supplier' || p.type === 'both';
        }
        if (activeTabFilter === 'debtors') {
          const due = partnerBalances.customerReceivables[p.id]?.remainingDue || 0;
          return due > 0;
        }
        if (activeTabFilter === 'creditors') {
          const debt = partnerBalances.supplierPayables[p.id]?.remainingDebt || 0;
          return debt > 0;
        }
        return true;
      })
      .filter(p => {
        // Category Filter
        if (selectedCategoryFilter !== 'all') {
          return p.category === selectedCategoryFilter;
        }
        return true;
      })
      .filter(p => {
        // Search Query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.company && p.company.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'receivables') {
          const dueA = partnerBalances.customerReceivables[a.id]?.remainingDue || 0;
          const dueB = partnerBalances.customerReceivables[b.id]?.remainingDue || 0;
          return dueB - dueA;
        }
        if (sortBy === 'payables') {
          const debtA = partnerBalances.supplierPayables[a.id]?.remainingDebt || 0;
          const debtB = partnerBalances.supplierPayables[b.id]?.remainingDebt || 0;
          return debtB - debtA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'ar');
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [partners, activeTabFilter, selectedCategoryFilter, searchQuery, sortBy, partnerBalances]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCount = partners.length;
    const customerCount = partners.filter(p => p.type === 'customer' || p.type === 'both').length;
    const supplierCount = partners.filter(p => p.type === 'supplier' || p.type === 'both').length;

    const totalReceivables = partnerBalances.totalReceivables;
    const totalPayables = partnerBalances.totalPayables;
    const netBalance = totalReceivables - totalPayables; // If > 0, we are owed more than we owe

    const debtorCustomersCount = Object.values(partnerBalances.customerReceivables || {}).filter((c: any) => c?.remainingDue > 0).length;
    const creditorSuppliersCount = Object.values(partnerBalances.supplierPayables || {}).filter((s: any) => s?.remainingDebt > 0).length;

    return {
      totalCount,
      customerCount,
      supplierCount,
      totalReceivables,
      totalPayables,
      netBalance,
      debtorCustomersCount,
      creditorSuppliersCount
    };
  }, [partners, partnerBalances]);

  // Statement of Account (كشف حساب الشريك)
  const partnerStatement = useMemo(() => {
    if (!selectedPartnerDetail) return [];
    const pId = selectedPartnerDetail.id;
    const history: Array<{
      date: string;
      description: string;
      debit: number; // مدين (لنا)
      credit: number; // دائن (علينا)
      paid: number;
      remaining: number;
      balanceDelta: number;
      balance?: number;
      type: string;
    }> = [];

    // Opening Balance
    if (selectedPartnerDetail.openingBalance !== 0) {
      const op = selectedPartnerDetail.openingBalance;
      history.push({
        date: selectedPartnerDetail.createdAt ? selectedPartnerDetail.createdAt.split('T')[0] : '2025-01-01',
        description: 'رصيد افتتاحي سابق',
        debit: op > 0 ? op : 0,
        credit: op < 0 ? Math.abs(op) : 0,
        paid: 0,
        remaining: Math.abs(op),
        balanceDelta: op,
        type: 'opening'
      });
    }

    // 1. Wholesale Chicken Sales (for customers)
    sales.filter(s => s.customerId === pId).forEach(s => {
      history.push({
        date: s.date,
        description: `فاتورة بيع دجاج #${s.invoiceNumber} (${s.chickenCount.toLocaleString()} طائر، ${s.totalWeightKg.toLocaleString()} كغ @ ${s.pricePerKg} DH)`,
        debit: s.netTotal,
        credit: s.paidAmount,
        paid: s.paidAmount,
        remaining: s.remainingAmount,
        balanceDelta: s.netTotal - s.paidAmount,
        type: 'sale'
      });
    });

    // 2. Chick Sales to Customers (for customers)
    chickSales.filter(c => c.customerId === pId).forEach(c => {
      history.push({
        date: c.date,
        description: `فاتورة بيع كتاكيت #${c.invoiceNumber} (${c.quantity.toLocaleString()} كتكوت @ ${c.unitPrice} DH)`,
        debit: c.totalAmount,
        credit: c.paidAmount,
        paid: c.paidAmount,
        remaining: c.remainingAmount,
        balanceDelta: c.remainingAmount,
        type: 'chick_sale'
      });
    });

    // 3. Feed Sales to Customers (for customers)
    feedSales.filter(f => f.customerId === pId).forEach(f => {
      history.push({
        date: f.date,
        description: `فاتورة بيع أعلاف #${f.invoiceNumber} (${f.brand} - ${f.quantityKg.toLocaleString()} كغ)`,
        debit: f.totalAmount,
        credit: f.paidAmount,
        paid: f.paidAmount,
        remaining: f.remainingAmount,
        balanceDelta: f.remainingAmount,
        type: 'feed_sale'
      });
    });

    // 4. Chick Purchases from Hatcheries (for suppliers)
    chickPurchases.filter(c => c.supplierId === pId).forEach(c => {
      history.push({
        date: c.date,
        description: `فاتورة شراء كتاكيت #${c.invoiceNumber} — ${c.receivedHealthyCount.toLocaleString()} كتكوت (${c.breed}) • قيمة: ${(c.chickCost || 0).toLocaleString()} • نقل: ${(c.transportCost || 0).toLocaleString()} • إجمالي: ${c.totalAmount.toLocaleString()} DH`,
        debit: c.paidAmount,
        credit: c.totalAmount,
        paid: c.paidAmount,
        remaining: c.remainingAmount,
        balanceDelta: c.remainingAmount,
        type: 'chick_purchase'
      });
    });

    // 5. Feed Purchases from Mills (for suppliers)
    feedPurchases.filter(f => f.supplierId === pId).forEach(f => {
      history.push({
        date: f.date,
        description: `فاتورة شراء علف #${f.invoiceNumber || 'F'} (${f.brand} - ${f.quantityKg.toLocaleString()} كغ)`,
        debit: f.paidAmount,
        credit: f.totalAmount,
        paid: f.paidAmount,
        remaining: f.remainingAmount,
        balanceDelta: f.remainingAmount,
        type: 'feed_purchase'
      });
    });

    // 6. Medication & Vaccine Purchases (for suppliers)
    medicationPurchases.filter(m => m.supplierId === pId).forEach(m => {
      history.push({
        date: m.date,
        description: `شراء أدوية ولقاحات: ${m.medicationName} (${m.quantity} ${m.unit})`,
        debit: m.paidAmount,
        credit: m.totalAmount,
        paid: m.paidAmount,
        remaining: m.remainingAmount,
        balanceDelta: m.remainingAmount,
        type: 'med_purchase'
      });
    });

    // 7. Direct Expenses linked to Supplier (for suppliers)
    expenses.filter(e => e.supplierId === pId).forEach(e => {
      history.push({
        date: e.date,
        description: `مصروف مسجل: ${e.description} (${e.category})`,
        debit: e.paidAmount,
        credit: e.amount,
        paid: e.paidAmount,
        remaining: e.remainingAmount,
        balanceDelta: e.remainingAmount,
        type: 'expense'
      });
    });

    // 8. Financial Payments & Collections (Transactions)
    transactions.filter(t => t.partnerId === pId).forEach(t => {
      if (t.type === 'customer_payment') {
        history.push({
          date: t.date,
          description: `سند قبض نقدي / تحصيل دفعة (${t.description || 'تسوية حساب'})`,
          debit: 0,
          credit: t.amount,
          paid: t.amount,
          remaining: 0,
          balanceDelta: -t.amount,
          type: 'settle_in'
        });
      } else if (t.type === 'supplier_payment') {
        history.push({
          date: t.date,
          description: `سند صرف للمورد / سداد دفعة (${t.description || 'سداد مستحقات'})`,
          debit: t.amount,
          credit: 0,
          paid: t.amount,
          remaining: 0,
          balanceDelta: -t.amount,
          type: 'settle_out'
        });
      }
    });

    // Filter by date range if provided
    let filtered = history;
    if (statementStartDate) {
      filtered = filtered.filter(item => item.date >= statementStartDate);
    }
    if (statementEndDate) {
      filtered = filtered.filter(item => item.date <= statementEndDate);
    }

    // Chronological sort to calculate running balance
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    filtered.forEach(entry => {
      runningBalance += entry.balanceDelta;
      entry.balance = runningBalance;
    });

    return filtered.reverse();
  }, [
    selectedPartnerDetail,
    statementStartDate,
    statementEndDate,
    sales,
    chickSales,
    feedSales,
    chickPurchases,
    feedPurchases,
    medicationPurchases,
    expenses,
    transactions
  ]);

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-stone-100">
              {language === 'ar' ? 'إدارة الموردين والزبناء (دليل الشركاء)' : 'Clients & Fournisseurs'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'متابعة الذمم والديون، كشوفات الحساب الرسمية، تسجيل التحصيلات والسدادات، وتوثيق سجلات المفارخ ومطاحن الأعلاف والتجار'
              : 'Gestion des tiers, créances, dettes fournisseurs, règlements et relevés de compte détaillés'}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddPartnerModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === 'ar' ? '+ إضافة شريك جديد' : '+ Nouveau Partenaire'}</span>
        </button>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Partners */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>إجمالي الشركاء المسجلين</span>
            <Users2 className="w-4 h-4 text-stone-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-100">{stats.totalCount}</span>
            <span className="text-[11px] text-stone-400">طرف معتمد</span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-stone-400 flex justify-between">
            <span>{stats.customerCount} زبون</span>
            <span>•</span>
            <span>{stats.supplierCount} مورد</span>
          </div>
        </div>

        {/* Total Receivables (Money owed to us by customers) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="text-emerald-400 font-bold">لنا عند الزبناء (مستحقات)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {stats.totalReceivables.toLocaleString()}
            </span>
            <span className="text-xs text-stone-400 font-bold">{currency}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-emerald-400/80 font-medium">
            بذمة {stats.debtorCustomersCount} مشتري / زبون
          </div>
        </div>

        {/* Total Payables (Money we owe to suppliers) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="text-rose-400 font-bold">علينا للموردين (ديون)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-rose-400">
              {stats.totalPayables.toLocaleString()}
            </span>
            <span className="text-xs text-stone-400 font-bold">{currency}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-rose-400/80 font-medium">
            مستحقة لـ {stats.creditorSuppliersCount} شركة / مورد
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-bold text-amber-300">صافي الموقف المالي للذمم</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-black ${stats.netBalance >= 0 ? 'text-teal-400' : 'text-amber-400'}`}>
              {Math.abs(stats.netBalance).toLocaleString()}
            </span>
            <span className="text-xs text-stone-400 font-bold">{currency}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] font-semibold">
            {stats.netBalance >= 0 ? (
              <span className="text-teal-400">فائض مستحق لنا (حقوق أعلى من الديون)</span>
            ) : (
              <span className="text-amber-400">صافي التزام مطلوب سداده</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTabFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-800/90 text-stone-300 hover:bg-stone-800'
              }`}
            >
              الكل ({partners.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('customer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTabFilter === 'customer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-800/90 text-stone-300 hover:bg-stone-800'
              }`}
            >
              الزبناء فقط ({partners.filter(p => p.type === 'customer' || p.type === 'both').length})
            </button>
            <button
              onClick={() => setActiveTabFilter('supplier')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTabFilter === 'supplier'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-800/90 text-stone-300 hover:bg-stone-800'
              }`}
            >
              الموردين فقط ({partners.filter(p => p.type === 'supplier' || p.type === 'both').length})
            </button>
            <button
              onClick={() => setActiveTabFilter('debtors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTabFilter === 'debtors'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-stone-800/90 text-stone-400 hover:text-stone-200'
              }`}
            >
              عليهم مستحقات لنا ({stats.debtorCustomersCount})
            </button>
            <button
              onClick={() => setActiveTabFilter('creditors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTabFilter === 'creditors'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-stone-800/90 text-stone-400 hover:text-stone-200'
              }`}
            >
              لهم ديون علينا ({stats.creditorSuppliersCount})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              بطاقات
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              جدول
            </button>
          </div>
        </div>

        {/* Second Row: Category & Search & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-stone-800/70">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث بالاسم، الشركة، رقم الهاتف، أو المدينة..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-750 rounded-xl pr-9 pl-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-stone-950 border border-stone-750 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              {partnerCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-750 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="receivables">الأعلى مستحقات (لنا عندهم)</option>
              <option value="payables">الأعلى ديوناً (علينا لهم)</option>
              <option value="name">أبجدياً (اسم الشريك)</option>
              <option value="recent">الأحدث تسجيلاً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners List / Grid */}
      {filteredAndSortedPartners.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <Users2 className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="text-base font-bold text-stone-200">لا يوجد شركاء يطابقون خيارات البحث</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            تأكد من شروط التصفية والبحث، أو اضغط زر "+ إضافة شريك جديد" لإنشاء ملف زبون أو مورد جديد.
          </p>
          <button
            onClick={() => {
              setActiveTabFilter('all');
              setSelectedCategoryFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition"
          >
            إعادة تعيين المرشحات
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPartners.map(partner => {
            const isCustomer = partner.type === 'customer' || partner.type === 'both';
            const isSupplier = partner.type === 'supplier' || partner.type === 'both';

            const custBalance = partnerBalances.customerReceivables[partner.id];
            const suppBalance = partnerBalances.supplierPayables[partner.id];

            const remainingDue = custBalance?.remainingDue || 0;
            const remainingDebt = suppBalance?.remainingDebt || 0;

            const categoryObj = partnerCategories.find(c => c.id === partner.category);

            return (
              <div
                key={partner.id}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition shadow-md group"
              >
                <div>
                  {/* Top Bar with Name & Type Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        partner.type === 'customer'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : partner.type === 'supplier'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-stone-100 group-hover:text-amber-300 transition">
                          {partner.name}
                        </h3>
                        {partner.company && (
                          <span className="text-[11px] text-amber-400/90 block font-semibold">
                            {partner.company}
                          </span>
                        )}
                        {categoryObj && (
                          <span className="text-[10px] text-stone-400 bg-stone-800/80 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {categoryObj.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        partner.type === 'customer'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : partner.type === 'supplier'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {partner.type === 'customer' ? 'زبون' : partner.type === 'supplier' ? 'مورد' : 'زبون ومورد'}
                    </span>
                  </div>

                  {/* Phone, WhatsApp, Address */}
                  <div className="space-y-1 my-3 text-xs text-stone-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <a href={`tel:${partner.phone}`} className="hover:text-amber-300 font-mono text-stone-300">
                          {partner.phone}
                        </a>
                      </div>
                      <a
                        href={getWhatsAppLink(partner.phone, partner.name, remainingDue, remainingDebt)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                        title="إرسال رسالة واتساب برصيد الحساب"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>واتساب</span>
                      </a>
                    </div>

                    {partner.address && (
                      <div className="flex items-center gap-1 text-[11px] text-stone-400">
                        <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                        <span className="truncate">{partner.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Balances Status Box */}
                  <div className="space-y-2 mb-3 bg-stone-950/70 p-3 rounded-xl border border-stone-850 text-xs">
                    {isCustomer && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400 font-medium">مستحق لنا بذمته:</span>
                        <span className={`font-black ${remainingDue > 0 ? 'text-emerald-400' : 'text-stone-400'}`}>
                          {remainingDue.toLocaleString()} {currency}
                        </span>
                      </div>
                    )}

                    {isSupplier && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400 font-medium">مطلوب منا للمورد:</span>
                        <span className={`font-black ${remainingDebt > 0 ? 'text-rose-400' : 'text-stone-400'}`}>
                          {remainingDebt.toLocaleString()} {currency}
                        </span>
                      </div>
                    )}

                    {remainingDue === 0 && remainingDebt === 0 && (
                      <div className="text-center text-[11px] text-teal-400 font-semibold flex items-center justify-center gap-1 py-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>الحساب مصفى ومسوى بالكامل</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-stone-800">
                  <button
                    onClick={() => setSelectedPartnerDetail(partner)}
                    className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <span>كشف الحساب</span>
                  </button>

                  <button
                    onClick={() => {
                      setSettlementPartner(partner);
                      setSettleAmount(remainingDue > 0 ? remainingDue : remainingDebt > 0 ? remainingDebt : '');
                    }}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>تسوية / دفع</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(partner)}
                    className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition"
                    title="تعديل بيانات الشريك"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmPartner(partner)}
                    className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
                    title="حذف الشريك"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-950 border-b border-stone-800 text-stone-400 font-bold">
                  <th className="p-3">اسم الشريك والشركة</th>
                  <th className="p-3">الصفة والتصنيف</th>
                  <th className="p-3">الهاتف والاتصال</th>
                  <th className="p-3 text-emerald-400">لنا عنده (مستحق)</th>
                  <th className="p-3 text-rose-400">علينا له (دين)</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredAndSortedPartners.map(partner => {
                  const custBalance = partnerBalances.customerReceivables[partner.id];
                  const suppBalance = partnerBalances.supplierPayables[partner.id];
                  const remainingDue = custBalance?.remainingDue || 0;
                  const remainingDebt = suppBalance?.remainingDebt || 0;

                  return (
                    <tr key={partner.id} className="hover:bg-stone-850/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-stone-100">{partner.name}</div>
                        {partner.company && <div className="text-[11px] text-amber-400">{partner.company}</div>}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          partner.type === 'customer'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : partner.type === 'supplier'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {partner.type === 'customer' ? 'زبون' : partner.type === 'supplier' ? 'مورد' : 'زبون ومورد'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-stone-300">
                        <div className="flex items-center gap-2">
                          <a href={`tel:${partner.phone}`} className="hover:text-amber-300">
                            {partner.phone}
                          </a>
                          <a
                            href={getWhatsAppLink(partner.phone, partner.name, remainingDue, remainingDebt)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300"
                            title="مراسلة واتساب"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {remainingDue > 0 ? `${remainingDue.toLocaleString()} ${currency}` : '-'}
                      </td>
                      <td className="p-3 font-bold text-rose-400">
                        {remainingDebt > 0 ? `${remainingDebt.toLocaleString()} ${currency}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPartnerDetail(partner)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <FileSpreadsheet className="w-3 h-3 text-amber-400" />
                            <span>كشف</span>
                          </button>
                          <button
                            onClick={() => {
                              setSettlementPartner(partner);
                              setSettleAmount(remainingDue > 0 ? remainingDue : remainingDebt > 0 ? remainingDebt : '');
                            }}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition"
                          >
                            تسوية
                          </button>
                          <button
                            onClick={() => handleOpenEdit(partner)}
                            className="p-1 text-stone-400 hover:text-amber-300 rounded"
                            title="تعديل"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmPartner(partner)}
                            className="p-1 text-stone-400 hover:text-rose-400 rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statement of Account Modal (كشف حساب شريك شامل) */}
      {selectedPartnerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm"
            onClick={() => setSelectedPartnerDetail(null)}
          />
          <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-stone-850 border-b border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-100">
                    كشف حساب الشريك: {selectedPartnerDetail.name}
                  </h3>
                  <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedPartnerDetail.phone}</span>
                    {selectedPartnerDetail.company && <span>• {selectedPartnerDetail.company}</span>}
                    {selectedPartnerDetail.address && <span>• {selectedPartnerDetail.address}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-stone-750 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="طباعة كشف الحساب"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>
                <button
                  onClick={() => setSelectedPartnerDetail(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Filter Date Range Bar */}
            <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span className="text-stone-300 font-bold">فترة الكشف:</span>
                <input
                  type="date"
                  value={statementStartDate}
                  onChange={e => setStatementStartDate(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-200 text-xs"
                />
                <span className="text-stone-500">إلى</span>
                <input
                  type="date"
                  value={statementEndDate}
                  onChange={e => setStatementEndDate(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-200 text-xs"
                />
                {(statementStartDate || statementEndDate) && (
                  <button
                    onClick={() => {
                      setStatementStartDate('');
                      setStatementEndDate('');
                    }}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-bold"
                  >
                    إلغاء التحديد
                  </button>
                )}
              </div>

              {/* Action: Send statement to customer via WhatsApp */}
              <a
                href={getWhatsAppLink(
                  selectedPartnerDetail.phone,
                  selectedPartnerDetail.name,
                  partnerBalances.customerReceivables[selectedPartnerDetail.id]?.remainingDue || 0,
                  partnerBalances.supplierPayables[selectedPartnerDetail.id]?.remainingDebt || 0
                )}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>إرسال ملخص الرصيد واتساب</span>
              </a>
            </div>

            {/* Statement Table Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px] font-bold">
                    <th className="pb-2.5">التاريخ</th>
                    <th className="pb-2.5">البيان ونوع العملية</th>
                    <th className="pb-2.5 text-emerald-400">مدين (لنا)</th>
                    <th className="pb-2.5 text-rose-400">دائن (علينا)</th>
                    <th className="pb-2.5 text-teal-300">المدفوع</th>
                    <th className="pb-2.5 text-amber-300">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {partnerStatement.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        لا توجد حركات مسجلة لهذا الشريك خلال الفترة المحددة.
                      </td>
                    </tr>
                  ) : (
                    partnerStatement.map((st, i) => (
                      <tr key={i} className="hover:bg-stone-850/40 transition">
                        <td className="py-3 text-stone-400 font-mono font-semibold whitespace-nowrap">
                          {st.date}
                        </td>
                        <td className="py-3 text-stone-200 font-medium max-w-xs sm:max-w-md">
                          {st.description}
                        </td>
                        <td className="py-3 text-emerald-400 font-bold whitespace-nowrap">
                          {st.debit > 0 ? `${st.debit.toLocaleString()} ${currency}` : '-'}
                        </td>
                        <td className="py-3 text-rose-400 font-bold whitespace-nowrap">
                          {st.credit > 0 ? `${st.credit.toLocaleString()} ${currency}` : '-'}
                        </td>
                        <td className="py-3 text-teal-300 font-bold whitespace-nowrap">
                          {st.paid > 0 ? `${st.paid.toLocaleString()} ${currency}` : '-'}
                        </td>
                        <td className="py-3 font-black whitespace-nowrap">
                          <span
                            className={
                              (st.balance || 0) > 0
                                ? 'text-emerald-400'
                                : (st.balance || 0) < 0
                                ? 'text-rose-400'
                                : 'text-stone-400'
                            }
                          >
                            {Math.abs(st.balance || 0).toLocaleString()} {currency}
                            {(st.balance || 0) > 0 ? ' (لنا)' : (st.balance || 0) < 0 ? ' (علينا)' : ''}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Statement Summary Footer */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-stone-400 block text-[11px]">مستحق بذمته حالياً:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    {(partnerBalances.customerReceivables[selectedPartnerDetail.id]?.remainingDue || 0).toLocaleString()} {currency}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">مطلوب له حالياً:</span>
                  <span className="text-rose-400 font-black text-sm">
                    {(partnerBalances.supplierPayables[selectedPartnerDetail.id]?.remainingDebt || 0).toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const p = selectedPartnerDetail;
                    setSelectedPartnerDetail(null);
                    setSettlementPartner(p);
                    const due = partnerBalances.customerReceivables[p.id]?.remainingDue || 0;
                    const debt = partnerBalances.supplierPayables[p.id]?.remainingDebt || 0;
                    setSettleAmount(due > 0 ? due : debt > 0 ? debt : '');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl text-xs transition"
                >
                  تسجيل تسوية مالية لهذا الشريك
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Settlement Modal (تسوية مالية / سند قبض أو صرف) */}
      {settlementPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setSettlementPartner(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-100">
                  {settlementPartner.type === 'customer'
                    ? 'سند قبض / تحصيل من الزبون'
                    : settlementPartner.type === 'supplier'
                    ? 'سند صرف / سداد دفعة للمورد'
                    : 'تسوية مالية للشريك'}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">{settlementPartner.name}</p>
              </div>
              <button onClick={() => setSettlementPartner(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">المبلغ المراد سداده / قبضه ({currency}) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-base font-black text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">الحساب المالي *</label>
                  <select
                    value={settleAccountId}
                    onChange={e => setSettleAccountId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.balance.toLocaleString()} {currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">طريقة الأداء *</label>
                  <select
                    value={settleMethod}
                    onChange={e => setSettleMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  >
                    <option value="cash">نقداً (Espèces)</option>
                    <option value="bank_transfer">تحويل بنكي (Virement)</option>
                    <option value="check">شيك بنكي (Chèque)</option>
                    <option value="promissory_note">كمبيالة (Effet)</option>
                  </select>
                </div>
              </div>

              {(settleMethod === 'check' || settleMethod === 'promissory_note' || settleMethod === 'bank_transfer') && (
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم الشيك أو الحوالة</label>
                  <input
                    type="text"
                    placeholder="مثال: CHQ-982341 أو رقم التحويل..."
                    value={settleCheckNumber}
                    onChange={e => setSettleCheckNumber(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-stone-300 font-bold mb-1">بيان / ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="ملاحظات توثيقية إضافية..."
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                تأكيد التسوية وتحديث الرصيد الفوري
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddPartnerModal(false)} />
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-stone-100">إضافة شريك جديد (زبون / مورد)</h3>
              </div>
              <button onClick={() => setIsAddPartnerModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddPartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">الاسم الكامل للشريك *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف الإدريسي أو الحاج أحمد..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">نوع الشريك *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 font-semibold"
                  >
                    <option value="customer">زبون (مشتري دواجن أو أعلاف)</option>
                    <option value="supplier">مورد (مفرخ / شركة أعلاف / أدوية)</option>
                    <option value="both">زبون ومورد معاً</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">التصنيف الوظيفي</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 font-semibold"
                  >
                    {partnerCategories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="06xxxxxxxx أو 07xxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">اسم الشركة أو المؤسسة</label>
                  <input
                    type="text"
                    placeholder="مثال: شركة أعلاف الأطلس SARL"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المدينة أو العنوان</label>
                  <input
                    type="text"
                    placeholder="الدار البيضاء، فاس، تيفلت..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">
                    الرصيد الافتتاحي ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00 (+ لنا / - علينا)"
                    value={formData.openingBalance}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        openingBalance: e.target.value === '' ? '' : Number(e.target.value)
                      })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  placeholder="أي معلومات خاصة بالشريك أو شروط الدفع والخصومات..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                حفظ الشريك الجديد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setEditingPartner(null)} />
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-stone-100">تعديل بيانات الشريك: {editingPartner.name}</h3>
              </div>
              <button onClick={() => setEditingPartner(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">الاسم الكامل للشريك *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">نوع الشريك</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 font-semibold"
                  >
                    <option value="customer">زبون (مشتري دواجن أو أعلاف)</option>
                    <option value="supplier">مورد (مفرخ / شركة أعلاف / أدوية)</option>
                    <option value="both">زبون ومورد معاً</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 font-semibold"
                  >
                    {partnerCategories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">اسم الشركة أو المؤسسة</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المدينة أو العنوان</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">
                    الرصيد الافتتاحي ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.openingBalance}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        openingBalance: e.target.value === '' ? '' : Number(e.target.value)
                      })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2 text-stone-100 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setDeleteConfirmPartner(null)} />
          <div className="relative w-full max-w-sm bg-stone-900 border border-rose-500/40 rounded-2xl shadow-2xl p-5 space-y-3 z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-stone-100">تأكيد حذف الشريك</h3>
            <p className="text-xs text-stone-400">
              هل أنت متأكد من رغبتك في حذف الشريك <b className="text-stone-200">{deleteConfirmPartner.name}</b>؟
              لن يُسمح بالحذف في حال وجود فواتير أو معاملات مرتبطة به لضمان سلامة المحاسبة.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPartner(null)}
                className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeletePartner}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
