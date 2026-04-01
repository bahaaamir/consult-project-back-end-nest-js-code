import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthStore } from '../store/auth.store';

export const guestOnlyGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
