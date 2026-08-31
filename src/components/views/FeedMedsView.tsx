import React, { useState } from 'react';
import {
  Wheat,
  Pill,
  Plus,
  Calendar,
  DollarSign,
  TrendingDown,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface FeedMedsViewProps {
  onOpenQuickAction: (action?: string) => void;
}

export const FeedMedsView: React.FC<FeedMedsViewProps> = ({ onOpenQuickAction }) => {
  const {
    feedPurchases,
    medicationPurchases,
    partners,
    cycles,
    farms,
    currency,
    language,
    selectedFarmId
  } = useFarm();

  const [activeTab, setActiveTab] = useState<'feed' | 'meds'>('feed');

  const filteredFeeds = selectedFarmId === 'all'
    ? feedPurchases
    : feedPurchases.filter(f => f.farmId === selectedFarmId);

  const filteredMeds = selectedFarmId === 'all'
    ? medicationPurchases
    : medicationPurchases.filter(m => m.farmId === selectedFarmId);

  const totalFeedKg = filteredFeeds.reduce((sum, f) => sum + f.quantityKg, 0);
  const totalFeedCost = filteredFeeds.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalMedCost = filteredMeds.reduce((sum, m) => sum + m.totalAmount, 0);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'إدارة الأعلاف والأدوية واللقاحات' : 'Gestion des Aliments & Santé'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'متابعة مشتريات الأعلاف المركبة، كلفة الطن، استهلاك العنابر، والأدوية البيطرية'
              : 'Achats d’aliments, vaccins, antibiotiques et suivi des stocks'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="طباعة تقرير المشتريات والمخزون"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('feed')}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ شراء علف</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('med')}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ شراء دواء</span>
          </button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="print-only border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">
              تقرير مشتريات واستهلاك الأعلاف والأدوية البيطرية
            </h1>
            <p className="text-xs text-stone-600">
              نظام إدارة مزارع الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')} - {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold">
            <div>إجمالي كمية العلف: {(totalFeedKg / 1000).toFixed(1)} طن ({totalFeedCost.toLocaleString()} {currency})</div>
            <div>إجمالي الأدوية واللقاحات: {totalMedCost.toLocaleString()} {currency}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <Wheat className="w-4 h-4 text-amber-400" />
            <span>إجمالي كمية العلف المشتراة</span>
          </div>
          <div className="text-xl font-black text-amber-300">
            {(totalFeedKg / 1000).toFixed(1)} <span className="text-xs font-semibold text-stone-400">طن ({Math.round(totalFeedKg / 50)} كيس)</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>إجمالي تكلفة العلف</span>
          </div>
          <div className="text-xl font-black text-stone-100">
            {totalFeedCost.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-semibold">
            <Pill className="w-4 h-4 text-indigo-400" />
            <span>إجمالي تكلفة الأدوية واللقاحات</span>
          </div>
          <div className="text-xl font-black text-indigo-300">
            {totalMedCost.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'feed'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>سجل مشتريات الأعلاف ({filteredFeeds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('meds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'meds'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>سجل الأدوية والتحصينات ({filteredMeds.length})</span>
        </button>
      </div>

      {/* Tab 1: Feed Purchases List */}
      {activeTab === 'feed' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                  <th className="pb-3 font-bold">الفاتورة / التاريخ</th>
                  <th className="pb-3 font-bold">المورد / الشركة</th>
                  <th className="pb-3 font-bold">النوع والصنف</th>
                  <th className="pb-3 font-bold">الكمية (كغ / أكياس)</th>
                  <th className="pb-3 font-bold">سعر الكيلو</th>
                  <th className="pb-3 font-bold">المبلغ الإجمالي</th>
                  <th className="pb-3 font-bold">المدفوع والمتبقي</th>
                  <th className="pb-3 font-bold">المزرعة / الدورة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredFeeds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-500">
                      لا توجد فواتير أعلاف مسجلة.
                    </td>
                  </tr>
                ) : (
                  filteredFeeds.map(f => {
                    const supplier = partners.find(p => p.id === f.supplierId);
                    const farm = farms.find(fm => fm.id === f.farmId);
                    const cycle = cycles.find(c => c.id === f.cycleId);

                    return (
                      <tr key={f.id} className="hover:bg-stone-800/40 transition">
                        <td className="py-3">
                          <span className="font-bold text-stone-200 block">{f.invoiceNumber}</span>
                          <span className="text-[10px] text-stone-500">{f.date}</span>
                        </td>
                        <td className="py-3 font-semibold text-stone-300">
                          {supplier?.name || 'مورد غير محدد'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.feedType === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                            f.feedType === 'grower' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {f.feedType === 'starter' ? 'بادي (Starter)' : f.feedType === 'grower' ? 'نامي (Grower)' : 'ناهي (Finisher)'}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">{f.brand}</span>
                        </td>
                        <td className="py-3 font-bold text-stone-100">
                          {f.quantityKg.toLocaleString()} كغ
                          <span className="text-[10px] text-stone-400 block font-normal">{f.bagsCount} كيس 50كغ</span>
                        </td>
                        <td className="py-3 text-amber-400 font-bold">
                          {f.unitPricePerKg.toFixed(2)} {currency}
                        </td>
                        <td className="py-3 font-black text-stone-100">
                          {f.totalAmount.toLocaleString()} {currency}
                        </td>
                        <td className="py-3">
                          <span className="text-emerald-400 font-bold block">{f.paidAmount.toLocaleString()} {currency}</span>
                          {f.remainingAmount > 0 && (
                            <span className="text-rose-400 text-[10px] font-semibold block">متبقي: {f.remainingAmount.toLocaleString()} {currency}</span>
                          )}
                        </td>
                        <td className="py-3 text-[11px] text-stone-400">
                          {farm?.name || ''}
                          {cycle && <span className="block text-amber-400/80 font-bold">{cycle.cycleNumber}</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Medications List */}
      {activeTab === 'meds' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                  <th className="pb-3 font-bold">التاريخ</th>
                  <th className="pb-3 font-bold">اسم الدواء / اللقاح</th>
                  <th className="pb-3 font-bold">التصنيف</th>
                  <th className="pb-3 font-bold">المورد البيطري</th>
                  <th className="pb-3 font-bold">المبلغ الإجمالي</th>
                  <th className="pb-3 font-bold">حالة الدفع</th>
                  <th className="pb-3 font-bold">المزرعة / الدورة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredMeds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      لا توجد مشتريات أدوية مسجلة.
                    </td>
                  </tr>
                ) : (
                  filteredMeds.map(m => {
                    const supplier = partners.find(p => p.id === m.supplierId);
                    const farm = farms.find(fm => fm.id === m.farmId);
                    const cycle = cycles.find(c => c.id === m.cycleId);

                    return (
                      <tr key={m.id} className="hover:bg-stone-800/40 transition">
                        <td className="py-3 text-stone-400 font-semibold">{m.date}</td>
                        <td className="py-3 font-extrabold text-stone-100">{m.medicationName}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {m.category === 'vaccine' ? 'لقاح وتحصين' :
                             m.category === 'antibiotic' ? 'مضاد حيوي' :
                             m.category === 'vitamin' ? 'فيتامينات ومكملات' : 'مطهر ومعقم'}
                          </span>
                        </td>
                        <td className="py-3 text-stone-300 font-medium">{supplier?.name || '-'}</td>
                        <td className="py-3 font-black text-amber-300">{m.totalAmount.toLocaleString()} {currency}</td>
                        <td className="py-3">
                          <span className="text-emerald-400 font-bold block">{m.paidAmount.toLocaleString()} {currency}</span>
                          {m.remainingAmount > 0 && (
                            <span className="text-rose-400 text-[10px] font-semibold">متبقي: {m.remainingAmount.toLocaleString()} {currency}</span>
                          )}
                        </td>
                        <td className="py-3 text-[11px] text-stone-400">
                          {farm?.name || ''}
                          {cycle && <span className="block text-amber-400/80 font-bold">{cycle.cycleNumber}</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Official Print Footer */}
      <div className="print-only pt-8 mt-6 border-t-2 border-stone-300">
        <div className="flex items-center justify-between text-xs text-stone-700">
          <div>
            <span className="font-bold block">أمين المخزن والتموين:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">مصادقة الإدارة العامة:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
