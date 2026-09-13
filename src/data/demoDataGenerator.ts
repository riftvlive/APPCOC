import {
  Farm,
  PoultryCycle,
  ChickPurchase,
  FeedPurchase,
  MedicationPurchase,
  Expense,
  WholesaleSale,
  Partner,
  Worker,
  WorkerTransaction,
  CashAccount,
  FinancialTransaction,
  DailyLog,
  AuditLogEntry,
  AppNotification,
  User,
  FeedStockMovement,
  MedicationStockMovement
} from '../types';

export interface ComprehensiveAppData {
  users: User[];
  farms: Farm[];
  cycles: PoultryCycle[];
  dailyLogs: DailyLog[];
  partners: Partner[];
  accounts: CashAccount[];
  workers: Worker[];
  workerTransactions: WorkerTransaction[];
  chickPurchases: ChickPurchase[];
  feedPurchases: FeedPurchase[];
  feedMovements: FeedStockMovement[];
  medicationPurchases: MedicationPurchase[];
  medicationMovements: MedicationStockMovement[];
  expenses: Expense[];
  sales: WholesaleSale[];
  feedSales: any[];
  chickSales: any[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
  auditLogs: AuditLogEntry[];
  autoBackupSettings: any;
  backupSnapshots: any[];
}

export function generateComprehensiveData(): ComprehensiveAppData {
  const users: User[] = [
    { id: 'usr-1', name: 'المدير العام', phone: '0610187970', pin: '7970', role: 'admin', status: 'active' },
    { id: 'usr-2', name: 'رشيد العمراني (مدير مزرعة 1)', phone: '0662233445', pin: '1234', role: 'farm_manager', allowedFarmIds: ['farm-1'], status: 'active' },
    { id: 'usr-3', name: 'ياسين بنسالم (المحاسب)', phone: '0663344556', pin: '1234', role: 'accountant', status: 'active' },
    { id: 'usr-4', name: 'حمزة التازي (مشرف عنبر)', phone: '0664455667', pin: '1234', role: 'worker', allowedFarmIds: ['farm-1', 'farm-2'], allowedHangarIds: ['farm-1:barn-1', 'farm-1:barn-2', 'farm-2:barn-1'], status: 'active' }
  ];

  const farms: Farm[] = [
    {
      id: 'farm-1',
      name: 'مزرعة النور (سيدي علال البحراوي)',
      location: 'إقليم الخميسات - طريق سيدي علال البحراوي',
      areaSquareMeters: 8500,
      surfaceM2: 2200,
      barnsCount: 3,
      hangarsCount: 3,
      capacity: 45000,
      managerId: 'usr-2',
      managerName: 'رشيد العمراني',
      managerPhone: '0662233445',
      waterSource: 'بئر ارتوازي + خزان رئيسي',
      generatorBackup: true,
      status: 'active',
      notes: 'مزرعة رئيسية مجهزة بنظام تهوية أوتوماتيكي ومولد كهربائي احتياطي.',
      createdAt: '2025-01-10',
      hangars: [
        { id: 'h-1-1', name: 'عنبر 1 (أوتوماتيكي)', capacity: 15000, surfaceM2: 1000, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true },
        { id: 'h-1-2', name: 'عنبر 2 (أوتوماتيكي)', capacity: 15000, surfaceM2: 1000, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true },
        { id: 'h-1-3', name: 'عنبر 3 (أوتوماتيكي)', capacity: 15000, surfaceM2: 1000, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true }
      ]
    },
    {
      id: 'farm-2',
      name: 'مزرعة البركة (عين عودة)',
      location: 'عمالة الصخيرات تمارة - جماعة عين عودة',
      areaSquareMeters: 6200,
      surfaceM2: 1600,
      barnsCount: 2,
      hangarsCount: 2,
      capacity: 30000,
      managerId: 'usr-4',
      managerName: 'كمال الصنهاجي',
      managerPhone: '0665566778',
      waterSource: 'شبكة الماء الصالح للشرب + صهريج',
      generatorBackup: true,
      status: 'active',
      notes: 'عنابر أرضية مغلقة بنظام تبريد بالخلايا ومشارب نيبل حديثة.',
      createdAt: '2025-02-15',
      hangars: [
        { id: 'h-2-1', name: 'عنبر 1 (مغلق)', capacity: 15000, surfaceM2: 800, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true },
        { id: 'h-2-2', name: 'عنبر 2 (مغلق)', capacity: 15000, surfaceM2: 800, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true }
      ]
    },
    {
      id: 'farm-3',
      name: 'مزرعة الأمل (بنسليمان)',
      location: 'ضواحي بنسليمان - سيدي يحيى زعير',
      areaSquareMeters: 5000,
      surfaceM2: 1400,
      barnsCount: 2,
      hangarsCount: 2,
      capacity: 25000,
      managerName: 'عبد الرحيم العلمي',
      managerPhone: '0667788990',
      waterSource: 'بئر محلي مصفى',
      generatorBackup: true,
      status: 'active',
      notes: 'حظائر مخصصة لدورات التسمين السريع ومعزولة حرارياً بالبوليوريثان.',
      createdAt: '2025-05-20',
      hangars: [
        { id: 'h-3-1', name: 'عنبر 1 (تسمين سريع)', capacity: 12500, surfaceM2: 700, ventilationType: 'cross', heatingType: 'radiant', coolingPads: true },
        { id: 'h-3-2', name: 'عنبر 2 (تسمين سريع)', capacity: 12500, surfaceM2: 700, ventilationType: 'cross', heatingType: 'radiant', coolingPads: true }
      ]
    },
    {
      id: 'farm-4',
      name: 'مزرعة الريف الذهبي (الروادي - الحسيمة)',
      location: 'الروادي - إقليم الحسيمة',
      areaSquareMeters: 6000,
      surfaceM2: 1500,
      barnsCount: 2,
      hangarsCount: 2,
      capacity: 25000,
      managerId: 'usr-2',
      managerName: 'رشيد العمراني',
      managerPhone: '0662233445',
      waterSource: 'عين مائية طبيعية + خزان معالج',
      generatorBackup: true,
      status: 'active',
      notes: 'موقع جبلي ممتاز بنسمات هواء عليلة ومثالية للتربية الصيفية.',
      createdAt: '2026-08-01',
      hangars: [
        { id: 'h-4-1', name: 'عنبر الشمال', capacity: 12500, surfaceM2: 750, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true },
        { id: 'h-4-2', name: 'عنبر الجنوب', capacity: 12500, surfaceM2: 750, ventilationType: 'tunnel', heatingType: 'gas_canon', coolingPads: true }
      ]
    }
  ];

  const partners: Partner[] = [
    {
      id: 'part-sup-1',
      name: 'شركة أعلاف الغرب المتحدة',
      companyName: 'أعلاف الغرب - القنيطرة',
      phone: '0537334455',
      address: 'المنطقة الصناعية - القنيطرة',
      type: 'supplier',
      activityType: 'أعلاف الدواجن المركبة',
      openingBalance: -289150,
      notes: 'المورد الرئيسي لعلف الدواجن (بادي، نمو، إنهاء).',
      createdAt: '2026-05-01'
    },
    {
      id: 'part-sup-2',
      name: 'مختبرات الأطلس البيطرية',
      companyName: 'Laboratoires Vétérinaires Atlas',
      phone: '0537667788',
      address: 'شارع الحسن الثاني، الرباط',
      type: 'supplier',
      activityType: 'أدوية ولقاحات بيطرية',
      openingBalance: -4800,
      notes: 'توفير برامج اللقاحات والمضادات الحيوية والمكملات الغذائية.',
      createdAt: '2026-05-01'
    },
    {
      id: 'part-sup-3',
      name: 'مفرخات الأطلس الممتازة',
      companyName: 'Couvoirs Atlas Maroc',
      phone: '0522889900',
      address: 'طريق الدار البيضاء - برشيد',
      type: 'supplier',
      activityType: 'تفريخ وكتاكيت يوم واحد',
      openingBalance: -131850,
      notes: 'توفير كتاكيت Cobb 500 و Ross 308 بأعلى حيوية.',
      createdAt: '2026-05-01'
    },
    {
      id: 'part-sup-4',
      name: 'محطة الوفاق للمحروقات وتوزيع الغاز',
      companyName: 'Afriquia / Gaz Wifaq',
      phone: '0537554433',
      address: 'طريق الخميسات - تيفلت',
      type: 'supplier',
      activityType: 'غاز التدفئة والمحروقات',
      openingBalance: 0,
      notes: 'تزويد المزارع بقنينات غاز التدفئة للتحضين والغازوال للمولد.',
      createdAt: '2026-05-01'
    },
    {
      id: 'part-sup-5',
      name: 'مؤسسة النجارة البيضاوية لفرشة الدواجن',
      companyName: 'نجارة الأطلس - عين السبع',
      phone: '0522338899',
      address: 'الدار البيضاء',
      type: 'supplier',
      activityType: 'نشارة خشب بيضاء معقمة',
      openingBalance: 0,
      notes: 'توريد نجارة الخشب الخالية من الغبار والرطوبة.',
      createdAt: '2026-05-01'
    },
    {
      id: 'part-sup-zalar',
      name: 'Zalar Holding - El Alf',
      companyName: 'El Alf / Alf Al Maghrib',
      phone: '0522334455',
      address: 'عين السبع - الدار البيضاء',
      type: 'supplier',
      activityType: 'أعلاف الدواجن المركبة',
      openingBalance: 0,
      notes: 'مجموعة مغربية رائدة في أعلاف الدواجن.',
      createdAt: '2026-08-01'
    },
    {
      id: 'part-sup-alf-sahel',
      name: 'ALF SAHEL',
      companyName: 'Alf Sahel',
      phone: '0522998877',
      address: 'Had Soualem, Maroc',
      type: 'supplier',
      activityType: 'أعلاف مركبة للحيوانات والدواجن',
      openingBalance: 0,
      createdAt: '2026-08-01'
    },
    // Customers
    {
      id: 'part-cust-1',
      name: 'محمد التاجي (تاجر دواجن - الرباط وسلا)',
      companyName: 'مؤسسة التاجي لتوزيع الدواجن',
      phone: '0661223344',
      address: 'سوق الجملة للدواجن - يعقوب المنصور، الرباط',
      type: 'customer',
      activityType: 'توزيع دجاج حي بالجملة',
      openingBalance: 43600,
      notes: 'زبون رئيسي منتظم بشاحنات نقل مخصصة.',
      createdAt: '2026-06-01'
    },
    {
      id: 'part-cust-2',
      name: 'شركة مجازر الأطلس العصرية',
      companyName: "Abattoirs Modernes de l'Atlas",
      phone: '0522776655',
      address: 'عين السبع - الدار البيضاء',
      type: 'customer',
      activityType: 'مجازر دواجن صناعية معتمدة',
      openingBalance: 0,
      notes: 'تسديد فوري عبر تحويلات بنكية مصدقة.',
      createdAt: '2026-06-01'
    },
    {
      id: 'part-cust-3',
      name: 'يوسف بوعزة (موزع دجاج جملة - القنيطرة)',
      companyName: 'محلات بوعزة للدواجن والبيض',
      phone: '0663445566',
      address: 'سوق أولاد وجيه، القنيطرة',
      type: 'customer',
      activityType: 'تاجر نصف جملة وتقسيط',
      openingBalance: 44000,
      notes: 'مشتريات دورية بمعدل 4 إلى 5 أطنان لكل دفعة.',
      createdAt: '2026-06-01'
    },
    {
      id: 'part-cust-4',
      name: 'الحاج عبد الله السوسي (سوق الجملة الدار البيضاء)',
      companyName: 'مؤسسة السوسي لتجارة الطيور الحية',
      phone: '0661778899',
      address: 'سوق الجملة للدواجن - الحي المحمدي، كازا',
      type: 'customer',
      activityType: 'تاجر جملة كبير (كراش)',
      openingBalance: 42000,
      notes: 'شحن شاحنات كبرى (رموك) بأسعار الجملة اليومية.',
      createdAt: '2026-08-01'
    },
    {
      id: 'part-cust-5',
      name: 'عبد الرزاق الفاسي (سوق الجملة فاس ومكناس)',
      companyName: 'موزع دواجن فاس سايس',
      phone: '0661339922',
      address: 'سوق الدواجن بنسودة، فاس',
      type: 'customer',
      activityType: 'توزيع دجاج حي ونصف جملة',
      openingBalance: 25000,
      notes: 'توزيع في أسواق جهة فاس مكناس ومطاعم شواء.',
      createdAt: '2026-08-01'
    }
  ];

  const accounts: CashAccount[] = [
    {
      id: 'acc-caisse-main',
      name: 'الصندوق الرئيسي (Caisse Centrale)',
      type: 'cash',
      openingBalance: 45000,
      isDefault: true
    },
    {
      id: 'acc-bank-attijari',
      name: 'التجاري وفا بنك (Attijariwafa Bank)',
      type: 'bank',
      accountNumber: '007 810 00012345678901 45',
      openingBalance: 165000
    },
    {
      id: 'acc-bank-chaabi',
      name: 'البنك الشعبي (Banque Populaire)',
      type: 'bank',
      accountNumber: '101 780 21211234567890 88',
      openingBalance: 80000
    },
    {
      id: 'acc-caisse-farm1',
      name: 'صندوق مزرعة النور (مصاريف يومية)',
      type: 'cash',
      openingBalance: 12000
    },
    {
      id: 'acc-caisse-farm2',
      name: 'صندوق مزرعة البركة',
      type: 'cash',
      openingBalance: 8500
    }
  ];

  const workers: Worker[] = [
    {
      id: 'wrk-1',
      name: 'عزيز المنصوري',
      phone: '0664112233',
      nationalId: 'AA123456',
      jobTitle: 'مشرف عنابر وتغذية',
      farmId: 'farm-1',
      startDate: '2025-01-15',
      monthlySalary: 4200,
      paymentFrequency: 'monthly',
      status: 'active',
      notes: 'خبرة 7 سنوات في إدارة تهوية وحرارة الكتاكيت.'
    },
    {
      id: 'wrk-2',
      name: 'لحسن آيت علي',
      phone: '0665223344',
      nationalId: 'BB654321',
      jobTitle: 'عامل نظافة وتوزيع العلف',
      farmId: 'farm-1',
      startDate: '2025-02-01',
      monthlySalary: 3400,
      paymentFrequency: 'monthly',
      status: 'active'
    },
    {
      id: 'wrk-3',
      name: 'سعيد الحيمر',
      phone: '0666334455',
      nationalId: 'CC789123',
      jobTitle: 'حارس ومسؤول صيانة',
      farmId: 'farm-2',
      startDate: '2025-03-01',
      monthlySalary: 3200,
      paymentFrequency: 'monthly',
      status: 'active'
    },
    {
      id: 'wrk-4',
      name: 'إبراهيم الداودي',
      phone: '0667445566',
      nationalId: 'DD987654',
      jobTitle: 'عامل رعاية وتطهير',
      farmId: 'farm-3',
      startDate: '2025-06-01',
      monthlySalary: 3300,
      paymentFrequency: 'monthly',
      status: 'active'
    },
    {
      id: 'wrk-5',
      name: 'طارق الريفي',
      phone: '0668556677',
      nationalId: 'EE334455',
      jobTitle: 'مشرف عنابر الروادي',
      farmId: 'farm-4',
      startDate: '2026-08-01',
      monthlySalary: 4000,
      paymentFrequency: 'monthly',
      status: 'active'
    }
  ];

  const workerTransactions: WorkerTransaction[] = [
    {
      id: 'wtx-1',
      workerId: 'wrk-1',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      date: '2026-05-30',
      type: 'salary',
      amount: 4200,
      accountId: 'acc-caisse-farm1',
      description: 'أجرة شهر ماي 2026'
    },
    {
      id: 'wtx-2',
      workerId: 'wrk-1',
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      date: '2026-08-15',
      type: 'advance_loan',
      amount: 1000,
      accountId: 'acc-caisse-main',
      description: 'سلفة على راتب شهر غشت لعلاج عائلي'
    },
    {
      id: 'wtx-3',
      workerId: 'wrk-2',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      date: '2026-06-15',
      type: 'bonus',
      amount: 600,
      accountId: 'acc-caisse-main',
      description: 'مكافأة تميز في نجاح دورة 2026-01 وقلة نسبة النفوق'
    },
    {
      id: 'wtx-4',
      workerId: 'wrk-3',
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      date: '2026-07-31',
      type: 'salary',
      amount: 3200,
      accountId: 'acc-caisse-farm2',
      description: 'راتب شهر يوليوز 2026'
    }
  ];

  const cycles: PoultryCycle[] = [
    {
      id: 'cycle-1',
      cycleNumber: 'دورة 2026-01 (مكتملة)',
      farmId: 'farm-1',
      barnNumber: 'عنبر 1 + عنبر 2',
      startDate: '2026-05-01',
      chickEntryDate: '2026-05-01',
      expectedSaleDate: '2026-06-12',
      actualSaleDate: '2026-06-14',
      chickBreed: 'Cobb 500',
      initialChickCount: 20000,
      chickUnitPrice: 5.5,
      chickSource: 'مفرخات الأطلس الممتازة',
      hatcherySupplierId: 'part-sup-3',
      status: 'completed',
      targetWeightKg: 2.2,
      notes: 'دورة ممتازة بمعدل تحويل غذائي 1.58 ونسبة نفوق منخفضة 3.8%. تم تسويقها بالكامل.',
      createdAt: '2026-05-01'
    },
    {
      id: 'cycle-2',
      cycleNumber: 'دورة 2026-02 (جاهزة للتسويق والبيع)',
      farmId: 'farm-2',
      barnNumber: 'عنبر 1',
      startDate: '2026-07-15',
      chickEntryDate: '2026-07-15',
      expectedSaleDate: '2026-08-30',
      chickBreed: 'Ross 308',
      initialChickCount: 18000,
      chickUnitPrice: 5.8,
      chickSource: 'مفرخات الأطلس الممتازة',
      hatcherySupplierId: 'part-sup-3',
      status: 'ready_for_sale',
      targetWeightKg: 2.3,
      notes: 'الدجاج بلغ متوسط وزن 2.38 كغ وهو جاهز للتسويق الآن بأسعار ممتازة.',
      createdAt: '2026-07-15'
    },
    {
      id: 'cycle-3',
      cycleNumber: 'دورة 2026-03 (قيد التسمين - يوم 24)',
      farmId: 'farm-1',
      barnNumber: 'عنبر 1 + 2 + 3',
      startDate: '2026-08-06',
      chickEntryDate: '2026-08-06',
      expectedSaleDate: '2026-09-18',
      chickBreed: 'Cobb 500',
      initialChickCount: 25000,
      chickUnitPrice: 5.6,
      chickSource: 'مفرخات الأطلس الممتازة',
      hatcherySupplierId: 'part-sup-3',
      status: 'in_rearing',
      targetWeightKg: 2.25,
      notes: 'الدورة في مرحلة علف النمو (Grower). الاستهلاك والتحويل الغذائي ممتاز.',
      createdAt: '2026-08-06'
    },
    {
      id: 'cycle-4',
      cycleNumber: 'دورة 2026-04 (قيد التحضين - يوم 11)',
      farmId: 'farm-3',
      barnNumber: 'عنبر 1',
      startDate: '2026-08-19',
      chickEntryDate: '2026-08-19',
      expectedSaleDate: '2026-10-01',
      chickBreed: 'Hubbard Classic',
      initialChickCount: 15000,
      chickUnitPrice: 5.4,
      chickSource: 'مفرخات الأطلس الممتازة',
      hatcherySupplierId: 'part-sup-3',
      status: 'in_rearing',
      targetWeightKg: 2.15,
      notes: 'مرحلة التحضين الأولى (Starter) واكتمل لقاح الغامبورو الأول.',
      createdAt: '2026-08-19'
    },
    {
      id: 'cycle-5',
      cycleNumber: 'دورة 2026-05 (استلام حديث - يوم 2)',
      farmId: 'farm-4',
      barnNumber: 'عنبر الشمال',
      startDate: '2026-08-29',
      chickEntryDate: '2026-08-29',
      expectedSaleDate: '2026-10-12',
      chickBreed: 'Ross 308',
      initialChickCount: 12000,
      chickUnitPrice: 5.7,
      chickSource: 'مفرخات الأطلس الممتازة',
      hatcherySupplierId: 'part-sup-3',
      status: 'in_rearing',
      targetWeightKg: 2.2,
      notes: 'استلام حديث ومراقبة حرارة التحضين (33 درجة مئوية).',
      createdAt: '2026-08-29'
    }
  ];

  // Daily Logs generator
  const dailyLogs: DailyLog[] = [];
  function addCycleLogs(cycleId: string, startDateStr: string, daysCount: number, chickCount: number, breedTargetWeightKg: number) {
    const start = new Date(startDateStr);
    for (let day = 1; day <= daysCount; day++) {
      const d = new Date(start);
      d.setDate(d.getDate() + (day - 1));
      const dateStr = d.toISOString().split('T')[0];

      const progressRatio = day / 42;
      const avgWeight = Math.round(42 + (breedTargetWeightKg * 1000 - 42) * Math.pow(progressRatio, 1.45));

      const feedGramsPerBird = Math.min(185, Math.round(14 + 4.1 * day + 0.02 * day * day));
      const feedKg = Math.round((feedGramsPerBird * chickCount) / 1000);
      const waterLiters = Math.round(feedKg * 1.85);

      let mortality = 0;
      if (day <= 3) mortality = Math.floor(Math.random() * 8) + 12;
      else if (day <= 7) mortality = Math.floor(Math.random() * 6) + 8;
      else if (day <= 25) mortality = Math.floor(Math.random() * 6) + 4;
      else mortality = Math.floor(Math.random() * 8) + 5;

      const temp = Math.max(22, +(33.5 - 0.28 * day + (Math.random() * 0.8 - 0.4)).toFixed(1));
      const humidity = Math.round(65 - 0.2 * day + (Math.random() * 6 - 3));

      let notes = '';
      let medName = '';
      if (day === 1) { notes = 'استلام الكتاكيت وتوزيع الماء المحلى بالسكر وفيتامين AD3E'; medName = 'فيتامينات التحضين AD3E'; }
      else if (day === 7) { notes = 'تحصين نيوكاسل + برونشيت في العين'; medName = 'لقاح Hitchner B1 + H120'; }
      else if (day === 14) { notes = 'تحصين الغامبورو في ماء الشرب'; medName = 'لقاح Gumboro 228E'; }
      else if (day === 21) { notes = 'إعطاء مضاد الكوكسيديا وقائي لمدة 3 أيام'; medName = 'أمبروليوم 20%'; }
      else if (day === 28) { notes = 'أخذ عينة وزن 100 طائر وتقييم التجانس'; }
      else if (day === 35) { notes = 'بدء سحب الأدوية والتحضير للبيع والتسويق'; }

      dailyLogs.push({
        id: `log-${cycleId}-${day}`,
        cycleId,
        date: dateStr,
        dayNumber: day,
        mortalityCount: mortality,
        feedConsumedKg: feedKg,
        waterConsumedLiters: waterLiters,
        sampleAverageWeightGrams: avgWeight,
        temperatureCelsius: temp,
        humidityPercent: humidity,
        notes: notes || undefined,
        medicationName: medName || undefined,
        medicationQuantity: medName ? 1 : undefined,
        medicationUnit: medName ? 'جرعة/عنبر' : undefined
      });
    }
  }

  addCycleLogs('cycle-1', '2026-05-01', 42, 20000, 2.22);
  addCycleLogs('cycle-2', '2026-07-15', 39, 18000, 2.38);
  addCycleLogs('cycle-3', '2026-08-06', 24, 25000, 2.25);
  addCycleLogs('cycle-4', '2026-08-19', 11, 15000, 2.15);
  addCycleLogs('cycle-5', '2026-08-29', 2, 12000, 2.20);

  const chickPurchases: ChickPurchase[] = [
    {
      id: 'chk-1',
      invoiceNumber: 'FAC-CHK-2026-001',
      batchNumber: 'LOT-ATL-902',
      date: '2026-05-01',
      supplierId: 'part-sup-3',
      supplierName: 'مفرخات الأطلس الممتازة',
      breed: 'Cobb 500',
      chickType: 'broiler',
      farmId: 'farm-1',
      hangarName: 'عنبر 1 + 2',
      cycleId: 'cycle-1',
      orderedCount: 20000,
      bonusPercent: 2,
      bonusCount: 400,
      transportMortalityCount: 32,
      receivedHealthyCount: 20368,
      unitPrice: 5.5,
      chickCost: 110000,
      transportCost: 2000,
      vaccineCostAtHatchery: 1000,
      totalAmount: 113000,
      paidAmount: 113000,
      remainingAmount: 0,
      paymentMethod: 'bank_transfer',
      accountId: 'acc-bank-attijari',
      truckPlate: '45-A-12345',
      driverName: 'سعيد التازي',
      driverPhone: '0661998877',
      receptionTime: '06:30 ص',
      boxTemperatureCelsius: 31.5,
      averageWeightGrams: 42.5,
      uniformityPercent: 88,
      hatcheryVaccines: ['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)'],
      qualityScore: 'excellent',
      notes: 'شحنة ممتازة، كتاكيت ذات حيوية عالية، تم استلامها صباحاً باكراً بدرجة حرارة معتدلة.',
      createdAt: '2026-05-01'
    },
    {
      id: 'chk-2',
      invoiceNumber: 'FAC-CHK-2026-002',
      batchNumber: 'LOT-MAR-114',
      date: '2026-07-15',
      supplierId: 'part-sup-3',
      supplierName: 'مفرخات الأطلس الممتازة',
      breed: 'Ross 308',
      chickType: 'broiler',
      farmId: 'farm-2',
      hangarName: 'عنبر 1',
      cycleId: 'cycle-2',
      orderedCount: 18000,
      bonusPercent: 2,
      bonusCount: 360,
      transportMortalityCount: 28,
      receivedHealthyCount: 18332,
      unitPrice: 5.8,
      chickCost: 104400,
      transportCost: 1800,
      vaccineCostAtHatchery: 900,
      totalAmount: 107100,
      paidAmount: 70000,
      remainingAmount: 37100,
      paymentMethod: 'partial',
      accountId: 'acc-bank-attijari',
      truckPlate: '33-B-67890',
      driverName: 'عمر المودن',
      driverPhone: '0662334455',
      receptionTime: '07:15 ص',
      boxTemperatureCelsius: 31.0,
      averageWeightGrams: 41.8,
      uniformityPercent: 86,
      hatcheryVaccines: ['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)', 'جمبورو (IBD)'],
      qualityScore: 'excellent',
      notes: 'سلالة روس 308 ممتازة مع تسديد جزئي ومتبقي 37,100 درهم على الحساب.',
      createdAt: '2026-07-15'
    },
    {
      id: 'chk-3',
      invoiceNumber: 'FAC-CHK-2026-003',
      batchNumber: 'LOT-ATL-1380',
      date: '2026-08-06',
      supplierId: 'part-sup-3',
      supplierName: 'مفرخات الأطلس الممتازة',
      breed: 'Cobb 500',
      chickType: 'broiler',
      farmId: 'farm-1',
      hangarName: 'عنابر 1، 2، 3',
      cycleId: 'cycle-3',
      orderedCount: 25000,
      bonusPercent: 2,
      bonusCount: 500,
      transportMortalityCount: 45,
      receivedHealthyCount: 25455,
      unitPrice: 5.6,
      chickCost: 140000,
      transportCost: 2500,
      vaccineCostAtHatchery: 1250,
      totalAmount: 143750,
      paidAmount: 100000,
      remainingAmount: 43750,
      paymentMethod: 'partial',
      accountId: 'acc-bank-chaabi',
      truckPlate: '12-A-99881',
      driverName: 'ياسر المنزهي',
      driverPhone: '0664556677',
      receptionTime: '05:45 ص',
      boxTemperatureCelsius: 32.0,
      averageWeightGrams: 43.0,
      uniformityPercent: 89,
      hatcheryVaccines: ['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)'],
      qualityScore: 'excellent',
      notes: 'استلام دفعة كتاكيت كبيرة لعنابر مزرعة النور بكامل طاقتها.',
      createdAt: '2026-08-06'
    },
    {
      id: 'chk-4',
      invoiceNumber: 'FAC-CHK-2026-004',
      batchNumber: 'LOT-CHW-550',
      date: '2026-08-19',
      supplierId: 'part-sup-3',
      supplierName: 'مفرخات الأطلس الممتازة',
      breed: 'Hubbard Classic',
      chickType: 'broiler',
      farmId: 'farm-3',
      hangarName: 'عنبر 1',
      cycleId: 'cycle-4',
      orderedCount: 15000,
      bonusPercent: 2,
      bonusCount: 300,
      transportMortalityCount: 22,
      receivedHealthyCount: 15278,
      unitPrice: 5.4,
      chickCost: 81000,
      transportCost: 1500,
      vaccineCostAtHatchery: 750,
      totalAmount: 83250,
      paidAmount: 83250,
      remainingAmount: 0,
      paymentMethod: 'bank_transfer',
      accountId: 'acc-bank-attijari',
      truckPlate: '26-D-44332',
      driverName: 'عبد القادر البهجة',
      driverPhone: '0667889900',
      receptionTime: '06:00 ص',
      boxTemperatureCelsius: 31.2,
      averageWeightGrams: 40.5,
      uniformityPercent: 85,
      hatcheryVaccines: ['ماريك (Marek)', 'نيوكاسل (ND)', 'التهاب شعبي (IB)', 'جمبورو (IBD)'],
      qualityScore: 'good',
      notes: 'استلام شحنة مزرعة الأمل بنسليمان - سلالة هابرد تم تحصينها بالكامل.',
      createdAt: '2026-08-19'
    },
    {
      id: 'chk-5',
      invoiceNumber: 'FAC-CHK-2026-005',
      batchNumber: 'LOT-ATL-1410',
      date: '2026-08-29',
      supplierId: 'part-sup-3',
      supplierName: 'مفرخات الأطلس الممتازة',
      breed: 'Ross 308',
      chickType: 'broiler',
      farmId: 'farm-4',
      hangarName: 'عنبر الشمال',
      cycleId: 'cycle-5',
      orderedCount: 12000,
      bonusPercent: 2,
      bonusCount: 240,
      transportMortalityCount: 16,
      receivedHealthyCount: 12224,
      unitPrice: 5.7,
      chickCost: 68400,
      transportCost: 2000,
      vaccineCostAtHatchery: 600,
      totalAmount: 71000,
      paidAmount: 20000,
      remainingAmount: 51000,
      paymentMethod: 'partial',
      accountId: 'acc-caisse-main',
      truckPlate: '50-B-11223',
      driverName: 'هشام السكتاني',
      driverPhone: '0661223399',
      receptionTime: '06:45 ص',
      boxTemperatureCelsius: 31.8,
      averageWeightGrams: 42.0,
      uniformityPercent: 87,
      hatcheryVaccines: ['ماريك (Marek)', 'نيوكاسل (ND)'],
      qualityScore: 'excellent',
      notes: 'افتتاح دورة مزرعة الريف الذهبي بالحسيمة.',
      createdAt: '2026-08-29'
    }
  ];

  const feedPurchases: FeedPurchase[] = [
    {
      id: 'feed-1',
      invoiceNumber: 'FAC-AG-9021',
      date: '2026-05-02',
      supplierId: 'part-sup-1',
      feedType: 'starter',
      brand: 'الغرب ستارتر 1',
      quantityKg: 10000,
      bagsCount: 200,
      bagWeightKg: 50,
      unitPricePerKg: 4.8,
      totalAmount: 48000,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'partial',
      paidAmount: 20000,
      remainingAmount: 28000,
      accountId: 'acc-bank-attijari',
      notes: 'علف بادي 21% بروتين'
    },
    {
      id: 'feed-2',
      invoiceNumber: 'FAC-AG-9150',
      date: '2026-05-18',
      supplierId: 'part-sup-1',
      feedType: 'grower',
      brand: 'الغرب كرور 2',
      quantityKg: 35000,
      bagsCount: 700,
      bagWeightKg: 50,
      unitPricePerKg: 4.5,
      totalAmount: 157500,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'bank_transfer',
      paidAmount: 157500,
      remainingAmount: 0,
      accountId: 'acc-bank-attijari'
    },
    {
      id: 'feed-3',
      invoiceNumber: 'FAC-AG-9290',
      date: '2026-06-02',
      supplierId: 'part-sup-1',
      feedType: 'finisher',
      brand: 'الغرب فينيسر 3',
      quantityKg: 22000,
      bagsCount: 440,
      bagWeightKg: 50,
      unitPricePerKg: 4.3,
      totalAmount: 94600,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'bank_transfer',
      paidAmount: 94600,
      remainingAmount: 0,
      accountId: 'acc-bank-chaabi'
    },
    {
      id: 'feed-4',
      invoiceNumber: 'FAC-AG-9480',
      date: '2026-07-16',
      supplierId: 'part-sup-1',
      feedType: 'starter',
      brand: 'الغرب ستارتر',
      quantityKg: 9000,
      bagsCount: 180,
      bagWeightKg: 50,
      unitPricePerKg: 4.85,
      totalAmount: 43650,
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      paymentMethod: 'bank_transfer',
      paidAmount: 43650,
      remainingAmount: 0,
      accountId: 'acc-bank-attijari'
    },
    {
      id: 'feed-5',
      invoiceNumber: 'FAC-AG-9610',
      date: '2026-08-01',
      supplierId: 'part-sup-1',
      feedType: 'grower',
      brand: 'الغرب كرور',
      quantityKg: 32000,
      bagsCount: 640,
      bagWeightKg: 50,
      unitPricePerKg: 4.55,
      totalAmount: 145600,
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      paymentMethod: 'partial',
      paidAmount: 80000,
      remainingAmount: 65600,
      accountId: 'acc-bank-attijari',
      notes: 'متبقي 65,600 درهم مستحق بتاريخ 10 شتنبر'
    },
    {
      id: 'feed-6',
      invoiceNumber: 'FAC-AG-9780',
      date: '2026-08-18',
      supplierId: 'part-sup-1',
      feedType: 'finisher',
      brand: 'الغرب فينيسر',
      quantityKg: 18000,
      bagsCount: 360,
      bagWeightKg: 50,
      unitPricePerKg: 4.35,
      totalAmount: 78300,
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      paymentMethod: 'delayed',
      paidAmount: 0,
      remainingAmount: 78300,
      notes: 'مؤجل بالكامل لحين بيع الدورة'
    },
    {
      id: 'feed-7',
      invoiceNumber: 'FAC-AG-9820',
      date: '2026-08-07',
      supplierId: 'part-sup-1',
      feedType: 'starter',
      brand: 'الغرب ستارتر بلاس',
      quantityKg: 12500,
      bagsCount: 250,
      bagWeightKg: 50,
      unitPricePerKg: 4.9,
      totalAmount: 61250,
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      paymentMethod: 'partial',
      paidAmount: 30000,
      remainingAmount: 31250,
      accountId: 'acc-bank-chaabi'
    },
    {
      id: 'feed-8',
      invoiceNumber: 'FAC-AG-9910',
      date: '2026-08-22',
      supplierId: 'part-sup-1',
      feedType: 'grower',
      brand: 'الغرب كرور بريميوم',
      quantityKg: 25000,
      bagsCount: 500,
      bagWeightKg: 50,
      unitPricePerKg: 4.6,
      totalAmount: 115000,
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      paymentMethod: 'delayed',
      paidAmount: 0,
      remainingAmount: 115000,
      notes: 'فاتورة علف النمو قيد السداد'
    },
    {
      id: 'feed-9',
      invoiceNumber: 'FAC-AG-9950',
      date: '2026-08-20',
      supplierId: 'part-sup-1',
      feedType: 'starter',
      brand: 'الغرب ستارتر',
      quantityKg: 8000,
      bagsCount: 160,
      bagWeightKg: 50,
      unitPricePerKg: 4.85,
      totalAmount: 38800,
      farmId: 'farm-3',
      cycleId: 'cycle-4',
      paymentMethod: 'bank_transfer',
      paidAmount: 38800,
      remainingAmount: 0,
      accountId: 'acc-bank-attijari'
    },
    {
      id: 'feed-10',
      invoiceNumber: 'FAC-ZL-102',
      date: '2026-08-29',
      supplierId: 'part-sup-zalar',
      feedType: 'starter',
      brand: 'أعلاف زلار بادي ممتاز',
      quantityKg: 6000,
      bagsCount: 120,
      bagWeightKg: 50,
      unitPricePerKg: 4.95,
      totalAmount: 29700,
      farmId: 'farm-4',
      cycleId: 'cycle-5',
      paymentMethod: 'cash',
      paidAmount: 10000,
      remainingAmount: 19700,
      accountId: 'acc-caisse-main',
      notes: 'دفعة نقدية أولى'
    }
  ];

  const feedMovements: FeedStockMovement[] = [
    {
      id: 'fmov-1',
      date: '2026-05-02',
      type: 'purchase',
      quantityKg: 10000,
      feedType: 'starter',
      brand: 'الغرب ستارتر 1',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      barnNumber: 'عنبر 1 + 2',
      sourcePurchaseId: 'feed-1',
      unitCostPerKg: 4.8,
      totalCost: 48000,
      performedBy: 'رشيد العمراني',
      notes: 'تفريغ في صوامع التغذية الآلية'
    },
    {
      id: 'fmov-2',
      date: '2026-05-18',
      type: 'purchase',
      quantityKg: 35000,
      feedType: 'grower',
      brand: 'الغرب كرور 2',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      barnNumber: 'عنبر 1 + 2',
      sourcePurchaseId: 'feed-2',
      unitCostPerKg: 4.5,
      totalCost: 157500,
      performedBy: 'رشيد العمراني'
    },
    {
      id: 'fmov-3',
      date: '2026-07-16',
      type: 'purchase',
      quantityKg: 9000,
      feedType: 'starter',
      brand: 'الغرب ستارتر',
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      barnNumber: 'عنبر 1',
      sourcePurchaseId: 'feed-4',
      unitCostPerKg: 4.85,
      totalCost: 43650,
      performedBy: 'كمال الصنهاجي'
    },
    {
      id: 'fmov-4',
      date: '2026-08-01',
      type: 'purchase',
      quantityKg: 32000,
      feedType: 'grower',
      brand: 'الغرب كرور',
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      barnNumber: 'عنبر 1',
      sourcePurchaseId: 'feed-5',
      unitCostPerKg: 4.55,
      totalCost: 145600,
      performedBy: 'كمال الصنهاجي'
    },
    {
      id: 'fmov-5',
      date: '2026-08-07',
      type: 'purchase',
      quantityKg: 12500,
      feedType: 'starter',
      brand: 'الغرب ستارتر بلاس',
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      sourcePurchaseId: 'feed-7',
      unitCostPerKg: 4.9,
      totalCost: 61250,
      performedBy: 'حمزة التازي'
    }
  ];

  const medicationPurchases: MedicationPurchase[] = [
    {
      id: 'med-1',
      date: '2026-05-03',
      supplierId: 'part-sup-2',
      medicationName: 'لقاح نيوكاسل + برونشيت (Hitchner B1 + H120)',
      category: 'vaccine',
      quantity: 20,
      unit: 'قنينة 1000 جرعة',
      unitPrice: 160,
      totalAmount: 3200,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'cash',
      paidAmount: 3200,
      remainingAmount: 0,
      accountId: 'acc-caisse-main',
      dosageInstructions: 'تقطير في العين يوم 7'
    },
    {
      id: 'med-2',
      date: '2026-05-12',
      supplierId: 'part-sup-2',
      medicationName: 'لقاح الغامبورو (Gumboro 228E)',
      category: 'vaccine',
      quantity: 20,
      unit: 'قنينة 1000 جرعة',
      unitPrice: 190,
      totalAmount: 3800,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'cash',
      paidAmount: 3800,
      remainingAmount: 0,
      accountId: 'acc-caisse-main',
      dosageInstructions: 'في ماء الشرب يوم 14'
    },
    {
      id: 'med-3',
      date: '2026-05-20',
      supplierId: 'part-sup-2',
      medicationName: 'مضاد حيوي تنفسي إنروفلوكساسين 10%',
      category: 'antibiotic',
      quantity: 5,
      unit: 'لتر',
      unitPrice: 420,
      totalAmount: 2100,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'cash',
      paidAmount: 2100,
      remainingAmount: 0,
      accountId: 'acc-caisse-main'
    },
    {
      id: 'med-4',
      date: '2026-07-16',
      supplierId: 'part-sup-2',
      medicationName: 'برنامج تحصينات دورة 2 (نيوكاسل + غامبورو + فيتامينات AD3E)',
      category: 'vaccine',
      quantity: 1,
      unit: 'باقة كاملة',
      unitPrice: 9800,
      totalAmount: 9800,
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      paymentMethod: 'partial',
      paidAmount: 5000,
      remainingAmount: 4800,
      accountId: 'acc-caisse-main',
      notes: 'متبقي 4,800 درهم لمختبرات الأطلس'
    },
    {
      id: 'med-5',
      date: '2026-08-08',
      supplierId: 'part-sup-2',
      medicationName: 'فيتامينات تحضين + مضاد كوكسيديا أمبروليوم',
      category: 'supplement',
      quantity: 10,
      unit: 'كغ/لتر',
      unitPrice: 350,
      totalAmount: 3500,
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      paymentMethod: 'cash',
      paidAmount: 3500,
      remainingAmount: 0,
      accountId: 'acc-caisse-farm1'
    }
  ];

  const medicationMovements: MedicationStockMovement[] = [
    {
      id: 'mmov-1',
      date: '2026-05-07',
      type: 'issue',
      medicationPurchaseId: 'med-1',
      medicationName: 'لقاح نيوكاسل + برونشيت (Hitchner B1 + H120)',
      quantity: 20,
      unit: 'قنينة 1000 جرعة',
      unitCost: 160,
      totalCost: 3200,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      notes: 'استهلاك كامل اللقاح لـ 20,000 كتكوت'
    },
    {
      id: 'mmov-2',
      date: '2026-05-14',
      type: 'issue',
      medicationPurchaseId: 'med-2',
      medicationName: 'لقاح الغامبورو (Gumboro 228E)',
      quantity: 20,
      unit: 'قنينة 1000 جرعة',
      unitCost: 190,
      totalCost: 3800,
      farmId: 'farm-1',
      cycleId: 'cycle-1'
    }
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-1',
      date: '2026-05-01',
      category: 'chicks',
      description: 'شراء 20,000 كتكوت Cobb 500 لدورة 2026-01',
      amount: 110000,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      supplierId: 'part-sup-3',
      paymentMethod: 'bank_transfer',
      paidAmount: 110000,
      remainingAmount: 0,
      accountId: 'acc-bank-attijari'
    },
    {
      id: 'exp-2',
      date: '2026-07-15',
      category: 'chicks',
      description: 'شراء 18,000 كتكوت Ross 308 لدورة 2026-02',
      amount: 104400,
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      supplierId: 'part-sup-3',
      paymentMethod: 'partial',
      paidAmount: 60000,
      remainingAmount: 44400,
      accountId: 'acc-bank-attijari',
      notes: 'متبقي 44,400 درهم لمفرخات الأطلس'
    },
    {
      id: 'exp-3',
      date: '2026-08-06',
      category: 'chicks',
      description: 'شراء 25,000 كتكوت Cobb 500 لدورة 2026-03',
      amount: 140000,
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      supplierId: 'part-sup-3',
      paymentMethod: 'partial',
      paidAmount: 90000,
      remainingAmount: 50000,
      accountId: 'acc-bank-attijari',
      notes: 'متبقي 50,000 درهم'
    },
    {
      id: 'exp-4',
      date: '2026-08-19',
      category: 'chicks',
      description: 'شراء 15,000 كتكوت Hubbard لدورة 2026-04',
      amount: 81000,
      farmId: 'farm-3',
      cycleId: 'cycle-4',
      supplierId: 'part-sup-3',
      paymentMethod: 'partial',
      paidAmount: 45000,
      remainingAmount: 36000,
      accountId: 'acc-bank-chaabi'
    },
    {
      id: 'exp-5',
      date: '2026-05-02',
      category: 'fuel',
      description: 'تعبئة قنينات غاز التدفئة للتحضين (دورة 1)',
      amount: 14500,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      supplierId: 'part-sup-4',
      paymentMethod: 'cash',
      paidAmount: 14500,
      remainingAmount: 0,
      accountId: 'acc-caisse-main'
    },
    {
      id: 'exp-6',
      date: '2026-06-14',
      category: 'electricity',
      description: 'فاتورة الكهرباء والتهوية عن دورة 1 (المكتب الوطني ONEE)',
      amount: 12800,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      paymentMethod: 'bank_transfer',
      paidAmount: 12800,
      remainingAmount: 0,
      accountId: 'acc-bank-attijari'
    },
    {
      id: 'exp-7',
      date: '2026-06-15',
      category: 'cleaning_disinfection',
      description: 'شراء فرشة نجارة الخشب والتطهير بالفورمول (دورة 1)',
      amount: 8500,
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      supplierId: 'part-sup-5',
      paymentMethod: 'cash',
      paidAmount: 8500,
      remainingAmount: 0,
      accountId: 'acc-caisse-farm1'
    },
    {
      id: 'exp-8',
      date: '2026-07-20',
      category: 'fuel',
      description: 'غاز التدفئة والمحروقات لدورة 2 (مزرعة البركة)',
      amount: 11200,
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      supplierId: 'part-sup-4',
      paymentMethod: 'cash',
      paidAmount: 11200,
      remainingAmount: 0,
      accountId: 'acc-caisse-main'
    },
    {
      id: 'exp-9',
      date: '2026-08-10',
      category: 'cleaning_disinfection',
      description: 'شراء 4 أطنان نجارة خشب جديدة لمزرعة النور',
      amount: 9200,
      farmId: 'farm-1',
      cycleId: 'cycle-3',
      supplierId: 'part-sup-5',
      paymentMethod: 'cash',
      paidAmount: 9200,
      remainingAmount: 0,
      accountId: 'acc-caisse-farm1'
    },
    {
      id: 'exp-10',
      date: '2026-08-25',
      category: 'maintenance',
      description: 'صيانة مضخات مياه التبريد وموتورات الشفط',
      amount: 3400,
      farmId: 'farm-1',
      paymentMethod: 'cash',
      paidAmount: 3400,
      remainingAmount: 0,
      accountId: 'acc-caisse-farm1'
    }
  ];

