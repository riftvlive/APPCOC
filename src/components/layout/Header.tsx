import React, { useState } from 'react';
import {
  Building2,
  Bell,
  Search,
  Globe,
  UserCheck,
  Wifi,
  WifiOff,
  CheckCircle2,
  X,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { UserRole } from '../../types';

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
    setCurrentUser,
    users,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    language,
    setLanguage,
    isOnline
  } = useFarm();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return language === 'ar' ? 'المدير العام' : 'Administrateur';
      case 'farm_manager': return language === 'ar' ? 'مدير مزرعة' : 'Chef de Ferme';
      case 'accountant': return language === 'ar' ? 'المحاسب' : 'Comptable';
      case 'worker': return language === 'ar' ? 'مشرف / عامل' : 'Ouvrier / Superviseur';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Farm Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-inner">
              <span className="text-xl">🐔</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold tracking-tight leading-tight text-white">
                {language === 'ar' ? 'مزارعنا للدواجن' : 'AvicoGestion ERP'}
              </h1>
              <p className="text-[11px] text-amber-400 font-medium">
                {language === 'ar' ? 'نظام إدارة مزارع التسمين المتكامل' : 'Système Avicole Intégré'}
              </p>
            </div>
          </div>

          {/* Farm Filter Dropdown */}
          <div className="relative">
            <div className="flex items-center bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 text-xs rounded-lg px-2.5 py-1.5 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-amber-400 ml-1.5 shrink-0" />
              <select
                id="farm-filter-select"
                aria-label="تصفية المزرعة"
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="bg-transparent text-stone-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-stone-800 text-stone-100">
                  {language === 'ar' ? '🏢 كل المزارع (النشاط بالكامل)' : '🏢 Toutes les fermes'}
                </option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id} className="bg-stone-800 text-stone-100">
                    📍 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Tools: Sync status, Search, Notifications, Language, User/Role */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Online/Offline Status */}
          <div
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800'
            }`}
            title={isOnline ? 'متصل بالسحابة - المزامنة نشطة' : 'وضع غير متصل - يتم الحفظ محلياً'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span>{isOnline ? (language === 'ar' ? 'متصل' : 'En ligne') : (language === 'ar' ? 'أوفلاين' : 'Hors ligne')}</span>
          </div>

          {/* Universal Search Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-1.5 rounded-lg text-xs transition border border-stone-700"
            title="بحث شامل (مزارع، دورات، زبناء، فواتير)"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden lg:inline text-stone-400">{language === 'ar' ? 'بحث سريع...' : 'Recherche...'}</span>
            <kbd className="hidden lg:inline-block text-[10px] bg-stone-900 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">Ctrl+K</kbd>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="header-notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
              aria-label="الإشعارات"
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
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 bg-stone-800/80 border-b border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-stone-100">
                      {language === 'ar' ? 'التنبيهات والإشعارات' : 'Notifications'}
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                      {unreadNotifs.length}
                    </span>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-stone-400 hover:text-amber-300 transition"
                    >
                      {language === 'ar' ? 'تعليم الكل كمقروء' : 'Tout marquer comme lu'}
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
                        className={`p-3 text-xs transition cursor-pointer hover:bg-stone-800/60 flex items-start gap-2.5 ${
                          notif.isRead ? 'opacity-60' : 'bg-stone-800/20'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
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
            className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1.5 rounded-lg text-xs font-bold transition border border-stone-700"
            title="تغيير اللغة / Changer la langue"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'FR' : 'عربي'}</span>
          </button>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              id="header-user-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 px-2.5 py-1.5 rounded-lg text-xs transition"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-semibold max-w-[90px] truncate">{currentUser.name}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 p-2">
                <div className="px-3 py-2 border-b border-stone-800 mb-1">
                  <div className="text-xs font-bold text-stone-200">{currentUser.name}</div>
                  <div className="text-[11px] text-amber-400 font-medium">{getRoleLabel(currentUser.role)}</div>
                </div>

                <div className="text-[11px] font-bold text-stone-400 px-3 py-1">
                  {language === 'ar' ? 'تبديل دور المستخدم للتجربة:' : 'Changer de rôle pour tester :'}
                </div>

                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-right px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        currentUser.id === u.id
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <div className="text-right">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-stone-500">{getRoleLabel(u.role)}</div>
                      </div>
                      {currentUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-stone-800">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-center py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-purple-300 hover:text-purple-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>{language === 'ar' ? '⚙️ صفحة إدارة المستخدمين والصلاحيات' : '⚙️ Gestion des utilisateurs & rôles'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
