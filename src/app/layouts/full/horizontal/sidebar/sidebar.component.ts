import {
  Component,
  OnInit,
  OnDestroy,
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
import { PageVisibilityService } from '../../../../services/page-visibility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-horizontal-sidebar',
  imports: [AppHorizontalNavItemComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent implements OnInit, OnDestroy {
  navItems: NavItem[] = [];
  parentActive = '';
  private visibleRoutes: string[] = [];
  private hasLoadedVisibilitySettings: boolean = false;
  private visibilitySubscription?: Subscription;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  private cloneNavItems(items: NavItem[]): NavItem[] {
    return JSON.parse(JSON.stringify(items));
  }

  private getRouteOrder(item: NavItem, visibleRoutes: string[]): number {
    if (item.navCap || item.divider) {
      return -1; // navCap ve divider her zaman en üstte
    }
    if (item.route) {
      const idx = visibleRoutes.indexOf(item.route);
      return idx >= 0 ? idx : 9999;
    }
    if (item.children && item.children.length > 0) {
      const childOrders = item.children.map(c => this.getRouteOrder(c, visibleRoutes));
      return Math.min(...childOrders);
    }
    return 9999;
  }

  private filterVisibleItems(items: NavItem[], visibleRoutes: string[] = [], strictMode: boolean = false): NavItem[] {
    const filtered = items.filter(item => {
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

    // visibleRoutes sırasına göre sırala
    if (visibleRoutes.length > 0) {
      filtered.sort((a, b) => this.getRouteOrder(a, visibleRoutes) - this.getRouteOrder(b, visibleRoutes));
    }
    return filtered;
  }

  constructor(
    public navService: NavService,
    public router: Router,
    media: MediaMatcher,
    changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private pageVisibility: PageVisibilityService
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

    this.visibilitySubscription = this.pageVisibility.visibility$.subscribe((result) => {
      if (!result) return;
      this.visibleRoutes = result.visibleRoutes;
      this.hasLoadedVisibilitySettings = true;
      const strictMode = !result.isSupervisor;
      const source = this.cloneNavItems(navItems);
      this.navItems = this.filterVisibleItems(source, result.visibleRoutes, strictMode);
    });
    this.pageVisibility.refresh().subscribe();
  }

  ngOnDestroy(): void {
    this.visibilitySubscription?.unsubscribe();
  }
}
