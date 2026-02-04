import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../../vertical/sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { BrandingComponent } from '../../vertical/sidebar/branding.component';
import { AppSettings } from 'src/app/config';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { PendingClaimsService } from 'src/app/services/pending-claims.service';
import { RequestClaimsDialogComponent } from 'src/app/dialogs/request-claims-dialog/request-claims-dialog.component';
import { AlarmPopupService, AlarmPopupItem } from 'src/app/services/alarm-popup.service';
import { AlarmPopupDialogComponent } from 'src/app/dialogs/alarm-popup-dialog/alarm-popup-dialog.component';

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
  selector: 'app-horizontal-header',
  imports: [RouterModule, CommonModule, TablerIconsModule, MaterialModule, BrandingComponent],
  templateUrl: './header.component.html',
})
export class AppHorizontalHeaderComponent implements OnInit, OnDestroy {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  @Output() optionsChange = new EventEmitter<AppSettings>();

  // Pending claims
  pendingClaimsCount = 0;
  private pendingClaimsSub?: Subscription;

  // Alarm popup (WS isPopUp mesajları)
  alarmPopupList: AlarmPopupItem[] = [];
  private alarmPopupSub?: Subscription;

  public selectedLanguage: any = {
    language: 'Türkçe',
    code: 'tr',
    type: 'TR',
    icon: '/assets/images/flag/icon-flag-tr.svg',
  };

  public languages: any[] = [
    {
      language: 'Türkçe',
      code: 'tr',
      type: 'TR',
      icon: '/assets/images/flag/icon-flag-tr.svg',
    },
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];

  isDownloading: boolean = false;

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    public pendingClaimsService: PendingClaimsService,
    public alarmPopupService: AlarmPopupService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.pendingClaimsSub = this.pendingClaimsService.pendingClaims$.subscribe(() => {
      this.pendingClaimsCount = this.pendingClaimsService.count;
    });
    this.alarmPopupList = this.alarmPopupService.list;
    this.alarmPopupSub = this.alarmPopupService.list$.subscribe(list => {
      this.alarmPopupList = list;
    });
  }

  ngOnDestroy(): void {
    this.pendingClaimsSub?.unsubscribe();
    this.alarmPopupSub?.unsubscribe();
  }

  openAlarmPopupDialog(item: AlarmPopupItem): void {
    this.dialog.open(AlarmPopupDialogComponent, {
      width: '480px',
      data: item,
      disableClose: false
    });
  }

  clearAlarmPopups(): void {
    this.alarmPopupService.clear();
  }

  openPendingClaimsDialog(): void {
    const claimsWithDetails = this.pendingClaimsService.uniqueClaimsWithDetails;
    console.log('[HorizontalHeader] uniqueClaimsWithDetails:', JSON.stringify(claimsWithDetails));
    if (claimsWithDetails.length === 0) {
      console.warn('[HorizontalHeader] No claims to show!');
      return;
    }
    const dialogData = {
      message: 'Aşağıdaki yetkiler için talepte bulunabilirsiniz.',
      claims_with_details: claimsWithDetails
    };
    console.log('[HorizontalHeader] Opening dialog with data:', JSON.stringify(dialogData));
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

  openDialog() {
    const dialogRef = this.dialog.open(AppHorizontalSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  options = this.settings.getOptions();

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }

  setlightDark(theme: string) {
    this.options.theme = theme;
    this.emitOptions();
  }

  notifications: notifications[] = [
    {
      id: 1,
      icon: 'a-b-2',
      color: 'primary',
      time: '8:30 AM',
      title: 'Launch Admin',
      subtitle: 'Just see the my new admin!',
    },
    {
      id: 2,
      icon: 'calendar',
      color: 'secondary',
      time: '8:21 AM',
      title: 'Event today',
      subtitle: 'Just a reminder that you have event',
    },
    {
      id: 3,
      icon: 'settings',
      color: 'warning',
      time: '8:05 AM',
      title: 'Settings',
      subtitle: 'You can customize this template',
    },
    {
      id: 4,
      icon: 'a-b-2',
      color: 'success',
      time: '7:30 AM',
      title: 'Launch Templates',
      subtitle: 'Just see the my new admin!',
    },
    {
      id: 5,
      icon: 'exclamation-circle',
      color: 'error',
      time: '7:03 AM',
      title: 'Event tomorrow',
      subtitle: 'Just a reminder that you have event',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      title: 'My Profile',
      link: '/',
    },
    {
      id: 2,
      title: 'My Subscription',
      link: '/',
    },
    {
      id: 3,
      title: 'My Invoice',
      new: true,
      link: '/',
    },
    {
      id: 4,
      title: ' Account Settings',
      link: '/',
    },
    {
      id: 5,
      title: 'Sign Out',
      link: '/authentication/login',
    },
  ];

  apps: apps[] = [
    {
      id: 1,
      icon: 'solar:chat-line-line-duotone',
      color: 'primary',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      icon: 'solar:checklist-minimalistic-line-duotone',
      color: 'secondary',
      title: 'Todo App',
      subtitle: 'Completed task',
      link: '/',
    },
    {
      id: 3,
      icon: 'solar:bill-list-line-duotone',
      color: 'success',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      icon: 'solar:calendar-line-duotone',
      color: 'error',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      icon: 'solar:smartphone-2-line-duotone',
      color: 'warning',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      icon: 'solar:ticket-line-duotone',
      color: 'primary',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      icon: 'solar:letter-line-duotone',
      color: 'secondary',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      icon: 'solar:book-2-line-duotone',
      color: 'warning',
      title: 'Contact List',
      subtitle: 'Create new contact',
      link: '/',
    },
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
  selector: 'app-search-dialog',
  imports: [RouterModule, MaterialModule, TablerIconsModule, FormsModule],
  templateUrl: 'search-dialog.component.html',
})
export class AppHorizontalSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}
