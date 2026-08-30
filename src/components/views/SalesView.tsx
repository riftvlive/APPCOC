import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Printer,
  DollarSign,
  TrendingUp,
  Scale,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { WholesaleSale } from '../../types';

interface SalesViewProps {
  onOpenQuickAction: (action?: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onOpenQuickAction }) => {
  const {
    sales,
    partners,
    cycles,
    farms,
    accounts,
    currency,
    language,
    selectedFarmId,
    addSettlementTransaction
  } = useFarm();

  const [selectedInvoice, setSelectedInvoice] = useState<WholesaleSale | null>(null);
  const [collectModalSale, setCollectModalSale] = useState<WholesaleSale | null>(null);
  const [collectAmount, setCollectAmount] = useState<number | ''>('');
  const [collectAccountId, setCollectAccountId] = useState(accounts[0]?.id || '');

  const filteredSales = selectedFarmId === 'all'
    ? sales
    : sales.filter(s => s.farmId === selectedFarmId);

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.netTotal, 0);
  const totalWeightSold = filteredSales.reduce((sum, s) => sum + s.totalWeightKg, 0);
  const totalBirdsSold = filteredSales.reduce((sum, s) => sum + s.chickenCount, 0);
  const totalPaidRevenue = filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalUnpaidReceivables = filteredSales.reduce((sum, s) => sum + s.remainingAmount, 0);

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalSale || !collectAmount) return;

    addSettlementTransaction({
      partnerId: collectModalSale.customerId,
      amount: Number(collectAmount),
      type: 'customer_payment',
      accountId: collectAccountId,
      description: `تحصيل دفعة لفاتورة البيع ${collectModalSale.invoiceNumber}`,
      paymentMethod: 'cash'
    });

    setCollectModalSale(null);
    setCollectAmount('');
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'سجل مبيعات الدجاج بالجملة والفواتير' : 'Ventes en Gros & Facturation'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'توثيق شاحنات البيع، الأوزان الصافية، تسعير الكيلوغرام، والتحصيلات النقدية والآجلة'
              : 'Pesées par camion, prix au kg, encaissements et factures clients'}
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAction('sale')}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'ar' ? '+ تسجيل بيعة جديدة' : '+ Nouvelle Vente'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">إجمالي قيمة المبيعات</span>
          <div className="text-lg sm:text-xl font-black text-emerald-400">
            {totalSalesRevenue.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">المبالغ المقبوضة فعلياً</span>
          <div className="text-lg sm:text-xl font-black text-teal-300">
            {totalPaidRevenue.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">المتبقي عند الزبناء (آجل)</span>
          <div className="text-lg sm:text-xl font-black text-rose-400">
            {totalUnpaidReceivables.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">إجمالي الوزن المسوق</span>
          <div className="text-lg sm:text-xl font-black text-amber-300">
            {(totalWeightSold / 1000).toFixed(1)} <span className="text-xs font-semibold text-stone-400">طن ({totalBirdsSold.toLocaleString()} طائر)</span>
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                <th className="pb-3 font-bold">الفاتورة / التاريخ</th>
                <th className="pb-3 font-bold">الزبون (المشتري)</th>
                <th className="pb-3 font-bold">المزرعة / الدورة</th>
                <th className="pb-3 font-bold">عدد الدجاج والوزن</th>
                <th className="pb-3 font-bold">سعر الكيلو</th>
                <th className="pb-3 font-bold">المبلغ الإجمالي</th>
                <th className="pb-3 font-bold">المقبوض والمتبقي</th>
                <th className="pb-3 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500">
                    لا توجد فواتير مبيعات مسجلة.
                  </td>
                </tr>
              ) : (
                filteredSales.map(s => {
                  const customer = partners.find(p => p.id === s.customerId);
                  const farm = farms.find(f => f.id === s.farmId);
                  const cycle = cycles.find(c => c.id === s.cycleId);

                  return (
                    <tr key={s.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3">
                        <span className="font-bold text-stone-200 block">{s.invoiceNumber}</span>
                        <span className="text-[10px] text-stone-500">{s.date}</span>
                      </td>
                      <td className="py-3 font-semibold text-stone-300">
                        {customer?.name || 'زبون عام'}
                        {s.truckPlate && (
                          <span className="text-[10px] text-stone-500 block">شاحنة: {s.truckPlate}</span>
                        )}
                      </td>
                      <td className="py-3 text-[11px] text-stone-400">
                        {farm?.name}
                        {cycle && <span className="block text-amber-400/80 font-bold">{cycle.cycleNumber}</span>}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-stone-100 block">{s.totalWeightKg.toLocaleString()} كغ</span>
                        <span className="text-[10px] text-stone-400">{s.chickenCount.toLocaleString()} طائر (متوسط {s.averageWeightKg} كغ)</span>
                      </td>
                      <td className="py-3 font-bold text-amber-400">
                        {s.pricePerKg.toFixed(2)} {currency}
                      </td>
                      <td className="py-3 font-black text-emerald-400 text-sm">
                        {s.netTotal.toLocaleString()} {currency}
                      </td>
                      <td className="py-3">
                        <span className="text-teal-300 font-bold block">{s.paidAmount.toLocaleString()} {currency}</span>
                        {s.remainingAmount > 0 ? (
                          <span className="text-rose-400 text-[10px] font-bold block">متبقي: {s.remainingAmount.toLocaleString()} {currency}</span>
                        ) : (
                          <span className="text-emerald-500 text-[10px] font-bold block">مدفوع بالكامل ✓</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(s)}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition"
                            title="معاينة وطباعة الفاتورة"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {s.remainingAmount > 0 && (
                            <button
                              onClick={() => {
                                setCollectModalSale(s);
                                setCollectAmount(s.remainingAmount);
                              }}
                              className="px-2 py-1 bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 rounded-lg text-[10px] font-bold transition"
                            >
                              تحصيل
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Print & View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
          <div className="relative w-full max-w-lg bg-white text-stone-900 border border-stone-300 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-4 font-sans">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-stone-900">فاتورة بيع دجاج بالجملة</h3>
                <p className="text-xs text-stone-500 font-semibold">رقم الفاتورة: {selectedInvoice.invoiceNumber}</p>
                <p className="text-xs text-stone-500">التاريخ: {selectedInvoice.date}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border">
                <span className="text-stone-500 block mb-1 font-bold">بيانات المشتري (الزبون):</span>
                <span className="font-extrabold text-sm block">
                  {partners.find(p => p.id === selectedInvoice.customerId)?.name}
                </span>
                <span className="text-stone-600 block">
                  {partners.find(p => p.id === selectedInvoice.customerId)?.phone}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border">
                <span className="text-stone-500 block mb-1 font-bold">بيانات المزرعة والشاحنة:</span>
                <span className="font-bold block">
                  {farms.find(f => f.id === selectedInvoice.farmId)?.name}
                </span>
                <span className="text-stone-600 block">
                  رقم الشاحنة: {selectedInvoice.truckPlate || 'غير محدد'}
                </span>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th className="p-2.5">البيان</th>
                    <th className="p-2.5">العدد</th>
                    <th className="p-2.5">الوزن الصافي (كغ)</th>
                    <th className="p-2.5">سعر الكيلو</th>
                    <th className="p-2.5">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-stone-800 font-semibold">
                  <tr>
                    <td className="p-2.5">دجاج لحم حي ممتاز</td>
                    <td className="p-2.5">{selectedInvoice.chickenCount.toLocaleString()}</td>
                    <td className="p-2.5 font-bold">{selectedInvoice.totalWeightKg.toLocaleString()} كغ</td>
                    <td className="p-2.5">{selectedInvoice.pricePerKg.toFixed(2)} {currency}</td>
                    <td className="p-2.5 font-black text-stone-900">{selectedInvoice.grossTotal.toLocaleString()} {currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-600">المبلغ الإجمالي الصافي:</span>
                <span className="font-black text-sm text-stone-900">{selectedInvoice.netTotal.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>المبلغ المقبوض:</span>
                <span>{selectedInvoice.paidAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold border-t pt-1">
                <span>المبلغ المتبقي بذمة الزبون:</span>
                <span>{selectedInvoice.remainingAmount.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Modal */}
      {collectModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setCollectModalSale(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">تحصيل دفعة للفاتورة {collectModalSale.invoiceNumber}</h3>
              <button onClick={() => setCollectModalSale(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">المبلغ المحصل ({currency})</label>
                <input
                  type="number"
                  required
                  value={collectAmount}
                  onChange={e => setCollectAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">إيداع في حساب</label>
                <select
                  value={collectAccountId}
                  onChange={e => setCollectAccountId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl shadow-md transition"
              >
                تأكيد التحصيل
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
