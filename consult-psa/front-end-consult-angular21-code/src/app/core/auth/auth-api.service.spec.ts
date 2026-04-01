import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthApiService } from './auth-api.service';

describe(AuthApiService.name, () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts login payload to /auth/login', () => {
    service.login({ email: 'owner@test.com', password: '12345678' }).subscribe();

    const request = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'owner@test.com', password: '12345678' });
    request.flush({ access_token: 'token', user: { id: 1, email: 'owner@test.com', name: 'Owner', role: 'OWNER' } });
  });

  it('posts owner registration payload to /auth/register-owner', () => {
    service
      .registerOwner({
        name: 'Owner',
        email: 'owner@test.com',
        password: '12345678',
        company_name: 'Acme',
      })
      .subscribe();

    const request = httpMock.expectOne('http://localhost:3000/auth/register-owner');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.company_name).toBe('Acme');
    request.flush({ message: 'ok', office: {}, user: { id: 1, email: 'owner@test.com', name: 'Owner', role: 'OWNER' } });
  });
});

