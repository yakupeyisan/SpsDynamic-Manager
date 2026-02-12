export const environment = {
  production: false,
  
  // Aktif ayar adı
  setting: 'development',
  
  
  // Authentication ayarları
  settings: {
    ordu: {
      // Proxy kullanmak istiyorsanız boş bırakın: apiUrl: ''
      // Proxy çalışmıyorsa, API URL'inizi buraya yazın (örn: 'http://localhost:5000')
      apiUrl: 'http://localhost', // API'nizin çalıştığı URL'i buraya yazın (port varsa ekleyin: 'http://localhost:5000')
      // WebSocket URL (otomatik olarak apiUrl'den türetilir, gerekirse manuel ayarlayabilirsiniz)
      // LiveView için özel WebSocket URL (eski sistem: ws://172.16.1.186:8282)
      wsUrl: '', // Boş bırakılırsa apiUrl'den otomatik türetilir, LiveView için 'ws://172.16.1.186:8282' gibi ayarlanabilir
      
      // Açılış sayfası ayarı: 'home' veya 'other'
      // 'login': İlk açılışta giriş yapılmamışsa home sayfasına login yönlendir
      // '$1' : açılışha hangi sayfaya yönlendirilmesini istiyorson onun route değerini yaz
      landingPage: 'login', // 'login' veya '$1'
      // Logo URL
      logoUrl: '/assets/images/logos/logo-ordu.png',
      // Logo URL for Login page
      logoUrlLogin: '/assets/images/logos/logo-ordu-login.png',
      // Google ile login aktif mi
      googleLoginEnabled: false,
      
      // Cloudflare aktif mi
      cloudflareEnabled: false,
      
      // Şifremi unuttum aktif mi
      forgotPasswordEnabled: true,
      
      // Yeni Üyelik aktif mi
      signUpEnabled: false,
      
      // Bildirim tipi: 'mail' veya 'sms'
      notificationType: 'sms', // 'mail' | 'sms'
      loginImage: 'https://odu.edu.tr/logo/img/2023.jpg',
      newAccountEnabled: true,
    },
    tskb:{
      apiUrl: 'http://localhost',
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
      apiUrl: 'http://localhost',
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
      apiUrl: 'http://localhost',
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
    // development (Technolife) - Teknoloji markası: mavi + teal
    development: {
      primary: '#1565C0',
      primaryFixedDim: 'rgba(21, 101, 192, 0.15)',
      secondary: '#00897B',
      secondaryFixedDim: 'rgba(0, 137, 123, 0.15)',
      error: '#D32F2F',
      errorFixedDim: 'rgba(211, 47, 47, 0.15)',
      warning: '#f8c20a',
      warningFixedDim: '#f8c20a26',
      success: '#36c76c',
      successFixedDim: '#36c76c26',
      tertiary: '#f5f5f5',
      tertiaryFixedDim: 'rgba(245, 245, 245, 0.15)',
      outlineVariant: '#e0e0e0',
      level1: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level2: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level3: '0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
      level4: '0 15px 30px rgba(0, 0, 0, 0.15)',
    },
  }
};

