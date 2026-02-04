import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { WebSocketService } from './services/websocket.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { WebSocketRestartDialogComponent } from './dialogs/websocket-restart-dialog/websocket-restart-dialog.component';
import { catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, LoadingSpinnerComponent],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'SpsDynamic';
  private reconnectFailedSub?: Subscription;

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private wsService: WebSocketService,
    private dialog: MatDialog,
    private http: HttpClient,
    private toastr: ToastrService,
    private ngZone: NgZone
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

    // WebSocket 5 denemede bağlanamazsa dialog göster (emit setInterval zincirinden geldiği için gecikmeli + zone)
    this.reconnectFailedSub = this.wsService.getReconnectFailed().subscribe(() => {
      window.setTimeout(() => {
        this.ngZone.run(() => this.openWebSocketRestartDialog());
      }, 150);
    });
  }

  ngOnDestroy(): void {
    this.reconnectFailedSub?.unsubscribe();
  }

  private openWebSocketRestartDialog(): void {
    const doRestart = (result: boolean) => {
      if (!result) return;
      const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
      this.http.get(`${apiUrl}/api/Websocket/Restart`).pipe(
        catchError(err => {
          this.toastr.error(err?.error?.message || err?.message || 'WebSocket yeniden başlatılamadı.', 'Hata');
          return of(null);
        })
      ).subscribe(res => {
        if (res != null) {
          this.toastr.success('WebSocket sunucusu yeniden başlatıldı.', 'Başarılı');
          this.wsService.reconnect();
        }
      });
    };

    const dialogRef = this.dialog.open(WebSocketRestartDialogComponent, {
      width: '400px',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'websocket-restart-dialog'
    });
    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      doRestart(result === true);
    });
  }

  private applyThemeColors(): void {
    const htmlElement = this.document.documentElement;
    // Theme seçimi artık environment.setting üzerinden yapılıyor
    const activeThemeName = environment.setting as keyof typeof environment.themes;
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
