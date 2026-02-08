import { Injectable, signal } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavService {
  showClass: any = false;

  public currentUrl = signal<string | undefined>(undefined);
  /** Currently expanded top-level nav item key (displayName) - accordion: only one open */
  public expandedNavKey = signal<string | null>(null);

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }
}