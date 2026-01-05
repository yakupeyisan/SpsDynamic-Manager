import { Routes } from '@angular/router';

import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideForgotPasswordComponent } from './side-forgot-password/side-forgot-password.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: AppSideLoginComponent,
      },
      {
        path: 'forgot-password',
        component: AppSideForgotPasswordComponent,
      },
    ],
  },
];
