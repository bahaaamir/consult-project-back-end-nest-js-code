import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export { UserRole };

export class InviteDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail(
    {},
    { message: 'Please provide a valid email address for the invitee' },
  )
  @IsNotEmpty()
  email!: string;

  @IsEnum(UserRole, {
    message: 'Role must be super_admin, owner, manager, or employee',
  })
  @IsNotEmpty()
  role!: UserRole;

  @IsOptional()
  @IsString()
  company_name?: string;
}

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8, {
    message: 'Your new password must be at least 8 characters long',
  })
  password!: string;
}
