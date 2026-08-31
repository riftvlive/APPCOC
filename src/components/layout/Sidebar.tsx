import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Repeat,
  Wheat,
  ShoppingCart,
  Users2,
  Briefcase,
  DollarSign,
  Scale,
  BarChart3,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  History,
  Plus,
  X
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: () => void;
  isOpenMobileMore?: boolean;
  onCloseMobileMore?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  isOpenMobileMore,
  onCloseMobileMore
}) => {
  const { language, partnerBalances, totalActiveBirds } = useFarm();

  const menuSections = [
    {
      title: language === 'ar' ? 'العمليات والمزارع' : 'Opérations & Élevage',
      items: [
        { id: 'dashboard', label: language === 'ar' ? 'لوحة القيادة' : 'Tableau de bord', icon: LayoutDashboard },
        { id: 'farms', label: language === 'ar' ? 'إدارة المزارع' : 'Gestion des fermes', icon: Building2 },
        { id: 'cycles', label: language === 'ar' ? 'دورات التربية' : 'Bandes d’élevage', icon: Repeat, badge: `${totalActiveBirds.toLocaleString()} 🐔` },
        { id: 'feed-meds', label: language === 'ar' ? 'الأعلاف والأدوية' : 'Aliments & Santé', icon: Wheat },
        { id: 'sales', label: language === 'ar' ? 'مبيعات الجملة' : 'Ventes en gros', icon: ShoppingCart }
      ]
    },
    {
      title: language === 'ar' ? 'المالية والشركاء' : 'Finance & Partenaires',
      items: [
        { id: 'finance', label: language === 'ar' ? 'الخزينة والحسابات' : 'Trésorerie & Comptes', icon: DollarSign },
        { id: 'debts', label: language === 'ar' ? 'الذمم والديون (لي/علي)' : 'Créances & Dettes', icon: Scale, badge: `${partnerBalances.totalReceivables.toLocaleString()} DH` },
        { id: 'partners', label: language === 'ar' ? 'الزبناء والموردين' : 'Clients & Fournisseurs', icon: Users2 },
        { id: 'workers', label: language === 'ar' ? 'العمال والأجور' : 'Personnel & Salaires', icon: Briefcase }
      ]
    },
    {
      title: language === 'ar' ? 'التحليل والتقارير' : 'Analytique & IA',
      items: [
        { id: 'analytics', label: language === 'ar' ? 'مقارنة الأداء والـ FCR' : 'Performance & FCR', icon: BarChart3 },
        { id: 'reports', label: language === 'ar' ? 'التقارير المالية' : 'Rapports & Exports', icon: FileSpreadsheet },
        { id: 'ai-advisor', label: language === 'ar' ? 'المستشار الذكي (AI)' : 'Conseiller IA Avicole', icon: Sparkles, highlight: true }
      ]
    },
    {
      title: language === 'ar' ? 'الإدارة والأمان' : 'Administration & Sécurité',
      items: [
        { id: 'users', label: language === 'ar' ? 'المستخدمين والصلاحيات' : 'Utilisateurs & Rôles', icon: Users2 },
        { id: 'audit-log', label: language === 'ar' ? 'سجل نشاط العمال (Audit)' : 'Journal d’activité', icon: History },
        { id: 'audit-backup', label: language === 'ar' ? 'النسخ الاحتياطي التلقائي (Backup)' : 'Sauvegardes & Auto-Backup', icon: ShieldCheck }
      ]
    }
  ];

  const content = (
    <div className="flex flex-col h-full bg-stone-900 text-stone-200 border-l border-stone-800">
      {/* Quick Entry Action Button on Desktop */}
      <div className="p-4 border-b border-stone-800">
        <button
          id="sidebar-quick-action-btn"
          onClick={() => {
            onOpenQuickAction();
            if (onCloseMobileMore) onCloseMobileMore();
          }}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{language === 'ar' ? '+ تسجيل عملية سريعة' : '+ Action Rapide'}</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {menuSections.map((sec, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onCloseMobileMore) onCloseMobileMore();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : item.highlight
                        ? 'text-amber-300 hover:bg-stone-800/80'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 stroke-[2.5]' : item.highlight ? 'text-amber-400' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-300/90 font-medium border border-stone-700">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black">
                        PRO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/40 text-[11px] text-stone-400 text-center">
        <span>{language === 'ar' ? 'نظام مزارعنا v1.5 • غير متصل / متزامن' : 'AvicoGestion ERP v1.5'}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-53px)] sticky top-[53px] shrink-0">
        {content}
      </aside>

      {/* Mobile "More" Full Drawer Modal */}
      {isOpenMobileMore && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onCloseMobileMore} />
          <div className="relative w-4/5 max-w-xs h-full bg-stone-900 z-10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐔</span>
                <span className="font-bold text-sm text-stone-100">
                  {language === 'ar' ? 'القائمة الكاملة' : 'Menu Complet'}
                </span>
              </div>
              <button
                onClick={onCloseMobileMore}
                className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
