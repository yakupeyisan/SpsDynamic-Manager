import {
  Component,
  Output,
  EventEmitter,
  Input,
  signal,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/config';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, User } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { PendingClaimsService } from 'src/app/services/pending-claims.service';
import { RequestClaimsDialogComponent } from 'src/app/dialogs/request-claims-dialog/request-claims-dialog.component';
import { WebSocketService } from 'src/app/services/websocket.service';

interface notifications {
  id: number;
  icon: string;
  color: string;
  title: string;
  time: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  title: string;
  link: string;
  new?: boolean;
}

interface apps {
  id: number;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  isCollapse: boolean = false; // Initially hidden

  // User information from localStorage
  currentUser: User | null = null;
  userDisplayName: string = '';
  userEmail: string = '';
  userProfileImage: string = '/assets/images/profile/avaatar.png'; // Default profile image

  // Pending claims
  pendingClaimsCount = 0;
  private pendingClaimsSub?: Subscription;

  // WebSocket status (green = connected, red = disconnected)
  wsConnected = false;
  private wsStatusSub?: Subscription;

  toggleCollpase() {
    this.isCollapse = !this.isCollapse; // Toggle visibility
  }


  public selectedLanguage: any = {
    language: 'Türkçe',
    code: 'tr',
    icon: '/assets/images/flag/icon-flag-tr.svg',
  };

  public languages: any[] = [
    {
      language: 'Türkçe',
      code: 'tr',
      icon: '/assets/images/flag/icon-flag-tr.svg',
    },
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
  ];

  @Output() optionsChange = new EventEmitter<AppSettings>();

  isDownloading: boolean = false;

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    public pendingClaimsService: PendingClaimsService,
    private wsService: WebSocketService
  ) {
    translate.setDefaultLang('tr');
    // Set initial language based on current translate service
    const currentLang = translate.currentLang || translate.defaultLang || 'tr';
    const lang = this.languages.find(l => l.code === currentLang);
    if (lang) {
      this.selectedLanguage = lang;
    }
  }

  options = this.settings.getOptions();

  ngOnInit(): void {
    // Fetch user data from API
    this.loadUserDataFromApi();
    // Subscribe to pending claims
    this.pendingClaimsSub = this.pendingClaimsService.pendingClaims$.subscribe(() => {
      this.pendingClaimsCount = this.pendingClaimsService.count;
    });
    // WebSocket connection status
    this.wsConnected = this.wsService.isConnected();
    this.wsStatusSub = this.wsService.getConnectionStatus().subscribe(connected => {
      this.wsConnected = connected;
    });
  }

  ngOnDestroy(): void {
    this.pendingClaimsSub?.unsubscribe();
    this.wsStatusSub?.unsubscribe();
  }

  onWebSocketReconnect(): void {
    this.wsService.reconnect();
    this.toastr.info('WebSocket yeniden bağlanıyor...', 'Bağlantı');
  }

  openPendingClaimsDialog(): void {
    const claimsWithDetails = this.pendingClaimsService.uniqueClaimsWithDetails;
    console.log('[Header] uniqueClaimsWithDetails:', JSON.stringify(claimsWithDetails));
    console.log('[Header] pendingClaims raw:', JSON.stringify(this.pendingClaimsService.pendingClaims));
    if (claimsWithDetails.length === 0) {
      console.warn('[Header] No claims to show!');
      return;
    }
    const dialogData = {
      message: 'Aşağıdaki yetkiler için talepte bulunabilirsiniz.',
      claims_with_details: claimsWithDetails
    };
    console.log('[Header] Opening dialog with data:', JSON.stringify(dialogData));
    const dialogRef = this.dialog.open(RequestClaimsDialogComponent, {
      width: '560px',
      data: dialogData,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.pendingClaimsService.clear();
      }
    });
  }

  loadUserDataFromApi(): void {
    // Fetch fresh user data from API
    this.authService.getMe().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.currentUser = response.data;
          this.updateUserDisplay();
        }
      },
      error: (error) => {
        console.error('Error fetching user data from API:', error);
        // If API fails, userDisplayName and userEmail will remain empty
      }
    });
  }

  updateUserDisplay(): void {
    if (!this.currentUser) {
      return;
    }

    // Set display name (prefer Name+Surname, fallback to IdentificationNumber)
    const name = this.currentUser['Name'] || '';
    const surname = this.currentUser['SurName'] || '';
    const fullName = name && surname 
      ? `${name} ${surname}`.trim()
      : name || surname || '';
    
    this.userDisplayName = fullName || 
                          this.currentUser['IdentificationNumber'] || 
                          'User';

    // Set email (API'den Mail (büyük M) olarak geliyor)
    this.userEmail = this.currentUser['Mail'] || 
                    this.currentUser['email'] || 
                    this.currentUser['mail'] || 
                    '';

    // Set profile image (API'den PictureID geliyor, format: http://localhost/images/{PictureID})
    const pictureId = this.currentUser['PictureID'];
    if (pictureId) {
      this.userProfileImage = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/images/${pictureId}`;
    } else {
      this.userProfileImage = '/assets/images/profile/avaatar.png'; // Default image
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  setlightDark(theme: string) {
    this.options.theme = theme;
    this.emitOptions();
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }

  notifications: notifications[] = [
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      title: 'Profilim',
      link: '/profile',
    },
    {
      id: 2,
      title: 'Çıkış Yap',
      link: '/authentication/login',
    },
  ];

  logout(menuItem: profiledd): void {
    // Always clear token regardless of menuItem
    this.authService.removeToken();
    
    // Also clear token directly from localStorage as a safety measure
    localStorage.removeItem('token');
    
    // Clear current user data
    this.currentUser = null;
    this.userDisplayName = '';
    this.userEmail = '';
    this.userProfileImage = '/assets/images/profile/avaatar.png';
    
    // Navigate to login page
    this.router.navigate(['/authentication/login']);
  }

  apps: apps[] = [
  ];

  downloadGridSettings(): void {
    if (this.isDownloading) {
      return;
    }

    // Uyarı mesajı göster
    if (!confirm('Sunucudan ayarlar yüklenecektir. Özelleştirdiğiniz ayarlar kaybolacaktır. Emin misiniz?')) {
      return;
    }

    this.isDownloading = true;

    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/GridSettings/download`;
    
    this.http.get<{ settings?: { key: string; value: string }[]; error?: boolean; message?: string }>(url).pipe(
      catchError(error => {
        this.isDownloading = false;
        this.toastr.error('Sunucudan indirme başarısız oldu: ' + (error.error?.message || error.message || 'Bilinmeyen hata'), 'Hata');
        return of({ error: true, message: error.message });
      })
    ).subscribe((response: any) => {
      this.isDownloading = false;
      
      if (response.error === false || (response.settings && Array.isArray(response.settings))) {
        const settings = response.settings || [];
        
        // Önce tüm grid_ ile başlayan localStorage key'lerini sil
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('grid_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Sonra sunucudan indirilen ayarları localStorage'a kaydet
        settings.forEach((setting: { key: string; value: string }) => {
          if (setting.key && setting.key.startsWith('grid_')) {
            localStorage.setItem(setting.key, setting.value);
          }
        });

        this.toastr.success(`${settings.length} grid ayarı sunucudan başarıyla indirildi ve localStorage'a kaydedildi`, 'Başarılı');
        
        // Eğer GridSettings sayfasındaysak, sayfayı yenile
        if (this.router.url === '/GridSettings') {
          window.location.reload();
        }
      } else {
        this.toastr.error(response.message || 'Sunucudan indirme başarısız oldu', 'Hata');
      }
    });
  }
}

@Component({
  selector: 'search-dialog',
  imports: [
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    MatDividerModule,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}
