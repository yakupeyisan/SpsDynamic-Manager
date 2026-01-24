import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Token kontrolü - hem varlığını hem de süresini kontrol et
    const token = this.authService.getToken();
    
    if (!token) {
      // Token yoksa environment ayarına göre yönlendir
      if (environment.settings[environment.setting as keyof typeof environment.settings].landingPage === 'login') {
        this.router.navigate(['/authentication/login']);
      } else {
        this.router.navigate([`/${environment.settings[environment.setting as keyof typeof environment.settings].landingPage}`]);
      }
      return false;
    }

    // Token süresi kontrolü
    if (this.authService.isTokenExpired(token)) {
      // Token süresi dolmuş, temizle ve login'e yönlendir
      this.authService.removeToken();
      this.router.navigate(['/authentication/login']);
      return false;
    }

    return true;
  }
}

