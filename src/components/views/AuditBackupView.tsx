import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Lock,
  Database,
  History,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Clock,
  HardDrive,
  Settings2,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowDownToLine,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { getMoroccoDateISO } from '../../utils/date';
import { StorageService } from '../../services/storageService';
import { BackupSnapshot } from '../../types';

interface AuditBackupViewProps {
  onNavigate?: (tab: string) => void;
}

export const AuditBackupView: React.FC<AuditBackupViewProps> = ({ onNavigate }) => {
  const {
    auditLogs,
    syncStatus,
    syncData,
    currentUser,
    refreshAll,
    language,
    currency,
    backupSnapshots,
    autoBackupSettings,
    updateAutoBackupSettings,
    createManualBackupSnapshot,
    restoreBackupSnapshot,
    deleteBackupSnapshot
  } = useFarm();

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [snapshotModal, setSnapshotModal] = useState<{ isOpen: boolean; snapshot: BackupSnapshot | null; action: 'restore' | 'view' | 'delete' }>({
    isOpen: false,
    snapshot: null,
    action: 'restore'
  });
  const [manualDescription, setManualDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // 1. Manual Backup JSON Download
  const handleDownloadFullBackup = () => {
    try {
      const jsonString = StorageService.exportFullBackup();
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = getMoroccoDateISO();
      link.href = url;
      link.setAttribute('download', `mazariina_poultry_full_backup_${dateStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotify('تم تحميل النسخة الاحتياطية الكاملة (JSON) بنجاح إلى جهازك');
    } catch (e) {
      showNotify('حدث خطأ أثناء تنزيل النسخة الاحتياطية', 'error');
    }
  };

  // 2. Download Financial CSV
  const handleDownloadFinancialCSV = () => {
    try {
      const csvStr = StorageService.exportFinancialCSV();
      const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mazariina_financial_records_${getMoroccoDateISO()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotify('تم تصدير سجل المعاملات المالية (CSV / Excel) بنجاح');
    } catch (e) {
      showNotify('حدث خطأ أثناء تصدير السجل المالي', 'error');
    }
  };

  // 3. Download Production CSV
  const handleDownloadProductionCSV = () => {
    try {
      const csvStr = StorageService.exportProductionCSV();
      const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mazariina_production_daily_logs_${getMoroccoDateISO()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotify('تم تصدير سجلات الإنتاج والنفوق والأعلاف (CSV / Excel) بنجاح');
    } catch (e) {
      showNotify('حدث خطأ أثناء تصدير سجلات الإنتاج', 'error');
    }
  };

  // 4. Download Individual Snapshot JSON
  const handleDownloadSnapshot = (snap: BackupSnapshot) => {
    try {
      const blob = new Blob([snap.dataJson], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timeStr = new Date(snap.timestamp).toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.setAttribute('download', `snapshot_${snap.trigger}_${timeStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotify(`تم تنزيل النسخة المحفوظة (${snap.description})`);
    } catch (e) {
      showNotify('فشل تنزيل ملف النسخة', 'error');
    }
  };

  // 5. Create Manual Snapshot Now
  const handleCreateManualSnapshot = () => {
    setIsProcessing(true);
    try {
      const snap = createManualBackupSnapshot(manualDescription.trim() || undefined);
      setShowCreateModal(false);
      setManualDescription('');
      showNotify(`تم إنشاء نقطة استعادة يدوية جديدة (${snap.recordStats.cycles} دورات، ${snap.recordStats.transactions} حركة مالية)`);
    } catch (e) {
      showNotify('فشل إنشاء النسخة الاحتياطية', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Restore from Snapshot
  const handleConfirmRestore = () => {
    if (!snapshotModal.snapshot) return;
    setIsProcessing(true);
    try {
      const success = restoreBackupSnapshot(snapshotModal.snapshot.id);
      if (success) {
        setSnapshotModal({ isOpen: false, snapshot: null, action: 'restore' });
        showNotify('تمت استعادة قاعدة البيانات بنجاح إلى النقطة الزمنية المحددة');
      } else {
        showNotify('فشلت عملية الاستعادة. تحقق من صحة بيانات النسخة.', 'error');
      }
    } catch (e) {
      showNotify('حدث خطأ أثناء الاسترجاع', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. Import Backup File from PC
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      fileReader.readAsText(file, 'UTF-8');
      fileReader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          try {
            // Validate JSON
            const parsed = JSON.parse(result);
            if (!parsed.farms && !parsed.cycles && !parsed.dailyLogs && !parsed.transactions) {
              showNotify('الملف لا يحتوي على بنية بيانات نظام مزارعنا الصحيحة.', 'error');
              return;
            }

            // Save pre-restore backup first
            StorageService.createBackupSnapshot('pre_restore', `نسخة أمان قبل استيراد ملف خارجي (${file.name})`);

            const success = StorageService.importFullBackup(result);
            if (success) {
              refreshAll();
              showNotify('تم استيراد واسترجاع قاعدة البيانات من الملف الخارجي بنجاح!');
            } else {
              showNotify('فشل استيراد الملف. تأكد من توافق الإصدار.', 'error');
            }
          } catch (err) {
            showNotify('الملف غير صالح أو تالف.', 'error');
          }
        }
      };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xl border animate-bounce-short ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : notificationMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{notificationMsg.text}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-xs text-stone-400 hover:text-white px-2 py-1"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-100">
                  النسخ الاحتياطي التلقائي وأمان البيانات (Auto-Backup & Data Vault)
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  حماية متواصلة لسجلات المزرعة الإنتاجية والمالية مع نقاط استرجاع تلقائية وتحميل يدوي فوري
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition flex-1 sm:flex-initial"
            >
              <Sparkles className="w-4 h-4" />
              <span>حفظ نسخة يدوية فورية</span>
            </button>

            <button
              onClick={handleDownloadFullBackup}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تحميل نسخة كاملة (JSON)</span>
            </button>

            <button
              onClick={syncData}
              disabled={syncStatus.isSyncing}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              title="مزامنة فورية وحفظ سحابي"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">مزامنة سحابية</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Auto Backup State */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            autoBackupSettings.enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-stone-800 text-stone-500'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-semibold">حالة النسخ التلقائي</span>
            <div className="text-sm font-black text-stone-100 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${autoBackupSettings.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} />
              <span>{autoBackupSettings.enabled ? 'مفعّل ويعمل تلقائياً' : 'متوقف مؤقتاً'}</span>
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              التكرار: كل {autoBackupSettings.intervalMinutes >= 60 ? `${autoBackupSettings.intervalMinutes / 60} ساعة` : `${autoBackupSettings.intervalMinutes} دقيقة`}
            </span>
          </div>
        </div>

        {/* Snapshots Count */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-semibold">نقاط الاسترجاع المحفوظة</span>
            <div className="text-sm font-black text-amber-300 mt-0.5">
              {backupSnapshots.length} من أصل {autoBackupSettings.maxSnapshotsToKeep || 10} نسخة
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">حفظ متدرج ومحمي من الفقدان</span>
          </div>
        </div>

        {/* Last Backup Time */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-semibold">آخر حفظ احتياطي</span>
            <div className="text-sm font-black text-sky-200 mt-0.5">
              {autoBackupSettings.lastBackupTimestamp
                ? new Date(autoBackupSettings.lastBackupTimestamp).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'الآن'}
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {autoBackupSettings.lastBackupTimestamp
                ? new Date(autoBackupSettings.lastBackupTimestamp).toLocaleDateString('ar-MA')
                : 'جاهز'}
            </span>
          </div>
        </div>

        {/* User Role Security */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-semibold">صلاحية إدارة قواعد البيانات</span>
            <div className="text-sm font-black text-purple-300 mt-0.5 truncate max-w-[130px]">
              {currentUser.name}
            </div>
            <span className="text-[10px] text-purple-400/80 font-bold block">
              {currentUser.role === 'admin' ? 'المالك العام (Super Admin)' : currentUser.role === 'farm_manager' ? 'مدير المزرعة' : 'محاسب'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Auto-Backup Settings & Manual Export Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Automated Backup Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-stone-100">إعدادات النسخ الاحتياطي التلقائي</h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-extrabold rounded-lg border border-amber-500/20">
              قاعدة البيانات الآمنة
            </span>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between bg-stone-950/60 border border-stone-800/80 p-3.5 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-stone-200 block">تفعيل الحفظ الدوري التلقائي</span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                حفظ لقطات مشفرة في التخزين الدائم تلقائياً بالخلفية
              </span>
            </div>
            <button
              onClick={() => {
                const nextState = !autoBackupSettings.enabled;
                updateAutoBackupSettings({ enabled: nextState });
                showNotify(nextState ? 'تم تفعيل النسخ الاحتياطي التلقائي' : 'تم إيقاف النسخ الاحتياطي التلقائي', nextState ? 'success' : 'info');
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
                autoBackupSettings.enabled ? 'bg-emerald-500' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                  autoBackupSettings.enabled ? 'translate-x-0' : '-translate-x-5.5'
                }`}
              />
            </button>
          </div>

          {/* Interval Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              الفترة الزمنية بين كل نسخ احتياطي تلقائي:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '15 دقيقة', val: 15 },
                { label: '1 ساعة', val: 60 },
                { label: '6 ساعات', val: 360 },
                { label: '24 ساعة (يومياً)', val: 1440 }
              ].map(item => (
                <button
                  key={item.val}
                  disabled={!autoBackupSettings.enabled}
                  onClick={() => {
                    updateAutoBackupSettings({ intervalMinutes: item.val });
                    showNotify(`تم ضبط تكرار النسخ الاحتياطي كل ${item.label}`);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                    autoBackupSettings.intervalMinutes === item.val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-stone-800/80 border-stone-700/60 text-stone-400 hover:text-stone-200'
                  } ${!autoBackupSettings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Critical Action Trigger */}
          <div className="bg-stone-950/40 border border-stone-800/80 p-3.5 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="criticalActionToggle"
              checked={autoBackupSettings.backupOnCriticalAction}
              disabled={!autoBackupSettings.enabled}
              onChange={(e) => {
                updateAutoBackupSettings({ backupOnCriticalAction: e.target.checked });
                showNotify(e.target.checked ? 'تم تفعيل الحفظ عند المعاملات الحرجة' : 'تم تعطيل الحفظ التلقائي عند المعاملات');
              }}
              className="mt-0.5 rounded bg-stone-800 border-stone-700 text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="criticalActionToggle" className="text-xs text-stone-300 cursor-pointer">
              <span className="font-bold block text-stone-200">حفظ فوري عند أي عملية مالية أو إنتاجية مهمة</span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                توليد نقطة استرجاع تلقائياً عند تسجيل فاتورة بيع جديدة، توريد علف/أدوية، أو تدوين سجل إنتاج يومي.
              </span>
            </label>
          </div>

          {/* Retention Max Snapshots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-300">الحد الأقصى للنقاط المحتفظ بها:</span>
              <span className="font-extrabold text-amber-400">{autoBackupSettings.maxSnapshotsToKeep || 10} نسخ</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={autoBackupSettings.maxSnapshotsToKeep || 10}
              disabled={!autoBackupSettings.enabled}
              onChange={(e) => updateAutoBackupSettings({ maxSnapshotsToKeep: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-stone-500 block">
              يتم استبدال أقدم نسخة تلقائياً عند امتلاء الحد للحفاظ على خفة وسرعة الأداء.
            </span>
          </div>
        </div>

        {/* Right Column: Manual Backup & Export Suite (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-stone-100">خيارات التصدير والتحميل اليدوي للبيانات</h3>
            </div>
            <span className="text-xs text-stone-400">تنزيل مباشر لجهازك</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Full JSON Backup */}
            <div className="bg-stone-950/60 border border-stone-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2.5">
                  <FileJson className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-stone-100 group-hover:text-emerald-300 transition">
                  نسخة JSON الكاملة
                </h4>
                <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                  تشمل كامل المزارع، الدورات، الحركات المالية، السجلات اليومية، والعمال في ملف واحد قابل للاسترجاع.
                </p>
              </div>
              <button
                onClick={handleDownloadFullBackup}
                className="w-full py-2 bg-stone-800 hover:bg-emerald-600 hover:text-white text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>تحميل JSON</span>
              </button>
            </div>

            {/* Financial CSV */}
            <div className="bg-stone-950/60 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2.5">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-stone-100 group-hover:text-amber-300 transition">
                  سجل المالية (Excel/CSV)
                </h4>
                <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                  تصدير حركات الخزينة، سندات القبض والدفع، مبيعات الدواجن، ومشتريات الأعلاف كجدول إكسل.
                </p>
              </div>
              <button
                onClick={handleDownloadFinancialCSV}
                className="w-full py-2 bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>
            </div>

            {/* Production Daily Logs CSV */}
            <div className="bg-stone-950/60 border border-stone-800 hover:border-sky-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-2.5">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-stone-100 group-hover:text-sky-300 transition">
                  سجلات الإنتاج (CSV)
                </h4>
                <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                  تصدير جداول استهلاك العلف اليومي، معدلات النفوق، أوزان العينات، واستهلاك المياه لكل الدورات.
                </p>
              </div>
              <button
                onClick={handleDownloadProductionCSV}
                className="w-full py-2 bg-stone-800 hover:bg-sky-600 hover:text-white text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>تصدير CSV</span>
              </button>
            </div>
          </div>

          {/* External Restore & Safety Dropzone */}
          <div className="bg-stone-950/40 border border-dashed border-stone-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-stone-200 block">استرجاع قاعدة البيانات من ملف خارجي</span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  يقوم النظام تلقائياً بحفظ نقطة أمان احتياطية قبل تطبيق الاسترجاع
                </span>
              </div>
            </div>

            <label className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shrink-0">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>اختيار ملف .json</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Snapshots Timeline & One-Click Restore Center */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-stone-100">
                سجل لقطات النسخ الاحتياطي ونقاط الاسترجاع (Recovery Timeline)
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              يمكنك الرجوع لأي نقطة زمنية بضغطة زر واحدة، أو تحميل ملف النسخة بشكل مستقل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إنشاء لقطة الآن</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('audit_log')}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <span>عرض سجل تدقيق العمليات</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Snapshots List Table */}
        {backupSnapshots.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-3">
            <HardDrive className="w-10 h-10 mx-auto text-stone-600" />
            <p className="text-xs font-bold">لا توجد لقطات نسخ احتياطي محفوظة حالياً.</p>
            <button
              onClick={() => handleCreateManualSnapshot()}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition"
            >
              إنشاء أول نسخة احتياطية الآن
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                  <th className="pb-3 font-bold pr-2">نوع النسخة / السبب</th>
                  <th className="pb-3 font-bold">التاريخ والتوقيت</th>
                  <th className="pb-3 font-bold">المحتوى والإحصائيات</th>
                  <th className="pb-3 font-bold">حجم البيانات</th>
                  <th className="pb-3 font-bold text-center pl-2">إجراءات الاسترجاع والتحميل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {backupSnapshots.map((snap) => {
                  const triggerBadge =
                    snap.trigger === 'auto_interval'
                      ? { label: 'تلقائي زمني', style: 'bg-sky-500/20 text-sky-300 border-sky-500/30' }
                      : snap.trigger === 'auto_action'
                      ? { label: 'تلقائي عند عملية', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
                      : snap.trigger === 'pre_restore'
                      ? { label: 'أمان قبل الاسترجاع', style: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
                      : { label: 'نسخة يدوية', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };

                  return (
                    <tr key={snap.id} className="hover:bg-stone-800/40 transition group">
                      {/* Reason & Trigger */}
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${triggerBadge.style}`}>
                            {triggerBadge.label}
                          </span>
                          <span className="text-xs font-bold text-stone-200">{snap.description}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 text-stone-300 font-semibold whitespace-nowrap">
                        <div>{new Date(snap.timestamp).toLocaleDateString('ar-MA')}</div>
                        <div className="text-[10px] text-stone-500">
                          {new Date(snap.timestamp).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 text-stone-300">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <span>📊 {snap.recordStats.cycles} دورات</span>
                          <span>•</span>
                          <span>💰 {snap.recordStats.transactions} حركة مالية</span>
                          <span>•</span>
                          <span>📝 {snap.recordStats.dailyLogs} سجل يومي</span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3.5 text-stone-400 font-mono text-[11px]">
                        {(snap.sizeBytes / 1024).toFixed(1)} KB
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Download */}
                          <button
                            onClick={() => handleDownloadSnapshot(snap)}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-emerald-400 rounded-lg transition"
                            title="تحميل ملف هذه النسخة (JSON)"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Restore */}
                          <button
                            onClick={() => setSnapshotModal({ isOpen: true, snapshot: snap, action: 'restore' })}
                            className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-700/50 flex items-center gap-1 transition shadow-sm"
                            title="استرجاع قاعدة البيانات لهذه النقطة"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>استرجاع</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm('هل تريد حذف هذه اللقطة الاحتياطية من السجل؟')) {
                                deleteBackupSnapshot(snap.id);
                                showNotify('تم حذف لقطة النسخ الاحتياطي');
                              }
                            }}
                            className="p-1.5 bg-stone-800/80 hover:bg-rose-950 text-stone-500 hover:text-rose-400 rounded-lg transition"
                            title="حذف اللقطة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Manual Snapshot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-stone-100">إنشاء نقطة استرجاع يدوية جديدة</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              سيتم أخذ لقطة كاملة لقاعدة البيانات الحالية بكافة السجلات المالية والإنتاجية وحفظها في جدول نقاط الاسترجاع.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">وصف أو سبب النسخة (اختياري):</label>
              <input
                type="text"
                placeholder="مثلاً: قبل إغلاق دورة عنبر رقم 2 أو قبل جرد الشهر"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={handleCreateManualSnapshot}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                {isProcessing ? 'جاري الحفظ...' : 'تأكيد الحفظ الآن'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {snapshotModal.isOpen && snapshotModal.snapshot && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3 text-amber-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-black text-stone-100">تأكيد استرجاع نقطة الاستعادة</h3>
            </div>

            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>أنت على وشك استرجاع البيانات إلى:</span>
              </div>
              <div className="text-xs text-stone-300 font-semibold">
                📌 {snapshotModal.snapshot.description}
              </div>
              <div className="text-[11px] text-stone-400">
                تاريخ اللقطة: {new Date(snapshotModal.snapshot.timestamp).toLocaleString('ar-MA')}
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              سيتم استبدال البيانات الحالية بالبيانات الموجودة في هذه اللقطة. سيقوم النظام تلقائياً بحفظ نقطة أمان قبل تنفيذ الاسترجاع.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={handleConfirmRestore}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
              >
                {isProcessing ? 'جاري الاسترجاع...' : 'تأكيد الاسترجاع الآن'}
              </button>
              <button
                onClick={() => setSnapshotModal({ isOpen: false, snapshot: null, action: 'restore' })}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
