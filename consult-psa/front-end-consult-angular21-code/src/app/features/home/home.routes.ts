import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-index/dashboard-index.component').then((m) => m.DashboardIndexComponent)
  }
];

