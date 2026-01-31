import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PendingClaimsService } from '../services/pending-claims.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const pendingClaimsService = inject(PendingClaimsService);

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

      // 403 Forbidden - yetki yok; required_claims varsa listeye ekle
      if (error.status === 403 && error.error) {
        console.log('[httpErrorInterceptor] 403 error received:', error.error);
        const data = error.error.data ?? error.error;
        console.log('[httpErrorInterceptor] Extracted data:', data);
        const requiredClaims = data.required_claims ?? data.requiredClaims;
        console.log('[httpErrorInterceptor] requiredClaims:', requiredClaims);
        if (requiredClaims && Array.isArray(requiredClaims) && requiredClaims.length > 0) {
          const message = error.error.message ?? 'Bu işlem için yetkiniz bulunmuyor.';
          const claimDetails = data.required_claim_details ?? data.requiredClaimDetails;
          console.log('[httpErrorInterceptor] claimDetails:', claimDetails);
          pendingClaimsService.addClaims(requiredClaims, message, claimDetails);
        }
      }

      // Hatayı tekrar fırlat (component'lerin hata mesajlarını gösterebilmesi için)
      return throwError(() => error);
    })
  );
};

