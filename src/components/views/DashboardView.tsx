import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Scale,
  Users2,
  Wheat,
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
  PieChart as PieIcon
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface DashboardViewProps {
  onNavigate: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    farms,
    cycles,
    allCycleSummaries,
    totalLiquidity,
    partnerBalances,
    totalActiveBirds,
    todaySales,
    todayExpenses,
    todayCollections,
    todayPayments,
    currency,
    language,
    selectedFarmId
  } = useFarm();

  // Filter summaries if a farm is selected
  const filteredSummaries = selectedFarmId === 'all'
    ? allCycleSummaries
    : allCycleSummaries.filter(c => {
        const cycle = cycles.find(cy => cy.id === c.cycleId);
        return cycle?.farmId === selectedFarmId;
      });

  const activeCycles = filteredSummaries.filter(c => c.status !== 'completed');
  const completedCycles = filteredSummaries.filter(c => c.status === 'completed');

  // Overall Financial Totals
  const totalRevenueAll = filteredSummaries.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalCostAll = filteredSummaries.reduce((sum, c) => sum + c.totalCycleCost, 0);
  const netProfitAll = totalRevenueAll - totalCostAll;

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Quick Welcome & 10-Second Executive Status Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐔</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-100">
                {language === 'ar' ? 'لوحة القيادة والمتابعة اللحظية' : 'Tableau de Bord Exécutif'}
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {language === 'ar'
                ? `متابعة شاملة لـ ${farms.length} مزارع • ${activeCycles.length} دورات نشطة حالياً تضم ${totalActiveBirds.toLocaleString()} طائر`
                : `${farms.length} fermes • ${activeCycles.length} bandes actives (${totalActiveBirds.toLocaleString()} volailles)`}
            </p>
          </div>

          {/* Quick Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onOpenQuickAction('sale')}
              className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{language === 'ar' ? '+ بيع دجاج' : '+ Vente'}</span>
            </button>

            <button
              onClick={() => onOpenQuickAction('expense')}
              className="flex-1 sm:flex-none px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? '+ مصروف' : '+ Dépense'}</span>
            </button>

            <button
              onClick={() => onOpenQuickAction('feed')}
              className="flex-1 sm:flex-none px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow transition"
            >
              <Wheat className="w-4 h-4" />
              <span>{language === 'ar' ? '+ شراء علف' : '+ Aliment'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Flash Operations Bar (اليوم في المزرعة) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? 'مبيعات اليوم' : 'Ventes du jour'}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {todaySales.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? 'مصاريف وعلف اليوم' : 'Dépenses du jour'}
            </span>
            <span className="text-base sm:text-lg font-black text-rose-400">
              {todayExpenses.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? 'تحصيلات نقدية اليوم' : 'Encaissements'}
            </span>
            <span className="text-base sm:text-lg font-black text-teal-300">
              {todayCollections.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-300 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {language === 'ar' ? 'مدفوعات اليوم' : 'Décaissements'}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300">
              {todayPayments.toLocaleString()} {currency}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Executive Financial Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      </div>

      {/* 4. Active Poultry Cycles (Real-time Operations) */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                        {(cycle.totalFeedKg / 1000).toFixed(1)} طن
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{language === 'ar' ? 'التكلفة حتى الآن' : 'Coût cumulé'}</span>
                      <span className="text-xs font-bold text-stone-100">
                        {cycle.totalCycleCost.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>

                  {/* Cycle Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenQuickAction('mortality')}
                      className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold border border-stone-700 transition"
                    >
                      + نافق اليوم
                    </button>
                    <button
                      onClick={() => onOpenQuickAction('weight')}
                      className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold border border-stone-700 transition"
                    >
                      + وزن العينة
                    </button>
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
      {completedCycles.length > 0 && (
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
              <span className="text-[10px] text-stone-400 block mb-0.5">صافي الأرباح المحققة</span>
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
