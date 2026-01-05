import {
  Component,
  Output,
  EventEmitter,
  Input,
  signal,
  ViewEncapsulation,
  OnInit,
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
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
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

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router
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
      this.userProfileImage = `${environment.apiUrl}/images/${pictureId}`;
    } else {
      this.userProfileImage = '/assets/images/profile/avaatar.png'; // Default image
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
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
