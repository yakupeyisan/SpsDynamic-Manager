export const environment = {
  production: true,
  
  // Aktif ayar adı
  setting: 'tskb',

  // Favicon dosya adları (src/favicons/ altında). Build/serve öncesi aktif ayara göre favicon.ico oluşturulur.
  favicons: {
    ordu: 'ordu.ico',
    afyon: 'afyon.ico',
    tau: 'tau.ico',
    tskb: 'tskb.ico',
    eureko: 'eureko.ico',
    nurol: 'nurol.ico',
    gatement: 'gatement.ico',
    development: 'default.ico',
  },

  // Authentication ayarları
  settings: {
    ordu: {
      systemType: 'GENERAL',
      apiUrl: '', // API'nizin çalıştığı URL'i buraya yazın (port varsa ekleyin: 'http://localhost:5000')
      wsUrl: '', // Boş bırakılırsa apiUrl'den otomatik türetilir, LiveView için 'ws://172.16.1.186:8282' gibi ayarlanabilir
      landingPage: 'login', // 'login' veya '$1'
      logoUrl: '/assets/images/logos/logo-ordu.png',
      logoUrlLogin: '/assets/images/logos/logo-ordu-login.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'sms', // 'mail' | 'sms'
      loginImage: 'https://odu.edu.tr/logo/img/2023.jpg',
      newAccountEnabled: true,
    },
    afyon: {
      systemType: 'GENERAL',
      apiUrl: '',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/logo-afyon.png',
      logoUrlLogin: '/assets/images/logos/logo-afyon.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'sms',
      loginImage: '',
      newAccountEnabled: true,
    },
    tau: {
      systemType: 'GENERAL',
      apiUrl: '',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/turk-alman-logo.png',
      logoUrlLogin: '/assets/images/logos/turk-alman-logo.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'mail',
      loginImage: '',
      newAccountEnabled: true,
    },
    tskb: {
      systemType: 'ROSSLARE',
      apiUrl: '',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/logo-tskb.png',
      logoUrlLogin: '/assets/images/logos/logo-tskb.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'mail',
      loginImage: '',
      newAccountEnabled: false,
    },
    eureko: {
      systemType: 'ROSSLARE',
      apiUrl: '',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/eureko-logo.png',
      logoUrlLogin: '/assets/images/logos/eureko-logo.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'mail',
      loginImage: '',
      newAccountEnabled: false,
    },
    development: {
      systemType: 'ROSSLARE',
      apiUrl: '',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/logo-technolife.png',
      logoUrlLogin: '/assets/images/logos/logo-technolife-login.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'sms',
      loginImage: '',
      newAccountEnabled: false,
    },
    nurol: {
      systemType: 'ROSSLARE',
      apiUrl: '',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/logo-nurol.png',
      logoUrlLogin: '/assets/images/logos/logo-nurol.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'mail',
      loginImage: '',
      newAccountEnabled: false,
    },
    gatement: {
      systemType: 'GENERAL',
      apiUrl: 'http://37.247.99.93:8212',
      wsUrl: '',
      landingPage: 'login',
      logoUrl: '/assets/images/logos/gatement-logo.png',
      logoUrlLogin: '/assets/images/logos/gatement-logo.png',
      googleLoginEnabled: false,
      cloudflareEnabled: false,
      forgotPasswordEnabled: true,
      signUpEnabled: false,
      notificationType: 'mail',
      loginImage: '',
      newAccountEnabled: false,
    }
  },
  
  // Tema tanımları
  themes: {
    ordu: {
      // Primary renk (Ana renk) - Logo koyu renk
      primary: '#4a4e68',
      primaryFixedDim: 'rgba(74, 78, 104, 0.15)',
      
      // Secondary renk (İkincil renk) - Logo bej/krem renk
      secondary: '#d2c6ac',
      secondaryFixedDim: 'rgba(210, 198, 172, 0.15)',
      
      // Error renk (Hata renkleri)
      error: 'rgb(255, 102, 146)',
      errorFixedDim: 'rgba(255, 102, 146, 0.15)',
      
      // Warning renk (Uyarı renkleri)
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      
      // Success renk (Başarı renkleri)
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      
      // Tertiary renk (Üçüncül renk) - Logo açık bej/krem renk
      tertiary: '#f9f2e5',
      tertiaryFixedDim: 'rgba(249, 242, 229, 0.15)',
      
      // Outline variant (Border renkleri)
      outlineVariant: '#e0e6eb',
      
      // Shadows (Gölgeler)
      level1: '0px 2px 4px -1px rgba(175, 182, 201, 0.2)',
      level2: '0px 2px 4px -1px rgba(175, 182, 201, 0.2)',
      level3: '0px 2px 4px -1px rgba(175, 182, 201, 0.2)',
      level4: '0 15px 30px rgba(0,0,0,0.12)',
    },
    afyon: {
      // Primary renk (Ana renk) - Logo koyu lacivert halka (outer ring)
      primary: '#0A3B8B',
      primaryFixedDim: 'rgba(10, 59, 139, 0.15)',
      // Secondary renk (İkincil renk) - Logo açık mavi / gökyüzü mavisi (iç daire)
      secondary: '#5B9BD5',
      secondaryFixedDim: 'rgba(91, 155, 213, 0.15)',
      error: 'rgb(255, 102, 146)',
      errorFixedDim: 'rgba(255, 102, 146, 0.15)',
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      // Tertiary renk - Logo açık mavi arka plan tonu
      tertiary: '#E8F4FC',
      tertiaryFixedDim: 'rgba(232, 244, 252, 0.15)',
      outlineVariant: '#c5d9ed',
      level1: '0px 2px 4px -1px rgba(10, 59, 139, 0.2)',
      level2: '0px 2px 4px -1px rgba(10, 59, 139, 0.2)',
      level3: '0px 2px 4px -1px rgba(10, 59, 139, 0.2)',
      level4: '0 15px 30px rgba(0,0,0,0.12)',
    },
    // Türk-Alman Üniversitesi - Logo: teal accent + koyu gri (monogram ve metin)
    tau: {
      primary: '#00B4BD',
      primaryFixedDim: 'rgba(0, 180, 189, 0.15)',
      secondary: '#383B40',
      secondaryFixedDim: 'rgba(56, 59, 64, 0.15)',
      error: 'rgb(255, 102, 146)',
      errorFixedDim: 'rgba(255, 102, 146, 0.15)',
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      tertiary: '#E8F6F7',
      tertiaryFixedDim: 'rgba(232, 246, 247, 0.15)',
      outlineVariant: '#c5d9dc',
      level1: '0px 2px 4px -1px rgba(0, 180, 189, 0.2)',
      level2: '0px 2px 4px -1px rgba(0, 180, 189, 0.2)',
      level3: '0px 2px 4px -1px rgba(0, 180, 189, 0.2)',
      level4: '0 15px 30px rgba(0,0,0,0.12)',
    },
    tskb: {
      // Primary renk (Ana renk) - Logo siyah renk (TS ve B harfleri)
      primary: '#000000',
      primaryFixedDim: 'rgba(0, 0, 0, 0.15)',
      
      // Secondary renk (İkincil renk) - Logo kırmızı renk (K harfi)
      secondary: '#D32F2F',
      secondaryFixedDim: 'rgba(211, 47, 47, 0.15)',
      
      // Error renk (Hata renkleri) - Kırmızı tonları
      error: '#D32F2F',
      errorFixedDim: 'rgba(211, 47, 47, 0.15)',
      
      // Warning renk (Uyarı renkleri)
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      
      // Success renk (Başarı renkleri)
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      
      // Tertiary renk (Üçüncül renk) - Açık gri ton
      tertiary: '#f5f5f5',
      tertiaryFixedDim: 'rgba(245, 245, 245, 0.15)',
      
      // Outline variant (Border renkleri) - Açık gri
      outlineVariant: '#e0e0e0',
      
      // Shadows (Gölgeler) - Siyah tonları
      level1: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level2: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level3: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level4: '0 15px 30px rgba(0, 0, 0, 0.15)',
    },
    eureko: {
      // Primary renk (Ana renk) - Logo EUREKO mavisi
      primary: '#004191',
      primaryFixedDim: 'rgba(0, 65, 145, 0.15)',
      
      // Secondary renk (İkincil renk) - Logo Sigorta grisi
      secondary: '#828282',
      secondaryFixedDim: 'rgba(130, 130, 130, 0.15)',
      
      // Error renk (Hata renkleri)
      error: '#D32F2F',
      errorFixedDim: 'rgba(211, 47, 47, 0.15)',
      
      // Warning renk (Uyarı renkleri)
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      
      // Success renk (Başarı renkleri)
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      
      // Tertiary renk (Üçüncül renk) - Açık gri ton
      tertiary: '#f5f5f5',
      tertiaryFixedDim: 'rgba(245, 245, 245, 0.15)',
      
      // Outline variant (Border renkleri) - Açık gri
      outlineVariant: '#e0e0e0',
      
      // Shadows (Gölgeler)
      level1: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level2: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level3: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level4: '0 15px 30px rgba(0, 0, 0, 0.15)',
    },
    nurol: {
      // Primary renk (Ana renk) - Logo Nurol Holding mavisi
      primary: '#004791',
      primaryFixedDim: 'rgba(0, 71, 145, 0.15)',
      
      // Secondary renk (İkincil renk) - Logo arka plan siyahı
      secondary: '#000000',
      secondaryFixedDim: 'rgba(0, 0, 0, 0.15)',
      
      // Error renk (Hata renkleri)
      error: '#D32F2F',
      errorFixedDim: 'rgba(211, 47, 47, 0.15)',
      
      // Warning renk (Uyarı renkleri)
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      
      // Success renk (Başarı renkleri)
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      
      // Tertiary renk (Üçüncül renk) - Açık gri ton
      tertiary: '#f5f5f5',
      tertiaryFixedDim: 'rgba(245, 245, 245, 0.15)',
      
      // Outline variant (Border renkleri) - Açık gri
      outlineVariant: '#e0e0e0',
      
      // Shadows (Gölgeler)
      level1: '0px 2px 4px -1px rgba(0, 71, 145, 0.2)',
      level2: '0px 2px 4px -1px rgba(0, 71, 145, 0.2)',
      level3: '0px 2px 4px -1px rgba(0, 71, 145, 0.2)',
      level4: '0 15px 30px rgba(0, 0, 0, 0.15)',
    },
    gatement: {
      // Primary renk (Ana renk) - Logo siyah alan
      primary: '#000000',
      primaryFixedDim: 'rgba(0, 0, 0, 0.15)',
      
      // Secondary renk (İkincil renk) - Logo açık nane yeşili (EDU kutusu)
      secondary: '#80e8af',
      secondaryFixedDim: 'rgba(128, 232, 175, 0.15)',
      
      // Error renk (Hata renkleri)
      error: '#D32F2F',
      errorFixedDim: 'rgba(211, 47, 47, 0.15)',
      
      // Warning renk (Uyarı renkleri)
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      
      // Success renk (Başarı renkleri) - Logo yeşili ile uyumlu
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      
      // Tertiary renk (Üçüncül renk) - Açık nane tonu
      tertiary: '#e8f8ef',
      tertiaryFixedDim: 'rgba(232, 248, 239, 0.15)',
      
      // Outline variant (Border renkleri)
      outlineVariant: '#c8e6d4',
      
      // Shadows (Gölgeler) - Siyah tonları
      level1: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level2: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level3: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level4: '0 15px 30px rgba(0, 0, 0, 0.15)',
    },
  }
};

