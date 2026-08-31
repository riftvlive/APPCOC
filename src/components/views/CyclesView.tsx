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
  Printer
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { PoultryCycle, DailyLog } from '../../types';

interface CyclesViewProps {
  onNavigate: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
}

export const CyclesView: React.FC<CyclesViewProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    cycles,
    farms,
    partners,
    dailyLogs,
    addCycle,
    updateCycle,
    completeCycle,
    addDailyLog,
    allCycleSummaries,
    currency,
    language,
    selectedFarmId
  } = useFarm();

  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [isAddCycleModal, setIsAddCycleModal] = useState(false);
  const [isAddDailyLogModal, setIsAddDailyLogModal] = useState(false);
  const [isCloseCycleModal, setIsCloseCycleModal] = useState(false);

  // New Cycle Form State
  const [newFarmId, setNewFarmId] = useState(farms[0]?.id || '');
  const [newCycleNumber, setNewCycleNumber] = useState(`CYC-${new Date().getFullYear()}-${cycles.length + 1}`);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [newChickBreed, setNewChickBreed] = useState<'Ross 308' | 'Cobb 500' | 'Hubbard'>('Ross 308');
  const [newChickCount, setNewChickCount] = useState<number | ''>(25000);
  const [newChickPrice, setNewChickPrice] = useState<number | ''>(5.80);
  const [newHatcherySupplierId, setNewHatcherySupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [newTargetWeight, setNewTargetWeight] = useState<number | ''>(2.2);

  // Daily Log Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().substring(0, 10));
  const [logDayNumber, setLogDayNumber] = useState<number | ''>(25);
  const [logMortality, setLogMortality] = useState<number | ''>(12);
  const [logFeedKg, setLogFeedKg] = useState<number | ''>(2250);
  const [logWaterLiters, setLogWaterLiters] = useState<number | ''>(4500);
  const [logSampleWeight, setLogSampleWeight] = useState<number | ''>(1450);
  const [logTemp, setLogTemp] = useState<number | ''>(26);
  const [logHumidity, setLogHumidity] = useState<number | ''>(65);
  const [logNotes, setLogNotes] = useState('');

  // Close Cycle State
  const [actualSaleDate, setActualSaleDate] = useState(new Date().toISOString().substring(0, 10));

  // Filter cycles
  const filteredCycles = selectedFarmId === 'all'
    ? cycles
    : cycles.filter(c => c.farmId === selectedFarmId);

  const activeCycles = filteredCycles.filter(c => c.status !== 'completed');
  const completedCycles = filteredCycles.filter(c => c.status === 'completed');

  // Selected Summary
  const currentSummary = allCycleSummaries.find(s => s.cycleId === selectedCycleId) ||
    allCycleSummaries.find(s => s.cycleId === activeCycles[0]?.id) ||
    allCycleSummaries[0];

  const currentCycleObj = cycles.find(c => c.id === currentSummary?.cycleId);
  const currentCycleLogs = dailyLogs
    .filter(l => l.cycleId === currentSummary?.cycleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmId || !newChickCount || !newChickPrice) return;

    addCycle({
      farmId: newFarmId,
      cycleNumber: newCycleNumber,
      startDate: newStartDate,
      chickEntryDate: newStartDate,
      initialChickCount: Number(newChickCount),
      chickUnitPrice: Number(newChickPrice),
      chickBreed: newChickBreed,
      hatcherySupplierId: newHatcherySupplierId,
      status: 'active',
      targetWeightKg: Number(newTargetWeight || 2.2),
      expectedSaleDate: new Date(new Date(newStartDate).getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    });

    setIsAddCycleModal(false);
  };

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSummary?.cycleId) return;

    addDailyLog({
      cycleId: currentSummary.cycleId,
      date: logDate,
      dayNumber: Number(logDayNumber || 1),
      mortalityCount: Number(logMortality || 0),
      feedConsumedKg: Number(logFeedKg || 0),
      waterConsumedLiters: logWaterLiters ? Number(logWaterLiters) : undefined,
      sampleAverageWeightGrams: logSampleWeight ? Number(logSampleWeight) : undefined,
      temperatureCelsius: logTemp ? Number(logTemp) : undefined,
      humidityPercent: logHumidity ? Number(logHumidity) : undefined,
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
          <button
            onClick={() => setIsAddCycleModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'ar' ? '+ إطلاق دورة جديدة' : '+ Nouvelle Bande'}</span>
          </button>
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
              </div>

              {/* Cycle Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {currentSummary.status !== 'completed' ? (
                  <>
                    <button
                      onClick={() => setIsAddDailyLogModal(true)}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ تسجيل يومي</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAction('sale')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                    >
                      <span>+ بيع بالجملة</span>
                    </button>
                    <button
                      onClick={() => setIsCloseCycleModal(true)}
                      className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-extrabold transition"
                    >
                      🏁 إنهاء وإغلاق الدورة
                    </button>
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

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block mb-0.5">معدل التحويل الغذائي (FCR)</span>
                <span className={`text-base sm:text-lg font-black ${currentSummary.fcr > 0 && currentSummary.fcr <= 1.65 ? 'text-emerald-400' : 'text-stone-200'}`}>
                  {currentSummary.fcr > 0 ? currentSummary.fcr.toFixed(2) : '--'}
                </span>
                <span className="text-[10px] text-stone-500 block">إجمالي العلف: {(currentSummary.totalFeedKg / 1000).toFixed(1)} طن</span>
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
                    <span>السجل اليومي للدورة (علف، نفوق، وزن، ملاحظات)</span>
                  </h4>
                  <button
                    onClick={() => setIsAddDailyLogModal(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                  >
                    + إضافة يوم
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                        <th className="pb-2">اليوم</th>
                        <th className="pb-2">التاريخ</th>
                        <th className="pb-2">النافق</th>
                        <th className="pb-2">العلف (كغ)</th>
                        <th className="pb-2">متوسط الوزن (غ)</th>
                        <th className="pb-2">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {currentCycleLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-stone-500">
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
              <h3 className="font-extrabold text-sm text-stone-100">إطلاق دورة تربية جديدة (Bande)</h3>
              <button onClick={() => setIsAddCycleModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-4 space-y-3 text-xs max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المزرعة *</label>
                  <select
                    value={newFarmId}
                    onChange={e => setNewFarmId(e.target.value)}
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
                    <option value="Ross 308">Ross 308</option>
                    <option value="Cobb 500">Cobb 500</option>
                    <option value="Hubbard">Hubbard</option>
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
                    {(Number(newChickCount) * Number(newChickPrice)).toLocaleString()} {currency}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                تأكيد بدء الدورة
              </button>
            </form>
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
                    value={logDayNumber}
                    onChange={e => setLogDayNumber(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="block text-stone-300 font-bold mb-1">العلف المستهلك (كغ) *</label>
                  <input
                    type="number"
                    required
                    value={logFeedKg}
                    onChange={e => setLogFeedKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-300"
                  />
                </div>
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
