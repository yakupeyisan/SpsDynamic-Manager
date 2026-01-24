import { Component, AfterViewInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService, ResetPasswordRequest, ConfirmResetPasswordRequest } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-side-forgot-password',
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './side-forgot-password.component.html',
})
export class AppSideForgotPasswordComponent implements AfterViewInit {
  options = this.settings.getOptions();
  readonly env = environment;
  readonly activeSettings = environment.settings[environment.setting as keyof typeof environment.settings];
  isLoading: boolean = false;
  isSuccess: boolean = false;
  step: number = 1; // 1: Kimlik numarası girme, 2: Kod ve şifre girme
  identificationNumber: string = '';

  // Adım 1: Kimlik numarası formu
  identificationForm = new FormGroup({
    identificationNumber: new FormControl('', [Validators.required]),
  });

  // Şifre eşleşme kontrolü
  passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    if (confirmPassword && password && password.value === confirmPassword.value) {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        } else {
          confirmPassword.setErrors(errors);
        }
      }
    }
    return null;
  };

  // Adım 2: Kod ve şifre formu
  resetForm = new FormGroup({
    verificationCode: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordMatchValidator });

  get f1() {
    return this.identificationForm.controls;
  }

  get f2() {
    return this.resetForm.controls;
  }

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit() {
    // Ordu Üniversitesi logo scriptini yükle
    // setTimeout ile bir sonraki tick'te çalıştır ki DOM tamamen hazır olsun
    setTimeout(() => {
      this.loadOrduImageScript();
    }, 0);
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
      console.log('Ordu image script yüklendi');
    };
    document.head.appendChild(orduImage);
  }

  // Adım 1: Kimlik numarası gönder
  submitIdentification() {
    if (!this.identificationForm.valid) {
      return;
    }

    this.isLoading = true;
    this.identificationNumber = this.identificationForm.value.identificationNumber || '';
    const request: ResetPasswordRequest = {
      identificationNumber: this.identificationNumber,
    };

    this.authService
      .resetPassword(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Reset password error:', error);
          let errorMessage = 'Tek kullanımlık kod gönderilirken bir hata oluştu.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Geçersiz kimlik numarası.';
          } else if (error.status === 404) {
            errorMessage = 'Kullanıcı bulunamadı.';
          } else if (error.status >= 500) {
            errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
          }

          this.toastr.error(errorMessage, 'Hata');
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        if (response) {
          if (response.success !== false && (response.status === 'success' || response.success === true || !response.status)) {
            this.toastr.success(
              response.message || 'Tek kullanımlık kod gönderildi. Lütfen kodunuzu kontrol edin.',
              'Başarılı'
            );
            // İkinci adıma geç
            this.step = 2;
          } else {
            this.toastr.error(
              response.message || 'Tek kullanımlık kod gönderilirken bir hata oluştu.',
              'Hata'
            );
          }
        }
      });
  }

  // Adım 2: Kod ve şifre ile şifreyi güncelle
  submitReset() {
    if (!this.resetForm.valid) {
      // Form hatalarını göster
      if (this.resetForm.errors && this.resetForm.errors['passwordMismatch']) {
        this.toastr.error('Şifreler eşleşmiyor.', 'Hata');
      }
      return;
    }

    this.isLoading = true;
    const request: ConfirmResetPasswordRequest = {
      identificationNumber: this.identificationNumber,
      verificationCode: this.resetForm.value.verificationCode || '',
      newPassword: this.resetForm.value.newPassword || '',
      confirmPassword: this.resetForm.value.confirmPassword || '',
    };

    this.authService
      .confirmResetPassword(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Confirm reset password error:', error);
          let errorMessage = 'Şifre güncellenirken bir hata oluştu.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Geçersiz kod veya şifre. Lütfen kontrol edin.';
          } else if (error.status === 404) {
            errorMessage = 'Kullanıcı bulunamadı.';
          } else if (error.status >= 500) {
            errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
          }

          this.toastr.error(errorMessage, 'Hata');
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        if (response) {
          if (response.success !== false && (response.status === 'success' || response.success === true || !response.status)) {
            this.toastr.success(
              response.message || 'Şifreniz başarıyla güncellendi.',
              'Başarılı'
            );
            this.isSuccess = true;
            // 3 saniye sonra login sayfasına yönlendir
            setTimeout(() => {
              this.router.navigate(['/authentication/login']);
            }, 3000);
          } else {
            this.toastr.error(
              response.message || 'Şifre güncellenirken bir hata oluştu.',
              'Hata'
            );
          }
        }
      });
  }

  // Geri dön (adım 1'e)
  goBack() {
    this.step = 1;
    this.resetForm.reset();
  }
}
