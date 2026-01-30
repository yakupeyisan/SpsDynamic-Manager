import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PageVisibilityResult {
  visibleRoutes: string[];
  isSupervisor: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PageVisibilityService {
  private readonly apiUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/auth/GetPageVisibility`;

  private readonly pageVisibility$ = new BehaviorSubject<PageVisibilityResult | null>(null);

  /** Son GetPageVisibility sonucu. Login veya layout init sonrası güncellenir. */
  readonly visibility$ = this.pageVisibility$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * GetPageVisibility API'sini çağırır, sonucu yayınlar ve döner.
   * Login sonrası ve sidebar/layout init'te kullanılır.
   */
  refresh(): Observable<PageVisibilityResult> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      map((response: any) => this.parseResponse(response)),
      catchError((error) => {
        console.error('Error loading page visibility:', error);
        return of({ visibleRoutes: [], isSupervisor: false });
      }),
      tap((result) => this.pageVisibility$.next(result))
    );
  }

  get current(): PageVisibilityResult | null {
    return this.pageVisibility$.value;
  }

  private parseResponse(response: any): PageVisibilityResult {
    let visibleRoutes: string[] = [];
    let isSupervisor = false;

    if (Array.isArray(response)) {
      visibleRoutes = response;
    } else if (response?.data) {
      isSupervisor = response.data.isSupervisor === true || response.data.IsSupervisor === true;
      if (Array.isArray(response.data.VisibleRoutes)) {
        visibleRoutes = response.data.VisibleRoutes;
      } else if (Array.isArray(response.data)) {
        visibleRoutes = response.data;
      } else if (Array.isArray(response.data?.visibleRoutes)) {
        visibleRoutes = response.data.visibleRoutes;
      }
    } else if (response?.records && Array.isArray(response.records)) {
      visibleRoutes = response.records;
    } else if (response?.visibleRoutes && Array.isArray(response.visibleRoutes)) {
      visibleRoutes = response.visibleRoutes;
    }

    return { visibleRoutes, isSupervisor };
  }
}