  const sales: WholesaleSale[] = [
    {
      id: 'sale-1',
      invoiceNumber: 'VTE-2026-001',
      date: '2026-06-12',
      customerId: 'part-cust-1',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      chickenCount: 7500,
      totalWeightKg: 16500,
      averageWeightKg: 2.20,
      pricePerKg: 18.2,
      grossTotal: 300300,
      discount: 1300,
      netTotal: 299000,
      paidAmount: 200000,
      remainingAmount: 99000,
      paymentMethod: 'partial',
      accountId: 'acc-bank-attijari',
      truckPlate: '54321-أ-6',
      driverName: 'سعيد التازي',
      notes: 'دفعة أولى تحويل بنكي 200,000 درهم'
    },
    {
      id: 'sale-2',
      invoiceNumber: 'VTE-2026-002',
      date: '2026-06-13',
      customerId: 'part-cust-2',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      chickenCount: 6800,
      totalWeightKg: 15000,
      averageWeightKg: 2.205,
      pricePerKg: 18.5,
      grossTotal: 277500,
      discount: 0,
      netTotal: 277500,
      paidAmount: 277500,
      remainingAmount: 0,
      paymentMethod: 'bank_transfer',
      accountId: 'acc-bank-attijari',
      truckPlate: '11223-ب-1',
      driverName: 'حميد الصالحي',
      notes: 'شيك مصدق مسدد بالكامل'
    },
    {
      id: 'sale-3',
      invoiceNumber: 'VTE-2026-003',
      date: '2026-06-14',
      customerId: 'part-cust-3',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      chickenCount: 4940,
      totalWeightKg: 10828,
      averageWeightKg: 2.19,
      pricePerKg: 18.0,
      grossTotal: 194904,
      discount: 904,
      netTotal: 194000,
      paidAmount: 150000,
      remainingAmount: 44000,
      paymentMethod: 'partial',
      accountId: 'acc-bank-chaabi',
      truckPlate: '99887-د-15',
      driverName: 'عمر الهاشمي',
      notes: 'متبقي 44,000 درهم'
    },
    {
      id: 'sale-4',
      invoiceNumber: 'VTE-2026-004',
      date: '2026-08-29',
      customerId: 'part-cust-4',
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      chickenCount: 2500,
      totalWeightKg: 5950,
      averageWeightKg: 2.38,
      pricePerKg: 19.0,
      grossTotal: 113050,
      discount: 1050,
      netTotal: 112000,
      paidAmount: 70000,
      remainingAmount: 42000,
      paymentMethod: 'partial',
      accountId: 'acc-bank-attijari',
      truckPlate: '67890-أ-50',
      driverName: 'كمال الناصري',
      notes: 'بيعة أولية لتفريغ العنبر جزئياً، متبقي 42,000 درهم'
    }
  ];

