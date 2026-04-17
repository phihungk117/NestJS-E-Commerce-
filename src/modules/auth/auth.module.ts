import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Đảm bảo đường dẫn đúng
import { JwtStrategy } from './strategies/jwt.strategy'; // Nơi bạn đã tạo file này

@Module({
  imports: [
    UsersModule, // Cần import để dùng UsersService
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // <--- TRỌNG TÂM 1: Bỏ async ở đây
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // <--- TRỌNG TÂM 2: Ép kiểu string | number rõ ràng, bỏ as any
          expiresIn: (configService.get<string>('JWT_EXPIRATION_TIME') ||
            '1d') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
