import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { ClientUser } from './entities/client-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientUser])],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
