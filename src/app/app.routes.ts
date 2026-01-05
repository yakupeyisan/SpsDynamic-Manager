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
