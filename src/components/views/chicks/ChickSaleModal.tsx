import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { ChickSale, PaymentMethod } from '../../../types';

interface ChickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSale: ChickSale | null;
  onSave: (saleData: Omit<ChickSale, 'id' | 'createdAt'>) => void;
}

export const ChickSaleModal: React.FC<ChickSaleModalProps> = ({
  isOpen,
  onClose,
  editingSale,
  onSave
}) => {
  const { partners, farms, accounts, currency, selectedFarmId } = useFarm();

  const customers = useMemo(() => partners.filter(p => p.type === 'customer'), [partners]);

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [farmId, setFarmId] = useState('');
  const [breed, setBreed] = useState('Cobb 500');
  const [quantity, setQuantity] = useState<number | ''>(5000);
  const [bonusCount, setBonusCount] = useState<number | ''>(100);
  const [unitPrice, setUnitPrice] = useState<number | ''>(6.5);
  const [costUnitPrice, setCostUnitPrice] = useState<number | ''>(5.6);
  const [paidAmount, setPaidAmount] = useState<number | ''>(32500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [accountId, setAccountId] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingSale) {
      setDate(editingSale.date);
      setInvoiceNumber(editingSale.invoiceNumber);
      setCustomerId(editingSale.customerId);
      setFarmId(editingSale.farmId || editingSale.sourceFarmId || (farms[0]?.id || ''));
      setBreed(editingSale.breed);
      setQuantity(editingSale.quantity);
      setBonusCount(editingSale.bonusCount || 0);
      setUnitPrice(editingSale.unitPrice);
      setCostUnitPrice(editingSale.costUnitPrice || 5.6);
      setPaidAmount(editingSale.paidAmount);
      setPaymentMethod(editingSale.paymentMethod);
      setAccountId(editingSale.accountId || accounts[0]?.id || '');
      setTruckPlate(editingSale.truckPlate || '');
      setDriverName(editingSale.driverName || '');
      setDriverPhone(editingSale.driverPhone || '');
      setNotes(editingSale.notes || '');
    } else {
      setDate(new Date().toISOString().substring(0, 10));
      setInvoiceNumber(`FAC-CSALE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setCustomerId(customers[0]?.id || '');
      setFarmId(selectedFarmId !== 'all' ? selectedFarmId : (farms[0]?.id || ''));
      setBreed('Cobb 500');
      setQuantity(5000);
      setBonusCount(100);
      setUnitPrice(6.5);
      setCostUnitPrice(5.6);
      setPaidAmount(32500);
      setPaymentMethod('cash');
      setAccountId(accounts[0]?.id || '');
      setTruckPlate('12-B-9988');
      setDriverName('');
      setDriverPhone('');
      setNotes('');
    }
  }, [editingSale, isOpen, farms, customers, accounts, selectedFarmId]);

  if (!isOpen) return null;

  const numQty = Number(quantity) || 0;
  const numPrice = Number(unitPrice) || 0;
  const numCost = Number(costUnitPrice) || 0;
  const numBonus = Number(bonusCount) || 0;
  const totalAmount = numQty * numPrice;
  const numPaid = paidAmount === '' ? totalAmount : Number(paidAmount);
  const remainingAmount = Math.max(0, totalAmount - numPaid);
  const profitMargin = (numPrice - numCost) * numQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber || !customerId || numQty <= 0 || numPrice <= 0) {
      alert('يرجى ملء جميع الحقول الإلزامية (رقم الفاتورة، الزبون، الكمية، سعر البيع)');
      return;
    }

    const customer = partners.find(p => p.id === customerId);

    onSave({
      invoiceNumber: invoiceNumber.trim(),
      date,
      customerId,
      customerName: customer?.name || 'زبون',
      farmId,
      sourceFarmId: farmId,
      breed,
      quantity: numQty,
      bonusCount: numBonus,
      unitPrice: numPrice,
      costUnitPrice: numCost,
      totalAmount,
      paidAmount: numPaid,
      remainingAmount,
      paymentMethod,
      accountId: accountId || undefined,
      truckPlate: truckPlate.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-stone-100 space-y-4 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {editingSale ? 'تعديل فاتورة بيع كتاكيت' : 'تسجيل عملية بيع كتاكيت للزبائن'}
              </h3>
              <p className="text-[11px] text-stone-400">إصدار فاتورة بيع، تسليم، وتسجيل القيود المالية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-400 font-medium mb-1">رقم الفاتورة *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">تاريخ العملية *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">الزبون المشتري *</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-400 font-medium mb-1">مزرعة المصدر / المخزن</label>
              <select
                value={farmId}
                onChange={e => setFarmId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
              >
                <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>📍 {f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">السلالة</label>
              <input
                type="text"
                value={breed}
                onChange={e => setBreed(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
                placeholder="Cobb 500, Ross 308..."
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">العدد المباع (كتكوت) *</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-950/60 p-3 rounded-2xl border border-stone-800">
            <div>
              <label className="block text-stone-400 font-medium mb-1">بونص مجاني (+)</label>
              <input
                type="number"
                min={0}
                value={bonusCount}
                onChange={e => setBonusCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">سعر البيع للكتكوت ({currency}) *</label>
              <input
                type="number"
                step={0.05}
                required
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">سعر التكلفة للكتكوت ({currency})</label>
              <input
                type="number"
                step={0.05}
                value={costUnitPrice}
                onChange={e => setCostUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-300"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">إجمالي الفاتورة</label>
              <div className="py-1.5 font-black text-amber-400 text-sm">
                {totalAmount.toLocaleString()} {currency}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-400 font-medium mb-1">المبلغ المقبوض / المسدد ({currency})</label>
              <input
                type="number"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-emerald-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
              >
                <option value="cash">نقداً (Espèces)</option>
                <option value="bank_transfer">تحويل بنكي (Virement)</option>
                <option value="check">شيك (Chèque)</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">الحساب المالي للإيداع</label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.bankName || 'كاش'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-400 font-medium mb-1">رقم شاحنة التوصيل</label>
              <input
                type="text"
                value={truckPlate}
                onChange={e => setTruckPlate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
                placeholder="12-B-9988"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">اسم السائق</label>
              <input
                type="text"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
                placeholder="السائق المكلف"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-medium mb-1">هاتف السائق</label>
              <input
                type="text"
                value={driverPhone}
                onChange={e => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
                placeholder="06XXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-400 font-medium mb-1">ملاحظات الفاتورة</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100"
              placeholder="شروط التسليم، عنوان الإنزال..."
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-800">
            <div className="text-xs">
              <span className="text-stone-400">المتبقي كدين على الزبون: </span>
              <span className="font-bold font-mono text-rose-400">{remainingAmount.toLocaleString()} {currency}</span>
              {profitMargin !== 0 && (
                <span className="mr-3 text-emerald-400 font-bold">
                  (ربح تقديري: {profitMargin.toLocaleString()} {currency})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-black flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingSale ? 'حفظ التعديلات' : 'تأكيد فاتورة البيع'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
