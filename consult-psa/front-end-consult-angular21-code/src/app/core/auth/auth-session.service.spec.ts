import { TestBed } from '@angular/core/testing';

import { AuthSessionService } from './auth-session.service';

describe(AuthSessionService.name, () => {
  let service: AuthSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionService);
    localStorage.clear();
  });

  it('saves and restores token and user', () => {
    service.saveSession('token-1', {
      id: 1,
      email: 'owner@test.com',
      name: 'Owner',
      role: 'OWNER',
    });

    const session = service.getSession();
    expect(session?.token).toBe('token-1');
    expect(session?.user.email).toBe('owner@test.com');
    expect(service.getToken()).toBe('token-1');
  });

  it('clears session', () => {
    service.saveSession('token-1', {
      id: 1,
      email: 'owner@test.com',
      name: 'Owner',
      role: 'OWNER',
    });
    service.clearSession();
    expect(service.getSession()).toBeNull();
    expect(service.getToken()).toBeNull();
  });
});

