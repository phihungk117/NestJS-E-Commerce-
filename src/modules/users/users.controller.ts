import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard) 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }



  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }


  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  setRole(@Param('id', ParseUUIDPipe) id: string, @Body('role') role: Role) {
    return this.usersService.setRole(id, role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
