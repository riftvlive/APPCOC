import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Scale,
  Wheat,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const ReportsView: React.FC = () => {
  const {
    farms,
    cycles,
    allCycleSummaries,
    sales,
    expenses,
    feedPurchases,
    partnerBalances,
    partners,
    currency,
    language,
    selectedFarmId
  } = useFarm();

  const [reportType, setReportType] = useState<'pnl' | 'cycles_cost' | 'debts' | 'sales_summary'>('pnl');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // CSV Export utility
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'pnl') {
      csvContent += 'Farm,Cycle,Revenue,Chicks Cost,Feed Cost,Meds Cost,Labor Cost,Utilities,Net Profit\n';
      allCycleSummaries.forEach(s => {
        csvContent += `"${s.farmName}","${s.cycleNumber}",${s.totalRevenue},${s.chicksCost},${s.totalFeedCost},${s.totalMedicationCost},${s.totalLaborCost},${s.totalUtilitiesCost},${s.netProfit}\n`;
      });
    } else if (reportType === 'sales_summary') {
      csvContent += 'Invoice,Date,Customer,Chicken Count,Total Weight Kg,Price Per Kg,Total Amount,Paid Amount,Remaining\n';
      sales.forEach(s => {
        const cust = partners.find(p => p.id === s.customerId);
        csvContent += `"${s.invoiceNumber}","${s.date}","${cust?.name || ''}",${s.chickenCount},${s.totalWeightKg},${s.pricePerKg},${s.netTotal},${s.paidAmount},${s.remainingAmount}\n`;
      });
    } else if (reportType === 'debts') {
      csvContent += 'Partner Name,Type,Phone,Remaining Due (Receivable),Remaining Debt (Payable)\n';
      partners.forEach(p => {
        const rec = partnerBalances.customerReceivables[p.id]?.remainingDue || 0;
        const deb = partnerBalances.supplierPayables[p.id]?.remainingDebt || 0;
        csvContent += `"${p.name}","${p.type}","${p.phone}",${rec},${deb}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_report_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'مركز التقارير المحاسبية والقوائم المالية' : 'Centre des Rapports & États'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'توليد كشوفات الأرباح والخسائر، تقارير تكلفة الدورات، وأرصدة الشركاء والديون جاهزة للطباعة'
              : 'Génération de bilans, comptes de résultat et exportations Excel/PDF'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>تصدير Excel (CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>طباعة التقرير (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Buttons */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 no-print overflow-x-auto">
        <button
          onClick={() => setReportType('pnl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            reportType === 'pnl'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>قائمة الأرباح والخسائر الشاملة</span>
        </button>

        <button
          onClick={() => setReportType('cycles_cost')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            reportType === 'cycles_cost'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>كشف التكاليف التفصيلي للدورات</span>
        </button>

        <button
          onClick={() => setReportType('debts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            reportType === 'debts'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ميزان مراجعة الذمم والديون (لي / علي)</span>
        </button>

        <button
          onClick={() => setReportType('sales_summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            reportType === 'sales_summary'
              ? 'bg-amber-500 text-stone-950 shadow'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>تقرير المبيعات والتحصيلات</span>
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white text-stone-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-200 font-sans space-y-6">
        {/* Printable Header */}
        <div className="flex items-start justify-between border-b border-stone-300 pb-4">
          <div>
            <h1 className="text-xl font-black text-stone-900">
              {reportType === 'pnl' ? 'قائمة الأرباح والخسائر الشاملة (P&L Statement)' :
               reportType === 'cycles_cost' ? 'الكشف التحليلي لتكاليف دورات تربية الدجاج' :
               reportType === 'debts' ? 'جدول الذمم والديون والمبالغ المؤجلة' : 'تقرير المبيعات النقدية والآجلة'}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              نظام الإدارة الفنية والمالية لمزارع الدواجن • تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-MA')}
            </p>
          </div>
          <div className="text-left text-xs text-stone-600 font-semibold">
            <div>العملة: {currency}</div>
            <div>الحالة: معتمد ومطابق للحسابات</div>
          </div>
        </div>

        {/* Report 1: P&L Table */}
        {reportType === 'pnl' && (
          <div className="space-y-4">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 text-stone-800">
                <tr>
                  <th className="p-2.5 font-bold">المزرعة / الدورة</th>
                  <th className="p-2.5 font-bold">إجمالي الإيرادات</th>
                  <th className="p-2.5 font-bold">كلفة الكتاكيت</th>
                  <th className="p-2.5 font-bold">كلفة الأعلاف</th>
                  <th className="p-2.5 font-bold">الأدوية والبيطرة</th>
                  <th className="p-2.5 font-bold">العمالة والطاقة</th>
                  <th className="p-2.5 font-bold">إجمالي المصاريف</th>
                  <th className="p-2.5 font-bold">صافي الربح</th>
                  <th className="p-2.5 font-bold">هامش الربح %</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-800">
                {allCycleSummaries.map(s => (
                  <tr key={s.cycleId} className="hover:bg-stone-50">
                    <td className="p-2.5 font-bold">
                      {s.cycleNumber} ({s.farmName})
                    </td>
                    <td className="p-2.5 font-bold text-emerald-700">{s.totalRevenue.toLocaleString()}</td>
                    <td className="p-2.5">{s.chicksCost.toLocaleString()}</td>
                    <td className="p-2.5">{s.totalFeedCost.toLocaleString()}</td>
                    <td className="p-2.5">{s.totalMedicationCost.toLocaleString()}</td>
                    <td className="p-2.5">{(s.totalLaborCost + s.totalUtilitiesCost).toLocaleString()}</td>
                    <td className="p-2.5 font-semibold text-rose-700">{s.totalCycleCost.toLocaleString()}</td>
                    <td className={`p-2.5 font-black ${s.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {s.netProfit.toLocaleString()}
                    </td>
                    <td className="p-2.5 font-bold">{s.profitMarginPercent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-100 font-black text-stone-900 border-t-2 border-stone-300">
                <tr>
                  <td className="p-2.5">الإجمالي العام:</td>
                  <td className="p-2.5 text-emerald-800">
                    {allCycleSummaries.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()} {currency}
                  </td>
                  <td className="p-2.5">
                    {allCycleSummaries.reduce((sum, s) => sum + s.chicksCost, 0).toLocaleString()}
                  </td>
                  <td className="p-2.5">
                    {allCycleSummaries.reduce((sum, s) => sum + s.totalFeedCost, 0).toLocaleString()}
                  </td>
                  <td className="p-2.5">
                    {allCycleSummaries.reduce((sum, s) => sum + s.totalMedicationCost, 0).toLocaleString()}
                  </td>
                  <td className="p-2.5">
                    {allCycleSummaries.reduce((sum, s) => sum + s.totalLaborCost + s.totalUtilitiesCost, 0).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-rose-800">
                    {allCycleSummaries.reduce((sum, s) => sum + s.totalCycleCost, 0).toLocaleString()} {currency}
                  </td>
                  <td className="p-2.5 text-emerald-800 text-sm">
                    {allCycleSummaries.reduce((sum, s) => sum + s.netProfit, 0).toLocaleString()} {currency}
                  </td>
                  <td className="p-2.5">--</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Report 2: Cycles Detailed Cost Sheet */}
        {reportType === 'cycles_cost' && (
          <div className="space-y-4">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 text-stone-800">
                <tr>
                  <th className="p-2.5 font-bold">الدورة والمزرعة</th>
                  <th className="p-2.5 font-bold">السلالة والعدد</th>
                  <th className="p-2.5 font-bold">كلفة الكتاكيت</th>
                  <th className="p-2.5 font-bold">كمية العلف (كغ)</th>
                  <th className="p-2.5 font-bold">كلفة العلف</th>
                  <th className="p-2.5 font-bold">الأدوية والبيطرة</th>
                  <th className="p-2.5 font-bold">المصاريف الأخرى</th>
                  <th className="p-2.5 font-bold">إجمالي التكلفة</th>
                  <th className="p-2.5 font-bold">كلفة الكغ الحي</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-800">
                {allCycleSummaries.map(s => {
                  const cyc = cycles.find(c => c.id === s.cycleId);
                  return (
                    <tr key={s.cycleId} className="hover:bg-stone-50">
                      <td className="p-2.5 font-bold">
                        {s.cycleNumber} <span className="text-stone-500 font-normal">({s.farmName})</span>
                      </td>
                      <td className="p-2.5 font-semibold">
                        {cyc?.chickBreed || 'Ross 308'} ({s.initialChicksCount.toLocaleString()} طائر)
                      </td>
                      <td className="p-2.5">{s.chicksCost.toLocaleString()} {currency}</td>
                      <td className="p-2.5 font-medium">{s.totalFeedConsumedKg.toLocaleString()} كغ</td>
                      <td className="p-2.5 font-semibold">{s.totalFeedCost.toLocaleString()} {currency}</td>
                      <td className="p-2.5">{s.totalMedicationCost.toLocaleString()} {currency}</td>
                      <td className="p-2.5">{(s.totalLaborCost + s.totalUtilitiesCost).toLocaleString()} {currency}</td>
                      <td className="p-2.5 font-black text-rose-700">{s.totalCycleCost.toLocaleString()} {currency}</td>
                      <td className="p-2.5 font-black text-amber-700 bg-amber-50/50">{s.costPerKg.toFixed(2)} {currency}/كغ</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-stone-100 font-black text-stone-900 border-t-2 border-stone-300">
                <tr>
                  <td className="p-2.5" colSpan={2}>المجاميع والمتوسطات العامة:</td>
                  <td className="p-2.5">{allCycleSummaries.reduce((sum, s) => sum + s.chicksCost, 0).toLocaleString()} {currency}</td>
                  <td className="p-2.5">{allCycleSummaries.reduce((sum, s) => sum + s.totalFeedConsumedKg, 0).toLocaleString()} كغ</td>
                  <td className="p-2.5">{allCycleSummaries.reduce((sum, s) => sum + s.totalFeedCost, 0).toLocaleString()} {currency}</td>
                  <td className="p-2.5">{allCycleSummaries.reduce((sum, s) => sum + s.totalMedicationCost, 0).toLocaleString()} {currency}</td>
                  <td className="p-2.5">{allCycleSummaries.reduce((sum, s) => sum + s.totalLaborCost + s.totalUtilitiesCost, 0).toLocaleString()} {currency}</td>
                  <td className="p-2.5 text-rose-800">{allCycleSummaries.reduce((sum, s) => sum + s.totalCycleCost, 0).toLocaleString()} {currency}</td>
                  <td className="p-2.5 text-amber-800">
                    {(allCycleSummaries.reduce((sum, s) => sum + s.costPerKg, 0) / (allCycleSummaries.length || 1)).toFixed(2)} {currency}/كغ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Report 3: Debts Aging Report */}
        {reportType === 'debts' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Customer receivables */}
              <div className="border rounded-xl p-3">
                <h3 className="font-black text-xs text-stone-800 mb-2 border-b pb-1">
                  الديون المستحقة بذمة الزبناء (لي عند الغير): {partnerBalances.totalReceivables.toLocaleString()} {currency}
                </h3>
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-stone-500 border-b">
                      <th className="pb-1">الزبون</th>
                      <th className="pb-1">الهاتف</th>
                      <th className="pb-1">المبلغ المتبقي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(partnerBalances.customerReceivables)
                      .filter(([_, d]) => ((d as any)?.remainingDue || 0) > 0)
                      .map(([pId, d]) => {
                        const p = partners.find(pt => pt.id === pId);
                        const due = (d as any)?.remainingDue || 0;
                        return (
                          <tr key={pId}>
                            <td className="py-1.5 font-bold">{p?.name}</td>
                            <td className="py-1.5 text-stone-500">{p?.phone}</td>
                            <td className="py-1.5 font-black text-emerald-700">{due.toLocaleString()} {currency}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Supplier payables */}
              <div className="border rounded-xl p-3">
                <h3 className="font-black text-xs text-stone-800 mb-2 border-b pb-1">
                  الديون المستحقة للموردين (علي للغير): {partnerBalances.totalPayables.toLocaleString()} {currency}
                </h3>
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-stone-500 border-b">
                      <th className="pb-1">المورد</th>
                      <th className="pb-1">الشركة</th>
                      <th className="pb-1">المبلغ المستحق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(partnerBalances.supplierPayables)
                      .filter(([_, d]) => ((d as any)?.remainingDebt || 0) > 0)
                      .map(([pId, d]) => {
                        const p = partners.find(pt => pt.id === pId);
                        const debt = (d as any)?.remainingDebt || 0;
                        return (
                          <tr key={pId}>
                            <td className="py-1.5 font-bold">{p?.name}</td>
                            <td className="py-1.5 text-stone-500">{p?.company || '-'}</td>
                            <td className="py-1.5 font-black text-rose-700">{debt.toLocaleString()} {currency}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Report 3: Sales Summary */}
        {reportType === 'sales_summary' && (
          <div className="space-y-4">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 text-stone-800">
                <tr>
                  <th className="p-2.5 font-bold">الفاتورة / التاريخ</th>
                  <th className="p-2.5 font-bold">المشتري (الزبون)</th>
                  <th className="p-2.5 font-bold">عدد الطيور</th>
                  <th className="p-2.5 font-bold">الوزن الصافي (كغ)</th>
                  <th className="p-2.5 font-bold">سعر الكيلو</th>
                  <th className="p-2.5 font-bold">إجمالي الفاتورة</th>
                  <th className="p-2.5 font-bold">المحصل</th>
                  <th className="p-2.5 font-bold">المتبقي</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-800">
                {sales.map(s => {
                  const cust = partners.find(p => p.id === s.customerId);
                  return (
                    <tr key={s.id} className="hover:bg-stone-50">
                      <td className="p-2.5 font-bold">{s.invoiceNumber} <span className="text-stone-500 font-normal">({s.date})</span></td>
                      <td className="p-2.5 font-semibold">{cust?.name || 'زبون عام'}</td>
                      <td className="p-2.5">{s.chickenCount.toLocaleString()}</td>
                      <td className="p-2.5 font-bold">{s.totalWeightKg.toLocaleString()} كغ</td>
                      <td className="p-2.5 font-bold text-amber-700">{s.pricePerKg.toFixed(2)} {currency}</td>
                      <td className="p-2.5 font-black text-stone-900">{s.netTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{s.paidAmount.toLocaleString()}</td>
                      <td className="p-2.5 text-rose-700 font-bold">{s.remainingAmount > 0 ? s.remainingAmount.toLocaleString() : '0'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Footer / Signature Area */}
        <div className="pt-8 border-t flex items-center justify-between text-xs text-stone-600">
          <div>
            <span className="font-bold block">توقيع المسؤول المالي:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">ختم إدارة المزرعة:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
