import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { LoginPageComponent } from './login-page.component';

describe(LoginPageComponent.name, () => {
  it('submits valid form through auth service', async () => {
    let called = false;
    const authServiceStub = {
      clearError: () => {},
      login: async () => {
        called = true;
        return true;
      },
    };
    const authStoreStub = {
      isSubmitting: signal(false),
      error: signal<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
        { provide: AuthStore, useValue: authStoreStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.componentInstance.form.setValue({ email: 'owner@test.com', password: '12345678' });
    await fixture.componentInstance.submit();

    expect(called).toBe(true);
  });
});
