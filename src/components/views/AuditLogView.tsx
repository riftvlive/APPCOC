import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  Printer,
  ShieldCheck,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  PlusCircle,
  Edit3,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { AuditLogEntry, UserRole } from '../../types';

interface AuditLogViewProps {
  onNavigate?: (tab: string, id?: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onNavigate }) => {
  const {
    auditLogs,
    users,
    farms,
    currentUser,
    language,
    currency
  } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // all, today, yesterday, 7days, 30days
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogEntry | null>(null);

  // Quick statistics calculation
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const todayStr = new Date().toISOString().substring(0, 10);
    const todayLogs = auditLogs.filter(l => l.timestamp.startsWith(todayStr));
    
    // Most active worker/user
    const userCountMap: Record<string, { name: string; count: number }> = {};
    auditLogs.forEach(l => {
      const key = l.userName || 'غير معروف';
      if (!userCountMap[key]) {
        userCountMap[key] = { name: key, count: 0 };
      }
      userCountMap[key].count++;
    });
    
    const activeWorkers = Object.values(userCountMap).sort((a, b) => b.count - a.count);
    const topWorker = activeWorkers[0] || { name: 'لا يوجد', count: 0 };

    const creates = auditLogs.filter(l => l.action.toLowerCase().includes('create')).length;
    const updates = auditLogs.filter(l => l.action.toLowerCase().includes('update')).length;
    const deletes = auditLogs.filter(l => l.action.toLowerCase().includes('delete')).length;

    return {
      total,
      todayCount: todayLogs.length,
      topWorkerName: topWorker.name,
      topWorkerCount: topWorker.count,
      creates,
      updates,
      deletes,
      uniqueUsersCount: Object.keys(userCountMap).length
    };
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return auditLogs.filter(log => {
      // User filter
      if (selectedUserFilter !== 'all') {
        const matchesId = log.userId === selectedUserFilter;
        const matchesName = log.userName === selectedUserFilter;
        if (!matchesId && !matchesName) return false;
      }

      // Action filter
      if (selectedActionFilter !== 'all') {
        const act = log.action.toLowerCase();
        if (selectedActionFilter === 'create' && !act.includes('create')) return false;
        if (selectedActionFilter === 'update' && !act.includes('update')) return false;
        if (selectedActionFilter === 'delete' && !act.includes('delete')) return false;
      }

      // Entity filter
      if (selectedEntityFilter !== 'all') {
        const ent = (log.entityType || log.entity || '').toLowerCase();
        if (ent !== selectedEntityFilter.toLowerCase()) return false;
      }

      // Date filter
      if (selectedDateFilter === 'today') {
        if (!log.timestamp.startsWith(todayStr)) return false;
      } else if (selectedDateFilter === 'yesterday') {
        if (!log.timestamp.startsWith(yesterdayStr)) return false;
      } else if (selectedDateFilter === '7days') {
        const logDate = new Date(log.timestamp);
        if (logDate < sevenDaysAgo) return false;
      } else if (selectedDateFilter === '30days') {
        const logDate = new Date(log.timestamp);
        if (logDate < thirtyDaysAgo) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          log.userName?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          (log.entityType || log.entity || '').toLowerCase().includes(q) ||
          log.timestamp?.includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [auditLogs, selectedUserFilter, selectedActionFilter, selectedEntityFilter, selectedDateFilter, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['التاريخ والوقت', 'المستخدم / العامل', 'نوع الإجراء', 'الكيان المتأثر', 'التفاصيل'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.action}"`,
      `"${l.entityType || l.entity || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_activity_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getActionBadge = (action: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <PlusCircle className="w-3 h-3" />
          <span>إنشاء / إضافة</span>
        </span>
      );
    }
    if (act.includes('update')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Edit3 className="w-3 h-3" />
          <span>تعديل وتحديث</span>
        </span>
      );
    }
    if (act.includes('delete')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <Trash2 className="w-3 h-3" />
          <span>حذف عملية</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
        <Activity className="w-3 h-3" />
        <span>{action}</span>
      </span>
    );
  };

  const getEntityLabel = (entityType?: string) => {
    const ent = (entityType || '').toLowerCase();
    switch (ent) {
      case 'daily_log': return 'سجل يومي (عنبر)';
      case 'sale': return 'فاتورة مبيعات';
      case 'feed_purchase': return 'شراء علف';
      case 'med_purchase': return 'شراء أدوية/لقاحات';
      case 'expense': return 'مصروف عام/تشغيلي';
      case 'transaction': return 'سند مالي/قبض/صرف';
      case 'worker_transaction': return 'راتب / سلفة عامل';
      case 'farm': return 'مزرعة';
      case 'cycle': return 'دورة تربية';
      case 'partner': return 'زبون / مورد';
      case 'worker': return 'ملف عامل';
      case 'user': return 'مستخدم نظام';
      case 'account_transfer': return 'تحويل بين الخزن';
      default: return entityType || 'عملية عامة';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'سجل النشاط اليومي وتتبع العمليات (Audit Log)' : 'Journal d’Audit des Utilisateurs'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'تتبع شامل وفوري لجميع الحركات والإدخالات التي قام بها كل عامل أو مشرف أو محاسب لمنع التلاعب وضمان الشفافية'
              : 'Traçabilité complète des saisies et modifications effectuées par chaque employé'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="طباعة سجل النشاط"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة السجل</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
            title="تصدير جدول إكسل CSV"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>تصدير Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Official Print Header (Visible on print only) */}
      <div className="print-only border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900">سجل الرقابة والتتبع الأمني اليومي للعمليات (Audit Log)</h1>
            <p className="text-xs text-stone-600">
              نظام مزارعنا لإدارة الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')} - {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-left text-xs text-stone-700 font-semibold">
            <div>إجمالي الحركات المطبوعة: {filteredLogs.length} حركة</div>
            <div>المشغل الحالي: {currentUser.name}</div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold">إجمالي العمليات المسجلة</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">
            {stats.total.toLocaleString()}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            سجل غير قابل للتعديل (Immutable)
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold">نشاط اليوم</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats.todayCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">
            عمليات أُجريت خلال 24 ساعة
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold">العامل / المستخدم الأكثر نشاطاً</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-black text-purple-300 truncate">
            {stats.topWorkerName}
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">
            {stats.topWorkerCount} عملية مسجلة
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold">توزيع نوع الحركات</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold mt-1">
            <span className="text-emerald-400">+{stats.creates} إضافة</span>
            <span className="text-amber-400">/{stats.updates} تعديل</span>
            <span className="text-rose-400">-{stats.deletes} حذف</span>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            من قِبل {stats.uniqueUsersCount} مستخدمين
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 no-print">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم العامل، أو رقم الفاتورة، أو الإجراء، أو تفاصيل العملية..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User selector */}
          <div className="w-full md:w-56">
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع العمال والمستخدمين</option>
              {users.map(u => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.role === 'admin' ? 'مدير عام' : u.role === 'farm_manager' ? 'مدير مزرعة' : u.role === 'accountant' ? 'محاسب' : 'مشرف/عامل'})
                </option>
              ))}
            </select>
          </div>

          {/* Action selector */}
          <div className="w-full md:w-40">
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع أنواع الإجراءات</option>
              <option value="create">إنشاء وإضافة جديدة</option>
              <option value="update">تعديل وتحديث</option>
              <option value="delete">حذف وإلغاء</option>
            </select>
          </div>

          {/* Date range filter */}
          <div className="w-full md:w-36">
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="all">كافة الفترات</option>
              <option value="today">اليوم فقط</option>
              <option value="yesterday">يوم أمس</option>
              <option value="7days">آخر 7 أيام</option>
              <option value="30days">آخر 30 يوماً</option>
            </select>
          </div>
        </div>

        {/* Entity Fast Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] text-stone-500 font-bold px-1 whitespace-nowrap">القسم:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'daily_log', label: 'السجلات اليومية للعنابر' },
            { id: 'sale', label: 'المبيعات' },
            { id: 'feed_purchase', label: 'الأعلاف' },
            { id: 'med_purchase', label: 'الأدوية واللقاحات' },
            { id: 'expense', label: 'المصاريف' },
            { id: 'transaction', label: 'المعاملات المالية' },
            { id: 'worker_transaction', label: 'أجور وسلف العمال' },
            { id: 'cycle', label: 'دورات التربية' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedEntityFilter(chip.id)}
              className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition ${
                selectedEntityFilter === chip.id
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-stone-200">العمليات المطابقة للبحث:</span>
            <span className="px-2 py-0.5 bg-stone-800 text-amber-400 rounded text-xs font-black">
              {filteredLogs.length} حركة
            </span>
          </div>
          <span className="text-xs text-stone-500 font-medium">مرتبة ترتيباً زمنياً من الأحدث إلى الأقدم</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <History className="w-12 h-12 mx-auto text-stone-600 stroke-[1.5]" />
            <p className="text-sm font-bold text-stone-300">لم يتم العثور على أي نشاط مطابق للبحث</p>
            <p className="text-xs text-stone-500">جرّب تغيير فلاتر التاريخ أو اسم العامل أو مصطلح البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-950/60 text-stone-400 text-[11px] border-b border-stone-800">
                <tr>
                  <th className="p-3.5 font-bold">الوقت والتاريخ</th>
                  <th className="p-3.5 font-bold">العامل / المستخدم</th>
                  <th className="p-3.5 font-bold">نوع الإجراء</th>
                  <th className="p-3.5 font-bold">القسم والكيان</th>
                  <th className="p-3.5 font-bold">تفاصيل العملية المنفذة</th>
                  <th className="p-3.5 font-bold text-center no-print">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogDetail(log)}
                    className="hover:bg-stone-800/40 transition cursor-pointer group"
                  >
                    <td className="p-3.5 text-stone-400 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{new Date(log.timestamp).toLocaleString('ar-MA', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}</span>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                          {log.userName?.charAt(0) || 'ع'}
                        </div>
                        <div>
                          <span className="font-bold text-stone-200 block">{log.userName}</span>
                          <span className="text-[10px] text-stone-500">ID: {log.userId || 'system'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 font-bold text-[11px] border border-stone-700">
                        {getEntityLabel(log.entityType || log.entity)}
                      </span>
                    </td>

                    <td className="p-3.5 text-stone-300 max-w-md font-medium">
                      <p className="line-clamp-2 leading-relaxed">
                        {log.details || '-'}
                      </p>
                    </td>

                    <td className="p-3.5 text-center no-print whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLogDetail(log);
                        }}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition"
                        title="عرض كافة التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-stone-100">تفاصيل القيد والنشاط الأمني</h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <div>
                  <span className="text-[10px] text-stone-500 block font-bold">العامل / المنفّذ:</span>
                  <span className="font-black text-purple-300 text-sm">{selectedLogDetail.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block font-bold">التاريخ والوقت:</span>
                  <span className="font-bold text-stone-200">{new Date(selectedLogDetail.timestamp).toLocaleString('ar-MA')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block font-bold">نوع الحركة:</span>
                  <div className="mt-1">{getActionBadge(selectedLogDetail.action)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block font-bold">القسم المتأثر:</span>
                  <span className="font-bold text-amber-400 mt-1 block">
                    {getEntityLabel(selectedLogDetail.entityType || selectedLogDetail.entity)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-stone-400 block">نص البيان والعملية الكاملة:</span>
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs leading-relaxed font-semibold">
                  {selectedLogDetail.details}
                </div>
              </div>

              <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                <span>معرف السجل: {selectedLogDetail.id}</span>
                <span className="text-emerald-400 font-bold">مؤمّن ومحمي ضد التعديل</span>
              </div>
            </div>

            <div className="p-4 border-t border-stone-800 flex justify-end gap-2 bg-stone-950">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Footer */}
      <div className="print-only pt-8 mt-6 border-t-2 border-stone-300">
        <div className="flex items-center justify-between text-xs text-stone-700">
          <div>
            <span className="font-bold block">مسؤول التدقيق والمراقبة:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
          <div>
            <span className="font-bold block">اعتماد الإدارة والختم:</span>
            <div className="h-10 border-b border-dashed border-stone-400 w-48 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
