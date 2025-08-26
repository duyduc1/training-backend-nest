import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// "jwt" phải trùng với tên strategy mình đăng ký trong JwtStrategy
export class JwtAuthGuard extends AuthGuard('jwt') {}
