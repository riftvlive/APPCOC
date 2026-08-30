import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  AlertCircle,
  Building2,
  Repeat,
  DollarSign,
  Briefcase,
  FileSpreadsheet,
  Layers,
  Search,
  X,
  Sparkles,
  Phone,
  Mail,
  User as UserIcon,
  Check,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { User, UserRole, UserPermissions, DEFAULT_ROLE_PERMISSIONS } from '../../types';

interface UsersViewProps {
  onNavigate?: (tab: string, id?: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onNavigate }) => {
  const {
    users,
    currentUser,
    setCurrentUser,
    farms,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    language,
    canManageUsers
  } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showRoleGuide, setShowRoleGuide] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('farm_manager');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [allowedFarmIds, setAllowedFarmIds] = useState<string[]>([]);
  const [allFarmsSelected, setAllFarmsSelected] = useState(true);
  const [notes, setNotes] = useState('');
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_ROLE_PERMISSIONS.farm_manager);

  const openCreateModal = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('farm_manager');
    setStatus('active');
    setAllowedFarmIds([]);
    setAllFarmsSelected(true);
    setNotes('');
    setPermissions(DEFAULT_ROLE_PERMISSIONS.farm_manager);
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setPhone(user.phone || '');
    setEmail(user.email || '');
    setRole(user.role);
    setStatus(user.status || 'active');
    setAllowedFarmIds(user.allowedFarmIds || []);
    setAllFarmsSelected(!user.allowedFarmIds || user.allowedFarmIds.length === 0);
    setNotes(user.notes || '');
    setPermissions({
      ...DEFAULT_ROLE_PERMISSIONS[user.role],
      ...(user.permissions || {})
    });
    setIsAddModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Pre-fill permissions with defaults for new role
    setPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFarmToggle = (farmId: string) => {
    if (allFarmsSelected) {
      setAllFarmsSelected(false);
      setAllowedFarmIds([farmId]);
      return;
    }

    if (allowedFarmIds.includes(farmId)) {
      const updated = allowedFarmIds.filter(id => id !== farmId);
      if (updated.length === 0) {
        setAllFarmsSelected(true);
        setAllowedFarmIds([]);
      } else {
        setAllowedFarmIds(updated);
      }
    } else {
      setAllowedFarmIds([...allowedFarmIds, farmId]);
    }
  };

  const handleSelectAllFarms = () => {
    setAllFarmsSelected(true);
    setAllowedFarmIds([]);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const userPayload: Omit<User, 'id' | 'createdAt'> = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role,
      status,
      allowedFarmIds: allFarmsSelected ? undefined : allowedFarmIds,
      permissions,
      notes: notes.trim() || undefined
    };

    if (editingUser) {
      updateUser(editingUser.id, userPayload);
    } else {
      addUser(userPayload);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return language === 'ar' ? 'المدير العام / المالك' : 'Administrateur / Propriétaire';
      case 'farm_manager':
        return language === 'ar' ? 'مدير مزرعة' : 'Directeur de Ferme';
      case 'accountant':
        return language === 'ar' ? 'محاسب مالي' : 'Comptable Financier';
      case 'worker':
        return language === 'ar' ? 'مشرف عنبر / تقني بيطري' : 'Superviseur de Bâtiment';
      default:
        return r;
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-950/80 text-purple-300 border border-purple-800 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            {getRoleLabel(r)}
          </span>
        );
      case 'farm_manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            {getRoleLabel(r)}
          </span>
        );
      case 'accountant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            {getRoleLabel(r)}
          </span>
        );
      case 'worker':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950/80 text-sky-300 border border-sky-800">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            {getRoleLabel(r)}
          </span>
        );
    }
  };

  const permissionLabels: Array<{ key: keyof UserPermissions; label: string; desc: string; icon: any }> = [
    { key: 'canManageFarms', label: 'إدارة المزارع والعنابر', desc: 'إضافة، تعديل وحذف المزارع والعنابر والتجهيزات', icon: Building2 },
    { key: 'canManageCycles', label: 'إدارة دورات التربية', desc: 'بدء دورات جديدة، تحديث السلالات وإغلاق الدورات', icon: Repeat },
    { key: 'canEnterDailyLogs', label: 'تسجيل المتابعة اليومية', desc: 'إدخال النفوق، استهلاك العلف، ووزن العينات', icon: Layers },
    { key: 'canManageSales', label: 'مبيعات الجملة والفواتير', desc: 'إصدار فواتير البيع ومتابعة شاحنات الدواجن', icon: DollarSign },
    { key: 'canManagePurchases', label: 'مشتريات الأعلاف والأدوية', desc: 'تسجيل فواتير العلف، الفيتامينات، ومصاريف التشغيل', icon: Sliders },
    { key: 'canManageFinance', label: 'الخزينة والحسابات البنكية', desc: 'إدارة الصناديق، التحويلات، وتسوية ديون الشركاء', icon: Key },
    { key: 'canManageWorkers', label: 'الموظفين والعمال والأجور', desc: 'تسجيل العمال، السلف (Avances)، وصرف الرواتب', icon: Briefcase },
    { key: 'canViewReports', label: 'التقارير المالية والأرباح', desc: 'عرض تقارير P&L وتحليل تكلفة الكيلوغرام', icon: FileSpreadsheet },
    { key: 'canManageUsers', label: 'إدارة المستخدمين والصلاحيات', desc: 'إضافة حسابات الموظفين وتعديل أدوارهم في النظام', icon: Shield }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-100 flex items-center gap-2">
                  <span>{language === 'ar' ? 'إدارة المستخدمين والأدوار والصلاحيات' : 'Utilisateurs & Permissions'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-purple-300 border border-stone-700 font-bold">
                    {users.length} {language === 'ar' ? 'مستخدم' : 'utilisateurs'}
                  </span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {language === 'ar'
                    ? 'التحكم في وصول المشرفين، المحاسبين ومدراء المزارع وتخصيص صلاحيات كل دور بدقة'
                    : 'Gérez les accès et droits par utilisateur et par ferme'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowRoleGuide(!showRoleGuide)}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl border border-stone-700 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{showRoleGuide ? 'إخفاء مصفوفة الصلاحيات' : 'دليل الصلاحيات والأدوار'}</span>
            </button>

            <button
              id="add-new-user-btn"
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{language === 'ar' ? '+ إضافة مستخدم جديد' : '+ Nouvel Utilisateur'}</span>
            </button>
          </div>
        </div>

        {/* Current Active User Profile Banner (Live Switcher) */}
        <div className="mt-4 p-3.5 bg-stone-950/80 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm shadow">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-100">{currentUser.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold">
                  ● الجلسة النشطة حالياً
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                الدور: <span className="text-amber-400 font-bold">{getRoleLabel(currentUser.role)}</span> | المزارع المتاحة: {currentUser.allowedFarmIds?.length ? `${currentUser.allowedFarmIds.length} مزارع` : 'كل المزارع'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] text-stone-500 hidden md:inline">تبديل الحساب النشط للتجربة:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const target = users.find(u => u.id === e.target.value);
                if (target) setCurrentUser(target);
              }}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({getRoleLabel(u.role)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roles & Permissions Explanation Matrix (Collapsible) */}
        {showRoleGuide && (
          <div className="mt-4 p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>مصفوفة الأدوار الافتراضية في نظام مزارعنا (Role-Based Access Control)</span>
              </h4>
              <button onClick={() => setShowRoleGuide(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-[11px] text-stone-400">
                    <th className="py-2 px-3 font-bold">الصلاحية / الوحدة</th>
                    <th className="py-2 px-3 font-bold text-purple-400">المدير العام / المالك</th>
                    <th className="py-2 px-3 font-bold text-amber-400">مدير مزرعة</th>
                    <th className="py-2 px-3 font-bold text-emerald-400">المحاسب المالي</th>
                    <th className="py-2 px-3 font-bold text-sky-400">مشرف عنبر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850 text-[11px] text-stone-300">
                  <tr>
                    <td className="py-2 px-3 font-medium">🏢 إدارة المزارع والعنابر</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ للمزرعة المعينة</td>
                    <td className="py-2 px-3 text-stone-500">✗ قراءة فقط</td>
                    <td className="py-2 px-3 text-stone-500">✗ قراءة فقط</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">🔄 دورات التربية وإغلاق الفوج</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-stone-500">✗ قراءة فقط</td>
                    <td className="py-2 px-3 text-stone-500">✗ قراءة فقط</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">📝 السجل اليومي (علف، نفوق، وزن)</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-stone-500">✗ قراءة فقط</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ إدخال وتعديل</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">💰 فواتير المبيعات وتحصيل الديون</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ تسجيل مبيعات</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ إدارة وتحصيل</td>
                    <td className="py-2 px-3 text-stone-500">✗ محجوبة</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">🏦 الخزينة، التحويلات وسلف العمال</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-stone-500">✗ بدون تحويلات بنكية</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ إدارة مالية كاملة</td>
                    <td className="py-2 px-3 text-stone-500">✗ محجوبة</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">📊 التقارير المالية وصافي الأرباح P&L</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ للمزرعة فقط</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">✓ كاملة</td>
                    <td className="py-2 px-3 text-stone-500">✗ محجوبة</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم، الهاتف أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pr-9 pl-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-500 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              الكل ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === 'admin' ? 'bg-purple-700 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              المدراء ({users.filter(u => u.role === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('farm_manager')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === 'farm_manager' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              مدراء المزارع ({users.filter(u => u.role === 'farm_manager').length})
            </button>
            <button
              onClick={() => setRoleFilter('accountant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === 'accountant' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              المحاسبين ({users.filter(u => u.role === 'accountant').length})
            </button>
            <button
              onClick={() => setRoleFilter('worker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === 'worker' ? 'bg-sky-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              المشرفين ({users.filter(u => u.role === 'worker').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isCurrent = currentUser.id === user.id;
          const userPermissions: UserPermissions = {
            ...DEFAULT_ROLE_PERMISSIONS[user.role],
            ...(user.permissions || {})
          };

          return (
            <div
              key={user.id}
              className={`bg-stone-900 border rounded-2xl p-5 flex flex-col justify-between transition shadow-md ${
                isCurrent ? 'border-amber-500/70 ring-1 ring-amber-500/30' : 'border-stone-800 hover:border-purple-500/40'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200 font-black text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-stone-100 flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-bold">
                            أنت
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        {user.phone ? (
                          <span className="flex items-center gap-1 dir-ltr text-[11px]">
                            <Phone className="w-3 h-3 text-stone-500" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">لا يوجد هاتف</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition"
                      title="تعديل المستخدم والصلاحيات"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isCurrent && (
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 transition"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role Badge & Status */}
                <div className="mb-3.5 flex items-center justify-between">
                  {getRoleBadge(user.role)}
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition ${
                      user.status === 'inactive'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {user.status === 'inactive' ? 'معطل' : 'نشط'}
                  </button>
                </div>

                {/* Allowed Farms */}
                <div className="p-2.5 bg-stone-950/60 rounded-xl border border-stone-850 mb-3 text-xs">
                  <span className="text-[10px] text-stone-400 block mb-1 font-semibold">نطاق المزارع المسموحة:</span>
                  {!user.allowedFarmIds || user.allowedFarmIds.length === 0 ? (
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      🏢 جميع المزارع ({farms.length} مزارع)
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.allowedFarmIds.map(fId => {
                        const farmObj = farms.find(f => f.id === fId);
                        return (
                          <span key={fId} className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded text-[10px] font-bold border border-stone-700">
                            📍 {farmObj ? farmObj.name : fId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Permissions Pills */}
                <div className="space-y-1 mb-2">
                  <span className="text-[10px] text-stone-400 block font-semibold">ملخص الصلاحيات الممنوحة:</span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className={`p-1 rounded flex items-center gap-1 ${userPermissions.canManageFarms ? 'text-emerald-400 bg-emerald-950/30' : 'text-stone-600 bg-stone-950/40'}`}>
                      {userPermissions.canManageFarms ? '✓' : '✗'} المزارع والعنابر
                    </span>
                    <span className={`p-1 rounded flex items-center gap-1 ${userPermissions.canManageCycles ? 'text-emerald-400 bg-emerald-950/30' : 'text-stone-600 bg-stone-950/40'}`}>
                      {userPermissions.canManageCycles ? '✓' : '✗'} دورات التربية
                    </span>
                    <span className={`p-1 rounded flex items-center gap-1 ${userPermissions.canEnterDailyLogs ? 'text-emerald-400 bg-emerald-950/30' : 'text-stone-600 bg-stone-950/40'}`}>
                      {userPermissions.canEnterDailyLogs ? '✓' : '✗'} المتابعة اليومية
                    </span>
                    <span className={`p-1 rounded flex items-center gap-1 ${userPermissions.canManageFinance ? 'text-emerald-400 bg-emerald-950/30' : 'text-stone-600 bg-stone-950/40'}`}>
                      {userPermissions.canManageFinance ? '✓' : '✗'} الخزينة والحسابات
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-stone-800 mt-2">
                {!isCurrent ? (
                  <button
                    onClick={() => setCurrentUser(user)}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>التبديل إلى هذا الحساب</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    أنت مسجل الدخول بهذا الحساب
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
            <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-sm text-stone-100">
                  {editingUser ? `تعديل صلاحيات ومستخدم: ${editingUser.name}` : 'إضافة مستخدم جديد للنظام'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-bold mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عبد الرحيم المنصوري"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="0661XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">الدور الوظيفي الأساسي *</label>
                  <select
                    value={role}
                    onChange={(e: any) => handleRoleChange(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-amber-400 font-black focus:border-purple-500 focus:outline-none"
                  >
                    <option value="admin">👑 المدير العام / المالك (صلاحيات كاملة)</option>
                    <option value="farm_manager">🏢 مدير مزرعة (إدارة العنابر، الدورات والعمال)</option>
                    <option value="accountant">💰 محاسب مالي (الخزينة، الفواتير والديون)</option>
                    <option value="worker">📋 مشرف عنبر / تقني بيطري (سجل يومي وأوزان)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">حالة الحساب</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-bold focus:border-purple-500 focus:outline-none"
                  >
                    <option value="active">🟢 نشط ومفعل</option>
                    <option value="inactive">🔴 معطل مؤقتاً</option>
                  </select>
                </div>
              </div>

              {/* Allowed Farms Selector */}
              <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>المزارع المصرح بالوصول إليها</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleSelectAllFarms}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      allFarmsSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    🏢 جميع المزارع
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {farms.map((farm) => {
                    const isSelected = allFarmsSelected || allowedFarmIds.includes(farm.id);
                    return (
                      <label
                        key={farm.id}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-stone-100'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleFarmToggle(farm.id)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-950 border-stone-700"
                          />
                          <span className="font-bold text-xs">{farm.name}</span>
                        </div>
                        <span className="text-[10px] text-stone-500">{farm.capacity.toLocaleString()} طائر</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-purple-300 text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>تخصيص الصلاحيات الدقيقة (Granular Permissions)</span>
                    </h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      تم التعبئة تلقائياً بناءً على الدور، يمكنك تخصيص أي صلاحية محددة لهذا المستخدم
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {permissionLabels.map((item) => {
                    const isChecked = !!permissions[item.key];
                    const Icon = item.icon;

                    return (
                      <label
                        key={item.key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                          isChecked
                            ? 'bg-purple-950/20 border-purple-800/60 text-stone-100'
                            : 'bg-stone-900 border-stone-800 text-stone-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(item.key)}
                          className="w-4 h-4 mt-0.5 rounded text-purple-500 focus:ring-purple-500 bg-stone-950 border-stone-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs text-stone-200">
                            <Icon className="w-3.5 h-3.5 text-purple-400" />
                            <span>{item.label}</span>
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">{item.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-stone-300 font-bold mb-1">ملاحظات ومسؤوليات الموظف</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات إدارية، رقم بطاقة التعريف، ساعات العمل..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-purple-500 focus:outline-none"
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
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black rounded-xl shadow-lg transition"
                >
                  {editingUser ? 'حفظ تعديلات المستخدم' : 'إضافة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setUserToDelete(null)} />
          <div className="relative w-full max-w-md bg-stone-900 border border-rose-800/60 rounded-2xl p-5 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-stone-100">تأكيد حذف المستخدم</h3>
                <p className="text-stone-400 text-[11px]">هل أنت متأكد من رغبتك في حذف هذا الحساب من النظام؟</p>
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-stone-300 space-y-1">
              <p className="font-bold text-amber-300">{userToDelete.name}</p>
              <p className="text-stone-400">الدور: {getRoleLabel(userToDelete.role)}</p>
              <p className="text-stone-400 dir-ltr">{userToDelete.phone}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg transition"
              >
                نعم، احذف الحساب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
