import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from '../../strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/shared/mail.service';
import { GoogleStrategy } from 'src/strategy/google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  providers: [AuthService, UsersService, JwtStrategy, MailService, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}