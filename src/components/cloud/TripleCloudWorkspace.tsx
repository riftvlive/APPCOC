import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  Building2,
  Wheat,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRightLeft,
  Sliders,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { ChicksView } from '../views/ChicksView';
import { DashboardView } from '../views/DashboardView';
import { FeedMedsView } from '../views/FeedMedsView';

export type CloudPaneType = 'chicks' | 'farm' | 'feed';

interface TripleCloudWorkspaceProps {
  initialPane?: CloudPaneType;
  initialSubTab?: string;
  onNavigate: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
  onPaneChange?: (pane: CloudPaneType) => void;
}

const PANES: {
  id: CloudPaneType;
  title: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  activeBg: string;
  borderActive: string;
  badgeBg: string;
}[] = [
  {
    id: 'chicks',
    title: 'الكتاكيت',
    icon: Baby,
    accentColor: 'text-amber-400',
    activeBg: 'bg-amber-950/40 text-amber-200 border-amber-500/60 shadow-amber-500/10',
    borderActive: 'border-amber-500/50',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  {
    id: 'farm',
    title: 'المزارع',
    icon: Building2,
    accentColor: 'text-emerald-400',
    activeBg: 'bg-emerald-950/40 text-emerald-200 border-emerald-500/60 shadow-emerald-500/10',
    borderActive: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'feed',
    title: 'العلف',
    icon: Wheat,
    accentColor: 'text-yellow-400',
    activeBg: 'bg-yellow-950/40 text-yellow-200 border-yellow-500/60 shadow-yellow-500/10',
    borderActive: 'border-yellow-500/50',
    badgeBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
  }
];

export const TripleCloudWorkspace: React.FC<TripleCloudWorkspaceProps> = ({
  initialPane = 'farm',
  initialSubTab,
  onNavigate,
  onOpenQuickAction,
  onPaneChange
}) => {
  const {
    farms,
    cycles,
    chickPurchases,
    chickSales,
    feedPurchases,
    feedMovements,
    totalActiveBirds,
    allCycleSummaries,
    language
  } = useFarm();

  const [activePane, setActivePane] = useState<CloudPaneType>(initialPane);
  const [direction, setDirection] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (initialPane && initialPane !== activePane) {
      setActivePane(initialPane);
    }
  }, [initialPane]);

  const currentIndex = PANES.findIndex(p => p.id === activePane);

  const switchPane = (targetPane: CloudPaneType) => {
    const targetIdx = PANES.findIndex(p => p.id === targetPane);
    setDirection(targetIdx > currentIndex ? 1 : -1);
    setActivePane(targetPane);
    onPaneChange?.(targetPane);
  };

  const handleNext = () => {
    if (currentIndex < PANES.length - 1) {
      switchPane(PANES[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      switchPane(PANES[currentIndex - 1].id);
    }
  };

  // Touch Swipe Gesture Handlers (Optimized for RTL/LTR)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only trigger horizontal swipe if horizontal distance > vertical distance and > 60px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      if (language === 'ar') {
        // In RTL: swipe left (diffX > 0) moves forward to next pane (feed), swipe right (diffX < 0) moves back (chicks)
        if (diffX > 0 && currentIndex < PANES.length - 1) {
          handleNext();
        } else if (diffX < 0 && currentIndex > 0) {
          handlePrev();
        }
      } else {
        if (diffX > 0 && currentIndex < PANES.length - 1) {
          handleNext();
        } else if (diffX < 0 && currentIndex > 0) {
          handlePrev();
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input typing
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight' && currentIndex > 0) {
        handlePrev();
      } else if (e.key === 'ArrowLeft' && currentIndex < PANES.length - 1) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Dynamic Live Metrics for each cloud
  const totalChicksInStock = totalActiveBirds;
  const readyCyclesCount = allCycleSummaries.filter(c => c.status === 'active' && c.currentAgeDays >= 35).length;
  const activeCyclesCount = cycles.filter(c => c.status === 'active').length;

  const totalFeedStockTonnes = (
    farms.reduce((sum, f) => {
      const purchased = feedPurchases.filter(p => p.farmId === f.id).reduce((s, p) => s + p.quantityKg, 0);
      const used = feedMovements.filter(m => m.farmId === f.id && ['issue', 'waste', 'sale'].includes(m.type)).reduce((s, m) => s + m.quantityKg, 0);
      const transferredIn = feedMovements.filter(m => m.destinationFarmId === f.id && m.type === 'transfer_in').reduce((s, m) => s + m.quantityKg, 0);
      const transferredOut = feedMovements.filter(m => m.sourceFarmId === f.id && m.type === 'transfer_out').reduce((s, m) => s + m.quantityKg, 0);
      return sum + Math.max(0, purchased + transferredIn - used - transferredOut);
    }, 0) / 1000
  ).toFixed(1);

  return (
    <div
      className="flex flex-col w-full min-h-screen relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3-Cloud Navigation Command Deck */}
      <div className="sticky top-14 z-30 mb-4 bg-stone-900/95 backdrop-blur-md p-2 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          
          {/* 3 Tabs Bar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full md:w-auto flex-1 max-w-3xl mx-auto">
            {PANES.map((pane, idx) => {
              const Icon = pane.icon;
              const isActive = activePane === pane.id;

              return (
                <button
                  key={pane.id}
                  id={`cloud-pane-tab-${pane.id}`}
                  onClick={() => switchPane(pane.id)}
                  className={`relative flex items-center justify-center gap-2 px-2.5 sm:px-5 py-2.5 rounded-xl text-center transition-all duration-200 font-extrabold border ${
                    isActive
                      ? `${pane.activeBg} ${pane.borderActive} shadow-lg scale-[1.02]`
                      : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:bg-stone-800/60 hover:text-stone-200'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-stone-900 shadow-inner' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? pane.accentColor : 'text-stone-400'}`} />
                  </div>

                  <span className="text-xs sm:text-base font-black truncate">{pane.title}</span>

                  {idx === 0 && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {totalChicksInStock.toLocaleString()}
                    </span>
                  )}
                  {idx === 1 && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {activeCyclesCount}
                    </span>
                  )}
                  {idx === 2 && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                      {totalFeedStockTonnes} طن
                    </span>
                  )}

                  {isActive && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full ${
                      idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-emerald-400' : 'bg-yellow-400'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Nav Controls & Hints */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0 bg-stone-950/60 border border-stone-800 px-3 py-1.5 rounded-xl text-xs text-stone-400">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-1 rounded-lg transition-colors ${
                currentIndex === 0 ? 'text-stone-600 cursor-not-allowed' : 'text-stone-200 hover:bg-stone-800'
              }`}
              title="السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {PANES.map((pane, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i
                      ? `w-4 ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-emerald-400' : 'bg-yellow-400'}`
                      : 'w-2 bg-stone-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex === PANES.length - 1}
              className={`p-1 rounded-lg transition-colors ${
                currentIndex === PANES.length - 1 ? 'text-stone-600 cursor-not-allowed' : 'text-stone-200 hover:bg-stone-800'
              }`}
              title="التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Swipe Guidance Bar */}
        <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-stone-800/80 text-[11px] text-stone-400 px-1">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 font-bold ${currentIndex === 0 ? 'opacity-30' : 'text-amber-400'}`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            {currentIndex > 0 ? PANES[currentIndex - 1].title : '•'}
          </button>
          <div className="flex items-center gap-1 text-[10px] text-stone-400">
            <span>اسحب للتنقل</span>
            <ArrowRightLeft className="w-3 h-3 text-amber-400" />
          </div>
          <button
            onClick={handleNext}
            disabled={currentIndex === PANES.length - 1}
            className={`flex items-center gap-1 font-bold ${currentIndex === PANES.length - 1 ? 'opacity-30' : 'text-amber-400'}`}
          >
            {currentIndex < PANES.length - 1 ? PANES[currentIndex + 1].title : '•'}
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pane Content Viewport with Motion Animations */}
      <div className="flex-1 w-full min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait" initial={false}>
          {activePane === 'chicks' && (
            <motion.div
              key="chicks-pane"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              <ChicksView onNavigate={onNavigate} onOpenQuickAction={onOpenQuickAction} initialSubTab={initialSubTab as any} />
            </motion.div>
          )}

          {activePane === 'farm' && (
            <motion.div
              key="farm-pane"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              <DashboardView onNavigate={onNavigate} onOpenQuickAction={onOpenQuickAction} />
            </motion.div>
          )}

          {activePane === 'feed' && (
            <motion.div
              key="feed-pane"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              <FeedMedsView onOpenQuickAction={onOpenQuickAction} initialSubTab={initialSubTab as any} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
