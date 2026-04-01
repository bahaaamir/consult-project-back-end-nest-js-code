import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OfficesService } from '../offices/offices.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto, RegisterSuperAdminDto } from './dto/register.dto';
import { InviteDto, AcceptInviteDto } from './dto/invite.dto';
import { UserRole } from '../common/enums/role.enum';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    officeId: string | null;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly officesService: OfficesService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('register-super-admin')
  async registerSuperAdmin(@Body() body: RegisterSuperAdminDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.usersService.create({
      email: body.email,
      password_hash: hashedPassword,
      name: body.name,
      role: UserRole.SUPER_ADMIN,
    });
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      password_hash,
      invitation_token,
      invitation_expires_at,
      ...safeUser
    } = user;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return { message: 'Super admin created successfully!', user: safeUser };
  }

  @Post('register-owner')
  async registerOwner(@Body() body: RegisterOwnerDto) {
    const office = await this.officesService.create({
      name: body.company_name,
      slug: body.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      plan: 'starter',
    });

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.usersService.create({
      email: body.email,
      password_hash: hashedPassword,
      name: body.name,
      role: UserRole.OWNER,
      office: office,
    });

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      password_hash,
      invitation_token,
      invitation_expires_at,
      ...safeUser
    } = user;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return {
      message: 'Office and Owner registered successfully!',
      office,
      user: safeUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async invite(@Body() body: InviteDto, @Request() req: AuthenticatedRequest) {
    let office: { id: string } | null = null;

    if (body.role === UserRole.OWNER) {
      if (!body.company_name) {
        throw new UnauthorizedException(
          'company_name is required when inviting an owner',
        );
      }
      const created = await this.officesService.create({
        name: body.company_name,
        slug: body.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        plan: 'starter',
      });
      office = { id: created.id };
    }

    return this.authService.inviteUser(req.user, body, office);
  }

  @Post('accept-invite')
  async acceptInvite(@Body() body: AcceptInviteDto) {
    return this.authService.acceptInvite(body.token, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
