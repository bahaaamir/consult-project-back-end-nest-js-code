import { Routes } from '@angular/router';

export const UI_KIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ui-kit-page/ui-kit-page.component').then((m) => m.UiKitPageComponent)
  }
];

