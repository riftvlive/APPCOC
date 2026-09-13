import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Repeat,
  Wheat,
  Baby,
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
  X,
  LogOut,
  Sun,
  Moon,
  Palette,
  Coins,
  Warehouse,
  Pill,
  Truck,
  ArrowDownRight
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { UserPermissions } from '../../types';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof UserPermissions;
  badge?: string;
  highlight?: boolean;
  adminOnly?: boolean;
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: (action?: string, platform?: 'chicks' | 'feed' | 'farms') => void;
  onLogout: () => void;
  theme: 'dark' | 'light' | 'sand';
  onThemeChange: (theme: 'dark' | 'light' | 'sand') => void;
  isOpenMobileMore?: boolean;
  onCloseMobileMore?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  onLogout,
  theme,
  onThemeChange,
  isOpenMobileMore,
  onCloseMobileMore
}) => {
  const {
    language,
    partnerBalances,
    totalActiveBirds,
    hasPermission,
    currentUser,
    chickPurchases,
    feedPurchases,
    feedMovements,
    feedSales,
    farms
  } = useFarm();

  // Determine current active domain
  const currentDomain: 'chicks' | 'farms' | 'feed' =
    activeTab.startsWith('chicks')
      ? 'chicks'
      : (activeTab.startsWith('feed') || activeTab === 'feed-meds' || activeTab === 'feed_meds')
        ? 'feed'
        : 'farms';

  const roleLabel = currentUser.role === 'admin'
    ? (language === 'ar' ? 'المدير العام' : 'Administrateur')
    : currentUser.role === 'accountant'
      ? (language === 'ar' ? 'المحاسب' : 'Comptable')
      : currentUser.role === 'farm_manager'
        ? (language === 'ar' ? 'مدير المزرعة' : 'Chef de ferme')
        : (language === 'ar' ? 'مشرف التشغيل' : 'Superviseur');
  const userInitials = currentUser.name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('') || '؟';

  // Stats for badge pills
  const totalChicks = chickPurchases.reduce((sum, p) => sum + (p.quantityReceived || p.quantityOrdered || 0), 0);
  const totalFeedTonnes = (
    feedPurchases.reduce((acc, p) => acc + (p.weightKg || p.quantityBags * 50), 0) -
    feedMovements.filter(m => m.type === 'issue' || m.type === 'waste').reduce((acc, m) => acc + m.weightKg, 0) -
    feedSales.reduce((acc, s) => acc + s.weightKg, 0)
  ) / 1000;

  // 1. CHICKS APP SECTIONS
  const chicksMenuSections: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: language === 'ar' ? 'العمليات' : 'Opérations',
      items: [
        { id: 'chicks_overview', label: language === 'ar' ? 'نظرة عامة' : 'Aperçu', icon: Baby, badge: `${totalChicks.toLocaleString()}` },
        { id: 'chicks_purchases', label: language === 'ar' ? 'الشراء والاستلام' : 'Achats', icon: Plus, permission: 'canManagePurchases' },
        { id: 'chicks_sales', label: language === 'ar' ? 'البيع للزبائن' : 'Ventes', icon: ShoppingCart, permission: 'canManageSales' },
        { id: 'chicks_distribution', label: language === 'ar' ? 'التسكين والعنابر' : 'Mise en place', icon: Truck, permission: 'canManagePurchases' },
        { id: 'chicks_hatcheries', label: language === 'ar' ? 'دليل المفارخ' : 'Couvoirs', icon: Building2, permission: 'canManagePurchases' }
      ]
    },
    {
      title: language === 'ar' ? 'المالية' : 'Finance',
      items: [
        { id: 'chicks_finance', label: language === 'ar' ? 'لوحة الأموال' : 'Trésorerie & Dettes', icon: Coins, highlight: true, permission: 'canManageFinance' },
        { id: 'partners', label: language === 'ar' ? 'الزبناء والموردين' : 'Tiers', icon: Users2, permission: 'canManageFinance' }
      ]
    }
  ];

  // 2. FEED APP SECTIONS
  const feedMenuSections: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: language === 'ar' ? 'العمليات' : 'Opérations',
      items: [
        { id: 'feed_overview', label: language === 'ar' ? 'مخزون المستودع' : 'Stock', icon: Warehouse, badge: `${Math.max(0, totalFeedTonnes).toFixed(1)} طن` },
        { id: 'feed_purchases', label: language === 'ar' ? 'شراء العلف' : 'Achats', icon: Plus, permission: 'canManagePurchases' },
        { id: 'feed_sales', label: language === 'ar' ? 'بيع العلف' : 'Ventes', icon: ShoppingCart, permission: 'canManageSales' },
        { id: 'feed_issues', label: language === 'ar' ? 'صرف للمزارع' : 'Distribution', icon: ArrowDownRight, permission: 'canManagePurchases' },
        { id: 'feed_suppliers', label: language === 'ar' ? 'موردي الأعلاف' : 'Fournisseurs', icon: Building2, permission: 'canManagePurchases' },
        { id: 'feed_adjustments', label: language === 'ar' ? 'جرد وتسوية' : 'Inventaire', icon: Scale, permission: 'canManagePurchases' },
        { id: 'feed_meds_list', label: language === 'ar' ? 'الأدوية واللقاحات' : 'Médicaments', icon: Pill, permission: 'canManagePurchases' }
      ]
    },
    {
      title: language === 'ar' ? 'المالية' : 'Finance',
      items: [
        { id: 'feed_finance', label: language === 'ar' ? 'لوحة الأموال' : 'Trésorerie & Créances', icon: DollarSign, highlight: true, permission: 'canManageFinance' },
        { id: 'partners', label: language === 'ar' ? 'الزبناء والموردين' : 'Tiers', icon: Users2, permission: 'canManageFinance' }
      ]
    }
  ];

  // 3. FARMS & CYCLES APP SECTIONS
  const farmsMenuSections: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: language === 'ar' ? 'الإنتاج' : 'Production',
      items: [
        { id: 'dashboard', label: language === 'ar' ? 'لوحة القيادة' : 'Tableau de bord', icon: LayoutDashboard, badge: `${totalActiveBirds.toLocaleString()} 🐔` },
        { id: 'farms', label: language === 'ar' ? 'المزارع والعنابر' : 'Fermes', icon: Building2, badge: `${farms.length}` },
        { id: 'cycles', label: language === 'ar' ? 'الدورات والتسمين' : 'Bandes actives', icon: Repeat, permission: 'canEnterDailyLogs' },
        { id: 'sales', label: language === 'ar' ? 'بيع الدواجن' : 'Ventes volailles', icon: ShoppingCart, permission: 'canManageSales' },
        { id: 'workers', label: language === 'ar' ? 'العمال والأجور' : 'Personnel', icon: Briefcase, permission: 'canManageWorkers' }
      ]
    },
    {
      title: language === 'ar' ? 'المالية' : 'Finance',
      items: [
        { id: 'finance', label: language === 'ar' ? 'الخزينة والحسابات' : 'Trésorerie', icon: DollarSign, permission: 'canManageFinance' },
        { id: 'debts', label: language === 'ar' ? 'الديون والذمم' : 'Dettes & Créances', icon: Scale, badge: language === 'ar'
          ? `لي ${partnerBalances.totalReceivables.toLocaleString()} / علي ${partnerBalances.totalPayables.toLocaleString()}`
          : `${partnerBalances.totalReceivables.toLocaleString()}`, permission: 'canManageFinance' },
        { id: 'partners', label: language === 'ar' ? 'الزبناء والموردين' : 'Tiers', icon: Users2, permission: 'canManageFinance' },
        { id: 'analytics', label: language === 'ar' ? 'التحليلات والـ FCR' : 'Analyses & FCR', icon: BarChart3, permission: 'canViewReports' },
        { id: 'reports', label: language === 'ar' ? 'التقارير' : 'Rapports', icon: FileSpreadsheet, permission: 'canViewReports' },
        { id: 'ai-advisor', label: language === 'ar' ? 'المستشار الذكي' : 'Conseiller IA', icon: Sparkles, highlight: true, permission: 'canViewReports' }
      ]
    },
    {
      title: language === 'ar' ? 'النظام' : 'Système',
      items: [
        { id: 'users', label: language === 'ar' ? 'المستخدمين والصلاحيات' : 'Utilisateurs', icon: Users2, permission: 'canManageUsers' },
        { id: 'audit-log', label: language === 'ar' ? 'سجل النشاط' : 'Journal', icon: History, permission: 'canViewReports' },
        { id: 'audit-backup', label: language === 'ar' ? 'النسخ الاحتياطي' : 'Sauvegarde', icon: ShieldCheck, adminOnly: true }
      ]
    }
  ];

  // Select active sections and colors based on domain
  const activeMenuSections =
    currentDomain === 'chicks'
      ? chicksMenuSections
      : currentDomain === 'feed'
        ? feedMenuSections
        : farmsMenuSections;

  const domainStyles = {
    chicks: {
      sidebarBg: 'bg-stone-900 border-l border-amber-500/30',
      activeItemClass: 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40',
      iconActiveColor: 'text-amber-400',
      bannerBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/30',
      bannerTitle: language === 'ar' ? 'الكتاكيت' : 'Poussins',
      bannerBadge: `${totalChicks.toLocaleString()} كتكوت`,
      bannerIcon: Baby,
      badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30'
    },
    feed: {
      sidebarBg: 'bg-stone-900 border-l border-yellow-500/30',
      activeItemClass: 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40',
      iconActiveColor: 'text-yellow-400',
      bannerBg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
      bannerTitle: language === 'ar' ? 'العلف' : 'Aliments',
      bannerBadge: `${Math.max(0, totalFeedTonnes).toFixed(1)} طن`,
      bannerIcon: Wheat,
      badgeColor: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30'
    },
    farms: {
      sidebarBg: 'bg-stone-900 border-l border-emerald-500/30',
      activeItemClass: 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40',
      iconActiveColor: 'text-emerald-400',
      bannerBg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      bannerTitle: language === 'ar' ? 'المزارع' : 'Fermes',
      bannerBadge: `${totalActiveBirds.toLocaleString()} طائر`,
      bannerIcon: Building2,
      badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
    }
  }[currentDomain];

  const DomainIcon = domainStyles.bannerIcon;

  // Determine if item is active (matching exact ID or fallback to main domain)
  const isItemActive = (itemId: string) => {
    if (activeTab === itemId) return true;
    if (currentDomain === 'chicks' && (activeTab === 'chicks' || activeTab === 'chicks_overview') && itemId === 'chicks_overview') return true;
    if (currentDomain === 'feed' && (activeTab === 'feed_meds' || activeTab === 'feed-meds' || activeTab === 'feed_overview') && itemId === 'feed_overview') return true;
    if (currentDomain === 'farms' && activeTab === 'dashboard' && itemId === 'dashboard') return true;
    return false;
  };

  const content = (
    <div className={`flex flex-col h-full ${domainStyles.sidebarBg} text-stone-200 transition-colors duration-300`}>
      {/* 3 Main Platforms Switcher Tabs */}
      <div className="p-2 border-b border-stone-800/80 bg-stone-950/70">
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-900 rounded-xl border border-stone-800">
          <button
            type="button"
            id="sidebar-domain-chicks"
            onClick={() => {
              setActiveTab('chicks');
              if (onCloseMobileMore) onCloseMobileMore();
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
              currentDomain === 'chicks'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Baby className="w-3.5 h-3.5 mb-0.5" />
            <span>{language === 'ar' ? 'الكتاكيت' : 'Poussins'}</span>
          </button>
          <button
            type="button"
            id="sidebar-domain-farms"
            onClick={() => {
              setActiveTab('dashboard');
              if (onCloseMobileMore) onCloseMobileMore();
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
              currentDomain === 'farms'
                ? 'bg-emerald-500 text-stone-950 font-black shadow-md shadow-emerald-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 mb-0.5" />
            <span>{language === 'ar' ? 'المزارع' : 'Fermes'}</span>
          </button>
          <button
            type="button"
            id="sidebar-domain-feed"
            onClick={() => {
              setActiveTab('feed-meds');
              if (onCloseMobileMore) onCloseMobileMore();
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
              currentDomain === 'feed'
                ? 'bg-yellow-500 text-stone-950 font-black shadow-md shadow-yellow-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 mb-0.5" />
            <span>{language === 'ar' ? 'العلف' : 'Aliments'}</span>
          </button>
        </div>
      </div>

      {/* App Domain Header Identity Card */}
      <div className="p-3 border-b border-stone-800 space-y-2">
        <div className={`rounded-xl p-3 border ${domainStyles.bannerBg} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shadow-inner">
              <DomainIcon className={`w-4 h-4 ${domainStyles.iconActiveColor}`} />
            </div>
            <div>
              <div className="text-xs font-black text-white">{domainStyles.bannerTitle}</div>
              <div className="text-[10px] text-stone-400 font-medium">{domainStyles.bannerBadge}</div>
            </div>
          </div>
        </div>

        {/* Quick Action Button for this Platform */}
        <button
          onClick={() => onOpenQuickAction(undefined, currentDomain)}
          className="w-full py-1.5 px-2.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-stone-700/70 text-stone-200 hover:text-amber-300 text-xs font-bold flex items-center justify-between transition active:scale-[0.98] group"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400 font-black text-sm">⚡</span>
            <span>{language === 'ar' ? 'عملية سريعة' : 'Action Rapide'}</span>
          </span>
          <span className="text-[10px] font-mono text-stone-400 group-hover:text-amber-300 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">&lt; 10s</span>
        </button>
      </div>

      {/* Nav List for the current active domain */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeMenuSections.filter(sec => sec.items.some(item => (!item.permission || hasPermission(item.permission)) && (!item.adminOnly || currentUser.role === 'admin'))).map((sec, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.filter(item => (!item.permission || hasPermission(item.permission)) && (!item.adminOnly || currentUser.role === 'admin')).map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.id);

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
                        ? domainStyles.activeItemClass
                        : item.highlight
                        ? 'text-amber-300 hover:bg-stone-800/80'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? `${domainStyles.iconActiveColor} stroke-[2.5]` : item.highlight ? 'text-amber-400' : 'text-stone-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border shrink-0 ${domainStyles.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black shrink-0">
                        مالية
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Domain Switcher Footer Bar */}
      <div className="p-2 border-t border-stone-800/80 bg-stone-950/40">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('chicks')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition flex flex-col items-center gap-0.5 ${
              currentDomain === 'chicks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/40'
            }`}
          >
            <Baby className="w-3 h-3" />
            <span>كتاكيت</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition flex flex-col items-center gap-0.5 ${
              currentDomain === 'farms'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/40'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>مزارع</span>
          </button>
          <button
            onClick={() => setActiveTab('feed-meds')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition flex flex-col items-center gap-0.5 ${
              currentDomain === 'feed'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/40'
            }`}
          >
            <Wheat className="w-3 h-3" />
            <span>علف</span>
          </button>
        </div>
      </div>

      {/* User profile & Theme actions */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/60 space-y-1.5">
        <div className="flex items-center gap-2 px-2 pb-1">
          <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center font-bold text-xs">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-stone-200 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-stone-500 truncate">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : theme === 'light' ? 'sand' : 'dark')}
          title={language === 'ar' ? 'تغيير مظهر المنصة' : 'Changer le thème'}
          aria-label={language === 'ar' ? 'تغيير مظهر المنصة' : 'Changer le thème'}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:bg-stone-800 transition active:scale-[0.98]"
        >
          {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : theme === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Palette className="w-3.5 h-3.5" />}
          <span>{language === 'ar' ? (theme === 'dark' ? 'المظهر الداكن' : theme === 'light' ? 'المظهر الأبيض' : 'المظهر الرملي') : (theme === 'dark' ? 'Thème sombre' : theme === 'light' ? 'Thème clair' : 'Thème sable')}</span>
        </button>
        <button
          onClick={onLogout}
          title={language === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition active:scale-[0.98]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-58px)] sticky top-[58px] shrink-0">
        {content}
      </aside>

      {/* Mobile "More" Full Drawer Modal */}
      {isOpenMobileMore && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onCloseMobileMore} />
          <div className="relative w-4/5 max-w-xs h-full bg-stone-900 z-10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DomainIcon className={`w-5 h-5 ${domainStyles.iconActiveColor}`} />
                <span className="font-bold text-sm text-stone-100">
                  {domainStyles.bannerTitle}
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
