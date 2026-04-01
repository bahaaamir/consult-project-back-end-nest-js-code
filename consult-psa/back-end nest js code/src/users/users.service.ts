import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Used by Login/Auth system where the user is NOT yet authenticated.
  // We don't filter by user here because it doesn't exist yet!
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: ['office'] });
  }

  async create(userData: DeepPartial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  // Used by the application when an authenticated user requests a user profile
  async findById(id: string, currentUser?: any): Promise<User> {
    const whereClause: any = { id };
    
    // If a current user is provided (e.g., from an authenticated controller route),
    // we MUST ensure they only find users within their own office.
    if (currentUser?.officeId) {
       whereClause.office = { id: currentUser.officeId };
    }

    const user = await this.usersRepository.findOne({ where: whereClause, relations: ['office'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByInvitationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { invitation_token: token } });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
