export const environment = {
  production: false,
  // Proxy kullanmak istiyorsanız boş bırakın: apiUrl: ''
  // Proxy çalışmıyorsa, API URL'inizi buraya yazın (örn: 'http://localhost:5000')
  apiUrl: 'http://localhost', // API'nizin çalıştığı URL'i buraya yazın (port varsa ekleyin: 'http://localhost:5000')
  
  // Açılış sayfası ayarı: 'home' veya 'other'
  // 'login': İlk açılışta giriş yapılmamışsa home sayfasına login yönlendir
  // '$1' : açılışha hangi sayfaya yönlendirilmesini istiyorson onun route değerini yaz
  landingPage: 'login', // 'login' veya '$1'
  
  // Aktif tema adı
  theme: 'ordu',
  
  // Logo URL
  logoUrl: '/assets/images/logos/logo-ordu.png',
  // Logo URL for Login page
  logoUrlLogin: '/assets/images/logos/logo-ordu-login.png',
  
  // Authentication ayarları
  auth: {
    ordu: {
      // Google ile login aktif mi
      googleLoginEnabled: false,
      
      // Cloudflare aktif mi
      cloudflareEnabled: true,
      
      // Şifremi unuttum aktif mi
      forgotPasswordEnabled: true,
      
      // Yeni Üyelik aktif mi
      signUpEnabled: false,
      
      // Bildirim tipi: 'mail' veya 'sms'
      notificationType: 'sms', // 'mail' | 'sms'
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
    }
  }
};

