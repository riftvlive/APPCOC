import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Receipt,
  ShoppingCart,
  ArrowDownLeft,
  Wheat,
  Pill,
  ArrowUpRight,
  UserCheck,
  Skull,
  Scale,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFarm } from '../../context/FarmContext';
import { PaymentMethod } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: string;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  initialAction
}) => {
  const {
    farms,
    cycles,
    partners,
    accounts,
    workers,
    currency,
    language,
    addExpense,
    addSale,
    addFeedPurchase,
    addMedicationPurchase,
    addSettlementTransaction,
    addWorkerTransaction,
    addDailyLog,
    addAccountTransfer
  } = useFarm();

  const [activeAction, setActiveAction] = useState<string>(initialAction || 'menu');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active cycles list for selecting in forms
  const activeCycles = cycles.filter(c => c.status !== 'completed');
  const defaultFarmId = farms[0]?.id || '';
  const defaultCycleId = activeCycles[0]?.id || cycles[0]?.id || '';
  const defaultAccountId = accounts[0]?.id || '';

  // Form states
  // 1. Expense Form
  const [expCategory, setExpCategory] = useState('electricity');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expFarmId, setExpFarmId] = useState(defaultFarmId);
  const [expCycleId, setExpCycleId] = useState(defaultCycleId);
  const [expAccountId, setExpAccountId] = useState(defaultAccountId);
  const [expPaidAmount, setExpPaidAmount] = useState<number | ''>('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('cash');

  // 2. Sale Form
  const [saleCustomerId, setSaleCustomerId] = useState(partners.find(p => p.type === 'customer')?.id || '');
  const [saleFarmId, setSaleFarmId] = useState(defaultFarmId);
  const [saleCycleId, setSaleCycleId] = useState(defaultCycleId);
  const [saleCount, setSaleCount] = useState<number | ''>('');
  const [saleTotalWeight, setSaleTotalWeight] = useState<number | ''>('');
  const [salePricePerKg, setSalePricePerKg] = useState<number | ''>(18.5);
  const [salePaid, setSalePaid] = useState<number | ''>('');
  const [saleAccountId, setSaleAccountId] = useState(defaultAccountId);

  // 3. Feed Form
  const [feedSupplierId, setFeedSupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [feedType, setFeedType] = useState<'starter' | 'grower' | 'finisher'>('grower');
  const [feedBrand, setFeedBrand] = useState('علف نمو مركب 50 كغ');
  const [feedQuantityKg, setFeedQuantityKg] = useState<number | ''>(5000);
  const [feedPricePerKg, setFeedPricePerKg] = useState<number | ''>(4.5);
  const [feedFarmId, setFeedFarmId] = useState(defaultFarmId);
  const [feedCycleId, setFeedCycleId] = useState(defaultCycleId);
  const [feedPaid, setFeedPaid] = useState<number | ''>(0);
  const [feedAccountId, setFeedAccountId] = useState(defaultAccountId);

  // 4. Med Form
  const [medSupplierId, setMedSupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState<'vaccine' | 'antibiotic' | 'vitamin' | 'disinfectant' | 'supplement'>('vitamin');
  const [medAmount, setMedAmount] = useState<number | ''>('');
  const [medPaid, setMedPaid] = useState<number | ''>('');
  const [medFarmId, setMedFarmId] = useState(defaultFarmId);
  const [medCycleId, setMedCycleId] = useState(defaultCycleId);
  const [medAccountId, setMedAccountId] = useState(defaultAccountId);

  // 5. Customer Payment Collection
  const [collectCustomerId, setCollectCustomerId] = useState(partners.find(p => p.type === 'customer')?.id || '');
  const [collectAmount, setCollectAmount] = useState<number | ''>('');
  const [collectAccountId, setCollectAccountId] = useState(defaultAccountId);
  const [collectNotes, setCollectNotes] = useState('');

  // 6. Supplier Payment
  const [paySupplierId, setPaySupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payAccountId, setPayAccountId] = useState(defaultAccountId);
  const [payNotes, setPayNotes] = useState('');

  // 7. Worker Payment / Advance
  const [wrkId, setWrkId] = useState(workers[0]?.id || '');
  const [wrkType, setWrkType] = useState<'salary' | 'advance_loan' | 'bonus'>('salary');
  const [wrkAmount, setWrkAmount] = useState<number | ''>('');
  const [wrkAccountId, setWrkAccountId] = useState(defaultAccountId);
  const [wrkNotes, setWrkNotes] = useState('');

  // 8. Mortality Log
  const [mortCycleId, setMortCycleId] = useState(defaultCycleId);
  const [mortCount, setMortCount] = useState<number | ''>('');
  const [mortFeedKg, setMortFeedKg] = useState<number | ''>('');
  const [mortNotes, setMortNotes] = useState('');

  // 9. Weight Sample Log
  const [weightCycleId, setWeightCycleId] = useState(defaultCycleId);
  const [sampleAvgGrams, setSampleAvgGrams] = useState<number | ''>('');
  const [weightNotes, setWeightNotes] = useState('');

  // 10. Account Transfer
  const [xferFromId, setXferFromId] = useState(accounts[0]?.id || '');
  const [xferToId, setXferToId] = useState(accounts[1]?.id || '');
  const [xferAmount, setXferAmount] = useState<number | ''>('');
  const [xferNotes, setXferNotes] = useState('');

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (_) {}
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      setActiveAction('menu');
    }, 1200);
  };

  const actionList = [
    { id: 'expense', label: 'مصروف جديد', sub: 'كهرباء، غاز، صيانة، فرشة...', icon: Receipt, color: 'from-amber-600 to-amber-500' },
    { id: 'sale', label: 'بيع بالجملة', sub: 'تسجيل بيعة دجاج وزن وقبض', icon: ShoppingCart, color: 'from-emerald-600 to-emerald-500' },
    { id: 'collect', label: 'تحصيل من زبون', sub: 'قبض دين أو دفعة مؤجلة', icon: ArrowDownLeft, color: 'from-teal-600 to-teal-500' },
    { id: 'feed', label: 'شراء علف', sub: 'بادي، نامي، ناهي مع المورد', icon: Wheat, color: 'from-amber-500 to-yellow-500' },
    { id: 'med', label: 'شراء دواء/لقاح', sub: 'تحصينات ومضادات بيطرية', icon: Pill, color: 'from-indigo-600 to-indigo-500' },
    { id: 'supplier_pay', label: 'دفع لمورد', sub: 'سداد فواتير الأعلاف والأدوية', icon: ArrowUpRight, color: 'from-rose-600 to-rose-500' },
    { id: 'worker_pay', label: 'دفع لعامل / سلفة', sub: 'رواتب وسلف ومكافآت العمال', icon: UserCheck, color: 'from-purple-600 to-purple-500' },
    { id: 'mortality', label: 'تسجيل نافق يومي', sub: 'توثيق عدد الوفيات والعلف', icon: Skull, color: 'from-stone-700 to-stone-600' },
    { id: 'weight', label: 'تسجيل وزن عينة', sub: 'متابعة النمو ومتوسط الوزن', icon: Scale, color: 'from-blue-600 to-blue-500' },
    { id: 'transfer', label: 'تحويل مالي', sub: 'بين البنوك والصناديق', icon: ArrowLeftRight, color: 'from-cyan-600 to-cyan-500' }
  ];

  // Submit Handlers
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return;
    const amt = Number(expAmount);
    const paid = expPaidAmount === '' ? amt : Number(expPaidAmount);
    addExpense({
      date: new Date().toISOString().substring(0, 10),
      category: expCategory,
      description: expDescription || `مصروف ${expCategory}`,
      amount: amt,
      paidAmount: paid,
      remainingAmount: Math.max(0, amt - paid),
      farmId: expFarmId,
      cycleId: expCycleId || undefined,
      paymentMethod: expPaymentMethod,
      accountId: expAccountId
    });
    triggerSuccess('تم تسجيل المصروف بنجاح!');
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleTotalWeight || !salePricePerKg || !saleCount) return;
    const count = Number(saleCount);
    const weight = Number(saleTotalWeight);
    const price = Number(salePricePerKg);
    const gross = weight * price;
    const net = gross;
    const paid = salePaid === '' ? net : Number(salePaid);
    const rem = Math.max(0, net - paid);

    addSale({
      invoiceNumber: `VTE-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().substring(0, 10),
      customerId: saleCustomerId,
      farmId: saleFarmId,
      cycleId: saleCycleId,
      chickenCount: count,
      totalWeightKg: weight,
      averageWeightKg: Number((weight / count).toFixed(3)),
      pricePerKg: price,
      grossTotal: gross,
      discount: 0,
      netTotal: net,
      paidAmount: paid,
      remainingAmount: rem,
      paymentMethod: rem > 0 ? 'partial' : 'cash',
      accountId: saleAccountId
    });
    triggerSuccess('تم تسجيل فاتورة البيع والقبض بنجاح!');
  };

  const handleFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedQuantityKg || !feedPricePerKg) return;
    const qty = Number(feedQuantityKg);
    const unitPrice = Number(feedPricePerKg);
    const total = qty * unitPrice;
    const paid = feedPaid === '' ? 0 : Number(feedPaid);
    const rem = Math.max(0, total - paid);

    addFeedPurchase({
      invoiceNumber: `FAC-F-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().substring(0, 10),
      supplierId: feedSupplierId,
      feedType,
      brand: feedBrand,
      quantityKg: qty,
      bagsCount: Math.round(qty / 50),
      bagWeightKg: 50,
      unitPricePerKg: unitPrice,
      totalAmount: total,
      farmId: feedFarmId,
      cycleId: feedCycleId || undefined,
      paymentMethod: rem === 0 ? 'cash' : paid > 0 ? 'partial' : 'delayed',
      paidAmount: paid,
      remainingAmount: rem,
      accountId: feedAccountId
    });
    triggerSuccess('تم تسجيل شراء العلف وتحديث ديون المورد!');
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medAmount) return;
    const total = Number(medAmount);
    const paid = medPaid === '' ? total : Number(medPaid);
    const rem = Math.max(0, total - paid);

    addMedicationPurchase({
      date: new Date().toISOString().substring(0, 10),
      supplierId: medSupplierId,
      medicationName: medName || 'أدوية وتحصينات بيطرية',
      category: medCategory,
      quantity: 1,
      unit: 'حصة',
      unitPrice: total,
      totalAmount: total,
      farmId: medFarmId,
      cycleId: medCycleId || undefined,
      paymentMethod: rem === 0 ? 'cash' : 'partial',
      paidAmount: paid,
      remainingAmount: rem,
      accountId: medAccountId
    });
    triggerSuccess('تم تسجيل شراء الأدوية بنجاح!');
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectAmount || Number(collectAmount) <= 0) return;
    addSettlementTransaction({
      partnerId: collectCustomerId,
      amount: Number(collectAmount),
      type: 'customer_payment',
      accountId: collectAccountId,
      description: collectNotes || 'تحصيل دفعة مالية من الزبون',
      paymentMethod: 'cash'
    });
    triggerSuccess('تم تسجيل التحصيل وتحديث رصيد الزبون!');
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    addSettlementTransaction({
      partnerId: paySupplierId,
      amount: Number(payAmount),
      type: 'supplier_payment',
      accountId: payAccountId,
      description: payNotes || 'سداد دفعة للمورد',
      paymentMethod: 'bank_transfer'
    });
    triggerSuccess('تم سداد الدفعة للمورد وتخفيض الدين!');
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wrkAmount || Number(wrkAmount) <= 0) return;
    const worker = workers.find(w => w.id === wrkId);
    addWorkerTransaction({
      workerId: wrkId,
      farmId: worker?.farmId || defaultFarmId,
      cycleId: defaultCycleId,
      date: new Date().toISOString().substring(0, 10),
      type: wrkType,
      amount: Number(wrkAmount),
      accountId: wrkAccountId,
      description: wrkNotes || (wrkType === 'salary' ? 'صرف راتب' : wrkType === 'advance_loan' ? 'سلفة على الراتب' : 'مكافأة')
    });
    triggerSuccess('تم تسجيل صرف المبلغ للعامل!');
  };

  const handleMortalitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortCount) return;
    addDailyLog({
      cycleId: mortCycleId,
      date: new Date().toISOString().substring(0, 10),
      dayNumber: 25,
      mortalityCount: Number(mortCount),
      feedConsumedKg: Number(mortFeedKg || 0),
      notes: mortNotes
    });
    triggerSuccess('تم تسجيل عدد النافق وتحديث سجل الدورة!');
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleAvgGrams) return;
    addDailyLog({
      cycleId: weightCycleId,
      date: new Date().toISOString().substring(0, 10),
      dayNumber: 25,
      mortalityCount: 0,
      feedConsumedKg: 0,
      sampleAverageWeightGrams: Number(sampleAvgGrams),
      notes: weightNotes || 'عينة وزن دورية'
    });
    triggerSuccess('تم حفظ متوسط وزن العينة بنجاح!');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xferAmount || xferFromId === xferToId) return;
    addAccountTransfer(xferFromId, xferToId, Number(xferAmount), xferNotes);
    triggerSuccess('تم تحويل السيولة بين الحسابات بنجاح!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-stone-800/90 border-b border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-stone-100">
                {activeAction === 'menu'
                  ? (language === 'ar' ? 'تسجيل عملية سريعة (< 10 ثوانٍ)' : 'Opération Rapide (< 10s)')
                  : actionList.find(a => a.id === activeAction)?.label}
              </h3>
              <p className="text-[11px] text-stone-400">
                {language === 'ar' ? 'اختر العملية ليتم حسابها مالياً وتشغيلياً تلقائياً' : 'Calcul automatique et synchronisé'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activeAction !== 'menu' && (
              <button
                onClick={() => setActiveAction('menu')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold px-2 py-1 bg-stone-800 rounded-lg"
              >
                {language === 'ar' ? 'عودة' : 'Retour'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {successMessage ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <div className="text-base font-bold text-stone-100">{successMessage}</div>
              <p className="text-xs text-stone-400">تم تحديث الأرصدة والسجلات والـ Audit Log فوراً</p>
            </div>
          ) : activeAction === 'menu' ? (
            /* Action Menu Grid */
            <div className="grid grid-cols-2 gap-2.5">
              {actionList.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => setActiveAction(act.id)}
                    className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-right flex flex-col justify-between gap-2 transition active:scale-95 group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${act.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100 group-hover:text-amber-300 transition">
                        + {act.label}
                      </div>
                      <div className="text-[10px] text-stone-400 leading-tight line-clamp-1">
                        {act.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Sub-forms */
            <div>
              {/* 1. Quick Expense Form */}
              {activeAction === 'expense' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">نوع المصروف</label>
                    <select
                      value={expCategory}
                      onChange={e => setExpCategory(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      <option value="electricity">كهرباء وطاقة</option>
                      <option value="fuel">غاز ومحروقات التدفئة</option>
                      <option value="water">ماء وسقي</option>
                      <option value="cleaning_disinfection">فرشة نجارة وتطهير</option>
                      <option value="transport">نقل وتوصيل</option>
                      <option value="maintenance">صيانة وإصلاحات</option>
                      <option value="labor">عمالة مؤقتة ومياومين</option>
                      <option value="rent">إيجار المزرعة</option>
                      <option value="admin">مصاريف إدارية وهاتف</option>
                      <option value="other">مصاريف أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ الإجمالي ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={expAmount}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setExpAmount(val);
                        setExpPaidAmount(val);
                      }}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المزرعة</label>
                      <select
                        value={expFarmId}
                        onChange={e => setExpFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المرتبطة</label>
                      <select
                        value={expCycleId}
                        onChange={e => setExpCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="">بدون دورة (عام للمزرعة)</option>
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المدفوع حالياً</label>
                      <input
                        type="number"
                        value={expPaidAmount}
                        onChange={e => setExpPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الحساب المالي للدفع</label>
                      <select
                        value={expAccountId}
                        onChange={e => setExpAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">بيان / ملاحظات</label>
                    <input
                      type="text"
                      placeholder="تفاصيل المصروف..."
                      value={expDescription}
                      onChange={e => setExpDescription(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md mt-2 transition"
                  >
                    حفظ المصروف
                  </button>
                </form>
              )}

              {/* 2. Quick Wholesale Sale Form */}
              {activeAction === 'sale' && (
                <form onSubmit={handleSaleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الزبون / المشتري *</label>
                    <select
                      value={saleCustomerId}
                      onChange={e => setSaleCustomerId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'customer' || p.type === 'both').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المزرعة</label>
                      <select
                        value={saleFarmId}
                        onChange={e => setSaleFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المباعة</label>
                      <select
                        value={saleCycleId}
                        onChange={e => setSaleCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-amber-300"
                      >
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">عدد الدجاج</label>
                      <input
                        type="number"
                        required
                        placeholder="2500"
                        value={saleCount}
                        onChange={e => setSaleCount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الوزن الإجمالي (كغ)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="5400"
                        value={saleTotalWeight}
                        onChange={e => setSaleTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر الكيلو ({currency})</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={salePricePerKg}
                        onChange={e => setSalePricePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-400"
                      />
                    </div>
                  </div>

                  {saleTotalWeight && salePricePerKg && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <span className="text-stone-300 font-bold">إجمالي الفاتورة:</span>
                      <span className="text-base font-extrabold text-amber-300">
                        {(Number(saleTotalWeight) * Number(salePricePerKg)).toLocaleString()} {currency}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ المقبوض حالياً</label>
                      <input
                        type="number"
                        placeholder="المبلغ المدفوع..."
                        value={salePaid}
                        onChange={e => setSalePaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">إيداع في حساب</label>
                      <select
                        value={saleAccountId}
                        onChange={e => setSaleAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md mt-2 transition"
                  >
                    تسجيل البيعة وتحديث الذمم
                  </button>
                </form>
              )}

              {/* 3. Feed Purchase Form */}
              {activeAction === 'feed' && (
                <form onSubmit={handleFeedSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">شركة الأعلاف / المورد</label>
                    <select
                      value={feedSupplierId}
                      onChange={e => setFeedSupplierId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">نوع العلف</label>
                      <select
                        value={feedType}
                        onChange={e => setFeedType(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="starter">بادي (Starter 21%)</option>
                        <option value="grower">نامي (Grower 19%)</option>
                        <option value="finisher">ناهي (Finisher 17%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المستفيدة</label>
                      <select
                        value={feedCycleId}
                        onChange={e => setFeedCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الكمية الإجمالية (كغ)</label>
                      <input
                        type="number"
                        required
                        value={feedQuantityKg}
                        onChange={e => setFeedQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر الكيلو ({currency})</label>
                      <input
                        type="number"
                        step="0.05"
                        required
                        value={feedPricePerKg}
                        onChange={e => setFeedPricePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-400"
                      />
                    </div>
                  </div>

                  {feedQuantityKg && feedPricePerKg && (
                    <div className="p-2.5 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-between">
                      <span className="text-stone-300">الإجمالي:</span>
                      <span className="font-extrabold text-amber-400">
                        {(Number(feedQuantityKg) * Number(feedPricePerKg)).toLocaleString()} {currency}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المدفوع فوراً</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={feedPaid}
                        onChange={e => setFeedPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">طريقة الدفع</label>
                      <select
                        value={feedAccountId}
                        onChange={e => setFeedAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-400/80">
                    💡 المبلغ المتبقي يسجل تلقائياً كدين للمورد ويظهر في الذمم المالية.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ فاتورة العلف وتحديث المخزون
                  </button>
                </form>
              )}

              {/* 4. Customer Collection Form */}
              {activeAction === 'collect' && (
                <form onSubmit={handleCollectSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">اختر الزبون</label>
                    <select
                      value={collectCustomerId}
                      onChange={e => setCollectCustomerId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'customer' || p.type === 'both').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ المحصل ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={collectAmount}
                      onChange={e => setCollectAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">إيداع في الصندوق / الحساب</label>
                    <select
                      value={collectAccountId}
                      onChange={e => setCollectAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">بيان / رقم الشيك / ملاحظات</label>
                    <input
                      type="text"
                      placeholder="دفعة شيك أو نقداً..."
                      value={collectNotes}
                      onChange={e => setCollectNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد التحصيل وتخفيض دين الزبون
                  </button>
                </form>
              )}

              {/* 5. Supplier Payment Form */}
              {activeAction === 'supplier_pay' && (
                <form onSubmit={handlePaySupplierSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">اختر المورد / الشركة</label>
                    <select
                      value={paySupplierId}
                      onChange={e => setPaySupplierId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ المسدد للمورد ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">السحب من حساب</label>
                    <select
                      value={payAccountId}
                      onChange={e => setPayAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">بيان / رقم الحوالة</label>
                    <input
                      type="text"
                      placeholder="رقم الشيك أو الحوالة البنكية..."
                      value={payNotes}
                      onChange={e => setPayNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد السداد وتخفيض الدين
                  </button>
                </form>
              )}

              {/* 6. Worker Payment */}
              {activeAction === 'worker_pay' && (
                <form onSubmit={handleWorkerSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">العامل</label>
                    <select
                      value={wrkId}
                      onChange={e => setWrkId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.jobTitle})</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">نوع الحركة</label>
                      <select
                        value={wrkType}
                        onChange={e => setWrkType(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="salary">أجرة / راتب شهري</option>
                        <option value="advance_loan">سلفة (تسبيق)</option>
                        <option value="bonus">مكافأة نجاح الدورة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ ({currency})</label>
                      <input
                        type="number"
                        required
                        value={wrkAmount}
                        onChange={e => setWrkAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الصندوق / الحساب المالي</label>
                    <select
                      value={wrkAccountId}
                      onChange={e => setWrkAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تسجيل الدفع للعامل
                  </button>
                </form>
              )}

              {/* 7. Mortality Daily Log */}
              {activeAction === 'mortality' && (
                <form onSubmit={handleMortalitySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الدورة الحالية</label>
                    <select
                      value={mortCycleId}
                      onChange={e => setMortCycleId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-amber-300"
                    >
                      {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">عدد الطيور النافقة اليوم *</label>
                      <input
                        type="number"
                        required
                        placeholder="0"
                        value={mortCount}
                        onChange={e => setMortCount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">استهلاك العلف اليوم (كغ)</label>
                      <input
                        type="number"
                        placeholder="2200"
                        value={mortFeedKg}
                        onChange={e => setMortFeedKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-amber-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">ملاحظات بيطرية أو حرارة</label>
                    <input
                      type="text"
                      placeholder="حالة الفرشة، التهوية، الحرارة..."
                      value={mortNotes}
                      onChange={e => setMortNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ السجل اليومي
                  </button>
                </form>
              )}

              {/* 8. Weight Sample Log */}
              {activeAction === 'weight' && (
                <form onSubmit={handleWeightSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الدورة</label>
                    <select
                      value={weightCycleId}
                      onChange={e => setWeightCycleId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">متوسط وزن الطائر في العينة (بالغرام) *</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 1450 غرام"
                      value={sampleAvgGrams}
                      onChange={e => setSampleAvgGrams(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">ملاحظات العينة</label>
                    <input
                      type="text"
                      placeholder="عينة 50 طائر من وسط العنبر..."
                      value={weightNotes}
                      onChange={e => setWeightNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تسجيل الوزن وتحديث منحنى النمو
                  </button>
                </form>
              )}

              {/* 9. Account Transfer */}
              {activeAction === 'transfer' && (
                <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">من حساب (المصدر)</label>
                      <select
                        value={xferFromId}
                        onChange={e => setXferFromId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">إلى حساب (المستلم)</label>
                      <select
                        value={xferToId}
                        onChange={e => setXferToId(e.target.value)}
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
                    <label className="block text-stone-300 font-bold mb-1">السبب / ملاحظات</label>
                    <input
                      type="text"
                      placeholder="تغذية الصندوق، تحويل بنكي..."
                      value={xferNotes}
                      onChange={e => setXferNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد التحويل المالي
                  </button>
                </form>
              )}

              {/* 10. Medication Purchase Form */}
              {activeAction === 'med' && (
                <form onSubmit={handleMedSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المورد البيطري</label>
                    <select
                      value={medSupplierId}
                      onChange={e => setMedSupplierId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">اسم الدواء / اللقاح *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: لقاح نيوكاسل، فيتامين C، مضاد كوكسيديا..."
                      value={medName}
                      onChange={e => setMedName(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">النوع</label>
                      <select
                        value={medCategory}
                        onChange={e => setMedCategory(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="vaccine">لقاح وتحصين</option>
                        <option value="antibiotic">مضاد حيوي</option>
                        <option value="vitamin">فيتامينات ومكملات</option>
                        <option value="disinfectant">مطهر ومعقم</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المرتبطة</label>
                      <select
                        value={medCycleId}
                        onChange={e => setMedCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ الإجمالي ({currency})</label>
                      <input
                        type="number"
                        required
                        value={medAmount}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setMedAmount(val);
                          setMedPaid(val);
                        }}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المدفوع حالياً</label>
                      <input
                        type="number"
                        value={medPaid}
                        onChange={e => setMedPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الحساب المالي</label>
                    <select
                      value={medAccountId}
                      onChange={e => setMedAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ فاتورة الأدوية
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
