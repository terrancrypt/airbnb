import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { users } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayload } from 'src/auth/types';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ResponeAUser, ResponeUsers } from './types';
import { Response } from 'express';
import { SessionService } from 'src/auth/session/session.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaSevice,
    private firebase: FirebaseService,
    private sessionService: SessionService
  ) {}

  async postCreateUser(userData: CreateUserDto): Promise<ResponeAUser> {
    const isUser: users = await this.findUniqueUserByEmail(userData.email);
    if (isUser) throw new ConflictException('Email already exists!');

    const data: users = await this.createUserInDB(userData);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create success!',
      data,
    };
  }

  async getAllUser(): Promise<ResponeUsers> {
    try {
      const data: users[] = await this.prisma.users.findMany({});

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getUserPaginated(
    page: number,
    pageSize: number,
  ): Promise<ResponeUsers> {
    if (!page && page < 1) {
      throw new BadRequestException(
        'Invalid value for page. Page must be a positive integer.',
      );
    }

    if (!pageSize && pageSize < 1) {
      throw new BadRequestException(
        'Invalid value for pageSize. Page must be a positive integer.',
      );
    }

    const data: users[] = await this.findUsersPaginated(page, pageSize);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data,
    };
  }

  async getUserProfile(userId: number): Promise<ResponeAUser> {
    const user: users = await this.findUniqueUserById(userId);
    if (!user) throw new NotFoundException('User not found!');

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: {
        ...user,
        pass_word: null,
        role: null,
      },
    };
  }

  async getUserByName(fullName: string): Promise<ResponeUsers> {
    try {
      const data: users[] = await this.prisma.users.findMany({
        where: {
          full_name: { contains: fullName },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data,
      };
    } catch {
      throw new NotFoundException('User not found!');
    }
  }

  async putUpdateUser(
    user: JwtPayload,
    userId: number,
    dataUpdate: CreateUserDto,
  ): Promise<ResponeAUser> {
    if (user.role === Role.Admin || user.sub === userId) {
      const isUser: users = await this.findUniqueUserById(userId);
      if (!isUser) throw new NotFoundException('User not found.');

      const isUserEmail: users = await this.findUniqueUserByEmail(
        dataUpdate.email,
      );

      if (isUserEmail && isUserEmail.id !== userId) {
        throw new ConflictException('Email already exist!');
      }

      const data: users = await this.updateUser(userId, dataUpdate);

      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data,
      };
    } else {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }
  }

  async deleteUser(
    user: JwtPayload,
    userId: number,
    res: Response,
  ): Promise<void> {
    const isUser: users = await this.findUniqueUserById(userId);
    if (!isUser) throw new NotFoundException('User not found.');
    if (user.role === Role.Admin || user.sub === userId) {
      await this.deleteUserInDB(userId);

      if (user.sub === userId) {
        this.sessionService.deleteSession(user.sessionId);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken')
      }
    } else {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
  }

  async postUploadUserAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<ResponeAUser> {
    try {
      const urlImage: string = await this.firebase.FirebaseUpload(file);

      const data: users = await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          profile_img: urlImage,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data: {
          ...data,
          pass_word: null,
        },
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // =========== Database Methods ================
  async findUsersPaginated(page: number, pageSize: number): Promise<users[]> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      const data: users[] = await this.prisma.users.findMany({
        skip,
        take,
      });
      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUniqueUserById(userId: number): Promise<users> {
    try {
      const data: users = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });
      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUniqueUserByEmail(email: string): Promise<users> {
    try {
      const data: users = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });
      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createUserInDB(newUserData: CreateUserDto): Promise<users> {
    try {
      const hashPass: string = await bcrypt.hash(newUserData.passWord, 10);

      let role: Role = Role.User;

      if (newUserData.role && Object.values(Role).includes(newUserData.role)) {
        role = newUserData.role;
      }

      let birthday: Date | undefined = undefined;

      if (newUserData.birthday) {
        birthday = new Date(newUserData.birthday);
      }

      const newUserInfo: users = await this.prisma.users.create({
        data: {
          full_name: newUserData.fullName,
          email: newUserData.email.toLowerCase(),
          pass_word: hashPass,
          phone_number: newUserData.phoneNumber,
          birth_day: birthday,
          gender: newUserData.gender.toLowerCase(),
          role: role.toLowerCase(),
        },
      });

      const data: users = {
        ...newUserInfo,
        pass_word: null,
      };

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateUser(userId: number, dataUpdate: CreateUserDto): Promise<users> {
    try {
      const hashPass: string = await bcrypt.hash(dataUpdate.passWord, 10);

      let role: Role = Role.User;
      if (dataUpdate.role && Object.values(Role).includes(dataUpdate.role)) {
        role = dataUpdate.role;
      }

      let birthday: Date | undefined = undefined;

      if (dataUpdate.birthday) {
        birthday = new Date(dataUpdate.birthday);
      }

      const data: users = await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          full_name: dataUpdate.fullName,
          email: dataUpdate.email,
          pass_word: hashPass,
          phone_number: dataUpdate.phoneNumber,
          birth_day: birthday,
          gender: dataUpdate.gender,
          role,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleteUserInDB(userId: number): Promise<void> {
    try {
      await this.prisma.users.delete({
        where: {
          id: userId,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
