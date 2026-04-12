import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  // Kiem tra xem role truyen len co dung chuan Enum khong
  @IsOptional()
  @IsEnum(Role, { message: 'Role khong hop le' })
  role?: Role;
}
