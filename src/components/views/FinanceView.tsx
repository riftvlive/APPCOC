import React, { useState } from 'react';
import {
  DollarSign,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Scale,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface FinanceViewProps {
  onOpenQuickAction: (action?: string) => void;
  defaultSubTab?: 'accounts' | 'debts' | 'transactions';
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onOpenQuickAction, defaultSubTab = 'accounts' }) => {
  const {
    accounts,
    accountBalances,
    totalLiquidity,
    partnerBalances,
    partners,
    transactions,
    farms,
    cycles,
    currency,
    language,
    addAccountTransfer,
    addAccount
  } = useFarm();

  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'debts' | 'transactions'>(defaultSubTab);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // Transfer Form State
  const [xferFrom, setXferFrom] = useState(accounts[0]?.id || '');
  const [xferTo, setXferTo] = useState(accounts[1]?.id || '');
  const [xferAmount, setXferAmount] = useState<number | ''>('');
  const [xferNotes, setXferNotes] = useState('');

  // Add Account Form State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'cash_box' | 'bank_account'>('cash_box');
  const [accBankName, setAccBankName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accOpening, setAccOpening] = useState<number | ''>(0);

  // Net Liquid Position
  const netPosition = totalLiquidity + partnerBalances.totalReceivables - partnerBalances.totalPayables;

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xferAmount || xferFrom === xferTo) return;
    addAccountTransfer(xferFrom, xferTo, Number(xferAmount), xferNotes);
    setIsTransferModalOpen(false);
    setXferAmount('');
    setXferNotes('');
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;
    addAccount({
      name: accName,
      type: accType,
      bankName: accBankName || undefined,
      accountNumber: accNumber || undefined,
      openingBalance: Number(accOpening || 0),
      currentBalance: Number(accOpening || 0),
      isDefault: false
    });
    setIsAddAccountModalOpen(false);
    setAccName('');
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'الخزينة المركزية، الذمم المالية والتدفق النقدي' : 'Trésorerie & États Financiers'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'متابعة السيولة النقدية في الصناديق والبنوك، دفتر الذمم والديون (لي / علي)، وحساب المركز المالي'
              : 'Soldes bancaires, grand livre des créances & dettes, et journal des transactions'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="طباعة التقرير المالي"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة التقرير المالي</span>
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            <span>تحويل سيولة</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('expense')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ تسجيل حركة</span>
          </button>
        </div>
      </div>

      {/* Official Print Header (Visible only when printed) */}
      <div className="print-only border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">تقرير الخزينة المركزية والموقف المالي</h1>
            <p className="text-xs text-stone-600">
              نظام إدارة مزارع الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')} - {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold">
            <div>العملة المعتمدة: {currency}</div>
            <div>الحالة: كشف حساب مالي رسمي</div>
          </div>
        </div>
      </div>

      {/* Financial Health Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">إجمالي السيولة المتاحة (كاش + بنوك)</span>
          <div className="text-xl font-black text-amber-400">
            {totalLiquidity.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">مبالغ مستحقة (لي عند الزبناء)</span>
          <div className="text-xl font-black text-emerald-400">
            {partnerBalances.totalReceivables.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">مبالغ مؤجلة (علي للموردين والشركات)</span>
          <div className="text-xl font-black text-rose-400">
            {partnerBalances.totalPayables.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">صافي المركز المالي المباشر</span>
          <div className={`text-xl font-black ${netPosition >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
            {netPosition.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'accounts'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>الصناديق والحسابات البنكية ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('debts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'debts'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>دفتر الذمم المركزية (لي / علي)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'transactions'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل العمليات اليومية ({transactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Accounts & Banks */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-stone-300">أرصدة الصناديق والحسابات البنكية الفعلية</h3>
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              + إضافة حساب أو صندوق
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map(acc => {
              const liveBalance = accountBalances[acc.id] ?? acc.openingBalance;
              const isBank = acc.type === 'bank_account';

              return (
                <div
                  key={acc.id}
                  className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 transition shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isBank ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {isBank ? '🏦' : '💵'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-stone-100">{acc.name}</h4>
                          <span className="text-[11px] text-stone-400">{isBank ? acc.bankName : 'صندوق كاش المزرعة'}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isBank ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isBank ? 'حساب بنكي' : 'صندوق نقد'}
                      </span>
                    </div>

                    <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 my-3">
                      <span className="text-[10px] text-stone-400 block mb-0.5">الرصيد الفعلي الحالي</span>
                      <div className={`text-xl font-black ${liveBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {liveBalance.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                    <button
                      onClick={() => {
                        setXferFrom(acc.id);
                        setIsTransferModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>تحويل منه</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAction('expense')}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition"
                    >
                      صرف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Central Debts Ledger (لي / علي) */}
      {activeSubTab === 'debts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: "لي" - Customer Receivables */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-stone-100">
                  المبالغ المستحقة (لي عند الزبناء)
                </h3>
              </div>
              <span className="text-xs font-black text-emerald-400">
                {partnerBalances.totalReceivables.toLocaleString()} {currency}
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(partnerBalances.customerReceivables)
                .filter(([_, data]) => ((data as any)?.remainingDue || 0) > 0)
                .map(([pId, data]) => {
                  const partner = partners.find(p => p.id === pId);
                  const due = (data as any)?.remainingDue || 0;
                  return (
                    <div
                      key={pId}
                      className="p-3 bg-stone-950/60 rounded-xl border border-stone-850 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-stone-200">{partner?.name || 'زبون'}</div>
                        <div className="text-[11px] text-stone-400">{partner?.phone} • {partner?.company || ''}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400 block">{due.toLocaleString()} {currency}</span>
                        <button
                          onClick={() => onOpenQuickAction('collect')}
                          className="text-[10px] text-teal-300 hover:text-teal-200 font-bold underline"
                        >
                          تحصيل الآن
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right: "علي" - Supplier Payables */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <h3 className="font-extrabold text-sm text-stone-100">
                  المبالغ المؤجلة (علي للموردين والشركات)
                </h3>
              </div>
              <span className="text-xs font-black text-rose-400">
                {partnerBalances.totalPayables.toLocaleString()} {currency}
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(partnerBalances.supplierPayables)
                .filter(([_, data]) => ((data as any)?.remainingDebt || 0) > 0)
                .map(([pId, data]) => {
                  const partner = partners.find(p => p.id === pId);
                  const debt = (data as any)?.remainingDebt || 0;
                  return (
                    <div
                      key={pId}
                      className="p-3 bg-stone-950/60 rounded-xl border border-stone-850 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-stone-200">{partner?.name || 'مورد'}</div>
                        <div className="text-[11px] text-stone-400">{partner?.phone} • {partner?.company || ''}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-400 block">{debt.toLocaleString()} {currency}</span>
                        <button
                          onClick={() => onOpenQuickAction('supplier_pay')}
                          className="text-[10px] text-rose-300 hover:text-rose-200 font-bold underline"
                        >
                          سداد دفعة
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Transactions Journal */}
      {activeSubTab === 'transactions' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                  <th className="pb-3 font-bold">التاريخ</th>
                  <th className="pb-3 font-bold">نوع الحركة</th>
                  <th className="pb-3 font-bold">البيان والتفاصيل</th>
                  <th className="pb-3 font-bold">الحساب المالي</th>
                  <th className="pb-3 font-bold">المبلغ</th>
                  <th className="pb-3 font-bold">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {transactions.slice(0, 50).map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const isIncome = tx.type === 'income' || tx.type === 'customer_payment';
                  const isExpense = tx.type === 'expense' || tx.type === 'supplier_payment' || tx.type === 'worker_salary' || tx.type === 'worker_loan';

                  return (
                    <tr key={tx.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 text-stone-400 font-semibold">{tx.date}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncome ? 'bg-emerald-500/20 text-emerald-300' :
                          isExpense ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {tx.type === 'customer_payment' ? 'تحصيل من زبون' :
                           tx.type === 'supplier_payment' ? 'دفع لمورد' :
                           tx.type === 'worker_salary' ? 'راتب عامل' :
                           tx.type === 'account_transfer' ? 'تحويل بين حسابين' : tx.type}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-stone-200">{tx.description}</td>
                      <td className="py-3 text-stone-300">{acc?.name || 'حساب عام'}</td>
                      <td className={`py-3 font-black ${isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}{tx.amount.toLocaleString()} {currency}
                      </td>
                      <td className="py-3 text-[11px] text-stone-400">{tx.performedBy || 'المدير'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsTransferModalOpen(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">تحويل سيولة بين الصناديق والبنوك</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">من حساب (المرسل)</label>
                  <select
                    value={xferFrom}
                    onChange={e => setXferFrom(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">إلى حساب (المستلم)</label>
                  <select
                    value={xferTo}
                    onChange={e => setXferTo(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">المبلغ المحول ({currency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={xferAmount}
                  onChange={e => setXferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-cyan-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">البيان والملاحظات</label>
                <input
                  type="text"
                  placeholder="تغذية الصندوق نقداً أو شيك..."
                  value={xferNotes}
                  onChange={e => setXferNotes(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl shadow-md transition"
              >
                تنفيذ التحويل المالي
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddAccountModalOpen(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">إضافة حساب مالي أو صندوق</h3>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">اسم الحساب / الصندوق *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حساب الشركة التجاري وفابنك"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">النوع</label>
                  <select
                    value={accType}
                    onChange={e => setAccType(e.target.value as any)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    <option value="cash_box">صندوق كاش (Caisse)</option>
                    <option value="bank_account">حساب بنكي (Banque)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">الرصيد الافتتاحي ({currency})</label>
                  <input
                    type="number"
                    value={accOpening}
                    onChange={e => setAccOpening(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
              </div>

              {accType === 'bank_account' && (
                <div>
                  <label className="block text-stone-300 font-bold mb-1">اسم البنك ورقم الحساب (RIB)</label>
                  <input
                    type="text"
                    placeholder="Attijariwafa Bank / 24 رقماً..."
                    value={accBankName}
                    onChange={e => setAccBankName(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                حفظ الحساب
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Official Print Footer */}
      <div className="print-only pt-8 mt-6 border-t-2 border-stone-300">
        <div className="flex items-center justify-between text-xs text-stone-700">
          <div>
            <span className="font-bold block">إعداد ومصادقة المحاسب:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">اعتماد الإدارة العامة والختم:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
