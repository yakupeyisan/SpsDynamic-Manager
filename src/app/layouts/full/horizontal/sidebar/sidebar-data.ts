import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Genel',
  },
  {
    displayName: 'Ana Sayfa',
    iconName: 'mdi:home',
    route: '/',
  },
  {
    displayName: 'Kişiler',
    iconName: 'mdi:account-group',
    route: '/Employee',
  },
  {
    displayName: 'Kartlar',
    iconName: 'mdi:credit-card',
    route: '/Card',
  },
  {
    displayName: 'Canlı İzleme',
    iconName: 'mdi:eye',
    route: '/LiveView',
  },
  {
    displayName: 'Tanımlar',
    iconName: 'mdi:clock-outline',
    children: [
      {
        displayName: 'Firma Tanımları',
        route: '/PdksCompany',
      },
      {
        displayName: 'Bölüm Tanımları',
        route: '/Department',
      },
      {
        displayName: 'Kadro Tanımları',
        route: '/PdksStaff',
      },
      {
        displayName: 'Görev Tanımları',
        route: '/PdksPosition',
      },
      {
        displayName: 'Zaman Tanımları',
        route: '/TimeZone',
      },
    ],
  },
  {
    displayName: 'Kart Baskı Modulü',
    iconName: 'mdi:printer',
    children: [
      {
        displayName: 'Kart Şablonları',
        route: '/CardTemplates',
      },
      {
        displayName: 'Kart Baskı Listesi',
        route: '/CardWriteList',
      },
    ],
  },
  {
    displayName: 'Geçiş Kontrol',
    iconName: 'mdi:door',
    children: [
      {
        displayName: 'Geçiş Yetki Grubu',
        route: '/AccessGroup',
      },
      {
        displayName: 'Bölge Tanımları',
        route: '/AccessZones',
      },
      {
        displayName: 'Alarm Tanımları',
        disabled: true,
      },
    ],
  },
  {
    displayName: 'Abonelik',
    iconName: 'mdi:checkbox-marked',
    children: [
      {
        displayName: 'Paket Tanımları',
        route: '/SubscriptionPackages',
      },
    ],
  },
  {
    displayName: 'Kafeterya',
    iconName: 'mdi:coffee',
    children: [
      {
        displayName: 'Kafeterya Grupları',
        route: '/CafeteriaGroup',
      },
      {
        displayName: 'Kafeterya Geçiş Tarifeleri',
        route: '/TerminalTariffs',
      },
      {
        displayName: 'Zaman Dilimleri',
        route: '/CafeteriaApplications',
      },
      {
        displayName: 'Bölgeler',
        route: '/CafeteriaPlaces',
      },
      {
        displayName: 'Birim Tipleri',
        route: '/CafeteriaUnitType',
      },
      {
        displayName: 'Ürün Tipleri',
        route: '/CafeteriaProductType',
      },
      {
        displayName: 'Ürünler',
        route: '/CafeteriaProduct',
      },
      {
        displayName: 'Yemek Menüleri',
        route: '/CafeteriaMenus',
      },
      {
        displayName: 'Kafeterya Hesapları',
        route: '/CafeteriaAccounts',
      },
    ],
  },
  {
    displayName: 'Sanal Pos',
    iconName: 'mdi:bank',
    children: [
      {
        displayName: 'Ödeme Tanımları',
        route: '/PaymentTypes',
      },
    ],
  },
  {
    displayName: 'Ziyaretçi Defteri',
    iconName: 'mdi:book',
    children: [
      {
        displayName: 'Ziyaretçi Ayarlar',
        disabled: true,
      },
      {
        displayName: 'Ziyaretçi Kayıt',
        route: '/VisitorEvents-Insiders',
      },
      {
        displayName: 'Ziyaret Defteri',
        route: '/VisitorEvents',
      },
    ],
  },
  {
    displayName: 'Raporlar',
    iconName: 'mdi:chart-line',
    children: [
      {
        displayName: 'Genel Raporlar',
        children: [
          {
            displayName: 'Sms Raporları',
            route: '/SmsTransactions',
          },
          {
            displayName: 'E-Mail Raporları',
            route: '/MailTransactions',
          },
          {
            displayName: 'Kişi Konum Bilgileri',
            route: '/EmployeeWithLocation',
          },
          {
            displayName: 'Aktarım Raporları',
            route: '/EmployeeTransferList',
          },
        ],
      },
      {
        displayName: 'Geçiş Kontrol',
        children: [
          {
            displayName: 'Geçiş Kayıtları',
            route: '/AccessEvents',
          },
          {
            displayName: 'İlk Giriş/Son Çıkış',
            route: '/InputOutputReports',
          },
          {
            displayName: 'Günlük Yoklama',
            route: '/DailyAttendanceReports',
          },
          {
            displayName: 'Geçis Yetki Raporu',
            route: '/AccessDetails',
          },
          {
            displayName: 'İçeridekiler/Dışarıdakiler',
            route: '/InsideOutsideReports',
          },
        ],
      },
      {
        displayName: 'Tahsilat Raporları',
        children: [
          {
            displayName: 'Tahsilatlar',
            route: '/Payments',
          },
          {
            displayName: 'Sanal Pos Yükleme Raporları',
            route: '/PaymentsOfVirtualPos',
          },
          {
            displayName: 'Genel Kasa Raporu',
            route: '/AllCollectionReports',
            disabled: true,
          },
          {
            displayName: 'Sanal Pos Ürün Satışları',
            route: '/PaymentOfVirtualPosForProductSales',
            disabled: true,
          },
        ],
      },
      {
        displayName: 'Kafeterya',
        children: [
          {
            displayName: 'Kafeterya Geçiş Kayıtları',
            route: '/CafeteriaEvents',
          },
          {
            displayName: 'Kafeterya Geçiş Özeti',
            route: '/CafeteriaSummary',
          },
          {
            displayName: 'Lokasyon Bazlı Günlük Geçiş Sayıları',
            route: '/LocationBasedDailyReports',
          },
          {
            displayName: 'Lokasyon Bazlı İlk Kullanım Raporu',
            route: '/LocationBasedFirstUseReports',
          },
          {
            displayName: 'Departman Bazlı Yükleme Raporu',
            route: '/DepartmentBasedPaymentReports',
          },
        ],
      },
      {
        displayName: 'Abonelik',
        children: [
          {
            displayName: 'Abone Kayıtları',
            route: '/SubscriptionEvents',
          },
          {
            displayName: 'Bölge Bazlı Yemek Sayıları',
            route: '/SubscriptionEventBasedZoneReports',
          },
          {
            displayName: 'Paket Bazlı Satış Raporu',
            route: '/SubscriptionEventBasedPackageSalesReports',
          },
          {
            displayName: 'Grup Bazlı Turnike Geçiş Raporu',
            route: '/CafeteriaEventDailyNumberOfMealsByGroups',
          },
        ],
      },
      {
        displayName: 'Loglar',
        children: [
          {
            displayName: 'Sistem Logları',
            route: '/Logs',
          },
          {
            displayName: 'Terminal Logları',
            route: '/TerminalLogs',
          },
          {
            displayName: 'Hata Logları',
            route: '/ErrorLogs',
          },
        ],
      },
      {
        displayName: 'Otomat Kayıtları',
        route: '/PayStationLogs',
      },
    ],
  },
  {
    displayName: 'Rapor Tanımları',
    iconName: 'mdi:file-archive',
    children: [
      {
        displayName: 'Rapor Şablonları',
        route: '/Reports',
      },
      {
        displayName: 'Raporlar',
        route: '/ReportTasks',
      },
      {
        displayName: 'Zamanlanmış Görevler',
        route: '/TaskSchedulers',
      },
    ],
  },
  {
    displayName: 'Genel Ayarlar',
    iconName: 'mdi:wrench',
    children: [
      {
        displayName: 'Sanal Pos Ayarları',
        disabled: true,
      },
      {
        displayName: 'Operatör Yetki Tanımları',
        children: [
          {
            displayName: 'Yetkiler',
            route: '/Authorizations',
          },
          {
            displayName: 'İstek Tanımları',
            route: '/OperationClaims',
          },
          {
            displayName: 'Canlı İzleme Tanımları',
            route: '/LiveViewSettings',
          },
          {
            displayName: 'Güvenli Girdi Tanımları',
            route: '/SecureFields',
          },
          {
            displayName: 'Özel Alan Tanımları',
            route: '/CustomFieldSettings',
          },
        ],
      },
      {
        displayName: 'Sms Ve Mail Ayarları',
        children: [
          {
            displayName: 'Sms Ayarları',
            route: '/SmsSettings',
          },
          {
            displayName: 'Mail Ayarları',
            route: '/MailSettings',
          },
        ],
      },
      {
        displayName: 'Tatil Tanımları',
        route: '/Holidays',
      },
      {
        displayName: 'Terminaller',
        route: '/Terminals',
      },
      {
        displayName: 'Otomat Tanımları',
        route: '/PayStations',
      },
      {
        displayName: 'Rosslare Senkronizasyon',
        disabled: true,
      },
      {
        displayName: 'Hes Kontrol Ayarı',
        route: '/HesSettings',
      },
      {
        displayName: 'Pos Teminalleri',
        route: '/PosDevices',
      },
      {
        displayName: 'Manuel Kapı Tetikleme',
        disabled: true,
      },
    ],
  },
  {
    displayName: 'Yönetim',
    visible: false,
    iconName: 'mdi:view-dashboard',
    children: [
      {
        displayName: 'Menus',
        route: '/Menus',
      },
      {
        displayName: 'Layouts',
        route: '/Layouts',
      },
      {
        displayName: 'Grids',
        route: '/Grids',
      },
      {
        displayName: 'Forms',
        route: '/Forms',
      },
      {
        displayName: 'Popups',
        route: '/Popups',
      },
      {
        displayName: 'Toolbars',
        route: '/Toolbars',
      },
      {
        displayName: 'Tabs',
        route: '/Tabs',
      },
      {
        displayName: 'Events',
        route: '/Events',
      },
      {
        displayName: 'Columns',
        route: '/Columns',
      },
      {
        displayName: 'Fields',
        route: '/Fields',
      },
      {
        displayName: 'Actions',
        route: '/Actions',
      },
    ],
  },
];
