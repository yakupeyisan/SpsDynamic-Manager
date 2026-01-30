import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RequestClaimsDialogComponent } from '../dialogs/request-claims-dialog/request-claims-dialog.component';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
      if (error.status === 401) {
        // Token'ı temizle
        authService.removeToken();
        
        // Login sayfasına yönlendir (sadece zaten login sayfasında değilsek)
        const currentUrl = router.url;
        if (!currentUrl.includes('/authentication/login')) {
          router.navigate(['/authentication/login']);
        }
      }

      // 403 Forbidden - yetki yok; required_claims varsa "Yetki talep et" modalını aç
      if (error.status === 403 && error.error) {
        const data = error.error.data ?? error.error;
        const requiredClaims = data.required_claims ?? data.requiredClaims;
        if (requiredClaims && Array.isArray(requiredClaims) && requiredClaims.length > 0) {
          dialog.open(RequestClaimsDialogComponent, {
            data: {
              message: error.error.message ?? 'Bu işlem için yetkiniz bulunmuyor.',
              required_claims: requiredClaims,
              user_claims: data.user_claims ?? data.userClaims,
              authorization_options: data.authorization_options ?? data.authorizationOptions
            },
            width: '520px',
            disableClose: false
          });
        }
      }

      // Hatayı tekrar fırlat (component'lerin hata mesajlarını gösterebilmesi için)
      return throwError(() => error);
    })
  );
};

