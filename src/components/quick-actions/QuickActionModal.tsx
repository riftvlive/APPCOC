import React, { useEffect, useState } from 'react';
import {
  X,
  PlusCircle,
  Receipt,
  ShoppingCart,
  ArrowDownLeft,
  Wheat,
  Pill,
  ArrowUpRight,
  UserCheck,
  Skull,
  Scale,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Egg,
  Baby,
  Building2,
  Truck,
  Coins,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFarm } from '../../context/FarmContext';
import { getCycleDayNumber, getMoroccoDateISO } from '../../utils/date';
import { CHICK_BREEDS, PaymentMethod, UserPermissions } from '../../types';

export type QuickPlatform = 'chicks' | 'feed' | 'farms';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: string;
  defaultPlatform?: QuickPlatform;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  initialAction,
  defaultPlatform
}) => {
  const {
    farms,
    cycles,
    partners,
    accounts,
    workers,
    medicationPurchases,
    medicationMovements,
    dailyLogs,
    allCycleSummaries,
    currency,
    language,
    addExpense,
    addSale,
    addFeedPurchase,
    addMedicationPurchase,
    addChickPurchase,
    addSettlementTransaction,
    addWorkerTransaction,
    addDailyLog,
    getFarmFeedStockKg,
    addAccountTransfer,
    addFeedSale,
    addChickSale,
    addFeedMovement,
    hasPermission,
    selectedFarmId,
    isFarmAllowed
  } = useFarm();

  const [activeAction, setActiveAction] = useState<string>(initialAction || 'menu');
  const [selectedPlatform, setSelectedPlatform] = useState<QuickPlatform>(defaultPlatform || 'farms');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initialAction and defaultPlatform
  useEffect(() => {
    if (defaultPlatform) {
      setSelectedPlatform(defaultPlatform);
    }
  }, [defaultPlatform]);

  useEffect(() => {
    if (initialAction) {
      setActiveAction(initialAction);
      if (initialAction.startsWith('chick') || initialAction === 'chicks') {
        setSelectedPlatform('chicks');
      } else if (initialAction.startsWith('feed') || initialAction === 'med') {
        setSelectedPlatform('feed');
      } else if (initialAction !== 'menu') {
        setSelectedPlatform('farms');
      }
    } else {
      setActiveAction('menu');
      if (defaultPlatform) {
        setSelectedPlatform(defaultPlatform);
      }
    }
  }, [initialAction, defaultPlatform, isOpen]);

  // Active cycles list for selecting in forms
  const activeCycles = cycles.filter(c => c.status !== 'completed');
  const defaultFarmId = selectedFarmId !== 'all' ? selectedFarmId : farms.find(farm => isFarmAllowed(farm.id))?.id || '';
  const defaultCycleId = activeCycles[0]?.id || cycles[0]?.id || '';
  const defaultAccountId = accounts[0]?.id || '';

  // Form states
  // 1. Expense Form
  const [expCategory, setExpCategory] = useState('electricity');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expFarmId, setExpFarmId] = useState(defaultFarmId);
  const [expCycleId, setExpCycleId] = useState(defaultCycleId);
  const [expAccountId, setExpAccountId] = useState(defaultAccountId);
  const [expPaidAmount, setExpPaidAmount] = useState<number | ''>('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('cash');

  // 2. Sale Form
  const [saleCustomerId, setSaleCustomerId] = useState(partners.find(p => p.type === 'customer')?.id || '');
  const [saleFarmId, setSaleFarmId] = useState(defaultFarmId);
  const [saleCycleId, setSaleCycleId] = useState(defaultCycleId);
  const [saleCount, setSaleCount] = useState<number | ''>('');
  const [saleTotalWeight, setSaleTotalWeight] = useState<number | ''>('');
  const [salePricePerKg, setSalePricePerKg] = useState<number | ''>(18.5);
  const [salePaid, setSalePaid] = useState<number | ''>('');
  const [saleAccountId, setSaleAccountId] = useState(defaultAccountId);
  const [saleTruckPlate, setSaleTruckPlate] = useState('');
  const [saleDriverName, setSaleDriverName] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  const selectedSaleSummary = allCycleSummaries.find(summary => summary.cycleId === saleCycleId);
  const suggestedSalePrice = selectedSaleSummary?.costPerKg
    ? Math.ceil((selectedSaleSummary.costPerKg * 1.2) * 4) / 4
    : 0;

  useEffect(() => {
    if (suggestedSalePrice > 0) setSalePricePerKg(suggestedSalePrice);
  }, [saleCycleId, suggestedSalePrice]);

  const saleAverageWeight = selectedSaleSummary?.averageBirdWeightKg
    || cycles.find(cycle => cycle.id === saleCycleId)?.targetWeightKg
    || 2.2;

  useEffect(() => {
    const weight = Number(saleTotalWeight);
    if (weight > 0 && saleAverageWeight > 0) {
      setSaleCount(Math.max(1, Math.round(weight / saleAverageWeight)));
    }
  }, [saleTotalWeight, saleCycleId, saleAverageWeight]);

  // 3. Feed Form
  const [feedSupplierId, setFeedSupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [feedType, setFeedType] = useState<'starter' | 'grower' | 'finisher'>('grower');
  const [feedBrand, setFeedBrand] = useState('علف نمو مركب 50 كغ');
  const [feedQuantityKg, setFeedQuantityKg] = useState<number | ''>(5000);
  const [feedPricePerKg, setFeedPricePerKg] = useState<number | ''>(4.5);
  const [feedFarmId, setFeedFarmId] = useState(defaultFarmId);
  const [feedPaid, setFeedPaid] = useState<number | ''>(0);
  const [feedAccountId, setFeedAccountId] = useState(defaultAccountId);

  // 4. Med Form
  const [medSupplierId, setMedSupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState<'vaccine' | 'antibiotic' | 'vitamin' | 'disinfectant' | 'supplement'>('vitamin');
  const [medAmount, setMedAmount] = useState<number | ''>('');
  const [medQuantity, setMedQuantity] = useState<number | ''>(1);
  const [medUnit, setMedUnit] = useState('حصة');
  const [medPaid, setMedPaid] = useState<number | ''>('');
  const [medFarmId, setMedFarmId] = useState(defaultFarmId);
  const [medAccountId, setMedAccountId] = useState(defaultAccountId);

  // 5. Customer Payment Collection
  const [collectCustomerId, setCollectCustomerId] = useState(partners.find(p => p.type === 'customer')?.id || '');
  const [collectAmount, setCollectAmount] = useState<number | ''>('');
  const [collectAccountId, setCollectAccountId] = useState(defaultAccountId);
  const [collectNotes, setCollectNotes] = useState('');

  // 6. Supplier Payment
  const [paySupplierId, setPaySupplierId] = useState(partners.find(p => p.type === 'supplier')?.id || '');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payAccountId, setPayAccountId] = useState(defaultAccountId);
  const [payNotes, setPayNotes] = useState('');

  // 7. Worker Payment / Advance
  const [wrkId, setWrkId] = useState(workers[0]?.id || '');
  const [wrkType, setWrkType] = useState<'salary' | 'advance_loan' | 'bonus'>('salary');
  const [wrkAmount, setWrkAmount] = useState<number | ''>('');
  const [wrkCycleId, setWrkCycleId] = useState(defaultCycleId);
  const [wrkAccountId, setWrkAccountId] = useState(defaultAccountId);
  const [wrkNotes, setWrkNotes] = useState('');
  const workerCycles = cycles.filter(cycle => cycle.status !== 'completed' && (!workers.find(worker => worker.id === wrkId)?.farmId || cycle.farmId === workers.find(worker => worker.id === wrkId)?.farmId));

  // 8. Mortality Log
  const [mortCycleId, setMortCycleId] = useState(defaultCycleId);
  const [mortDate, setMortDate] = useState(getMoroccoDateISO());
  const [mortCount, setMortCount] = useState<number | ''>('');
  const [mortFeedKg, setMortFeedKg] = useState<number | ''>('');
  const [mortMedicationPurchaseId, setMortMedicationPurchaseId] = useState('');
  const [mortMedicationName, setMortMedicationName] = useState('');
  const [mortMedicationQuantity, setMortMedicationQuantity] = useState<number | ''>('');
  const [mortMedicationUnit, setMortMedicationUnit] = useState('جرعة');
  const [mortNotes, setMortNotes] = useState('');
  const mortCycleFarmId = cycles.find(cycle => cycle.id === mortCycleId)?.farmId;
  const mortMedicationStock = medicationPurchases
    .filter(purchase => purchase.farmId === mortCycleFarmId)
    .map(purchase => {
      const used = dailyLogs.filter(log => log.medicationPurchaseId === purchase.id).reduce((sum, log) => sum + (log.medicationQuantity || 0), 0)
        + medicationMovements.filter(m => m.medicationPurchaseId === purchase.id && ['issue', 'waste'].includes(m.type)).reduce((sum, m) => sum + m.quantity, 0);
      return { purchase, available: Math.max(0, (purchase.quantity ?? 1) - used) };
    })
    .filter(item => item.available > 0);
  const selectedMortMedication = mortMedicationStock.find(item => item.purchase.id === mortMedicationPurchaseId);

  // 9. Weight Sample Log
  const [weightCycleId, setWeightCycleId] = useState(defaultCycleId);
  const [weightDate, setWeightDate] = useState(getMoroccoDateISO());
  const [sampleAvgGrams, setSampleAvgGrams] = useState<number | ''>('');
  const [weightNotes, setWeightNotes] = useState('');
  const mortalityDayNumber = getCycleDayNumber(cycles.find(c => c.id === mortCycleId)?.startDate || '', mortDate);
  const weightDayNumber = getCycleDayNumber(cycles.find(c => c.id === weightCycleId)?.startDate || '', weightDate);

  // 10. Account Transfer
  const [xferFromId, setXferFromId] = useState(accounts[0]?.id || '');
  const [xferToId, setXferToId] = useState(accounts[1]?.id || '');
  const [xferAmount, setXferAmount] = useState<number | ''>('');
  const [xferNotes, setXferNotes] = useState('');

  // 11. Chick Purchase
  const [chickSupplierId, setChickSupplierId] = useState(partners.find(p => p.type === 'supplier' || p.type === 'both')?.id || '');
  const [chickFarmId, setChickFarmId] = useState(defaultFarmId);
  const [chickBreed, setChickBreed] = useState('Ross 308');
  const [chickCount, setChickCount] = useState<number | ''>('');
  const [chickUnitPrice, setChickUnitPrice] = useState<number | ''>(5.8);
  const [chickTransport, setChickTransport] = useState<number | ''>(0);
  const [chickVaccines, setChickVaccines] = useState<number | ''>(0);
  const [chickPaid, setChickPaid] = useState<number | ''>('');
  const [chickAccountId, setChickAccountId] = useState(defaultAccountId);
  const [chickNotes, setChickNotes] = useState('');

  // 12. Chick Sale Form
  const [csCustomerId, setCsCustomerId] = useState(partners.find(p => p.type === 'customer' || p.type === 'both')?.id || '');
  const [csFarmId, setCsFarmId] = useState(defaultFarmId);
  const [csBreed, setCsBreed] = useState('Ross 308');
  const [csQuantity, setCsQuantity] = useState<number | ''>(1000);
  const [csBonus, setCsBonus] = useState<number | ''>(20);
  const [csUnitPrice, setCsUnitPrice] = useState<number | ''>(6.5);
  const [csCostPrice, setCsCostPrice] = useState<number | ''>(5.5);
  const [csPaid, setCsPaid] = useState<number | ''>('');
  const [csPaidMethod, setCsPaidMethod] = useState<PaymentMethod>('cash');
  const [csAccountId, setCsAccountId] = useState(defaultAccountId);
  const [csTruck, setCsTruck] = useState('');
  const [csDriver, setCsDriver] = useState('');
  const [csNotes, setCsNotes] = useState('');

  // 13. Chick Housing Form
  const [chFarmId, setChFarmId] = useState(defaultFarmId);
  const [chCycleId, setChCycleId] = useState(defaultCycleId);
  const [chBreed, setChBreed] = useState('Ross 308');
  const [chCount, setChCount] = useState<number | ''>(5000);
  const [chUnitPrice, setChUnitPrice] = useState<number | ''>(5.8);
  const [chSupplierId, setChSupplierId] = useState(partners.find(p => p.type === 'supplier' || p.type === 'both')?.id || '');
  const [chDate, setChDate] = useState(getMoroccoDateISO());
  const [chNotes, setChNotes] = useState('');

  // 14. Feed Sale Form
  const [fsCustomerId, setFsCustomerId] = useState(partners.find(p => p.type === 'customer' || p.type === 'both')?.id || '');
  const [fsFarmId, setFsFarmId] = useState(defaultFarmId);
  const [fsFeedType, setFsFeedType] = useState<'starter' | 'grower' | 'finisher' | 'other'>('grower');
  const [fsBrand, setFsBrand] = useState('علف نمو مركب');
  const [fsQuantityKg, setFsQuantityKg] = useState<number | ''>(1000);
  const [fsUnitPriceKg, setFsUnitPriceKg] = useState<number | ''>(4.8);
  const [fsCostPriceKg, setFsCostPriceKg] = useState<number | ''>(4.2);
  const [fsPaid, setFsPaid] = useState<number | ''>('');
  const [fsPaidMethod, setFsPaidMethod] = useState<PaymentMethod>('cash');
  const [fsAccountId, setFsAccountId] = useState(defaultAccountId);
  const [fsTruck, setFsTruck] = useState('');
  const [fsNotes, setFsNotes] = useState('');

  // 15. Feed Issue Form
  const [fiFarmId, setFiFarmId] = useState(defaultFarmId);
  const [fiCycleId, setFiCycleId] = useState(defaultCycleId);
  const [fiFeedType, setFiFeedType] = useState<'starter' | 'grower' | 'finisher'>('grower');
  const [fiQuantityKg, setFiQuantityKg] = useState<number | ''>(500);
  const [fiDate, setFiDate] = useState(getMoroccoDateISO());
  const [fiNotes, setFiNotes] = useState('');

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (_) {}
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
      setActiveAction('menu');
    }, 1200);
  };

  const actionList: Array<{
    id: string;
    platform: QuickPlatform;
    permission?: keyof UserPermissions;
    label: string;
    sub: string;
    icon: any;
    color: string;
  }> = [
    // 1. CHICKS PLATFORM
    {
      id: 'chicks',
      platform: 'chicks',
      permission: 'canManagePurchases',
      label: language === 'ar' ? 'شراء واستلام كتاكيت' : 'Achat Poussins',
      sub: language === 'ar' ? 'توريد من المفرخة، السلالة، العدد، النقل والدفع' : 'Réception couvoir, souche, transport',
      icon: Baby,
      color: 'from-amber-600 to-amber-500'
    },
    {
      id: 'chick_sale',
      platform: 'chicks',
      permission: 'canManageSales',
      label: language === 'ar' ? 'بيع كتاكيت للزبائن' : 'Vente Poussins',
      sub: language === 'ar' ? 'إصدار فاتورة بيع كتاكيت عمر يوم، قبض ودين' : 'Facturation poussins 1j, crédit',
      icon: ShoppingCart,
      color: 'from-orange-600 to-amber-600'
    },
    {
      id: 'chick_housing',
      platform: 'chicks',
      permission: 'canManagePurchases',
      label: language === 'ar' ? 'تسكين كتاكيت بالعنبر' : 'Mise en place',
      sub: language === 'ar' ? 'صرف وتوجيه دفعة لمزرعة وعنبر دورة تسمين' : 'Affectation bande & bâtiment',
      icon: Truck,
      color: 'from-amber-700 to-orange-600'
    },
    {
      id: 'chick_supplier_pay',
      platform: 'chicks',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'سداد دفعة لمفرخة' : 'Paiement Couvoir',
      sub: language === 'ar' ? 'دفع مستحقات مفرخة من الخزينة وتخفيض الدين' : 'Règlement dette couvoir',
      icon: ArrowUpRight,
      color: 'from-rose-600 to-amber-600'
    },
    {
      id: 'chick_customer_collect',
      platform: 'chicks',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'تحصيل من مشتري كتاكيت' : 'Encaissement Poussins',
      sub: language === 'ar' ? 'قبض مبيعات كتاكيت وإيداعها في الصندوق' : 'Règlement client poussins',
      icon: ArrowDownLeft,
      color: 'from-emerald-600 to-teal-500'
    },

    // 2. FEED PLATFORM
    {
      id: 'feed',
      platform: 'feed',
      permission: 'canManagePurchases',
      label: language === 'ar' ? 'شراء وتوريد علف' : 'Achat Aliments',
      sub: language === 'ar' ? 'بادي، نامي، ناهي للمستودع المركزي مع الدفع' : 'Entrée stock, démarrage, croissance',
      icon: Wheat,
      color: 'from-yellow-600 to-amber-500'
    },
    {
      id: 'feed_sale',
      platform: 'feed',
      permission: 'canManageSales',
      label: language === 'ar' ? 'بيع علف للزبائن' : 'Vente Aliments',
      sub: language === 'ar' ? 'بيع أكياس أو أطنان علف، قبض ودين زبون' : 'Vente sacs/tonnes, crédit',
      icon: ShoppingCart,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'feed_issue',
      platform: 'feed',
      permission: 'canManagePurchases',
      label: language === 'ar' ? 'صرف علف لمزرعة' : 'Distribution Ferme',
      sub: language === 'ar' ? 'خصم من المستودع وصرف لعنبر ودورة نشطة' : 'Sortie stock vers bâtiment',
      icon: ArrowDownLeft,
      color: 'from-yellow-700 to-orange-500'
    },
    {
      id: 'med',
      platform: 'feed',
      permission: 'canManagePurchases',
      label: language === 'ar' ? 'شراء دواء / لقاح' : 'Achat Médicaments',
      sub: language === 'ar' ? 'تحصينات وفيتامينات ومضادات حيوية بيطرية' : 'Vaccins, vitamines & antibios',
      icon: Pill,
      color: 'from-indigo-600 to-indigo-500'
    },
    {
      id: 'feed_supplier_pay',
      platform: 'feed',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'سداد لمورد أعلاف' : 'Paiement Fournisseur Aliments',
      sub: language === 'ar' ? 'دفع فواتير مطاحن وشركات الأعلاف والأدوية' : 'Règlement usine aliment',
      icon: ArrowUpRight,
      color: 'from-rose-600 to-rose-500'
    },
    {
      id: 'feed_customer_collect',
      platform: 'feed',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'تحصيل من مشتري علف' : 'Encaissement Aliments',
      sub: language === 'ar' ? 'قبض مبيعات علف من الزبائن وتخفيض الذمة' : 'Règlement client aliment',
      icon: Coins,
      color: 'from-teal-600 to-emerald-500'
    },

    // 3. FARMS PLATFORM
    {
      id: 'sale',
      platform: 'farms',
      permission: 'canManageSales',
      label: language === 'ar' ? 'بيع دجاج لحم حي' : 'Vente Volailles Vives',
      sub: language === 'ar' ? 'تسجيل بيعة دجاج تسمين بالميزان والوزن والقبض' : 'Poids total, prix/kg, encaissement',
      icon: ShoppingCart,
      color: 'from-emerald-600 to-emerald-500'
    },
    {
      id: 'mortality',
      platform: 'farms',
      permission: 'canEnterDailyLogs',
      label: language === 'ar' ? 'تسجيل نافق يومي' : 'Mortalité & Conso',
      sub: language === 'ar' ? 'توثيق وفيات العنبر واستهلاك العلف بالدورة' : 'Mortalité quotidienne, aliment',
      icon: Skull,
      color: 'from-stone-700 to-stone-600'
    },
    {
      id: 'weight',
      platform: 'farms',
      permission: 'canEnterDailyLogs',
      label: language === 'ar' ? 'تسجيل وزن عينة' : 'Pesée Échantillon',
      sub: language === 'ar' ? 'متابعة النمو الأسبوعي ومتوسط وزن الطائر والـ FCR' : 'Poids moyen, courbe de croissance',
      icon: Scale,
      color: 'from-blue-600 to-blue-500'
    },
    {
      id: 'expense',
      platform: 'farms',
      permission: 'canManagePurchases',
      label: language === 'ar' ? 'مصروف مزرعة / دورة' : 'Dépense Élevage',
      sub: language === 'ar' ? 'كهرباء، غاز تدفئة، فرشة، صيانة، تعقيم...' : 'Énergie, gaz, litière, entretien',
      icon: Receipt,
      color: 'from-amber-600 to-amber-500'
    },
    {
      id: 'worker_pay',
      platform: 'farms',
      permission: 'canManageWorkers',
      label: language === 'ar' ? 'صرف لعامل / سلفة' : 'Salaires & Avances',
      sub: language === 'ar' ? 'رواتب وسلف ومكافآت عمال المزارع' : 'Avances, paies, primes',
      icon: UserCheck,
      color: 'from-purple-600 to-purple-500'
    },
    {
      id: 'poultry_collect',
      platform: 'farms',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'تحصيل من تاجر دواجن' : 'Encaissement Volailles',
      sub: language === 'ar' ? 'قبض دفعات بيع الدجاج الحي من التجار' : 'Règlement marchand volaille',
      icon: ArrowDownLeft,
      color: 'from-teal-600 to-teal-500'
    },
    {
      id: 'farm_supplier_pay',
      platform: 'farms',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'سداد مورد مستلزمات' : 'Paiement Fournisseur Ferme',
      sub: language === 'ar' ? 'سداد فواتير الفرشة، الغاز، ومعدات المزرعة' : 'Gaz, copeaux, matériel',
      icon: ArrowUpRight,
      color: 'from-rose-600 to-rose-500'
    },
    {
      id: 'transfer',
      platform: 'farms',
      permission: 'canManageFinance',
      label: language === 'ar' ? 'تحويل سيولة بين الخزائن' : 'Virement Inter-comptes',
      sub: language === 'ar' ? 'نقل أموال بين البنوك والصناديق النقدية' : 'Transfert caisse vers banque',
      icon: ArrowLeftRight,
      color: 'from-cyan-600 to-cyan-500'
    }
  ];

  // Submit Handlers
  const handleChickSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csCustomerId || !csQuantity || Number(csQuantity) <= 0 || !csUnitPrice || Number(csUnitPrice) <= 0) return;
    const qty = Number(csQuantity);
    const bonus = Number(csBonus || 0);
    const price = Number(csUnitPrice);
    const total = qty * price;
    const paid = csPaid === '' ? total : Number(csPaid);
    const remaining = Math.max(0, total - paid);

    addChickSale({
      invoiceNumber: `INV-CS-${Date.now().toString().slice(-6)}`,
      date: getMoroccoDateISO(),
      customerId: csCustomerId,
      customerName: partners.find(p => p.id === csCustomerId)?.name || 'زبون كتاكيت',
      farmId: csFarmId,
      breed: csBreed,
      quantity: qty,
      bonusCount: bonus,
      unitPrice: price,
      costUnitPrice: Number(csCostPrice || 0),
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentMethod: csPaidMethod,
      accountId: csAccountId,
      truckPlate: csTruck || undefined,
      driverName: csDriver || undefined,
      notes: csNotes || 'بيع كتاكيت عمر يوم (تسجيل سريع)'
    });

    triggerSuccess('تم تسجيل بيع الكتاكيت وحسابها مالياً وتشغيلياً بنجاح!');
  };

  const handleChickHousingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chCount || Number(chCount) <= 0 || !chFarmId) return;
    const count = Number(chCount);
    const unitPrice = Number(chUnitPrice || 5.8);
    const total = count * unitPrice;

    addChickPurchase({
      date: chDate || getMoroccoDateISO(),
      supplierId: chSupplierId || partners.find(p => p.type === 'supplier')?.id || 'direct',
      breed: chBreed,
      quantity: count,
      unitPrice: unitPrice,
      totalCost: total,
      paidAmount: 0,
      remainingAmount: 0,
      farmId: chFarmId,
      cycleId: chCycleId || undefined,
      notes: chNotes || 'تسكين دفعة كتاكيت في العنبر (تسجيل سريع)'
    }, false);

    triggerSuccess('تم تسكين الكتاكيت بالعنبر وتحديث بيانات الدورة بنجاح!');
  };

  const handleFeedSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fsCustomerId || !fsQuantityKg || Number(fsQuantityKg) <= 0 || !fsUnitPriceKg || Number(fsUnitPriceKg) <= 0) return;
    const qty = Number(fsQuantityKg);
    const price = Number(fsUnitPriceKg);
    const total = qty * price;
    const paid = fsPaid === '' ? total : Number(fsPaid);
    const remaining = Math.max(0, total - paid);

    addFeedSale({
      invoiceNumber: `INV-FS-${Date.now().toString().slice(-6)}`,
      date: getMoroccoDateISO(),
      customerId: fsCustomerId,
      customerName: partners.find(p => p.id === fsCustomerId)?.name || 'مشتري علف',
      farmId: fsFarmId,
      feedType: fsFeedType,
      brand: fsBrand || `علف ${fsFeedType}`,
      quantityKg: qty,
      bagsCount: Math.round(qty / 50),
      unitPricePerKg: price,
      costPricePerKg: Number(fsCostPriceKg || 0),
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentMethod: fsPaidMethod,
      accountId: fsAccountId,
      truckPlate: fsTruck || undefined,
      notes: fsNotes || 'بيع علف للزبون (تسجيل سريع)'
    });

    triggerSuccess('تم تسجيل بيع العلف وتحديث المخزون والمالية بنجاح!');
  };

  const handleFeedIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fiFarmId || !fiQuantityKg || Number(fiQuantityKg) <= 0) return;
    const qty = Number(fiQuantityKg);

    addFeedMovement({
      farmId: fiFarmId,
      cycleId: fiCycleId || undefined,
      type: 'issue',
      feedType: fiFeedType,
      quantityKg: qty,
      date: fiDate || getMoroccoDateISO(),
      performedBy: 'تسجيل سريع',
      notes: fiNotes || `صرف علف ${fiFeedType} إلى مزرعة/عنبر (${qty.toLocaleString()} كغ)`
    });

    triggerSuccess('تم صرف العلف للمزرعة وتحديث رصيد المستودع بنجاح!');
  };

  // Submit Handlers
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return;
    const amt = Number(expAmount);
    const paid = expPaidAmount === '' ? amt : Number(expPaidAmount);
    addExpense({
      date: getMoroccoDateISO(),
      category: expCategory,
      description: expDescription || `مصروف ${expCategory}`,
      amount: amt,
      paidAmount: paid,
      remainingAmount: Math.max(0, amt - paid),
      farmId: expFarmId,
      cycleId: expCycleId || undefined,
      paymentMethod: expPaymentMethod,
      accountId: expAccountId
    });
    triggerSuccess('تم تسجيل المصروف بنجاح!');
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleCustomerId || !saleTotalWeight || !salePricePerKg || !saleCount) return;
    const count = Number(saleCount);
    const weight = Number(saleTotalWeight);
    const price = Number(salePricePerKg);
    const gross = weight * price;
    const net = gross;
    const paid = salePaid === '' ? net : Number(salePaid);
    const rem = Math.max(0, net - paid);

    addSale({
      invoiceNumber: `VTE-${Date.now().toString().slice(-4)}`,
      date: getMoroccoDateISO(),
      customerId: saleCustomerId,
      farmId: saleFarmId,
      cycleId: saleFarmId === 'central' ? (saleCycleId || 'central_stock') : (saleCycleId || 'general_batch'),
      chickenCount: count,
      totalWeightKg: weight,
      averageWeightKg: Number((weight / count).toFixed(3)),
      pricePerKg: price,
      grossTotal: gross,
      discount: 0,
      netTotal: net,
      paidAmount: paid,
      remainingAmount: rem,
      paymentMethod: rem > 0 ? 'partial' : 'cash',
      accountId: saleAccountId,
      truckPlate: saleTruckPlate.trim() || undefined,
      driverName: saleDriverName.trim() || undefined,
      notes: saleNotes.trim() || undefined
    });
    triggerSuccess('تم تسجيل فاتورة البيع والقبض بنجاح!');
  };

  const handleFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedFarmId || !feedQuantityKg || !feedPricePerKg) return;
    const qty = Number(feedQuantityKg);
    const unitPrice = Number(feedPricePerKg);
    const total = qty * unitPrice;
    const paid = feedPaid === '' ? 0 : Number(feedPaid);
    const rem = Math.max(0, total - paid);

    addFeedPurchase({
      invoiceNumber: `FAC-F-${Date.now().toString().slice(-4)}`,
      date: getMoroccoDateISO(),
      supplierId: feedSupplierId,
      feedType,
      brand: feedBrand,
      quantityKg: qty,
      bagsCount: Math.round(qty / 50),
      bagWeightKg: 50,
      unitPricePerKg: unitPrice,
      totalAmount: total,
      farmId: feedFarmId,
      cycleId: undefined,
      paymentMethod: rem === 0 ? 'cash' : paid > 0 ? 'partial' : 'delayed',
      paidAmount: paid,
      remainingAmount: rem,
      accountId: feedAccountId
    });
    triggerSuccess('تم تسجيل شراء العلف وتحديث ديون المورد!');
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medFarmId || !medAmount) return;
    const total = Number(medAmount);
    const paid = medPaid === '' ? total : Number(medPaid);
    const rem = Math.max(0, total - paid);

    addMedicationPurchase({
      date: getMoroccoDateISO(),
      supplierId: medSupplierId,
      medicationName: medName || 'أدوية وتحصينات بيطرية',
      category: medCategory,
      quantity: Number(medQuantity || 0),
      unit: medUnit,
      unitPrice: Number(medQuantity || 1) > 0 ? total / Number(medQuantity || 1) : total,
      totalAmount: total,
      farmId: medFarmId,
      cycleId: undefined,
      paymentMethod: rem === 0 ? 'cash' : 'partial',
      paidAmount: paid,
      remainingAmount: rem,
      accountId: medAccountId
    });
    triggerSuccess('تم تسجيل شراء الأدوية بنجاح!');
  };

  const handleChickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chickCount || !chickUnitPrice || !chickSupplierId) return;
    const count = Number(chickCount);
    const chickCost = count * Number(chickUnitPrice);
    const total = chickCost + Number(chickTransport || 0) + Number(chickVaccines || 0);
    const paid = chickPaid === '' ? total : Math.min(total, Number(chickPaid));
    addChickPurchase({
      invoiceNumber: `CHK-${Date.now().toString().slice(-6)}`,
      date: getMoroccoDateISO(),
      supplierId: chickSupplierId,
      breed: chickBreed,
      farmId: chickFarmId,
      cycleId: undefined,
      orderedCount: count,
      bonusCount: 0,
      transportMortalityCount: 0,
      receivedHealthyCount: count,
      unitPrice: Number(chickUnitPrice),
      chickCost,
      transportCost: Number(chickTransport || 0),
      vaccineCostAtHatchery: Number(chickVaccines || 0),
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: total - paid,
      paymentMethod: paid === total ? 'cash' : paid > 0 ? 'partial' : 'delayed',
      accountId: chickAccountId,
      notes: chickNotes || undefined
    });
    triggerSuccess('تم تسجيل شراء الكتاكيت وتحديث مصاريف المورد!');
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectAmount || Number(collectAmount) <= 0) return;
    addSettlementTransaction({
      partnerId: collectCustomerId,
      amount: Number(collectAmount),
      type: 'customer_payment',
      accountId: collectAccountId,
      description: collectNotes || 'تحصيل دفعة مالية من الزبون',
      paymentMethod: 'cash'
    });
    triggerSuccess('تم تسجيل التحصيل وتحديث رصيد الزبون!');
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    addSettlementTransaction({
      partnerId: paySupplierId,
      amount: Number(payAmount),
      type: 'supplier_payment',
      accountId: payAccountId,
      description: payNotes || 'سداد دفعة للمورد',
      paymentMethod: 'bank_transfer'
    });
    triggerSuccess('تم سداد الدفعة للمورد وتخفيض الدين!');
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wrkAmount || Number(wrkAmount) <= 0) return;
    const worker = workers.find(w => w.id === wrkId);
    addWorkerTransaction({
      workerId: wrkId,
      farmId: worker?.farmId || defaultFarmId,
      cycleId: wrkCycleId,
      date: getMoroccoDateISO(),
      type: wrkType,
      amount: Number(wrkAmount),
      accountId: wrkAccountId,
      description: wrkNotes || (wrkType === 'salary' ? 'صرف راتب' : wrkType === 'advance_loan' ? 'سلفة على الراتب' : 'مكافأة')
    });
    triggerSuccess('تم تسجيل صرف المبلغ للعامل!');
  };

  const handleMortalitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortCount || mortalityDayNumber < 1) return;
    if (mortMedicationPurchaseId && (!selectedMortMedication || Number(mortMedicationQuantity || 0) <= 0 || Number(mortMedicationQuantity) > selectedMortMedication.available)) return;
    addDailyLog({
      cycleId: mortCycleId,
      date: mortDate,
      dayNumber: mortalityDayNumber,
      mortalityCount: Number(mortCount),
      feedConsumedKg: Number(mortFeedKg || 0),
      medicationPurchaseId: mortMedicationPurchaseId || undefined,
      medicationName: selectedMortMedication?.purchase.medicationName || mortMedicationName.trim() || undefined,
      medicationQuantity: mortMedicationQuantity ? Number(mortMedicationQuantity) : undefined,
      medicationUnit: selectedMortMedication?.purchase.unit || (mortMedicationName.trim() ? mortMedicationUnit : undefined),
      notes: mortNotes
    });
    triggerSuccess('تم تسجيل عدد النافق وتحديث سجل الدورة!');
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleAvgGrams || weightDayNumber < 1) return;
    addDailyLog({
      cycleId: weightCycleId,
      date: weightDate,
      dayNumber: weightDayNumber,
      mortalityCount: 0,
      feedConsumedKg: 0,
      sampleAverageWeightGrams: Number(sampleAvgGrams),
      notes: weightNotes || 'عينة وزن دورية'
    });
    triggerSuccess('تم حفظ متوسط وزن العينة بنجاح!');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xferAmount || xferFromId === xferToId) return;
    addAccountTransfer(xferFromId, xferToId, Number(xferAmount), xferNotes);
    triggerSuccess('تم تحويل السيولة بين الحسابات بنجاح!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-stone-800/90 border-b border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-sm ${
              selectedPlatform === 'chicks'
                ? 'bg-amber-500/20 text-amber-400'
                : selectedPlatform === 'feed'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-stone-100">
                  {activeAction === 'menu'
                    ? (language === 'ar' ? 'تسجيل عملية سريعة (< 10 ثوانٍ)' : 'Opération Rapide (< 10s)')
                    : actionList.find(a => a.id === activeAction)?.label || (language === 'ar' ? 'تسجيل عملية' : 'Opération')}
                </h3>
                {activeAction !== 'menu' && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    actionList.find(a => a.id === activeAction)?.platform === 'chicks'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : actionList.find(a => a.id === activeAction)?.platform === 'feed'
                      ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {actionList.find(a => a.id === activeAction)?.platform === 'chicks' ? 'الكتاكيت' : actionList.find(a => a.id === activeAction)?.platform === 'feed' ? 'العلف' : 'المزارع'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {language === 'ar' ? 'اختر العملية ليتم حسابها مالياً وتشغيلياً تلقائياً' : 'Calcul automatique et synchronisé'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activeAction !== 'menu' && (
              <button
                onClick={() => setActiveAction('menu')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold px-2 py-1 bg-stone-800 rounded-lg border border-stone-700 hover:bg-stone-700 transition"
              >
                {language === 'ar' ? '← القائمة' : '← Menu'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {successMessage ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <div className="text-base font-bold text-stone-100">{successMessage}</div>
              <p className="text-xs text-stone-400">تم تحديث الأرصدة والسجلات والـ Audit Log فوراً</p>
            </div>
          ) : activeAction === 'menu' ? (
            <div className="space-y-3">
              {/* 3-Platform Dedicated Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-950/80 rounded-xl border border-stone-800">
                {/* 1. Chicks Platform */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('chicks')}
                  className={`py-2 px-2 rounded-lg text-xs font-black transition flex flex-col items-center gap-1 ${
                    selectedPlatform === 'chicks'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'الكتاكيت' : 'Poussins'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300/90 border border-amber-500/20">
                    5 {language === 'ar' ? 'عمليات' : 'ops'}
                  </span>
                </button>

                {/* 2. Feed Platform */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('feed')}
                  className={`py-2 px-2 rounded-lg text-xs font-black transition flex flex-col items-center gap-1 ${
                    selectedPlatform === 'feed'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Wheat className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{language === 'ar' ? 'العلف' : 'Aliments'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-yellow-500/10 text-yellow-300/90 border border-yellow-500/20">
                    6 {language === 'ar' ? 'عمليات' : 'ops'}
                  </span>
                </button>

                {/* 3. Farms Platform */}
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('farms')}
                  className={`py-2 px-2 rounded-lg text-xs font-black transition flex flex-col items-center gap-1 ${
                    selectedPlatform === 'farms'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'المزارع' : 'Fermes'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-300/90 border border-emerald-500/20">
                    8 {language === 'ar' ? 'عمليات' : 'ops'}
                  </span>
                </button>
              </div>

              {/* Platform Info Banner */}
              <div className={`px-3 py-2 rounded-xl border text-[11px] font-medium flex items-center justify-between transition ${
                selectedPlatform === 'chicks'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : selectedPlatform === 'feed'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <span className="truncate">
                  {selectedPlatform === 'chicks'
                    ? (language === 'ar' ? '🐣 منصة الكتاكيت: شراء، بيع، تسكين بالعنبر، وسداد المفارخ' : 'Poussins: Achats, Ventes, Placement en bâtiment')
                    : selectedPlatform === 'feed'
                    ? (language === 'ar' ? '🌾 منصة العلف: شراء، بيع للزبائن، صرف العنابر، والأدوية' : 'Aliments: Achats, Ventes, Distribution, Médicaments')
                    : (language === 'ar' ? '🏢 منصة المزارع: بيع الدجاج الحي، وفيات، عينات الوزن، والمصاريف' : 'Fermes: Vente volaille, Mortalité, Pesée, Dépenses')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900/90 font-mono font-bold text-stone-200 border border-stone-700 shrink-0 mr-1.5">
                  &lt; 10s
                </span>
              </div>

              {/* Filtered Action Menu Grid for Selected Platform */}
              <div className="grid grid-cols-2 gap-2.5">
                {actionList
                  .filter(act => act.platform === selectedPlatform && (!act.permission || hasPermission(act.permission as keyof UserPermissions)))
                  .map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.id}
                        id={`quick-action-btn-${act.id}`}
                        onClick={() => setActiveAction(act.id)}
                        className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-right flex flex-col justify-between gap-2 transition active:scale-95 group shadow-sm hover:border-amber-500/40"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${act.color} text-white flex items-center justify-center shadow-md`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-100 group-hover:text-amber-300 transition">
                            + {act.label}
                          </div>
                          <div className="text-[10px] text-stone-400 leading-tight line-clamp-1 mt-0.5">
                            {act.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* Sub-forms */
            <div>
              {/* 0. Chick Purchase Form */}
              {activeAction === 'chicks' && (
                <form onSubmit={handleChickSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المفرخة / المورد *</label>
                    <select required value={chickSupplierId} onChange={e => setChickSupplierId(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                      <option value="">اختر المورد</option>
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مكان التخزين / الاستلام</label>
                      <select value={chickFarmId} onChange={e => setChickFarmId(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                        <option value="central">🏢 المخزن العام</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">السلالة</label>
                      <select value={chickBreed} onChange={e => setChickBreed(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                        {CHICK_BREEDS.map(breed => <option key={breed}>{breed}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">عدد الكتاكيت *</label>
                      <input type="number" min="1" required value={chickCount} onChange={e => setChickCount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold" />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر الكتكوت ({currency}) *</label>
                      <input type="number" min="0" step="0.01" required value={chickUnitPrice} onChange={e => setChickUnitPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-stone-300 font-bold mb-1">مصاريف النقل ({currency})</label><input type="number" min="0" value={chickTransport} onChange={e => setChickTransport(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" /></div>
                    <div><label className="block text-stone-300 font-bold mb-1">اللقاحات عند المفرخة ({currency})</label><input type="number" min="0" value={chickVaccines} onChange={e => setChickVaccines(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" /></div>
                  </div>

                  {chickCount && chickUnitPrice && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <div className="flex justify-between"><span>قيمة الكتاكيت:</span><b>{(Number(chickCount) * Number(chickUnitPrice)).toLocaleString()} {currency}</b></div>
                    <div className="flex justify-between font-black text-amber-300"><span>الإجمالي:</span><b>{(Number(chickCount) * Number(chickUnitPrice) + Number(chickTransport || 0) + Number(chickVaccines || 0)).toLocaleString()} {currency}</b></div>
                  </div>}

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-stone-300 font-bold mb-1">المدفوع الآن</label><input type="number" min="0" value={chickPaid} onChange={e => setChickPaid(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-bold" /></div>
                    <div><label className="block text-stone-300 font-bold mb-1">حساب الدفع</label><select value={chickAccountId} onChange={e => setChickAccountId(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                  </div>
                  <input type="text" placeholder="ملاحظات أو رقم الشحنة..." value={chickNotes} onChange={e => setChickNotes(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                  <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-stone-950 font-extrabold rounded-xl shadow-md mt-2">تسجيل شراء الكتاكيت</button>
                </form>
              )}

              {/* 1. Quick Expense Form */}
              {activeAction === 'expense' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">نوع المصروف</label>
                    <select
                      value={expCategory}
                      onChange={e => setExpCategory(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      <option value="electricity">كهرباء وطاقة</option>
                      <option value="fuel">غاز ومحروقات التدفئة</option>
                      <option value="water">ماء وسقي</option>
                      <option value="cleaning_disinfection">فرشة نجارة وتطهير</option>
                      <option value="transport">نقل وتوصيل</option>
                      <option value="maintenance">صيانة وإصلاحات</option>
                      <option value="labor">عمالة مؤقتة ومياومين</option>
                      <option value="rent">إيجار المزرعة</option>
                      <option value="admin">مصاريف إدارية وهاتف</option>
                      <option value="other">مصاريف أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ الإجمالي ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={expAmount}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setExpAmount(val);
                        setExpPaidAmount(val);
                      }}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المزرعة</label>
                      <select
                        value={expFarmId}
                        onChange={e => setExpFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المرتبطة</label>
                      <select
                        value={expCycleId}
                        onChange={e => setExpCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="">بدون دورة (عام للمزرعة)</option>
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المدفوع حالياً</label>
                      <input
                        type="number"
                        value={expPaidAmount}
                        onChange={e => setExpPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الحساب المالي للدفع</label>
                      <select
                        value={expAccountId}
                        onChange={e => setExpAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">بيان / ملاحظات</label>
                    <input
                      type="text"
                      placeholder="تفاصيل المصروف..."
                      value={expDescription}
                      onChange={e => setExpDescription(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md mt-2 transition"
                  >
                    حفظ المصروف
                  </button>
                </form>
              )}

              {/* 2. Quick Wholesale Sale Form */}
              {activeAction === 'sale' && (
                <form onSubmit={handleSaleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الزبون / المشتري *</label>
                    <select
                      required
                      value={saleCustomerId}
                      onChange={e => setSaleCustomerId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'customer' || p.type === 'both').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مزرعة المصدر / المخزن *</label>
                      <select
                        value={saleFarmId}
                        onChange={e => {
                          const val = e.target.value;
                          setSaleFarmId(val);
                          if (val === 'central') {
                            setSaleCycleId('central_stock');
                          } else {
                            const farmCycles = cycles.filter(c => c.farmId === val);
                            setSaleCycleId(farmCycles[0]?.id || cycles[0]?.id || 'farm_batch');
                          }
                        }}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                      >
                        <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                        {farms.map(f => <option key={f.id} value={f.id}>📍 {f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">
                        {saleFarmId === 'central' ? 'الدفعة / قسم التخزين' : 'الدورة المباعة'}
                      </label>
                      <select
                        value={saleCycleId}
                        onChange={e => setSaleCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-amber-300"
                      >
                        {saleFarmId === 'central' && (
                          <option value="central_stock">📦 مخزون التجميع والوزن بالمخزن العام</option>
                        )}
                        {cycles
                          .filter(c => saleFarmId === 'central' || c.farmId === saleFarmId)
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.cycleNumber} ({farms.find(f => f.id === c.farmId)?.name || 'مزرعة'})
                            </option>
                          ))}
                        {saleFarmId !== 'central' && cycles.filter(c => c.farmId === saleFarmId).length === 0 && (
                          <option value="farm_batch">دفعة مباشرة بدون دورة مقيدة</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">عدد الدجاج (تقديري)</label>
                      <input
                        type="number"
                        required
                        placeholder="2500"
                        value={saleCount}
                        onChange={e => setSaleCount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                      <p className="text-[10px] text-stone-500 mt-1">يُحسب تلقائيًا من الوزن ÷ {saleAverageWeight.toFixed(2)} كغ متوسط الطائر</p>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الوزن الإجمالي (كغ)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="5400"
                        value={saleTotalWeight}
                        onChange={e => setSaleTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر الكيلو ({currency})</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={salePricePerKg}
                        onChange={e => setSalePricePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-400"
                      />
                      {suggestedSalePrice > 0 && (
                        <p className="text-[10px] text-emerald-300 mt-1">
                          المقترح لهذه الدورة: {suggestedSalePrice.toFixed(2)} {currency}/كغ — التعادل: {selectedSaleSummary?.costPerKg.toFixed(2)} {currency}
                        </p>
                      )}
                    </div>
                  </div>

                  {saleTotalWeight && salePricePerKg && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <span className="text-stone-300 font-bold">إجمالي الفاتورة:</span>
                      <span className="text-base font-extrabold text-amber-300">
                        {(Number(saleTotalWeight) * Number(salePricePerKg)).toLocaleString()} {currency}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ المقبوض حالياً</label>
                      <input
                        type="number"
                        placeholder="المبلغ المدفوع..."
                        value={salePaid}
                        onChange={e => setSalePaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">إيداع في حساب</label>
                      <select
                        value={saleAccountId}
                        onChange={e => setSaleAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">رقم الشاحنة (اختياري)</label>
                      <input
                        type="text"
                        placeholder="مثال: 12-أ-9988"
                        value={saleTruckPlate}
                        onChange={e => setSaleTruckPlate(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 placeholder-stone-500"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">اسم السائق (اختياري)</label>
                      <input
                        type="text"
                        placeholder="اسم السائق..."
                        value={saleDriverName}
                        onChange={e => setSaleDriverName(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 placeholder-stone-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md mt-2 transition"
                  >
                    تسجيل البيعة وتحديث الذمم
                  </button>
                </form>
              )}

              {/* 3. Feed Purchase Form */}
              {activeAction === 'feed' && (
                <form onSubmit={handleFeedSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">شركة الأعلاف / المورد</label>
                    <select
                      value={feedSupplierId}
                      onChange={e => setFeedSupplierId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مكان التخزين (المستودع) *</label>
                      <select
                        required
                        value={feedFarmId}
                        onChange={e => setFeedFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="">اختر مكان التخزين</option>
                        <option value="central">🏢 المخزن العام</option>
                        {farms.filter(farm => isFarmAllowed(farm.id)).map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">نوع العلف</label>
                      <select
                        value={feedType}
                        onChange={e => setFeedType(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="starter">بادي (Starter 21%)</option>
                        <option value="grower">نامي (Grower 19%)</option>
                        <option value="finisher">ناهي (Finisher 17%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الكمية الإجمالية (كغ)</label>
                      <input
                        type="number"
                        required
                        value={feedQuantityKg}
                        onChange={e => setFeedQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر الكيلو ({currency})</label>
                      <input
                        type="number"
                        step="0.05"
                        required
                        value={feedPricePerKg}
                        onChange={e => setFeedPricePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-400"
                      />
                    </div>
                  </div>

                  {feedQuantityKg && feedPricePerKg && (
                    <div className="p-2.5 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-between">
                      <span className="text-stone-300">الإجمالي:</span>
                      <span className="font-extrabold text-amber-400">
                        {(Number(feedQuantityKg) * Number(feedPricePerKg)).toLocaleString()} {currency}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المدفوع فوراً</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={feedPaid}
                        onChange={e => setFeedPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">طريقة الدفع</label>
                      <select
                        value={feedAccountId}
                        onChange={e => setFeedAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-400/80">
                    💡 المبلغ المتبقي يسجل تلقائياً كدين للمورد ويظهر في الذمم المالية.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ فاتورة العلف وتحديث المخزون
                  </button>
                </form>
              )}

              {/* 4. Customer Collection Form */}
              {['collect', 'chick_customer_collect', 'feed_customer_collect', 'poultry_collect'].includes(activeAction) && (
                <form onSubmit={handleCollectSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">اختر الزبون</label>
                    <select
                      value={collectCustomerId}
                      onChange={e => setCollectCustomerId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'customer' || p.type === 'both').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ المحصل ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={collectAmount}
                      onChange={e => setCollectAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">إيداع في الصندوق / الحساب</label>
                    <select
                      value={collectAccountId}
                      onChange={e => setCollectAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">بيان / رقم الشيك / ملاحظات</label>
                    <input
                      type="text"
                      placeholder="دفعة شيك أو نقداً..."
                      value={collectNotes}
                      onChange={e => setCollectNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد التحصيل وتخفيض دين الزبون
                  </button>
                </form>
              )}

              {/* 5. Supplier Payment Form */}
              {['supplier_pay', 'chick_supplier_pay', 'feed_supplier_pay', 'farm_supplier_pay'].includes(activeAction) && (
                <form onSubmit={handlePaySupplierSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">اختر المورد / الشركة</label>
                    <select
                      value={paySupplierId}
                      onChange={e => setPaySupplierId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ المسدد للمورد ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">السحب من حساب</label>
                    <select
                      value={payAccountId}
                      onChange={e => setPayAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">بيان / رقم الحوالة</label>
                    <input
                      type="text"
                      placeholder="رقم الشيك أو الحوالة البنكية..."
                      value={payNotes}
                      onChange={e => setPayNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد السداد وتخفيض الدين
                  </button>
                </form>
              )}

              {/* 6. Worker Payment */}
              {activeAction === 'worker_pay' && (
                <form onSubmit={handleWorkerSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">العامل</label>
                    <select
                      value={wrkId}
                      onChange={e => setWrkId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.jobTitle})</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">نوع الحركة</label>
                      <select
                        value={wrkType}
                        onChange={e => setWrkType(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="salary">أجرة / راتب شهري</option>
                        <option value="advance_loan">سلفة (تسبيق)</option>
                        <option value="bonus">مكافأة نجاح الدورة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ ({currency})</label>
                      <input
                        type="number"
                        required
                        value={wrkAmount}
                        onChange={e => setWrkAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الدورة المرتبطة *</label>
                    <select
                      required
                      value={wrkCycleId}
                      onChange={e => setWrkCycleId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-amber-300"
                    >
                      <option value="">اختر الدورة</option>
                      {workerCycles.map(cycle => <option key={cycle.id} value={cycle.id}>{cycle.cycleNumber} — {cycle.startDate}</option>)}
                    </select>
                    <p className="text-[10px] text-stone-500 mt-1">ستظهر الأجرة أو السلفة ضمن تكاليف الدورة وتقاريرها.</p>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الصندوق / الحساب المالي</label>
                    <select
                      value={wrkAccountId}
                      onChange={e => setWrkAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تسجيل الدفع للعامل
                  </button>
                </form>
              )}

              {/* 7. Mortality Daily Log */}
              {activeAction === 'mortality' && (() => {
                const selectedMortCycle = cycles.find(c => c.id === mortCycleId);
                const selectedMortFarm = farms.find(f => f.id === selectedMortCycle?.farmId);
                const mortFarmStockKg = getFarmFeedStockKg(selectedMortCycle?.farmId || '');
                const mortRemainingAfterLog = Math.max(0, mortFarmStockKg - Number(mortFeedKg || 0));
                const isMortFeedOverStock = Number(mortFeedKg || 0) > mortFarmStockKg;

                return (
                  <form onSubmit={handleMortalitySubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة الحالية</label>
                      <select
                        value={mortCycleId}
                        onChange={e => setMortCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-semibold text-amber-300"
                      >
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber} ({farms.find(f => f.id === c.farmId)?.name || 'مزرعة'})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div>
                        <label className="block text-stone-300 font-bold mb-1">تاريخ العملية *</label>
                        <input type="date" required min={cycles.find(c => c.id === mortCycleId)?.startDate} value={mortDate} onChange={e => setMortDate(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-amber-200 font-bold">
                        رقم اليوم المحسوب: {mortalityDayNumber > 0 ? `اليوم ${mortalityDayNumber}` : 'تاريخ قبل بداية الدورة'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold mb-1">عدد الطيور النافقة اليوم *</label>
                      <input
                        type="number"
                        required
                        placeholder="0"
                        value={mortCount}
                        onChange={e => setMortCount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-rose-400"
                      />
                    </div>

                    {/* Unified Farm Feed Deduction Box */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-200 flex items-center gap-1.5">
                          <Wheat className="w-4 h-4 text-amber-400" />
                          <span>صرف العلف من رصيد المزرعة ({selectedMortFarm?.name || 'المزرعة'})</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-amber-500/40 font-black text-amber-300 text-[11px]">
                          المتاح بالمزرعة: {mortFarmStockKg.toLocaleString()} كغ ({Math.floor(mortFarmStockKg / 50)} كيس)
                        </span>
                      </div>

                      <div>
                        <label className="block text-stone-300 font-bold mb-1">استهلاك العلف اليوم في الدورة (كغ)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            placeholder="أدخل كمية العلف المستهلكة بالكغ"
                            value={mortFeedKg}
                            onChange={e => setMortFeedKg(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-300 focus:border-amber-500 text-sm"
                          />
                          <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-xs pointer-events-none">
                            كغ ({Number(mortFeedKg || 0) > 0 ? `${(Number(mortFeedKg) / 50).toFixed(1)} كيس` : '0 كيس'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800/80">
                        <span className="text-stone-400">الرصيد المتبقي في المزرعة بعد الصرف:</span>
                        <span className={`font-black ${isMortFeedOverStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {mortRemainingAfterLog.toLocaleString()} كغ ({Math.floor(mortRemainingAfterLog / 50)} كيس 50كغ)
                        </span>
                      </div>

                      {isMortFeedOverStock && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>تنبيه: الكمية المستهلكة ({mortFeedKg} كغ) تتجاوز الرصيد المتوفر في المزرعة ({mortFarmStockKg} كغ).</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                      <div className="sm:col-span-2">
                        <label className="block text-stone-300 font-bold mb-1">الدواء / اللقاح من مخزون المزرعة</label>
                        <select value={mortMedicationPurchaseId} onChange={e => { setMortMedicationPurchaseId(e.target.value); setMortMedicationName(''); }} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                          <option value="">بدون دواء / لقاح</option>
                          {mortMedicationStock.map(item => <option key={item.purchase.id} value={item.purchase.id}>{item.purchase.medicationName} — متاح {item.available} {item.purchase.unit || 'وحدة'}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-stone-300 font-bold mb-1">الكمية والوحدة</label>
                        <div className="flex gap-1">
                          <input type="number" min="0.01" max={selectedMortMedication?.available} placeholder="0" value={mortMedicationQuantity} onChange={e => setMortMedicationQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full min-w-0 bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                          <select value={selectedMortMedication?.purchase.unit || mortMedicationUnit} onChange={e => setMortMedicationUnit(e.target.value)} disabled={!!selectedMortMedication} className="w-20 bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100">
                            <option>جرعة</option><option>مل</option><option>لتر</option><option>غ</option><option>كغ</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold mb-1">ملاحظات بيطرية أو حرارة</label>
                      <input
                        type="text"
                        placeholder="حالة الفرشة، التهوية، الحرارة..."
                        value={mortNotes}
                        onChange={e => setMortNotes(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-extrabold rounded-xl shadow-md transition"
                    >
                      حفظ السجل اليومي
                    </button>
                  </form>
                );
              })()}

              {/* 8. Weight Sample Log */}
              {activeAction === 'weight' && (
                <form onSubmit={handleWeightSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الدورة</label>
                    <select
                      value={weightCycleId}
                      onChange={e => setWeightCycleId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleNumber}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">تاريخ العملية *</label>
                      <input type="date" required min={cycles.find(c => c.id === weightCycleId)?.startDate} value={weightDate} onChange={e => setWeightDate(e.target.value)} className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" />
                    </div>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2 text-blue-200 font-bold">
                      رقم اليوم المحسوب: {weightDayNumber > 0 ? `اليوم ${weightDayNumber}` : 'تاريخ قبل بداية الدورة'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">متوسط وزن الطائر في العينة (بالغرام) *</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 1450 غرام"
                      value={sampleAvgGrams}
                      onChange={e => setSampleAvgGrams(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">ملاحظات العينة</label>
                    <input
                      type="text"
                      placeholder="عينة 50 طائر من وسط العنبر..."
                      value={weightNotes}
                      onChange={e => setWeightNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تسجيل الوزن وتحديث منحنى النمو
                  </button>
                </form>
              )}

              {/* 9. Account Transfer */}
              {activeAction === 'transfer' && (
                <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">من حساب (المصدر)</label>
                      <select
                        value={xferFromId}
                        onChange={e => setXferFromId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">إلى حساب (المستلم)</label>
                      <select
                        value={xferToId}
                        onChange={e => setXferToId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المبلغ المحول ({currency}) *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={xferAmount}
                      onChange={e => setXferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-base font-bold text-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">السبب / ملاحظات</label>
                    <input
                      type="text"
                      placeholder="تغذية الصندوق، تحويل بنكي..."
                      value={xferNotes}
                      onChange={e => setXferNotes(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد التحويل المالي
                  </button>
                </form>
              )}

              {/* 10. Medication Purchase Form */}
              {activeAction === 'med' && (
                <form onSubmit={handleMedSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">المورد البيطري</label>
                    <select
                      value={medSupplierId}
                      onChange={e => setMedSupplierId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">اسم الدواء / اللقاح *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: لقاح نيوكاسل، فيتامين C، مضاد كوكسيديا..."
                      value={medName}
                      onChange={e => setMedName(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مكان التخزين (المستودع/الصيدلية) *</label>
                      <select
                        required
                        value={medFarmId}
                        onChange={e => setMedFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="">اختر مكان التخزين</option>
                        <option value="central">🏢 المخزن العام</option>
                        {farms.filter(farm => isFarmAllowed(farm.id)).map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">نوع المستحضر</label>
                      <select
                        value={medCategory}
                        onChange={e => setMedCategory(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="vaccine">لقاح وتحصين</option>
                        <option value="antibiotic">مضاد حيوي</option>
                        <option value="vitamin">فيتامينات ومكملات</option>
                        <option value="disinfectant">مطهر ومعقم</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الكمية والوحدة في المخزون *</label>
                      <div className="flex gap-1"><input type="number" min="0.01" step="0.01" required value={medQuantity} onChange={e => setMedQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full min-w-0 bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100" /><select value={medUnit} onChange={e => setMedUnit(e.target.value)} className="w-20 bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"><option>حصة</option><option>لتر</option><option>مل</option><option>كغ</option><option>غ</option><option>قرص</option><option>جرعة</option></select></div>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ الإجمالي ({currency})</label>
                      <input
                        type="number"
                        required
                        value={medAmount}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setMedAmount(val);
                          setMedPaid(val);
                        }}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المدفوع حالياً</label>
                      <input
                        type="number"
                        value={medPaid}
                        onChange={e => setMedPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الحساب المالي</label>
                    <select
                      value={medAccountId}
                      onChange={e => setMedAccountId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ فاتورة الأدوية
                  </button>
                </form>
              )}

              {/* 11. Chick Sale Subform */}
              {activeAction === 'chick_sale' && (
                <form onSubmit={handleChickSaleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الزبون / المشتري *</label>
                    <select
                      required
                      value={csCustomerId}
                      onChange={e => setCsCustomerId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      <option value="">اختر الزبون</option>
                      {partners.filter(p => p.type === 'customer' || p.type === 'both').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مزرعة المصدر / المخزن</label>
                      <select
                        value={csFarmId}
                        onChange={e => setCsFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="central">🏢 المخزن العام (المستودع المركزي)</option>
                        {farms.map(f => <option key={f.id} value={f.id}>📍 {f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">السلالة</label>
                      <select
                        value={csBreed}
                        onChange={e => setCsBreed(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {CHICK_BREEDS.map(breed => <option key={breed} value={breed}>{breed}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">العدد الصافي *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={csQuantity}
                        onChange={e => setCsQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">بونص (مجاني)</label>
                      <input
                        type="number"
                        min="0"
                        value={csBonus}
                        onChange={e => setCsBonus(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر البيع ({currency}) *</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.05"
                        required
                        value={csUnitPrice}
                        onChange={e => setCsUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-bold"
                      />
                    </div>
                  </div>

                  {csQuantity && csUnitPrice && (
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-1">
                      <div className="flex justify-between text-stone-300">
                        <span>إجمالي الفاتورة:</span>
                        <b className="text-orange-300 font-black">
                          {(Number(csQuantity) * Number(csUnitPrice)).toLocaleString()} {currency}
                        </b>
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>العدد المسلّم للزبون مع البونص:</span>
                        <span>{(Number(csQuantity) + Number(csBonus || 0)).toLocaleString()} كتكوت</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ المقبوض حالياً</label>
                      <input
                        type="number"
                        min="0"
                        value={csPaid}
                        placeholder={csQuantity && csUnitPrice ? String(Number(csQuantity) * Number(csUnitPrice)) : '0'}
                        onChange={e => setCsPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">طريقة القبض</label>
                      <select
                        value={csPaidMethod}
                        onChange={e => setCsPaidMethod(e.target.value as PaymentMethod)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="cash">نقداً (كاش)</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                        <option value="check">شيك</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الإيداع في حساب</label>
                      <select
                        value={csAccountId}
                        onChange={e => setCsAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">رقم الشاحنة / السائق</label>
                      <input
                        type="text"
                        placeholder="أ / 12345..."
                        value={csTruck}
                        onChange={e => setCsTruck(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ فاتورة بيع الكتاكيت والقبض
                  </button>
                </form>
              )}

              {/* 12. Chick Housing Subform */}
              {activeAction === 'chick_housing' && (
                <form onSubmit={handleChickHousingSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المزرعة المستلمة *</label>
                      <select
                        required
                        value={chFarmId}
                        onChange={e => {
                          setChFarmId(e.target.value);
                          const activeC = cycles.find(c => c.farmId === e.target.value && c.status !== 'completed');
                          if (activeC) setChCycleId(activeC.id);
                        }}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المستهدفة</label>
                      <select
                        value={chCycleId}
                        onChange={e => setChCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-300"
                      >
                        <option value="">دورة جديدة / بدون</option>
                        {cycles.filter(c => c.farmId === chFarmId).map(c => (
                          <option key={c.id} value={c.id}>{c.cycleNumber} ({c.status})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المفرخة / المصدر</label>
                      <select
                        value={chSupplierId}
                        onChange={e => setChSupplierId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {partners.filter(p => p.type === 'supplier' || p.type === 'both').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">السلالة</label>
                      <select
                        value={chBreed}
                        onChange={e => setChBreed(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {CHICK_BREEDS.map(breed => <option key={breed} value={breed}>{breed}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">عدد الكتاكيت المسكنة *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={chCount}
                        onChange={e => setChCount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-amber-400 font-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">تكلفة الكتكوت التقديرية ({currency})</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={chUnitPrice}
                        onChange={e => setChUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      />
                    </div>
                  </div>

                  {chCount && chUnitPrice && (
                    <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-700/60 flex justify-between items-center text-xs">
                      <span className="text-stone-400">إجمالي قيمة التسكين التأسيسية:</span>
                      <b className="text-amber-300 font-mono">
                        {(Number(chCount) * Number(chUnitPrice)).toLocaleString()} {currency}
                      </b>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="رقم العنبر، الملاحظات، ظروف الاستلام..."
                    value={chNotes}
                    onChange={e => setChNotes(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد تسكين الكتاكيت بالعنبر
                  </button>
                </form>
              )}

              {/* 13. Feed Sale Subform */}
              {activeAction === 'feed_sale' && (
                <form onSubmit={handleFeedSaleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">الزبون / المشتري *</label>
                    <select
                      required
                      value={fsCustomerId}
                      onChange={e => setCsCustomerId(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                    >
                      <option value="">اختر الزبون</option>
                      {partners.filter(p => p.type === 'customer' || p.type === 'both').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مرحلة العلف</label>
                      <select
                        value={fsFeedType}
                        onChange={e => setFsFeedType(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="starter">بادي (Démarrage)</option>
                        <option value="grower">نامي (Croissance)</option>
                        <option value="finisher">ناهي (Finition)</option>
                        <option value="other">علف آخر / مركز</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">مزرعة المصدر / المستودع</label>
                      <select
                        value={fsFarmId}
                        onChange={e => setFsFarmId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="central">🏢 المخزن العام (المستودع المركزي للأعلاف)</option>
                        {farms.map(f => <option key={f.id} value={f.id}>📍 {f.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الكمية المباعة (كغ) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={fsQuantityKg}
                        onChange={e => setFsQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold"
                      />
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        ≈ {fsQuantityKg ? Math.round(Number(fsQuantityKg) / 50) : 0} كيس (50كغ)
                      </span>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">سعر الكيلوغرام ({currency}) *</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.05"
                        required
                        value={fsUnitPriceKg}
                        onChange={e => setFsUnitPriceKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-bold"
                      />
                    </div>
                  </div>

                  {fsQuantityKg && fsUnitPriceKg && (
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex justify-between items-center">
                      <span className="text-stone-300">إجمالي فاتورة العلف:</span>
                      <b className="text-yellow-400 font-black text-sm">
                        {(Number(fsQuantityKg) * Number(fsUnitPriceKg)).toLocaleString()} {currency}
                      </b>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المبلغ المقبوض</label>
                      <input
                        type="number"
                        min="0"
                        value={fsPaid}
                        placeholder={fsQuantityKg && fsUnitPriceKg ? String(Number(fsQuantityKg) * Number(fsUnitPriceKg)) : '0'}
                        onChange={e => setFsPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-emerald-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">حساب الإيداع</label>
                      <select
                        value={fsAccountId}
                        onChange={e => setFsAccountId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="رقم الشاحنة أو ملاحظات البيع..."
                    value={fsNotes}
                    onChange={e => setFsNotes(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-extrabold rounded-xl shadow-md transition"
                  >
                    حفظ بيع العلف وتحديث المخزون والمالية
                  </button>
                </form>
              )}

              {/* 14. Feed Issue Subform */}
              {activeAction === 'feed_issue' && (
                <form onSubmit={handleFeedIssueSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">المزرعة المستلمة *</label>
                      <select
                        required
                        value={fiFarmId}
                        onChange={e => {
                          setFiFarmId(e.target.value);
                          const activeC = cycles.find(c => c.farmId === e.target.value && c.status !== 'completed');
                          if (activeC) setFiCycleId(activeC.id);
                        }}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الدورة المستهدفة</label>
                      <select
                        value={fiCycleId}
                        onChange={e => setFiCycleId(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100 font-bold text-amber-300"
                      >
                        <option value="">مخزن المزرعة العام</option>
                        {cycles.filter(c => c.farmId === fiFarmId).map(c => (
                          <option key={c.id} value={c.id}>{c.cycleNumber}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">نوع العلف المصروف</label>
                      <select
                        value={fiFeedType}
                        onChange={e => setFiFeedType(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                      >
                        <option value="starter">بادي (Démarrage)</option>
                        <option value="grower">نامي (Croissance)</option>
                        <option value="finisher">ناهي (Finition)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">الكمية المصروفة (كغ) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={fiQuantityKg}
                        onChange={e => setFiQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-yellow-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-[11px] text-stone-400 flex justify-between items-center">
                    <span>مخزون المزرعة الحالي:</span>
                    <b className="text-stone-200 font-mono">
                      {getFarmFeedStockKg(fiFarmId).toLocaleString()} كغ
                    </b>
                  </div>

                  <input
                    type="text"
                    placeholder="رقم العنبر أو ملاحظات الصرف..."
                    value={fiNotes}
                    onChange={e => setFiNotes(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-extrabold rounded-xl shadow-md transition"
                  >
                    تأكيد صرف العلف للمزرعة
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
