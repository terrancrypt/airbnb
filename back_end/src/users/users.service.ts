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
import { DataRespone } from 'src/types';
import { JwtPayload } from 'src/auth/types';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaSevice,
    private firebase: FirebaseService,
  ) {}

  async postCreateUser(
    userData: CreateUserDto,
  ): Promise<DataRespone & { data: users }> {
    const isUser: users = await this.findUniqueUserByEmail(userData.email);
    if (isUser) throw new ConflictException('Email already exists!');

    const data: users = await this.createUserInDB(userData);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create success!',
      data,
    };
  }

  async getAllUser(): Promise<DataRespone & { data: users[] }> {
    try {
      const data = await this.prisma.users.findMany({});

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
  ): Promise<DataRespone & { data: users[] }> {
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

  async getUserProfile(userId: number): Promise<DataRespone & { data: users }> {
    const user: users = await this.findUniqueUserById(userId);
    if (!user) throw new NotFoundException('User not found!');

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: {
        ...user,
        pass_word: null,
        role: null,
        hash_refresh_token: null,
      },
    };
  }

  async getUserByName(
    fullName: string,
  ): Promise<DataRespone & { data: users[] }> {
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
      throw new InternalServerErrorException();
    }
  }

  async putUpdateUser(
    user: JwtPayload,
    userId: number,
    dataUpdate: CreateUserDto,
  ): Promise<DataRespone & { data: users }> {
    if (user.role === Role.Admin || user.sub === userId) {
      const isUser = await this.findUniqueUserById(userId);
      if (!isUser) throw new NotFoundException('User not found.');

      const isUserEmail = await this.findUniqueUserByEmail(dataUpdate.email);

      if (isUserEmail && isUserEmail.id !== userId) {
        throw new ConflictException('Email already exist!');
      }

      const data = await this.updateUser(userId, dataUpdate);

      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data,
      };
    } else {
      throw new ForbiddenException(
        'You do not have permission to delete this room.',
      );
    }
  }

  async deleteUser(user: JwtPayload, userId: number): Promise<DataRespone> {
    if (user.role === Role.Admin || user.sub === userId) {
      const isUser = await this.findUniqueUserById(userId);
      if (!isUser) throw new NotFoundException('User not found.');

      await this.deleteUserInDB(userId);

      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Success',
      };
    } else {
      throw new ForbiddenException(
        'You do not have permission to delete this room.',
      );
    }
  }

  async postUploadUserAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<DataRespone & { data: users }> {
    try {
      const urlImage = await this.firebase.FirebaseUpload(file);

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
          hash_refresh_token: null,
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
      // Kiểm tra nếu có giá trị trong newUserData và giá trị role trong newUserData nằm trong enum Role thì sử dụng giá trị đó
      if (newUserData.role && Object.values(Role).includes(newUserData.role)) {
        role = newUserData.role;
      }

      let birthday: Date | undefined = undefined;

      if (newUserData.birthday) {
        birthday = new Date(newUserData.birthday);
      }

      const newUserInfo = await this.prisma.users.create({
        data: {
          full_name: newUserData.fullName,
          email: newUserData.email,
          pass_word: hashPass,
          phone_number: newUserData.phoneNumber,
          birth_day: birthday,
          gender: newUserData.gender,
          role,
        },
      });

      const data: users = {
        ...newUserInfo,
        pass_word: '',
        hash_refresh_token: '',
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
