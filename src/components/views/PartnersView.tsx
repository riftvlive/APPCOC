import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Phone,
  Building,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Edit2
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Partner, PartnerType } from '../../types';

interface PartnersViewProps {
  onOpenQuickAction: (action?: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ onOpenQuickAction }) => {
  const {
    partners,
    sales,
    feedPurchases,
    medicationPurchases,
    expenses,
    transactions,
    partnerBalances,
    addPartner,
    updatePartner,
    addSettlementTransaction,
    accounts,
    currency,
    language
  } = useFarm();

  const [activeFilter, setActiveFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<Partner | null>(null);
  const [isAddPartnerModal, setIsAddPartnerModal] = useState(false);
  const [settlementPartner, setSettlementPartner] = useState<Partner | null>(null);
  const [settleAmount, setSettleAmount] = useState<number | ''>('');
  const [settleAccountId, setSettleAccountId] = useState(accounts[0]?.id || '');
  const [settleNotes, setSettleNotes] = useState('');

  // Add Partner Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<PartnerType>('customer');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('wholesale_buyer');
  const [openingBalance, setOpeningBalance] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');

  const filteredPartners = partners
    .filter(p => {
      if (activeFilter === 'customer') return p.type === 'customer' || p.type === 'both';
      if (activeFilter === 'supplier') return p.type === 'supplier' || p.type === 'both';
      return true;
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.company && p.company.toLowerCase().includes(q));
    });

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addPartner({
      name,
      type,
      phone,
      company: company || undefined,
      category,
      openingBalance: Number(openingBalance || 0),
      notes: notes || undefined
    });

    setIsAddPartnerModal(false);
    setName('');
    setPhone('');
    setCompany('');
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementPartner || !settleAmount || Number(settleAmount) <= 0) return;

    const isCustomer = settlementPartner.type === 'customer' || settlementPartner.type === 'both';
    addSettlementTransaction({
      partnerId: settlementPartner.id,
      amount: Number(settleAmount),
      type: isCustomer ? 'customer_payment' : 'supplier_payment',
      accountId: settleAccountId,
      description: settleNotes || (isCustomer ? 'تحصيل دفعة مالية' : 'سداد دفعة للمورد'),
      paymentMethod: 'cash'
    });

    setSettlementPartner(null);
    setSettleAmount('');
    setSettleNotes('');
  };

  // Statement of Account (كشف الحساب) computation for selectedPartnerDetail
  const partnerStatement = React.useMemo(() => {
    if (!selectedPartnerDetail) return [];
    const pId = selectedPartnerDetail.id;
    const history: Array<{
      date: string;
      description: string;
      debit: number; // مدين (طلبنا منه)
      credit: number; // دائن (دفع لنا أو سددنا له)
      type: string;
    }> = [];

    // Sales (for customers)
    sales.filter(s => s.customerId === pId).forEach(s => {
      history.push({
        date: s.date,
        description: `فاتورة بيع دجاج #${s.invoiceNumber} (${s.chickenCount} طائر، ${s.totalWeightKg} كغ)`,
        debit: s.netTotal,
        credit: s.paidAmount,
        type: 'sale'
      });
    });

    // Feed purchases (for suppliers)
    feedPurchases.filter(f => f.supplierId === pId).forEach(f => {
      history.push({
        date: f.date,
        description: `فاتورة علف #${f.invoiceNumber} (${f.brand} - ${f.quantityKg} كغ)`,
        debit: f.paidAmount,
        credit: f.totalAmount,
        type: 'feed'
      });
    });

    // Med purchases
    medicationPurchases.filter(m => m.supplierId === pId).forEach(m => {
      history.push({
        date: m.date,
        description: `شراء أدوية: ${m.medicationName}`,
        debit: m.paidAmount,
        credit: m.totalAmount,
        type: 'med'
      });
    });

    // Other settlements
    transactions.filter(t => t.partnerId === pId && t.referenceType === 'debt_payment').forEach(t => {
      if (t.type === 'customer_payment') {
        history.push({
          date: t.date,
          description: `دفعة نقدية محصلة (${t.description || ''})`,
          debit: 0,
          credit: t.amount,
          type: 'settle_in'
        });
      } else if (t.type === 'supplier_payment') {
        history.push({
          date: t.date,
          description: `سداد دفعة للمورد (${t.description || ''})`,
          debit: t.amount,
          credit: 0,
          type: 'settle_out'
        });
      }
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedPartnerDetail, sales, feedPurchases, medicationPurchases, transactions]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'إدارة الشركاء: الزبناء والموردين' : 'Clients & Fournisseurs'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'متابعة كشوفات الحساب، الديون المستحقة، والمبالغ المؤجلة لشركات الأعلاف والمشترين'
              : 'Relevés de compte, créances clients et dettes fournisseurs'}
          </p>
        </div>

        <button
          onClick={() => setIsAddPartnerModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'ar' ? '+ إضافة شريك جديد' : '+ Nouveau Partenaire'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            الكل ({partners.length})
          </button>
          <button
            onClick={() => setActiveFilter('customer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'customer'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            الزبناء فقط ({partners.filter(p => p.type === 'customer' || p.type === 'both').length})
          </button>
          <button
            onClick={() => setActiveFilter('supplier')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === 'supplier'
                ? 'bg-rose-600 text-white'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            الموردين فقط ({partners.filter(p => p.type === 'supplier' || p.type === 'both').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالاسم، الشركة، الهاتف..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map(partner => {
          const isCustomer = partner.type === 'customer' || partner.type === 'both';
          const isSupplier = partner.type === 'supplier' || partner.type === 'both';

          const custBalance = partnerBalances.customerReceivables[partner.id];
          const suppBalance = partnerBalances.supplierPayables[partner.id];

          const remainingDue = custBalance?.remainingDue || 0;
          const remainingDebt = suppBalance?.remainingDebt || 0;

          return (
            <div
              key={partner.id}
              className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition shadow-md"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-stone-100">{partner.name}</h3>
                    {partner.company && (
                      <span className="text-[11px] text-amber-400 block font-semibold">{partner.company}</span>
                    )}
                    <span className="text-xs text-stone-400 block mt-0.5">{partner.phone}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    partner.type === 'customer'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : partner.type === 'supplier'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {partner.type === 'customer' ? 'زبون (مشتري)' : partner.type === 'supplier' ? 'مورد' : 'زبون ومورد'}
                  </span>
                </div>

                {/* Balances Box */}
                <div className="space-y-2 mb-4 bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-xs">
                  {isCustomer && (
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">مستحق لنا بذمته:</span>
                      <span className={`font-black ${remainingDue > 0 ? 'text-emerald-400' : 'text-stone-300'}`}>
                        {remainingDue.toLocaleString()} {currency}
                      </span>
                    </div>
                  )}

                  {isSupplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">مطلوب منا للمورد:</span>
                      <span className={`font-black ${remainingDebt > 0 ? 'text-rose-400' : 'text-stone-300'}`}>
                        {remainingDebt.toLocaleString()} {currency}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                <button
                  onClick={() => setSelectedPartnerDetail(partner)}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>كشف الحساب</span>
                </button>
                <button
                  onClick={() => {
                    setSettlementPartner(partner);
                    setSettleAmount(remainingDue > 0 ? remainingDue : remainingDebt);
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition"
                >
                  تسوية / دفع
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statement of Account Modal (كشف حساب الشريك) */}
      {selectedPartnerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setSelectedPartnerDetail(null)} />
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-stone-100">
                  كشف حساب الشريك: {selectedPartnerDetail.name}
                </h3>
                <p className="text-xs text-stone-400">{selectedPartnerDetail.phone} • {selectedPartnerDetail.company || ''}</p>
              </div>
              <button onClick={() => setSelectedPartnerDetail(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-2 font-bold">التاريخ</th>
                    <th className="pb-2 font-bold">البيان والعملية</th>
                    <th className="pb-2 font-bold">مدين (لنا)</th>
                    <th className="pb-2 font-bold">دائن (علينا)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {partnerStatement.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-stone-500">
                        لا توجد حركات مسجلة لهذا الشريك.
                      </td>
                    </tr>
                  ) : (
                    partnerStatement.map((st, i) => (
                      <tr key={i} className="hover:bg-stone-800/40 transition">
                        <td className="py-2.5 text-stone-400 font-semibold">{st.date}</td>
                        <td className="py-2.5 text-stone-200 font-medium">{st.description}</td>
                        <td className="py-2.5 text-emerald-400 font-bold">
                          {st.debit > 0 ? `${st.debit.toLocaleString()} ${currency}` : '-'}
                        </td>
                        <td className="py-2.5 text-rose-400 font-bold">
                          {st.credit > 0 ? `${st.credit.toLocaleString()} ${currency}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-stone-800/80 border-t border-stone-700 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-bold transition"
              >
                طباعة كشف الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      {settlementPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setSettlementPartner(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">
                تسوية مالية: {settlementPartner.name}
              </h3>
              <button onClick={() => setSettlementPartner(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">المبلغ ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">الحساب المالي</label>
                <select
                  value={settleAccountId}
                  onChange={e => setSettleAccountId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">بيان / رقم الشيك</label>
                <input
                  type="text"
                  placeholder="رقم الشيك أو الحوالة..."
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition"
              >
                تأكيد التسوية وتحديث الرصيد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddPartnerModal(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">إضافة شريك جديد (زبون / مورد)</h3>
              <button onClick={() => setIsAddPartnerModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد التاجي"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">نوع الشريك</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    <option value="customer">زبون (مشتري دجاج)</option>
                    <option value="supplier">مورد (أعلاف / أدوية / كتاكيت)</option>
                    <option value="both">زبون ومورد معاً</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="06xxxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">اسم الشركة أو الصفة</label>
                <input
                  type="text"
                  placeholder="مثال: شركة أعلاف الأطلس"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">الرصيد الافتتاحي ({currency})</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={e => setOpeningBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition mt-2"
              >
                حفظ الشريك
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
