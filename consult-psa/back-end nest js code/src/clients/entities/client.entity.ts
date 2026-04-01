import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Office } from '../../offices/entities/office.entity';
import { ClientUser } from './client-user.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Office, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @Column()
  company_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ClientUser, (clientUser: ClientUser) => clientUser.client)
  client_users: ClientUser[];
}
