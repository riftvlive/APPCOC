import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Lock,
  User,
  Database,
  History,
  CheckCircle2,
  AlertTriangle,
  FileJson
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { StorageService } from '../../services/storageService';

export const AuditBackupView: React.FC = () => {
  const {
    auditLogs,
    syncStatus,
    syncData,
    currentUser,
    setCurrentUser,
    refreshAll,
    language,
    currency
  } = useFarm();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    const jsonString = StorageService.exportFullBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `poultry_farm_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const success = StorageService.importFullBackup(result);
          if (success) {
            refreshAll();
            setImportStatus('تم استرجاع قاعدة البيانات بنجاح!');
            setTimeout(() => setImportStatus(null), 3000);
          } else {
            setImportStatus('الملف غير صالح أو لا يحتوي على بنية البيانات الصحيحة.');
          }
        }
      };
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط البيانات إلى النموذج الافتراضي؟')) {
      StorageService.resetToDemoData();
      refreshAll();
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-stone-100">
              {language === 'ar' ? 'الأمان، التدقيق والنسخ الاحتياطي (Audit & Backup)' : 'Sécurité & Sauvegardes'}
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'مراقبة سجل الحركات المالية، حالة المزامنة، وتصدير أو استرجاع قواعد البيانات محلياً وسحابياً'
              : 'Journal d’audit immuable, synchronisation et export JSON complet'}
          </p>
        </div>

        <button
          onClick={syncData}
          className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>مزامنة فورية (Sync)</span>
        </button>
      </div>

      {/* Sync & Security Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">حالة التخزين المحلي</span>
            <div className="text-sm font-black text-stone-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>نشط ومحمي محلياً (Offline-Ready)</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">حالة المزامنة السحابية</span>
            <div className="text-sm font-black text-stone-100 mt-0.5">
              {syncStatus.isSyncing ? 'جاري المزامنة...' : 'متزامن بنجاح'}
            </div>
            <span className="text-[10px] text-stone-500">{syncStatus.lastSyncTime || 'الآن'}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">المستخدم الحالي والصلاحيات</span>
            <div className="text-sm font-black text-purple-300 mt-0.5">
              {currentUser.name} ({currentUser.role === 'admin' ? 'المالك العام' : currentUser.role === 'farm_manager' ? 'مدير المزرعة' : 'محاسب'})
            </div>
          </div>
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-extrabold text-stone-200 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-amber-400" />
          <span>النسخ الاحتياطي واستعادة البيانات</span>
        </h3>

        {importStatus && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 font-bold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportBackup}
            className="p-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition"
          >
            <Download className="w-5 h-5 text-amber-400" />
            <span>تصدير نسخة احتياطية كاملة (JSON)</span>
          </button>

          <label className="p-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition cursor-pointer">
            <Upload className="w-5 h-5 text-emerald-400" />
            <span>استرجاع نسخة احتياطية من ملف</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleResetDemoData}
            className="p-3.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>إعادة ضبط البيانات للنموذج التجريبي</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-3">
          <h3 className="text-xs font-extrabold text-stone-200 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span>سجل التدقيق والتتبع الأمني للحركات (Audit Trail)</span>
          </h3>
          <span className="text-xs text-stone-400">آخر 50 عملية مسجلة</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                <th className="pb-2.5 font-bold">الوقت والتاريخ</th>
                <th className="pb-2.5 font-bold">المستخدم</th>
                <th className="pb-2.5 font-bold">الإجراء</th>
                <th className="pb-2.5 font-bold">الكيان / السجل</th>
                <th className="pb-2.5 font-bold">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {auditLogs.slice(0, 50).map(log => (
                <tr key={log.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-2.5 text-stone-400 font-semibold">{new Date(log.timestamp).toLocaleString('ar-MA')}</td>
                  <td className="py-2.5 text-purple-300 font-bold">{log.userName}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action.toLowerCase().includes('create') ? 'bg-emerald-500/20 text-emerald-300' :
                      log.action.toLowerCase().includes('update') ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-stone-200 font-semibold">{log.entity || log.entityType}</td>
                  <td className="py-2.5 text-stone-400 max-w-[200px] truncate">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
