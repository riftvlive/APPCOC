import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Repeat,
  DollarSign,
  Plus,
  BarChart3,
  Users,
  Menu
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: () => void;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  onOpenMoreMenu
}) => {
  const { language } = useFarm();

  const navItems = [
    {
      id: 'dashboard',
      label: language === 'ar' ? 'الرئيسية' : 'Accueil',
      icon: LayoutDashboard
    },
    {
      id: 'cycles',
      label: language === 'ar' ? 'الدورات' : 'Bandes',
      icon: Repeat
    },
    // Floating Plus action in center
    {
      id: 'action',
      label: '',
      isAction: true
    },
    {
      id: 'finance',
      label: language === 'ar' ? 'المالية' : 'Finance',
      icon: DollarSign
    },
    {
      id: 'more',
      label: language === 'ar' ? 'المزيد' : 'Plus',
      icon: Menu,
      isMore: true
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 lg:hidden safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <div key="fab-btn" className="relative -top-4 flex items-center justify-center">
                <button
                  id="mobile-fab-quick-action"
                  onClick={onOpenQuickAction}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 font-black shadow-xl shadow-amber-500/30 flex items-center justify-center transition-transform active:scale-95 border-2 border-stone-900 focus:outline-none"
                  aria-label="عملية سريعة"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => {
                if (item.isMore) {
                  onOpenMoreMenu();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
