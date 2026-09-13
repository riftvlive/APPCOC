import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Wallet,
  Building2,
  Users2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  X
} from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { ChickPurchase, ChickSale, PaymentMethod } from '../../../types';
import { getMoroccoDateISO } from '../../../utils/date';

interface ChicksFinanceTabProps {
  filteredChicks: ChickPurchase[];
  filteredSales: ChickSale[];
  onOpenAddPurchase: () => void;
  onOpenAddSale: () => void;
}

export const ChicksFinanceTab: React.FC<ChicksFinanceTabProps> = ({
  filteredChicks,
  filteredSales,
  onOpenAddPurchase,
  onOpenAddSale
}) => {
  const {
    partners,
    accounts,
    currency,
    addSettlementTransaction,
    selectedFarmId,
    farms
  } = useFarm();

  // Modals for debt settlement & collection
  const [payHatcheryModalOpen, setPayHatcheryModalOpen] = useState(false);
  const [collectCustomerModalOpen, setCollectCustomerModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [modalAmount, setModalAmount] = useState<number | ''>('');
  const [modalAccountId, setModalAccountId] = useState(accounts[0]?.id || '');
  const [modalMethod, setModalMethod] = useState<PaymentMethod>('bank_transfer');
  const [modalNotes, setModalNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Calculations
  const totalPurchasesCost = filteredChicks.reduce((s, c) => s + c.totalAmount, 0);
  const totalPurchasesPaid = filteredChicks.reduce((s, c) => s + c.paidAmount, 0);
  const totalHatcheryDebt = filteredChicks.reduce((s, c) => s + c.remainingAmount, 0);

  const totalSalesRevenue = filteredSales.reduce((s, c) => s + c.totalAmount, 0);
  const totalSalesPaid = filteredSales.reduce((s, c) => s + c.paidAmount, 0);
  const totalCustomerReceivables = filteredSales.reduce((s, c) => s + c.remainingAmount, 0);

  const estimatedSalesCost = filteredSales.reduce((s, c) => s + (c.quantity * (c.costUnitPrice || 5.6)), 0);
  const tradingMargin = totalSalesRevenue - estimatedSalesCost;

  // 2. Hatchery Debts Breakdown
  const hatcheryDebtsList = useMemo(() => {
    const map = new Map<string, { supplierId: string; name: string; phone?: string; totalInvoiced: number; totalPaid: number; balanceOwed: number; batchesCount: number }>();
    filteredChicks.forEach(c => {
      const partner = partners.find(p => p.id === c.supplierId);
      const name = partner?.name || c.supplierName || 'مفرخة';
      const existing = map.get(c.supplierId) || {
        supplierId: c.supplierId,
        name,
        phone: partner?.phone,
        totalInvoiced: 0,
        totalPaid: 0,
        balanceOwed: 0,
        batchesCount: 0
      };
      existing.totalInvoiced += c.totalAmount;
      existing.totalPaid += c.paidAmount;
      existing.balanceOwed += c.remainingAmount;
      existing.batchesCount += 1;
      map.set(c.supplierId, existing);
    });
    return Array.from(map.values());
  }, [filteredChicks, partners]);

  // 3. Customer Receivables Breakdown
  const customerReceivablesList = useMemo(() => {
    const map = new Map<string, { customerId: string; name: string; phone?: string; totalInvoiced: number; totalCollected: number; balanceOwed: number; salesCount: number }>();
    filteredSales.forEach(s => {
      const partner = partners.find(p => p.id === s.customerId);
      const name = partner?.name || s.customerName || 'زبون كتاكيت';
      const existing = map.get(s.customerId) || {
        customerId: s.customerId,
        name,
        phone: partner?.phone,
        totalInvoiced: 0,
        totalCollected: 0,
        balanceOwed: 0,
        salesCount: 0
      };
      existing.totalInvoiced += s.totalAmount;
      existing.totalCollected += s.paidAmount;
      existing.balanceOwed += s.remainingAmount;
      existing.salesCount += 1;
      map.set(s.customerId, existing);
    });
    return Array.from(map.values());
  }, [filteredSales, partners]);

  // Handler: Pay Hatchery Debt
  const handleOpenPayHatchery = (supplierId?: string, debt?: number) => {
    setSelectedPartnerId(supplierId || (hatcheryDebtsList[0]?.supplierId || ''));
    setModalAmount(debt && debt > 0 ? debt : '');
    setModalAccountId(accounts[0]?.id || '');
    setModalMethod('bank_transfer');
    setModalNotes('');
    setErrorMessage('');
    setPayHatcheryModalOpen(true);
  };

  const handleSubmitPayHatchery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const amt = Number(modalAmount);
    if (!selectedPartnerId || amt <= 0 || !modalAccountId) {
      setErrorMessage('يرجى تحديد المفرخة ومبلغ السداد وحساب الخزينة.');
      return;
    }
    const hatchery = partners.find(p => p.id === selectedPartnerId);
    addSettlementTransaction({
      partnerId: selectedPartnerId,
      amount: amt,
      type: 'supplier_payment',
      accountId: modalAccountId,
      paymentMethod: modalMethod,
      description: modalNotes.trim() || `سداد دفعة لمفرخة كتاكيت (${hatchery?.name || 'مفرخة'})`
    });
    setPayHatcheryModalOpen(false);
  };

  // Handler: Collect Customer Debt
  const handleOpenCollectCustomer = (customerId?: string, debt?: number) => {
    setSelectedPartnerId(customerId || (customerReceivablesList[0]?.customerId || ''));
    setModalAmount(debt && debt > 0 ? debt : '');
    setModalAccountId(accounts[0]?.id || '');
    setModalMethod('cash');
    setModalNotes('');
    setErrorMessage('');
    setCollectCustomerModalOpen(true);
  };

  const handleSubmitCollectCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const amt = Number(modalAmount);
    if (!selectedPartnerId || amt <= 0 || !modalAccountId) {
      setErrorMessage('يرجى تحديد الزبون ومبلغ التحصيل وحساب الإيداع.');
      return;
    }
    const customer = partners.find(p => p.id === selectedPartnerId);
    addSettlementTransaction({
      date: getMoroccoDateISO(),
      amount: amt,
      partnerId: selectedPartnerId,
      partnerName: customer?.name || 'زبون كتاكيت',
      partnerType: 'customer',
      paymentMethod: modalMethod,
      accountId: modalAccountId,
      category: 'income',
      type: 'income',
      description: `تحصيل دفعة مبيعات كتاكيت - ${customer?.name || 'زبون'} - ${modalNotes || 'تسديد دفعة'}`
    });
    setCollectCustomerModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Finance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Purchases Cost */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>مشتريات الكتاكيت</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              تكلفة
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">
              {totalPurchasesCost.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center justify-between">
              <span>مسدد: {totalPurchasesPaid.toLocaleString()}</span>
              <span className="text-rose-400 font-bold">متبقي: {totalHatcheryDebt.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Sales Revenue */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>مبيعات الكتاكيت</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              إيراد
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {totalSalesRevenue.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
              <span>محصل: {totalSalesPaid.toLocaleString()}</span>
              <span className="text-amber-400 font-bold">باقي دين: {totalCustomerReceivables.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Hatchery Debts Owed */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-rose-400" />
              <span>ديون المفارخ (واجبة السداد)</span>
            </span>
            <button
              onClick={() => handleOpenPayHatchery()}
              className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition"
            >
              سداد دفعة
            </button>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400">
              {totalHatcheryDebt.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              مستحقات المفارخ المؤجلة
            </div>
          </div>
        </div>

        {/* Card 4: Customer Receivables & Margin */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>ديون الزبائن (لنا بذمتهم)</span>
            </span>
            <button
              onClick={() => handleOpenCollectCustomer()}
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition"
            >
              تحصيل دفعة
            </button>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              {totalCustomerReceivables.toLocaleString()} <span className="text-xs text-stone-400 font-normal">{currency}</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-bold">
              هامش الربح التقديري: {tradingMargin >= 0 ? `+${tradingMargin.toLocaleString()}` : tradingMargin.toLocaleString()} {currency}
            </div>
          </div>
        </div>
      </div>

      {/* Two Tables Grid: Hatchery Debts & Customer Receivables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Table 1: Hatchery Debts */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-stone-100">ديون ومستحقات المفارخ (Dettes Couvoirs)</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300">
              {hatcheryDebtsList.length} مفرخة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-[11px] font-bold border-b border-stone-800">
                <tr>
                  <th className="p-2.5">المفرخة</th>
                  <th className="p-2.5">الفواتير</th>
                  <th className="p-2.5">المسدد</th>
                  <th className="p-2.5">المتبقي</th>
                  <th className="p-2.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {hatcheryDebtsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-stone-500 text-xs">
                      لا توجد ديون مسجلة للمفارخ
                    </td>
                  </tr>
                ) : (
                  hatcheryDebtsList.map(item => (
                    <tr key={item.supplierId} className="hover:bg-stone-800/40">
                      <td className="p-2.5 font-bold text-stone-200">
                        {item.name}
                        {item.phone && <div className="text-[10px] text-stone-500 font-normal">{item.phone}</div>}
                      </td>
                      <td className="p-2.5 font-mono">{item.totalInvoiced.toLocaleString()} {currency}</td>
                      <td className="p-2.5 text-emerald-400 font-mono">{item.totalPaid.toLocaleString()}</td>
                      <td className="p-2.5 font-bold font-mono">
                        <span className={item.balanceOwed > 0 ? 'text-rose-400' : 'text-stone-400'}>
                          {item.balanceOwed.toLocaleString()} {currency}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleOpenPayHatchery(item.supplierId, item.balanceOwed)}
                          disabled={item.balanceOwed <= 0}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            item.balanceOwed > 0
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          سداد
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Customer Receivables */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black text-stone-100">مستحقات وديون زبائن الكتاكيت (Créances Clients)</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300">
              {customerReceivablesList.length} زبون
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-[11px] font-bold border-b border-stone-800">
                <tr>
                  <th className="p-2.5">الزبون</th>
                  <th className="p-2.5">المبيعات</th>
                  <th className="p-2.5">المحصل</th>
                  <th className="p-2.5">المتبقي بذمته</th>
                  <th className="p-2.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {customerReceivablesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-stone-500 text-xs">
                      لا توجد مبيعات كتاكيت مؤجلة
                    </td>
                  </tr>
                ) : (
                  customerReceivablesList.map(item => (
                    <tr key={item.customerId} className="hover:bg-stone-800/40">
                      <td className="p-2.5 font-bold text-stone-200">
                        {item.name}
                        {item.phone && <div className="text-[10px] text-stone-500 font-normal">{item.phone}</div>}
                      </td>
                      <td className="p-2.5 font-mono">{item.totalInvoiced.toLocaleString()} {currency}</td>
                      <td className="p-2.5 text-emerald-400 font-mono">{item.totalCollected.toLocaleString()}</td>
                      <td className="p-2.5 font-bold font-mono">
                        <span className={item.balanceOwed > 0 ? 'text-amber-400' : 'text-stone-400'}>
                          {item.balanceOwed.toLocaleString()} {currency}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleOpenCollectCustomer(item.customerId, item.balanceOwed)}
                          disabled={item.balanceOwed <= 0}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            item.balanceOwed > 0
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          تحصيل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Pay Hatchery Debt */}
      {payHatcheryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-md w-full p-5 text-stone-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">سداد دفعة نقدية لمفرخة كتاكيت</h3>
              </div>
              <button onClick={() => setPayHatcheryModalOpen(false)} className="p-1 hover:bg-stone-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayHatchery} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">المفرخة الدائنة</label>
                <select
                  value={selectedPartnerId}
                  onChange={e => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                >
                  {partners.filter(p => p.type === 'supplier').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">مبلغ السداد ({currency})</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={modalAmount}
                  onChange={e => setModalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-bold focus:border-amber-500"
                  placeholder="مثال: 50000"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">الخزينة أو الحساب المسدد منه</label>
                <select
                  value={modalAccountId}
                  onChange={e => setModalAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bankName || 'صندوق كاش'}) - {acc.currentBalance.toLocaleString()} {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">طريقة الأداء</label>
                <select
                  value={modalMethod}
                  onChange={e => setModalMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                >
                  <option value="bank_transfer">تحويل بنكي (Virement)</option>
                  <option value="check">شيك بنكي (Chèque)</option>
                  <option value="cash">نقداً (Espèces)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">بيان وملاحظات</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-amber-500"
                  placeholder="رقم الشيك أو الحوالة أو إيصال السداد..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayHatcheryModalOpen(false)}
                  className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl"
                >
                  تأكيد سداد الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Collect Customer Debt */}
      {collectCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-md w-full p-5 text-stone-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">تحصيل دفعة مالية من زبون كتاكيت</h3>
              </div>
              <button onClick={() => setCollectCustomerModalOpen(false)} className="p-1 hover:bg-stone-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCollectCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">الزبون المدين</label>
                <select
                  value={selectedPartnerId}
                  onChange={e => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-emerald-500"
                >
                  {partners.filter(p => p.type === 'customer').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">المبلغ المحصل ({currency})</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={modalAmount}
                  onChange={e => setModalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-bold focus:border-emerald-500"
                  placeholder="مثال: 30000"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">حساب الإيداع / الخزينة</label>
                <select
                  value={modalAccountId}
                  onChange={e => setModalAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-emerald-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bankName || 'صندوق كاش'}) - {acc.currentBalance.toLocaleString()} {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">طريقة التحصيل</label>
                <select
                  value={modalMethod}
                  onChange={e => setModalMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-emerald-500"
                >
                  <option value="cash">نقداً (Espèces)</option>
                  <option value="bank_transfer">تحويل بنكي (Virement)</option>
                  <option value="check">شيك بنكي (Chèque)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">بيان وملاحظات</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:border-emerald-500"
                  placeholder="رقم الوصل أو سند القبض..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectCustomerModalOpen(false)}
                  className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl"
                >
                  تأكيد إيداع التحصيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
