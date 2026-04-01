import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { UserRole, INVITE_PERMISSIONS } from '../common/enums/role.enum';
import { InviteDto } from './dto/invite.dto';

interface JwtPayloadUser {
  userId: string;
  email: string;
  role: UserRole;
  officeId: string | null;
}

type SanitizedUser = Omit<
  User,
  'password_hash' | 'invitation_token' | 'invitation_expires_at'
>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): SanitizedUser {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password_hash,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      invitation_token,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      invitation_expires_at,
      ...safe
    } = user;
    return safe;
  }

  async validateUser(email: string, pass: string): Promise<SanitizedUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (isMatch) {
      return this.sanitizeUser(user);
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  login(user: SanitizedUser) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      officeId: user.office ? user.office.id : null,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async inviteUser(
    currentUser: JwtPayloadUser,
    dto: InviteDto,
    office: { id: string } | null = null,
  ) {
    const allowedToInvite = INVITE_PERMISSIONS[currentUser.role] ?? [];

    if (!allowedToInvite.includes(dto.role)) {
      throw new UnauthorizedException(
        'Insufficient permissions to invite this role',
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('A user with this email already exists.');
    }

    try {
      const user = await this.usersService.create({
        email: dto.email,
        name: dto.name,
        role: dto.role,
        office:
          office ??
          (currentUser.officeId ? { id: currentUser.officeId } : undefined),
        invitation_token: token,
        invitation_expires_at: expiresAt,
      });

      return {
        message: 'Invitation generated successfully',
        invitation_link: `http://localhost:5173/accept-invite?token=${token}`,
        user: { id: user.id, email: user.email },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate invite';
      throw new UnauthorizedException(message);
    }
  }

  async acceptInvite(token: string, password: string) {
    const user = await this.usersService.findByInvitationToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired invitation token');
    }

    if (user.invitation_expires_at && new Date() > user.invitation_expires_at) {
      throw new UnauthorizedException('Invitation has expired');
    }

    user.password_hash = await bcrypt.hash(password, 10);
    user.invitation_token = null;
    user.invitation_expires_at = null;
    user.is_active = true;

    await this.usersService.save(user);

    return { message: 'Password set successfully. You can now login.' };
  }
}
