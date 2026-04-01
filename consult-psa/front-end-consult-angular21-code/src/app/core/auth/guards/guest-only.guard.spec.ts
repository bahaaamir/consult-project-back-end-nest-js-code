import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AuthStore } from '../store/auth.store';
import { guestOnlyGuard } from './guest-only.guard';

describe('guestOnlyGuard', () => {
  it('allows guests', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: { isAuthenticated: signal(false) } }],
    });

    const result = TestBed.runInInjectionContext(() => guestOnlyGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirects authenticated users to home', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: { isAuthenticated: signal(true) } }],
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => guestOnlyGuard({} as never, {} as never));
    expect(router.serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/');
  });
});
