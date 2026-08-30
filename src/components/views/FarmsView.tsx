import React, { useState } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Maximize2,
  Users,
  TrendingUp,
  DollarSign,
  Edit2,
  Trash2,
  Repeat,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  SlidersHorizontal,
  Droplets,
  Zap,
  Wind,
  Flame,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  ShieldAlert
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Farm, FarmHangar } from '../../types';

interface FarmsViewProps {
  onNavigate: (tab: string, id?: string) => void;
  onOpenQuickAction: (action?: string) => void;
}

export const FarmsView: React.FC<FarmsViewProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    farms,
    cycles,
    allCycleSummaries,
    addFarm,
    updateFarm,
    deleteFarm,
    workers,
    users,
    currency,
    language,
    canManageFarms
  } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sanitizing' | 'maintenance' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [selectedFarmDetail, setSelectedFarmDetail] = useState<Farm | null>(null);
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>(25000);
  const [hangarsCount, setHangarsCount] = useState<number | ''>(2);
  const [surfaceM2, setSurfaceM2] = useState<number | ''>(2000);
  const [areaSquareMeters, setAreaSquareMeters] = useState<number | ''>(6000);
  const [status, setStatus] = useState<'active' | 'sanitizing' | 'maintenance' | 'inactive'>('active');
  const [managerId, setManagerId] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [waterSource, setWaterSource] = useState('بئر ارتوازي + خزان رئيسي');
  const [generatorBackup, setGeneratorBackup] = useState(true);
  const [notes, setNotes] = useState('');
  const [hangars, setHangars] = useState<FarmHangar[]>([]);

  const openCreateModal = () => {
    setName('');
    setLocation('');
    setCapacity(25000);
    setHangarsCount(2);
    setSurfaceM2(2000);
    setAreaSquareMeters(6000);
    setStatus('active');
    setManagerId(users.find(u => u.role === 'farm_manager')?.id || users[0]?.id || '');
    const defaultManager = users.find(u => u.role === 'farm_manager') || users[0];
    setManagerName(defaultManager ? defaultManager.name : '');
    setManagerPhone(defaultManager ? defaultManager.phone : '');
    setWaterSource('بئر ارتوازي + خزان رئيسي');
    setGeneratorBackup(true);
    setNotes('');
    setHangars([
      { id: 'h-1', name: 'عنبر 1 (أوتوماتيكي)', capacity: 12500, surfaceM2: 1000, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true },
      { id: 'h-2', name: 'عنبر 2 (أوتوماتيكي)', capacity: 12500, surfaceM2: 1000, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true }
    ]);
    setEditingFarm(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocation(farm.location);
    setCapacity(farm.capacity);
    setHangarsCount(farm.hangarsCount || farm.barnsCount || 2);
    setSurfaceM2(farm.surfaceM2 || 2000);
    setAreaSquareMeters(farm.areaSquareMeters || 6000);
    setStatus(farm.status || 'active');
    setManagerId(farm.managerId || '');
    setManagerName(farm.managerName || '');
    setManagerPhone(farm.managerPhone || '');
    setWaterSource(farm.waterSource || 'بئر ارتوازي + خزان رئيسي');
    setGeneratorBackup(farm.generatorBackup ?? true);
    setNotes(farm.notes || '');
    setHangars(farm.hangars && farm.hangars.length > 0 ? farm.hangars : [
      { id: 'h-1', name: 'عنبر 1', capacity: Math.floor(farm.capacity / (farm.hangarsCount || 2)), surfaceM2: (farm.surfaceM2 || 2000) / 2 },
      { id: 'h-2', name: 'عنبر 2', capacity: Math.ceil(farm.capacity / (farm.hangarsCount || 2)), surfaceM2: (farm.surfaceM2 || 2000) / 2 }
    ]);
    setIsAddModalOpen(true);
  };

  const handleManagerSelect = (uId: string) => {
    setManagerId(uId);
    const selected = users.find(u => u.id === uId);
    if (selected) {
      setManagerName(selected.name);
      setManagerPhone(selected.phone);
    }
  };

  const handleAddHangarRow = () => {
    const newIndex = hangars.length + 1;
    const defaultCap = capacity ? Math.floor(Number(capacity) / Math.max(1, newIndex)) : 10000;
    setHangars([
      ...hangars,
      {
        id: `h-${Date.now()}`,
        name: `عنبر ${newIndex}`,
        capacity: defaultCap,
        surfaceM2: surfaceM2 ? Math.floor(Number(surfaceM2) / Math.max(1, newIndex)) : 800,
        ventilationType: 'tunnel',
        heatingType: 'gas_canon',
        coolingPads: true
      }
    ]);
    setHangarsCount(hangars.length + 1);
  };

  const handleRemoveHangarRow = (index: number) => {
    const updated = hangars.filter((_, i) => i !== index);
    setHangars(updated);
    setHangarsCount(updated.length);
  };

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !capacity) return;

    const farmPayload: Omit<Farm, 'id' | 'createdAt'> = {
      name,
      location,
      capacity: Number(capacity),
      hangarsCount: Number(hangarsCount || hangars.length || 1),
      barnsCount: Number(hangarsCount || hangars.length || 1),
      surfaceM2: surfaceM2 ? Number(surfaceM2) : undefined,
      areaSquareMeters: areaSquareMeters ? Number(areaSquareMeters) : undefined,
      status,
      managerId: managerId || undefined,
      managerName: managerName || undefined,
      managerPhone: managerPhone || undefined,
      waterSource,
      generatorBackup,
      notes,
      hangars
    };

    if (editingFarm) {
      updateFarm(editingFarm.id, farmPayload);
    } else {
      addFarm(farmPayload);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!farmToDelete) return;
    deleteFarm(farmToDelete.id);
    setFarmToDelete(null);
    if (selectedFarmDetail?.id === farmToDelete.id) {
      setSelectedFarmDetail(null);
    }
  };

  // Filtered farms
  const filteredFarms = farms.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.managerName && f.managerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || (f.status || 'active') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'sanitizing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950/80 text-sky-400 border border-sky-800">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            فترة فراغ وتطهير صحي
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            صيانة وتجهيز
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-800 text-stone-400 border border-stone-700">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
            متوقفة مؤقتاً
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            نشطة (جاري الإنتاج)
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-100 flex items-center gap-2">
                  <span>{language === 'ar' ? 'إدارة المزارع والعنابر' : 'Gestion des Fermes & Hangars'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-stone-700 font-bold">
                    {farms.length} {language === 'ar' ? 'مزرعة' : 'fermes'}
                  </span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {language === 'ar'
                    ? `إجمالي الطاقة الاستيعابية: ${farms.reduce((s, f) => s + f.capacity, 0).toLocaleString()} طائر | إجمالي العنابر: ${farms.reduce((s, f) => s + (f.hangarsCount || f.barnsCount || 1), 0)} عنبر`
                    : `Capacité totale: ${farms.reduce((s, f) => s + f.capacity, 0).toLocaleString()} volailles`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canManageFarms && (
              <button
                id="add-new-farm-btn"
                onClick={openCreateModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'ar' ? '+ إضافة مزرعة جديدة' : '+ Ajouter Ferme'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث بالاسم، الموقع، أو اسم المدير...' : 'Recherche par nom, lieu...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pr-9 pl-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              الكل ({farms.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              نشطة ({farms.filter(f => !f.status || f.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('sanitizing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'sanitizing' ? 'bg-sky-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              فترة تطهير ({farms.filter(f => f.status === 'sanitizing').length})
            </button>
            <button
              onClick={() => setStatusFilter('maintenance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'maintenance' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              صيانة ({farms.filter(f => f.status === 'maintenance').length})
            </button>
          </div>
        </div>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFarms.map((farm) => {
          const farmCycles = cycles.filter(c => c.farmId === farm.id);
          const activeCycle = farmCycles.find(c => c.status !== 'completed');
          const farmSummaries = allCycleSummaries.filter(s => {
            const cy = cycles.find(c => c.id === s.cycleId);
            return cy?.farmId === farm.id;
          });
          const farmWorkers = workers.filter(w => w.farmId === farm.id);
          const totalFarmProfit = farmSummaries.reduce((sum, s) => sum + s.netProfit, 0);

          return (
            <div
              key={farm.id}
              className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition duration-200 shadow-md group"
            >
              <div>
                {/* Farm Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="cursor-pointer" onClick={() => setSelectedFarmDetail(farm)}>
                    <h3 className="font-black text-base text-stone-100 group-hover:text-amber-400 transition flex items-center gap-1.5">
                      <span>{farm.name}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[220px]">{farm.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {canManageFarms && (
                      <>
                        <button
                          onClick={() => openEditModal(farm)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition"
                          title="تعديل بيانات المزرعة والعنابر"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFarmToDelete(farm)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 transition"
                          title="حذف المزرعة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3.5 flex items-center justify-between">
                  {getStatusBadge(farm.status)}
                  {farm.managerName && (
                    <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-500" />
                      {farm.managerName}
                    </span>
                  )}
                </div>

                {/* Capacity & Hangars Badges */}
                <div className="grid grid-cols-2 gap-2 mb-3.5">
                  <div className="bg-stone-950/70 rounded-xl p-2.5 border border-stone-850">
                    <span className="text-[10px] text-stone-400 block mb-0.5 font-medium">الطاقة الاستيعابية</span>
                    <span className="text-xs font-black text-amber-300">
                      {farm.capacity.toLocaleString()} طائر
                    </span>
                  </div>
                  <div className="bg-stone-950/70 rounded-xl p-2.5 border border-stone-850">
                    <span className="text-[10px] text-stone-400 block mb-0.5 font-medium">عدد العنابر / المساحة</span>
                    <span className="text-xs font-bold text-stone-200">
                      {farm.hangarsCount || farm.barnsCount || 1} عنابر {farm.surfaceM2 ? `(${farm.surfaceM2} م²)` : ''}
                    </span>
                  </div>
                </div>

                {/* Technical Equipment summary */}
                <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-3.5 px-2 py-1.5 bg-stone-950/40 rounded-lg border border-stone-850">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    <span>مياه: {farm.waterSource ? 'متوفرة' : 'بئر'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>مولد: {farm.generatorBackup ?? true ? 'جاهز' : 'لا يوجد'}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{farmWorkers.length} عمال</span>
                  </div>
                </div>

                {/* Current Active Cycle Status */}
                <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 mb-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-medium">الدورة الحالية:</span>
                    {activeCycle ? (
                      <span className="font-extrabold text-amber-300">
                        {activeCycle.cycleNumber}
                      </span>
                    ) : (
                      <span className="text-stone-500 font-bold">لا توجد دورة جارية</span>
                    )}
                  </div>

                  {activeCycle ? (
                    <div className="flex items-center justify-between text-[11px] text-stone-300">
                      <span>العدد: {activeCycle.initialChickCount.toLocaleString()} كتكوت</span>
                      <span className="text-emerald-400 font-bold">سلالة {activeCycle.chickBreed}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500">العنابر جاهزة لاستقبال الفوج الجديد بعد التطهير.</p>
                  )}
                </div>

                {/* Financial Metric */}
                <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-stone-950/40 rounded-xl mb-2">
                  <span className="text-stone-400 text-[11px]">صافي أرباح الدورات:</span>
                  <span className={`font-black ${totalFarmProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalFarmProfit.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-stone-800 mt-2">
                <button
                  onClick={() => setSelectedFarmDetail(farm)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>تفاصيل العنابر</span>
                </button>
                <button
                  onClick={() => onNavigate('cycles', farm.id)}
                  className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>الدورات</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFarms.length === 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="font-bold text-stone-300 text-sm">لم يتم العثور على أي مزارع مطابقة</h3>
          <p className="text-xs text-stone-500 mt-1">جرب تغيير كلمات البحث أو إضافة مزرعة جديدة.</p>
          {canManageFarms && (
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
            >
              + إضافة مزرعة الآن
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
            <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-stone-100">
                  {editingFarm ? `تعديل بيانات: ${editingFarm.name}` : 'إضافة مزرعة دواجن جديدة'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFarm} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-bold mb-1">اسم المزرعة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مزرعة الأمل لتسمين الدواجن"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-bold mb-1">الموقع الجغرافي / المنطقة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: إقليم الخميسات - جماعة سيدي علال البحراوي"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">الطاقة الاستيعابية الإجمالية (طائر) *</label>
                  <input
                    type="number"
                    required
                    placeholder="30000"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-amber-400 font-black text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">حالة المزرعة الحالية *</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">🟢 نشطة (جاري الإنتاج والتربية)</option>
                    <option value="sanitizing">🟡 فترة فراغ وتطهير (Vide Sanitaire)</option>
                    <option value="maintenance">🟠 صيانة وتجهيز تقني</option>
                    <option value="inactive">⚪ متوقفة مؤقتاً</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">المساحة المغطاة للعنابر (م²)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={surfaceM2}
                    onChange={(e) => setSurfaceM2(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">المساحة الكلية للعقار (م²)</label>
                  <input
                    type="number"
                    placeholder="8000"
                    value={areaSquareMeters}
                    onChange={(e) => setAreaSquareMeters(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Farm Manager Assignment */}
              <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-3">
                <h4 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>المسؤول المباشر عن المزرعة</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-stone-400 mb-1">اختيار من المستخدمين</label>
                    <select
                      value={managerId}
                      onChange={(e) => handleManagerSelect(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                    >
                      <option value="">-- اختر مدير المزرعة --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">اسم المدير / المشرف</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="اسم المدير"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      placeholder="06XXXXXXXX"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>
                </div>
              </div>

              {/* Hangars Breakdown Sub-list */}
              <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>تجهيز العنابر والحظائر ({hangars.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddHangarRow}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ إضافة عنبر</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {hangars.map((h, idx) => (
                    <div key={h.id || idx} className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">اسم العنبر</span>
                        <input
                          type="text"
                          value={h.name}
                          onChange={(e) => {
                            const copy = [...hangars];
                            copy[idx].name = e.target.value;
                            setHangars(copy);
                          }}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-100 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block">السعة (طائر)</span>
                        <input
                          type="number"
                          value={h.capacity}
                          onChange={(e) => {
                            const copy = [...hangars];
                            copy[idx].capacity = Number(e.target.value);
                            setHangars(copy);
                          }}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-amber-300 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block">المساحة (م²)</span>
                        <input
                          type="number"
                          value={h.surfaceM2 || ''}
                          onChange={(e) => {
                            const copy = [...hangars];
                            copy[idx].surfaceM2 = Number(e.target.value);
                            setHangars(copy);
                          }}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 pt-3 sm:pt-0">
                        <span className="text-[11px] text-emerald-400 font-semibold">تهوية طولية + خلايا</span>
                        {hangars.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHangarRow(idx)}
                            className="p-1 text-rose-400 hover:bg-rose-950/60 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment & Utilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">مصدر المياه الرئيسي</label>
                  <input
                    type="text"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    placeholder="بئر ارتوازي مع محطة تحلية / صهاريج"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-bold">
                    <input
                      type="checkbox"
                      checked={generatorBackup}
                      onChange={(e) => setGeneratorBackup(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-950 border-stone-700"
                    />
                    <span>مولد كهربائي احتياطي أوتوماتيكي (Groupe Électrogène)</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-stone-300 font-bold mb-1">ملاحظات ومواصفات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات حول الترخيص، مسافة الأمان، صوامع العلف الخارجية..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl shadow-lg transition"
                >
                  {editingFarm ? 'حفظ التعديلات' : 'إضافة المزرعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {farmToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setFarmToDelete(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-rose-800/60 rounded-2xl p-5 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-stone-100">تأكيد حذف المزرعة</h3>
                <p className="text-stone-400 text-[11px]">هذا الإجراء سيقوم بإزالة المزرعة من السجل</p>
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-stone-300 space-y-1">
              <p className="font-bold text-amber-300">{farmToDelete.name}</p>
              <p className="text-stone-400">{farmToDelete.location}</p>
              <p className="text-[11px] text-stone-500">
                الدورات المسجلة: {cycles.filter(c => c.farmId === farmToDelete.id).length} دورة
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFarmToDelete(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg transition"
              >
                نعم، احذف المزرعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Farm Inspection Drawer/Modal */}
      {selectedFarmDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm" onClick={() => setSelectedFarmDetail(null)} />
          <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden z-10 my-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-stone-850 border-b border-stone-700 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{selectedFarmDetail.name}</span>
                    {getStatusBadge(selectedFarmDetail.status)}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{selectedFarmDetail.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManageFarms && (
                  <button
                    onClick={() => {
                      const f = selectedFarmDetail;
                      setSelectedFarmDetail(null);
                      openEditModal(f);
                    }}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تعديل</span>
                  </button>
                )}
                <button onClick={() => setSelectedFarmDetail(null)} className="p-2 text-stone-400 hover:text-stone-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 block mb-0.5">الطاقة الاستيعابية</span>
                  <span className="text-base font-black text-amber-400">
                    {selectedFarmDetail.capacity.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-500 block">طائر / دورة</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 block mb-0.5">عدد العنابر</span>
                  <span className="text-base font-black text-stone-100">
                    {selectedFarmDetail.hangarsCount || selectedFarmDetail.barnsCount || 1}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    {selectedFarmDetail.surfaceM2 ? `${selectedFarmDetail.surfaceM2} م²` : 'عنبر مجهز'}
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 block mb-0.5">الدورات المنجزة</span>
                  <span className="text-base font-black text-sky-400">
                    {cycles.filter(c => c.farmId === selectedFarmDetail.id).length}
                  </span>
                  <span className="text-[10px] text-stone-500 block">دورة إنتاجية</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 block mb-0.5">العمال المعينين</span>
                  <span className="text-base font-black text-emerald-400">
                    {workers.filter(w => w.farmId === selectedFarmDetail.id).length}
                  </span>
                  <span className="text-[10px] text-stone-500 block">عمال دائمين</span>
                </div>
              </div>

              {/* Manager & Technical Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-2">
                  <h4 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>إدارة المزرعة والمشرفين</span>
                  </h4>
                  <div className="text-stone-300 space-y-1 pt-1">
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">المدير المسؤول:</span>
                      <span className="font-bold text-stone-100">{selectedFarmDetail.managerName || 'غير محدد'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">رقم الاتصال:</span>
                      <span className="font-bold text-amber-300 dir-ltr">{selectedFarmDetail.managerPhone || '---'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-2">
                  <h4 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>التجهيزات والمرافق الحيوية</span>
                  </h4>
                  <div className="text-stone-300 space-y-1 pt-1">
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">مصدر المياه:</span>
                      <span className="font-bold">{selectedFarmDetail.waterSource || 'بئر ارتوازي'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">المولد الاحتياطي:</span>
                      <span className="font-bold text-emerald-400">
                        {selectedFarmDetail.generatorBackup ?? true ? 'متوفر وجاهز أوتوماتيكياً' : 'غير متوفر'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Hangars List */}
              <div className="space-y-2">
                <h4 className="font-black text-stone-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>تفاصيل العنابر والحظائر</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(selectedFarmDetail.hangars && selectedFarmDetail.hangars.length > 0
                    ? selectedFarmDetail.hangars
                    : [
                        { id: '1', name: 'عنبر 1 (أوتوماتيكي)', capacity: Math.floor(selectedFarmDetail.capacity / 2), surfaceM2: (selectedFarmDetail.surfaceM2 || 2000) / 2 },
                        { id: '2', name: 'عنبر 2 (أوتوماتيكي)', capacity: Math.ceil(selectedFarmDetail.capacity / 2), surfaceM2: (selectedFarmDetail.surfaceM2 || 2000) / 2 }
                      ]
                  ).map((h, i) => (
                    <div key={h.id || i} className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-stone-200">{h.name}</span>
                        <span className="text-amber-400 font-black">{h.capacity.toLocaleString()} طائر</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400">
                        <span>المساحة: {h.surfaceM2 ? `${h.surfaceM2} م²` : '---'}</span>
                        <span>التهوية: نفقية أوتوماتيكية</span>
                        <span>التدفئة: مدافع غاز</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cycles in this farm */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-200 text-xs flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-amber-400" />
                    <span>تاريخ وسجل دورات المزرعة</span>
                  </h4>
                  <button
                    onClick={() => {
                      const fId = selectedFarmDetail.id;
                      setSelectedFarmDetail(null);
                      onNavigate('cycles', fId);
                    }}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    عرض في صفحة الدورات ←
                  </button>
                </div>

                <div className="space-y-1.5">
                  {cycles.filter(c => c.farmId === selectedFarmDetail.id).map(cycle => (
                    <div
                      key={cycle.id}
                      className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-100">{cycle.cycleNumber}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            cycle.status === 'completed'
                              ? 'bg-stone-800 text-stone-400'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {cycle.status === 'completed' ? 'مكتملة' : 'تربية جارية'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          تاريخ البداية: {cycle.startDate} | السلالة: {cycle.chickBreed} ({cycle.initialChickCount.toLocaleString()} كتكوت)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 bg-stone-850 border-t border-stone-700 flex items-center justify-between">
              <button
                onClick={() => setSelectedFarmDetail(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  const fId = selectedFarmDetail.id;
                  setSelectedFarmDetail(null);
                  onOpenQuickAction('expense');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl shadow transition"
              >
                + تسجيل مصروف للمزرعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