  const transactions: FinancialTransaction[] = [
    {
      id: 'tx-1',
      date: '2026-05-01',
      type: 'expense',
      amount: 110000,
      accountId: 'acc-bank-attijari',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      partnerId: 'part-sup-3',
      referenceType: 'expense',
      referenceId: 'exp-1',
      paymentMethod: 'bank_transfer',
      description: 'شراء كتاكيت دورة 1 (20 ألف كتكوت)',
      performedBy: 'الحاج عثمان الإدريسي',
      createdAt: '2026-05-01'
    },
    {
      id: 'tx-2',
      date: '2026-05-02',
      type: 'supplier_payment',
      amount: 20000,
      accountId: 'acc-bank-attijari',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      partnerId: 'part-sup-1',
      referenceType: 'feed',
      referenceId: 'feed-1',
      paymentMethod: 'bank_transfer',
      description: 'دفعة لشراء علف بادي دورة 1',
      performedBy: 'ياسين بنسالم (المحاسب)',
      createdAt: '2026-05-02'
    },
    {
      id: 'tx-3',
      date: '2026-06-12',
      type: 'customer_payment',
      amount: 200000,
      accountId: 'acc-bank-attijari',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      partnerId: 'part-cust-1',
      referenceType: 'sale',
      referenceId: 'sale-1',
      paymentMethod: 'bank_transfer',
      description: 'تحصيل دفعة أولى من الزبون محمد التاجي (فاتورة VTE-2026-001)',
      performedBy: 'الحاج عثمان الإدريسي',
      createdAt: '2026-06-12'
    },
    {
      id: 'tx-4',
      date: '2026-06-13',
      type: 'customer_payment',
      amount: 277500,
      accountId: 'acc-bank-attijari',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      partnerId: 'part-cust-2',
      referenceType: 'sale',
      referenceId: 'sale-2',
      paymentMethod: 'bank_transfer',
      description: 'تحصيل كامل قيمة مبيعات شركة مجازر الأطلس',
      performedBy: 'ياسين بنسالم (المحاسب)',
      createdAt: '2026-06-13'
    },
    {
      id: 'tx-5',
      date: '2026-06-14',
      type: 'customer_payment',
      amount: 150000,
      accountId: 'acc-bank-chaabi',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      partnerId: 'part-cust-3',
      referenceType: 'sale',
      referenceId: 'sale-3',
      paymentMethod: 'bank_transfer',
      description: 'تحصيل دفعة من يوسف بوعزة',
      performedBy: 'ياسين بنسالم',
      createdAt: '2026-06-14'
    },
    {
      id: 'tx-6',
      date: '2026-07-10',
      type: 'customer_payment',
      amount: 55400,
      accountId: 'acc-bank-attijari',
      farmId: 'farm-1',
      cycleId: 'cycle-1',
      partnerId: 'part-cust-1',
      referenceType: 'debt_payment',
      paymentMethod: 'bank_transfer',
      description: 'تسديد جزئي من دين محمد التاجي المتبقي',
      performedBy: 'الحاج عثمان الإدريسي',
      createdAt: '2026-07-10'
    },
    {
      id: 'tx-7',
      date: '2026-08-20',
      type: 'account_transfer',
      amount: 30000,
      accountId: 'acc-bank-attijari',
      targetAccountId: 'acc-caisse-main',
      paymentMethod: 'cash',
      description: 'سحب سيولة نقدية من البنك لتغذية الصندوق الرئيسي',
      performedBy: 'الحاج عثمان الإدريسي',
      createdAt: '2026-08-20'
    },
    {
      id: 'tx-8',
      date: '2026-08-29',
      type: 'customer_payment',
      amount: 70000,
      accountId: 'acc-bank-attijari',
      farmId: 'farm-2',
      cycleId: 'cycle-2',
      partnerId: 'part-cust-4',
      referenceType: 'sale',
      referenceId: 'sale-4',
      paymentMethod: 'bank_transfer',
      description: 'دفعة فورية من بيع 2500 طائر للحاج عبد الله السوسي',
      performedBy: 'ياسين بنسالم',
      createdAt: '2026-08-29'
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'دورة جاهزة للتسويق والبيع',
      message: 'دورة 2026-02 في مزرعة البركة بلغت اليوم 39 يوماً بمتوسط وزن 2.38 كغ. الوقت مثالي للبيع بأفضل سعر بالسوق.',
      type: 'info',
      date: '2026-08-30',
      isRead: false,
      linkTab: 'cycles',
      linkId: 'cycle-2'
    },
    {
      id: 'notif-2',
      title: 'ديون مستحقة للموردين',
      message: 'شركة أعلاف الغرب المتحدة لديها فواتير مؤجلة مستحقة بقيمة 289,150 درهم.',
      type: 'warning',
      date: '2026-08-29',
      isRead: false,
      linkTab: 'partners',
      linkId: 'part-sup-1'
    },
    {
      id: 'notif-3',
      title: 'مبالغ مستحقة من الزبناء (لي)',
      message: 'الزبون محمد التاجي متبقي عليه 43,600 درهم والزبون يوسف بوعزة 44,000 درهم.',
      type: 'warning',
      date: '2026-08-28',
      isRead: false,
      linkTab: 'partners',
      linkId: 'part-cust-1'
    },
    {
      id: 'notif-4',
      title: 'تنبيه مخزون العلف',
      message: 'مخزون علف النمو بمزرعة النور يكفي لحوالي 3 أيام فقط بمعدل الاستهلاك الحالي (2.3 طن/يوم).',
      type: 'danger',
      date: '2026-08-30',
      isRead: false,
      linkTab: 'feed-meds'
    }
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      timestamp: '2026-08-30 14:15:32',
      userId: 'usr-4',
      userName: 'حمزة التازي (مشرف عنبر)',
      action: 'create',
      entityType: 'daily_log',
      entityId: 'log-cycle-3-24',
      details: 'تسجيل السجل اليومي ليوم 24 في دورة 2026-03: نافق 7 طيور، استهلاك علف 2150 كغ، متوسط وزن 1310 غرام'
    },
    {
      id: 'aud-2',
      timestamp: '2026-08-30 11:45:10',
      userId: 'usr-3',
      userName: 'ياسين بنسالم (المحاسب)',
      action: 'create',
      entityType: 'transaction',
      entityId: 'tx-8',
      details: 'تسجيل سند تحصيل دفعة بيع من الزبون الحاج عبد الله السوسي بقيمة 70,000 درهم بحساب التجاري وفا بنك'
    },
    {
      id: 'aud-3',
      timestamp: '2026-08-30 09:20:00',
      userId: 'usr-2',
      userName: 'رشيد العمراني (مدير مزرعة 1)',
      action: 'create',
      entityType: 'feed_purchase',
      entityId: 'feed-8',
      details: 'استلام شحنة علف نمو 25 طن من شركة أعلاف الغرب المتحدة مع تفريغ الصوامع'
    },
    {
      id: 'aud-4',
      timestamp: '2026-08-29 18:30:15',
      userId: 'usr-3',
      userName: 'ياسين بنسالم (المحاسب)',
      action: 'create',
      entityType: 'sale',
      entityId: 'sale-4',
      details: 'تسجيل فاتورة بيع جديدة VTE-2026-004 للزبون الحاج عبد الله السوسي (2,500 طائر، وزن 5,950 كغ، إجمالي 112,000 درهم)'
    }
  ];

  const autoBackupSettings = {
    enabled: true,
    intervalMinutes: 60,
    backupOnCriticalAction: true,
    maxSnapshotsToKeep: 10,
    lastBackupTimestamp: new Date().toISOString()
  };

  const backupSnapshots = [
    {
      id: 'snap-initial-seed',
      timestamp: new Date().toISOString(),
      trigger: 'manual',
      description: 'نسخة احتياطية شاملة لكامل البيانات النموذجية والإنتاجية',
      recordStats: {
        farms: farms.length,
        cycles: cycles.length,
        dailyLogs: dailyLogs.length,
        transactions: transactions.length,
        sales: sales.length,
        feeds: feedPurchases.length,
        auditLogs: auditLogs.length
      },
      sizeBytes: 35000,
      dataJson: JSON.stringify({
        farms,
        cycles,
        dailyLogs,
        partners,
        accounts,
        workers,
        workerTransactions,
        chickPurchases,
        feedPurchases,
        feedMovements,
        medicationPurchases,
        medicationMovements,
        expenses,
        sales,
        transactions,
        notifications,
        auditLogs
      })
    }
  ];

  return {
    users,
    farms,
    cycles,
    dailyLogs,
    partners,
    accounts,
    workers,
    workerTransactions,
    chickPurchases,
    feedPurchases,
    feedMovements,
    medicationPurchases,
    medicationMovements,
    expenses,
    sales,
    feedSales: [],
    chickSales: [],
    transactions,
    notifications,
    auditLogs,
    autoBackupSettings,
    backupSnapshots
  };
}
