import React from 'react';
import {
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { ChickPurchase } from '../../../types';

interface ChicksDistributionTabProps {
  purchases: ChickPurchase[];
  onNavigate: (tab: string, id?: string) => void;
  onOpenAddPurchase: () => void;
}

export const ChicksDistributionTab: React.FC<ChicksDistributionTabProps> = ({
  purchases,
  onNavigate,
  onOpenAddPurchase
}) => {
  const {
    farms,
    cycles,
    selectedFarmId,
    language
  } = useFarm();

  const filteredPurchases = selectedFarmId === 'all'
    ? purchases
    : purchases.filter(p => p.farmId === selectedFarmId);

  // Group by Farm
  const farmAllocations = farms
    .filter(f => selectedFarmId === 'all' || f.id === selectedFarmId)
    .map(farm => {
      const farmPurchases = filteredPurchases.filter(p => p.farmId === farm.id);
      const farmCycles = cycles.filter(c => c.farmId === farm.id);
      const totalHoused = farmPurchases.reduce((s, p) => s + p.receivedHealthyCount, 0);
      const totalMortality = farmPurchases.reduce((s, p) => s + p.transportMortalityCount, 0);
      const activeCycle = farmCycles.find(c => c.status === 'active');

      return {
        farm,
        purchases: farmPurchases,
        totalHoused,
        totalMortality,
        activeCycle
      };
    });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>توزيع وتسكين الكتاكيت على المزارع والعنابر</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            متابعة استلام وتسكين الأفواج في العنابر ومعدلات نفوق النقل
          </p>
        </div>
        <button
          onClick={onOpenAddPurchase}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <span>تسكين شحنة كتاكيت جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmAllocations.map(({ farm, purchases: farmBatches, totalHoused, totalMortality, activeCycle }) => {
          const mortalityRate = (totalHoused + totalMortality) > 0
            ? ((totalMortality / (totalHoused + totalMortality)) * 100).toFixed(2)
            : '0';

          return (
            <div key={farm.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-100">{farm.name}</h4>
                    <span className="text-[10px] text-stone-400">{farm.location || 'الموقع الرئيسي'}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                  {farmBatches.length} دفعات
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                  <div className="text-[10px] text-stone-400">إجمالي المستلم سليم</div>
                  <div className="text-base font-black text-stone-100 mt-0.5">{totalHoused.toLocaleString()}</div>
                </div>
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                  <div className="text-[10px] text-stone-400">نفوق النقل ({mortalityRate}%)</div>
                  <div className="text-base font-black text-rose-400 mt-0.5">{totalMortality.toLocaleString()}</div>
                </div>
              </div>

              {activeCycle ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block">دورة إنتاجية جارية</span>
                    <span className="text-stone-200 font-bold">{activeCycle.name}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('cycles', activeCycle.id)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <span>عرض</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-950/40 border border-stone-800/60 text-stone-500 text-[11px] text-center">
                  لا توجد دورة تسمين نشطة حالياً بهذه المزرعة
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-stone-400">آخر الأفواج المستلمة:</div>
                {farmBatches.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-stone-950/40 border border-stone-800/50">
                    <div>
                      <span className="font-bold text-stone-200">{b.hangarName || 'عنبر 1'}</span>
                      <span className="text-[10px] text-stone-500 mr-1.5">({b.breed})</span>
                    </div>
                    <div className="font-mono text-stone-300">
                      {b.receivedHealthyCount.toLocaleString()} كتكوت
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
