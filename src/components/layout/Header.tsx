import React, { useState } from 'react';
import {
  Building2,
  Bell,
  Search,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  Check,
  Database,
  Baby,
  Wheat,
  Plus
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface HeaderProps {
  onOpenSearch: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, activeTab, setActiveTab }) => {
  const {
    farms,
    selectedFarmId,
    setSelectedFarmId,
    currentUser,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    language,
    setLanguage,
    dataSource,
    isFarmAllowed,
    totalActiveBirds,
    chickPurchases,
    feedPurchases,
    feedMovements,
    feedSales
  } = useFarm();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);
  const visibleFarms = farms.filter(farm => isFarmAllowed(farm.id));
  const canSeeAllFarms = currentUser.role === 'admin' || (!currentUser.allowedFarmIds || currentUser.allowedFarmIds.length === 0);

  // Determine current active main area
  const currentArea: 'chicks' | 'farms' | 'feed' =
    activeTab.startsWith('chicks')
      ? 'chicks'
      : (activeTab.startsWith('feed') || activeTab === 'feed-meds' || activeTab === 'feed_meds')
        ? 'feed'
        : 'farms';

  // Stats for the 3 apps
  const totalChicks = chickPurchases.reduce((sum, p) => sum + (p.quantityReceived || p.quantityOrdered || 0), 0);
  const totalFeedTonnes = (
    feedPurchases.reduce((acc, p) => acc + (p.weightKg || p.quantityBags * 50), 0) -
    feedMovements.filter(m => m.type === 'issue' || m.type === 'waste').reduce((acc, m) => acc + m.weightKg, 0) -
    feedSales.reduce((acc, s) => acc + s.weightKg, 0)
  ) / 1000;

  // Header dynamic theme configuration based on active area
  const themeConfig = {
    chicks: {
      border: 'border-b-2 border-amber-500/60 shadow-amber-950/30',
      brandBg: 'bg-amber-500 text-stone-950',
      brandIcon: Baby,
      title: language === 'ar' ? 'الكتاكيت' : 'Poussins',
      tag: language === 'ar' ? 'إدارة الكتاكيت' : 'Poussins',
      accentText: 'text-amber-400',
      activeTabClass: 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20 border-amber-400',
      badge: `${totalChicks.toLocaleString()} كتكوت`
    },
    farms: {
      border: 'border-b-2 border-emerald-500/60 shadow-emerald-950/30',
      brandBg: 'bg-emerald-500 text-stone-950',
      brandIcon: Building2,
      title: language === 'ar' ? 'المزارع' : 'Fermes',
      tag: language === 'ar' ? 'إدارة المزارع' : 'Fermes',
      accentText: 'text-emerald-400',
      activeTabClass: 'bg-emerald-500 text-stone-950 font-black shadow-lg shadow-emerald-500/20 border-emerald-400',
      badge: `${totalActiveBirds.toLocaleString()} طائر`
    },
    feed: {
      border: 'border-b-2 border-yellow-500/60 shadow-yellow-950/30',
      brandBg: 'bg-yellow-500 text-stone-950',
      brandIcon: Wheat,
      title: language === 'ar' ? 'العلف' : 'Aliments',
      tag: language === 'ar' ? 'إدارة العلف' : 'Aliments',
      accentText: 'text-yellow-400',
      activeTabClass: 'bg-yellow-500 text-stone-950 font-black shadow-lg shadow-yellow-500/20 border-yellow-400',
      badge: `${Math.max(0, totalFeedTonnes).toFixed(1)} طن`
    }
  }[currentArea];

  const CurrentBrandIcon = themeConfig.brandIcon;

  return (
    <header className={`sticky top-0 z-40 bg-stone-900 text-stone-100 ${themeConfig.border} shadow-md transition-all duration-300`}>
      <div className="w-full mx-auto px-2 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Dynamic Brand Identity & Contextual Switcher */}
        <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl ${themeConfig.brandBg} flex items-center justify-center font-bold shadow-md transition-all duration-300`}>
              <CurrentBrandIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight leading-tight text-white">
                  {themeConfig.title}
                </h1>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-800 ${themeConfig.accentText} border border-stone-700`}>
                  {themeConfig.badge}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium">
                {themeConfig.tag}
              </p>
            </div>
          </div>

          {/* Farm Switcher when in Farm mode */}
          {currentArea === 'farms' && (
            <div className="relative min-w-0">
              <div className="flex items-center max-w-[150px] sm:max-w-none bg-stone-800/90 hover:bg-stone-700/90 border border-emerald-500/30 text-xs rounded-lg px-2 py-1 transition-colors">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 ml-1.5 shrink-0" />
                <select
                  id="farm-filter-select"
                  aria-label="تصفية المزرعة"
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="bg-transparent text-stone-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1 max-w-[110px] sm:max-w-none truncate"
                >
                  {canSeeAllFarms && <option value="all" className="bg-stone-800 text-stone-100">
                    {language === 'ar' ? '🏢 كل المزارع والمخازن' : '🏢 Toutes les fermes'}
                  </option>}
                  <option value="central" className="bg-stone-800 text-amber-300 font-bold">
                    🏢 {language === 'ar' ? 'المخزن العام (المركزي)' : 'Dépôt Central'}
                  </option>
                  {visibleFarms.map((f) => (
                    <option key={f.id} value={f.id} className="bg-stone-800 text-stone-100">
                      📍 {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Center: The 3 Main Cloud Apps Header Switcher */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 p-1 bg-stone-950/90 border border-stone-800 rounded-xl shadow-inner w-full md:w-auto max-w-md mx-auto">
          {/* 1. Chicks App */}
          <button
            id="header-tab-chicks"
            onClick={() => setActiveTab('chicks')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-lg text-xs transition-all duration-200 border ${
              currentArea === 'chicks'
                ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20 border-amber-400 scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 border-transparent hover:bg-stone-800/60'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>{language === 'ar' ? 'الكتاكيت' : 'Poussins'}</span>
          </button>

          {/* 2. Farms App */}
          <button
            id="header-tab-farms"
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-lg text-xs transition-all duration-200 border ${
              currentArea === 'farms'
                ? 'bg-emerald-500 text-stone-950 font-black shadow-lg shadow-emerald-500/20 border-emerald-400 scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 border-transparent hover:bg-stone-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'المزارع' : 'Fermes'}</span>
          </button>

          {/* 3. Feed App */}
          <button
            id="header-tab-feed"
            onClick={() => setActiveTab('feed-meds')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-lg text-xs transition-all duration-200 border ${
              currentArea === 'feed'
                ? 'bg-yellow-500 text-stone-950 font-black shadow-lg shadow-yellow-500/20 border-yellow-400 scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 border-transparent hover:bg-stone-800/60'
            }`}
          >
            <Wheat className="w-4 h-4" />
            <span>{language === 'ar' ? 'العلف' : 'Aliments'}</span>
          </button>
        </div>

        {/* Right Tools: Sync status, Search, Notifications, Language */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Online/Offline Status */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border ${
              dataSource === 'server'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800'
            }`}
            title={dataSource === 'server' ? 'الخادم: البيانات متزامنة ومحملة مباشرة' : 'أوفلاين: يتم استخدام النسخة المحلية'}
            aria-label={dataSource === 'server' ? 'الخادم متصل' : 'وضع أوفلاين'}
          >
            {dataSource === 'server' ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
          </div>

          {/* Auto Backup Vault Quick Chip */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('audit_backup')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-stone-700 cursor-pointer transition active:scale-95"
              title="النسخ التلقائي نشط — فتح النسخ الاحتياطي وقواعد البيانات"
              aria-label="النسخ التلقائي نشط"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* Universal Search Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-1.5 rounded-lg text-xs transition border border-stone-700"
            title="بحث شامل"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <kbd className="hidden lg:inline-block text-[10px] bg-stone-900 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">Ctrl+K</kbd>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="header-notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
              aria-label="الإشعارات"
              aria-haspopup="dialog"
              aria-expanded={showNotifications}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="header-popover header-notification-popover fixed top-[4.25rem] left-1/2 -translate-x-1/2 w-[min(20rem,calc(100vw-1rem))] sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:translate-x-0 sm:mt-2 sm:w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 bg-stone-800/80 border-b border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-stone-100">
                      {language === 'ar' ? 'التنبيهات' : 'Notifications'}
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                      {unreadNotifs.length}
                    </span>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 transition active:scale-95"
                      title="تعليم جميع الإشعارات كمقروءة"
                      aria-label="تعليم جميع الإشعارات كمقروءة"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'تعليم الكل كمقروء' : 'Tout marquer comme lu'}</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-800 p-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-500">
                      {language === 'ar' ? 'لا توجد تنبيهات حالياً' : 'Aucune notification'}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.linkTab) setActiveTab(notif.linkTab);
                          setShowNotifications(false);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { markNotificationAsRead(notif.id); if (notif.linkTab) setActiveTab(notif.linkTab); setShowNotifications(false); } }}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-stone-800/60 active:scale-[0.99] flex items-start gap-2.5 ${
                          notif.isRead ? 'opacity-60' : 'bg-stone-800/20'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${notif.type === 'danger' ? 'bg-rose-500/15' : notif.type === 'warning' ? 'bg-amber-500/15' : notif.type === 'info' ? 'bg-sky-500/15' : 'bg-emerald-500/15'}`}>
                            {notif.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            {notif.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
                            {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-stone-200 mb-0.5">{notif.title}</div>
                          <p className="text-stone-400 text-[11px] leading-relaxed line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-stone-500 mt-1 block">{notif.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            id="header-lang-toggle"
            onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
            className="flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-300 w-8 h-8 rounded-lg text-base transition border border-stone-700 active:scale-95"
            title={language === 'ar' ? 'التبديل إلى الفرنسية' : 'Passer à l’arabe'}
            aria-label={language === 'ar' ? 'التبديل إلى الفرنسية' : 'Passer à l’arabe'}
          >
            <span aria-hidden="true">{language === 'ar' ? '🇫🇷' : '🇲🇦'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
