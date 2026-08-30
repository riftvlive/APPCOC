import React, { useState } from 'react';
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
import { UsersView } from './components/views/UsersView';

const MainApp: React.FC = () => {
  const { language } = useFarm();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<{ isOpen: boolean; defaultType?: string }>({
    isOpen: false
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenQuickAction = (action?: string) => {
    setQuickActionModal({ isOpen: true, defaultType: action });
  };

  const handleCloseQuickAction = () => {
    setQuickActionModal({ isOpen: false });
  };

  const handleNavigate = (tab: string, id?: string) => {
    setActiveTab(tab);
  };

  return (
    <div
      className={`min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-stone-950`}
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
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 gap-5">
        {/* Sidebar for Desktop & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickAction={handleOpenQuickAction}
          isOpenMobileMore={isMobileMoreOpen}
          onCloseMobileMore={() => setIsMobileMoreOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView onNavigate={handleNavigate} onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'farms' && (
            <FarmsView onNavigate={handleNavigate} onOpenQuickAction={handleOpenQuickAction} />
          )}

          {activeTab === 'cycles' && (
            <CyclesView onNavigate={handleNavigate} onOpenQuickAction={handleOpenQuickAction} />
          )}

          {(activeTab === 'feed_meds' || activeTab === 'feed-meds') && (
            <FeedMedsView onOpenQuickAction={handleOpenQuickAction} />
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

          {(activeTab === 'audit_backup' || activeTab === 'audit-backup') && (
            <AuditBackupView />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAction={() => handleOpenQuickAction('daily_log')}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionModal.isOpen}
        onClose={handleCloseQuickAction}
        defaultType={quickActionModal.defaultType}
      />

      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <MainApp />
    </FarmProvider>
  );
}
