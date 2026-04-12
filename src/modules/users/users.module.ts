import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  // Dang ky User entity voi TypeOrmModule
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
