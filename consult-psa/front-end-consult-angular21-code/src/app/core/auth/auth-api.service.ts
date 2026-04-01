import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiCallerService } from '../../shared/services/api-caller.service';
import {
  LoginPayload,
  LoginResponse,
  RegisterOwnerPayload,
  RegisterOwnerResponse,
} from './models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiCaller = inject(ApiCallerService);

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.apiCaller.post<LoginResponse, LoginPayload>('/auth/login', payload);
  }

  registerOwner(payload: RegisterOwnerPayload): Observable<RegisterOwnerResponse> {
    return this.apiCaller.post<RegisterOwnerResponse, RegisterOwnerPayload>(
      '/auth/register-owner',
      payload,
    );
  }
}
