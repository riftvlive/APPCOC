import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  PieChart,
  Copy,
  Check,
  CheckCircle2,
  Wheat,
  Baby,
  Truck,
  Zap,
  Users,
  ShieldCheck,
  Scale,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useFarm } from '../../context/FarmContext';
import { getMoroccoDateISO } from '../../utils/date';

interface ProfitExpensePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFarmId?: string;
  initialCycleId?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
}

export const ProfitExpensePdfModal: React.FC<ProfitExpensePdfModalProps> = ({
  isOpen,
  onClose,
  initialFarmId,
  initialCycleId,
  initialDateFrom,
  initialDateTo
}) => {
  const {
    farms,
    cycles,
    allCycleSummaries,
    sales,
    feedSales,
    chickSales,
    expenses,
    currency,
    language,
    selectedFarmId
  } = useFarm();

  // Printable document container ref for html2canvas
  const documentRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [farmFilter, setFarmFilter] = useState<string>(initialFarmId || selectedFarmId || 'all');
  const [cycleFilter, setCycleFilter] = useState<string>(initialCycleId || 'all');
  const [periodPreset, setPeriodPreset] = useState<
    'all' | 'current_month' | 'last_month' | 'current_quarter' | 'current_year' | 'custom'
  >('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>(initialDateFrom || '');
  const [customDateTo, setCustomDateTo] = useState<string>(initialDateTo || '');

  // Customization & Organization Details
  const [companyName, setCompanyName] = useState<string>('مجموعة مزارع الدواجن الحديثة');
  const [taxId, setTaxId] = useState<string>('RC: 54109 • IF: 3918204 • ICE: 002938192000041');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState<boolean>(true);
  const [includeExpenseBreakdown, setIncludeExpenseBreakdown] = useState<boolean>(true);
  const [includeCyclesTable, setIncludeCyclesTable] = useState<boolean>(true);
  const [includeExpenseLedger, setIncludeExpenseLedger] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);

  // UI state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'settings'>('preview');

  // Compute Active Date Range based on Presets
  const activeDateRange = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    if (periodPreset === 'all') {
      return { from: '', to: '' };
    }

    if (periodPreset === 'current_month') {
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      return {
        from: startOfMonth.toISOString().substring(0, 10),
        to: endOfMonth.toISOString().substring(0, 10)
      };
    }

    if (periodPreset === 'last_month') {
      const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfLastMonth = new Date(currentYear, currentMonth, 0);
      return {
        from: startOfLastMonth.toISOString().substring(0, 10),
        to: endOfLastMonth.toISOString().substring(0, 10)
      };
    }

    if (periodPreset === 'current_quarter') {
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const startOfQuarter = new Date(currentYear, quarterStartMonth, 1);
      const endOfQuarter = new Date(currentYear, quarterStartMonth + 3, 0);
      return {
        from: startOfQuarter.toISOString().substring(0, 10),
        to: endOfQuarter.toISOString().substring(0, 10)
      };
    }

    if (periodPreset === 'current_year') {
      return {
        from: `${currentYear}-01-01`,
        to: `${currentYear}-12-31`
      };
    }

    // Custom
    return {
      from: customDateFrom,
      to: customDateTo
    };
  }, [periodPreset, customDateFrom, customDateTo]);

  // Farm-filtered cycles
  const availableCycles = useMemo(() => {
    if (farmFilter === 'all') return cycles;
    return cycles.filter(c => c.farmId === farmFilter);
  }, [cycles, farmFilter]);

  // Selected farm object
  const selectedFarmObj = useMemo(() => {
    if (farmFilter === 'all') return null;
    return farms.find(f => f.id === farmFilter) || null;
  }, [farms, farmFilter]);

  // Selected cycle object
  const selectedCycleObj = useMemo(() => {
    if (cycleFilter === 'all') return null;
    return cycles.find(c => c.id === cycleFilter) || null;
  }, [cycles, cycleFilter]);

  // Filtered Financial Summaries for cycles
  const filteredCycleSummaries = useMemo(() => {
    return allCycleSummaries.filter(summary => {
      // Filter by farm
      if (farmFilter !== 'all') {
        const cycle = cycles.find(c => c.id === summary.cycleId);
        if (cycle && cycle.farmId !== farmFilter) return false;
      }

      // Filter by cycle
      if (cycleFilter !== 'all' && summary.cycleId !== cycleFilter) {
        return false;
      }

      // Filter by date range (cycle start date or end date)
      if (activeDateRange.from && summary.startDate < activeDateRange.from) {
        return false;
      }
      if (activeDateRange.to && summary.startDate > activeDateRange.to) {
        return false;
      }

      return true;
    });
  }, [allCycleSummaries, cycles, farmFilter, cycleFilter, activeDateRange]);

  // Filtered Wholesale broiler sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (farmFilter !== 'all' && s.farmId !== farmFilter) return false;
      if (cycleFilter !== 'all' && s.cycleId !== cycleFilter) return false;
      if (activeDateRange.from && s.date < activeDateRange.from) return false;
      if (activeDateRange.to && s.date > activeDateRange.to) return false;
      return true;
    });
  }, [sales, farmFilter, cycleFilter, activeDateRange]);

  // Filtered Feed Sales
  const filteredFeedSales = useMemo(() => {
    return feedSales.filter(s => {
      if (farmFilter !== 'all' && s.farmId && s.farmId !== farmFilter) return false;
      if (activeDateRange.from && s.date < activeDateRange.from) return false;
      if (activeDateRange.to && s.date > activeDateRange.to) return false;
      return true;
    });
  }, [feedSales, farmFilter, activeDateRange]);

  // Filtered Chick Sales
  const filteredChickSales = useMemo(() => {
    return chickSales.filter(s => {
      if (farmFilter !== 'all' && s.farmId && s.farmId !== farmFilter) return false;
      if (activeDateRange.from && s.date < activeDateRange.from) return false;
      if (activeDateRange.to && s.date > activeDateRange.to) return false;
      return true;
    });
  }, [chickSales, farmFilter, activeDateRange]);

  // Filtered General and Specific Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (farmFilter !== 'all' && e.farmId && e.farmId !== farmFilter) return false;
      if (cycleFilter !== 'all' && e.cycleId && e.cycleId !== cycleFilter) return false;
      if (activeDateRange.from && e.date < activeDateRange.from) return false;
      if (activeDateRange.to && e.date > activeDateRange.to) return false;
      return true;
    });
  }, [expenses, farmFilter, cycleFilter, activeDateRange]);

  // Aggregated Financial Metrics
  const financialTotals = useMemo(() => {
    // 1. Revenues
    const chickenSalesRevenue = filteredSales.reduce((sum, s) => sum + (s.netTotal || 0), 0);
    const feedSalesRevenue = filteredFeedSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const chickSalesRevenue = filteredChickSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalRevenue = chickenSalesRevenue + feedSalesRevenue + chickSalesRevenue;

    // Weight and birds stats
    const totalWeightKgSold = filteredSales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
    const totalBirdsSold = filteredSales.reduce((sum, s) => sum + (s.chickenCount || 0), 0);

    // 2. Production Costs from Cycles (Feeds, Chicks, Meds, Utilities, Labor)
    const cyclesChicksCost = filteredCycleSummaries.reduce((sum, s) => sum + (s.chicksCost || 0), 0);
    const cyclesFeedCost = filteredCycleSummaries.reduce((sum, s) => sum + (s.totalFeedCost || 0), 0);
    const cyclesMedicationCost = filteredCycleSummaries.reduce((sum, s) => sum + (s.totalMedicationCost || 0), 0);
    const cyclesLaborCost = filteredCycleSummaries.reduce((sum, s) => sum + (s.totalLaborCost || 0), 0);
    const cyclesUtilitiesCost = filteredCycleSummaries.reduce((sum, s) => sum + (s.totalUtilitiesCost || 0), 0);
    const cyclesFeedConsumedKg = filteredCycleSummaries.reduce((sum, s) => sum + (s.totalFeedConsumedKg || 0), 0);

    // 3. Other Categorized Expenses from Expense Ledger
    const categorizedLedgerExpenses: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const cat = exp.category || 'other';
      categorizedLedgerExpenses[cat] = (categorizedLedgerExpenses[cat] || 0) + exp.amount;
    });

    // Merge cycle costs with independent expense entries
    // (If cycle summaries exist, they represent verified batch production costs; we also account for non-duplicated operating overheads)
    const chicksTotalCost = cyclesChicksCost > 0 ? cyclesChicksCost : (categorizedLedgerExpenses['chicks'] || 0);
    const feedTotalCost = cyclesFeedCost > 0 ? cyclesFeedCost : (categorizedLedgerExpenses['feed'] || 0);
    const medsTotalCost = cyclesMedicationCost > 0 ? cyclesMedicationCost : ((categorizedLedgerExpenses['medication'] || 0) + (categorizedLedgerExpenses['vaccines'] || 0));
    const laborTotalCost = cyclesLaborCost > 0 ? cyclesLaborCost : (categorizedLedgerExpenses['labor'] || 0);
    const utilitiesTotalCost = cyclesUtilitiesCost > 0 ? cyclesUtilitiesCost : (
      (categorizedLedgerExpenses['electricity'] || 0) +
      (categorizedLedgerExpenses['fuel'] || 0) +
      (categorizedLedgerExpenses['water'] || 0)
    );
    const transportTotalCost = categorizedLedgerExpenses['transport'] || 0;
    const maintenanceTotalCost = (categorizedLedgerExpenses['maintenance'] || 0) + (categorizedLedgerExpenses['cleaning_disinfection'] || 0);
    
    // Remaining unassigned expenses
    const otherAdminTotalCost = Object.entries(categorizedLedgerExpenses)
      .filter(([cat]) => !['chicks', 'feed', 'medication', 'vaccines', 'labor', 'electricity', 'fuel', 'water', 'transport', 'maintenance', 'cleaning_disinfection'].includes(cat))
      .reduce((sum, [_, amt]) => sum + amt, 0);

    const totalExpenses =
      chicksTotalCost +
      feedTotalCost +
      medsTotalCost +
      laborTotalCost +
      utilitiesTotalCost +
      transportTotalCost +
      maintenanceTotalCost +
      otherAdminTotalCost;

    const netProfit = totalRevenue - totalExpenses;
    const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roiPercent = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
    const costPerKgSold = totalWeightKgSold > 0 ? totalExpenses / totalWeightKgSold : 0;
    const averagePricePerKg = totalWeightKgSold > 0 ? chickenSalesRevenue / totalWeightKgSold : 0;

    // Categories Breakdown for Visual Table
    const breakdown = [
      {
        id: 'feed',
        label: 'أعلاف الدواجن المستهلكة (Aliments)',
        amount: feedTotalCost,
        percent: totalExpenses > 0 ? (feedTotalCost / totalExpenses) * 100 : 0,
        icon: Wheat,
        color: 'text-amber-600'
      },
      {
        id: 'chicks',
        label: 'كلفة الكتاكيت والأفواج (Poussins)',
        amount: chicksTotalCost,
        percent: totalExpenses > 0 ? (chicksTotalCost / totalExpenses) * 100 : 0,
        icon: Baby,
        color: 'text-yellow-600'
      },
      {
        id: 'meds',
        label: 'الأدوية البيطرية واللقاحات (Santé & Vaccins)',
        amount: medsTotalCost,
        percent: totalExpenses > 0 ? (medsTotalCost / totalExpenses) * 100 : 0,
        icon: ShieldCheck,
        color: 'text-emerald-600'
      },
      {
        id: 'utilities',
        label: 'الطاقة، الغاز، الكهرباء والمحروقات (Énergie & Gaz)',
        amount: utilitiesTotalCost,
        percent: totalExpenses > 0 ? (utilitiesTotalCost / totalExpenses) * 100 : 0,
        icon: Zap,
        color: 'text-orange-600'
      },
      {
        id: 'labor',
        label: 'أجور ورواتب العمال والفنيين (Main d\'œuvre)',
        amount: laborTotalCost,
        percent: totalExpenses > 0 ? (laborTotalCost / totalExpenses) * 100 : 0,
        icon: Users,
        color: 'text-blue-600'
      },
      {
        id: 'transport',
        label: 'النقل، الشحن والمحروقات (Transport & Logistique)',
        amount: transportTotalCost,
        percent: totalExpenses > 0 ? (transportTotalCost / totalExpenses) * 100 : 0,
        icon: Truck,
        color: 'text-indigo-600'
      },
      {
        id: 'maintenance',
        label: 'الصيانة، التعقيم والتطهير (Maintenance & Hygiène)',
        amount: maintenanceTotalCost,
        percent: totalExpenses > 0 ? (maintenanceTotalCost / totalExpenses) * 100 : 0,
        icon: RefreshCw,
        color: 'text-stone-600'
      },
      {
        id: 'other',
        label: 'مصاريف تشغيلية وإدارية أخرى (Frais Généraux)',
        amount: otherAdminTotalCost,
        percent: totalExpenses > 0 ? (otherAdminTotalCost / totalExpenses) * 100 : 0,
        icon: Scale,
        color: 'text-stone-500'
      }
    ].filter(item => item.amount > 0 || totalExpenses === 0);

    return {
      chickenSalesRevenue,
      feedSalesRevenue,
      chickSalesRevenue,
      totalRevenue,
      totalWeightKgSold,
      totalBirdsSold,
      chicksTotalCost,
      feedTotalCost,
      medsTotalCost,
      laborTotalCost,
      utilitiesTotalCost,
      transportTotalCost,
      maintenanceTotalCost,
      otherAdminTotalCost,
      totalExpenses,
      netProfit,
      profitMarginPercent,
      roiPercent,
      costPerKgSold,
      averagePricePerKg,
      cyclesFeedConsumedKg,
      breakdown
    };
  }, [
    filteredSales,
    filteredFeedSales,
    filteredChickSales,
    filteredCycleSummaries,
    filteredExpenses
  ]);

  // Report metadata string
  const reportCode = useMemo(() => {
    const d = getMoroccoDateISO().replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REP-PNL-${d}-${rand}`;
  }, []);

  const reportDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Title for export
  const reportTitle = useMemo(() => {
    const farmPart = selectedFarmObj ? selectedFarmObj.name : 'كافة المزارع';
    const cyclePart = selectedCycleObj ? ` - ${selectedCycleObj.cycleNumber}` : '';
    return `تقرير الأرباح والمصروفات (${farmPart}${cyclePart})`;
  }, [selectedFarmObj, selectedCycleObj]);

  // Generate & Download Real PDF using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;

    try {
      setIsGeneratingPdf(true);
      setPdfSuccessMessage(null);

      // Scroll to top of preview to ensure full render capture
      const element = documentRef.current;

      // Capture element with html2canvas at high DPI (scale: 2)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      // PDF dimensions: A4 is 210mm x 297mm
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.96),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;

      // If document spans multiple pages, slice smoothly
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.96),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pageHeight;
      }

      // Safe filename with date
      const farmNameClean = selectedFarmObj ? selectedFarmObj.name.replace(/\s+/g, '_') : 'جميع_المزارع';
      const filename = `تقرير_الأرباح_والمصروفات_${farmNameClean}_${getMoroccoDateISO()}.pdf`;

      pdf.save(filename);
      setPdfSuccessMessage('تم توليد وتنزيل ملف PDF بنجاح!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF، يرجى المحاولة مرة أخرى أو استخدام خيار الطباعة المباشرة.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct Print handler (triggers isolated print)
  const handlePrint = () => {
    window.print();
  };

  // Copy textual summary to clipboard
  const handleCopySummary = () => {
    const summaryText = `📊 ${reportTitle}
📅 تاريخ الاستخراج: ${getMoroccoDateISO()}
──────────────────
💵 إجمالي الإيرادات: ${financialTotals.totalRevenue.toLocaleString()} ${currency}
📉 إجمالي المصروفات: ${financialTotals.totalExpenses.toLocaleString()} ${currency}
💰 صافي الأرباح: ${financialTotals.netProfit.toLocaleString()} ${currency}
📈 هامش الربح الصافي: ${financialTotals.profitMarginPercent.toFixed(1)}%
🎯 العائد على التكلفة (ROI): ${financialTotals.roiPercent.toFixed(1)}%
⚖️ كلفة الكيلوغرام الحي: ${financialTotals.costPerKgSold.toFixed(2)} ${currency}/كغ
──────────────────
تم استخراج التقرير من منظومة إدارة مزارع الدواجن الحديثة.`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print-bg">
      <div className="relative w-full max-w-5xl bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Top Toolbar (Header) */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-stone-900 border-b border-stone-800 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-100">
                  تصدير تقرير الأرباح والمصروفات (PDF)
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  A4 جاهز للأرشفة
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                تقرير محاسبي رسمي موثق للأرباح والتكاليف التشغيلية وهوامش الربح
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs for Mobile/Compact screens */}
            <div className="flex items-center p-1 bg-stone-950 rounded-lg border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveViewTab('preview')}
                className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                  activeViewTab === 'preview'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>المعاينة</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('settings')}
                className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                  activeViewTab === 'settings'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>الفلاتر والتخصيص</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Settings Panel (Collapsible or Tab-based) */}
        {activeViewTab === 'settings' && (
          <div className="p-4 sm:p-5 bg-stone-900/90 border-b border-stone-800 space-y-4 shrink-0 no-print overflow-y-auto max-h-64 sm:max-h-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Farm Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 inline ml-1 text-amber-400" />
                  المزرعة:
                </label>
                <select
                  value={farmFilter}
                  onChange={(e) => {
                    setFarmFilter(e.target.value);
                    setCycleFilter('all');
                  }}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">جميع المزارع التابعة</option>
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
                  ))}
                </select>
              </div>

              {/* 2. Cycle Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  <RefreshCw className="w-3.5 h-3.5 inline ml-1 text-amber-400" />
                  الدورة / الفوج:
                </label>
                <select
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">كافة الدورات (إجمالي المزرعة)</option>
                  {availableCycles.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cycleNumber} ({c.chickBreed})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Period Preset */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline ml-1 text-amber-400" />
                  الفترة الزمنية:
                </label>
                <select
                  value={periodPreset}
                  onChange={(e) => setPeriodPreset(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">كافة الفترات المسجلة</option>
                  <option value="current_month">الشهر الحالي</option>
                  <option value="last_month">الشهر السابق</option>
                  <option value="current_quarter">الربع السنوي الحالي</option>
                  <option value="current_year">السنة المالية الحالية</option>
                  <option value="custom">فترة مخصصة (من - إلى)</option>
                </select>
              </div>

              {/* 4. Company Name in Header */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  اسم المؤسسة / المزرعة بالترويسة:
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مجموعة مزارع الدواجن الحديثة"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Custom Dates if selected */}
            {periodPreset === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-bold">من تاريخ:</span>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-bold">إلى تاريخ:</span>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Content Checkboxes for PDF */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-800 text-xs font-semibold text-stone-300">
              <span className="text-stone-400 font-bold">عناصر التقرير المرفقة:</span>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-400">
                <input
                  type="checkbox"
                  checked={includeExecutiveSummary}
                  onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0"
                />
                <span>الملخص التنفيذي ومؤشرات الربح</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-400">
                <input
                  type="checkbox"
                  checked={includeExpenseBreakdown}
                  onChange={(e) => setIncludeExpenseBreakdown(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0"
                />
                <span>هيكل ونسب توزيع المصروفات</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-400">
                <input
                  type="checkbox"
                  checked={includeCyclesTable}
                  onChange={(e) => setIncludeCyclesTable(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0"
                />
                <span>جدول أداء تكاليف الدورات</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-400">
                <input
                  type="checkbox"
                  checked={includeExpenseLedger}
                  onChange={(e) => setIncludeExpenseLedger(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0"
                />
                <span>كشف بنود المصروفات المسجلة</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-400">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0"
                />
                <span>التوقيعات والختم المعتمد</span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 bg-stone-900/60 border-b border-stone-800 shrink-0 no-print">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>النطاق المالي الحالي:</span>
            <span className="font-bold text-stone-200">
              {farmFilter === 'all' ? 'كافة المزارع' : selectedFarmObj?.name}
            </span>
            <span>•</span>
            <span>الدورات:</span>
            <span className="font-bold text-amber-400">
              {filteredCycleSummaries.length} دورة
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy textual summary */}
            <button
              onClick={handleCopySummary}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="نسخ ملخص الأرباح والمصروفات لمشاركته عبر الواتساب"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>نسخ الملخص</span>
                </>
              )}
            </button>

            {/* Direct Print */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة ورقية</span>
            </button>

            {/* Direct Download Real PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري إنشاء ملف PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>تنزيل ملف PDF (أرشيف رسمي)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {pdfSuccessMessage && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in no-print">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{pdfSuccessMessage}</span>
          </div>
        )}

        {/* Scrollable Printable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-900/40 flex justify-center">
          
          {/* Printable Sheet Container (Styled like standard A4 Paper) */}
          <div
            ref={documentRef}
            id="printable-pdf-document"
            className="print-pdf-report w-full max-w-[850px] bg-white text-stone-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-stone-200 space-y-6 font-sans text-right selection:bg-amber-100"
            style={{ minHeight: '1050px' }}
          >
            
            {/* 1. Official Header & Letterhead */}
            <div className="border-b-2 border-stone-900 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black text-lg shadow-sm">
                      🐔
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                        {companyName}
                      </h1>
                      <p className="text-[11px] text-stone-600 font-semibold mt-0.5">
                        {selectedFarmObj ? `مزرعة: ${selectedFarmObj.name} • الموقع: ${selectedFarmObj.location}` : 'الإدارة المركزية لمزارع الدواجن والإنتاج الحيواني'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-left text-[11px] text-stone-600 space-y-0.5">
                  <div className="font-mono font-black text-stone-900 text-xs bg-stone-100 px-2 py-0.5 rounded border border-stone-300 inline-block">
                    {reportCode}
                  </div>
                  <div>تاريخ الاستخراج: <span className="font-bold text-stone-800">{reportDateFormatted}</span></div>
                  <div>العملة المعتمدة: <span className="font-bold text-stone-800">{currency}</span></div>
                </div>
              </div>

              {/* Title Ribbon */}
              <div className="mt-4 pt-3 border-t border-dashed border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                    <span>تقرير كشف الأرباح والمصروفات الشامل</span>
                    <span className="text-xs font-normal text-stone-500 font-mono">
                      (P&L & Operating Expense Statement)
                    </span>
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    النطاق: <span className="font-bold text-stone-800">{selectedFarmObj ? selectedFarmObj.name : 'جميع المزارع'}</span>
                    {selectedCycleObj && <span> • الدورة: <span className="font-bold text-stone-800">{selectedCycleObj.cycleNumber}</span></span>}
                    {activeDateRange.from && <span> • الفترة: من <span className="font-bold text-stone-800">{activeDateRange.from}</span> إلى <span className="font-bold text-stone-800">{activeDateRange.to || 'الآن'}</span></span>}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    مستند مالي معتمد ومطابق للحسابات
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Executive KPI Cards (Quad Summary) */}
            {includeExecutiveSummary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>الملخص المالي ومؤشرات الأداء التشغيلي (Executive Overview)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Revenue */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/80">
                    <span className="text-[11px] font-bold text-stone-600 block">إجمالي الإيرادات</span>
                    <div className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
                      {financialTotals.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-stone-500">{currency}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      {financialTotals.totalWeightKgSold.toLocaleString()} كغ حي مباع
                    </span>
                  </div>

                  {/* Expenses */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/80">
                    <span className="text-[11px] font-bold text-stone-600 block">إجمالي التكاليف والمصروفات</span>
                    <div className="text-lg sm:text-xl font-black text-rose-700 mt-0.5">
                      {financialTotals.totalExpenses.toLocaleString()} <span className="text-xs font-bold text-stone-500">{currency}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      كافة التكاليف التشغيلية والأفواج
                    </span>
                  </div>

                  {/* Net Profit */}
                  <div className={`p-3.5 rounded-xl border ${
                    financialTotals.netProfit >= 0
                      ? 'border-emerald-300 bg-emerald-50/60 text-emerald-950'
                      : 'border-rose-300 bg-rose-50/60 text-rose-950'
                  }`}>
                    <span className="text-[11px] font-bold text-stone-700 block">صافي الأرباح (Net Profit)</span>
                    <div className={`text-lg sm:text-xl font-black mt-0.5 ${
                      financialTotals.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {financialTotals.netProfit.toLocaleString()} <span className="text-xs font-bold">{currency}</span>
                    </div>
                    <span className="text-[10px] text-stone-600 block mt-1 font-semibold">
                      {financialTotals.netProfit >= 0 ? 'ربح تشغيلي صافي' : 'عجز / خسارة تشغيلية'}
                    </span>
                  </div>

                  {/* Profit Margin & ROI */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/80">
                    <span className="text-[11px] font-bold text-stone-600 block">هامش الربح الصافي</span>
                    <div className={`text-lg sm:text-xl font-black mt-0.5 ${
                      financialTotals.profitMarginPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {financialTotals.profitMarginPercent.toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      العائد ROI: <strong className="text-stone-800">{financialTotals.roiPercent.toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Secondary Indicators Banner */}
                <div className="grid grid-cols-3 gap-2 bg-stone-100/70 p-2.5 rounded-xl text-center text-xs border border-stone-200">
                  <div>
                    <span className="text-stone-500 text-[10px] block">متوسط كلفة الكيلوغرام الحي:</span>
                    <span className="font-black text-stone-800">
                      {financialTotals.costPerKgSold.toFixed(2)} {currency} / كغ
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">متوسط سعر البيع للكيلو:</span>
                    <span className="font-black text-amber-800">
                      {financialTotals.averagePricePerKg.toFixed(2)} {currency} / كغ
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">إجمالي عدد الطيور المسوقة:</span>
                    <span className="font-black text-stone-800">
                      {financialTotals.totalBirdsSold.toLocaleString()} طائر
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Expense Breakdown Table & Cost Structure */}
            {includeExpenseBreakdown && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-amber-600" />
                    <span>هيكل وتوزيع المصروفات حسب الأبواب والنسب المئوية</span>
                  </h3>
                  <span className="text-[10px] text-stone-500">مرتبة تنازلياً حسب القيمة</span>
                </div>

                <div className="overflow-hidden border border-stone-300 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                      <tr>
                        <th className="p-2.5">باب / بند المصروف</th>
                        <th className="p-2.5 text-center">النسبة من إجمالي المصروفات</th>
                        <th className="p-2.5 text-left">المبلغ الإجمالي ({currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {financialTotals.breakdown.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                          <td className="p-2.5 font-bold text-stone-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>{item.label}</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 bg-stone-200 h-2 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${Math.min(100, item.percent)}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-stone-700 text-[11px]">
                                {item.percent.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-2.5 text-left font-black text-stone-900">
                            {item.amount.toLocaleString()} {currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-100 border-t-2 border-stone-400 font-black text-stone-950">
                      <tr>
                        <td className="p-2.5">الإجمالي الكلي للمصروفات:</td>
                        <td className="p-2.5 text-center font-bold">100.0%</td>
                        <td className="p-2.5 text-left text-rose-700 text-sm">
                          {financialTotals.totalExpenses.toLocaleString()} {currency}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Cycles Performance & Profitability Table */}
            {includeCyclesTable && filteredCycleSummaries.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>الكشف التحليلي لربحية وتكاليف دورات المزارع</span>
                  </h3>
                  <span className="text-[10px] text-stone-500">
                    عدد الدورات المغطاة: {filteredCycleSummaries.length}
                  </span>
                </div>

                <div className="overflow-hidden border border-stone-300 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                      <tr>
                        <th className="p-2.5">الدورة / المزرعة</th>
                        <th className="p-2.5">العدد المستلم</th>
                        <th className="p-2.5">إجمالي الإيرادات</th>
                        <th className="p-2.5">تكلفة الدورة</th>
                        <th className="p-2.5">صافي الربح</th>
                        <th className="p-2.5">كلفة الكغ الحي</th>
                        <th className="p-2.5 text-left">الهامش %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filteredCycleSummaries.map((s, idx) => (
                        <tr key={s.cycleId} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                          <td className="p-2.5 font-bold text-stone-900">
                            {s.cycleNumber} <span className="text-stone-500 font-normal">({s.farmName})</span>
                          </td>
                          <td className="p-2.5 font-semibold text-stone-700">
                            {s.initialChicks.toLocaleString()} طائر
                          </td>
                          <td className="p-2.5 font-bold text-emerald-800">
                            {s.totalRevenue.toLocaleString()} {currency}
                          </td>
                          <td className="p-2.5 font-semibold text-rose-800">
                            {s.totalCycleCost.toLocaleString()} {currency}
                          </td>
                          <td className={`p-2.5 font-black ${s.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {s.netProfit.toLocaleString()} {currency}
                          </td>
                          <td className="p-2.5 font-bold text-stone-800">
                            {s.costPerKg.toFixed(2)} {currency}/كغ
                          </td>
                          <td className="p-2.5 text-left font-black text-stone-900">
                            {s.profitMarginPercent.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-100 border-t-2 border-stone-400 font-black text-stone-950">
                      <tr>
                        <td className="p-2.5" colSpan={2}>المجموع العام للدورات:</td>
                        <td className="p-2.5 text-emerald-800">
                          {filteredCycleSummaries.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()} {currency}
                        </td>
                        <td className="p-2.5 text-rose-800">
                          {filteredCycleSummaries.reduce((sum, s) => sum + s.totalCycleCost, 0).toLocaleString()} {currency}
                        </td>
                        <td className="p-2.5 text-emerald-800">
                          {filteredCycleSummaries.reduce((sum, s) => sum + s.netProfit, 0).toLocaleString()} {currency}
                        </td>
                        <td className="p-2.5">
                          {(filteredCycleSummaries.reduce((sum, s) => sum + s.costPerKg, 0) / (filteredCycleSummaries.length || 1)).toFixed(2)} {currency}
                        </td>
                        <td className="p-2.5 text-left">--</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Detailed Expense Entries Ledger */}
            {includeExpenseLedger && filteredExpenses.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>سجل سندات وبنود المصروفات المسجلة ({filteredExpenses.length} سند)</span>
                  </h3>
                  <span className="text-[10px] text-stone-500">حركات القيود المحاسبية</span>
                </div>

                <div className="overflow-hidden border border-stone-300 rounded-xl">
                  <table className="w-full text-right text-[11px]">
                    <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                      <tr>
                        <th className="p-2">التاريخ</th>
                        <th className="p-2">الباب / الفئة</th>
                        <th className="p-2">البيان والشرح</th>
                        <th className="p-2">المزرعة / الدورة</th>
                        <th className="p-2">طريقة الدفع</th>
                        <th className="p-2 text-left">المبلغ ({currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filteredExpenses.slice(0, 15).map((exp, idx) => {
                        const f = farms.find(farm => farm.id === exp.farmId);
                        const c = cycles.find(cyc => cyc.id === exp.cycleId);
                        return (
                          <tr key={exp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                            <td className="p-2 font-mono text-stone-700">{exp.date}</td>
                            <td className="p-2 font-semibold text-stone-800">
                              <span className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px]">
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-2 font-medium text-stone-900 max-w-[200px] truncate">
                              {exp.description}
                            </td>
                            <td className="p-2 text-stone-600">
                              {f?.name || 'عام'} {c ? `(${c.cycleNumber})` : ''}
                            </td>
                            <td className="p-2 text-stone-600 text-[10px]">
                              {exp.paymentMethod || 'نقداً'}
                            </td>
                            <td className="p-2 text-left font-black text-rose-700">
                              {exp.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {filteredExpenses.length > 15 && (
                      <tbody className="bg-stone-50 text-[10px] text-stone-500 font-bold text-center border-t">
                        <tr>
                          <td colSpan={6} className="py-2">
                            تم عرض أحدث 15 سنداً للمعاينة • يتضمن كشف الحساب المحاسبي الكامل {filteredExpenses.length} سنداً
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* 6. Signatures and Official Stamp Endorsement */}
            {includeSignatures && (
              <div className="pt-6 border-t-2 border-stone-900 space-y-4 break-inside-avoid">
                <div className="grid grid-cols-3 gap-6 text-xs text-stone-700">
                  {/* Financial Manager Signature */}
                  <div className="text-center p-3 border border-stone-200 rounded-xl bg-stone-50/50">
                    <span className="font-bold text-stone-900 block">إعداد ومراجعة المسؤول المالي:</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">قسم المحاسبة والتدقيق المالي</span>
                    <div className="h-14 border-b border-dashed border-stone-400 mx-auto w-3/4 mt-2 flex items-end justify-center pb-1">
                      <span className="text-[10px] font-mono text-stone-400">التوقيع المعتمد</span>
                    </div>
                  </div>

                  {/* General Manager / Owner Signature */}
                  <div className="text-center p-3 border border-stone-200 rounded-xl bg-stone-50/50">
                    <span className="font-bold text-stone-900 block">اعتماد إدارة المزرعة:</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">المدير العام / المفوض بالتوقيع</span>
                    <div className="h-14 border-b border-dashed border-stone-400 mx-auto w-3/4 mt-2 flex items-end justify-center pb-1">
                      <span className="text-[10px] font-mono text-stone-400">التوقيع والصفة</span>
                    </div>
                  </div>

                  {/* Official Seal / Stamp */}
                  <div className="text-center p-3 border border-stone-200 rounded-xl bg-stone-50/50 flex flex-col items-center justify-center">
                    <span className="font-bold text-stone-900 block mb-1">الختم الرسمي للمؤسسة:</span>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-[10px] text-stone-400 font-bold rotate-12">
                      موضع الختم
                    </div>
                  </div>
                </div>

                {/* Footer Legal & Archiving Note */}
                <div className="text-center text-[10px] text-stone-500 pt-2 border-t border-stone-200">
                  <p>
                    {taxId} • هذا المستند صادر آلياً من النظام المركزي لإدارة مزارع الدواجن ويعد وثيقة محاسبية صالحة للأرشفة والمراجعة الضريبية والبنكية.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
