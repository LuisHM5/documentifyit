import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserRole } from '@documentifyit/shared';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly orgsService: OrganizationsService,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findAllByOrg(orgId: string): Promise<UserEntity[]> {
    return this.usersRepo.find({ where: { orgId } });
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const org = await this.orgsService.create(`${data.name}'s Workspace`);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      email: data.email,
      name: data.name,
      passwordHash,
      orgId: org.id,
      role: UserRole.Admin,
    });

    return this.usersRepo.save(user);
  }
}
