import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Repeat,
  DollarSign,
  Plus,
  Menu,
  Baby,
  Truck,
  Coins,
  Warehouse,
  ArrowDownRight,
  Wheat
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: (action?: string, platform?: 'chicks' | 'feed' | 'farms') => void;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  onOpenMoreMenu
}) => {
  const { language } = useFarm();

  // Determine current active domain
  const currentDomain: 'chicks' | 'farms' | 'feed' =
    activeTab.startsWith('chicks')
      ? 'chicks'
      : (activeTab.startsWith('feed') || activeTab === 'feed-meds' || activeTab === 'feed_meds')
        ? 'feed'
        : 'farms';

  // Domain configurations
  const domainConfig = {
    chicks: {
      activeColor: 'text-amber-400 font-bold',
      fabClass: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-stone-950 shadow-amber-500/30',
      items: [
        {
          id: 'chicks_overview',
          label: language === 'ar' ? 'الرئيسية' : 'Aperçu',
          icon: Baby,
          targetTab: 'chicks',
          isActive: activeTab === 'chicks' || activeTab === 'chicks_overview'
        },
        {
          id: 'chicks_distribution',
          label: language === 'ar' ? 'التسكين' : 'Mise en place',
          icon: Truck,
          targetTab: 'chicks_distribution',
          isActive: activeTab === 'chicks_distribution' || activeTab === 'chicks_purchases'
        },
        {
          id: 'action',
          label: '',
          isAction: true
        },
        {
          id: 'chicks_sales',
          label: language === 'ar' ? 'المبيعات' : 'Ventes',
          icon: Coins,
          targetTab: 'chicks_sales',
          isActive: activeTab === 'chicks_sales' || activeTab === 'chicks_finance'
        },
        {
          id: 'more',
          label: language === 'ar' ? 'المزيد' : 'Plus',
          icon: Menu,
          isMore: true
        }
      ]
    },
    feed: {
      activeColor: 'text-yellow-400 font-bold',
      fabClass: 'bg-gradient-to-tr from-yellow-500 to-amber-500 text-stone-950 shadow-yellow-500/30',
      items: [
        {
          id: 'feed_overview',
          label: language === 'ar' ? 'المستودع' : 'Stock',
          icon: Warehouse,
          targetTab: 'feed-meds',
          isActive: activeTab === 'feed-meds' || activeTab === 'feed_meds' || activeTab === 'feed_overview'
        },
        {
          id: 'feed_issues',
          label: language === 'ar' ? 'صرف وتوزيع' : 'Distribution',
          icon: ArrowDownRight,
          targetTab: 'feed_issues',
          isActive: activeTab === 'feed_issues' || activeTab === 'feed_purchases'
        },
        {
          id: 'action',
          label: '',
          isAction: true
        },
        {
          id: 'feed_sales',
          label: language === 'ar' ? 'المبيعات' : 'Ventes',
          icon: DollarSign,
          targetTab: 'feed_sales',
          isActive: activeTab === 'feed_sales' || activeTab === 'feed_finance'
        },
        {
          id: 'more',
          label: language === 'ar' ? 'المزيد' : 'Plus',
          icon: Menu,
          isMore: true
        }
      ]
    },
    farms: {
      activeColor: 'text-emerald-400 font-bold',
      fabClass: 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-stone-950 shadow-emerald-500/30',
      items: [
        {
          id: 'dashboard',
          label: language === 'ar' ? 'الرئيسية' : 'Accueil',
          icon: LayoutDashboard,
          targetTab: 'dashboard',
          isActive: activeTab === 'dashboard' || activeTab === 'triple_cloud'
        },
        {
          id: 'cycles',
          label: language === 'ar' ? 'الدورات' : 'Bandes',
          icon: Repeat,
          targetTab: 'cycles',
          isActive: activeTab === 'cycles'
        },
        {
          id: 'action',
          label: '',
          isAction: true
        },
        {
          id: 'finance',
          label: language === 'ar' ? 'المالية' : 'Finance',
          icon: DollarSign,
          targetTab: 'finance',
          isActive: activeTab === 'finance' || activeTab === 'debts'
        },
        {
          id: 'more',
          label: language === 'ar' ? 'المزيد' : 'Plus',
          icon: Menu,
          isMore: true
        }
      ]
    }
  }[currentDomain];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 lg:hidden safe-area-pb shadow-2xl">
      {/* Dynamic Tabs for current domain */}
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {domainConfig.items.map((item) => {
          if (item.isAction) {
            return (
              <div key="fab-btn" className="relative -top-4 flex items-center justify-center">
                <button
                  id="mobile-fab-quick-action"
                  onClick={() => onOpenQuickAction(undefined, currentDomain)}
                  className={`w-14 h-14 rounded-full ${domainConfig.fabClass} font-black shadow-xl flex items-center justify-center transition-transform active:scale-95 border-2 border-stone-900 focus:outline-none`}
                  aria-label={`عملية سريعة (${currentDomain})`}
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = item.isActive;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => {
                if (item.isMore) {
                  onOpenMoreMenu();
                } else if (item.targetTab) {
                  setActiveTab(item.targetTab);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive ? domainConfig.activeColor : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
