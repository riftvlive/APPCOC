import React from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Baby,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { ChickPurchase } from '../../../types';

interface ChicksHatcheriesTabProps {
  purchases: ChickPurchase[];
  onSelectSupplierFilter?: (supplierId: string) => void;
  onOpenAddPurchase: () => void;
}

export const ChicksHatcheriesTab: React.FC<ChicksHatcheriesTabProps> = ({
  purchases,
  onSelectSupplierFilter,
  onOpenAddPurchase
}) => {
  const {
    partners,
    currency
  } = useFarm();

  const hatcheries = partners.filter(p => p.type === 'supplier');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>دليل المفارخ وموردي الكتاكيت</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            سجل المفارخ المعتمدة، سجل الشحنات، ومتوسطات الأسعار والديون
          </p>
        </div>
        <button
          onClick={onOpenAddPurchase}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <span>تسجيل شحنة من مفرخة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hatcheries.map(hatchery => {
          const hatcheryBatches = purchases.filter(p => p.supplierId === hatchery.id);
          const totalChicks = hatcheryBatches.reduce((s, p) => s + p.orderedCount, 0);
          const totalInvoiced = hatcheryBatches.reduce((s, p) => s + p.totalAmount, 0);
          const totalPaid = hatcheryBatches.reduce((s, p) => s + p.paidAmount, 0);
          const balanceOwed = hatcheryBatches.reduce((s, p) => s + p.remainingAmount, 0);
          const avgPrice = totalChicks > 0 ? (totalInvoiced / totalChicks).toFixed(2) : '0';

          return (
            <div key={hatchery.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-100">{hatchery.name}</h4>
                      <span className="text-[10px] text-stone-400">{hatchery.contactPerson || 'مفرخة كتاكيت'}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-amber-500/20">
                    {hatcheryBatches.length} شحنات
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-400">
                  {hatchery.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span className="dir-ltr text-right">{hatchery.phone}</span>
                    </div>
                  )}
                  {hatchery.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      <span>{hatchery.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800/80">
                    <div className="text-[10px] text-stone-400">إجمالي الكتاكيت</div>
                    <div className="text-sm font-black text-stone-100">{totalChicks.toLocaleString()}</div>
                  </div>
                  <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800/80">
                    <div className="text-[10px] text-stone-400">متوسط السعر</div>
                    <div className="text-sm font-black text-amber-400">{avgPrice} {currency}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block">رصيد المفرخة المتبقي</span>
                  <span className={`font-black font-mono ${balanceOwed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {balanceOwed.toLocaleString()} {currency}
                  </span>
                </div>
                {onSelectSupplierFilter && (
                  <button
                    onClick={() => onSelectSupplierFilter(hatchery.id)}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <span>عرض الشحنات</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
