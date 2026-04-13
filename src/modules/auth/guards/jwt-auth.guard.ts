//gác kiểm tra xem người dùng đã đăng nhập (có token chưa)
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}