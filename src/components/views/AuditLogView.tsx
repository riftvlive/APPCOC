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
  RotateCcw,
  SlidersHorizontal,
  CalendarRange,
  Users,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { getMoroccoDateISO } from '../../utils/date';
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
    currency,
    canCancelOperations,
    cancelAuditOperation,
    feedPurchases,
    feedMovements,
    dailyLogs
  } = useFarm();

  // Search & Basic Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all'); // all, active, cancelled
  
  // Date Filtering Options
  const [dateFilterMode, setDateFilterMode] = useState<string>('all'); // all, today, yesterday, 7days, this_month, last_month, custom
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  
  // UI State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogEntry | null>(null);
  const [cancellationError, setCancellationError] = useState('');

  // Quick user map with count
  const userStats = useMemo(() => {
    const map: Record<string, number> = {};
    auditLogs.forEach(l => {
      const name = l.userName || 'غير معروف';
      map[name] = (map[name] || 0) + 1;
    });
    return map;
  }, [auditLogs]);

  // Quick statistics calculation
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const todayStr = getMoroccoDateISO();
    const todayLogs = auditLogs.filter(l => getMoroccoDateISO(new Date(l.timestamp)) === todayStr);
    
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
    const deletes = auditLogs.filter(l => l.action.toLowerCase().includes('delete') || l.cancelledAt).length;

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

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedUserFilter('all');
    setSelectedActionFilter('all');
    setSelectedEntityFilter('all');
    setSelectedStatusFilter('all');
    setDateFilterMode('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedUserFilter !== 'all' ||
      selectedActionFilter !== 'all' ||
      selectedEntityFilter !== 'all' ||
      selectedStatusFilter !== 'all' ||
      dateFilterMode !== 'all' ||
      customStartDate !== '' ||
      customEndDate !== ''
    );
  }, [
    searchQuery,
    selectedUserFilter,
    selectedActionFilter,
    selectedEntityFilter,
    selectedStatusFilter,
    dateFilterMode,
    customStartDate,
    customEndDate
  ]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStr = getMoroccoDateISO(now);
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getMoroccoDateISO(yesterday);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Month boundaries
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const firstDayThisMonth = new Date(currentYear, currentMonth, 1);
    const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayLastMonth = new Date(currentYear, currentMonth, 0);

    return auditLogs.filter(log => {
      // 1. User filter (by name or ID)
      if (selectedUserFilter !== 'all') {
        const matchesId = log.userId === selectedUserFilter;
        const matchesName = log.userName === selectedUserFilter;
        if (!matchesId && !matchesName) return false;
      }

      // 2. Action filter (Create / Update / Delete / Other)
      if (selectedActionFilter !== 'all') {
        const act = (log.action || '').toLowerCase();
        if (selectedActionFilter === 'create' && !act.includes('create')) return false;
        if (selectedActionFilter === 'update' && !act.includes('update')) return false;
        if (selectedActionFilter === 'delete' && !act.includes('delete') && !log.cancelledAt) return false;
        if (selectedActionFilter === 'auth' && !act.includes('login') && !act.includes('auth') && !act.includes('logout')) return false;
      }

      // 3. Entity filter (Department / Section)
      if (selectedEntityFilter !== 'all') {
        const ent = (log.entityType || log.entity || '').toLowerCase();
        if (ent !== selectedEntityFilter.toLowerCase()) return false;
      }

      // 4. Status filter (Active vs Cancelled)
      if (selectedStatusFilter === 'active' && log.cancelledAt) return false;
      if (selectedStatusFilter === 'cancelled' && !log.cancelledAt) return false;

      // 5. Date filter
      const logDateObj = new Date(log.timestamp);
      const logDateStr = getMoroccoDateISO(logDateObj);

      if (dateFilterMode === 'today') {
        if (logDateStr !== todayStr) return false;
      } else if (dateFilterMode === 'yesterday') {
        if (logDateStr !== yesterdayStr) return false;
      } else if (dateFilterMode === '7days') {
        if (logDateObj < sevenDaysAgo) return false;
      } else if (dateFilterMode === 'this_month') {
        if (logDateObj < firstDayThisMonth) return false;
      } else if (dateFilterMode === 'last_month') {
        if (logDateObj < firstDayLastMonth || logDateObj > lastDayLastMonth) return false;
      } else if (dateFilterMode === 'custom') {
        if (customStartDate && logDateStr < customStartDate) return false;
        if (customEndDate && logDateStr > customEndDate) return false;
      }

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          log.userName?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          (log.entityType || log.entity || '').toLowerCase().includes(q) ||
          log.entityId?.toLowerCase().includes(q) ||
          log.timestamp?.includes(q) ||
          log.cancellationReason?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [
    auditLogs,
    selectedUserFilter,
    selectedActionFilter,
    selectedEntityFilter,
    selectedStatusFilter,
    dateFilterMode,
    customStartDate,
    customEndDate,
    searchQuery
  ]);

  // Export CSV of filtered logs
  const handleExportCSV = () => {
    const headers = ['التاريخ والوقت', 'المستخدم / العامل', 'نوع الإجراء', 'القسم والكيان', 'الحالة', 'التفاصيل', 'معرف السجل'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.action}"`,
      `"${getEntityLabel(l.entityType || l.entity)}"`,
      `"${l.cancelledAt ? 'ملغى: ' + (l.cancellationReason || '') : 'ساري'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.id}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_filtered_${getMoroccoDateISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCancelOperation = (log: AuditLogEntry) => {
    if (!canCancelOperations || log.cancelledAt) return;
    setCancellationError('');
    const confirmed = window.confirm('هل أنت متأكد من إلغاء هذه العملية باعتبارها تمت بالخطأ؟');
    if (!confirmed) return;
    if (log.entityType === 'feed_purchase') {
      const usedFromSource = feedMovements.some(m => m.sourcePurchaseId === log.entityId && ['issue', 'transfer_out', 'waste'].includes(m.type));
      const purchase = feedPurchases.find(p => p.id === log.entityId);
      const usedByLinkedCycle = purchase?.cycleId ? dailyLogs.some(item => item.cycleId === purchase.cycleId && item.feedConsumedKg > 0) : false;
      if (usedFromSource || usedByLinkedCycle) {
        setCancellationError('لا يمكن إلغاء فاتورة العلف لأنها استُخدمت. ألغِ أولاً حركات الصرف أو السجلات اليومية المرتبطة بها.');
        return;
      }
    }
    const reason = 'تم الإلغاء باعتبار العملية تمت بالخطأ.';
    if (cancelAuditOperation(log.id, reason)) setSelectedLogDetail(null);
  };

  const getActionBadge = (action: string, isCancelled?: boolean) => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
          <Trash2 className="w-3 h-3" />
          <span>عملية ملغاة</span>
        </span>
      );
    }
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
              ? 'تتبع شامل وفوري لجميع الحركات والإدخالات التي قام بها كل عامل أو مشرف أو محاسب مع فلترة متقدمة حسب التاريخ والمنفّذ ونوع الإجراء'
              : 'Traçabilité complète des saisies et modifications avec filtres avancés par date, utilisateur et type d’opération'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="طباعة سجل النشاط المفلتر"
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
              مزارعنا لإدارة الدواجن • تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')} - {new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
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

      {/* Advanced Filter Box */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4 no-print shadow-md">
        {/* Top Search Bar & Toggle */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالنص، اسم العامل، رقم الفاتورة، تفاصيل القيد، معرف العملية..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>فلترة متقدمة</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
            {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="إعادة تعيين كافة الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تفريغ الفلاتر</span>
            </button>
          )}
        </div>

        {/* Detailed Filter Controls */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-stone-800 space-y-3.5 animate-fade-in">
            {/* 1. Date Filter Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>تصفية حسب التاريخ والمدة:</span>
                </div>
                {dateFilterMode !== 'all' && (
                  <button
                    onClick={() => {
                      setDateFilterMode('all');
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    عرض كل التواريخ
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'كافة الفترات' },
                  { id: 'today', label: 'اليوم فقط' },
                  { id: 'yesterday', label: 'يوم أمس' },
                  { id: '7days', label: 'آخر 7 أيام' },
                  { id: 'this_month', label: 'هذا الشهر' },
                  { id: 'last_month', label: 'الشهر الماضي' },
                  { id: 'custom', label: 'نطاق مخصص 📅' }
                ].map(period => (
                  <button
                    key={period.id}
                    onClick={() => setDateFilterMode(period.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      dateFilterMode === period.id
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'bg-stone-950 text-stone-300 border border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Selectors */}
              {dateFilterMode === 'custom' && (
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex flex-wrap items-center gap-3 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-stone-400 font-bold whitespace-nowrap">من تاريخ:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-stone-400 font-bold whitespace-nowrap">إلى تاريخ:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {(customStartDate || customEndDate) && (
                    <button
                      onClick={() => {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }}
                      className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold transition"
                    >
                      مسح النطاق
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. User & Action & Status Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* User Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>المستخدم / المنفّذ:</span>
                </label>
                <select
                  value={selectedUserFilter}
                  onChange={(e) => setSelectedUserFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">جميع العمال والمستخدمين ({users.length})</option>
                  {users.map(u => {
                    const count = userStats[u.name] || 0;
                    const roleTitle = u.role === 'admin' ? 'مدير عام' : u.role === 'farm_manager' ? 'مدير مزرعة' : u.role === 'accountant' ? 'محاسب' : 'مشرف/عامل';
                    return (
                      <option key={u.id} value={u.name}>
                        {u.name} — {roleTitle} ({count} عملية)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Action Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نوع العملية والإجراء:</span>
                </label>
                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">كافة الإجراءات والعمليات</option>
                  <option value="create">إنشاء وتسجيل جديد (Create / Add)</option>
                  <option value="update">تعديل وتحديث سجل (Update / Edit)</option>
                  <option value="delete">حذف أو إلغاء عملية (Delete / Cancel)</option>
                  <option value="auth">تسجيل دخول والنظام (Auth / Login)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>حالة العملية:</span>
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="all">الكل (سارية + ملغاة)</option>
                  <option value="active">العمليات السارية والمعتمدة فقط</option>
                  <option value="cancelled">العمليات الملغاة بالخطأ فقط</option>
                </select>
              </div>
            </div>

            {/* 3. Section / Entity Filter Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-400 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>القسم المتأثر (النطاق):</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'كافة الأقسام' },
                  { id: 'daily_log', label: 'السجلات اليومية للعنابر' },
                  { id: 'sale', label: 'المبيعات والتحصيلات' },
                  { id: 'feed_purchase', label: 'مشتريات الأعلاف' },
                  { id: 'med_purchase', label: 'الأدوية واللقاحات' },
                  { id: 'expense', label: 'المصاريف العامة' },
                  { id: 'transaction', label: 'المعاملات المالية والخزن' },
                  { id: 'worker_transaction', label: 'أجور وسلف العمال' },
                  { id: 'cycle', label: 'دورات التربية' },
                  { id: 'partner', label: 'الزبائن والموردين' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedEntityFilter(chip.id)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition ${
                      selectedEntityFilter === chip.id
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'bg-stone-950 text-stone-300 border border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Summary Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80 text-[11px]">
                <span className="text-stone-400 font-bold">الفلاتر المطبقة:</span>

                {searchQuery && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1">
                    <span>بحث: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {selectedUserFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                    <span>المستخدم: {selectedUserFilter}</span>
                    <button onClick={() => setSelectedUserFilter('all')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {selectedActionFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                    <span>الإجراء: {selectedActionFilter}</span>
                    <button onClick={() => setSelectedActionFilter('all')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {selectedEntityFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                    <span>القسم: {getEntityLabel(selectedEntityFilter)}</span>
                    <button onClick={() => setSelectedEntityFilter('all')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {dateFilterMode !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-800/60 flex items-center gap-1">
                    <span>التاريخ: {dateFilterMode === 'custom' ? `${customStartDate || 'بداية'} إلى ${customEndDate || 'الآن'}` : dateFilterMode}</span>
                    <button onClick={() => { setDateFilterMode('all'); setCustomStartDate(''); setCustomEndDate(''); }} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {selectedStatusFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1">
                    <span>الحالة: {selectedStatusFilter === 'active' ? 'سارية فقط' : 'ملغاة فقط'}</span>
                    <button onClick={() => setSelectedStatusFilter('all')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-stone-200">العمليات المطابقة للبحث:</span>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-black">
              {filteredLogs.length} حركة مسجلة
            </span>
            {hasActiveFilters && (
              <span className="text-[11px] text-stone-400 font-medium">
                (من أصل {auditLogs.length})
              </span>
            )}
          </div>
          <span className="text-xs text-stone-500 font-medium">مرتبة ترتيباً زمنياً من الأحدث إلى الأقدم</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <History className="w-12 h-12 mx-auto text-stone-600 stroke-[1.5]" />
            <p className="text-sm font-bold text-stone-300">لم يتم العثور على أي نشاط مطابق لمعايير الفلترة المحددة</p>
            <p className="text-xs text-stone-500">جرّب تغيير فلاتر التاريخ أو اسم العامل أو نوع العملية</p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط كافة الفلاتر</span>
              </button>
            )}
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
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-500/30">
                          {log.userName?.charAt(0) || 'ع'}
                        </div>
                        <div>
                          <span className="font-bold text-stone-200 block">{log.userName}</span>
                          <span className="text-[10px] text-stone-500">ID: {log.userId || 'system'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {getActionBadge(log.action, !!log.cancelledAt)}
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
                      {log.cancelledAt && (
                        <span className="inline-flex mt-1 px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 text-[10px] font-bold">
                          أُلغيت العملية: {log.cancellationReason}
                        </span>
                      )}
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
              {cancellationError && <div role="alert" className="rounded-xl border border-rose-800/70 bg-rose-950/40 p-3 text-rose-300 font-bold">{cancellationError}</div>}
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
                  <div className="mt-1">{getActionBadge(selectedLogDetail.action, !!selectedLogDetail.cancelledAt)}</div>
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
                {selectedLogDetail.cancelledAt && (
                  <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl text-rose-300 text-xs font-bold">
                    أُلغيت هذه العملية بواسطة {selectedLogDetail.cancelledBy} — السبب: {selectedLogDetail.cancellationReason}
                  </div>
                )}
              </div>

              <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                <span>معرف السجل: {selectedLogDetail.id}</span>
                <span className="text-emerald-400 font-bold">مؤمّن ومحمي ضد التعديل</span>
              </div>
            </div>

            <div className="p-4 border-t border-stone-800 flex justify-end gap-2 bg-stone-950">
              {canCancelOperations && !selectedLogDetail.cancelledAt && selectedLogDetail.entityType !== 'audit_cancel' && (
                <button
                  onClick={() => handleCancelOperation(selectedLogDetail)}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition"
                >
                  إلغاء العملية بالخطأ
                </button>
              )}
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
