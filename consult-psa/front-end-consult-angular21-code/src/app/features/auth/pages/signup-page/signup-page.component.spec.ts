import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { SignupPageComponent } from './signup-page.component';

describe(SignupPageComponent.name, () => {
  it('submits valid form through auth service', async () => {
    let called = false;
    const authServiceStub = {
      clearError: () => {},
      registerOwner: async () => {
        called = true;
        return true;
      },
    };
    const authStoreStub = {
      isSubmitting: signal(false),
      error: signal<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [SignupPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
        { provide: AuthStore, useValue: authStoreStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignupPageComponent);
    fixture.componentInstance.form.setValue({
      name: 'Owner',
      company_name: 'Acme',
      email: 'owner@test.com',
      password: '12345678',
    });
    await fixture.componentInstance.submit();

    expect(called).toBe(true);
  });
});
