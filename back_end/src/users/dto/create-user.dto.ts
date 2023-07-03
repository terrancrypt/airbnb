import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Dezel',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'John123@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John@123',
  })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  passWord: string;

  @ApiProperty({
    example: '09090912312',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: '2000/09/12',
  })
  birthday?: string;

  @ApiProperty({
    example: 'Male',
  })
  gender?: string;

  @ApiProperty({ example: 'admin' })
  role: Role;
}
