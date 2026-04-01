export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CLIENT_OWNER = 'client_owner',
  CLIENT_EMPLOYEE = 'client_employee',
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface RegisterOwnerPayload {
  name: string;
  email: string;
  password: string;
  company_name: string;
}

export interface RegisterOwnerResponse {
  message: string;
  office: unknown;
  user: AuthUser;
}

