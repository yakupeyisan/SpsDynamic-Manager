import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

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

      // Hatayı tekrar fırlat (component'lerin hata mesajlarını gösterebilmesi için)
      return throwError(() => error);
    })
  );
};

