import { Injectable, computed, signal } from '@angular/core';

import { AuthUser } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  setUser(user: AuthUser | null): void {
    this.currentUser.set(user);
  }

  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting.set(isSubmitting);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }

  clear(): void {
    this.currentUser.set(null);
    this.isSubmitting.set(false);
    this.error.set(null);
  }
}

