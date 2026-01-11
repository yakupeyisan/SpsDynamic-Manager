import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './auth.guard';
import { environment } from '../environments/environment';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        data: {
          title: 'Profilim',
          breadcrumb: false,
        },
      },
      {
        path: 'Employee',
        loadComponent: () =>
          import('./pages/employee/employee.component').then(
            (m) => m.EmployeeComponent
          ),
        data: {
          title: 'Kişiler',
          breadcrumb: false,
        },
      },
      {
        path: 'EmployeeWithLocation',
        loadComponent: () =>
          import('./pages/employee-with-location/employee-with-location.component').then(
            (m) => m.EmployeeWithLocationComponent
          ),
        data: {
          title: 'Kişi Konum Bilgileri',
          breadcrumb: false,
        },
      },
      {
        path: 'EmployeeTransferList',
        loadComponent: () =>
          import('./pages/employee-transfer-list/employee-transfer-list.component').then(
            (m) => m.EmployeeTransferListComponent
          ),
        data: {
          title: 'Aktarım Raporları',
          breadcrumb: false,
        },
      },
      {
        path: 'AccessEvents',
        loadComponent: () =>
          import('./pages/access-events/access-events.component').then(
            (m) => m.AccessEventsComponent
          ),
        data: {
          title: 'Geçiş Kayıtları',
          breadcrumb: false,
        },
      },
      {
        path: 'InputOutputReports',
        loadComponent: () =>
          import('./pages/input-output-reports/input-output-reports.component').then(
            (m) => m.InputOutputReportsComponent
          ),
        data: {
          title: 'İlk Giriş/Son Çıkış',
          breadcrumb: false,
        },
      },
      {
        path: 'Card',
        loadComponent: () =>
          import('./pages/card/card.component').then(
            (m) => m.CardComponent
          ),
        data: {
          title: 'Kartlar',
          breadcrumb: false,
        },
      },
      {
        path: 'PdksCompany',
        loadComponent: () =>
          import('./pages/pdks-company/pdks-company.component').then(
            (m) => m.PdksCompanyComponent
          ),
        data: {
          title: 'Firma Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'Department',
        loadComponent: () =>
          import('./pages/department/department.component').then(
            (m) => m.DepartmentComponent
          ),
        data: {
          title: 'Bölüm Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'PdksStaff',
        loadComponent: () =>
          import('./pages/pdks-staff/pdks-staff.component').then(
            (m) => m.PdksStaffComponent
          ),
        data: {
          title: 'Kadro Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'PdksPosition',
        loadComponent: () =>
          import('./pages/pdks-position/pdks-position.component').then(
            (m) => m.PdksPositionComponent
          ),
        data: {
          title: 'Görev Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'TimeZone',
        loadComponent: () =>
          import('./pages/timezone/timezone.component').then(
            (m) => m.TimezoneComponent
          ),
        data: {
          title: 'Zaman Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'AccessGroup',
        loadComponent: () =>
          import('./pages/access-group/access-group.component').then(
            (m) => m.AccessGroupComponent
          ),
        data: {
          title: 'Geçiş Yetki Grubu',
          breadcrumb: false,
        },
      },
      {
        path: 'AccessZones',
        loadComponent: () =>
          import('./pages/access-zones/access-zones.component').then(
            (m) => m.AccessZonesComponent
          ),
        data: {
          title: 'Bölge Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'CardTemplates',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/card-template/card-template.component').then(
                (m) => m.CardTemplateComponent
              ),
            data: {
              title: 'Kart Şablonları',
              breadcrumb: false,
            },
          },
          {
            path: 'editor/:id',
            loadComponent: () =>
              import('./pages/card-template/card-template-editor.component').then(
                (m) => m.CardTemplateEditorComponent
              ),
            data: {
              title: 'Kart Şablon Düzenle',
              breadcrumb: false,
            },
          },
          {
            path: 'editor',
            loadComponent: () =>
              import('./pages/card-template/card-template-editor.component').then(
                (m) => m.CardTemplateEditorComponent
              ),
            data: {
              title: 'Kart Şablon Oluştur',
              breadcrumb: false,
            },
          },
        ],
      },
      {
        path: 'CardWriteList',
        loadComponent: () =>
          import('./pages/card-write-list/card-write-list.component').then(
            (m) => m.CardWriteListComponent
          ),
        data: {
          title: 'Kart Baskı Listesi',
          breadcrumb: false,
        },
      },
      {
        path: 'SubscriptionPackages',
        loadComponent: () =>
          import('./pages/subscription-packages/subscription-packages.component').then(
            (m) => m.SubscriptionPackagesComponent
          ),
        data: {
          title: 'Paket Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaGroup',
        loadComponent: () =>
          import('./pages/cafeteria-group/cafeteria-group.component').then(
            (m) => m.CafeteriaGroupComponent
          ),
        data: {
          title: 'Kafeterya Grupları',
          breadcrumb: false,
        },
      },
      {
        path: 'TerminalTariffs',
        loadComponent: () =>
          import('./pages/terminal-tariffs/terminal-tariffs.component').then(
            (m) => m.TerminalTariffsComponent
          ),
        data: {
          title: 'Kafeterya Geçiş Tarifeleri',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaApplications',
        loadComponent: () =>
          import('./pages/cafeteria-applications/cafeteria-applications.component').then(
            (m) => m.CafeteriaApplicationsComponent
          ),
        data: {
          title: 'Zaman Dilimleri',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaPlaces',
        loadComponent: () =>
          import('./pages/cafeteria-places/cafeteria-places.component').then(
            (m) => m.CafeteriaPlacesComponent
          ),
        data: {
          title: 'Bölgeler',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaUnitType',
        loadComponent: () =>
          import('./pages/cafeteria-unit-type/cafeteria-unit-type.component').then(
            (m) => m.CafeteriaUnitTypeComponent
          ),
        data: {
          title: 'Birim Tipleri',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaProductType',
        loadComponent: () =>
          import('./pages/cafeteria-product-type/cafeteria-product-type.component').then(
            (m) => m.CafeteriaProductTypeComponent
          ),
        data: {
          title: 'Ürün Tipleri',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaProduct',
        loadComponent: () =>
          import('./pages/cafeteria-product/cafeteria-product.component').then(
            (m) => m.CafeteriaProductComponent
          ),
        data: {
          title: 'Ürünler',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaMenus',
        loadComponent: () =>
          import('./pages/cafeteria-menus/cafeteria-menus.component').then(
            (m) => m.CafeteriaMenusComponent
          ),
        data: {
          title: 'Yemek Menüleri',
          breadcrumb: false,
        },
      },
      {
        path: 'CafeteriaAccounts',
        loadComponent: () =>
          import('./pages/cafeteria-accounts/cafeteria-accounts.component').then(
            (m) => m.CafeteriaAccountsComponent
          ),
        data: {
          title: 'Kafeterya Hesapları',
          breadcrumb: false,
        },
      },
      {
        path: 'PaymentTypes',
        loadComponent: () =>
          import('./pages/payment-types/payment-types.component').then(
            (m) => m.PaymentTypesComponent
          ),
        data: {
          title: 'Ödeme Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'VisitorEvents',
        loadComponent: () =>
          import('./pages/visitor-events/visitor-events.component').then(
            (m) => m.VisitorEventsComponent
          ),
        data: {
          title: 'Ziyaret Defteri',
          breadcrumb: false,
        },
      },
      {
        path: 'Authorizations',
        loadComponent: () =>
          import('./pages/authorizations/authorizations.component').then(
            (m) => m.AuthorizationsComponent
          ),
        data: {
          title: 'Yetkiler',
          breadcrumb: false,
        },
      },
      {
        path: 'OperationClaims',
        loadComponent: () =>
          import('./pages/operation-claims/operation-claims.component').then(
            (m) => m.OperationClaimsComponent
          ),
        data: {
          title: 'İstek Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'LiveViewSettings',
        loadComponent: () =>
          import('./pages/live-view-settings/live-view-settings.component').then(
            (m) => m.LiveViewSettingsComponent
          ),
        data: {
          title: 'Canlı İzleme Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'SecureFields',
        loadComponent: () =>
          import('./pages/secure-fields/secure-fields.component').then(
            (m) => m.SecureFieldsComponent
          ),
        data: {
          title: 'Güvenli Girdi Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'SmsSettings',
        loadComponent: () =>
          import('./pages/sms-settings/sms-settings.component').then(
            (m) => m.SmsSettingsComponent
          ),
        data: {
          title: 'Sms Ayarları',
          breadcrumb: false,
        },
      },
      {
        path: 'MailSettings',
        loadComponent: () =>
          import('./pages/mail-settings/mail-settings.component').then(
            (m) => m.MailSettingsComponent
          ),
        data: {
          title: 'Mail Ayarları',
          breadcrumb: false,
        },
      },
      {
        path: 'SmsTransactions',
        loadComponent: () =>
          import('./pages/sms-transactions/sms-transactions.component').then(
            (m) => m.SmsTransactionsComponent
          ),
        data: {
          title: 'SMS Raporları',
          breadcrumb: false,
        },
      },
      {
        path: 'MailTransactions',
        loadComponent: () =>
          import('./pages/mail-transactions/mail-transactions.component').then(
            (m) => m.MailTransactionsComponent
          ),
        data: {
          title: 'E-Mail Raporları',
          breadcrumb: false,
        },
      },
      {
        path: 'Terminals',
        loadComponent: () =>
          import('./pages/terminals/terminals.component').then(
            (m) => m.TerminalsComponent
          ),
        data: {
          title: 'Terminaller',
          breadcrumb: false,
        },
      },
      {
        path: 'PayStations',
        loadComponent: () =>
          import('./pages/pay-stations/pay-stations.component').then(
            (m) => m.PayStationsComponent
          ),
        data: {
          title: 'Otomat Tanımları',
          breadcrumb: false,
        },
      },
      {
        path: 'HesSettings',
        loadComponent: () =>
          import('./pages/hes-settings/hes-settings.component').then(
            (m) => m.HesSettingsComponent
          ),
        data: {
          title: 'Hes Kontrol Ayarı',
          breadcrumb: false,
        },
      },
      {
        path: 'PosDevices',
        loadComponent: () =>
          import('./pages/pos-devices/pos-devices.component').then(
            (m) => m.PosDevicesComponent
          ),
        data: {
          title: 'Pos Teminalleri',
          breadcrumb: false,
        },
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: '',
        redirectTo: environment.landingPage === 'login' ? '/authentication/login' : `/${environment.landingPage}`,
        pathMatch: 'full',
      },
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: environment.landingPage === 'login' ? '/authentication/login' : `/${environment.landingPage}`,
  },
];
