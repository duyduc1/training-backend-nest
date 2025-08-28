import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }) {
    const { page = 1, limit = 10, search, role } = query;

    const qb = this.usersRepository.createQueryBuilder('user');

    if (search) {
      qb.andWhere('(user.username LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    qb.skip((page - 1) * limit).take(limit);

    qb.orderBy('user.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User With ID #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userUpdate = await this.usersRepository.preload({
      id: id,
      ...updateUserDto
    });
    if (!userUpdate) {
      throw new NotFoundException(`User With ID #${id} not found`);
    }
    return this.usersRepository.save(updateUserDto);
  }

  async remove(id: number) {
    const deletedUser = await this.findOne(id);
    return this.usersRepository.remove(deletedUser);
  }

  async softDeleteUser(id: number) {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return { message: 'User was soft deleted' };
  }

  async findOneBy(conditions: Partial<User>) {
    return await this.usersRepository.findOne({ where: conditions });
  }

  async saveResetToken(userId: number, token: string, expiry: Date) {
    await this.usersRepository.update(userId, {
      resetToken: token,
      resetTokenExpiration: expiry,
    });
  }

  async updatePassword(userId: number, newPassword: string) {
    await this.usersRepository.update(userId, {
      password: newPassword,
      resetToken: null,
      resetTokenExpiration: null,
    });
  }
}
