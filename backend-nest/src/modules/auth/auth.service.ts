import { 
  Injectable, 
  UnauthorizedException, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from 'src/enum/role.enum';
import { MailService } from 'src/shared/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password, numberPhone } = registerDto;

    const existingUser = await this.usersService.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      numberPhone,
      role: Role.USER,
    });

    return { message: 'User registered successfully', user };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'role', 'email', 'numberPhone', 'username', 'password'], 
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...payload } = user;

    const token = this.jwtService.sign(payload);

    return { message: 'Login successful', access_token: token, payload };
  }


  async forgotPassword(email: string) {
    const user = await this.usersService.findOneBy({ email });
    if (!user) throw new NotFoundException('User not found');

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersService.saveResetToken(user.id, resetToken, expiry);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    await this.mailService.sendMail(
      email,
      'Reset Password',
      `<p>Click link để đặt lại mật khẩu:</p><a href="${resetLink}">${resetLink}</a>`
    );

    return { message: 'Reset password link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findOneBy({ id: decoded.sub });

      if (!user || user.resetToken !== token || user.resetTokenExpiration < new Date()) {
        throw new BadRequestException('Invalid or expired token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(user.id, hashedPassword);

      return { message: 'Password reset successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;

    let user = await this.usersService.findOneBy({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.usersService.create({
        username: profile.displayName || email.split('@')[0],
        email,
        password: hashedPassword,
        numberPhone: 0,
        role: Role.USER,
      });
    }

    const payload = { 
      id: user.id, 
      email: user.email, 
      name: user.username, 
      role: user.role 
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return { user, accessToken: token };
  }
}
