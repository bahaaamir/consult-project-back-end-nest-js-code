import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from './entities/office.entity';

@Injectable()
export class OfficesService {
  constructor(
    @InjectRepository(Office)
    private officesRepository: Repository<Office>,
  ) {}

  async create(officeData: Partial<Office>): Promise<Office> {
    const office = this.officesRepository.create(officeData);
    return this.officesRepository.save(office);
  }

  async findById(id: string): Promise<Office | null> {
    return this.officesRepository.findOne({ where: { id } });
  }
  
}
