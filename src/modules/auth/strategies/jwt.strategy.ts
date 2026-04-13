//File này hoạt động ngầm mỗi khi có một request yêu cầu bảo mật gửi tới. Nó sẽ lấy Token, giải mã ra ID của user, sau đó kiểm tra xem user này có tồn tại trong Database không.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //lấy token từ header Authorization với định dạng Bearer <token>
      ignoreExpiration: false, //không bỏ qua việc kiểm tra thời gian hết hạn của token
      secretOrKey: configService.get<string>('JWT_SECRET') as string, //Lấy key bí mật từ .env
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // payload.sub chính là ID của user được cất trong token
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
