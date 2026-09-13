import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Calendar,
  DollarSign,
  Wheat,
  Pill,
  Scale,
  Skull,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  FileSpreadsheet,
  Printer,
  AlertTriangle
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { addDaysToDateISO, getCycleDayNumber, getMoroccoDateISO } from '../../utils/date';
import { CHICK_BREEDS, PoultryCycle, DailyLog } from '../../types';

interface CyclesViewProps {
  onNavigate: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
}

export const CyclesView: React.FC<CyclesViewProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    cycles,
    farms,
    workers,
    partners,
    accounts,
    chickPurchases,
    feedPurchases,
    feedMovements,
    medicationPurchases,
    medicationMovements,
    expenses,
    workerTransactions,
    dailyLogs,
    addCycle,
    updateCycle,
    deleteCycle,
    completeCycle,
    addDailyLog,
    getFarmFeedStockKg,
    allCycleSummaries,
    currency,
    language,
    selectedFarmId,
    canManageCycles,
    canEnterDailyLogs,
    canManageSales,
    isHangarAllowed
  } = useFarm();

  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [isAddCycleModal, setIsAddCycleModal] = useState(false);
  const [isAddDailyLogModal, setIsAddDailyLogModal] = useState(false);
  const [isCloseCycleModal, setIsCloseCycleModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<PoultryCycle | null>(null);
  const [cycleToDelete, setCycleToDelete] = useState<PoultryCycle | null>(null);
  const [formError, setFormError] = useState('');

  // New Cycle Form State
  const [newFarmId, setNewFarmId] = useState(farms[0]?.id || '');
  const [newCycleNumber, setNewCycleNumber] = useState(`CYC-${new Date().getFullYear()}-${cycles.length + 1}`);
  const [newStartDate, setNewStartDate] = useState(getMoroccoDateISO());
  const [newChickBreed, setNewChickBreed] = useState<string>('Ross 308');
  const [newChickCount, setNewChickCount] = useState<number | ''>(25000);
  const [newChickPrice, setNewChickPrice] = useState<number | ''>(5.80);
  const [newHatcherySupplierId, setNewHatcherySupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [newTargetWeight, setNewTargetWeight] = useState<number | ''>(2.2);
  const [newChickTransport, setNewChickTransport] = useState<number | ''>(0);
  const [newChickVaccine, setNewChickVaccine] = useState<number | ''>(0);
  const [newChickPaid, setNewChickPaid] = useState<number | ''>(0);
  const [newChickAccountId, setNewChickAccountId] = useState(accounts[0]?.id || '');
  const [newWorkerIds, setNewWorkerIds] = useState<string[]>([]);

  // Daily Log Form State
  const [logDate, setLogDate] = useState(getMoroccoDateISO());
  const [logMortality, setLogMortality] = useState<number | ''>(12);
  const [logFeedKg, setLogFeedKg] = useState<number | ''>(2250);
  const [logWaterLiters, setLogWaterLiters] = useState<number | ''>(4500);
  const [logSampleWeight, setLogSampleWeight] = useState<number | ''>(1450);
  const [logTemp, setLogTemp] = useState<number | ''>(26);
  const [logHumidity, setLogHumidity] = useState<number | ''>(65);
  const [logMedicationName, setLogMedicationName] = useState('');
  const [logMedicationPurchaseId, setLogMedicationPurchaseId] = useState('');
  const [logMedicationQuantity, setLogMedicationQuantity] = useState<number | ''>('');
  const [logMedicationUnit, setLogMedicationUnit] = useState('جرعة');
  const [logNotes, setLogNotes] = useState('');

  // Close Cycle State
  const [actualSaleDate, setActualSaleDate] = useState(getMoroccoDateISO());

  // Filter cycles
  const filteredCycles = selectedFarmId === 'all'
    ? cycles.filter(c => isHangarAllowed(c.farmId, c.barnNumber))
    : cycles.filter(c => c.farmId === selectedFarmId && isHangarAllowed(c.farmId, c.barnNumber));

  const activeCycles = filteredCycles.filter(c => c.status !== 'completed');
  const completedCycles = filteredCycles.filter(c => c.status === 'completed');

  // Selected Summary
  const currentSummary = allCycleSummaries.find(s => s.cycleId === selectedCycleId) ||
    allCycleSummaries.find(s => s.cycleId === activeCycles[0]?.id) ||
    allCycleSummaries[0];

  // Break-even plus a modest markup gives the operator a starting price.
  // Round up to the nearest 0.25 DH so the suggested price is practical.
  const breakEvenPrice = currentSummary?.costPerKg || 0;
  const suggestedSalePrice = breakEvenPrice > 0
    ? Math.ceil((breakEvenPrice * 1.2) * 4) / 4
    : 0;

  const currentCycleObj = cycles.find(c => c.id === currentSummary?.cycleId);
  const calculatedLogDayNumber = getCycleDayNumber(currentCycleObj?.startDate || '', logDate);
  const medicationStock = medicationPurchases
    .filter(purchase => purchase.farmId === currentCycleObj?.farmId)
    .map(purchase => {
      const used = dailyLogs.filter(log => log.medicationPurchaseId === purchase.id).reduce((sum, log) => sum + (log.medicationQuantity || 0), 0)
        + medicationMovements.filter(m => m.medicationPurchaseId === purchase.id && ['issue', 'waste'].includes(m.type)).reduce((sum, m) => sum + m.quantity, 0);
      return { purchase, available: Math.max(0, (purchase.quantity ?? 1) - used) };
    })
    .filter(item => item.available > 0);
  const selectedMedication = medicationStock.find(item => item.purchase.id === logMedicationPurchaseId);
  const currentCycleLogs = dailyLogs
    .filter(l => l.cycleId === currentSummary?.cycleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cycleChickPurchases = chickPurchases.filter(p => p.cycleId === currentSummary?.cycleId);
  const cycleFeedPurchases = feedPurchases.filter(p => p.cycleId === currentSummary?.cycleId);
  const cycleMedicationPurchases = medicationPurchases.filter(p => p.cycleId === currentSummary?.cycleId);
  const cycleExpenses = expenses.filter(e => e.cycleId === currentSummary?.cycleId);
  const cycleWorkerTransactions = workerTransactions.filter(w => w.cycleId === currentSummary?.cycleId);
  const cyclePaidAmount = cycleChickPurchases.reduce((sum, p) => sum + p.paidAmount, 0)
    + cycleFeedPurchases.reduce((sum, p) => sum + p.paidAmount, 0)
    + cycleMedicationPurchases.reduce((sum, p) => sum + p.paidAmount, 0)
    + cycleExpenses.reduce((sum, e) => sum + e.paidAmount, 0);
  const cycleDueAmount = Math.max(0, (currentSummary?.totalCycleCost || 0) - cyclePaidAmount);
  const farmFeedStockKg = getFarmFeedStockKg(currentCycleObj?.farmId || '');
  const currentFarmObj = farms.find(f => f.id === currentCycleObj?.farmId);
  const feedRemainingAfterLog = Math.max(0, farmFeedStockKg - Number(logFeedKg || 0));
  const isFeedLogOverStock = Number(logFeedKg || 0) > farmFeedStockKg;
  const cycleCostDetails = [
    ...cycleChickPurchases.map(p => ({ date: p.date, label: `كتاكيت • ${p.invoiceNumber}`, amount: p.totalAmount, paid: p.paidAmount })),
    ...cycleFeedPurchases.map(p => ({ date: p.date, label: `علف • ${p.brand}`, amount: p.totalAmount, paid: p.paidAmount })),
    ...cycleMedicationPurchases.map(p => ({ date: p.date, label: `دواء/لقاح • ${p.medicationName}`, amount: p.totalAmount, paid: p.paidAmount })),
    ...cycleExpenses.map(e => ({ date: e.date, label: `مصروف • ${e.description || e.customCategoryName || e.category}`, amount: e.amount, paid: e.paidAmount })),
    ...cycleWorkerTransactions.map(w => ({ date: w.date, label: `عمالة • ${w.description}`, amount: w.amount, paid: w.amount }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newFarmId) return setFormError('اختر المزرعة أولاً.');
    if (!newCycleNumber.trim()) return setFormError('أدخل رقم الدورة.');
    if (!newChickCount || Number(newChickCount) <= 0) return setFormError('عدد الكتاكيت يجب أن يكون أكبر من صفر.');
    if (newChickPrice === '' || Number(newChickPrice) <= 0) return setFormError('سعر الكتكوت يجب أن يكون أكبر من صفر.');
    const cycleData = {
      farmId: newFarmId,
      workerIds: newWorkerIds,
      cycleNumber: newCycleNumber,
      startDate: newStartDate,
      chickEntryDate: newStartDate,
      initialChickCount: Number(newChickCount),
      chickUnitPrice: Number(newChickPrice),
      chickBreed: newChickBreed,
      hatcherySupplierId: newHatcherySupplierId,
      chickTransportCost: Number(newChickTransport || 0),
      chickVaccineCost: Number(newChickVaccine || 0),
      chickPaidAmount: Number(newChickPaid || 0),
      chickPaymentMethod: Number(newChickPaid || 0) > 0 ? 'partial' : 'delayed',
      chickAccountId: newChickAccountId || undefined,
      status: 'active',
      targetWeightKg: Number(newTargetWeight || 2.2),
      expectedSaleDate: addDaysToDateISO(newStartDate, 42)
    };

    if (editingCycle) {
      updateCycle(editingCycle.id, cycleData);
      setEditingCycle(null);
    } else {
      addCycle(cycleData);
    }

    setIsAddCycleModal(false);
  };

  const openEditCycle = (cycle: PoultryCycle) => {
    setEditingCycle(cycle);
    setNewFarmId(cycle.farmId);
    setNewCycleNumber(cycle.cycleNumber);
    setNewStartDate(cycle.startDate);
    setNewChickBreed(cycle.chickBreed as any);
    setNewChickCount(cycle.initialChickCount);
    setNewChickPrice(cycle.chickUnitPrice);
    setNewHatcherySupplierId(cycle.hatcherySupplierId || '');
    setNewTargetWeight(cycle.targetWeightKg || 2.2);
    setNewChickTransport(cycle.chickTransportCost || 0);
    setNewChickVaccine(cycle.chickVaccineCost || 0);
    setNewChickPaid(cycle.chickPaidAmount || 0);
    setNewChickAccountId(cycle.chickAccountId || accounts[0]?.id || '');
    setNewWorkerIds(cycle.workerIds || []);
    setFormError('');
    setIsAddCycleModal(true);
  };

  const handleDeleteCycle = () => {
    if (!cycleToDelete) return;
    deleteCycle(cycleToDelete.id);
    setCycleToDelete(null);
    if (selectedCycleId === cycleToDelete.id) setSelectedCycleId(null);
  };

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSummary?.cycleId || calculatedLogDayNumber < 1) return;
    if (logMedicationPurchaseId && (!selectedMedication || Number(logMedicationQuantity || 0) <= 0 || Number(logMedicationQuantity) > selectedMedication.available)) return;

    addDailyLog({
      cycleId: currentSummary.cycleId,
      date: logDate,
      dayNumber: calculatedLogDayNumber,
      mortalityCount: Number(logMortality || 0),
      feedConsumedKg: Number(logFeedKg || 0),
      waterConsumedLiters: logWaterLiters ? Number(logWaterLiters) : undefined,
      sampleAverageWeightGrams: logSampleWeight ? Number(logSampleWeight) : undefined,
      temperatureCelsius: logTemp ? Number(logTemp) : undefined,
      humidityPercent: logHumidity ? Number(logHumidity) : undefined,
      medicationPurchaseId: logMedicationPurchaseId || undefined,
      medicationQuantity: logMedicationQuantity ? Number(logMedicationQuantity) : undefined,
      medicationName: selectedMedication?.purchase.medicationName || logMedicationName.trim() || undefined,
      medicationUnit: selectedMedication?.purchase.unit || (logMedicationName.trim() ? logMedicationUnit : undefined),
      notes: logNotes
    });

    setIsAddDailyLogModal(false);
  };

  const handleCompleteCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSummary?.cycleId) return;
    completeCycle(currentSummary.cycleId, actualSaleDate);
    setIsCloseCycleModal(false);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'إدارة دورات تربية الدجاج (Bandes)' : 'Gestion des Bandes de Volailles'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'متابعة يومية للنفوق، العلف، النمو، وحساب تكلفة الكيلوغرام والربحية لكل دورة بدقة'
              : 'Suivi journalier, FCR, coût par oiseau & rentabilité par bande'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="طباعة البطاقة الفنية للدورة"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة تقرير الدورة</span>
          </button>
          {canManageCycles && <button
            onClick={() => { setEditingCycle(null); setNewWorkerIds([]); setIsAddCycleModal(true); }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'ar' ? '+ إطلاق دورة جديدة' : '+ Nouvelle Bande'}</span>
          </button>}
        </div>
      </div>

      {/* Official Print Header */}
      <div className="print-only border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">
              البطاقة الفنية والإنتاجية للدورة: {currentCycleObj?.cycleNumber}
            </h1>
            <p className="text-xs text-stone-600">
              المزرعة: {currentSummary?.farmName} • السلالة: {currentCycleObj?.chickBreed} • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold">
            <div>حالة الدورة: {currentSummary?.status === 'completed' ? 'مكتملة ومغلقة' : 'جارية في التربية'}</div>
            <div>العدد الأولي: {currentCycleObj?.initialChickCount.toLocaleString()} كتكوت</div>
          </div>
        </div>
      </div>

      {/* Cycle Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
        {filteredCycles.map(c => {
          const isSelected = (currentSummary?.cycleId === c.id);
          const isCompleted = c.status === 'completed';
          const farm = farms.find(f => f.id === c.farmId);

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCycleId(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition border ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
              }`}
            >
              <span>{c.cycleNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isCompleted ? 'bg-stone-700/80 text-stone-300' : 'bg-emerald-600 text-white'
              }`}>
                {isCompleted ? 'مكتملة' : 'جارية'}
              </span>
              <span className="text-[10px] opacity-75 font-normal">({farm?.name || ''})</span>
            </button>
          );
        })}
      </div>

      {/* Main Selected Cycle Detail Card */}
      {currentSummary && currentCycleObj && (
        <div className="space-y-4">
          {/* Cycle Overview & Actions Banner */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black text-amber-300">{currentCycleObj.cycleNumber}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    currentSummary.status === 'completed'
                      ? 'bg-stone-800 text-stone-300 border border-stone-700'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {currentSummary.status === 'completed' ? 'دورة مغلقة ومكتملة' : 'دورة نشطة في التربية'}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>📍 {currentSummary.farmName}</span>
                  <span>🐣 {currentCycleObj.chickBreed} ({currentCycleObj.initialChickCount.toLocaleString()} كتكوت)</span>
                  <span>📅 بدء: {currentCycleObj.startDate}</span>
                  <span>⏱️ المدة: <strong className="text-stone-200">{currentSummary.durationDays} يوم</strong></span>
                </div>
                <div className="text-xs text-stone-400 mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-purple-300">👷 فريق الدورة:</span>
                  {(currentCycleObj.workerIds || []).length > 0
                    ? (currentCycleObj.workerIds || []).map(workerId => workers.find(worker => worker.id === workerId)?.name || workerId).map((name, index) => <span key={`${name}-${index}`} className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200">{name}</span>)
                    : <span className="text-stone-500">لم يتم تحديد المشرفين أو العمال بعد</span>}
                </div>
              </div>

              {/* Cycle Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {currentSummary.status !== 'completed' ? (
                  <>
                    {canManageCycles && <button
                      onClick={() => openEditCycle(currentCycleObj)}
                      className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold"
                    >
                      تعديل الدورة
                    </button>}
                    {canManageCycles && <button
                      onClick={() => setCycleToDelete(currentCycleObj)}
                      className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold"
                    >
                      إلغاء الدورة
                    </button>}
                    {canEnterDailyLogs && <button
                      onClick={() => setIsAddDailyLogModal(true)}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ تسجيل يومي</span>
                    </button>}
                    {canManageSales && <button
                      onClick={() => onOpenQuickAction('sale')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                    >
                      <span>+ بيع بالجملة</span>
                    </button>}
                    {canManageCycles && <button
                      onClick={() => setIsCloseCycleModal(true)}
                      className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-extrabold transition"
                    >
                      🏁 إنهاء وإغلاق الدورة
                    </button>}
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم تدقيق حسابات الدورة بالكامل</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cycle Key Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block mb-0.5">تكلفة الكيلوغرام</span>
                <span className="text-base sm:text-lg font-black text-amber-300">
                  {currentSummary.costPerKg.toFixed(2)} {currency}/كغ
                </span>
                <span className="text-[10px] text-stone-500 block">تكلفة الطائر: {currentSummary.costPerLiveBird.toFixed(2)} {currency}</span>
              </div>

              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-700/40">
                <span className="text-[10px] text-stone-400 block mb-0.5">اقتراح سعر البيع</span>
                <span className="text-base sm:text-lg font-black text-emerald-300">
                  {suggestedSalePrice.toFixed(2)} {currency}/كغ
                </span>
                <span className="text-[10px] text-stone-500 block">تعادل +20% فوق التكلفة ({breakEvenPrice.toFixed(2)} DH)</span>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block mb-0.5">معدل التحويل الغذائي (FCR)</span>
                <span className={`text-base sm:text-lg font-black ${currentSummary.fcr > 0 && currentSummary.fcr <= 1.65 ? 'text-emerald-400' : 'text-stone-200'}`}>
                  {currentSummary.fcr > 0 ? currentSummary.fcr.toFixed(2) : '--'}
                </span>
                <span className="text-[10px] text-stone-500 block">
                  مستهلك: {(currentSummary.totalFeedConsumedKg / 1000).toFixed(1)} طن • مشتَرى: {(currentSummary.totalFeedPurchasedKg / 1000).toFixed(1)} طن
                </span>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block mb-0.5">نسبة النفوق الإجمالية</span>
                <span className={`text-base sm:text-lg font-black ${currentSummary.mortalityRatePercent > 5 ? 'text-rose-400' : 'text-stone-200'}`}>
                  {currentSummary.mortalityRatePercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-stone-500 block">{currentSummary.totalMortality} طائر نافق</span>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block mb-0.5">صافي الربح / الخسارة</span>
                <span className={`text-base sm:text-lg font-black ${currentSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSummary.netProfit.toLocaleString()} {currency}
                </span>
                <span className="text-[10px] text-stone-500 block">هامش: {currentSummary.profitMarginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown & Economics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Cost Distribution */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-stone-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>تفصيل تكاليف ومصاريف الدورة</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950/40">
                  <span className="text-stone-400">🐣 شراء الكتاكيت</span>
                  <span className="font-bold text-stone-200">{currentSummary.chicksCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950/40">
                  <span className="text-stone-400">🌾 الأعلاف المركبة</span>
                  <span className="font-bold text-amber-300">{currentSummary.totalFeedCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950/40">
                  <span className="text-stone-400">💊 الأدوية والتحصينات</span>
                  <span className="font-bold text-indigo-300">{currentSummary.totalMedicationCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950/40">
                  <span className="text-stone-400">👷 العمالة والإشراف</span>
                  <span className="font-bold text-purple-300">{currentSummary.totalLaborCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950/40">
                  <span className="text-stone-400">⚡ الطاقة، الغاز، والماء</span>
                  <span className="font-bold text-stone-200">{currentSummary.totalUtilitiesCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950/40">
                  <span className="text-stone-400">📦 فرشة ومصاريف أخرى</span>
                  <span className="font-bold text-stone-200">{currentSummary.totalOtherExpenses.toLocaleString()} {currency}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-stone-100 font-extrabold text-sm mt-2">
                  <span>إجمالي تكلفة الدورة:</span>
                  <span className="text-amber-400">{currentSummary.totalCycleCost.toLocaleString()} {currency}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                    <span className="block text-[10px] text-stone-400">المدفوع</span>
                    <strong className="text-emerald-400">{cyclePaidAmount.toLocaleString()} {currency}</strong>
                  </div>
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-center">
                    <span className="block text-[10px] text-stone-400">المؤجل / الباقي</span>
                    <strong className="text-rose-400">{cycleDueAmount.toLocaleString()} {currency}</strong>
                  </div>
                </div>
                <div className="rounded-lg bg-stone-950/40 border border-stone-800 p-2 text-[11px] text-stone-400 space-y-1">
                  <div className="flex justify-between"><span>العلف المشترى المرتبط بالدورة</span><strong className="text-stone-200">{currentSummary.totalFeedPurchasedKg.toLocaleString()} كغ</strong></div>
                  <div className="flex justify-between"><span>العلف المستهلك</span><strong className="text-amber-300">{currentSummary.totalFeedConsumedKg.toLocaleString()} كغ</strong></div>
                  <div className="flex justify-between"><span>رصيد مخزن المزرعة</span><strong className="text-emerald-300">{farmFeedStockKg.toLocaleString()} كغ</strong></div>
                </div>
                <div className="border-t border-stone-800 pt-3 mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-200">العمليات المالية المسجلة</span>
                    <span className="text-[10px] text-stone-500">{cycleCostDetails.length} عملية</span>
                  </div>
                  {cycleCostDetails.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-stone-700 p-3 text-center text-[11px] text-stone-500">
                      لا توجد فواتير أو مصاريف مرتبطة بهذه الدورة بعد.
                      <button type="button" onClick={() => onOpenQuickAction('expense')} className="block mx-auto mt-1 text-amber-400 hover:text-amber-300 font-bold">
                        تسجيل أول مصروف
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {cycleCostDetails.map((item, index) => (
                        <div key={`${item.date}-${item.label}-${index}`} className="rounded-lg bg-stone-950/50 border border-stone-800 p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-stone-300 font-semibold truncate">{item.label}</div>
                              <div className="text-[10px] text-stone-500">{item.date}</div>
                            </div>
                            <div className="text-left shrink-0">
                              <div className="font-bold text-stone-200">{item.amount.toLocaleString()} {currency}</div>
                              <div className="text-[10px] text-emerald-400">مدفوع {item.paid.toLocaleString()} • باقي {Math.max(0, item.amount - item.paid).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {currentSummary.totalFeedConsumedKg > 0 && currentSummary.totalFeedPurchasedKg === 0 && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2 text-[11px] text-blue-200">
                    ℹ️ شراء العلف يتم على مستوى مخزن المزرعة. تم احتساب تكلفة الدورة حسب العلف المصروف لها، بينما يظهر رصيد المخزن بشكل مستقل.
                  </div>
                )}
              </div>
            </div>

            {/* Middle & Right: Sales & Daily Logs */}
            <div className="lg:col-span-2 space-y-4">
              {/* Sales Progress */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-stone-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>مبيعات وتسويق الدورة</span>
                  </h4>
                  <span className="text-xs text-emerald-400 font-bold">
                    إجمالي الإيرادات: {currentSummary.totalRevenue.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-stone-950/60 rounded-xl">
                    <span className="text-[10px] text-stone-400 block">العدد المباع</span>
                    <span className="font-bold text-stone-100">{currentSummary.totalSoldChicks.toLocaleString()} طائر</span>
                  </div>
                  <div className="p-2.5 bg-stone-950/60 rounded-xl">
                    <span className="text-[10px] text-stone-400 block">الوزن الإجمالي المسوق</span>
                    <span className="font-bold text-stone-100">{(currentSummary.totalWeightSoldKg).toLocaleString()} كغ</span>
                  </div>
                  <div className="p-2.5 bg-stone-950/60 rounded-xl">
                    <span className="text-[10px] text-stone-400 block">متوسط سعر البيع</span>
                    <span className="font-bold text-emerald-400">{currentSummary.averageSellingPricePerKg.toFixed(2)} {currency}/كغ</span>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Logs Table */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-stone-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>السجل اليومي للدورة (علف، دواء، نفوق، وزن، ملاحظات)</span>
                  </h4>
                  {canEnterDailyLogs && <button
                    onClick={() => setIsAddDailyLogModal(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                  >
                    + إضافة يوم
                  </button>}
                </div>

                <div className="max-h-60 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                        <th className="pb-2">اليوم</th>
                        <th className="pb-2">التاريخ</th>
                        <th className="pb-2">النافق</th>
                        <th className="pb-2">العلف (كغ)</th>
                        <th className="pb-2">الدواء</th>
                        <th className="pb-2">متوسط الوزن (غ)</th>
                        <th className="pb-2">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {currentCycleLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-stone-500">
                            لا توجد تسجيلات يومية بعد لهذه الدورة.
                          </td>
                        </tr>
                      ) : (
                        currentCycleLogs.map(log => (
                          <tr key={log.id} className="hover:bg-stone-800/40 transition">
                            <td className="py-2 font-bold text-amber-400">يوم {log.dayNumber}</td>
                            <td className="py-2 text-stone-300">{log.date}</td>
                            <td className={`py-2 font-bold ${log.mortalityCount > 20 ? 'text-rose-400' : 'text-stone-300'}`}>
                              {log.mortalityCount}
                            </td>
                            <td className="py-2 text-stone-200 font-semibold">{log.feedConsumedKg?.toLocaleString()}</td>
                            <td className="py-2 text-indigo-300 font-semibold">{log.medicationName ? `${log.medicationName}${log.medicationQuantity ? ` (${log.medicationQuantity} ${log.medicationUnit || ''})` : ''}` : '--'}</td>
                            <td className="py-2 text-blue-300 font-semibold">{log.sampleAverageWeightGrams ? `${log.sampleAverageWeightGrams} غ` : '--'}</td>
                            <td className="py-2 text-stone-400 text-[11px] max-w-[120px] truncate">{log.notes || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Print Footer */}
            <div className="print-only pt-8 mt-6 border-t-2 border-stone-300">
              <div className="flex items-center justify-between text-xs text-stone-700">
                <div>
                  <span className="font-bold block">المشرف البيطري / التقني:</span>
                  <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
                </div>
                <div>
                  <span className="font-bold block">توقيع مدير المزرعة والختم:</span>
                  <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Create New Cycle */}
      {isAddCycleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddCycleModal(false)} />
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-100">{editingCycle ? 'تعديل بيانات الدورة' : 'إطلاق دورة تربية جديدة (Bande)'}</h3>
              <button onClick={() => { setIsAddCycleModal(false); setEditingCycle(null); setFormError(''); }} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-4 space-y-3 text-xs max-h-[85vh] overflow-y-auto">
              {formError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">⚠️ {formError}</div>}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المزرعة *</label>
                  <select
                    value={newFarmId}
                    onChange={e => { setNewFarmId(e.target.value); setNewWorkerIds(current => current.filter(id => workers.some(worker => worker.id === id && worker.farmId === e.target.value))); }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم/رمز الدورة *</label>
                  <input
                    type="text"
                    required
                    value={newCycleNumber}
                    onChange={e => setNewCycleNumber(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">تاريخ دخول الكتاكيت *</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">السلالة (Breed)</label>
                  <select
                    value={newChickBreed}
                    onChange={e => setNewChickBreed(e.target.value as any)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  >
                    {CHICK_BREEDS.map(breed => <option key={breed} value={breed}>{breed}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">عدد الكتاكيت المستلمة *</label>
                  <input
                    type="number"
                    required
                    value={newChickCount}
                    onChange={e => setNewChickCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">سعر الكتكوت الواحد ({currency}) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newChickPrice}
                    onChange={e => setNewChickPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">مفرخة الكتاكيت / المورد</label>
                <select
                  value={newHatcherySupplierId}
                  onChange={e => setNewHatcherySupplierId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                >
                  {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">النقل ({currency})</label>
                  <input type="number" min="0" value={newChickTransport} onChange={e => setNewChickTransport(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">اللقاحات ({currency})</label>
                  <input type="number" min="0" value={newChickVaccine} onChange={e => setNewChickVaccine(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المدفوع الآن ({currency})</label>
                  <input type="number" min="0" value={newChickPaid} onChange={e => setNewChickPaid(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">حساب دفع الكتاكيت</label>
                <select value={newChickAccountId} onChange={e => setNewChickAccountId(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                  <option value="">لا يوجد دفع الآن</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="rounded-xl bg-purple-950/20 border border-purple-500/20 p-3">
                <label className="block text-stone-200 font-bold mb-2">مشرفو وعمال الدورة</label>
                <p className="text-[10px] text-stone-500 mb-2">اختر فريق هذه الدورة من العمال المخصصين للمزرعة.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {workers.filter(worker => worker.farmId === newFarmId && worker.isActive !== false).length === 0 ? (
                    <span className="text-[11px] text-amber-300">لا يوجد عمال مسجلون لهذه المزرعة.</span>
                  ) : workers.filter(worker => worker.farmId === newFarmId && worker.isActive !== false).map(worker => (
                    <label key={worker.id} className="flex items-center gap-2 rounded-lg bg-stone-800/70 p-2 cursor-pointer">
                      <input type="checkbox" checked={newWorkerIds.includes(worker.id)} onChange={event => setNewWorkerIds(current => event.target.checked ? [...current, worker.id] : current.filter(id => id !== worker.id))} className="accent-purple-500" />
                      <span className="text-stone-200 font-semibold">{worker.name}</span>
                      <span className="text-[10px] text-purple-300 mr-auto">{worker.jobTitle}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">الوزن المستهدف للتسويق (كغ)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTargetWeight}
                  onChange={e => setNewTargetWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              {newChickCount && newChickPrice && (
                <div className="p-3 rounded-xl bg-stone-800 border border-stone-700 flex justify-between items-center">
                  <span className="text-stone-300">إجمالي تكلفة الكتاكيت:</span>
                  <span className="font-extrabold text-amber-400">
                    {(Number(newChickCount) * Number(newChickPrice) + Number(newChickTransport || 0) + Number(newChickVaccine || 0)).toLocaleString()} {currency}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                {editingCycle ? 'حفظ تعديلات الدورة' : 'تأكيد بدء الدورة'}
              </button>
              <button type="button" onClick={() => { setIsAddCycleModal(false); setEditingCycle(null); setFormError(''); }} className="w-full py-2 text-stone-400 hover:text-stone-200 font-bold">إلغاء</button>
            </form>
          </div>
        </div>
      )}

      {cycleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/80" onClick={() => setCycleToDelete(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-5 z-10 space-y-4">
            <h3 className="font-black text-stone-100">تأكيد إلغاء الدورة</h3>
            <p className="text-sm text-stone-300">سيتم حذف الدورة وفاتورة الكتاكيت المرتبطة بها وحركات دفعها. لا يمكن التراجع عن هذا الإجراء.</p>
            <p className="font-bold text-amber-300">{cycleToDelete.cycleNumber}</p>
            <div className="flex gap-2">
              <button onClick={handleDeleteCycle} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold">نعم، ألغِ الدورة</button>
              <button onClick={() => setCycleToDelete(null)} className="flex-1 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add Daily Log */}
      {isAddDailyLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddDailyLogModal(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-100">تسجيل بيانات اليوم ({currentCycleObj.cycleNumber})</h3>
              <button onClick={() => setIsAddDailyLogModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDailyLog} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    min={currentCycleObj?.startDate}
                    value={logDate}
                    onChange={e => setLogDate(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم اليوم من الدورة</label>
                  <input
                    type="number"
                    required
                    value={calculatedLogDayNumber || ''}
                    readOnly
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">عدد النافق اليوم *</label>
                <input
                  type="number"
                  required
                  value={logMortality}
                  onChange={e => setLogMortality(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-rose-400"
                />
              </div>

              {/* Unified Farm Feed Consumption & Stock Deduction Box */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-stone-200 flex items-center gap-1.5 text-xs">
                    <Wheat className="w-4 h-4 text-amber-400" />
                    <span>صرف العلف من رصيد المزرعة ({currentFarmObj?.name || 'المزرعة'})</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-amber-500/40 font-black text-amber-300 text-[11px]">
                    المتاح بالمزرعة: {farmFeedStockKg.toLocaleString()} كغ ({Math.floor(farmFeedStockKg / 50)} كيس)
                  </span>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">
                    العلف المستهلك اليوم في الدورة (كغ) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="أدخل كمية العلف المستهلك اليوم"
                      value={logFeedKg}
                      onChange={e => setLogFeedKg(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-black text-amber-300 focus:border-amber-500 text-sm"
                    />
                    <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-xs pointer-events-none">
                      كغ ({Number(logFeedKg || 0) > 0 ? `${(Number(logFeedKg) / 50).toFixed(1)} كيس` : '0 كيس'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-800/80">
                  <span className="text-stone-400">الرصيد المتبقي في المزرعة بعد هذا الصرف:</span>
                  <span className={`font-black ${isFeedLogOverStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {feedRemainingAfterLog.toLocaleString()} كغ ({Math.floor(feedRemainingAfterLog / 50)} كيس 50كغ)
                  </span>
                </div>

                {isFeedLogOverStock && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>تنبيه: الكمية المستهلكة ({logFeedKg} كغ) تتجاوز الرصيد المتوفر في المزرعة ({farmFeedStockKg} كغ).</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">وزن العينة (غ)</label>
                  <input
                    type="number"
                    placeholder="1450"
                    value={logSampleWeight}
                    onChange={e => setLogSampleWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 text-blue-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">الحرارة (°C)</label>
                  <input
                    type="number"
                    value={logTemp}
                    onChange={e => setLogTemp(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">الرطوبة (%)</label>
                  <input
                    type="number"
                    value={logHumidity}
                    onChange={e => setLogHumidity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-bold mb-1">الدواء / اللقاح من المخزون</label>
                  <select value={logMedicationPurchaseId} onChange={e => { setLogMedicationPurchaseId(e.target.value); setLogMedicationName(''); }} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                    <option value="">بدون دواء / لقاح</option>
                    {medicationStock.map(item => <option key={item.purchase.id} value={item.purchase.id}>{item.purchase.medicationName} — متاح {item.available} {item.purchase.unit || 'وحدة'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">الكمية والوحدة</label>
                  <div className="flex gap-1">
                    <input type="number" min="0.01" max={selectedMedication?.available} placeholder="0" value={logMedicationQuantity} onChange={e => setLogMedicationQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full min-w-0 bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                    <select value={selectedMedication?.purchase.unit || logMedicationUnit} onChange={e => setLogMedicationUnit(e.target.value)} disabled={!!selectedMedication} className="w-20 bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                      <option>جرعة</option><option>مل</option><option>لتر</option><option>غ</option><option>كغ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">ملاحظات بيطرية أو فنية</label>
                <textarea
                  rows={2}
                  placeholder="حالة الفرشة، استهلاك الماء، نشاط الطيور..."
                  value={logNotes}
                  onChange={e => setLogNotes(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                حفظ السجل اليومي
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Close Cycle Wizard */}
      {isCloseCycleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsCloseCycleModal(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-100">إغلاق وتصفية الدورة نهائياً</h3>
              <button onClick={() => setIsCloseCycleModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteCycleSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <div className="font-bold text-amber-300">تأكيد إنهاء دورة التربية: {currentCycleObj.cycleNumber}</div>
                <p className="text-stone-300 text-[11px]">
                  سيتم تثبيت الحسابات الختامية وحساب الأرباح الفعلية وتكلفة الكيلوغرام ومعدل FCR النهائي.
                </p>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">تاريخ انتهاء وبيع الدورة الفعلي</label>
                <input
                  type="date"
                  required
                  value={actualSaleDate}
                  onChange={e => setActualSaleDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                />
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-400">إجمالي التكلفة:</span>
                  <span className="font-bold text-stone-200">{currentSummary.totalCycleCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">إجمالي المبيعات:</span>
                  <span className="font-bold text-emerald-400">{currentSummary.totalRevenue.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-stone-800 pt-1">
                  <span className="text-stone-300">صافي الربح المتوقع:</span>
                  <span className={currentSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {currentSummary.netProfit.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition"
              >
                تأكيد إغلاق الدورة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
