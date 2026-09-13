import React from 'react';
import { X, Printer, CheckCircle2, Building2, ShoppingCart } from 'lucide-react';
import { ChickSale } from '../../../types';
import { useFarm } from '../../../context/FarmContext';

interface ChickSaleReceiptModalProps {
  sale: ChickSale | null;
  onClose: () => void;
}

export const ChickSaleReceiptModal: React.FC<ChickSaleReceiptModalProps> = ({ sale, onClose }) => {
  const { currency, farms } = useFarm();
  if (!sale) return null;

  const farm = farms.find(f => f.id === sale.farmId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto print:m-0 print:p-4 print:shadow-none print:max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-stone-900">وصل تسليم وفاتورة بيع كتاكيت</h2>
            <p className="text-xs text-stone-600">Bon de livraison & Facture de vente poussins</p>
          </div>
          <div className="text-left font-mono">
            <div className="text-sm font-black text-amber-700">{sale.invoiceNumber}</div>
            <div className="text-xs text-stone-500">{sale.date}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div>
            <div className="font-bold text-stone-500 mb-1">الجهة البائعة / المزرعة:</div>
            <div className="font-black text-sm text-stone-900">{farm?.name || 'مزارع الدواجن المركزية'}</div>
            <div className="text-stone-600">{farm?.location || 'المغرب'}</div>
          </div>
          <div>
            <div className="font-bold text-stone-500 mb-1">الزبون / المشتري:</div>
            <div className="font-black text-sm text-stone-900">{sale.customerName || 'زبون معتمد'}</div>
            <div className="text-stone-600">هاتف: {sale.driverPhone || '—'}</div>
          </div>
        </div>

        {/* Details Table */}
        <table className="w-full text-right text-xs border border-stone-300">
          <thead className="bg-stone-100 font-bold border-b border-stone-300">
            <tr>
              <th className="p-2.5">البيان</th>
              <th className="p-2.5">السلالة</th>
              <th className="p-2.5">الكمية</th>
              <th className="p-2.5">البونص</th>
              <th className="p-2.5">السعر الفردي</th>
              <th className="p-2.5">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 font-medium">
            <tr>
              <td className="p-2.5 font-bold">كتاكيت لحم عمر يوم</td>
              <td className="p-2.5">{sale.breed}</td>
              <td className="p-2.5 font-bold font-mono">{sale.quantity.toLocaleString()}</td>
              <td className="p-2.5 text-emerald-700 font-mono">+{sale.bonusCount || 0}</td>
              <td className="p-2.5 font-mono">{sale.unitPrice.toFixed(2)} {currency}</td>
              <td className="p-2.5 font-black font-mono">{sale.totalAmount.toLocaleString()} {currency}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Breakdown */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs font-semibold">
          <div className="flex justify-between">
            <span className="text-stone-600">المجموع الكلي:</span>
            <span className="font-mono font-black text-sm">{sale.totalAmount.toLocaleString()} {currency}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>المدفوع نقداً / بنك:</span>
            <span className="font-mono font-bold">{sale.paidAmount.toLocaleString()} {currency}</span>
          </div>
          <div className="flex justify-between border-t border-stone-300 pt-1.5 text-stone-900">
            <span>الرصيد المتبقي ذمة:</span>
            <span className={`font-mono font-black text-sm ${sale.remainingAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {sale.remainingAmount.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Transport & Notes */}
        {(sale.truckPlate || sale.driverName || sale.notes) && (
          <div className="text-xs text-stone-600 border border-stone-200 rounded-xl p-3 bg-stone-50/50">
            {sale.truckPlate && <div>الشاحنة الناقلة: {sale.truckPlate} | السائق: {sale.driverName || '—'}</div>}
            {sale.notes && <div className="mt-1 text-stone-500">ملاحظات: {sale.notes}</div>}
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-center">
          <div className="border-t border-stone-400 pt-2">
            <div className="font-bold text-stone-700">توقيع وخاتم الإدارة</div>
          </div>
          <div className="border-t border-stone-400 pt-2">
            <div className="font-bold text-stone-700">توقيع المستلم / الزبون</div>
          </div>
        </div>

        {/* Action buttons (hidden on print) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold"
          >
            إغلاق
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوصل</span>
          </button>
        </div>
      </div>
    </div>
  );
};
