import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Kiểm tra email đã tồn tại chưa (Giả sử UsersService có hàm findByEmail)
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // 3. Tạo user mới (Gọi qua UsersService)
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // 4. Trả về thông tin user (có thể ẩn password đi trong UsersService)
    return newUser;
  }

  async login(loginDto: LoginDto) {
    // 1. Tìm user theo email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // 2. So sánh mật khẩu
    const isPasswordMatched = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // 3. Tạo Payload cho JWT (có thể thêm role vào payload nếu cần)
    const payload = { sub: user.id, email: user.email, role: user.role };

    // 4. Trả về Access Token
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
