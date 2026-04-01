import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { AuthSessionService } from './auth-session.service';
import { LoginPayload, RegisterOwnerPayload } from './models/auth.models';
import { AuthStore } from './store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    const session = this.authSession.getSession();
    this.authStore.setUser(session?.user ?? null);
  }

  clearError(): void {
    this.authStore.setError(null);
  }

  async login(payload: LoginPayload): Promise<boolean> {
    this.authStore.setSubmitting(true);
    this.authStore.setError(null);
    try {
      const response = await firstValueFrom(this.authApi.login(payload));
      this.authSession.saveSession(response.access_token, response.user);
      this.authStore.setUser(response.user);
      await this.router.navigateByUrl('/');
      return true;
    } catch (error) {
      this.authStore.setError(mapAuthError(error));
      return false;
    } finally {
      this.authStore.setSubmitting(false);
    }
  }

  async registerOwner(payload: RegisterOwnerPayload): Promise<boolean> {
    this.authStore.setSubmitting(true);
    this.authStore.setError(null);
    try {
      await firstValueFrom(this.authApi.registerOwner(payload));
      return this.login({ email: payload.email, password: payload.password });
    } catch (error) {
      this.authStore.setError(mapAuthError(error));
      this.authStore.setSubmitting(false);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.authSession.clearSession();
    this.authStore.clear();
    await this.router.navigateByUrl('/auth/login');
  }
}

function mapAuthError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }

  if (error.status === 0) return 'Cannot connect to server. Please check your API.';
  if (error.status === 401) return 'Invalid email or password.';

  const body = error.error as { message?: string | string[] } | undefined;
  const message = body?.message;
  if (Array.isArray(message) && message.length > 0) return message[0];
  if (typeof message === 'string' && message.length > 0) return message;

  return 'Request failed. Please try again.';
}

