import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'SpsDynamic';

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Set default language to Turkish
    this.translate.setDefaultLang('tr');
    this.translate.use('tr');
  }

  ngOnInit(): void {
    // Ensure Turkish is used as default
    this.translate.use('tr');
    
    // Apply theme colors from environment
    if (isPlatformBrowser(this.platformId)) {
      this.applyThemeColors();
    }
  }

  private applyThemeColors(): void {
    const htmlElement = this.document.documentElement;
    const activeThemeName = environment.theme as keyof typeof environment.themes;
    const theme = environment.themes[activeThemeName];
    
    if (!theme) {
      console.warn(`Theme '${activeThemeName}' not found in environment.themes`);
      return;
    }

    // Set CSS custom properties for theme colors
    if (theme.primary) {
      htmlElement.style.setProperty('--mat-sys-primary', theme.primary);
    }
    if (theme.primaryFixedDim) {
      htmlElement.style.setProperty('--mat-sys-primary-fixed-dim', theme.primaryFixedDim);
    }
    if (theme.secondary) {
      htmlElement.style.setProperty('--mat-sys-secondary', theme.secondary);
    }
    if (theme.secondaryFixedDim) {
      htmlElement.style.setProperty('--mat-sys-secondary-fixed-dim', theme.secondaryFixedDim);
    }
    if (theme.error) {
      htmlElement.style.setProperty('--mat-sys-error', theme.error);
    }
    if (theme.errorFixedDim) {
      htmlElement.style.setProperty('--mat-sys-error-fixed-dim', theme.errorFixedDim);
    }
    if (theme.warning) {
      htmlElement.style.setProperty('--mat-sys-warning', theme.warning);
    }
    if (theme.warningFixedDim) {
      htmlElement.style.setProperty('--mat-sys-warning-fixed-dim', theme.warningFixedDim);
    }
    if (theme.success) {
      htmlElement.style.setProperty('--mat-sys-success', theme.success);
    }
    if (theme.successFixedDim) {
      htmlElement.style.setProperty('--mat-sys-success-fixed-dim', theme.successFixedDim);
    }
    if (theme.tertiary) {
      htmlElement.style.setProperty('--mat-sys-tertiary', theme.tertiary);
    }
    if (theme.tertiaryFixedDim) {
      htmlElement.style.setProperty('--mat-sys-tertiary-fixed-dim', theme.tertiaryFixedDim);
    }
    if (theme.outlineVariant) {
      htmlElement.style.setProperty('--mat-sys-outline-variant', theme.outlineVariant);
    }
    if (theme.level1) {
      htmlElement.style.setProperty('--mat-sys-level1', theme.level1);
    }
    if (theme.level2) {
      htmlElement.style.setProperty('--mat-sys-level2', theme.level2);
    }
    if (theme.level3) {
      htmlElement.style.setProperty('--mat-sys-level3', theme.level3);
    }
    if (theme.level4) {
      htmlElement.style.setProperty('--mat-sys-level4', theme.level4);
    }

    // Also set custom properties for SCSS variables compatibility
    if (theme.warning) {
      htmlElement.style.setProperty('--warning-color', theme.warning);
    }
    if (theme.warningFixedDim) {
      htmlElement.style.setProperty('--warning-fixed-dim', theme.warningFixedDim);
    }
    if (theme.success) {
      htmlElement.style.setProperty('--success-color', theme.success);
    }
    if (theme.successFixedDim) {
      htmlElement.style.setProperty('--success-fixed-dim', theme.successFixedDim);
    }
  }
}
