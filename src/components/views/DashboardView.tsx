import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Scale,
  Users2,
  Wheat,
  Pill,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Plus,
  ChevronLeft,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle2,
  PieChart as PieIcon,
  Egg
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { getMoroccoDateISO } from '../../utils/date';

interface DashboardViewProps {
  onNavigate: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
}

type DashboardPeriod = 'today' | 'yesterday' | 'last7' | 'last28' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

const shiftDate = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

const monthStart = (date: string) => `${date.slice(0, 7)}-01`;

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    farms,
    cycles,
    expenses,
    sales,
    transactions,
    chickPurchases,
    feedPurchases,
    medicationPurchases,
    dailyLogs,
    feedMovements,
    medicationMovements,
    partners,
    allCycleSummaries,
    totalLiquidity,
    partnerBalances,
    totalActiveBirds,
    canManageFinance,
    currency,
    language,
    selectedFarmId,
    currentUser,
    isHangarAllowed,
    hasPermission
  } = useFarm();
  const canManageFarms = hasPermission('canManageFarms');
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>('today');
  const [dashboardFromDate, setDashboardFromDate] = useState(getMoroccoDateISO());
  const [dashboardToDate, setDashboardToDate] = useState(getMoroccoDateISO());

  const dashboardRange = useMemo(() => {
    const today = getMoroccoDateISO();
    if (dashboardPeriod === 'today') return { from: today, to: today };
    if (dashboardPeriod === 'yesterday') {
      const yesterday = shiftDate(today, -1);
      return { from: yesterday, to: yesterday };
    }
    if (dashboardPeriod === 'last7') return { from: shiftDate(today, -6), to: today };
    if (dashboardPeriod === 'last28') return { from: shiftDate(today, -27), to: today };
    if (dashboardPeriod === 'last30') return { from: shiftDate(today, -29), to: today };
    if (dashboardPeriod === 'thisMonth') return { from: monthStart(today), to: today };
    if (dashboardPeriod === 'lastMonth') {
      const firstOfThisMonth = monthStart(today);
      const lastDay = shiftDate(firstOfThisMonth, -1);
      return { from: monthStart(lastDay), to: lastDay };
    }
    return { from: dashboardFromDate, to: dashboardToDate < dashboardFromDate ? dashboardFromDate : dashboardToDate };
  }, [dashboardPeriod, dashboardFromDate, dashboardToDate]);
  const isInDashboardRange = (date?: string) => Boolean(date && date >= dashboardRange.from && date <= dashboardRange.to);

  const allowedFarmIds = currentUser.allowedFarmIds || farms.map(farm => farm.id);
  const scopedFarms = farms.filter(farm => allowedFarmIds.includes(farm.id));
  const cycleInDashboardRange = (cycle: typeof cycles[number]) => cycle.startDate <= dashboardRange.to && (!cycle.actualSaleDate || cycle.actualSaleDate >= dashboardRange.from);
  const scopedCycles = cycles.filter(cycle => allowedFarmIds.includes(cycle.farmId) && isHangarAllowed(cycle.farmId, cycle.barnNumber) && cycleInDashboardRange(cycle));

  // Filter summaries if a farm is selected
  const filteredSummaries = selectedFarmId === 'all'
    ? allCycleSummaries.filter(summary => scopedCycles.some(cycle => cycle.id === summary.cycleId))
    : allCycleSummaries.filter(c => {
        const cycle = cycles.find(cy => cy.id === c.cycleId);
        return cycle?.farmId === selectedFarmId && scopedCycles.some(scopedCycle => scopedCycle.id === c.cycleId);
      });

  const activeCycles = filteredSummaries.filter(c => c.status !== 'completed');
  const completedCycles = filteredSummaries.filter(c => c.status === 'completed');
  const filteredChickPurchases = selectedFarmId === 'all'
    ? chickPurchases.filter(c => allowedFarmIds.includes(c.farmId) && isInDashboardRange(c.date))
    : chickPurchases.filter(c => c.farmId === selectedFarmId && isInDashboardRange(c.date));
  const totalChickCost = filteredChickPurchases.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalChickPaid = filteredChickPurchases.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalChickRemaining = filteredChickPurchases.reduce((sum, c) => sum + c.remainingAmount, 0);

  const selectedDateMetrics = useMemo(() => {
    const matchesFarm = (farmId?: string) => Boolean(farmId && allowedFarmIds.includes(farmId) && (selectedFarmId === 'all' || farmId === selectedFarmId));
    const selectedSales = sales.filter(s => isInDashboardRange(s.date) && matchesFarm(s.farmId));
    const selectedExpenses = expenses.filter(e => isInDashboardRange(e.date) && (!e.farmId || matchesFarm(e.farmId)));
    const selectedChicks = chickPurchases.filter(c => isInDashboardRange(c.date) && matchesFarm(c.farmId));
    const selectedFeed = feedPurchases.filter(f => isInDashboardRange(f.date) && matchesFarm(f.farmId));
    const selectedMeds = medicationPurchases.filter(m => isInDashboardRange(m.date) && matchesFarm(m.farmId));
    const selectedTransactions = transactions.filter(t => isInDashboardRange(t.date) && (!t.farmId || matchesFarm(t.farmId)));

    return {
      sales: selectedSales.reduce((sum, item) => sum + item.netTotal, 0),
      expenses: selectedExpenses.reduce((sum, item) => sum + item.amount, 0)
        + selectedChicks.reduce((sum, item) => sum + item.totalAmount, 0)
        + selectedFeed.reduce((sum, item) => sum + item.totalAmount, 0)
        + selectedMeds.reduce((sum, item) => sum + item.totalAmount, 0),
      collections: selectedTransactions.filter(t => t.type === 'customer_payment').reduce((sum, item) => sum + item.amount, 0),
      payments: selectedTransactions.filter(t => ['supplier_payment', 'expense', 'worker_salary'].includes(t.type)).reduce((sum, item) => sum + item.amount, 0)
      ,breakdown: {
        chicks: selectedChicks.reduce((sum, item) => sum + item.totalAmount, 0),
        feed: selectedFeed.reduce((sum, item) => sum + item.totalAmount, 0),
        meds: selectedMeds.reduce((sum, item) => sum + item.totalAmount, 0),
        direct: selectedExpenses.reduce((sum, item) => sum + item.amount, 0)
      }
    };
  }, [allowedFarmIds, dashboardRange.from, dashboardRange.to, expenses, sales, transactions, chickPurchases, feedPurchases, medicationPurchases, selectedFarmId]);
  const formatDashboardDate = (date: string) => new Intl.DateTimeFormat(
    language === 'ar' ? 'ar-MA' : 'fr-MA',
    { day: 'numeric', month: 'long', year: 'numeric' }
  ).format(new Date(`${date}T12:00:00`));
  const selectedDateLabel = dashboardRange.from === getMoroccoDateISO() && dashboardRange.to === getMoroccoDateISO()
    ? (language === 'ar' ? 'اليوم' : "Aujourd'hui")
    : dashboardRange.from !== dashboardRange.to
      ? `${formatDashboardDate(dashboardRange.from)} — ${formatDashboardDate(dashboardRange.to)}`
      : formatDashboardDate(dashboardRange.from);
  const totalRevenueAll = selectedDateMetrics.sales;
  const totalCostAll = selectedDateMetrics.expenses;
  const netProfitAll = totalRevenueAll - totalCostAll;
  const operationalSnapshot = useMemo(() => {
    const farmMatch = (farmId?: string) => Boolean(farmId && allowedFarmIds.includes(farmId) && (selectedFarmId === 'all' || farmId === selectedFarmId));
    const cycleIds = new Set(scopedCycles.map(cycle => cycle.id));
    const logs = dailyLogs.filter(log => isInDashboardRange(log.date) && cycleIds.has(log.cycleId));
    const feedIssued = feedMovements.filter(m => m.type === 'issue' && isInDashboardRange(m.date) && farmMatch(m.farmId)).reduce((sum, movement) => sum + movement.quantityKg, 0);
    const medicationIssued = medicationMovements.filter(m => m.type === 'issue' && isInDashboardRange(m.date) && farmMatch(m.farmId)).reduce((sum, movement) => sum + movement.quantity, 0);
    const mortality = logs.reduce((sum, log) => sum + (log.mortalityCount || 0), 0);
    const latest = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
    return { logs, feedIssued, medicationIssued, mortality, latest };
  }, [allowedFarmIds, dailyLogs, feedMovements, medicationMovements, scopedCycles, selectedFarmId, dashboardRange.from, dashboardRange.to]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Quick Welcome & 10-Second Executive Status Banner */}
      <div className="bg-stone-900 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Repeat className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-100">
                  {language === 'ar' ? 'المزارع' : 'Fermes'}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {scopedFarms.length} مزارع • {activeCycles.length} دورات • {totalActiveBirds.toLocaleString()} طائر
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canManageFarms && (
              <button
                type="button"
                onClick={() => onNavigate('farms')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدارة المزارع</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('cycles')}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <span>سجل الدورات</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Date-scoped Flash Operations Bar */}
      {canManageFinance && <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-100">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'فترة البيانات المعروضة' : 'Période des données affichées'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={dashboardPeriod} onChange={event => setDashboardPeriod(event.target.value as DashboardPeriod)} className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-2 text-xs text-stone-100" aria-label="الفترة الزمنية">
            <option value="today">اليوم</option>
            <option value="yesterday">أمس</option>
            <option value="last7">آخر 7 أيام</option>
            <option value="last28">آخر 28 يومًا</option>
            <option value="last30">آخر 30 يومًا</option>
            <option value="thisMonth">هذا الشهر</option>
            <option value="lastMonth">الشهر السابق</option>
            <option value="custom">فترة مخصصة</option>
          </select>
          {dashboardPeriod === 'custom' && <>
            <label className="flex items-center gap-1.5 text-[11px] text-stone-400">من <input type="date" value={dashboardFromDate} onChange={event => setDashboardFromDate(event.target.value)} className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-xs text-stone-100" /></label>
            <label className="flex items-center gap-1.5 text-[11px] text-stone-400">إلى <input type="date" value={dashboardToDate} min={dashboardFromDate} onChange={event => setDashboardToDate(event.target.value)} className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-xs text-stone-100" /></label>
          </>}
          <span className="text-[11px] text-stone-400 px-1">{selectedDateLabel}</span>
        </div>
      </div>}

      {canManageFinance && <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? `مبيعات ${selectedDateLabel}` : `Ventes — ${selectedDateLabel}`}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {selectedDateMetrics.sales.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? `مشتريات ومصاريف ${selectedDateLabel}` : `Achats & dépenses — ${selectedDateLabel}`}
            </span>
            <span className="text-base sm:text-lg font-black text-rose-400">
              {selectedDateMetrics.expenses.toLocaleString()} {currency}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              كتاكيت {selectedDateMetrics.breakdown.chicks.toLocaleString()} • علف {selectedDateMetrics.breakdown.feed.toLocaleString()} • دواء {selectedDateMetrics.breakdown.meds.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? `تحصيلات ${selectedDateLabel}` : `Encaissements — ${selectedDateLabel}`}
            </span>
            <span className="text-base sm:text-lg font-black text-teal-300">
              {selectedDateMetrics.collections.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-300 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? `مدفوعات ${selectedDateLabel}` : `Décaissements — ${selectedDateLabel}`}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300">
              {selectedDateMetrics.payments.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>}

      {canManageFinance && <div className="bg-stone-900 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-extrabold text-stone-100">المجموع الكلي للدورات المحددة</h3>
          </div>
              <span className="text-[10px] text-stone-500">حسب الفلتر: {selectedDateLabel}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3 text-center">
            <span className="block text-[10px] text-stone-400">إجمالي المبيعات</span>
            <strong className="text-base font-black text-emerald-400">{totalRevenueAll.toLocaleString()} {currency}</strong>
          </div>
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3 text-center">
            <span className="block text-[10px] text-stone-400">إجمالي التكاليف</span>
            <strong className="text-base font-black text-rose-400">{totalCostAll.toLocaleString()} {currency}</strong>
          </div>
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3 text-center">
            <span className="block text-[10px] text-stone-400">صافي النتيجة</span>
            <strong className={`text-base font-black ${netProfitAll >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{netProfitAll.toLocaleString()} {currency}</strong>
          </div>
        </div>
      </div>}

      {/* Operations pulse: date-scoped field activity */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <div>
              <h3 className="font-extrabold text-sm text-stone-100">نبض التشغيل والمتابعة</h3>
              <p className="text-[10px] text-stone-500">البيانات الميدانية ضمن {selectedDateLabel}</p>
            </div>
          </div>
          <button onClick={() => onNavigate('cycles')} className="text-xs text-sky-300 hover:text-sky-200 font-bold">فتح السجل اليومي ➔</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3"><span className="text-[10px] text-stone-400 block">السجلات اليومية</span><strong className="text-lg text-sky-300">{operationalSnapshot.logs.length}</strong><span className="text-[10px] text-stone-500 block">آخر تاريخ: {operationalSnapshot.latest?.date || 'لا يوجد'}</span></div>
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3"><span className="text-[10px] text-stone-400 block">النافق في الفترة</span><strong className="text-lg text-rose-300">{operationalSnapshot.mortality.toLocaleString()}</strong><span className="text-[10px] text-stone-500 block">طائر</span></div>
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3"><span className="text-[10px] text-stone-400 block">العلف المصروف</span><strong className="text-lg text-amber-300">{operationalSnapshot.feedIssued.toLocaleString()}</strong><span className="text-[10px] text-stone-500 block">كغ</span></div>
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3"><span className="text-[10px] text-stone-400 block">الدواء المصروف</span><strong className="text-lg text-indigo-300">{operationalSnapshot.medicationIssued.toLocaleString()}</strong><span className="text-[10px] text-stone-500 block">وحدة</span></div>
        </div>
        {operationalSnapshot.latest && <div className="mt-3 rounded-xl bg-sky-500/5 border border-sky-500/20 px-3 py-2 text-xs text-stone-300 flex flex-wrap items-center gap-x-4 gap-y-1"><span className="font-bold text-sky-300">آخر متابعة: اليوم {operationalSnapshot.latest.dayNumber}</span><span>الوزن: {operationalSnapshot.latest.sampleAverageWeightGrams || '—'} غ</span><span>العلف: {operationalSnapshot.latest.feedConsumedKg || 0} كغ</span><span>الحرارة: {operationalSnapshot.latest.temperatureCelsius || '—'}°C</span></div>}
      </div>

      {/* 3. Executive Financial Health Grid */}
      {canManageFinance && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card A: Liquidity */}
        <div
          onClick={() => onNavigate('finance')}
          className="bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-2xl p-4 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-stone-300">
                {language === 'ar' ? 'إجمالي السيولة المتاحة' : 'Trésorerie Disponible'}
              </span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition" />
          </div>
          <div className="text-2xl font-black text-amber-400 mb-1">
            {totalLiquidity.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
          <p className="text-[11px] text-stone-400">
            {language === 'ar' ? 'في الصناديق النقدية والحسابات البنكية' : 'Solde caisses & comptes bancaires'}
          </p>
        </div>

        {/* Card B: "لي" - Customer Receivables */}
        <div
          onClick={() => onNavigate('debts')}
          className="bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-2xl p-4 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-stone-300">
                {language === 'ar' ? 'المبالغ المستحقة (لي عند الزبناء)' : 'Créances Clients (À encaisser)'}
              </span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 transition" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mb-1">
            {partnerBalances.totalReceivables.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
          <p className="text-[11px] text-stone-400">
            {language === 'ar' ? 'مبيعات آجلة وشيكات غير محصلة' : 'Ventes à crédit à recouvrer'}
          </p>
        </div>

        {/* Card C: "علي" - Supplier Payables */}
        <div
          onClick={() => onNavigate('debts')}
          className="bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-2xl p-4 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-stone-300">
                {language === 'ar' ? 'المبالغ المؤجلة (علي للموردين)' : 'Dettes Fournisseurs (À payer)'}
              </span>
            </div>
            <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:text-rose-400 transition" />
          </div>
          <div className="text-2xl font-black text-rose-400 mb-1">
            {partnerBalances.totalPayables.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
          <p className="text-[11px] text-stone-400">
            {language === 'ar' ? 'فواتير أعلاف، أدوية، وشيكات مؤجلة' : 'Factures aliments & poussins'}
          </p>
        </div>
      </div>}

      {/* 4. Chick Purchase Cost Details */}
      {canManageFinance && <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Egg className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-stone-100">تفاصيل مصاريف الكتاكيت</h3>
              <p className="text-[11px] text-stone-400">قيمة الكتاكيت والنقل واللقاحات والمدفوع والباقي</p>
            </div>
          </div>
          <button onClick={() => onNavigate('partners')} className="text-xs text-amber-400 hover:text-amber-300 font-bold">
            كشف الموردين ➔
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-stone-950/60 rounded-xl p-2.5 text-center border border-stone-850">
            <span className="text-[10px] text-stone-400 block">الإجمالي</span>
            <span className="text-sm font-black text-amber-300">{totalChickCost.toLocaleString()} {currency}</span>
          </div>
          <div className="bg-stone-950/60 rounded-xl p-2.5 text-center border border-stone-850">
            <span className="text-[10px] text-stone-400 block">المدفوع</span>
            <span className="text-sm font-black text-emerald-400">{totalChickPaid.toLocaleString()} {currency}</span>
          </div>
          <div className="bg-stone-950/60 rounded-xl p-2.5 text-center border border-stone-850">
            <span className="text-[10px] text-stone-400 block">الباقي</span>
            <span className="text-sm font-black text-rose-400">{totalChickRemaining.toLocaleString()} {currency}</span>
          </div>
        </div>

        {filteredChickPurchases.length === 0 ? (
          <div className="py-5 text-center text-xs text-stone-500">لا توجد مصاريف كتاكيت مسجلة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                  <th className="pb-2 font-bold">التاريخ / الفاتورة</th>
                  <th className="pb-2 font-bold">المورد</th>
                  <th className="pb-2 font-bold">العدد</th>
                  <th className="pb-2 font-bold">الكتاكيت</th>
                  <th className="pb-2 font-bold">النقل</th>
                  <th className="pb-2 font-bold">اللقاحات</th>
                  <th className="pb-2 font-bold">الإجمالي</th>
                  <th className="pb-2 font-bold">المدفوع / الباقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {[...filteredChickPurchases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(c => {
                  const supplier = partners.find(p => p.id === c.supplierId);
                  return (
                    <tr key={c.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-2.5"><span className="font-bold text-stone-200 block">{c.invoiceNumber}</span><span className="text-[10px] text-stone-500">{c.date}</span></td>
                      <td className="py-2.5 text-stone-300 font-semibold">{supplier?.name || c.supplierName || '-'}</td>
                      <td className="py-2.5 text-stone-200 font-bold">{c.receivedHealthyCount.toLocaleString()}</td>
                      <td className="py-2.5 text-stone-300">{(c.chickCost || 0).toLocaleString()} {currency}</td>
                      <td className="py-2.5 text-stone-300">{(c.transportCost || 0).toLocaleString()} {currency}</td>
                      <td className="py-2.5 text-stone-300">{(c.vaccineCostAtHatchery || 0).toLocaleString()} {currency}</td>
                      <td className="py-2.5 text-amber-300 font-black">{c.totalAmount.toLocaleString()} {currency}</td>
                      <td className="py-2.5"><span className="text-emerald-400 font-bold block">{c.paidAmount.toLocaleString()}</span><span className="text-rose-400 text-[10px]">باقي: {c.remainingAmount.toLocaleString()}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>}

      {/* 5. Active Poultry Cycles (Real-time Operations) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-stone-100">
              {language === 'ar' ? 'الدورات النشطة حالياً في العنابر' : 'Bandes Actives en Cours'}
            </h3>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
              {activeCycles.length}
            </span>
          </div>
          <button
            onClick={() => onNavigate('cycles')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
          >
            <span>{language === 'ar' ? 'عرض جميع الدورات' : 'Toutes les bandes'}</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeCycles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-stone-900 border border-stone-800 text-center space-y-2">
            <p className="text-xs text-stone-400">لا توجد دورة نشطة حالياً للمزرعة المحددة.</p>
            <button
              onClick={() => onNavigate('cycles')}
              className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
            >
              + بدء دورة تربية جديدة
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${activeCycles.length > 1 ? 'md:grid-cols-2' : ''} gap-3.5`}>
            {activeCycles.map((cycle) => {
              const daysRemaining = Math.max(0, 42 - cycle.durationDays);
              const progressPct = Math.min(100, Math.round((cycle.durationDays / 42) * 100));

              return (
                <div
                  key={cycle.cycleId}
                  className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 transition shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-amber-300">{cycle.cycleNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          {language === 'ar' ? 'جارية' : 'En cours'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        📍 {cycle.farmName} • عمر: <span className="font-bold text-stone-200">{cycle.durationDays} يوم</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block">{language === 'ar' ? 'الطيور الحية' : 'Vivants'}</span>
                      <span className="text-sm font-black text-stone-100">
                        {cycle.remainingLiveChicks.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] text-stone-400">
                      <span>التقدم نحو التسويق ({progressPct}%)</span>
                      <span>متبقي: {daysRemaining} يوم</span>
                    </div>
                    <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-stone-950/60 rounded-xl p-2.5 mb-3 text-center border border-stone-850">
                    <div>
                      <span className="text-[10px] text-stone-400 block">{language === 'ar' ? 'نسبة النفوق' : 'Mortalité'}</span>
                      <span className={`text-xs font-bold ${cycle.mortalityRatePercent > 4 ? 'text-rose-400' : 'text-stone-200'}`}>
                        {cycle.mortalityRatePercent.toFixed(1)}% ({cycle.totalMortality})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{language === 'ar' ? 'العلف المستهلك' : 'Aliment'}</span>
                      <span className="text-xs font-bold text-amber-300">
                        {(cycle.totalFeedConsumedKg / 1000).toFixed(1)} طن
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{language === 'ar' ? 'التكلفة حتى الآن' : 'Coût cumulé'}</span>
                      <span className="text-xs font-bold text-stone-100">
                        {cycle.totalCycleCost.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => onNavigate('cycles', cycle.cycleId)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition"
                    >
                      التفاصيل ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Economic Performance Summary (Completed Cycles Benchmark) */}
      {canManageFinance && completedCycles.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-stone-100">
                {language === 'ar' ? 'مؤشرات الدورات المكتملة وحسابات الربحية' : 'Rentabilité des Bandes Clôturées'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              تحليل الـ FCR والمقارنات ➔
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-center">
                <span className="text-[10px] text-stone-400 block mb-0.5">صافي النتيجة المحددة</span>
              <span className={`text-base font-black ${netProfitAll >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfitAll.toLocaleString()} {currency}
              </span>
            </div>
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-center">
              <span className="text-[10px] text-stone-400 block mb-0.5">متوسط تكلفة الكيلوغرام</span>
              <span className="text-base font-black text-amber-300">
                {(completedCycles.reduce((s, c) => s + c.costPerKg, 0) / completedCycles.length).toFixed(2)} {currency}/كغ
              </span>
            </div>
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-center">
              <span className="text-[10px] text-stone-400 block mb-0.5">متوسط تكلفة الطائر</span>
              <span className="text-base font-black text-stone-100">
                {(completedCycles.reduce((s, c) => s + c.costPerLiveBird, 0) / completedCycles.length).toFixed(2)} {currency}
              </span>
            </div>
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-center">
              <span className="text-[10px] text-stone-400 block mb-0.5">متوسط معدل التحويل FCR</span>
              <span className="text-base font-black text-blue-400">
                {(completedCycles.reduce((s, c) => s + c.fcr, 0) / completedCycles.length).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI Insight Callout Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-lg shrink-0">
            🤖
          </div>
          <div>
            <div className="font-bold text-xs text-stone-100">
              {language === 'ar' ? 'المستشار الاقتصادي الذكي لمزارع الدواجن' : 'Conseiller IA Économique'}
            </div>
            <p className="text-[11px] text-stone-400">
              {language === 'ar'
                ? 'تحليل حساسية أسعار الأعلاف، توقع احتياج السيولة، وتحديد أفضل المزارع عائداً.'
                : 'Analyses prédictives, calcul d’impact du prix de l’aliment et gestion des risques.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('ai-advisor')}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold rounded-xl shadow transition"
        >
          {language === 'ar' ? 'استشارة الذكاء الاصطناعي ➔' : 'Consulter l’IA ➔'}
        </button>
      </div>
    </div>
  );
};
