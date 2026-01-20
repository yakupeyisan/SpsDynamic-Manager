import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Global loading interceptor.
 * Shows the global loading overlay while HTTP requests are in-flight.
 *
 * Opt-out: send header 'X-Skip-Loading: true'
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const skipHeader = req.headers.get('X-Skip-Loading');
  const shouldSkip = skipHeader === 'true' || skipHeader === '1';

  if (!shouldSkip) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!shouldSkip) {
        loadingService.hide();
      }
    })
  );
};

