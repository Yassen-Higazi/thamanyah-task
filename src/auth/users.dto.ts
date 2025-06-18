import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { UserRole } from "src/shared/types/roles.type";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "The name of the user",
    example: "Yassen Higazi",
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user email",
    example: "yassenhigazi@gmail.com",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The user password", example: "12345678" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The user phone number",
    example: "0555555551",
    required: false,
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({
    type: "string",
    required: false,
    example: UserRole.USER.toString(),
    description: "The Role of the user",
  })
  role?: UserRole;
}
