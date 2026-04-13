import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ADMIN: lay tat ca users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Lay profile cua chinh minh
  @Get('me')
  getMe() {
    return { message: 'API nay can CurrentUser tu module Auth de hoat dong' };
  }

  // Lay user theo id (ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // Cap nhat profile cua minh
  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto) {
    return {
      message: 'API nay can CurrentUser tu module Auth de hoat dong',
      data: dto,
    };
  }

  // ADMIN: cap nhat role
  @Put(':id/role')
  setRole(@Param('id', ParseUUIDPipe) id: string, @Body('role') role: Role) {
    return this.usersService.setRole(id, role);
  }

  // ADMIN: xoa user
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
