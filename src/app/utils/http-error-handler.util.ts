import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface HttpErrorHandlerOptions {
  defaultMessage: string;
  showToast?: boolean;
  toastTitle?: string;
  fallbackValue?: any;
  customHandler?: (error: HttpErrorResponse) => void;
  silent?: boolean; // Hata mesajı göstermeden sessizce devam et
}

/**
 * HTTP hatalarını yönetmek için RxJS operator
 * @param toastr ToastrService instance
 * @param options Hata yönetim seçenekleri
 * @returns RxJS operator
 */
export function handleHttpError<T>(
  toastr: ToastrService,
  options: HttpErrorHandlerOptions
) {
  return catchError<T, Observable<T>>((error: HttpErrorResponse) => {
    // Custom handler varsa önce onu çalıştır
    if (options.customHandler) {
      options.customHandler(error);
    }

    // Sessiz mod aktifse sadece log ve fallback döndür
    if (options.silent) {
      console.error('HTTP Error (silent):', error);
      return of(options.fallbackValue ?? null);
    }

    // Hata mesajını belirle
    let errorMessage = options.defaultMessage;

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      // Status koduna göre varsayılan mesajlar
      switch (error.status) {
        case 0:
          errorMessage = 'API sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
          break;
        case 400:
          errorMessage = 'Geçersiz istek. Lütfen verilerinizi kontrol edin.';
          break;
        case 401:
          errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
          break;
        case 403:
          errorMessage = 'Erişim reddedildi. Lütfen yetkili kullanıcı ile giriş yapın.';
          break;
        case 404:
          errorMessage = 'İstenen kaynak bulunamadı.';
          break;
        case 500:
        default:
          if (error.status >= 500) {
            errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
          }
          break;
      }
    }

    // Console'a log
    console.error('HTTP Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: errorMessage,
      error: error.error
    });

    // Toastr ile kullanıcıya göster (eğer showToast true ise veya belirtilmemişse)
    if (options.showToast !== false) {
      toastr.error(errorMessage, options.toastTitle || 'Hata');
    }

    // Fallback değer döndür
    return of(options.fallbackValue ?? null);
  });
}

/**
 * HTTP hatalarını sessizce yönetmek için kısayol (toastr göstermez)
 */
export function handleHttpErrorSilent<T>(
  toastr: ToastrService,
  defaultMessage: string,
  fallbackValue?: any
) {
  return handleHttpError<T>(toastr, {
    defaultMessage,
    silent: true,
    fallbackValue
  });
}

