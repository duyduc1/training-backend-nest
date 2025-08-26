import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Product With ID #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userUpdate = await this.usersRepository.preload({
      id: id,
      ...updateUserDto
    });
    if (!userUpdate) {
      throw new NotFoundException(`Product With ID #${id} not found`);
    }
    await this.usersRepository.save(updateUserDto);
    return { message: 'User was updated', userUpdate}
  }

  async remove(id: number) {
    const deletedUser = await this.findOne(id);
    await this.usersRepository.remove(deletedUser);
    return { message: 'User was deleted'};
  }

  async findByEmail(Email: string) {
    return this.usersRepository.findOne({ where: { Email } });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async saveResetToken(userId: number, token: string, expiry: Date) {
    await this.usersRepository.update(userId, {
      resetToken: token,
      resetTokenExpiration: expiry,
    });
  }

  async updatePassword(userId: number, newPassword: string) {
    await this.usersRepository.update(userId, {
      Password: newPassword,
      resetToken: null,
      resetTokenExpiration: null,
    });
  }
}
