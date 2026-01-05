import { HttpInterceptorFn } from '@angular/common/http';

export const httpHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  // Default headers - Content-Type: application/json
  let headers = req.headers.set('Content-Type', 'application/json');

  // Add Authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Clone request with new headers
  const clonedRequest = req.clone({
    headers: headers,
  });

  return next(clonedRequest);
};

