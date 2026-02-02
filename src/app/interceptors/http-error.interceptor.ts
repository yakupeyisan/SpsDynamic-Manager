import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, map, of, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ClaimDetail, PendingClaimsService } from '../services/pending-claims.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const pendingClaimsService = inject(PendingClaimsService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // responseType: 'blob' kullanılan isteklerde (örn. Exports) hata gövdesi Blob gelir;
      // 403/401 işleyebilmek için Blob'u JSON'a çeviriyoruz
      const needsBlobParse =
        error.error instanceof Blob &&
        (error.status === 401 || error.status === 403);

      const body$ = needsBlobParse
        ? from((error.error as Blob).text()).pipe(
            map((text) => {
              try {
                return JSON.parse(text) as Record<string, unknown>;
              } catch {
                return {};
              }
            }),
            catchError(() => of({}))
          )
        : of(error.error);

      return body$.pipe(
        switchMap((body) => {
          const err =
            body !== error.error
              ? new HttpErrorResponse({
                  error: body,
                  headers: error.headers,
                  status: error.status,
                  statusText: error.statusText,
                  url: error.url ?? undefined,
                })
              : error;

          // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
          if (err.status === 401) {
            authService.removeToken();
            const currentUrl = router.url;
            if (!currentUrl.includes('/authentication/login')) {
              router.navigate(['/authentication/login']);
            }
          }

          // 403 Forbidden - yetki yok; required_claims varsa listeye ekle
          if (err.status === 403 && err.error) {
            const errObj = err.error as Record<string, unknown>;
            const data = errObj['data'] ?? err.error;
            const dataObj = data as Record<string, unknown>;
            const requiredClaims =
              (dataObj['required_claims'] ?? dataObj['requiredClaims']) as string[] | undefined;
            if (requiredClaims && Array.isArray(requiredClaims) && requiredClaims.length > 0) {
              const message =
                (errObj['message'] as string | undefined) ?? 'Bu işlem için yetkiniz bulunmuyor.';
              const claimDetails =
                (dataObj['required_claim_details'] ?? dataObj['requiredClaimDetails']) as
                  | ClaimDetail[]
                  | undefined;
              pendingClaimsService.addClaims(
                requiredClaims,
                message,
                claimDetails
              );
            }
          }

          return throwError(() => err);
        })
      );
    })
  );
};

