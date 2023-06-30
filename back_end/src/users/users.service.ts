import { Injectable } from '@nestjs/common';
import { RegisterUser } from './types/users.type';
import { users } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { Role } from './entities/role.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaSevice) {}

  async findAUserById(userId: number) {
    return await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async findAUserByEmail(email: string): Promise<users | null> {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async createUser(newUserData: RegisterUser): Promise<users> {
    const { fullName, email, passWord } = newUserData;

    const hashPass = await bcrypt.hash(passWord, 10);

    const newUserInfo = await this.prisma.users.create({
      data: {
        full_name: fullName,
        email,
        pass_word: hashPass,
        role: Role.User,
      },
    });

    const userDataReturn: users = {
      ...newUserInfo,
      pass_word: '',
      hash_refresh_token: '',
    };

    return userDataReturn;
  }
}
