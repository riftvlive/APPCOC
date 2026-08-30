import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Phone,
  DollarSign,
  UserCheck,
  Building2,
  Calendar,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Worker } from '../../types';

interface WorkersViewProps {
  onOpenQuickAction: (action?: string) => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({ onOpenQuickAction }) => {
  const {
    workers,
    workerTransactions,
    farms,
    accounts,
    addWorker,
    updateWorker,
    addWorkerTransaction,
    currency,
    language,
    selectedFarmId
  } = useFarm();

  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Worker | null>(null);
  const [isAddWorkerModal, setIsAddWorkerModal] = useState(false);
  const [payModalWorker, setPayModalWorker] = useState<Worker | null>(null);
  const [payType, setPayType] = useState<'salary' | 'advance_loan' | 'bonus'>('salary');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');
  const [payDescription, setPayDescription] = useState('');

  // Add Worker State
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('عامل عنبر');
  const [phone, setPhone] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number | ''>(3500);
  const [farmId, setFarmId] = useState(farms[0]?.id || '');

  const filteredWorkers = selectedFarmId === 'all'
    ? workers
    : workers.filter(w => w.farmId === selectedFarmId);

  const totalMonthlyPayroll = filteredWorkers.reduce((sum, w) => sum + w.monthlySalary, 0);

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !monthlySalary) return;

    addWorker({
      name,
      jobTitle,
      phone,
      monthlySalary: Number(monthlySalary),
      farmId,
      hireDate: new Date().toISOString().substring(0, 10),
      isActive: true,
      currentBalance: 0
    });

    setIsAddWorkerModal(false);
    setName('');
    setPhone('');
  };

  const handlePayWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalWorker || !payAmount) return;

    addWorkerTransaction({
      workerId: payModalWorker.id,
      farmId: payModalWorker.farmId,
      date: new Date().toISOString().substring(0, 10),
      type: payType,
      amount: Number(payAmount),
      accountId: payAccountId,
      description: payDescription || (payType === 'salary' ? 'صرف راتب شهري' : payType === 'advance_loan' ? 'سلفة على الراتب' : 'مكافأة نجاح الدورة')
    });

    setPayModalWorker(null);
    setPayAmount('');
    setPayDescription('');
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'إدارة العمال والأجور والمصاريف المرتبطة بهم' : 'Personnel & Salaires'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'متابعة رواتب عمال العنابر، السلف والتسبيقات (Avances)، والمكافآت وتوزيعهم على المزارع'
              : 'Salaires mensuels, avances, primes et affectation par ferme'}
          </p>
        </div>

        <button
          onClick={() => setIsAddWorkerModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'ar' ? '+ تسجيل عامل جديد' : '+ Nouvel Ouvrier'}</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">إجمالي عدد العمال</span>
          <div className="text-xl font-black text-stone-100">
            {filteredWorkers.length} <span className="text-xs font-semibold text-stone-400">عمال ومشرفين</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">كتلة الأجور الشهرية</span>
          <div className="text-xl font-black text-purple-400">
            {totalMonthlyPayroll.toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}/شهر</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <span className="text-[10px] text-stone-400 block mb-0.5">إجمالي السلف المعلقة</span>
          <div className="text-xl font-black text-amber-300">
            {filteredWorkers.reduce((s, w) => s + (w.currentBalance || 0), 0).toLocaleString()} <span className="text-xs font-semibold text-stone-400">{currency}</span>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map(worker => {
          const farm = farms.find(f => f.id === worker.farmId);
          const history = workerTransactions.filter(t => t.workerId === worker.id);
          const totalAdvances = history.filter(t => t.type === 'advance_loan').reduce((s, t) => s + t.amount, 0);

          return (
            <div
              key={worker.id}
              className="bg-stone-900 border border-stone-800 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between transition shadow-md"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-stone-100">{worker.name}</h3>
                    <span className="text-xs text-purple-400 font-semibold block">{worker.jobTitle}</span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">{worker.phone}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold border border-stone-700">
                    📍 {farm?.name || 'غير محدد'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">الراتب الشهري الأساسي:</span>
                    <span className="font-black text-stone-100">{worker.monthlySalary.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">إجمالي السلف والتسبيقات:</span>
                    <span className="font-bold text-amber-400">{totalAdvances.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                <button
                  onClick={() => setSelectedWorkerDetail(worker)}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition"
                >
                  السجل المالي
                </button>
                <button
                  onClick={() => {
                    setPayModalWorker(worker);
                    setPayAmount(worker.monthlySalary);
                  }}
                  className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl text-xs font-bold transition"
                >
                  صرف راتب / سلفة
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Worker Modal */}
      {payModalWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setPayModalWorker(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">صرف مستحقات للعامل: {payModalWorker.name}</h3>
              <button onClick={() => setPayModalWorker(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayWorkerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">نوع الصرف</label>
                <select
                  value={payType}
                  onChange={e => setPayType(e.target.value as any)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                >
                  <option value="salary">راتب شهري</option>
                  <option value="advance_loan">سلفة (تسبيق)</option>
                  <option value="bonus">مكافأة تشجيعية</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">المبلغ ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-purple-400"
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

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md transition"
              >
                تأكيد الصرف
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {isAddWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddWorkerModal(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">تسجيل عامل جديد</h3>
              <button onClick={() => setIsAddWorkerModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يونس العلوي"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">الراتب الشهري ({currency}) *</label>
                  <input
                    type="number"
                    required
                    value={monthlySalary}
                    onChange={e => setMonthlySalary(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-stone-100 font-bold text-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">المزرعة المخصصة</label>
                  <select
                    value={farmId}
                    onChange={e => setFarmId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                  >
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md transition mt-2"
              >
                حفظ العامل
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Worker Financial History Modal */}
      {selectedWorkerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setSelectedWorkerDetail(null)} />
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-extrabold text-sm text-stone-100">
                سجل حركات وأجور: {selectedWorkerDetail.name}
              </h3>
              <button onClick={() => setSelectedWorkerDetail(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                    <th className="pb-2 font-bold">التاريخ</th>
                    <th className="pb-2 font-bold">النوع والبيان</th>
                    <th className="pb-2 font-bold">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {workerTransactions.filter(t => t.workerId === selectedWorkerDetail.id).map(tx => (
                    <tr key={tx.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-2.5 text-stone-400">{tx.date}</td>
                      <td className="py-2.5 text-stone-200">{tx.description}</td>
                      <td className="py-2.5 font-bold text-purple-300">{tx.amount.toLocaleString()} {currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
