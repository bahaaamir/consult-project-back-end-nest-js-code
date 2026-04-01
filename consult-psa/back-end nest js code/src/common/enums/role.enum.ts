export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum ClientRole {
  CLIENT_OWNER = 'client_owner',
  CLIENT_EMPLOYEE = 'client_employee',
}

/**
 * Defines which roles each role is allowed to invite.
 * Single source of truth for invite permission logic.
 */
export const INVITE_PERMISSIONS: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE],
  [UserRole.OWNER]: [UserRole.MANAGER, UserRole.EMPLOYEE],
  [UserRole.MANAGER]: [UserRole.EMPLOYEE],
  [UserRole.EMPLOYEE]: [],
};
