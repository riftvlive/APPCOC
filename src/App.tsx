import React, { useEffect, useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { QuickActionModal } from './components/quick-actions/QuickActionModal';
import { UniversalSearchModal } from './components/search/UniversalSearchModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { FarmsView } from './components/views/FarmsView';
import { CyclesView } from './components/views/CyclesView';
import { FeedMedsView } from './components/views/FeedMedsView';
import { SalesView } from './components/views/SalesView';
import { PartnersView } from './components/views/PartnersView';
import { WorkersView } from './components/views/WorkersView';
import { FinanceView } from './components/views/FinanceView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { AiAdvisorView } from './components/views/AiAdvisorView';
import { AuditBackupView } from './components/views/AuditBackupView';
import { AuditLogView } from './components/views/AuditLogView';
import { UsersView } from './components/views/UsersView';
import { ChicksView } from './components/views/ChicksView';
import { LoginScreen } from './components/auth/LoginScreen';
import { StorageService } from './services/storageService';

class AppErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
  state: { hasError: boolean; errorMessage?: string } = { hasError: false };
  private readonly childContent: React.ReactNode;

  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.childContent = props.children;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message };
  }

  componentDidCatch(error: Error) {
    console.error('Application render error:', error);
  }

  clearCacheAndReload = async () => {
    localStorage.clear();
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 text-center" dir="rtl">
          <div className="max-w-md space-y-4">
            <div className="text-5xl">🐔</div>
            <h1 className="text-xl font-black">تعذر عرض المنصة</h1>
            <p className="text-sm text-stone-400">حدث خطأ مؤقت في نسخة التطبيق. أعد التحميل للانتقال إلى أحدث نسخة.</p>
            {this.state.errorMessage && <p className="text-[10px] text-rose-300/80 break-words">{this.state.errorMessage}</p>}
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-stone-800 px-5 py-3 text-sm font-black text-stone-100 hover:bg-stone-700">إعادة التحميل</button>
              <button type="button" onClick={this.clearCacheAndReload} className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-stone-950 hover:bg-amber-400">مسح الكاش والتحميل من الخادم</button>
            </div>
          </div>
        </main>
      );
    }
    return this.childContent;
  }
}

