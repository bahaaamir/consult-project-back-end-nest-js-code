import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthSessionService } from './auth-session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const token = authSession.getToken();
  if (!token) return next(request);

  const withAuth = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(withAuth);
};

