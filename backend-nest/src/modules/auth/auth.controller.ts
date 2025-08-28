import { Body, Controller, Post, Query, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string, 
    @Body() resetPasswordDto: ResetPasswordDto, 
  ) {
    return this.authService.resetPassword(token, resetPasswordDto.newPassword);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {

  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    const token = req.user.accessToken;
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
}
