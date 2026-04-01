import { Routes } from '@angular/router';
import { guestOnlyGuard } from '../../core/auth/guards/guest-only.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'signup',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./pages/signup-page/signup-page.component').then((m) => m.SignupPageComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
