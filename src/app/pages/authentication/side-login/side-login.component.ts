import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, TranslateModule, TablerIconsModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements OnInit, OnDestroy, AfterViewInit {
  turnstileWidgetId: string = 'turnstile-widget';
  turnstileToken: string | null = null;
  private widgetId: string | null = null;
  isLoading: boolean = false;
  turnstileError: string | null = null;
  
  // Environment ayarları
  readonly env = environment;
  readonly activeSettings = environment.settings[environment.setting as keyof typeof environment.settings];
  
  // Aktif ayar için auth ayarları
  get authConfig() {
    const key = this.env.setting as keyof typeof this.env.settings;
    const activeSettings = this.env.settings[key];

    if (!activeSettings) {
      return {
        googleLoginEnabled: false,
        cloudflareEnabled: false,
        forgotPasswordEnabled: true,
        signUpEnabled: false,
        notificationType: 'mail' as 'mail' | 'sms',
        newAccountEnabled: false,
      };
    }

    return {
      googleLoginEnabled: activeSettings.googleLoginEnabled,
      cloudflareEnabled: activeSettings.cloudflareEnabled,
      forgotPasswordEnabled: activeSettings.forgotPasswordEnabled,
      signUpEnabled: activeSettings.signUpEnabled,
      notificationType: activeSettings.notificationType as 'mail' | 'sms',
      newAccountEnabled: activeSettings.newAccountEnabled ?? false,
    };
  }
  
  // Cloudflare Turnstile Site Key
  // Test key: '0x4AAAAAACDSSXR7Xsi_CiCc' (sadece localhost için çalışır)
  // Production için Cloudflare dashboard'dan gerçek site key alınmalı
  private readonly TURNSTILE_SITE_KEY = '0x4AAAAAACDSSXR7Xsi_CiCc'; // TODO: Production domain için gerçek key kullanın

  private toastr = inject(ToastrService);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  form = new FormGroup({
    uname: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    // ngOnInit'te hiçbir şey yapmıyoruz, AfterViewInit'te yapacağız
  }

  ngAfterViewInit() {
    const loginImage = environment.settings[environment.setting as keyof typeof environment.settings].loginImage;

    //environment.setting değeri ordu ise
    if (environment.setting === 'ordu') {
      this.loadOrduImageScript();
    } else {
      //değilse environment.settings[environment.setting as keyof typeof environment.settings].loginImage url'sini kullanarak logo scriptini yükle
      // loginImage boş değilse ve varsa yükle
      if (loginImage && loginImage !== '') {
        this.loadLoginImageScript(loginImage);
      }
    }
    
    // View render edildikten sonra Turnstile scriptini yükle (sadece cloudflare enabled ise)
    if (this.authConfig.cloudflareEnabled) {
      this.loadTurnstileScript();
    }
  }
  loadLoginImageScript(loginImage: string) {
    // loginImage boş değilse devam et
    if (!loginImage || loginImage === '') {
      return;
    }
    
    // loginImage elementinin hazır olduğundan emin ol
    const loginImageElement = document.getElementById('randomImage');
    if (!loginImageElement) {
      console.warn('loginImage elementi bulunamadı');
      return;
    }
    loginImageElement.setAttribute('src', loginImage);
  }

  loadOrduImageScript() {
    // randomImage elementinin hazır olduğundan emin ol

    const imageElement = document.getElementById('randomImage');
    if (!imageElement) {
      console.warn('randomImage elementi bulunamadı');
      return;
    }
    
    // Mevcut script'i kontrol et
    const existingScript = document.querySelector('script[src*="www.odu.edu.tr/logo/img/random.js"]');
    if (existingScript) {
      // Script zaten yüklü, ama route değişiminde yeniden çalıştırmak için
      // Script'i kaldırıp yeniden yükleyelim
      existingScript.remove();
    }
    
    // Cache-busting için timestamp ekle
    const timestamp = new Date().getTime();
    const scriptUrl = `https://www.odu.edu.tr/logo/img/random.js?t=${timestamp}`;
    
    // Script elementini oluştur ve document.head'e ekle
    const orduImage = document.createElement('script');
    orduImage.setAttribute('src', scriptUrl);
    orduImage.setAttribute('async', '');
    orduImage.onerror = () => {
      console.error('Ordu image script yüklenemedi');
    };
    orduImage.onload = () => {
      //console.log('Ordu image script yüklendi');
    };
    document.head.appendChild(orduImage);
  }

  loadTurnstileScript() {
    // Script daha önce yüklenmiş mi kontrol et
    if (document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
      // Script zaten yüklüyse direkt başlat
      this.initTurnstile();
      return;
    }
    
    // Script elementini oluştur ve document.head'e ekle
    const turnstileScript = document.createElement('script');
    turnstileScript.setAttribute('src', 'https://challenges.cloudflare.com/turnstile/v0/api.js');
    turnstileScript.setAttribute('async', '');
    turnstileScript.setAttribute('defer', '');
    turnstileScript.onload = () => {
      this.initTurnstile();
    };
    document.head.appendChild(turnstileScript);
  }

  ngOnDestroy() {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
    }
  }

  initTurnstile() {
    // Script yüklendikten sonra Turnstile'ı başlat
    if (window.turnstile) {
      this.renderTurnstile();
    } else {
      // Script henüz yüklenmemişse bekle
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          this.renderTurnstile();
        }
      }, 100);
    }
  }

  renderTurnstile() {
    if (window.turnstile) {
      const element = document.getElementById(this.turnstileWidgetId);
      if (element) {
        try {
          this.widgetId = window.turnstile.render(element, {
            sitekey: this.TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              this.turnstileToken = token;
              this.turnstileError = null;
            },
            'error-callback': () => {
              this.turnstileToken = null;
              this.turnstileError = 'Güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyin.';
              console.error('Turnstile error: Site key veya domain yapılandırması hatalı olabilir.');
            },
            'expired-callback': () => {
              this.turnstileToken = null;
              this.turnstileError = 'Güvenlik doğrulaması süresi doldu. Lütfen tekrar deneyin.';
            },
          });
        } catch (error) {
          console.error('Turnstile render error:', error);
          this.turnstileError = 'Güvenlik doğrulaması yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
        }
      }
    } else {
      console.error('Turnstile script yüklenemedi. Lütfen sayfayı yenileyin.');
      this.turnstileError = 'Güvenlik doğrulaması yüklenemedi. Lütfen sayfayı yenileyin.';
    }
  }

  signInWithGoogle() {
    // Google ile giriş işlemi burada yapılacak
    //console.log('Google ile giriş yapılıyor...');
    // TODO: Google OAuth entegrasyonu
  }

  submit() {
    // Turnstile onaylanmadan login işlemi yapılamaz (sadece cloudflare enabled ise)
    if (this.authConfig?.cloudflareEnabled && !this.turnstileToken) {
      console.error('Turnstile doğrulaması gerekli');
      return;
    }
    
    // Form validasyonu
    if (!this.form.valid) {
      return;
    }

    this.isLoading = true;

    // API Login Request
    const loginRequest: any = {
      identificationNumber: this.form.value.uname || '',
      password: this.form.value.password || '',
    };
    
    // Cloudflare enabled ise turnstile token'ı ekle
    if (this.authConfig.cloudflareEnabled) {
      loginRequest['cf-turnstile-response'] = this.turnstileToken;
    }

    this.authService
      .loginAdmin(loginRequest)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Login error:', error);
          
          // API'den gelen hata mesajını al
          let errorMessage = 'Giriş başarısız oldu. Kimlik numaranızı ve şifrenizi kontrol edip tekrar deneyin.';
          
          // API'den gelen mesajı kontrol et
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            // API mesajı yoksa, status koduna göre varsayılan mesaj
            if (error.status === 0) {
              // Status 0 = CORS hatası veya API'ye ulaşılamıyor
              errorMessage = 'API sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya sistem yöneticisi ile iletişime geçin.';
            } else if (error.status === 401) {
              errorMessage = 'Kimlik numarası veya şifre hatalı. Lütfen kontrol edin.';
            } else if (error.status === 403) {
              errorMessage = 'Erişim reddedildi. Lütfen yetkili kullanıcı ile giriş yapın.';
            } else if (error.status === 404) {
              errorMessage = 'API endpoint bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.';
            } else if (error.status >= 500) {
              errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
            }
          }
          
          // Kullanıcıya hata göster (console'da da yazdır)
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            apiMessage: error.error?.message,
            message: errorMessage
          });
          
          // Toastr ile kullanıcıya hata göster
          this.toastr.error(errorMessage, 'Hata');
          
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        if (response && response.success) {
          // Token'ı kaydet
          this.authService.saveToken(response.data.token);
          
          // Başarı mesajı göster
          this.toastr.success(response.message || 'Giriş başarılı!', 'Başarılı');
          
          // Anasayfaya yönlendir
          this.router.navigate(['/']);
        }
      });
  }
}
