import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Building2, Repeat, Users, ShoppingCart, Receipt, ArrowRight } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, entityId?: string) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { farms, cycles, partners, sales, expenses, currency, language } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');

  // Keyboard shortcut listener for Escape & Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'farm' | 'cycle' | 'partner' | 'sale' | 'expense';
      tab: string;
    }> = [];

    // Farms
    farms.forEach(f => {
      if (f.name.toLowerCase().includes(term) || f.location.toLowerCase().includes(term)) {
        items.push({
          id: f.id,
          title: f.name,
          subtitle: `مزرعة • سعة: ${f.capacity.toLocaleString()} طائر • ${f.location}`,
          type: 'farm',
          tab: 'farms'
        });
      }
    });

    // Cycles
    cycles.forEach(c => {
      if (c.cycleNumber.toLowerCase().includes(term) || c.chickBreed.toLowerCase().includes(term)) {
        items.push({
          id: c.id,
          title: c.cycleNumber,
          subtitle: `دورة تربية • سلالة ${c.chickBreed} • ${c.initialChickCount.toLocaleString()} كتكوت`,
          type: 'cycle',
          tab: 'cycles'
        });
      }
    });

    // Partners
    partners.forEach(p => {
      if (p.name.toLowerCase().includes(term) || p.phone.includes(term) || (p.company && p.company.toLowerCase().includes(term))) {
        items.push({
          id: p.id,
          title: p.name,
          subtitle: `${p.type === 'customer' ? 'زبون' : 'مورد'} • هاتف: ${p.phone} • ${p.company || ''}`,
          type: 'partner',
          tab: 'partners'
        });
      }
    });

    // Sales
    sales.forEach(s => {
      if (s.invoiceNumber.toLowerCase().includes(term) || s.truckPlate?.toLowerCase().includes(term)) {
        items.push({
          id: s.id,
          title: `فاتورة بيع ${s.invoiceNumber}`,
          subtitle: `وزن: ${s.totalWeightKg.toLocaleString()} كغ • المبلغ: ${s.netTotal.toLocaleString()} ${currency}`,
          type: 'sale',
          tab: 'sales'
        });
      }
    });

    // Expenses
    expenses.forEach(e => {
      if (e.description.toLowerCase().includes(term) || e.category.toLowerCase().includes(term)) {
        items.push({
          id: e.id,
          title: e.description,
          subtitle: `مصروف ${e.category} • ${e.amount.toLocaleString()} ${currency} • ${e.date}`,
          type: 'expense',
          tab: 'finance'
        });
      }
    });

    return items;
  }, [searchTerm, farms, cycles, partners, sales, expenses, currency]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'farm': return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'cycle': return <Repeat className="w-4 h-4 text-blue-400" />;
      case 'partner': return <Users className="w-4 h-4 text-emerald-400" />;
      case 'sale': return <ShoppingCart className="w-4 h-4 text-teal-400" />;
      case 'expense': return <Receipt className="w-4 h-4 text-rose-400" />;
      default: return <Search className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20">
      <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 bg-stone-800/90 border-b border-stone-700 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={language === 'ar' ? 'ابحث عن مزرعة، دورة، زبون، مورد، فاتورة...' : 'Recherche globale...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-stone-100 placeholder-stone-400 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-stone-400 hover:text-stone-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg bg-stone-700 text-stone-300 text-xs px-2">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto">
          {searchTerm.trim() === '' ? (
            <div className="p-8 text-center text-xs text-stone-500">
              اكتب اسم المزرعة، رقم الدورة، اسم الزبون، أو رقم الفاتورة للوصول الفوري.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              لا توجد نتائج مطابقة لـ "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res) => (
                <button
                  key={`${res.type}-${res.id}`}
                  onClick={() => {
                    onNavigate(res.tab, res.id);
                    onClose();
                  }}
                  className="w-full text-right p-2.5 rounded-xl hover:bg-stone-800 flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-800 group-hover:bg-stone-700 flex items-center justify-center">
                      {getTypeIcon(res.type)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {res.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
