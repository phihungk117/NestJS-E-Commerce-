//Dùng để lấy nhanh thông tin của người dùng đang đăng nhập (VD: Lấy ID của họ để lưu vào bài viết họ vừa tạo).
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
