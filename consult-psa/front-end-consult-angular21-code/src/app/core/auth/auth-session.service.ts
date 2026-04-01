import { Injectable } from '@angular/core';

import { AuthUser } from './models/auth.models';

type StoredSession = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = 'app.auth.session';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  getSession(): StoredSession | null {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    try {
      const parsed = JSON.parse(serialized) as Partial<StoredSession>;
      if (!parsed.token || !parsed.user) return null;
      return { token: parsed.token, user: parsed.user };
    } catch {
      return null;
    }
  }

  saveSession(token: string, user: AuthUser): void {
    const serialized = JSON.stringify({ token, user } satisfies StoredSession);
    localStorage.setItem(STORAGE_KEY, serialized);
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }
}

