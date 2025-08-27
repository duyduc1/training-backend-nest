import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../users/role.enum';
import { MailService } from 'src/shared/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { Username, Email, Password, NumberPhone } = registerDto;

    const existingUser = await this.usersService.findByEmail(Email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = await this.usersService.create({
      Username,
      Email,
      Password: hashedPassword,
      NumberPhone,
      Role: Role.USER, 
    });

    return { message: 'User registered successfully', user };
  }

  async login(loginDto: LoginDto) {
    const { Email, Password } = loginDto;
    const user = await this.usersService.findByEmail(Email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { 
      id: user.id, 
      role: user.Role, 
      email: user.Email,         
      numberphone: user.NumberPhone, 
      username: user.Username 
    };

    const token = this.jwtService.sign(payload);

    return { message: 'Login successfull' , access_token: token, payload };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersService.saveResetToken(user.id, resetToken, expiry);

    const resetLink = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;
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
      const user = await this.usersService.findById(decoded.sub);

      if (!user || user.resetToken !== token || user.resetTokenExpiration < new Date()) {
        throw new BadRequestException('Invalid or expired token');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(user.id, hashedPassword);

      return { message: 'Password reset successfully' };
    } catch (e) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      const ramdonPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(ramdonPassword, 10);
      
      user = await this.usersService.create({
          Username: profile.displayName || email.split('@')[0],
          Email: email,
          Password: hashedPassword,
          NumberPhone: 0,
          Role: Role.USER,
      });
    }

    const payload = { id: user.id, email: user.Email, name: user.Username, role: user.Role };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return { user, accessToken: token };
  }
}
