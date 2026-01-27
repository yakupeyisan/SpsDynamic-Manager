import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { navItems } from './sidebar-data';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/nav.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppHorizontalNavItemComponent } from './nav-item/nav-item.component';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';
import { AuthService } from '../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-horizontal-sidebar',
  imports: [AppHorizontalNavItemComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent implements OnInit {
  navItems: NavItem[] = [];
  parentActive = '';
  private visibleRoutes: string[] = [];
  private hasLoadedVisibilitySettings: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  private filterVisibleItems(items: NavItem[], visibleRoutes: string[] = [], strictMode: boolean = false): NavItem[] {
    return items.filter(item => {
      // Always hide items explicitly marked as visible: false
      if (item.visible === false) return false;
      
      // If strict mode is enabled (visibility settings loaded) and no routes, hide everything
      if (strictMode && visibleRoutes.length === 0) {
        return false;
      }
      
      // If we have visible routes, filter based on them
      if (visibleRoutes.length > 0) {
        // If item has a route, check if it's in visible routes
        if (item.route) {
          // If route is not in visible routes, hide it
          if (!visibleRoutes.includes(item.route)) {
            return false;
          }
        }
        
        // If item has children, filter them recursively
        if (item.children) {
          item.children = this.filterVisibleItems(item.children, visibleRoutes, strictMode);
          // If all children are filtered out, hide parent if it has no route
          if (item.children.length === 0 && !item.route) {
            return false;
          }
        }
      } else if (strictMode) {
        // Strict mode but no routes - hide everything
        return false;
      } else {
        // No visible routes restriction, just filter by visible property
        if (item.children) {
          item.children = this.filterVisibleItems(item.children, visibleRoutes, strictMode);
        }
      }
      
      return true;
    });
  }

  constructor(
    public navService: NavService,
    public router: Router,
    media: MediaMatcher,
    changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.router.events.subscribe(
      () => (this.parentActive = this.router.url.split('/')[1])
    );
  }

  ngOnInit(): void {
    this.parentActive = this.router.url.split('/')[1];

    this.router.events.subscribe(() => {
      this.parentActive = this.router.url.split('/')[1];
    });

    // Load page visibility settings for current user
    this.loadPageVisibility();
  }

  // Load page visibility settings based on current user
  private loadPageVisibility(): void {
    // Load visible routes for current user (user can have multiple authorizations)
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/auth/GetPageVisibility`, {})
      .pipe(
        map((response: any) => {
          // Handle different response formats
          let visibleRoutes: string[] = [];
          let isSupervisor = false;
          
          if (Array.isArray(response)) {
            visibleRoutes = response;
          } else if (response && response.data) {
            // Check if user is supervisor
            isSupervisor = response.data.isSupervisor === true || response.data.IsSupervisor === true;
            
            // Handle format: { status: "success", data: { VisibleRoutes: [], isSupervisor: true } }
            if (Array.isArray(response.data.VisibleRoutes)) {
              visibleRoutes = response.data.VisibleRoutes;
            } else if (Array.isArray(response.data)) {
              visibleRoutes = response.data;
            } else if (response.data.visibleRoutes && Array.isArray(response.data.visibleRoutes)) {
              visibleRoutes = response.data.visibleRoutes;
            }
          } else if (response && Array.isArray(response.records)) {
            visibleRoutes = response.records;
          } else if (response && Array.isArray(response.visibleRoutes)) {
            visibleRoutes = response.visibleRoutes;
          }
          
          return { visibleRoutes, isSupervisor };
        }),
        catchError(error => {
          console.error('Error loading page visibility:', error);
          // If API fails, show all routes (no filtering)
          return of({ visibleRoutes: [], isSupervisor: false });
        })
      ).subscribe({
        next: (result: { visibleRoutes: string[], isSupervisor: boolean }) => {
          this.visibleRoutes = result.visibleRoutes;
          this.hasLoadedVisibilitySettings = true;
          
          // If user is supervisor, show all routes (no strict mode)
          // Otherwise, filter based on visible routes (strict mode)
          const strictMode = !result.isSupervisor;
          this.navItems = this.filterVisibleItems(navItems, result.visibleRoutes, strictMode);
        }
      });
  }
}
