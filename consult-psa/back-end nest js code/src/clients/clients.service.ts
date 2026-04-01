import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async findAll(user: any): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { office: { id: user.officeId } }
    });
  }

  async findOne(id: string, user: any): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, office: { id: user.officeId } }
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }
}