const MainApp: React.FC = () => {
  const { language, users, currentUser, setCurrentUser, hasPermission, dataSource } = useFarm();
  const [theme, setTheme] = useState<'dark' | 'light' | 'sand'>(() => (localStorage.getItem('app-theme') as 'dark' | 'light' | 'sand') || 'dark');
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('poultry_authenticated') === '1' ||
      localStorage.getItem('poultry_authenticated') === '1'
    );
  });
  const [checkingSession, setCheckingSession] = useState<boolean>(() => {
    // If already authenticated locally, don't show full-screen blocking loader
    return !(
      sessionStorage.getItem('poultry_authenticated') === '1' ||
      localStorage.getItem('poultry_authenticated') === '1'
    );
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser.role === 'accountant') return 'finance';
    if (currentUser.role === 'worker') return 'cycles';
    return 'dashboard';
  });
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<{
    isOpen: boolean;
    defaultType?: string;
    defaultPlatform?: 'chicks' | 'feed' | 'farms';
  }>({
    isOpen: false
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let pendingTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const handleSaveStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status: 'success' | 'error'; remote?: boolean }>).detail;
      if (!detail) return;
      if (pendingTimer) clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => {
        setSaveToast(detail.status === 'success'
          ? { type: 'success', text: detail.remote ? 'تم الحفظ والمزامنة بنجاح' : 'تم الحفظ محليًا' }
          : { type: 'error', text: detail.remote ? 'فشلت المزامنة مع الخادم' : 'فشل حفظ العملية' });
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setSaveToast(null), 3500);
      }, 250);
    };
    window.addEventListener('poultry:save-status', handleSaveStatus);
    return () => {
      window.removeEventListener('poultry:save-status', handleSaveStatus);
      if (pendingTimer) clearTimeout(pendingTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('poultry_auth_token') || sessionStorage.getItem('poultry_auth_token');
    fetch('/api/auth/me', {
      credentials: 'include',
      headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {}
    })
      .then(async response => {
        if (!response.ok) throw new Error('Unauthenticated');
        const session = await response.json() as { userId?: string; user?: typeof currentUser };
        const loggedInUser = session.user || users.find(user => user.id === session.userId);
        if (loggedInUser) {
          setCurrentUser(loggedInUser);
          sessionStorage.setItem('poultry_current_user', JSON.stringify(loggedInUser));
          localStorage.setItem('poultry_current_user', JSON.stringify(loggedInUser));
        }
        setAuthenticated(true);
      })
      .catch(() => {
        const cachedUser = localStorage.getItem('poultry_current_user') || sessionStorage.getItem('poultry_current_user');
        const wasAuth = localStorage.getItem('poultry_authenticated') === '1' || sessionStorage.getItem('poultry_authenticated') === '1';
        if (cachedUser && wasAuth) {
          try {
            const parsed = JSON.parse(cachedUser);
            setCurrentUser(parsed);
          } catch (_) {}
          setAuthenticated(true);
        } else {
          sessionStorage.removeItem('poultry_authenticated');
          localStorage.removeItem('poultry_authenticated');
          setAuthenticated(false);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const currentPlatform: 'chicks' | 'feed' | 'farms' =
    activeTab.startsWith('chicks') ? 'chicks' :
    (activeTab.startsWith('feed') || activeTab === 'feed_meds' || activeTab === 'feed-meds') ? 'feed' :
    'farms';

  const handleOpenQuickAction = (action?: string, platform?: 'chicks' | 'feed' | 'farms') => {
    let targetPlatform = platform;
    if (!targetPlatform) {
      if (action?.startsWith('chick') || action === 'chicks') {
        targetPlatform = 'chicks';
      } else if (action?.startsWith('feed') || action === 'med') {
        targetPlatform = 'feed';
      } else if (action && action !== 'menu') {
        targetPlatform = 'farms';
      } else {
        targetPlatform = currentPlatform;
      }
    }
    setQuickActionModal({ isOpen: true, defaultType: action, defaultPlatform: targetPlatform });
  };

  const handleCloseQuickAction = () => {
    setQuickActionModal({ isOpen: false });
  };

  const handleLogin = (user: typeof currentUser, token?: string) => {
    setCurrentUser(user);
    sessionStorage.setItem('poultry_current_user', JSON.stringify(user));
    localStorage.setItem('poultry_current_user', JSON.stringify(user));
    sessionStorage.setItem('poultry_authenticated', '1');
    localStorage.setItem('poultry_authenticated', '1');
    if (token) {
      sessionStorage.setItem('poultry_auth_token', token);
      localStorage.setItem('poultry_auth_token', token);
    }
    setAuthenticated(true);
    // Hydrate data in the background without reloading the page
    void StorageService.hydrateFromRemote().catch(() => undefined);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('poultry_auth_token') || sessionStorage.getItem('poultry_auth_token');
    void fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).catch(() => undefined);
    sessionStorage.removeItem('poultry_authenticated');
    localStorage.removeItem('poultry_authenticated');
    sessionStorage.removeItem('poultry_current_user');
    localStorage.removeItem('poultry_current_user');
    sessionStorage.removeItem('poultry_auth_token');
    localStorage.removeItem('poultry_auth_token');
    setAuthenticated(false);
  };

  if (!authenticated && checkingSession && dataSource === 'loading') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-stone-700 border-t-amber-400 animate-spin" />
          <p className="text-sm font-bold">جاري تحميل المنصة...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen users={users} onLogin={handleLogin} offlineMode={dataSource === 'offline'} />;
  }

  const handleNavigate = (tab: string, id?: string) => {
    const permissions: Record<string, 'canManageFarms' | 'canManageCycles' | 'canManagePurchases' | 'canManageSales' | 'canManageFinance' | 'canManageWorkers' | 'canViewReports' | 'canManageUsers'> = {
      farms: 'canManageFarms', cycles: 'canManageCycles', feed_meds: 'canManagePurchases', 'feed-meds': 'canManagePurchases',
      sales: 'canManageSales', finance: 'canManageFinance', debts: 'canManageFinance', partners: 'canManageFinance',
      workers: 'canManageWorkers', analytics: 'canViewReports', reports: 'canViewReports', ai_advisor: 'canViewReports',
      'ai-advisor': 'canViewReports', users: 'canManageUsers', audit_log: 'canViewReports', 'audit-log': 'canViewReports',

    };
    if (tab === 'audit_backup' || tab === 'audit-backup') {
      if (currentUser.role === 'admin') setActiveTab(tab);
      return;
    }
    if (!permissions[tab] || hasPermission(permissions[tab])) setActiveTab(tab);
  };

  return (
    <div
      data-theme={theme}
      className={`simple-interface min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-stone-950`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAction={handleOpenQuickAction}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Body Container */}
      <div className="flex-1 flex w-full mx-auto px-3 sm:px-6 py-5 gap-6">
        {/* Sidebar for Desktop & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickAction={handleOpenQuickAction}
          onLogout={handleLogout}
          theme={theme}
          onThemeChange={(nextTheme) => { setTheme(nextTheme); localStorage.setItem('app-theme', nextTheme); }}
          isOpenMobileMore={isMobileMoreOpen}
          onCloseMobileMore={() => setIsMobileMoreOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {(activeTab === 'dashboard' || activeTab === 'triple_cloud') && (
            <DashboardView onNavigate={handleNavigate} onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab.startsWith('chicks') && (
            <ChicksView
              onNavigate={handleNavigate}
              onOpenQuickAction={handleOpenQuickAction}
              initialSubTab={
                activeTab === 'chicks_finance' ? 'finance' :
                activeTab === 'chicks_sales' ? 'sales' :
                activeTab === 'chicks_distribution' ? 'distribution' :
                activeTab === 'chicks_hatcheries' ? 'hatcheries' : 'purchases'
              }
            />
          )}

          {(activeTab.startsWith('feed') || activeTab === 'feed_meds' || activeTab === 'feed-meds') && (
            <FeedMedsView
              onOpenQuickAction={handleOpenQuickAction}
              initialSubTab={
                activeTab === 'feed_finance' ? 'finance' :
                activeTab === 'feed_sales' ? 'sales' :
                activeTab === 'feed_issues' ? 'distribution' :
                activeTab === 'feed_adjustments' || activeTab === 'feed_overview' ? 'inventory' :
                activeTab === 'feed_meds_list' ? 'meds' : 'purchases'
              }
            />
          )}

          {activeTab === 'farms' && (
            <FarmsView onNavigate={handleNavigate} onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'cycles' && (
            <CyclesView onNavigate={handleNavigate} onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'sales' && (
            <SalesView onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'partners' && (
            <PartnersView onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'workers' && (
            <WorkersView onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'finance' && (
            <FinanceView onOpenQuickAction={handleOpenQuickAction} defaultSubTab="accounts" />
          )}

          {activeTab === 'debts' && (
            <FinanceView onOpenQuickAction={handleOpenQuickAction} defaultSubTab="debts" />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {(activeTab === 'ai_advisor' || activeTab === 'ai-advisor') && (
            <AiAdvisorView />
          )}

          {activeTab === 'users' && (
            <UsersView onNavigate={handleNavigate} />
          )}

          {(activeTab === 'audit_log' || activeTab === 'audit-log') && (
            <AuditLogView onNavigate={handleNavigate} />
          )}

          {(activeTab === 'audit_backup' || activeTab === 'audit-backup') && (
            <AuditBackupView />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAction={handleOpenQuickAction}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionModal.isOpen}
        onClose={handleCloseQuickAction}
        initialAction={quickActionModal.defaultType}
        defaultPlatform={quickActionModal.defaultPlatform || currentPlatform}
      />

      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {saveToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 bottom-20 lg:bottom-5 -translate-x-1/2 z-[100] min-w-[240px] max-w-[calc(100vw-2rem)] rounded-xl border px-4 py-3 text-center text-xs font-bold shadow-2xl ${
            saveToast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/95 border-rose-500/40 text-rose-200'
          }`}
        >
          {saveToast.type === 'success' ? '✓ ' : '⚠️ '}{saveToast.text}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <FarmProvider>
        <MainApp />
      </FarmProvider>
    </AppErrorBoundary>
  );
}
