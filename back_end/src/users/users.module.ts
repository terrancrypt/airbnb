import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  providers: [UsersService,JwtService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
