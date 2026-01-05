import { Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService, ChangePasswordRequest } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    TablerIconsModule
  ],
  template: `
    <h2 mat-dialog-title>Şifre Değiştir</h2>
    <mat-dialog-content class="change-password-dialog-content">
      <p class="m-b-24 text-muted">Şifrenizi değiştirmek için mevcut şifrenizi ve yeni şifrenizi girin</p>
      
      <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
        <!-- Eski Şifre -->
        <mat-label class="f-s-14 f-w-600 m-b-8 d-block">Mevcut Şifre</mat-label>
        <mat-form-field appearance="outline" class="w-100" color="primary">
          <input matInput type="password" formControlName="oldPassword" placeholder="Mevcut şifrenizi girin" />
          @if(passwordFormControls['oldPassword'].touched && passwordFormControls['oldPassword'].invalid) {
          <mat-hint class="m-b-16 error-msg">
            @if(passwordFormControls['oldPassword'].errors && passwordFormControls['oldPassword'].errors['required']) {
            <div class="text-error">Mevcut şifre gereklidir.</div>
            }
          </mat-hint>
          }
        </mat-form-field>
        
        <!-- Yeni Şifre -->
        <mat-label class="f-s-14 f-w-600 m-b-8 d-block m-t-16">Yeni Şifre</mat-label>
        <mat-form-field appearance="outline" class="w-100" color="primary">
          <input matInput type="password" formControlName="newPassword" placeholder="Yeni şifrenizi girin" />
          @if(passwordFormControls['newPassword'].touched && passwordFormControls['newPassword'].invalid) {
          <mat-hint class="m-b-16 error-msg">
            @if(passwordFormControls['newPassword'].errors && passwordFormControls['newPassword'].errors['required']) {
            <div class="text-error">Yeni şifre gereklidir.</div>
            } @else if(passwordFormControls['newPassword'].errors && passwordFormControls['newPassword'].errors['minlength']) {
            <div class="text-error">Şifre en az 6 karakter olmalıdır.</div>
            } @else if(passwordFormControls['newPassword'].errors && passwordFormControls['newPassword'].errors['sameAsOld']) {
            <div class="text-error">Yeni şifre eski şifre ile aynı olamaz.</div>
            }
          </mat-hint>
          }
        </mat-form-field>
        
        <!-- Şifre Tekrar -->
        <mat-label class="f-s-14 f-w-600 m-b-8 d-block m-t-16">Şifre Tekrar</mat-label>
        <mat-form-field appearance="outline" class="w-100" color="primary">
          <input matInput type="password" formControlName="confirmPassword" placeholder="Yeni şifrenizi tekrar girin" />
          @if(passwordFormControls['confirmPassword'].touched && passwordFormControls['confirmPassword'].invalid) {
          <mat-hint class="m-b-16 error-msg">
            @if(passwordFormControls['confirmPassword'].errors && passwordFormControls['confirmPassword'].errors['required']) {
            <div class="text-error">Şifre tekrar gereklidir.</div>
            } @else if(changePasswordForm.errors && changePasswordForm.errors['passwordMismatch']) {
            <div class="text-error">Şifreler eşleşmiyor.</div>
            }
          </mat-hint>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="isLoading">Vazgeç</button>
      <button 
        mat-flat-button 
        color="primary" 
        (click)="onSubmit()"
        [disabled]="!changePasswordForm.valid || isLoading">
        @if(isLoading) {
        <span class="d-flex align-items-center justify-content-center">
          <mat-progress-spinner diameter="20" mode="indeterminate" class="m-r-8"></mat-progress-spinner>
          Güncelleniyor...
        </span>
        } @else {
        Şifreyi Değiştir
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .change-password-dialog-content {
      padding: 24px;
      min-width: 400px;
    }

    .error-msg {
      margin-top: 4px;
    }

    .text-error {
      color: #f44336;
      font-size: 12px;
    }
  `]
})
export class ChangePasswordDialogComponent {
  isLoading: boolean = false;

  // Şifre eşleşme kontrolü
  passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    const oldPassword = form.get('oldPassword');
    
    // Yeni şifre ve şifre tekrar eşleşmeli
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    // Yeni şifre eski şifre ile aynı olamaz
    if (oldPassword && newPassword && oldPassword.value === newPassword.value && newPassword.value) {
      newPassword.setErrors({ sameAsOld: true });
      return { sameAsOld: true };
    }
    
    // Hataları temizle
    if (confirmPassword && newPassword && newPassword.value === confirmPassword.value) {
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
    
    if (newPassword && oldPassword && oldPassword.value !== newPassword.value) {
      const errors = newPassword.errors;
      if (errors) {
        delete errors['sameAsOld'];
        if (Object.keys(errors).length === 0) {
          newPassword.setErrors(null);
        } else {
          newPassword.setErrors(errors);
        }
      }
    }
    
    return null;
  };

  changePasswordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordMatchValidator });

  get passwordFormControls() {
    return this.changePasswordForm.controls;
  }

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    if (!this.changePasswordForm.valid) {
      // Form hatalarını göster
      if (this.changePasswordForm.errors && this.changePasswordForm.errors['passwordMismatch']) {
        this.toastr.error('Yeni şifre ve şifre tekrar eşleşmiyor.', 'Hata');
      } else if (this.changePasswordForm.errors && this.changePasswordForm.errors['sameAsOld']) {
        this.toastr.error('Yeni şifre eski şifre ile aynı olamaz.', 'Hata');
      } else {
        this.toastr.error('Lütfen tüm alanları doğru şekilde doldurun.', 'Hata');
      }
      return;
    }

    this.isLoading = true;
    const request: ChangePasswordRequest = {
      oldPassword: this.changePasswordForm.value.oldPassword || '',
      newPassword: this.changePasswordForm.value.newPassword || '',
      confirmPassword: this.changePasswordForm.value.confirmPassword || '',
    };

    this.authService
      .changePassword(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Change password error:', error);
          let errorMessage = 'Şifre değiştirilirken bir hata oluştu.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Eski şifre hatalı veya yeni şifre geçersiz.';
          } else if (error.status === 401) {
            errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
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
        if (response && response.success) {
          this.toastr.success(
            response.message || 'Şifreniz başarıyla değiştirildi.',
            'Başarılı'
          );
          this.dialogRef.close(true);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

