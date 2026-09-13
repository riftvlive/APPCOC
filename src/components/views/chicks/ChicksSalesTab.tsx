import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Truck,
  Users2,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { ChickSale } from '../../../types';

interface ChicksSalesTabProps {
  sales: ChickSale[];
  onOpenAddSale: () => void;
  onEditSale: (sale: ChickSale) => void;
  onPrintSaleReceipt: (sale: ChickSale) => void;
}

export const ChicksSalesTab: React.FC<ChicksSalesTabProps> = ({
  sales,
  onOpenAddSale,
  onEditSale,
  onPrintSaleReceipt
}) => {
  const {
    partners,
    farms,
    currency,
    deleteChickSale,
    selectedFarmId,
    language
  } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');

  const customers = useMemo(() => partners.filter(p => p.type === 'customer'), [partners]);

  const filteredSales = useMemo(() => {
    return (sales || []).filter(s => {
      if (selectedFarmId !== 'all' && s.farmId && s.farmId !== selectedFarmId) return false;
      if (selectedCustomerId !== 'all' && s.customerId !== selectedCustomerId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const custName = (s.customerName || partners.find(p => p.id === s.customerId)?.name || '').toLowerCase();
        const inv = s.invoiceNumber.toLowerCase();
        const brd = s.breed.toLowerCase();
        const trk = (s.truckPlate || '').toLowerCase();
        const drv = (s.driverName || '').toLowerCase();
        if (!custName.includes(q) && !inv.includes(q) && !brd.includes(q) && !trk.includes(q) && !drv.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, selectedFarmId, selectedCustomerId, searchQuery, partners]);

  const totalQuantity = filteredSales.reduce((s, item) => s + item.quantity, 0);
  const totalAmount = filteredSales.reduce((s, item) => s + item.totalAmount, 0);
  const totalPaid = filteredSales.reduce((s, item) => s + item.paidAmount, 0);
  const totalRemaining = filteredSales.reduce((s, item) => s + item.remainingAmount, 0);

  const handleDelete = (id: string, invoice: string) => {
    if (confirm(`هل أنت متأكد من حذف فاتورة بيع الكتاكيت ${invoice}؟ سيتم إلغاء القيود المرتبطة بها.`)) {
      deleteChickSale(id);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالفاتورة، الزبون، السلالة، الشاحنة..."
              className="w-full pl-3 pr-9 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">كل الزبائن</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenAddSale}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>بيع كتاكيت للزبائن</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
          <div className="text-[11px] text-stone-400">إجمالي المبيعات</div>
          <div className="text-lg font-black text-stone-100">{totalQuantity.toLocaleString()} كتكوت</div>
        </div>
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
          <div className="text-[11px] text-stone-400">قيمة الفواتير</div>
          <div className="text-lg font-black text-amber-400">{totalAmount.toLocaleString()} {currency}</div>
        </div>
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
          <div className="text-[11px] text-stone-400">المدفوع نقداً/بنك</div>
          <div className="text-lg font-black text-emerald-400">{totalPaid.toLocaleString()} {currency}</div>
        </div>
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
          <div className="text-[11px] text-stone-400">المتبقي (ديون زبائن)</div>
          <div className="text-lg font-black text-rose-400">{totalRemaining.toLocaleString()} {currency}</div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 text-[11px] font-bold border-b border-stone-800">
              <tr>
                <th className="p-3">الفاتورة / التاريخ</th>
                <th className="p-3">الزبون</th>
                <th className="p-3">المزرعة المصدر</th>
                <th className="p-3">السلالة</th>
                <th className="p-3">العدد (+بونص)</th>
                <th className="p-3">سعر البيع</th>
                <th className="p-3">المجموع</th>
                <th className="p-3">المسدد / الباقي</th>
                <th className="p-3">الشاحنة والسائق</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-stone-500">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>لا توجد مبيعات كتاكيت مسجلة</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const farm = farms.find(f => f.id === sale.farmId);
                  return (
                    <tr key={sale.id} className="hover:bg-stone-800/40 transition">
                      <td className="p-3">
                        <div className="font-bold font-mono text-stone-100">{sale.invoiceNumber}</div>
                        <div className="text-[10px] text-stone-500">{sale.date}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-stone-200">{sale.customerName || 'زبون'}</div>
                      </td>
                      <td className="p-3 text-stone-300">
                        {sale.farmId === 'central' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                            🏢 المخزن العام
                          </span>
                        ) : (
                          farm?.name || 'مزرعة عامة'
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 text-[11px]">
                          {sale.breed}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-stone-100">{sale.quantity.toLocaleString()}</div>
                        {sale.bonusCount > 0 && (
                          <div className="text-[10px] text-emerald-400">+{sale.bonusCount} بونص</div>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {sale.unitPrice.toFixed(2)} {currency}
                      </td>
                      <td className="p-3 font-bold font-mono text-stone-100">
                        {sale.totalAmount.toLocaleString()} {currency}
                      </td>
                      <td className="p-3">
                        <div className="text-emerald-400 font-mono">{sale.paidAmount.toLocaleString()}</div>
                        {sale.remainingAmount > 0 ? (
                          <div className="text-rose-400 text-[10px] font-bold">باقي: {sale.remainingAmount.toLocaleString()}</div>
                        ) : (
                          <div className="text-emerald-500 text-[10px]">خالص بالكامل ✓</div>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-stone-400">
                        {sale.truckPlate && <div>🚚 {sale.truckPlate}</div>}
                        {sale.driverName && <div>👤 {sale.driverName}</div>}
                        {!sale.truckPlate && !sale.driverName && <span className="text-stone-600">—</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPrintSaleReceipt(sale)}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg transition"
                            title="طباعة وصل وفاتورة البيع"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditSale(sale)}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition"
                            title="تعديل الفاتورة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id, sale.invoiceNumber)}
                            className="p-1.5 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
