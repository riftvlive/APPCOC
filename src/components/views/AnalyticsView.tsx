import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Scale,
  Award,
  DollarSign,
  Activity,
  Flame,
  Wheat,
  Percent,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const AnalyticsView: React.FC = () => {
  const {
    farms,
    cycles,
    allCycleSummaries,
    currency,
    language
  } = useFarm();

  const [selectedBreedFilter, setSelectedBreedFilter] = useState<'all' | 'Ross 308' | 'Cobb 500' | 'Hubbard'>('all');

  const filteredSummaries = selectedBreedFilter === 'all'
    ? allCycleSummaries
    : allCycleSummaries.filter(s => {
        const cycle = cycles.find(c => c.id === s.cycleId);
        return cycle?.chickBreed === selectedBreedFilter;
      });

  const avgFCR = filteredSummaries.length > 0
    ? filteredSummaries.reduce((sum, s) => sum + (s.fcr > 0 ? s.fcr : 0), 0) / (filteredSummaries.filter(s => s.fcr > 0).length || 1)
    : 0;

  const avgCostPerKg = filteredSummaries.length > 0
    ? filteredSummaries.reduce((sum, s) => sum + s.costPerKg, 0) / filteredSummaries.length
    : 0;

  const avgMortality = filteredSummaries.length > 0
    ? filteredSummaries.reduce((sum, s) => sum + s.mortalityRatePercent, 0) / filteredSummaries.length
    : 0;

  const totalAllProfit = filteredSummaries.reduce((sum, s) => sum + s.netProfit, 0);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'التحليلات الاقتصادية والمؤشرات الفنية (KPIs)' : 'Analytique & Performances'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'مقارنة أداء المزارع، مؤشر الكفاءة الأوروبي (EPEF)، معامل التحويل الغذائي (FCR)، وتكلفة الكيلوغرام'
              : 'Indices zootechniques, EPEF, benchmarks par souche et par ferme'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Breed filter */}
          <div className="flex items-center gap-1.5 bg-stone-950/60 p-1 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 px-2 font-bold">السلالة:</span>
            {(['all', 'Ross 308', 'Cobb 500', 'Hubbard'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBreedFilter(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  selectedBreedFilter === b
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {b === 'all' ? 'الكل' : b}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
            title="طباعة التقرير الفني والإنتاجي"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>طباعة التقرير الفني</span>
          </button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="print-only border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">تقرير المؤشرات الفنية والإنتاجية ومقارنة السلالات</h1>
            <p className="text-xs text-stone-600">
              نظام إدارة مزارع الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')} - {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold">
            <div>فلتر السلالة: {selectedBreedFilter === 'all' ? 'جميع السلالات' : selectedBreedFilter}</div>
            <div>العملة: {currency}</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <Wheat className="w-4 h-4 text-amber-400" />
            <span>متوسط معامل التحويل (FCR)</span>
          </div>
          <div className="text-xl font-black text-amber-300">
            {avgFCR.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-400 block mt-0.5">المعدل القياسي الممتاز: 1.55 - 1.65</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>متوسط تكلفة الكيلوغرام الحي</span>
          </div>
          <div className="text-xl font-black text-stone-100">
            {avgCostPerKg.toFixed(2)} <span className="text-xs font-semibold text-stone-400">{currency}/كغ</span>
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">شامل الكتكوت، العلف، الدواء، واليد العاملة</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <Percent className="w-4 h-4 text-rose-400" />
            <span>متوسط نسبة النفوق الكلية</span>
          </div>
          <div className="text-xl font-black text-stone-100">
            {avgMortality.toFixed(1)}%
          </div>
          <span className="text-[10px] text-emerald-400 block mt-0.5">ضمن الحدود المقبولة (&lt; 5%)</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>إجمالي الأرباح الصافية المحققة</span>
          </div>
          <div className={`text-xl font-black ${totalAllProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalAllProfit.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">عبر {filteredSummaries.length} دورات مسجلة</span>
        </div>
      </div>

      {/* Cycle Performance Comparison Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-3">
          <h3 className="text-xs font-extrabold text-stone-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>جدول المقارنة الفنية والمالية بين الدورات</span>
          </h3>
          <span className="text-xs text-stone-400">مرتب حسب تاريخ البدء</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                <th className="pb-2.5 font-bold">الدورة والمزرعة</th>
                <th className="pb-2.5 font-bold">السلالة</th>
                <th className="pb-2.5 font-bold">المدة</th>
                <th className="pb-2.5 font-bold">العدد الأولي</th>
                <th className="pb-2.5 font-bold">النفوق %</th>
                <th className="pb-2.5 font-bold">FCR التحويل</th>
                <th className="pb-2.5 font-bold">مؤشر EPEF الأوروبي</th>
                <th className="pb-2.5 font-bold">تكلفة الكغ</th>
                <th className="pb-2.5 font-bold">سعر البيع/كغ</th>
                <th className="pb-2.5 font-bold">صافي الربح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredSummaries.map(s => {
                const cy = cycles.find(c => c.id === s.cycleId);
                const liveability = 100 - s.mortalityRatePercent;
                const avgWeightKg = s.totalSoldChicks > 0 ? s.totalWeightSoldKg / s.totalSoldChicks : 2.2;
                // EPEF = (Liveability % * Live weight kg) / (Age days * FCR) * 100
                const epef = s.durationDays > 0 && s.fcr > 0
                  ? Math.round((liveability * avgWeightKg) / (s.durationDays * s.fcr) * 100)
                  : 0;

                return (
                  <tr key={s.cycleId} className="hover:bg-stone-800/40 transition">
                    <td className="py-3">
                      <span className="font-extrabold text-amber-300 block">{s.cycleNumber}</span>
                      <span className="text-[10px] text-stone-400">{s.farmName}</span>
                    </td>
                    <td className="py-3 text-stone-300 font-semibold">{cy?.chickBreed || 'Ross 308'}</td>
                    <td className="py-3 text-stone-300">{s.durationDays} يوم</td>
                    <td className="py-3 font-semibold text-stone-200">{cy?.initialChickCount.toLocaleString()}</td>
                    <td className={`py-3 font-bold ${s.mortalityRatePercent > 5 ? 'text-rose-400' : 'text-stone-300'}`}>
                      {s.mortalityRatePercent.toFixed(1)}%
                    </td>
                    <td className="py-3 font-black text-amber-400">
                      {s.fcr > 0 ? s.fcr.toFixed(2) : '--'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                        epef >= 350 ? 'bg-emerald-500/20 text-emerald-300' :
                        epef >= 300 ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-300'
                      }`}>
                        {epef > 0 ? epef : '--'}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-stone-200">{s.costPerKg.toFixed(2)} {currency}</td>
                    <td className="py-3 font-bold text-emerald-400">{s.averageSellingPricePerKg.toFixed(2)} {currency}</td>
                    <td className={`py-3 font-black ${s.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.netProfit.toLocaleString()} {currency}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zootechnical Benchmarks Reference */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-stone-300 mb-2">دليل المعايير الفنية الدولية لتربية دجاج اللحم</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-850">
            <span className="font-bold text-amber-400 block mb-1">معامل التحويل (FCR):</span>
            <p className="text-stone-400 text-[11px]">
              كمية العلف المستهلكة (كغ) لإنتاج 1 كغ لحم. النطاق المثالي للدورة 42 يوماً هو بين 1.55 و 1.65.
            </p>
          </div>

          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-850">
            <span className="font-bold text-emerald-400 block mb-1">مؤشر الكفاءة الأوروبي (EPEF):</span>
            <p className="text-stone-400 text-[11px]">
              مؤشر شامل يجمع بين نسبة البقاء على قيد الحياة، الوزن المحقق، ومدة الدورة وFCR. المعدل الممتاز يتجاوز 350 نقطة.
            </p>
          </div>

          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-850">
            <span className="font-bold text-purple-400 block mb-1">هيكل التكاليف النموذجي:</span>
            <p className="text-stone-400 text-[11px]">
              يمثل العلف 60-65% من كلفة الدجاجة، الكتاكيت 18-22%، والبيطرة والطاقة والعمالة 15-20%.
            </p>
          </div>
        </div>
      </div>
      {/* Official Print Footer */}
      <div className="print-only pt-8 mt-6 border-t-2 border-stone-300">
        <div className="flex items-center justify-between text-xs text-stone-700">
          <div>
            <span className="font-bold block">المشرف الفني / المهندس الزراعي:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">اعتماد مدير الإنتاج والختم:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
